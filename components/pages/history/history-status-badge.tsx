'use client';

import { Badge } from '@/components/ui/badge';

type HistoryStatusBadgeProps = {
  label: string;
  status?: string | null;
};

function getStatusClasses(status?: string | null) {
  const normalizedStatus = status?.trim().toLowerCase();

  if (normalizedStatus === 'success' || normalizedStatus === 'delivered') {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700';
  }

  if (normalizedStatus === 'requery_required' || normalizedStatus === 'pending' || normalizedStatus === 'processing') {
    return 'border-sky-500/30 bg-sky-500/10 text-sky-700';
  }

  if (normalizedStatus === 'reversed') {
    return 'border-orange-500/30 bg-orange-500/10 text-orange-700';
  }

  if (normalizedStatus === 'failed') {
    return 'border-destructive/30 bg-destructive/10 text-destructive';
  }

  if (normalizedStatus === 'manual' || normalizedStatus === 'unsaved') {
    return 'border-amber-500/30 bg-amber-500/10 text-amber-700';
  }

  return 'border-border bg-secondary/40 text-foreground';
}

export default function HistoryStatusBadge({ label, status }: HistoryStatusBadgeProps) {
  return (
    <Badge variant="outline" className={getStatusClasses(status)}>
      {label}: {status ?? 'N/A'}
    </Badge>
  );
}
