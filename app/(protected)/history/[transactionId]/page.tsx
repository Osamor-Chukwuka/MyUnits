import { notFound } from 'next/navigation';
import { getTransactionHistoryDetail } from '@/app/actions/history-actions';
import HistoryDetailPageClient from '@/components/pages/history/history-detail-page-client';

type HistoryDetailPageProps = {
  params: Promise<{
    transactionId: string;
  }>;
};

export default async function HistoryDetailPage({ params }: HistoryDetailPageProps) {
  const { transactionId } = await params;
  const historyDetail = await getTransactionHistoryDetail(transactionId);

  if (!historyDetail) {
    notFound();
  }

  return <HistoryDetailPageClient historyDetail={historyDetail} />;
}
