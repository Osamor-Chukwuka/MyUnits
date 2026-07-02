import { MeterTotalFees, RechargeMeterCommission } from "@/types/meter-types";

export const calculateTotalAmount = (amount: number, meterCommission: RechargeMeterCommission | null): MeterTotalFees => {
    //check if paystack charged the bussiness or the customer. If it is the customer, remove paystack fee from total amount
    const chargePaystackToCustomer = process.env.PAYSTACK_CHARGE_USER === 'true';

    //1. Get paystack fee
    let fee = 0.015 * amount;
    if (amount > 2500) {
        fee += 100;
    }
    const paystackFee = chargePaystackToCustomer ? 0 : Math.min(fee, 2000);


    //2. Get VTpass commission
    let vtpassCommission = 0;

    //check if meterCommission has a valid amount, if not use the rate
    if (meterCommission?.amount != null) {
        vtpassCommission = typeof meterCommission.amount === 'string' ? parseFloat(meterCommission.amount) : meterCommission.amount;
    }
    else if (meterCommission?.rate) {
        let rate = parseFloat(meterCommission.rate);
        if (meterCommission.rate_type === 'percent') {
            vtpassCommission = (rate / 100) * amount;
        }
    }


    //3. Calculate total amount and total charges
    const totalAmount = (amount + paystackFee);
    const totalCharges = paystackFee; //only paystack fee for now
    const totalCommission = vtpassCommission; // only vtpass commission for now

    return {
        totalAmount,
        totalCharges,
        totalCommission,
        amount,
        paystackFee,
        vtpassCommission,
    }
}