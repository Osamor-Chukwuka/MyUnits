import { getMonthlyAnalytics, getRecharges, getTotalRecharged } from '@/app/actions/meter-actions';
import MeterDetailPageClient from '@/components/pages/meter/meter-page-client';
import { supabaseServer } from '@/lib/supabase/server';

export default async function MeterDetailPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ page?: string }> }) {
  const { id } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  const supabase = await supabaseServer();
  const { data: meterDetails, error } = await supabase
    .from('meters')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);

  const [totalRecharged, [monthlyAnalytics, lastRecharge], rechargeData] = await Promise.all([
    getTotalRecharged(id),
    getMonthlyAnalytics(id),
    getRecharges(id, currentPage),
  ]);

  return (
    <MeterDetailPageClient
      meterDetails={meterDetails}
      totalRecharged={totalRecharged}
      monthlyAnalytics={monthlyAnalytics}
      lastRecharge={lastRecharge}
      recharges={rechargeData.recharges}
      currentPage={rechargeData.currentPage}
      totalPages={rechargeData.totalPages}
    />
  );
}
