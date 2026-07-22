import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Sparkles, Bookmark, History, ArrowRight, Search, Clock } from 'lucide-react';
import { getSession } from '@/lib/auth/session';
import { getSavedArticles, getUserSearchHistory } from '@/lib/db/queries';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from '@/lib/utils/date';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/sign-in?callbackUrl=/dashboard');

  const [savedResult, historyResult] = await Promise.allSettled([
    getSavedArticles(session.userId),
    getUserSearchHistory(session.userId, 1, 5),
  ]);
  const saved = savedResult.status === 'fulfilled' ? savedResult.value : [];
  const history = historyResult.status === 'fulfilled' ? historyResult.value : [];

  const stats = [
    {
      label: 'Saved Articles',
      value: saved.length,
      icon: Bookmark,
      href: '/dashboard/saved',
      color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950',
    },
    {
      label: 'Searches Made',
      value: history.length > 0 ? '5+' : '0',
      icon: Search,
      href: '/dashboard/history',
      color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-950',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back{session.role === 'admin' ? '' : ''}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's what's happening with your account
          </p>
        </div>
        {session.role === 'admin' && (
          <Link href="/admin">
            <Badge variant="secondary" className="cursor-pointer hover:bg-muted">
              Admin Panel →
            </Badge>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className={`size-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick AI Search */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Ask AI anything</p>
              <p className="text-xs text-muted-foreground">
                Get instant answers from the knowledge base
              </p>
            </div>
          </div>
          <Link
            href="/ai-search"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
          >
            Search <ArrowRight className="size-3.5" />
          </Link>
        </CardContent>
      </Card>

      {/* Recent Searches */}
      {history.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <History className="size-4" /> Recent Searches
            </h2>
            <Link href="/dashboard/history" className="text-xs text-primary hover:underline">
              View all →
            </Link>
          </div>
          <Card>
            <CardContent className="divide-y divide-border pt-0 pb-0">
              {history.map((search) => (
                <div key={search.id} className="flex items-start gap-3 py-3">
                  <Search className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{search.query}</p>
                    {search.response && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {search.response.slice(0, 100)}…
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDistanceToNow(search.createdAt)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Saved Articles Preview */}
      {saved.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Bookmark className="size-4" /> Saved Articles
            </h2>
            <Link href="/dashboard/saved" className="text-xs text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {saved.slice(0, 4).map((s) => (
              <Link
                key={s.articleId}
                href={`/articles/${s.article?.slug ?? ''}`}
                className="group flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/50 transition-all"
              >
                <Bookmark className="size-3.5 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {s.article?.title}
                  </p>
                  {s.article?.topic && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.article.topic.name}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {saved.length === 0 && history.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You're all set up! Start exploring the knowledge base.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/explore"
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
              >
                Explore Topics
              </Link>
              <Link
                href="/ai-search"
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                Try AI Search
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
