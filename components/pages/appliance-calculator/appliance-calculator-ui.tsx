import { type ReactNode } from 'react';

export function StepPill({ step, label, active }: { step: string; label: string; active: boolean }) {
  return (
    <div
      className={`flex min-h-11 items-center gap-2 rounded-full border px-3 text-sm font-bold transition ${
        active ? 'border-primary/25 bg-primary text-primary-foreground' : 'border-border bg-white/45 text-muted-foreground'
      }`}
    >
      <span className={`grid size-6 place-items-center rounded-full ${active ? 'bg-accent text-primary' : 'bg-muted'}`}>
        {step}
      </span>
      {label}
    </div>
  );
}

export function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">{icon}</div>
      <div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function ResultRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/70 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={
          strong
            ? 'text-right text-lg font-bold tabular-nums text-foreground'
            : 'text-right text-sm font-semibold tabular-nums text-foreground'
        }
      >
        {value}
      </span>
    </div>
  );
}

export function FormulaLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white/40 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}
