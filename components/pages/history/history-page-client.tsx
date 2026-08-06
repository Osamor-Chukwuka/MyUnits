'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CalendarDays, ReceiptText, SlidersHorizontal, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import HistoryStatusBadge from './history-status-badge';
import { formatDateTime } from '@/lib/utils';
import { TransactionHistoryItem } from '@/types/history-types';

const filterControlClasses =
  'h-12 rounded-2xl border border-border/70 bg-background/80 px-4 text-sm font-medium text-foreground shadow-inner outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10';

function formatAmount(value: number | string) {
  return `NGN ${Number(value).toLocaleString()}`;
}

function getMeterRecord(transaction: TransactionHistoryItem) {
  if (Array.isArray(transaction.meter)) {
    return transaction.meter[0] ?? null;
  }

  return transaction.meter ?? null;
}

function getMeterName(transaction: TransactionHistoryItem) {
  return getMeterRecord(transaction)?.name?.trim() ?? '';
}

function getDisplayMeterName(transaction: TransactionHistoryItem) {
  const meterName = getMeterName(transaction);

  if (meterName) {
    return meterName;
  }

  if (!transaction.meter_id) {
    return '-';
  }

  return transaction.meter_number ? `Meter ${transaction.meter_number}` : 'Unnamed meter';
}

function getMeterFilterValue(transaction: TransactionHistoryItem) {
  const meterName = getMeterName(transaction);

  if (meterName) {
    return `meter:${meterName}`;
  }

  if (!transaction.meter_id) {
    return 'flow:manual';
  }

  return `number:${transaction.meter_number ?? transaction.meter_id}`;
}

function getStartOfDay(dateValue: string) {
  return new Date(`${dateValue}T00:00:00`);
}

function getEndOfDay(dateValue: string) {
  return new Date(`${dateValue}T23:59:59`);
}

