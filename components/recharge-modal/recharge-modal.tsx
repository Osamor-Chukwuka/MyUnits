'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MeterInterface } from '@/types/meter-types';
import RechargeManualFlow from './recharge-modal-flows/recharge-manual-flow';
import RechargePrefilledFlow from './recharge-modal-flows/recharge-prefilled-flow';
import RechargeSelectFlow from './recharge-modal-flows/recharge-select-flow';
import { RechargeMeterSource } from './sub-components/recharge-source-switch';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRechargeSuccess?: () => void | Promise<void>;
  /** Pre-filled meter (from meter detail page or meter card). Skips verification. */
  meter?: MeterInterface | null;
  /** List of user meters for the dropdown (dashboard general mode). */
  meters?: MeterInterface[];
}

export default function RechargeModal({ isOpen, onClose, onRechargeSuccess, meter, meters = [] }: RechargeModalProps) {
  const router = useRouter();
  const isPrefilledMode = !!meter;
  const [meterSource, setMeterSource] = useState<RechargeMeterSource>('select');

  const handleClose = () => {
    if (!isPrefilledMode) {
      setMeterSource('select');
    }
    onClose();
  };

  const handleRechargeComplete = async () => {
    handleClose();

    try {
      if (onRechargeSuccess) {
        await onRechargeSuccess();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to refresh recharge data after a successful payment.', error);
    }
  };

  if (!isOpen) {
    return null;
  }

  if (isPrefilledMode && meter) {
    return <RechargePrefilledFlow onClose={handleClose} onRechargeComplete={handleRechargeComplete} meter={meter} />;
  }

  return meterSource === 'manual' ? (
    <RechargeManualFlow
      onClose={handleClose}
      onRechargeComplete={handleRechargeComplete}
      meterSource={meterSource}
      onMeterSourceChange={setMeterSource}
    />
  ) : (
    <RechargeSelectFlow
      onClose={handleClose}
      onRechargeComplete={handleRechargeComplete}
      meters={meters}
      meterSource={meterSource}
      onMeterSourceChange={setMeterSource}
    />
  );
}
