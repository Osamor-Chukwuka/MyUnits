export const applianceSuggestions = [
  'Pressing iron',
  'Air conditioner',
  'Refrigerator',
  'Television',
  'Freezer',
  'Microwave',
  'Washing machine',
  'Electric kettle',
];

export const inputClasses =
  'min-h-12 rounded-2xl border-border/70 bg-background/75 px-4 text-base shadow-inner focus-visible:ring-primary/20 md:text-sm';

// Show enough precision for tiny per-minute values without making larger values noisy.
export function formatUnits(value: number) {
  if (value >= 10) return value.toFixed(2);
  if (value >= 1) return value.toFixed(3);
  if (value >= 0.01) return value.toFixed(4);
  return value.toFixed(6);
}

export function formatUsage(minutes: number) {
  // Convert long minute durations back to hours for friendlier result copy.
  if (minutes >= 60) {
    const hours = minutes / 60;
    return `${formatUnits(hours)} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  return `${formatUnits(minutes)} ${minutes === 1 ? 'minute' : 'minutes'}`;
}
