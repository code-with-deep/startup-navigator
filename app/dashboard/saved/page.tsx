import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import { getSavedArticles } from '@/lib/db/queries';
import { SavedArticlesClient } from './SavedArticlesClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Saved Articles | Dashboard' };

export default async function SavedPage() {
  const session = await getSession();
  if (!session) redirect('/sign-in?callbackUrl=/dashboard/saved');

  const saved = await getSavedArticles(session.userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Saved Articles</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {saved.length} {saved.length === 1 ? 'article' : 'articles'} saved
        </p>
      </div>
      <SavedArticlesClient initialSaved={saved} />
    </div>
  );
}
