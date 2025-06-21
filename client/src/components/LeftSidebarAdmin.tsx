'use client';

import type { ReactElement, HTMLAttributes } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RiDashboardLine } from 'react-icons/ri';
import { HiOutlineUsers, HiOutlineDocumentText, HiOutlineExclamationCircle } from 'react-icons/hi';
import { FiSettings } from 'react-icons/fi';
import { useState } from 'react';

export default function LeftSidebarAdmin({ className = '', ...props }: HTMLAttributes<HTMLDivElement>): ReactElement {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Sidebar responsive: overlay trên mobile/tablet, fixed trên desktop
  return (
    <>
      {/* Nút mở sidebar trên mobile/tablet */}
      <button
        className="fixed top-3 left-3 z-40 bg-[#AECBEB] p-2 rounded-full shadow-lg lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Mở menu quản trị"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
      </button>
      {/* Sidebar */}
      <aside
        className={`w-64 bg-white border-r border-gray-200 p-4 flex flex-col justify-between fixed top-0 left-0 z-40 transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block ${className}`}
        style={{ maxWidth: 256, height: '100vh' }}
        {...props}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#AECBEB] rounded-full"></div>
            <h1 className="text-lg font-medium text-[#1C170D]">Solace Admin</h1>
          </div>
          <nav className="space-y-2">
            <Link href="/admin/overview" className={`flex items-center gap-3 px-3 py-2 rounded-lg ${pathname === '/admin/overview' ? 'bg-[#AECBEB] text-black' : 'hover:bg-gray-100 text-gray-700'}`}>
              <RiDashboardLine className="w-5 h-5" />
              <span className="font-medium">Tổng quan</span>
            </Link>
            <Link href="/admin/users" className={`flex items-center gap-3 px-3 py-2 rounded-lg ${pathname === '/admin/users' ? 'bg-[#AECBEB] text-black' : 'hover:bg-gray-100 text-gray-700'}`}>
              <HiOutlineUsers className="w-5 h-5" />
              <span className="font-medium">Quản lý người dùng</span>
            </Link>
            <Link href="/admin/posts" className={`flex items-center gap-3 px-3 py-2 rounded-lg ${pathname === '/admin/posts' ? 'bg-[#AECBEB] text-black' : 'hover:bg-gray-100 text-gray-700'}`}>
              <HiOutlineDocumentText className="w-5 h-5" />
              <span className="font-medium">Quản lý bài đăng</span>
            </Link>
            <Link href="/admin/reports" className={`flex items-center gap-3 px-3 py-2 rounded-lg ${pathname === '/admin/reports' ? 'bg-[#AECBEB] text-black' : 'hover:bg-gray-100 text-gray-700'}`}>
              <HiOutlineExclamationCircle className="w-5 h-5" />
              <span className="font-medium">Quản lý báo cáo</span>
            </Link>
            <Link href="/admin/setting" className={`flex items-center gap-3 px-3 py-2 rounded-lg ${pathname === '/admin/setting' ? 'bg-[#AECBEB] text-black' : 'hover:bg-gray-100 text-gray-700'}`}>
              <FiSettings className="w-5 h-5" />
              <span className="font-medium">Quản lý cài đặt</span>
            </Link>
          </nav>
        </div>
        {/* Nút đóng sidebar trên mobile/tablet */}
        <button
          className="absolute top-3 right-3 lg:hidden p-2 bg-gray-100 rounded-full"
          onClick={() => setOpen(false)}
          aria-label="Đóng menu quản trị"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="4" x2="16" y2="16" /><line x1="16" y1="4" x2="4" y2="16" /></svg>
        </button>
      </aside>
      {/* Overlay khi sidebar mở trên mobile/tablet */}
      {open && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}