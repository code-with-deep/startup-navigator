import type { Metadata } from 'next';
import { getAllUsersAdmin } from '@/lib/db/queries';
import { UserTable } from './UserTable';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Users | Admin' };

export default async function AdminUsersPage() {
  const [session, { users, total }] = await Promise.all([
    getSession(),
    getAllUsersAdmin(1, 50),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm mt-1">{total} registered users</p>
      </div>
      <UserTable users={users} currentUserId={session?.userId ?? ''} />
    </div>
  );
}
