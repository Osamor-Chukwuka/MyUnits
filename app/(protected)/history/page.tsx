import { getTransactionHistory } from '@/app/actions/history-actions';
import HistoryPageClient from '@/components/pages/history/history-page-client';

export default async function HistoryPage() {
  const transactions = await getTransactionHistory();

  return <HistoryPageClient transactions={transactions} />;
}
