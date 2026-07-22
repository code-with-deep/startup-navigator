import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/sign-in?callbackUrl=/admin');
  if (session.role !== 'admin') redirect('/dashboard');

  return (
    <div className="flex h-screen bg-muted/20">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <main className="p-6 md:p-8 max-w-6xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
