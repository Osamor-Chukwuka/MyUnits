'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Zap, ChevronLeft, ChevronRight, Calendar, Check, Zap as ZapIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { MeterInterface } from '@/types/meter-types';
import { formatDate } from '@/lib/utils';

interface TotalRecharged {
    totalAmount: number;
    totalCount: number;
}

interface RechargeRecord {
    id: string;
    meter_id: string;
    amount: string;
    units: string;
    token: string;
    created_at: string;
    [key: string]: unknown;
}

interface RechargeMonthOption {
    value: string;
    label: string;
}


export default function MeterDetailPageClient({ meterDetails, totalRecharged, monthlyAnalytics, lastRecharge, recharges, monthOptions, selectedPeriod, fromDate, toDate, currentPage, totalPages }: { meterDetails: MeterInterface, totalRecharged: TotalRecharged, monthlyAnalytics: Record<string, number>, lastRecharge: Record<string, string>, recharges: RechargeRecord[], monthOptions: RechargeMonthOption[], selectedPeriod: string, fromDate?: string, toDate?: string, currentPage: number, totalPages: number }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [period, setPeriod] = useState(selectedPeriod || 'all');
    const [customFrom, setCustomFrom] = useState(fromDate ?? '');
    const [customTo, setCustomTo] = useState(toDate ?? '');
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
    const copiedResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setPeriod(selectedPeriod || 'all');
        setCustomFrom(fromDate ?? '');
        setCustomTo(toDate ?? '');
    }, [selectedPeriod, fromDate, toDate]);

    useEffect(() => {
        setIsTableLoading(false);
    }, [recharges, currentPage, selectedPeriod, fromDate, toDate]);

    useEffect(() => {
        return () => {
            if (copiedResetTimeoutRef.current) {
                clearTimeout(copiedResetTimeoutRef.current);
            }
        };
    }, []);

    const quickFilters = [
        { value: 'all', label: 'All Time' },
        { value: 'this-month', label: 'This Month' },
        { value: 'last-3-months', label: 'Last 3 Months' },
        { value: 'this-year', label: 'This Year' },
        { value: 'custom', label: 'Custom Range' },
    ];

    const filters = useMemo(() => [...quickFilters, ...monthOptions], [monthOptions]);

    const navigateToHistory = (href: string) => {
        setIsTableLoading(true);
        startTransition(() => {
            router.push(href);
        });
    };

    const pushWithParams = (params: URLSearchParams) => {
        const query = params.toString();
        navigateToHistory(query ? `${pathname}?${query}#recharge-history` : `${pathname}#recharge-history`);
    };

    const handlePeriodChange = (value: string) => {
        setPeriod(value);

        const params = new URLSearchParams(searchParams.toString());
        params.delete('page');

        if (value === 'all') {
            params.delete('period');
            params.delete('from');
            params.delete('to');
            pushWithParams(params);
            return;
        }

        params.set('period', value);

        if (value !== 'custom') {
            params.delete('from');
            params.delete('to');
            pushWithParams(params);
        }
    };

    const applyCustomRange = () => {
        if (!customFrom || !customTo) {
            return;
        }

        const params = new URLSearchParams(searchParams.toString());
        params.set('period', 'custom');
        params.set('from', customFrom);
        params.set('to', customTo);
        params.delete('page');
        pushWithParams(params);
    };

    const buildPageHref = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(page));
        const query = params.toString();
        return query ? `?${query}#recharge-history` : '#recharge-history';
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) {
            return;
        }

        navigateToHistory(`${pathname}${buildPageHref(page)}`);
    };

    const handleCopyToken = async (token: string, rechargeId: string) => {
        try {
            await navigator.clipboard.writeText(token);
            setCopiedTokenId(rechargeId);

            if (copiedResetTimeoutRef.current) {
                clearTimeout(copiedResetTimeoutRef.current);
            }

            copiedResetTimeoutRef.current = setTimeout(() => {
                setCopiedTokenId((currentValue) => (currentValue === rechargeId ? null : currentValue));
            }, 2000);
        } catch {
            setCopiedTokenId(null);
        }
    };

    const tableIsLoading = isTableLoading || isPending;

    return (
        <div className="bg-background min-h-screen">

            <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
                {/* Quick Stats at Top */}
                <div className="gap-6 grid md:grid-cols-3 mb-8">
                    <Card className="p-6 border border-border">
                        <p className="mb-2 text-muted-foreground text-sm">Meter Name</p>
                        <p className="flex flex-col items-start font-bold text-foreground text-2xl"><span>{meterDetails.name}</span> <span className='text-muted-foreground text-sm'>({meterDetails.type})</span></p>
                        {/* <p className="mt-2 text-muted-foreground text-base">{meterData.type}</p> */}
                    </Card>
                    <Card className="bg-linear-to-br from-primary/5 to-primary/10 p-6 border border-border">
                        <p className="mb-2 text-muted-foreground text-sm">Total Recharged</p>
                        <p className="font-bold text-foreground text-3xl">₦{totalRecharged.totalAmount.toLocaleString()}</p>
                    </Card>

                    <Card className="bg-linear-to-br from-accent/5 to-accent/10 p-6 border border-border">
                        <p className="mb-2 text-muted-foreground text-sm">Total Recharges</p>
                        <p className="font-bold text-foreground text-3xl">{totalRecharged.totalCount}</p>
                    </Card>
                </div>

                {/* Monthly & Quick Stats */}
                <div className="gap-6 grid md:grid-cols-2 mb-8">
                    <Card className="p-6 border border-border">
                        <h3 className="flex items-center gap-2 mb-4 font-semibold text-foreground">
                            <Calendar className="w-5 h-5 text-primary" />
                            Monthly Analytics
                        </h3>
                        <div className="space-y-3 max-h-58 overflow-y-auto custom-scrollbar">
                            {Object.keys(monthlyAnalytics).length > 0 ? (
                                Object.entries(monthlyAnalytics).map(([month, amount]) => (
                                    <div key={month} className="flex justify-between items-center py-2 border-border border-b">
                                        <span className="text-muted-foreground">{month}</span>
                                        <span className="font-semibold text-foreground">₦{amount.toLocaleString()}</span>
                                    </div>
                                ))
                            ) :
                                <div className="flex justify-between items-center py-2 border-border border-b">
                                    <span className="w-full text-muted-foreground text-center">No data available</span>
                                </div>
                            }
                        </div>
                    </Card>

                    <Card className="p-6 border border-border">
                        <h3 className="flex items-center gap-2 mb-4 font-semibold text-foreground">
                            <Zap className="w-5 h-5 text-primary" />
                            Quick Stats
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-border border-b">
                                <span className="text-muted-foreground">Average Recharge</span>
                                <span className="font-semibold text-foreground">{totalRecharged.totalCount > 0 ? `₦${Math.round(totalRecharged.totalAmount / totalRecharged.totalCount).toLocaleString()}` : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-border border-b">
                                <span className="text-muted-foreground">Last Recharge Date</span>
                                <span className="font-semibold text-foreground">{lastRecharge ? formatDate(lastRecharge.created_at) : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-muted-foreground">Last Recharge Amount</span>
                                <span className="font-semibold text-foreground">{lastRecharge ? `₦${Number(lastRecharge.amount).toLocaleString()}` : 'N/A'}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Recharge History Section */}
                <div id="recharge-history" className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="font-bold text-foreground text-2xl">Recharge History</h2>
                        <p className="mt-1 text-muted-foreground text-sm">
                            View all your recharges and tokens
                            {tableIsLoading && (
                                <span className="inline-flex items-center gap-1 ml-2 text-primary">
                                    <Spinner className="size-3" />
                                    Loading...
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={period}
                            onChange={(e) => handlePeriodChange(e.target.value)}
                            disabled={tableIsLoading}
                            className="bg-background px-4 py-2 border border-border rounded-md text-foreground text-sm"
                        >
                            {filters.map((filter) => (
                                <option key={filter.value} value={filter.value}>
                                    {filter.label}
                                </option>
                            ))}
                        </select>
                        <Button className="gap-2">
                            <Zap className="w-4 h-4" />
                            Recharge Meter
                        </Button>
                    </div>
                </div>

                {period === 'custom' && (
                    <Card className="mb-6 p-4 border border-border">
                        <div className="flex sm:flex-row flex-col items-end gap-3">
                            <div className="w-full sm:w-auto">
                                <label htmlFor="from-date" className="block mb-1 text-muted-foreground text-xs">From</label>
                                <input
                                    id="from-date"
                                    type="date"
                                    value={customFrom}
                                    onChange={(e) => setCustomFrom(e.target.value)}
                                    className="bg-background px-3 py-2 border border-border rounded-md w-full text-foreground text-sm"
                                />
                            </div>
                            <div className="w-full sm:w-auto">
                                <label htmlFor="to-date" className="block mb-1 text-muted-foreground text-xs">To</label>
                                <input
                                    id="to-date"
                                    type="date"
                                    value={customTo}
                                    onChange={(e) => setCustomTo(e.target.value)}
                                    className="bg-background px-3 py-2 border border-border rounded-md w-full text-foreground text-sm"
                                />
                            </div>
                            <Button onClick={applyCustomRange} disabled={!customFrom || !customTo || customFrom > customTo || tableIsLoading}>
                                Apply
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Recharge History Table at Bottom */}
                <Card className="border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary/50 border-border border-b">
                                <tr>
                                    <th className="px-6 py-3 font-semibold text-foreground text-xs text-left uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 font-semibold text-foreground text-xs text-left uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 font-semibold text-foreground text-xs text-left uppercase tracking-wider">
                                        Units
                                    </th>
                                    <th className="px-6 py-3 font-semibold text-foreground text-xs text-left uppercase tracking-wider">
                                        Token
                                    </th>
                                    <th className="px-6 py-3 font-semibold text-foreground text-xs text-right uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {tableIsLoading ? Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={`loading-row-${index}`}>
                                        <td className="px-6 py-4">
                                            <Skeleton className="w-28 h-4" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <Skeleton className="w-24 h-4" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <Skeleton className="w-20 h-4" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <Skeleton className="w-40 h-4" />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Skeleton className="ml-auto w-24 h-8" />
                                        </td>
                                    </tr>
                                )) : recharges.length > 0 ? recharges.map((recharge) => (
                                    <tr key={recharge.id} className="hover:bg-secondary/30 transition-colors">
                                        <td className="px-6 py-4 text-foreground text-sm">
                                            {formatDate(recharge.created_at)}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-foreground text-sm">
                                            ₦{Number(recharge.amount).toLocaleString()}
                                        </td>
                                        <td className="flex items-center gap-2 px-6 py-4 text-foreground text-sm">
                                            <ZapIcon className="w-4 h-4 text-primary" />
                                            {recharge.units}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-muted-foreground text-sm">{recharge.token}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCopyToken(recharge.token, recharge.id)}
                                                className={copiedTokenId === recharge.id ? 'border-green-600/40 bg-green-600/10 text-green-700 hover:bg-green-600/10 hover:text-green-700' : ''}
                                            >
                                                {copiedTokenId === recharge.id ? (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        Copied
                                                    </>
                                                ) : (
                                                    'Copy Token'
                                                )}
                                            </Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-muted-foreground text-sm text-center">
                                            No recharge history for this filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage <= 1 || tableIsLoading}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </Button>
                        <span className="text-muted-foreground text-sm">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage >= totalPages || tableIsLoading}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
