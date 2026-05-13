'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MeterInterface } from '@/types/meter-types';
import RechargeConfirmationModal, { RechargeConfirmationTarget } from './recharge-confirmation-modal';
import RechargeAmountFields, { getRechargeAmountError } from './recharge-amount-fields';
import RechargeModalShell from './recharge-modal-shell';
import RechargeSourceSwitch, { RechargeMeterSource } from './recharge-source-switch';

interface RechargeSelectFlowProps {
  isOpen: boolean;
  onClose: () => void;
  meters: MeterInterface[];
  meterSource: RechargeMeterSource;
  onMeterSourceChange: (source: RechargeMeterSource) => void;
}

export default function RechargeSelectFlow({
  isOpen,
  onClose,
  meters,
  meterSource,
  onMeterSourceChange,
}: RechargeSelectFlowProps) {
  const [selectedMeterId, setSelectedMeterId] = useState('');
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmationTarget, setConfirmationTarget] = useState<RechargeConfirmationTarget | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedMeterId('');
      setAmount('');
      setAmountError('');
      setErrorMessage('');
      setIsSubmitting(false);
      setIsConfirmationOpen(false);
      setConfirmationTarget(null);
    }
  }, [isOpen]);

  const selectedMeter = useMemo(
    () => meters.find((candidate) => candidate.id === selectedMeterId) ?? null,
    [meters, selectedMeterId]
  );

  const validateAmount = () => {
    const validationError = getRechargeAmountError(amount);
    setAmountError(validationError ?? '');
    return !validationError;
  };

  const handleRecharge = async () => {
    if (!selectedMeter) {
      setErrorMessage('Please select a meter to continue.');
      return;
    }

    if (!validateAmount()) {
      return;
    }

    setErrorMessage('');
    setConfirmationTarget({
      name: selectedMeter.name,
      meterNumber: selectedMeter.meter_number,
      disco: selectedMeter.disco,
      meterType: selectedMeter.type,
      customerName: selectedMeter.customer_name,
    });
    setIsConfirmationOpen(true);
  };

  const handleConfirmRecharge = async () => {
    if (!confirmationTarget) {
      setIsConfirmationOpen(false);
      setErrorMessage('Meter details are missing. Please start again.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsConfirmationOpen(false);
      onClose();
    } catch (error: unknown) {
      const message = (error as Error)?.message || 'Recharge failed. Please try again.';
      setErrorMessage(message);
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
            <RechargeSourceSwitch meterSource={meterSource} onChange={onMeterSourceChange} />

            <div>
              <label htmlFor="selectMeter" className="block mb-2 font-semibold text-foreground text-sm">
                Select Meter
              </label>
              <select
                id="selectMeter"
                value={selectedMeterId}
                onChange={(event) => {
                  setSelectedMeterId(event.target.value);
                  setErrorMessage('');
                }}
                className="w-full px-4 py-2 rounded-lg border border-border transition-colors bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Choose a meter</option>
                {meters.map((meter) => (
                  <option key={meter.id} value={meter.id}>
                    {meter.name} — {meter.meter_number}
                  </option>
                ))}
              </select>

              {selectedMeter && (
                <div className="mt-3 space-y-2 rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Meter Number</span>
                    <span className="font-semibold text-foreground text-sm">{selectedMeter.meter_number}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Distribution Company</span>
                    <span className="font-semibold text-foreground text-sm">{selectedMeter.disco}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Meter Type</span>
                    <span className="font-semibold text-foreground text-sm capitalize">{selectedMeter.type}</span>
                  </div>
                  {selectedMeter.customer_name && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Customer Name</span>
                      <span className="font-semibold text-foreground text-sm">{selectedMeter.customer_name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedMeter && (
              <RechargeAmountFields
                amount={amount}
                amountError={amountError}
                onAmountChange={(value) => {
                  setAmount(value);
                  setAmountError('');
                }}
              />
            )}

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
        rechargeTarget={confirmationTarget}
        amount={Number(amount) || 0}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
      />
    </>
  );
}