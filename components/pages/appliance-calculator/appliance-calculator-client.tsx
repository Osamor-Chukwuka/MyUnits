'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import {
  calculateApplianceUnitsAction,
  lookupApplianceWattageAction,
  type ApplianceUnitCalculation,
  type ApplianceWattageLookupResult,
  type UsageUnit,
} from '@/app/actions/appliance-cost-actions';
import ApplianceCalculatorFormCard from './appliance-calculator-form-card';
import ApplianceResultPanel from './appliance-result-panel';

export default function ApplianceCalculatorClient() {
  const [applianceName, setApplianceName] = useState('');
  const [watts, setWatts] = useState('');
  const [usageAmount, setUsageAmount] = useState('30');
  const [usageUnit, setUsageUnit] = useState<UsageUnit>('minutes');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [lookupResult, setLookupResult] = useState<ApplianceWattageLookupResult | null>(null);
  const [result, setResult] = useState<ApplianceUnitCalculation | null>(null);
  const [message, setMessage] = useState('');
  const [isCalculating, startCalculation] = useTransition();
  const [isLookingUp, startLookup] = useTransition();
  const resultSectionRef = useRef<HTMLElement | null>(null);

  // A lookup estimate is not used automatically. The user must confirm it first.
  const hasLookupEstimate = lookupResult?.ok && lookupResult.estimatedWatts;
  const canCalculate = Boolean(applianceName.trim() && watts && usageAmount);

  useEffect(() => {
    if (!result) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    resultSectionRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [result]);

  function resetDependentInputs() {
    // A new appliance makes wattage, lookup details, errors, and results stale.
    setWatts('');
    setBrand('');
    setModel('');
    setLookupResult(null);
    setResult(null);
    setMessage('');
    setUsageAmount('30');
    setUsageUnit('minutes');
  }

  function resetResultAndMessage() {
    setResult(null);
    setMessage('');
  }

  function handleApplianceChange(value: string) {
    setApplianceName(value);
    resetDependentInputs();
  }

  function handleWattsChange(value: string) {
    // Manual wattage entry is the main flow. Once watts exist, no Gemini call is needed.
    setWatts(value);
    setLookupResult(null);
    resetResultAndMessage();
  }

  function handleBrandChange(value: string) {
    setBrand(value);
    setLookupResult(null);
    setMessage('');
  }

  function handleModelChange(value: string) {
    setModel(value);
    setLookupResult(null);
    setMessage('');
  }

  function handleUsageAmountChange(value: string) {
    setUsageAmount(value);
    resetResultAndMessage();
  }

  function handleUsageUnitChange(value: UsageUnit) {
    setUsageUnit(value);
    resetResultAndMessage();
  }

  function handleLookup() {
    // Gemini is only a fallback for users who do not know the wattage.
    // It returns an estimated wattage, not the final unit calculation.
    setLookupResult(null);
    setMessage('');

    startLookup(async () => {
      const response = await lookupApplianceWattageAction({ applianceName, brand, model });
      setLookupResult(response);

      if (!response.ok) {
        setMessage(response.message);
      }
    });
  }

  function confirmLookupWattage() {
    if (!hasLookupEstimate) return;

    // After confirmation, the estimated wattage becomes the same as a manually
    // entered wattage. The calculation still happens in our own server action.
    setWatts(String(lookupResult.estimatedWatts));
    setApplianceName(lookupResult.applianceName || applianceName);
    setMessage('Wattage added. You can calculate now.');
    setResult(null);
  }

  function handleCalculate() {
    // This action performs the actual unit formula:
    // units/hour = watts / 1000
    // units/minute = units/hour / 60
    // usage units = units/minute x minutes used
    setMessage('');

    startCalculation(async () => {
      try {
        const calculation = await calculateApplianceUnitsAction({
          applianceName,
          watts: Number(watts),
          usageAmount: Number(usageAmount),
          usageUnit,
        });

        setResult(calculation);
      } catch (error) {
        setResult(null);
        setMessage(error instanceof Error ? error.message : 'We could not calculate this estimate.');
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <ApplianceCalculatorFormCard
        applianceName={applianceName}
        watts={watts}
        usageAmount={usageAmount}
        usageUnit={usageUnit}
        brand={brand}
        model={model}
        lookupResult={lookupResult}
        result={result}
        message={message}
        isCalculating={isCalculating}
        isLookingUp={isLookingUp}
        canCalculate={canCalculate}
        onApplianceChange={handleApplianceChange}
        onWattsChange={handleWattsChange}
        onUsageAmountChange={handleUsageAmountChange}
        onUsageUnitChange={handleUsageUnitChange}
        onBrandChange={handleBrandChange}
        onModelChange={handleModelChange}
        onLookup={handleLookup}
        onConfirmWattage={confirmLookupWattage}
        onCalculate={handleCalculate}
      />

      <ApplianceResultPanel result={result} resultPanelRef={resultSectionRef} />
    </div>
  );
}
