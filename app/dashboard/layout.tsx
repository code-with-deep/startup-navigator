import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Navbar } from '@/components/layout/Navbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/sign-in?callbackUrl=/dashboard');

  return (
    <div className="flex min-h-screen bg-muted/20">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden">
          <Navbar />
        </div>
        <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
