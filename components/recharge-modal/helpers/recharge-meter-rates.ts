import { verifyMeterWithVtPass } from '@/app/actions/meter-actions';
import { calculateTotalAmount } from '@/lib/helpers/calculate-total-amount';
import { MeterTotalFees, RechargeMeterCommission } from '@/types/meter-types';



interface GetRechargeMeterCommissionParams {
  disco: string;
  meterNumber: string;
  meterType: string;
  amount: string;
}

export async function getRechargeMeterTotalFees({
  disco,
  meterNumber,
  meterType,
  amount,
}: GetRechargeMeterCommissionParams): Promise<MeterTotalFees> {
  const { data } = await verifyMeterWithVtPass(disco, meterNumber, meterType);

  const minPurchaseAmount = data?.content?.Min_Purchase_Amount;
  if (minPurchaseAmount && Number(amount) < Number(minPurchaseAmount)) {
    throw new Error(`The minimum recharge amount for this meter is ₦${minPurchaseAmount}. Please enter a valid amount.`);
  }

  const commissionDetails = data?.content?.commission_details as RechargeMeterCommission | undefined;
  if (!commissionDetails?.amount && !commissionDetails?.rate) {
    throw new Error('Failed to retrieve meter rates: Please check the meter details and try again.');
  }

  console.log("verify data: ", data);

  return calculateTotalAmount(Number(amount), commissionDetails);
}