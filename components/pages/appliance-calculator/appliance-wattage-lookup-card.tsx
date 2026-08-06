'use client';

import { Check, Loader2, Search } from 'lucide-react';
import { type ApplianceWattageLookupResult } from '@/app/actions/appliance-cost-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { inputClasses } from './appliance-calculator-helpers';

type ApplianceWattageLookupCardProps = {
  brand: string;
  model: string;
  lookupResult: ApplianceWattageLookupResult | null;
  isLookingUp: boolean;
  onBrandChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onLookup: () => void;
  onConfirmWattage: () => void;
};

export default function ApplianceWattageLookupCard({
  brand,
  model,
  lookupResult,
  isLookingUp,
  onBrandChange,
  onModelChange,
  onLookup,
  onConfirmWattage,
}: ApplianceWattageLookupCardProps) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-primary/20 bg-background/55 p-4">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent/30 text-primary">
          <Search className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Do not know the wattage?</p>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Enter the brand and model. We will look for a likely running wattage, then you confirm it.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-foreground" htmlFor="appliance-brand">
          Brand
          <Input
            id="appliance-brand"
            value={brand}
            onChange={(event) => onBrandChange(event.target.value)}
            placeholder="Example: LG"
            className={inputClasses}
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-foreground" htmlFor="appliance-model">
          Model
          <Input
            id="appliance-model"
            value={model}
            onChange={(event) => onModelChange(event.target.value)}
            placeholder="Example: GL-B201"
            className={inputClasses}
          />
        </label>
      </div>

      <Button
        type="button"
        variant="outline"
        className="mt-4 w-full sm:w-auto"
        onClick={onLookup}
        disabled={isLookingUp}
      >
        {isLookingUp ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
        Find estimated wattage
      </Button>

      {lookupResult && (
        <div
          className={`mt-4 rounded-[1.5rem] border p-4 ${
            lookupResult.ok ? 'border-primary/20 bg-white/55' : 'border-destructive/25 bg-destructive/10'
          }`}
        >
          {lookupResult.ok ? (
            <div className="space-y-3">
              {/* The user must approve the AI estimate before it fills the wattage input. */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Estimated wattage found</p>
                  <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">
                    {lookupResult.estimatedWatts?.toLocaleString()}W
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {lookupResult.wattageRange} range - {lookupResult.confidence} confidence
                  </p>
                </div>
                <Button type="button" onClick={onConfirmWattage}>
                  <Check className="size-4" />
                  Use this wattage
                </Button>
              </div>

              {lookupResult.sourceSummary && (
                <p className="text-sm leading-5 text-muted-foreground">{lookupResult.sourceSummary}</p>
              )}

              {lookupResult.sources && lookupResult.sources.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {lookupResult.sources.map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-semibold text-foreground transition hover:border-primary/30"
                    >
                      {source.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm font-semibold text-destructive">{lookupResult.message}</p>
          )}
        </div>
      )}
    </div>
  );
}
