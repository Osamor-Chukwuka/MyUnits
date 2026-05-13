'use client';

export type RechargeMeterSource = 'select' | 'manual';

interface RechargeSourceSwitchProps {
  meterSource: RechargeMeterSource;
  onChange: (source: RechargeMeterSource) => void;
}

const options: Array<{ value: RechargeMeterSource; label: string }> = [
  { value: 'select', label: 'My Meters' },
  { value: 'manual', label: 'Enter Manually' },
];

export default function RechargeSourceSwitch({ meterSource, onChange }: RechargeSourceSwitchProps) {
  return (
    <div>
      <label className="block mb-2 font-semibold text-foreground text-sm">Meter Source</label>
      <div className="gap-4 grid grid-cols-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`cursor-pointer rounded-lg border px-4 py-3 text-sm font-medium text-center transition-all
              ${meterSource === option.value
                ? 'border-primary ring-2 ring-primary/30 bg-primary/5 text-primary'
                : 'border-border hover:border-primary/40'
              }`}
          >
            <input
              type="radio"
              name="meterSource"
              value={option.value}
              checked={meterSource === option.value}
              onChange={() => onChange(option.value)}
              className="hidden"
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}