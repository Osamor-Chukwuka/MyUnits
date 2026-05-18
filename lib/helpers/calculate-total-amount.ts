import { MeterTotalFees, RechargeMeterCommission } from "@/types/meter-types";

export const calculateTotalAmount = (amount: number, meterCommission: RechargeMeterCommission | null): MeterTotalFees => {
    //1. Get paystack fee
    let fee = 0.015 * amount;
    if (amount > 2500) {
        fee += 100;
    }
    const paystackFee = Math.min(fee, 2000);


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


    //3. Calculate total amount
    const totalAmount = (amount + paystackFee);

    return {
        totalAmount,
        amount,
        paystackFee,
        vtpassCommission,
    }
}