'use client';

import { Loader2, Sparkles, Timer, Zap } from 'lucide-react';
import { type ApplianceUnitCalculation, type ApplianceWattageLookupResult, type UsageUnit } from '@/app/actions/appliance-cost-actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { applianceSuggestions, inputClasses } from './appliance-calculator-helpers';
import { SectionHeading, StepPill } from './appliance-calculator-ui';
import ApplianceWattageLookupCard from './appliance-wattage-lookup-card';

type ApplianceCalculatorFormCardProps = {
  applianceName: string;
  watts: string;
  usageAmount: string;
  usageUnit: UsageUnit;
  brand: string;
  model: string;
  lookupResult: ApplianceWattageLookupResult | null;
  result: ApplianceUnitCalculation | null;
  message: string;
  isCalculating: boolean;
  isLookingUp: boolean;
  canCalculate: boolean;
  onApplianceChange: (value: string) => void;
  onWattsChange: (value: string) => void;
  onUsageAmountChange: (value: string) => void;
  onUsageUnitChange: (value: UsageUnit) => void;
  onBrandChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onLookup: () => void;
  onConfirmWattage: () => void;
  onCalculate: () => void;
};

export default function ApplianceCalculatorFormCard({
  applianceName,
  watts,
  usageAmount,
  usageUnit,
  brand,
  model,
  lookupResult,
  result,
  message,
  isCalculating,
  isLookingUp,
  canCalculate,
  onApplianceChange,
  onWattsChange,
  onUsageAmountChange,
  onUsageUnitChange,
  onBrandChange,
  onModelChange,
  onLookup,
  onConfirmWattage,
  onCalculate,
}: ApplianceCalculatorFormCardProps) {
  return (
    <Card className="app-card overflow-hidden p-0">
      <div className="border-b border-border/70 bg-white/30 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <StepPill step="1" label="Appliance" active />
          <StepPill step="2" label="Wattage" active={Boolean(applianceName)} />
          <StepPill step="3" label="Usage" active={Boolean(applianceName && watts)} />
          <StepPill step="4" label="Estimate" active={Boolean(result)} />
        </div>
      </div>

      <div className="space-y-8 p-5 sm:p-8">
        <section className="space-y-4">
          <SectionHeading
            icon={<Sparkles className="size-5" aria-hidden="true" />}
            title="Choose or type the appliance"
            description="Start with a common appliance, or type your own."
          />

          <div className="flex flex-wrap gap-2">
            {applianceSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition ${
                  applianceName === suggestion
                    ? 'border-primary bg-primary text-primary-foreground shadow-[0_16px_36px_rgba(16,42,42,0.18)]'
                    : 'border-border bg-white/40 text-foreground hover:border-primary/35 hover:bg-white/70'
                }`}
                onClick={() => onApplianceChange(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <label className="grid gap-2 text-sm font-semibold text-foreground" htmlFor="appliance-name">
            Appliance name
            <Input
              id="appliance-name"
              list="appliance-suggestions"
              value={applianceName}
              onChange={(event) => onApplianceChange(event.target.value)}
              placeholder="Example: Pressing iron"
              className={inputClasses}
            />
          </label>
          <datalist id="appliance-suggestions">
            {applianceSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </section>

        <section className="grid gap-5 rounded-[1.75rem] border border-border/70 bg-white/30 p-4 sm:p-5">
          <SectionHeading
            icon={<Zap className="size-5" aria-hidden="true" />}
            title="Enter the wattage"
            description="Use the number written as W on the appliance label, manual, or box."
          />

          <label className="grid gap-2 text-sm font-semibold text-foreground" htmlFor="appliance-watts">
            Wattage
            <div className="flex items-center gap-3">
              <Input
                id="appliance-watts"
                type="number"
                inputMode="decimal"
                min="1"
                value={watts}
                onChange={(event) => onWattsChange(event.target.value)}
                placeholder="Example: 1500"
                className={inputClasses}
              />
              <span className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm font-bold text-foreground">
                W
              </span>
            </div>
          </label>

          {/* Fallback lookup path: only for users who do not know the wattage. */}
          <ApplianceWattageLookupCard
            brand={brand}
            model={model}
            lookupResult={lookupResult}
            isLookingUp={isLookingUp}
            onBrandChange={onBrandChange}
            onModelChange={onModelChange}
            onLookup={onLookup}
            onConfirmWattage={onConfirmWattage}
          />
        </section>

        <section className="space-y-4">
          <SectionHeading
            icon={<Timer className="size-5" aria-hidden="true" />}
            title="How long do you use it?"
            description="Enter one usage session, not a monthly total."
          />

          <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
            <label className="grid gap-2 text-sm font-semibold text-foreground" htmlFor="usage-amount">
              Usage time
              <Input
                id="usage-amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                value={usageAmount}
                onChange={(event) => onUsageAmountChange(event.target.value)}
                placeholder="Example: 30"
                className={inputClasses}
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-foreground" htmlFor="usage-unit">
              Unit
              <select
                id="usage-unit"
                className={`${inputClasses} outline-none`}
                value={usageUnit}
                onChange={(event) => onUsageUnitChange(event.target.value as UsageUnit)}
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
              </select>
            </label>
          </div>

          {message && (
            <p className="rounded-2xl border border-accent/30 bg-accent/15 px-4 py-3 text-sm font-semibold text-primary">
              {message}
            </p>
          )}

          <Button
            type="button"
            size="lg"
            className="w-full sm:w-auto"
            onClick={onCalculate}
            disabled={!canCalculate || isCalculating}
          >
            {isCalculating ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />}
            Calculate units
          </Button>
        </section>
      </div>
    </Card>
  );
}
