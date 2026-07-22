import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ProfileClient } from './ProfileClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Profile | Dashboard' };

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/sign-in?callbackUrl=/dashboard/profile');

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
    columns: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  if (!user) redirect('/sign-in');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account details and security settings
        </p>
      </div>
      <ProfileClient user={user} />
    </div>
  );
}
