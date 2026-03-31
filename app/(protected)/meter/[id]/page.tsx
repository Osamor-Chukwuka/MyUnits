import { getMonthlyAnalytics, getRechargeMonthOptions, getRecharges, getTotalRecharged } from '@/app/actions/meter-actions';
import MeterDetailPageClient from '@/components/pages/meter/meter-page-client';
import { supabaseServer } from '@/lib/supabase/server';

export default async function MeterDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; period?: string; from?: string; to?: string }>;
}) {
  const { id } = await params;
  const { page, period = 'all', from, to } = await searchParams;
  const selectedPeriod = period as NonNullable<Parameters<typeof getRecharges>[1]>['period'];
  const currentPage = Number(page) || 1;

  const supabase = await supabaseServer();
  const { data: meterDetails, error } = await supabase
    .from('meters')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);

  const [totalRecharged, [monthlyAnalytics, lastRecharge], monthOptions, rechargeData] = await Promise.all([
    getTotalRecharged(id),
    getMonthlyAnalytics(id),
    getRechargeMonthOptions(id),
    getRecharges(id, {
      page: currentPage,
      period: selectedPeriod,
      from,
      to,
    }),
  ]);

  return (
    <MeterDetailPageClient
      meterDetails={meterDetails}
      totalRecharged={totalRecharged}
      monthlyAnalytics={monthlyAnalytics}
      lastRecharge={lastRecharge}
      recharges={rechargeData.recharges}
      monthOptions={monthOptions}
      selectedPeriod={selectedPeriod ?? 'all'}
      fromDate={from}
      toDate={to}
      currentPage={rechargeData.currentPage}
      totalPages={rechargeData.totalPages}
    />
  );
}
