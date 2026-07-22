'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface Props {
  topSearches: { query: string; count: number }[];
  userSignups: { date: string; count: number }[];
}

export function AdminCharts({ topSearches, userSignups }: Props) {
  const barData = topSearches.map((s) => ({
    name: s.query.length > 22 ? s.query.slice(0, 22) + '…' : s.query,
    searches: s.count,
  }));

  const lineData = userSignups.map((s) => ({
    date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    signups: s.count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Searches */}
      <Card>
        <CardHeader className="pb-3">
          <h2 className="font-semibold text-sm">Most Searched Queries</h2>
        </CardHeader>
        <CardContent>
          {barData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No searches yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={48}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--background))',
                  }}
                />
                <Bar dataKey="searches" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* User Signups */}
      <Card>
        <CardHeader className="pb-3">
          <h2 className="font-semibold text-sm">User Signups (last 7 days)</h2>
        </CardHeader>
        <CardContent>
          {lineData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No signups in the last 7 days</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={lineData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--background))',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="signups"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
