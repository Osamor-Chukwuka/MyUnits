'use server';

import { RechargeConfirmationTarget } from '@/components/recharge-modal/recharge-confirmation-modal';
import { getCurrentUser } from './auth-actions';
import { saveRechargeToDB, updateTransactionStatus, verifyVtPassTransaction } from './payment-actions';
import { supabaseServer } from '@/lib/supabase/server';
import {
  RechargeHistoryDetail,
  TransactionHistoryDetail,
  TransactionHistoryItem,
} from '@/types/history-types';

type RecheckTransactionResult = {
  ok: boolean;
  status: string;
  message: string;
};

async function getAuthenticatedUserId() {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error('User not authenticated');
  }

  return user.id;
}

export async function getTransactionHistory(): Promise<TransactionHistoryItem[]> {
  const userId = await getAuthenticatedUserId();
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from('transactions')
    .select('*, meter:meters(name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as TransactionHistoryItem[];
}

export async function getTransactionHistoryDetail(transactionId: string): Promise<TransactionHistoryDetail | null> {
  const userId = await getAuthenticatedUserId();
  const supabase = await supabaseServer();

  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (transactionError) {
    throw new Error(transactionError.message);
  }

  if (!transaction) {
    return null;
  }

  const [meterResult, rechargeResult] = await Promise.all([
    transaction.meter_id
      ? supabase
          .from('meters')
          .select('*')
          .eq('id', transaction.meter_id)
          .eq('user_id', userId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from('recharges')
      .select('*')
      .eq('transaction_id', transaction.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (meterResult.error) {
    throw new Error(meterResult.error.message);
  }

  if (rechargeResult.error) {
    throw new Error(rechargeResult.error.message);
  }

  return {
    transaction: transaction as TransactionHistoryItem,
    meter: meterResult.data,
    recharge: rechargeResult.data as RechargeHistoryDetail | null,
    isManualFlow: !transaction.meter_id,
  };
}

export async function recheckTransactionAction(transactionId: string): Promise<RecheckTransactionResult> {
  const userId = await getAuthenticatedUserId();
  const supabase = await supabaseServer();

  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (transactionError) {
    throw new Error(transactionError.message);
  }

  if (!transaction) {
    return {
      ok: false,
      status: 'failed',
      message: 'Transaction not found.',
    };
  }

  if (!transaction.vtpass_request_id) {
    return {
      ok: false,
      status: 'failed',
      message: 'This transaction does not have a VTpass request ID to recheck.',
    };
  }

  const rechargeResult = await verifyVtPassTransaction(transaction.vtpass_request_id);

  await updateTransactionStatus(
    transaction.id,
    rechargeResult.status,
    rechargeResult.requestId ?? transaction.vtpass_request_id,
  );

  if (rechargeResult.status === 'success') {
    const { data: existingRecharge, error: existingRechargeError } = await supabase
      .from('recharges')
      .select('id')
      .eq('transaction_id', transaction.id)
      .limit(1)
      .maybeSingle();

    if (existingRechargeError) {
      throw new Error(existingRechargeError.message);
    }

    if (!existingRecharge) {
      const rechargeTarget: RechargeConfirmationTarget = {
        id: transaction.meter_id ?? undefined,
        meterNumber: transaction.meter_number ?? '',
        disco: '',
        meterType: '',
      };

      await saveRechargeToDB({
        transactionId: transaction.id,
        rechargeTarget,
        rechargeResult,
        amount: Number(transaction.user_amount),
      });
    }

    return {
      ok: true,
      status: rechargeResult.status,
      message: 'Recharge status updated successfully.',
    };
  }

  if (rechargeResult.status === 'requery_required') {
    return {
      ok: false,
      status: rechargeResult.status,
      message: 'This recharge is still pending. Please try rechecking again shortly.',
    };
  }

  return {
    ok: false,
    status: rechargeResult.status,
    message: rechargeResult.message || 'We could not confirm this recharge.',
  };
}
