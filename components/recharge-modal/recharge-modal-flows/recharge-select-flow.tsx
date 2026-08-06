'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { MeterInterface, MeterTotalFees } from '@/types/meter-types';
import RechargeConfirmationModal, { RechargeConfirmationTarget } from '../recharge-confirmation-modal';
import RechargeAmountFields, { getRechargeAmountError } from '../sub-components/recharge-amount-fields';
import { getRechargeMeterTotalFees } from '../helpers/recharge-meter-rates';
import RechargeModalShell from '../sub-components/recharge-modal-shell';
import RechargeSourceSwitch, { RechargeMeterSource } from '../sub-components/recharge-source-switch';

interface RechargeSelectFlowProps {
  onClose: () => void;
  onRechargeComplete?: () => void | Promise<void>;
  meters: MeterInterface[];
  meterSource: RechargeMeterSource;
  onMeterSourceChange: (source: RechargeMeterSource) => void;
}

export default function RechargeSelectFlow({
  onClose,
  onRechargeComplete,
  meters,
  meterSource,
  onMeterSourceChange,
}: RechargeSelectFlowProps) {

  const [selectedMeterId, setSelectedMeterId] = useState('');
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [commissionLoading, setCommissionLoading] = useState(false);
  const [meterTotalFees, setMeterTotalFees] = useState<MeterTotalFees | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmationTarget, setConfirmationTarget] = useState<RechargeConfirmationTarget | null>(null);

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
    
    //re-verify meter details with VTpass to get the current rates and total fees
    try {
      setCommissionLoading(true);
      const totalFees = await getRechargeMeterTotalFees({
        disco: selectedMeter.disco,
        meterNumber: selectedMeter.meter_number,
        meterType: selectedMeter.type,
        amount,
      });
      setMeterTotalFees(totalFees);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
      return;
    } finally {
      setCommissionLoading(false);
    }

    setConfirmationTarget({
      id: selectedMeter.id,
      name: selectedMeter.name,
      meterNumber: selectedMeter.meter_number,
      disco: selectedMeter.disco,
      meterType: selectedMeter.type,
      customerName: selectedMeter.customer_name,
    });
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
                  setMeterTotalFees(null);
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
                    <span className="text-muted-foreground text-sm">Service area</span>
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
                  setMeterTotalFees(null);
                }}
              />
            )}

            {commissionLoading && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-4 py-3 text-muted-foreground text-sm">
                <Spinner className="size-4" />
                Getting your total...
              </div>
            )}

            {errorMessage && <p className="text-destructive text-sm text-center">{errorMessage}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent" disabled={commissionLoading}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={commissionLoading}>
                {commissionLoading ? 'Getting total...' : 'Recharge Now'}
              </Button>
            </div>
          </form>
        </RechargeModalShell>
      )}

      <RechargeConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onRechargeComplete={onRechargeComplete}
        rechargeTarget={confirmationTarget}
        meterTotalFees={meterTotalFees}
      />
    </>
  );
}
