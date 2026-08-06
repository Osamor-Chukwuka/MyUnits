import { MeterInterface } from './meter-types';

export interface TransactionHistoryItem {
  id: string;
  meter_id: string | null;
  meter?: { name: string | null } | { name: string | null }[] | null;
  meter_number: string | null;
  user_amount: number | string;
  total_amount: number | string;
  paystack_status: string;
  vtpass_status: string | null;
  total_charges: number | string;
  paystack_charge: number | string;
  total_commission: number | string;
  vtpass_commission: number | string | null;
  created_at: string;
  updated_at: string;
  paystack_reference: string;
  vtpass_request_id: string | null;
}

export interface RechargeHistoryDetail {
  id: number;
  amount: number | string;
  units: string;
  token: string;
  created_at: string;
  meter_id: string | null;
  meter_number: string | null;
  transaction_id: string | null;
}

export interface TransactionHistoryDetail {
  transaction: TransactionHistoryItem;
  meter: MeterInterface | null;
  recharge: RechargeHistoryDetail | null;
  isManualFlow: boolean;
}
