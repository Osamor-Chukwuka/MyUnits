'use client';

import { useState } from 'react';
import { MeterInterface } from '@/types/meter-types';
import RechargeManualFlow from './recharge-manual-flow';
import RechargePrefilledFlow from './recharge-prefilled-flow';
import RechargeSelectFlow from './recharge-select-flow';
import { RechargeMeterSource } from './recharge-source-switch';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-filled meter (from meter detail page or meter card). Skips verification. */
  meter?: MeterInterface | null;
  /** List of user meters for the dropdown (dashboard general mode). */
  meters?: MeterInterface[];
}

export default function RechargeModal({ isOpen, onClose, meter, meters = [] }: RechargeModalProps) {
  const isPrefilledMode = !!meter;
  const [meterSource, setMeterSource] = useState<RechargeMeterSource>('select');

  const handleClose = () => {
    if (!isPrefilledMode) {
      setMeterSource('select');
    }
    onClose();
  };

  if (isPrefilledMode && meter) {
    return <RechargePrefilledFlow isOpen={isOpen} onClose={handleClose} meter={meter} />;
  }

  return meterSource === 'manual' ? (
    <RechargeManualFlow
      isOpen={isOpen}
      onClose={handleClose}
      meterSource={meterSource}
      onMeterSourceChange={setMeterSource}
    />
  ) : (
    <RechargeSelectFlow
      isOpen={isOpen}
      onClose={handleClose}
      meters={meters}
      meterSource={meterSource}
      onMeterSourceChange={setMeterSource}
    />
  );
}
