'use client';

import { useState } from 'react';
import {
  Ban,
  CheckCircle,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils/date';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isBanned: boolean;
  createdAt: Date;
}

export function UserTable({
  users: initialUsers,
  currentUserId,
}: {
  users: User[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState<Set<string>>(new Set());

  const filtered = search
    ? users.filter(
        (u) =>
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          (u.name ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : users;

  async function doAction(userId: string, action: 'ban' | 'unban' | 'promote') {
    if (userId === currentUserId) {
      toast.error('Cannot modify your own account');
      return;
    }
    if (action === 'promote' && !confirm('Promote this user to Admin? This cannot be undone.')) return;

    setProcessing((p) => new Set(p).add(userId));
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const json = await res.json() as { error?: string };
        toast.error(json.error ?? 'Action failed');
        return;
      }
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          if (action === 'promote') return { ...u, role: 'admin' };
          return { ...u, isBanned: action === 'ban' };
        })
      );
      toast.success(
        action === 'ban' ? 'User banned' : action === 'unban' ? 'User unbanned' : 'User promoted to admin'
      );
    } finally {
      setProcessing((p) => { const n = new Set(p); n.delete(userId); return n; });
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Search by email or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">User</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Joined</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-muted-foreground">
                  No users found
                </td>
              </tr>
            )}
            {filtered.map((u) => {
              const isSelf = u.id === currentUserId;
              const isProcessing = processing.has(u.id);
              return (
                <tr
                  key={u.id}
                  className={cn(
                    'hover:bg-muted/30 transition-colors',
                    isProcessing && 'opacity-50 pointer-events-none'
                  )}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.name ?? u.email.split('@')[0]}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground hidden md:table-cell">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.role === 'admin' && (
                        <Badge variant="default" className="text-xs capitalize">Admin</Badge>
                      )}
                      {u.isBanned && (
                        <Badge variant="destructive" className="text-xs">Banned</Badge>
                      )}
                      {!u.isBanned && u.role !== 'admin' && (
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      )}
                      {isSelf && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {!isSelf && u.role !== 'admin' && (
                      <div className="flex items-center justify-end gap-1">
                        {u.isBanned ? (
                          <button
                            onClick={() => doAction(u.id, 'unban')}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-colors"
                          >
                            <CheckCircle className="size-3" /> Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => doAction(u.id, 'ban')}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
                          >
                            <Ban className="size-3" /> Ban
                          </button>
                        )}
                        <button
                          onClick={() => doAction(u.id, 'promote')}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <ShieldCheck className="size-3" /> Promote
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
