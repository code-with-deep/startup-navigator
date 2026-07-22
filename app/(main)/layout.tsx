import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PageTransition } from '@/components/shared/PageTransition';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
