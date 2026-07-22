import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import { getUserSearchHistory } from '@/lib/db/queries';
import { HistoryClient } from './HistoryClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Search History | Dashboard' };

export default async function HistoryPage() {
  const session = await getSession();
  if (!session) redirect('/sign-in?callbackUrl=/dashboard/history');

  const history = await getUserSearchHistory(session.userId, 1, 50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search History</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {history.length} saved {history.length === 1 ? 'search' : 'searches'}
        </p>
      </div>
      <HistoryClient initialHistory={history} />
    </div>
  );
}
