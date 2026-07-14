'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import HistoryStatusBadge from './history-status-badge';
import { formatDateTime } from '@/lib/utils';
import { TransactionHistoryItem } from '@/types/history-types';

function formatAmount(value: number | string) {
  return `NGN ${Number(value).toLocaleString()}`;
}

type HistoryPageClientProps = {
  transactions: TransactionHistoryItem[];
};

export default function HistoryPageClient({ transactions }: HistoryPageClientProps) {
  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="font-bold text-foreground text-3xl">Payment History</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            View every payment attempt, recharge status, and transaction detail in one place.
          </p>
        </div>

        {transactions.length === 0 ? (
          <Card className="p-10 border border-border border-dashed text-center">
            <h2 className="font-semibold text-foreground text-lg">No transactions yet</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Your payment history will appear here after your first recharge attempt.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <Link key={transaction.id} href={`/history/${transaction.id}`} className="block">
                <Card className="border border-border hover:border-primary/30 p-5 transition-colors">
                  <div className="flex md:flex-row flex-col justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground text-lg">
                          {formatAmount(transaction.user_amount)}
                        </p>
                        {!transaction.meter_id && (
                          <HistoryStatusBadge label="Flow" status="manual" />
                        )}
                      </div>
                      <p className="mt-1 text-muted-foreground text-sm">
                        Meter Number: {transaction.meter_number || 'N/A'}
                      </p>
                      <p className="mt-1 text-muted-foreground text-sm">
                        {formatDateTime(transaction.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-start gap-2">
                      <HistoryStatusBadge label="Paystack" status={transaction.paystack_status} />
                      <HistoryStatusBadge label="VTpass" status={transaction.vtpass_status} />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
