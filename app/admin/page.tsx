import type { Metadata } from 'next';
import {
  FileText,
  Users,
  Search,
  TrendingUp,
  Layers,
  BookOpen,
} from 'lucide-react';
import { getAdminStats } from '@/lib/db/queries';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AdminCharts } from './AdminCharts';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Admin Dashboard' };

const EMPTY_STATS = {
  articles: { total: 0, published: 0, draft: 0 },
  users: { total: 0, active: 0, banned: 0, newThisWeek: 0 },
  searches: { today: 0, week: 0, month: 0, total: 0, cacheHitRate: 0 },
  topSearches: [],
  userSignups: [],
};

export default async function AdminPage() {
  const stats = await getAdminStats().catch(() => EMPTY_STATS);

  const statCards = [
    {
      label: 'Total Articles',
      value: stats.articles.total,
      sub: `${stats.articles.published} published · ${stats.articles.draft} drafts`,
      icon: FileText,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: 'Total Users',
      value: stats.users.total,
      sub: `${stats.users.active} active · ${stats.users.banned} banned`,
      icon: Users,
      color: 'text-emerald-600 bg-emerald-100',
    },
    {
      label: 'Searches Today',
      value: stats.searches.today,
      sub: `${stats.searches.week} this week · ${stats.searches.month} this month`,
      icon: Search,
      color: 'text-violet-600 bg-violet-100',
    },
    {
      label: 'Cache Hit Rate',
      value: `${stats.searches.cacheHitRate}%`,
      sub: `${stats.searches.total} total searches`,
      icon: TrendingUp,
      color: 'text-orange-600 bg-orange-100',
    },
    {
      label: 'Topics',
      value: '—',
      sub: 'Navigate to explore',
      icon: Layers,
      color: 'text-pink-600 bg-pink-100',
    },
    {
      label: 'Total Resources',
      value: '—',
      sub: 'Navigate to resources',
      icon: BookOpen,
      color: 'text-cyan-600 bg-cyan-100',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform overview and analytics</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-start gap-3 pt-5">
              <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs font-medium">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <AdminCharts topSearches={stats.topSearches} userSignups={stats.userSignups} />
    </div>
  );
}
