import { Outlet } from 'react-router-dom';
import { Header } from '../common/Header.jsx';
import { Footer } from '../common/Footer.jsx';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors relative overflow-x-hidden">
      {/* Dynamic ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-radial-glow pointer-events-none z-0" />

      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
