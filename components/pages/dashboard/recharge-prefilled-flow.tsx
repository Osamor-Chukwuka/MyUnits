'use client';

import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MeterInterface } from '@/types/meter-types';
import RechargeConfirmationModal, { RechargeConfirmationTarget } from './recharge-confirmation-modal';
import RechargeAmountFields, { getRechargeAmountError } from './recharge-amount-fields';
import RechargeModalShell from './recharge-modal-shell';

interface RechargePrefilledFlowProps {
  isOpen: boolean;
  onClose: () => void;
  meter: MeterInterface;
}

export default function RechargePrefilledFlow({ isOpen, onClose, meter }: RechargePrefilledFlowProps) {
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setAmountError('');
      setErrorMessage('');
      setIsSubmitting(false);
      setIsConfirmationOpen(false);
    }
  }, [isOpen]);

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
    setIsConfirmationOpen(true);
  };

  const handleConfirmRecharge = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.info('Recharge backend placeholder completed.');
      setIsConfirmationOpen(false);
      onClose();
    } catch (error: unknown) {
      const message = (error as Error)?.message || 'Recharge failed. Please try again.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await handleRecharge();
  };

  if (!isOpen) {
    return null;
  }

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
              }}
            />

            {errorMessage && <p className="text-destructive text-sm text-center">{errorMessage}</p>}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Recharge Now'}
              </Button>
            </div>
          </form>
        </RechargeModalShell>
      )}

      <RechargeConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleConfirmRecharge}
        rechargeTarget={rechargeTarget}
        amount={Number(amount) || 0}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
      />
    </>
  );
}