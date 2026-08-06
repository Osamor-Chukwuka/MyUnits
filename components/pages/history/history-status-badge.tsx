'use client';

import { Badge } from '@/components/ui/badge';

type HistoryStatusBadgeProps = {
  label: string;
  status?: string | null;
};

function getStatusClasses(status?: string | null) {
  const normalizedStatus = status?.trim().toLowerCase();

  if (normalizedStatus === 'success' || normalizedStatus === 'delivered') {
    return 'border-emerald-600/25 bg-emerald-600/10 text-emerald-700';
  }

  if (normalizedStatus === 'requery_required' || normalizedStatus === 'pending' || normalizedStatus === 'processing') {
    return 'border-accent/45 bg-accent/20 text-primary';
  }

  if (normalizedStatus === 'reversed') {
    return 'border-[#d95f43]/35 bg-[#d95f43]/10 text-[#9b3f2d]';
  }

  if (normalizedStatus === 'failed') {
    return 'border-destructive/30 bg-destructive/10 text-destructive';
  }

  if (normalizedStatus === 'manual' || normalizedStatus === 'unsaved') {
    return 'border-accent/45 bg-accent/20 text-primary';
  }

  return 'border-border bg-white/45 text-foreground';
}

function getStatusText(label: string, status?: string | null) {
  const normalizedStatus = status?.trim().toLowerCase();

  if (!normalizedStatus) {
    return 'N/A';
  }

  if (normalizedStatus === 'requery_required') {
    return label.toLowerCase() === 'token' ? 'Get token' : 'Checking';
  }

  if (normalizedStatus === 'success') {
    return label.toLowerCase() === 'payment' ? 'Paid' : 'Ready';
  }

  if (normalizedStatus === 'delivered') {
    return 'Ready';
  }

  if (normalizedStatus === 'pending' || normalizedStatus === 'processing') {
    return 'Pending';
  }

  if (normalizedStatus === 'failed') {
    return 'Failed';
  }

  if (normalizedStatus === 'reversed') {
    return 'Reversed';
  }

  if (normalizedStatus === 'manual') {
    return 'Manual flow';
  }

  if (normalizedStatus === 'unsaved') {
    return 'Unsaved';
  }

  return normalizedStatus
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function HistoryStatusBadge({ label, status }: HistoryStatusBadgeProps) {
  return (
    <Badge variant="outline" className={`rounded-full px-3 py-1 font-semibold ${getStatusClasses(status)}`}>
      {label}: {getStatusText(label, status)}
    </Badge>
  );
}
