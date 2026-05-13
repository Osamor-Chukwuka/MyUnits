'use client';

import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { fetchDiscos, verifyMeterWithVtPass } from '@/app/actions/meter-actions';
import { Button } from '@/components/ui/button';
import { DiscoInterface } from '@/types/meter-types';
import RechargeConfirmationModal, { RechargeConfirmationTarget } from './recharge-confirmation-modal';
import RechargeAmountFields, { getRechargeAmountError } from './recharge-amount-fields';
import RechargeModalShell from './recharge-modal-shell';
import RechargeSourceSwitch, { RechargeMeterSource } from './recharge-source-switch';

interface RechargeManualFlowProps {
  isOpen: boolean;
  onClose: () => void;
  meterSource: RechargeMeterSource;
  onMeterSourceChange: (source: RechargeMeterSource) => void;
}

export default function RechargeManualFlow({
  isOpen,
  onClose,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmationTarget, setConfirmationTarget] = useState<RechargeConfirmationTarget | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setManualMeterNumber('');
    setManualDisco('');
    setManualMeterType('');
    setManualErrors({});
    setDiscos([]);
    setIsVerified(false);
    setCustomerName('');
    setAmount('');
    setAmountError('');
    setErrorMessage('');
    setIsSubmitting(false);
    setIsConfirmationOpen(false);
    setConfirmationTarget(null);

    const loadDiscos = async () => {
      try {
        const data = await fetchDiscos();
        setDiscos(data.content);
      } catch {
        toast.error('Failed to load distribution companies. Please try again later.');
      }
    };

    void loadDiscos();
  }, [isOpen]);

  const resetVerification = () => {
    setIsVerified(false);
    setCustomerName('');
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

    setIsSubmitting(true);
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
      setIsSubmitting(false);
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
    setConfirmationTarget({
      meterNumber: manualMeterNumber,
      disco: manualDiscoName,
      meterType: manualMeterType,
      customerName,
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

    if (!isVerified) {
      await handleVerify();
      return;
    }

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
                className={`w-full px-4 py-2 rounded-lg border transition-colors bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${manualErrors.meterNumber ? 'border-destructive' : 'border-border'}`}
              />
              {manualErrors.meterNumber && <p className="mt-1 text-destructive text-sm">{manualErrors.meterNumber}</p>}
            </div>

            <div>
              <label htmlFor="manualDisco" className="block mb-2 font-semibold text-foreground text-sm ">
                Distribution Company
              </label>
              <select
                id="manualDisco"
                value={manualDisco}
                onChange={(event) => {
                  setManualDisco(event.target.value);
                  setManualErrors((currentErrors) => ({ ...currentErrors, disco: '' }));
                  resetVerification();
                }}
                className={`w-full px-4 py-2 rounded-lg border transition-colors bg-background text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${manualErrors.disco ? 'border-destructive' : 'border-border'}`}
              >
                <option value="">Select a distribution company</option>
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
                        ? 'border-red-600 ring-2 ring-red-600/30 bg-red-50 text-red-700'
                        : 'border-border hover:border-red-400'
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
                {!isVerified ? (isSubmitting ? 'Verifying...' : 'Verify') : isSubmitting ? 'Processing...' : 'Recharge Now'}
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