function formatStatementDate(value?: string | null) {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

type HistoryPageClientProps = {
  transactions: TransactionHistoryItem[];
};

export default function HistoryPageClient({ transactions }: HistoryPageClientProps) {
  const [selectedMeter, setSelectedMeter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const meterOptions = useMemo(() => {
    const options = new Map<string, string>();

    transactions.forEach((transaction) => {
      const filterValue = getMeterFilterValue(transaction);
      const label = !transaction.meter_id ? 'Manual flow' : getDisplayMeterName(transaction);

      options.set(filterValue, label);
    });

    return Array.from(options, ([value, label]) => ({ value, label })).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const startDate = fromDate ? getStartOfDay(fromDate) : null;
    const endDate = toDate ? getEndOfDay(toDate) : null;

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.created_at);
      const matchesMeter = selectedMeter === 'all' || getMeterFilterValue(transaction) === selectedMeter;
      const matchesStartDate = !startDate || transactionDate >= startDate;
      const matchesEndDate = !endDate || transactionDate <= endDate;

      return matchesMeter && matchesStartDate && matchesEndDate;
    });
  }, [fromDate, selectedMeter, toDate, transactions]);

  const hasActiveFilters = selectedMeter !== 'all' || Boolean(fromDate) || Boolean(toDate);

  function clearFilters() {
    setSelectedMeter('all');
    setFromDate('');
    setToDate('');
  }

  return (
    <div className="min-h-screen">
      <main className="app-container max-w-6xl">
        <section className="app-hero-panel mb-8">
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Records</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Payment History</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-primary-foreground/70 sm:text-base">
              Receipts, token updates, and meter activity in one place.
            </p>
          </div>
        </section>

        {transactions.length === 0 ? (
          <Card className="border-dashed p-10 text-center">
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-accent/40 text-primary">
              <ReceiptText className="size-6" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">No transactions yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Your payment history will appear here after your first payment.</p>
          </Card>
        ) : (
          <>
            <Card className="mb-5 overflow-hidden border-primary/10 bg-card/75 p-4 shadow-[0_20px_60px_rgba(18,26,24,0.08)] backdrop-blur-xl">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <div className="flex items-start gap-3 lg:max-w-xs">
                  <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent/35 text-primary">
                    <SlidersHorizontal className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Find a payment faster</p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      Filter by meter or date without digging through every receipt.
                    </p>
                  </div>
                </div>

                <div className="grid flex-1 gap-3 sm:grid-cols-3">
                  <label className="grid gap-2 text-sm font-semibold text-foreground" htmlFor="history-meter-filter">
                    Meter
                    <select
                      id="history-meter-filter"
                      className={filterControlClasses}
                      value={selectedMeter}
                      onChange={(event) => setSelectedMeter(event.target.value)}
                    >
                      <option value="all">All meters</option>
                      {meterOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-foreground" htmlFor="history-from-filter">
                    From
                    <input
                      id="history-from-filter"
                      className={filterControlClasses}
                      type="date"
                      value={fromDate}
                      onChange={(event) => setFromDate(event.target.value)}
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-foreground" htmlFor="history-to-filter">
                    To
                    <input
                      id="history-to-filter"
                      className={filterControlClasses}
                      type="date"
                      value={toDate}
                      onChange={(event) => setToDate(event.target.value)}
                    />
                  </label>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-background/80 px-4 text-sm font-bold text-foreground transition hover:border-primary/30 hover:bg-accent/20 focus:outline-none focus:ring-4 focus:ring-primary/10"
                    onClick={clearFilters}
                  >
                    <X className="size-4" aria-hidden="true" />
                    Clear
                  </button>
                )}
              </div>
            </Card>

            {filteredTransactions.length === 0 ? (
              <Card className="border-dashed p-10 text-center">
                <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-accent/40 text-primary">
                  <CalendarDays className="size-6" aria-hidden="true" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">No matching payments</h2>
                <p className="mt-2 text-sm text-muted-foreground">Try changing the meter or date filter.</p>
              </Card>
            ) : (
              <Card className="overflow-hidden border-primary/10 bg-card/80 p-0 shadow-[0_22px_70px_rgba(18,26,24,0.08)] backdrop-blur-xl">
                <div className="hidden grid-cols-[96px_minmax(0,1fr)_180px_240px] gap-4 border-b border-border/70 bg-muted/25 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground lg:grid">
                  <span>Date</span>
                  <span>Meter</span>
                  <span className="text-right">Amount</span>
                  <span className="text-right">Status</span>
                </div>

                <div className="divide-y divide-border/70">
                  {filteredTransactions.map((transaction) => {
                    const displayMeterName = getDisplayMeterName(transaction);
                    const isManualFlow = !getMeterName(transaction) && !transaction.meter_id;

                    return (
                      <Link
                        key={transaction.id}
                        href={`/history/${transaction.id}`}
                        className="group grid gap-4 px-4 py-4 transition hover:bg-accent/10 focus:outline-none focus:ring-4 focus:ring-primary/10 sm:px-5 lg:grid-cols-[96px_minmax(0,1fr)_180px_240px] lg:items-center"
                      >
                        <div className="hidden text-sm font-bold tabular-nums text-muted-foreground lg:block">
                          {formatStatementDate(transaction.created_at)}
                        </div>

                        <div className="flex min-w-0 gap-3">
                          <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                            <ReceiptText className="size-4" aria-hidden="true" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="min-w-0 text-base font-bold tracking-tight text-foreground sm:text-lg">
                                {displayMeterName}
                              </p>
                              {isManualFlow && (
                                <span className="rounded-full border border-accent/45 bg-accent/20 px-3 py-1 text-xs font-bold text-primary">
                                  Manual flow
                                </span>
                              )}
                            </div>

                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <span>Meter: {transaction.meter_number || 'N/A'}</span>
                              <span className="lg:hidden">{formatDateTime(transaction.created_at)}</span>
                              <span className="hidden lg:inline">{formatDateTime(transaction.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 lg:block lg:text-right">
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground lg:hidden">
                            Amount
                          </span>
                          <p className="text-base font-bold tabular-nums text-foreground sm:text-lg">
                            {formatAmount(transaction.user_amount)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          <HistoryStatusBadge label="Payment" status={transaction.paystack_status} />
                          <HistoryStatusBadge label="Token" status={transaction.vtpass_status} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
