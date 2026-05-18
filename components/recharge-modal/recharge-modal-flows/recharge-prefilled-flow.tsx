'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { MeterInterface, MeterTotalFees } from '@/types/meter-types';
import RechargeConfirmationModal, { RechargeConfirmationTarget } from '../recharge-confirmation-modal';
import RechargeAmountFields, { getRechargeAmountError } from '../sub-components/recharge-amount-fields';
import { getRechargeMeterTotalFees } from '../helpers/recharge-meter-rates';
import RechargeModalShell from '../sub-components/recharge-modal-shell';

interface RechargePrefilledFlowProps {
  onClose: () => void;
  meter: MeterInterface;
}

export default function RechargePrefilledFlow({ onClose, meter }: RechargePrefilledFlowProps) {
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [commissionLoading, setCommissionLoading] = useState(false);
  const [meterTotalFees, setMeterTotalFees] = useState<MeterTotalFees | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const rechargeTarget: RechargeConfirmationTarget = {
    name: meter.name,
    meterNumber: meter.meter_number,
    disco: meter.disco,
    meterType: meter.type,
    customerName: meter.customer_name,
  };

  const validateAmount = () => {
    const validationError = getRechargeAmountError(amount);
    setAmountError(validationError ?? '');
    return !validationError;
  };

  const handleRecharge = async () => {
    if (!validateAmount()) {
      return;
    }

    setErrorMessage('');

    //re-verify meter details with VTpass to get the current rates and total fees
    try {
      setCommissionLoading(true);
      const totalFees = await getRechargeMeterTotalFees({
        disco: meter.disco,
        meterNumber: meter.meter_number,
        meterType: meter.type,
        amount,
      });
      setMeterTotalFees(totalFees);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
      return;
    } finally {
      setCommissionLoading(false);
    }

    setIsConfirmationOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await handleRecharge();
  };

  return (
    <>
      {!isConfirmationOpen && (
        <RechargeModalShell onClose={onClose}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3 rounded-lg border border-border bg-secondary/30 p-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Meter Name</span>
                <span className="font-semibold text-foreground text-sm">{meter.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Meter Number</span>
                <span className="font-semibold text-foreground text-sm">{meter.meter_number}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Distribution Company</span>
                <span className="font-semibold text-foreground text-sm">{meter.disco}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Meter Type</span>
                <span className="font-semibold text-foreground text-sm capitalize">{meter.type}</span>
              </div>
              {meter.customer_name && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Customer Name</span>
                  <span className="font-semibold text-foreground text-sm">{meter.customer_name}</span>
                </div>
              )}
            </div>

            <RechargeAmountFields
              amount={amount}
              amountError={amountError}
              onAmountChange={(value) => {
                setAmount(value);
                setAmountError('');
                setMeterTotalFees(null);
              }}
            />

            {commissionLoading && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-4 py-3 text-muted-foreground text-sm">
                <Spinner className="size-4" />
                Checking current meter rates...
              </div>
            )}

            {errorMessage && <p className="text-destructive text-sm text-center">{errorMessage}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent" disabled={commissionLoading}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={commissionLoading}>
                {commissionLoading ? 'Checking rates...' : 'Recharge Now'}
              </Button>
            </div>
          </form>
        </RechargeModalShell>
      )}

      <RechargeConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onRechargeComplete={onClose}
        rechargeTarget={rechargeTarget}
        meterTotalFees={meterTotalFees}
      />
    </>
  );
}