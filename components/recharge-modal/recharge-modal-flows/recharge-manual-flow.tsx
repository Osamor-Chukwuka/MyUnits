'use client';

import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { fetchDiscos, verifyMeterWithVtPass } from '@/app/actions/meter-actions';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { DiscoInterface, MeterTotalFees } from '@/types/meter-types';
import RechargeConfirmationModal, { RechargeConfirmationTarget } from '../recharge-confirmation-modal';
import RechargeAmountFields, { getRechargeAmountError } from '../sub-components/recharge-amount-fields';
import { getRechargeMeterTotalFees } from '../helpers/recharge-meter-rates';
import RechargeModalShell from '../sub-components/recharge-modal-shell';
import RechargeSourceSwitch, { RechargeMeterSource } from '../sub-components/recharge-source-switch';

interface RechargeManualFlowProps {
  onClose: () => void;
  onRechargeComplete?: () => void | Promise<void>;
  meterSource: RechargeMeterSource;
  onMeterSourceChange: (source: RechargeMeterSource) => void;
}

export default function RechargeManualFlow({
  onClose,
  onRechargeComplete,
  meterSource,
  onMeterSourceChange,
}: RechargeManualFlowProps) {
  const [manualMeterNumber, setManualMeterNumber] = useState('');
  const [manualDisco, setManualDisco] = useState('');
  const [manualMeterType, setManualMeterType] = useState('');
  const [manualErrors, setManualErrors] = useState<Record<string, string>>({});
  const [discos, setDiscos] = useState<DiscoInterface[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [commissionLoading, setCommissionLoading] = useState(false);
  const [meterTotalFees, setMeterTotalFees] = useState<MeterTotalFees | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmationTarget, setConfirmationTarget] = useState<RechargeConfirmationTarget | null>(null);

  useEffect(() => {
    const loadDiscos = async () => {
      try {
        const data = await fetchDiscos();
        setDiscos(data.content);
      } catch {
        toast.error('Failed to load distribution companies. Please try again later.');
      }
    };

    void loadDiscos();
  }, []);

  const resetVerification = () => {
    setIsVerified(false);
    setCustomerName('');
    setMeterTotalFees(null);
  };

  const validateManualFields = () => {
    const nextErrors: Record<string, string> = {};

    if (!manualMeterNumber.trim()) {
      nextErrors.meterNumber = 'Meter number is required';
    }

    if (!manualDisco) {
      nextErrors.disco = 'Please select a distribution company';
    }

    if (!manualMeterType) {
      nextErrors.meterType = 'Please select a meter type';
    }

    setManualErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateAmount = () => {
    const validationError = getRechargeAmountError(amount);
    setAmountError(validationError ?? '');
    return !validationError;
  };

  const handleVerify = async () => {
    if (!validateManualFields()) {
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const result = await verifyMeterWithVtPass(manualDisco, manualMeterNumber, manualMeterType);
      setCustomerName(result.customerName);
      setIsVerified(true);
      toast.success('Meter verified successfully!');
    } catch (error: unknown) {
      const message = (error as Error)?.message || 'Failed to verify meter. Please try again.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRecharge = async () => {
    if (!isVerified) {
      setErrorMessage('Please verify the meter details before continuing.');
      return;
    }

    if (!validateAmount()) {
      return;
    }

    const manualDiscoName = discos.find((discoOption) => discoOption.serviceID === manualDisco)?.name ?? manualDisco;

    setErrorMessage('');

    //re-verify meter details with VTpass to get the current rates and total fees
    try {
      setCommissionLoading(true);
      const totalFees = await getRechargeMeterTotalFees({
        disco: manualDisco,
        meterNumber: manualMeterNumber,
        meterType: manualMeterType,
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
      meterNumber: manualMeterNumber,
      disco: manualDiscoName,
      meterType: manualMeterType,
      customerName,
    });
    setIsConfirmationOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!isVerified) {
      await handleVerify();
      return;
    }

    await handleRecharge();
  };

  return (
    <>
      {!isConfirmationOpen && (
        <RechargeModalShell onClose={onClose}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <RechargeSourceSwitch meterSource={meterSource} onChange={onMeterSourceChange} />

            <div>
              <label htmlFor="manualMeterNumber" className="block mb-2 font-semibold text-foreground text-sm">
                Meter Number
              </label>
              <input
                type="text"
                id="manualMeterNumber"
                value={manualMeterNumber}
                onChange={(event) => {
                  setManualMeterNumber(event.target.value);
                  setManualErrors((currentErrors) => ({ ...currentErrors, meterNumber: '' }));
                  resetVerification();
                }}
                placeholder="Enter meter number"
                className={`min-h-11 w-full rounded-xl border bg-white/45 px-4 py-2 text-foreground placeholder-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${manualErrors.meterNumber ? 'border-destructive' : 'border-border'}`}
              />
              {manualErrors.meterNumber && <p className="mt-1 text-destructive text-sm">{manualErrors.meterNumber}</p>}
            </div>

            <div>
              <label htmlFor="manualDisco" className="block mb-2 font-semibold text-foreground text-sm ">
                Service area
              </label>
              <select
                id="manualDisco"
                value={manualDisco}
                onChange={(event) => {
                  setManualDisco(event.target.value);
                  setManualErrors((currentErrors) => ({ ...currentErrors, disco: '' }));
                  resetVerification();
                }}
                className={`min-h-11 w-full cursor-pointer rounded-xl border bg-white/45 px-4 py-2 text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${manualErrors.disco ? 'border-destructive' : 'border-border'}`}
              >
                <option value="">Select your service area</option>
                {discos.map((disco) => (
                  <option key={disco.serviceID} value={disco.serviceID}>
                    {disco.name}
                  </option>
                ))}
              </select>
              {manualErrors.disco && <p className="mt-1 text-destructive text-sm">{manualErrors.disco}</p>}
            </div>

            <div>
              <label className="block mb-2 font-semibold text-foreground text-sm">Meter Type</label>
              <div className="gap-4 grid grid-cols-2">
                {['prepaid', 'postpaid'].map((type) => (
                  <label
                    key={type}
                    className={`cursor-pointer rounded-lg border px-4 py-3 text-sm font-medium text-center transition-all
                      ${manualMeterType === type
                        ? 'border-primary bg-primary text-primary-foreground shadow-[0_12px_30px_rgba(16,42,42,0.16)]'
                        : 'border-border bg-white/35 hover:border-primary/40'
                      }`}
                  >
                    <input
                      type="radio"
                      name="manualMeterType"
                      value={type}
                      checked={manualMeterType === type}
                      onChange={(event) => {
                        setManualMeterType(event.target.value);
                        setManualErrors((currentErrors) => ({ ...currentErrors, meterType: '' }));
                        resetVerification();
                      }}
                      className="hidden"
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
              {manualErrors.meterType && <p className="mt-1 text-destructive text-sm text-center">{manualErrors.meterType}</p>}
            </div>

            {isVerified && customerName && (
              <div className="rounded-lg border border-green-500/30 bg-green-50 dark:bg-green-950/20 px-4 py-3">
                <p className="text-sm text-muted-foreground">Customer Name</p>
                <p className="font-semibold text-foreground">{customerName}</p>
              </div>
            )}

            {isVerified && (
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
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent"
                disabled={isVerifying || commissionLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isVerifying || commissionLoading}>
                {!isVerified ? (isVerifying ? 'Verifying...' : 'Verify') : commissionLoading ? 'Getting total...' : 'Recharge Now'}
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
