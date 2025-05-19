'use client';

import type { ReactElement } from 'react';
import HeaderAdmin from './HeaderAdmin';
import LeftSidebarAdmin from './LeftSidebarAdmin';

export default function AdminLayout({ children, onOpenAuth }: { children: React.ReactNode; onOpenAuth: (tab: 'login' | 'signup') => void }): ReactElement {
  return (
    <div className="h-screen max-w-full overflow-x-hidden">
      <LeftSidebarAdmin className="top-0 left-0 h-full w-53 bg-white z-30 shadow-lg" />
      <HeaderAdmin onOpenAuth={onOpenAuth}  />
      <main className="ml-64 pt-16 bg-gray-100 h-full overflow-x-hidden">
        <div className="p-6 overflow-x-auto overflow-y-auto h-full max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}