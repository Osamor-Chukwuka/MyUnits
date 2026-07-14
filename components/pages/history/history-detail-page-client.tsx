'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { ArrowLeft, AlertTriangle, RefreshCcw } from 'lucide-react';
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

type HistoryDetailPageClientProps = {
  historyDetail: TransactionHistoryDetail;
};

export default function HistoryDetailPageClient({ historyDetail }: HistoryDetailPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isDisputePending = false;

  const { transaction, meter, recharge, isManualFlow } = historyDetail;
  const canRecheck = transaction.vtpass_status === 'requery_required' && Boolean(transaction.vtpass_request_id);

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
      toast.error((error as Error).message || 'Failed to recheck this transaction.');
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
        <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/history" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to History
            </Link>
            <h1 className="mt-3 font-bold text-foreground text-3xl">Transaction Details</h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Review payment, VTpass, and recharge information for this transaction.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {canRecheck && (
              <Button onClick={handleRecheck} disabled={isPending} className="gap-2">
                <RefreshCcw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
                {isPending ? 'Rechecking...' : 'Re-check'}
              </Button>
            )}
            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              disabled={isDisputePending}
              onClick={() => void 0}
            >
              <AlertTriangle className="w-4 h-4" />
              Raise Dispute
            </Button>
          </div>
        </div>

        <div className="gap-6 grid md:grid-cols-3 mb-8">
          <Card className="p-6 border border-border">
            <p className="text-muted-foreground text-sm">Recharge Amount</p>
            <p className="mt-2 font-bold text-foreground text-3xl">{formatAmount(transaction.user_amount)}</p>
          </Card>
          <Card className="p-6 border border-border">
            <p className="text-muted-foreground text-sm">Total Paid</p>
            <p className="mt-2 font-bold text-foreground text-3xl">{formatAmount(transaction.total_amount)}</p>
          </Card>
          <Card className="p-6 border border-border">
            <p className="text-muted-foreground text-sm">Transaction Date</p>
            <p className="mt-2 font-semibold text-foreground text-base">{formatDateTime(transaction.created_at)}</p>
          </Card>
        </div>

        <div className="gap-6 grid lg:grid-cols-2">
          <Card className="p-6 border border-border">
            <h2 className="font-semibold text-foreground text-lg">Payment Status</h2>
            <div className="flex flex-wrap gap-2 mt-4">
              <HistoryStatusBadge label="Paystack" status={transaction.paystack_status} />
              <HistoryStatusBadge label="VTpass" status={transaction.vtpass_status} />
            </div>

            <div className="space-y-3 mt-6">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground text-sm">Paystack Reference</span>
                <span className="font-medium text-foreground text-sm text-right">{transaction.paystack_reference}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground text-sm">VTpass Request ID</span>
                <span className="font-medium text-foreground text-sm text-right">{transaction.vtpass_request_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground text-sm">Total Charges</span>
                <span className="font-medium text-foreground text-sm">{formatAmount(transaction.total_charges)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground text-sm">Paystack Charge</span>
                <span className="font-medium text-foreground text-sm">{formatAmount(transaction.paystack_charge)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground text-sm">Total Commission</span>
                <span className="font-medium text-foreground text-sm">{formatAmount(transaction.total_commission)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground text-sm">VTpass Commission</span>
                <span className="font-medium text-foreground text-sm">
                  {transaction.vtpass_commission == null ? 'N/A' : formatAmount(transaction.vtpass_commission)}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <h2 className="font-semibold text-foreground text-lg">Meter Details</h2>
            {meter ? (
              <div className="space-y-3 mt-6">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground text-sm">Meter Name</span>
                  <span className="font-medium text-foreground text-sm text-right">{meter.name}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground text-sm">Meter Number</span>
                  <span className="font-medium text-foreground text-sm text-right">{meter.meter_number}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground text-sm">Distribution Company</span>
                  <span className="font-medium text-foreground text-sm text-right">{meter.disco}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground text-sm">Meter Type</span>
                  <span className="font-medium text-foreground text-sm text-right capitalize">{meter.type}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground text-sm">Customer Name</span>
                  <span className="font-medium text-foreground text-sm text-right">{meter.customer_name || 'N/A'}</span>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <HistoryStatusBadge label="Flow" status={isManualFlow ? 'manual' : 'unsaved'} />
                <p className="text-muted-foreground text-sm">
                  {isManualFlow
                    ? 'This meter was not saved in the system. The payment was made through the manual flow.'
                    : 'This meter record is not available in the system right now.'}
                </p>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground text-sm">Meter Number</span>
                  <span className="font-medium text-foreground text-sm text-right">{transaction.meter_number || 'N/A'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground text-sm">Meter ID</span>
                  <span className="font-medium text-foreground text-sm text-right">{transaction.meter_id || 'N/A'}</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        <Card className="mt-6 p-6 border border-border">
          <h2 className="font-semibold text-foreground text-lg">Recharge Details</h2>
          {recharge ? (
            <div className="space-y-3 mt-6">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground text-sm">Recharge Saved</span>
                <span className="font-medium text-foreground text-sm text-right">{formatDateTime(recharge.created_at)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground text-sm">Units</span>
                <span className="font-medium text-foreground text-sm text-right">{recharge.units}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground text-sm">Token</span>
                <span className="font-medium text-foreground text-sm text-right break-all">{recharge.token}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground text-sm">Recharge Meter Number</span>
                <span className="font-medium text-foreground text-sm text-right">{recharge.meter_number || 'N/A'}</span>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-muted-foreground text-sm">
              {transaction.vtpass_status === 'requery_required'
                ? 'This recharge has not been confirmed yet. Use the Re-check button above to query the latest VTpass status.'
                : 'There is no recharge record linked to this transaction yet.'}
            </p>
          )}
        </Card>
      </main>
    </div>
  );
}
