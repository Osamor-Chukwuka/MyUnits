'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useTransition } from 'react';
import { AlertTriangle, CalendarDays, Gauge, ReceiptText, RefreshCcw, ShieldCheck, WalletCards, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import HistoryStatusBadge from './history-status-badge';
import { formatDateTime } from '@/lib/utils';
import { recheckTransactionAction } from '@/app/actions/history-actions';
import { TransactionHistoryDetail } from '@/types/history-types';

function formatAmount(value: number | string) {
  return `NGN ${Number(value).toLocaleString()}`;
}

type DetailRowProps = {
  label: string;
  value: string;
  breakValue?: boolean;
};

function DetailRow({ label, value, breakValue }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-3 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-right text-sm font-semibold text-foreground ${breakValue ? 'break-all' : ''}`}>
        {value}
      </span>
    </div>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon: ReactNode;
  featured?: boolean;
};

function SummaryCard({ label, value, helper, icon, featured }: SummaryCardProps) {
  return (
    <Card
      className={`relative overflow-hidden p-6 shadow-[0_22px_70px_rgba(18,26,24,0.08)] backdrop-blur-xl ${
        featured ? 'border-primary/25 bg-card/95 text-foreground ring-1 ring-primary/10' : 'border-primary/10 bg-card/80'
      }`}
    >
      <div
        className={`absolute -right-8 -top-10 size-28 rounded-full blur-2xl ${
          featured ? 'bg-accent/15' : 'bg-accent/25'
        }`}
        aria-hidden="true"
      />
      {featured && <div className="absolute inset-y-5 left-0 w-1.5 rounded-r-full bg-primary" aria-hidden="true" />}
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className={`text-sm font-semibold ${featured ? 'text-primary' : 'text-muted-foreground'}`}>
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {helper && (
            <p className={`mt-3 text-sm ${featured ? 'font-semibold text-muted-foreground' : 'text-muted-foreground'}`}>
              {helper}
            </p>
          )}
        </div>
        <div
          className={`grid size-12 shrink-0 place-items-center rounded-2xl ${
            featured ? 'bg-primary/10 text-primary' : 'bg-accent/35 text-primary'
          }`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

type SectionPanelProps = {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
};

function SectionPanel({ title, description, icon, children }: SectionPanelProps) {
  return (
    <Card className="relative overflow-hidden border-primary/10 bg-card/80 p-6 shadow-[0_22px_70px_rgba(18,26,24,0.08)] backdrop-blur-xl">
      <div className="absolute -right-12 top-0 size-32 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
      <div className="relative z-10">
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </Card>
  );
}

type HistoryDetailPageClientProps = {
  historyDetail: TransactionHistoryDetail;
};

export default function HistoryDetailPageClient({ historyDetail }: HistoryDetailPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isDisputePending = false;

  const { transaction, meter, recharge, isManualFlow } = historyDetail;
  const canRecheck = transaction.vtpass_status === 'requery_required' && Boolean(transaction.vtpass_request_id);
  const totalCharges = Number(transaction.total_charges);
  const totalChargesText = Number.isNaN(totalCharges) ? formatAmount(transaction.total_charges) : formatAmount(totalCharges);
  const meterDisplayName = meter?.name || (isManualFlow ? 'Manual flow' : 'Meter payment');

  const handleRecheck = async () => {
    if (!canRecheck) {
      return;
    }

    try {
      const result = await recheckTransactionAction(transaction.id);
      if (result.status === 'success') {
        toast.success(result.message);
      } else if (result.status === 'requery_required') {
        toast.info(result.message);
      } else {
        toast.error(result.message);
      }

      if (result.status === 'success') {
        startTransition(() => {
          router.refresh();
        });
        return;
      }

      if (result.status !== 'requery_required') {
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (error) {
      toast.error((error as Error).message || 'Failed to get this token.');
    }
  };

  return (
    <div className="min-h-screen">
      <main className="app-container max-w-5xl">
        <section className="app-hero-panel mb-8 overflow-hidden">
          <div className="relative z-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Receipt</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Payment Details</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-primary-foreground/70 sm:text-base">
                {meterDisplayName} payment, token information, and receipt summary in one place.
              </p>
            </div>
          </div>
        </section>

        <div className="mb-8 flex flex-wrap justify-end gap-2">
          {canRecheck && (
            <Button onClick={handleRecheck} disabled={isPending} className="gap-2">
              <RefreshCcw className={`size-4 ${isPending ? 'animate-spin' : ''}`} aria-hidden="true" />
              {isPending ? 'Getting token...' : 'Get token'}
            </Button>
          )}
          <Button
            variant="outline"
            className="gap-2 bg-card/80"
            disabled={isDisputePending}
            onClick={() => void 0}
          >
            <AlertTriangle className="size-4" aria-hidden="true" />
            Get help
          </Button>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <SummaryCard
            label="Recharge amount"
            value={formatAmount(transaction.user_amount)}
            helper="Amount sent to the meter"
            icon={<WalletCards className="size-5" aria-hidden="true" />}
          />
          <SummaryCard
            label="Total paid (includes charges)"
            value={formatAmount(transaction.total_amount)}
            helper={`+ ${totalChargesText} charges`}
            icon={<ReceiptText className="size-5" aria-hidden="true" />}
            featured
          />
          <SummaryCard
            label="Transaction date"
            value={formatDateTime(transaction.created_at)}
            helper="Saved in your history"
            icon={<CalendarDays className="size-5" aria-hidden="true" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionPanel
            title="Payment status"
            description="A simple view of where the payment and token currently stand."
            icon={<ShieldCheck className="size-5" aria-hidden="true" />}
          >
            <div className="flex flex-wrap gap-2">
              <HistoryStatusBadge label="Payment" status={transaction.paystack_status} />
              <HistoryStatusBadge label="Token" status={transaction.vtpass_status} />
            </div>

            <div className="mt-6 rounded-3xl border border-border/70 bg-background/55 px-4">
              <DetailRow label="Payment reference" value={transaction.paystack_reference} breakValue />
              <DetailRow label="Token reference" value={transaction.vtpass_request_id || 'N/A'} breakValue />
              <DetailRow label="Total charges" value={totalChargesText} />
            </div>
          </SectionPanel>

          <SectionPanel
            title="Meter details"
            description="The meter connected to this payment."
            icon={<Gauge className="size-5" aria-hidden="true" />}
          >
            {meter ? (
              <div className="rounded-3xl border border-border/70 bg-background/55 px-4">
                <DetailRow label="Meter name" value={meter.name} />
                <DetailRow label="Meter number" value={meter.meter_number} />
                <DetailRow label="Service area" value={meter.disco} />
                <DetailRow label="Meter type" value={meter.type} />
                <DetailRow label="Customer name" value={meter.customer_name || 'N/A'} />
              </div>
            ) : (
              <div className="space-y-4">
                <HistoryStatusBadge label="Flow" status={isManualFlow ? 'manual' : 'unsaved'} />
                <p className="rounded-3xl border border-border/70 bg-background/55 p-4 text-sm leading-6 text-muted-foreground">
                  {isManualFlow
                    ? 'This payment was made without saving the meter first.'
                    : 'This meter record is not available right now.'}
                </p>
                <div className="rounded-3xl border border-border/70 bg-background/55 px-4">
                  <DetailRow label="Meter number" value={transaction.meter_number || 'N/A'} />
                </div>
              </div>
            )}
          </SectionPanel>
        </div>

        <div className="mt-6">
          <SectionPanel
            title="Token details"
            description="Token and unit information for this recharge."
            icon={<Zap className="size-5" aria-hidden="true" />}
          >
            {recharge ? (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_1.2fr]">
                <div className="rounded-3xl border border-border/70 bg-background/55 px-4">
                  <DetailRow label="Saved on" value={formatDateTime(recharge.created_at)} />
                  <DetailRow label="Units" value={recharge.units} />
                  <DetailRow label="Meter number" value={recharge.meter_number || 'N/A'} />
                </div>
                <div className="rounded-3xl border border-primary/15 bg-primary/5 p-5">
                  <p className="text-sm font-semibold text-muted-foreground">Token</p>
                  <p className="mt-3 break-all text-2xl font-bold leading-relaxed tracking-wide text-foreground">
                    {recharge.token}
                  </p>
                </div>
              </div>
            ) : (
              <p className="rounded-3xl border border-border/70 bg-background/55 p-5 text-sm leading-6 text-muted-foreground">
                {transaction.vtpass_status === 'requery_required'
                  ? 'This token is still being confirmed. Use Get token above to check again.'
                  : 'There is no token saved for this payment yet.'}
              </p>
            )}
          </SectionPanel>
        </div>
      </main>
    </div>
  );
}
