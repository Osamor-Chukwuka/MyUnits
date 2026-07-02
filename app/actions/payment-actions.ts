'use server'

import { MeterTotalFees } from "@/types/meter-types";
import { getCurrentUser } from "./auth-actions";
import { RechargeConfirmationTarget } from "@/components/recharge-modal/recharge-confirmation-modal";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
    generateVtPassRequestId,
    getVtPassRechargeResult,
    VtPassRechargeResponse,
    VtPassRechargeResult,
} from "@/lib/helpers/vtpass-recharge-helper";

type VerifyPaystackPaymentResult = {
    status: string;
    message: string;
    amount_sent_to_paystack: number;
    paystack_total_charged_amount: number;
    paystack_fees: number;
    data: unknown;
}

type SaveTransactionToDBRequest = {
    reference: string;
    rechargeTarget: RechargeConfirmationTarget | null;
    meterTotalFees: MeterTotalFees | null;
    paymentStatus: string;
}

type SaveRechargeToDBRequest = {
    transactionId: string | null;
    rechargeTarget: RechargeConfirmationTarget | null;
    rechargeResult: VtPassRechargeResult;
    amount: number;
}

//get env variables
const vtPassBaseUrl = process.env.VTPASS_BASE_URL || '';
const vtPassApiKey = process.env.VTPASS_API_KEY || '';
const vtPassSecretKey = process.env.VTPASS_SECRET_KEY || '';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

//initialize paystack
export async function initializePaystack(amount: number): Promise<{ access_code: string | null; reference: string | null }> {
    if (!amount || amount <= 0) {
        throw new Error('Invalid amount for payment');
    }

    if (!PAYSTACK_SECRET_KEY) {
        throw new Error('Could not proceed with payment. Please try again');
    }

    //get logged in user email
    const user = await getCurrentUser();
    const email = user?.email;

    if (!email) {
        throw new Error('User email not found. Please log in again.');
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
        body: JSON.stringify({
            email: email,
            amount: amount * 100, // Paystack expects amount in kobo
        }),
    })

    if (!response.ok) {
        console.error('Failed to initialize payment:', response);
        throw new Error('Failed to initialize payment');
    }

    const result = await response.json();

    if (!result.status) {
        console.error('Paystack initialization error:', result);
        throw new Error(result.message || 'Failed to initialize payment');
    }

    console.log('Paystack initialization response:', result);

    return {
        access_code: result.data.access_code || null,
        reference: result.data.reference || null
    }
}



//verify paystack payment
export async function verifyPaystackPayment(reference: string): Promise<VerifyPaystackPaymentResult> {
    if (!reference) {
        throw new Error('Payment reference is required for verification');
    }

    if (!PAYSTACK_SECRET_KEY) {
        throw new Error('Could not proceed with payment. Please try again');
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        }
    })

    if (!response.ok) {
        console.error('Failed to verify payment:', response);
        throw new Error('Failed to verify payment');
    }

    const result = await response.json();

    return {
        status: result.data.status,
        message: result.data.gateway_response,
        amount_sent_to_paystack: result.data.requested_amount * 0.01, // the amount that was requested for payment, converted from kobo to naira
        paystack_total_charged_amount: result.data.amount * 0.01, // the total amount that was charged, converted from kobo to naira. This may be different from requested_amount if paystack fees were charged to the customer
        paystack_fees: result.data.fees * 0.01, // Convert from kobo to naira,
        data: result.data
    };
}


//Recharge Meter with VTpass
export async function rechargeMeterWithVtPass(disco: string, meterNumber: string, type: string, amount: number, phoneNumber: string) {
    const requestId = generateVtPassRequestId();

    const result = await fetch(`${vtPassBaseUrl}/pay`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'api-key': vtPassApiKey,
            'secret-key': vtPassSecretKey,
        },
        body: JSON.stringify({
            request_id: requestId,
            serviceID: disco,
            billersCode: meterNumber,
            variation_code: type,
            amount: amount,
            phone: phoneNumber,
        })
    })

    if (!result.ok) {
        throw new Error('Failed to recharge meter');
    }

    const data = await result.json();

    console.log("recharge meter data", data)

    return verifyVtPassTransaction(requestId);
}

export async function verifyVtPassTransaction(requestId: string): Promise<VtPassRechargeResult> {
    const maxRequeryAttempts = 3;
    const requeryDelay = 1000; // 1 second

    for (let attempt = 0; attempt <= maxRequeryAttempts; attempt++) {
        const result = await fetch(`${vtPassBaseUrl}/requery`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'api-key': vtPassApiKey,
                'secret-key': vtPassSecretKey,
            },
            body: JSON.stringify({
                request_id: requestId,
            })
        })

        if (!result.ok) {
            throw new Error('Failed to verify VTpass transaction status');
        }

        const data = await result.json() as VtPassRechargeResponse;
        const rechargeResult = await getVtPassRechargeResult(data, requestId);

        if (rechargeResult.status !== 'requery_required') {
            return rechargeResult;
        }

        if (attempt === maxRequeryAttempts) {
            return rechargeResult;
        }

        await new Promise((resolve) => setTimeout(resolve, requeryDelay));
    }

    throw new Error('Failed to verify VTpass transaction status');
}


