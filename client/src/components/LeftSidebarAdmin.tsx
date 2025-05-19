'use client';

import type { ReactElement, HTMLAttributes } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RiDashboardLine } from 'react-icons/ri';
import { HiOutlineUsers, HiOutlineDocumentText, HiOutlineExclamationCircle } from 'react-icons/hi';
import { FiSettings } from 'react-icons/fi';

export default function LeftSidebarAdmin({ className, ...props }: HTMLAttributes<HTMLDivElement>): ReactElement {
  const pathname = usePathname();

  return (
    <aside className={`w-64 bg-white border-r border-gray-200 p-4 flex flex-col justify-between  w-64 fixed top-0 left-0${className}`} {...props}>
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
    </aside>
  );
}