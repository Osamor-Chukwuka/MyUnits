'use client';

import { type RefObject } from 'react';
import { Info, Zap } from 'lucide-react';
import { type ApplianceUnitCalculation } from '@/app/actions/appliance-cost-actions';
import { Card } from '@/components/ui/card';
import { formatUnits, formatUsage } from './appliance-calculator-helpers';
import { FormulaLine, ResultRow } from './appliance-calculator-ui';

type ApplianceResultPanelProps = {
  result: ApplianceUnitCalculation | null;
  resultPanelRef: RefObject<HTMLElement | null>;
};

export default function ApplianceResultPanel({ result, resultPanelRef }: ApplianceResultPanelProps) {
  return (
    <aside ref={resultPanelRef} className="scroll-mt-6 space-y-5">
      <Card className="app-card overflow-hidden p-0">
        <div className="bg-primary p-6 text-primary-foreground">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Estimate</p>
          <h2 className="mt-3 text-4xl font-bold tabular-nums">
            {result ? `${formatUnits(result.unitsForUsage)} units` : 'Waiting'}
          </h2>
          <p className="mt-2 text-sm leading-5 text-primary-foreground/65">
            {result
              ? `Estimated for ${formatUsage(result.usageMinutes)} of ${result.applianceName}.`
              : 'Your unit estimate will appear here after calculation.'}
          </p>
        </div>

        {/* Result cards deliberately show units only. We do not show naira without a real tariff rate. */}
        <div className="space-y-3 p-5">
          {result ? (
            <>
              <ResultRow label="Units per minute" value={`${formatUnits(result.unitsPerMinute)} units`} />
              <ResultRow label="Units per hour" value={`${formatUnits(result.unitsPerHour)} units`} />
              <ResultRow label="Entered usage time" value={formatUsage(result.usageMinutes)} />
              <ResultRow label="Estimated units used" value={`${formatUnits(result.unitsForUsage)} units`} strong />
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-white/35 p-6 text-center">
              <Zap className="mx-auto mb-3 size-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                Add the appliance wattage and usage time to see the unit estimate.
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card className="app-card p-5">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent/30 text-primary">
            <Info className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">This is an estimate</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Actual usage can change based on appliance settings, age, voltage, inverter mode, and how the appliance
              cycles during use.
            </p>
          </div>
        </div>
      </Card>

      <Card className="app-card p-5">
        <h2 className="text-base font-bold text-foreground">How we calculate it</h2>
        <div className="mt-4 space-y-3">
          <FormulaLine label="Units per hour" value="Watts / 1000" />
          <FormulaLine label="Units per minute" value="Units per hour / 60" />
          <FormulaLine label="Usage estimate" value="Units per minute x minutes used" />
        </div>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Example: a 1,500W pressing iron uses about 1.5 units per hour, or 0.025 units per minute.
        </p>
      </Card>
    </aside>
  );
}