//save transaction to DB
export async function saveTransactionToDB({ reference, rechargeTarget, meterTotalFees, paymentStatus }: SaveTransactionToDBRequest) {
    const supabase = await supabaseServer();

    // get logged in user
    const user = await getCurrentUser();
    const userId = user?.id;

    if (!userId) {
        // we can throw error here, because how are you not logged in?😂
        throw new Error('User not authenticated');
    }


    // // we only want to save meterNumber if meterid is not available (i.e the meter is not in our database and it's from the manual flow)
    // const meterNumber = rechargeTarget?.id ? null : rechargeTarget?.meterNumber;

    // cleanup meter id
    const meterId = rechargeTarget?.id ?? null;

    // Insert transaction into the database
    const { data, error } = await supabase.from('transactions').insert({
        meter_id: meterId,
        meter_number: rechargeTarget?.meterNumber,
        paystack_reference: reference,
        user_id: userId,
        user_amount: meterTotalFees?.amount,
        total_amount: meterTotalFees?.totalAmount,
        paystack_status: paymentStatus,
        total_charges: meterTotalFees?.totalCharges,
        paystack_charge: meterTotalFees?.paystackFee,
        total_commission: meterTotalFees?.totalCommission,
        vtpass_commission: meterTotalFees?.vtpassCommission,
    }).select('id').single();

    if (error) {
        console.error('Error saving transaction to DB:', error);

        // we should not throw an error here because we don't want to block the user from proceeding with the recharge if the transaction save fails. Instead, we can log the error..
        // throw error;
    }

    const transactionId = data?.id;
    return transactionId;

}


//update VTpass transaction status in DB
export async function updateTransactionStatus(transactionId: string | null, vtPassStatus: string, vtPassRequestId: string | null = null) {
    try {
        if (!transactionId) {
            console.error('Transaction ID is required to update VTpass status');
            return;
        }

        //we should use the supabase Admin client here, for Security(we don't have a update policy in the DB), so that a user cannot maliciously update their transaction record. They can only select/insert.
        const supabase = supabaseAdmin();

        const { error } = await supabase.from('transactions').update({
            vtpass_status: vtPassStatus,
            vtpass_request_id: vtPassRequestId
        }).eq('id', transactionId);

        if (error) {
            console.error('Error updating VTpass status:', error);

            //no need to throw error here, we can just log it and move on. We don't want to block the user from proceeding if the transaction update fails.
        }

        return 'success';
    } catch (error) {
        console.error('Error updating transaction status in DB:', error);
        // we should not throw an error here because we don't want to block the user from proceeding with the recharge if the transaction update fails. Instead, we can log the error..
    }
}



export async function saveRechargeToDB({ transactionId, rechargeTarget, rechargeResult, amount }: SaveRechargeToDBRequest) {
    if (rechargeResult.status !== 'success') {
        return;
    }

    const meterId = rechargeTarget?.id ?? null;
    const meterNumber = rechargeTarget?.meterNumber?.trim() || null;
    const token = rechargeResult.token?.trim() || null;
    const units = rechargeResult.units?.trim() || null;

    if (!meterNumber || !token || !units) {
        console.error('Skipping recharge save because required recharge fields are missing.', {
            meterId,
            hasMeterNumber: Boolean(meterNumber),
            hasToken: Boolean(token),
            hasUnits: Boolean(units),
            transactionId,
        });
        return;
    }

    const supabase = await supabaseServer();
    const user = await getCurrentUser();
    const userId = user?.id;

    if (!userId) {
        console.error('Skipping recharge save because the user is not authenticated.');
        return;
    }

    const rechargeAmount = Number(amount);
    if (Number.isNaN(rechargeAmount)) {
        console.error('Skipping recharge save because the recharge amount is invalid.', {
            amount,
            transactionId,
        });
        return;
    }

    const maxAttempts = 3;
    const retryDelay = 500;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const { error } = await supabase.from('recharges').insert({
            user_id: userId,
            amount: rechargeAmount,
            units,
            token,
            meter_id: meterId,
            meter_number: meterNumber,
            transaction_id: transactionId,
        });

        if (!error) {
            return;
        }

        console.error(`Failed to save recharge to DB on attempt ${attempt}.`, error);

        if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
    }
}
