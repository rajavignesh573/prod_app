import { memo, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { prefetchRoute } from '@/router';
import type { User } from '@/types';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', adminOnly: true },
  { to: '/tasks', label: 'Tasks' },
  { to: '/goals', label: 'Goals' },
  { to: '/daily-routine', label: 'Daily Routine' },
  { to: '/tools', label: 'Tools' },
  { to: '/addons', label: 'Add-ons', adminOnly: true },
  { to: '/users', label: 'Users', adminOnly: true },
  { to: '/account-settings', label: 'Account Settings' }
];

interface AppShellProps {
  currentUser: User | null;
  onSignOut: () => void;
  children: ReactNode;
}

const AppShell = memo(function AppShell({ currentUser, onSignOut, children }: AppShellProps) {
  if (!currentUser) {
    return <div className="p-8 text-sm text-slate-600">Loading user session...</div>;
  }
  const allowedNavItems = navItems.filter((item) => !item.adminOnly || currentUser.role === 'admin');

  return (
    <div className="min-h-screen bg-slate-100/70 lg:flex">
      <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white/95 p-6 backdrop-blur lg:flex">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">FlowForge</h1>
        <p className="mt-1 text-sm text-slate-500">Productivity workspace</p>
        <nav className="mt-8 space-y-1.5">
          {allowedNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onMouseEnter={() => prefetchRoute(item.to)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Signed in as</p>
          <p className="mt-1 text-sm font-medium text-slate-700">
            {currentUser.name} ({currentUser.role})
          </p>
          <button
            onClick={onSignOut}
            className="mt-2 text-xs font-semibold text-rose-600 hover:text-rose-700"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
});

export default AppShell;
