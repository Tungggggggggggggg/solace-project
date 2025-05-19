'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ReactElement } from 'react';
import { FiFlag, FiUserPlus, FiBell, FiUser, FiSettings, FiSearch } from 'react-icons/fi';
import { RiDashboardLine } from 'react-icons/ri';
import { HiOutlineUsers, HiOutlineDocumentText, HiOutlineExclamationCircle } from 'react-icons/hi';

export default function AdminPage(): ReactElement {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 p-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#AECBEB] rounded-full"></div>
            <h1 className="text-xl font-medium text-[#1C170D]">Solace Admin</h1>
          </div>
          
          <nav className="space-y-2">
            <Link href="/admin/overview">
                <div className="flex items-center gap-3 px-3 py-2 bg-[#AECBEB] rounded-lg text-black">
                    <RiDashboardLine className="w-5 h-5" />
                    <span className="font-medium">Tổng quan</span>
                </div>
            </Link>
            <Link href="/admin/users">
              <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg text-gray-700 cursor-pointer">
                <HiOutlineUsers className="w-5 h-5" />
                <span className="font-medium">Quản lý người dùng</span>
              </div>
            </Link>
            <Link href="/admin/posts">
              <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg text-gray-700 cursor-pointer">
                <HiOutlineDocumentText className="w-5 h-5" />
                <span className="font-medium">Quản lý bài đăng</span>
              </div>
            </Link>

            <Link href="/admin/reports">
              <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg text-gray-700 cursor-pointer">
                <HiOutlineExclamationCircle className="w-5 h-5" />
                <span className="font-medium">Quản lý báo cáo</span>
              </div>
            </Link>

            <Link href="/admin/settings">
              <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg text-gray-700 cursor-pointer">
                <FiSettings className="w-5 h-5" />
                <span className="font-medium">Quản lý cài đặt</span>
              </div>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        {/* Header */}
        <header className="h-16 bg-[#AECBEB] px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
          <Image src="/images/admin-logo.png" alt="Logo" width={100} height={100} className="rounded-full"/>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#AECBEB]"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <FiBell className="w-6 h-6 text-white" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <FiUser className="w-6 h-6 text-white" />
          </button>
        </div>
      </header>

        {/* Dashboard Content */}
        <div className="p-6">
          <h1 className="text-3xl font-bold text-[#1C170D]">Tổng quan hệ thống</h1>
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 p-6">
            <div className="p-6 border border-[#E8DECF] rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-base font-medium text-[#1C170D]">Báo cáo vi phạm hôm nay</p>
                <FiFlag className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-[#1C170D] mb-1">24</p>
              <p className="text-sm text-[#009963]">+12% so với hôm qua</p>
            </div>

            <div className="p-6 border border-[#E8DECF] rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-base font-medium text-[#1C170D]">Bài đăng trong tuần</p>
                <HiOutlineDocumentText className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-[#1C170D] mb-1">156</p>
              <p className="text-sm text-[#009963]">+8% so với tuần trước</p>
            </div>

            <div className="p-6 border border-[#E8DECF] rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-base font-medium text-[#1C170D]">Người dùng mới hôm nay</p>
                <FiUserPlus className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-[#1C170D] mb-1">48</p>
              <p className="text-sm text-[#009963]">+15% so với hôm qua</p>
            </div>
          </div>


          {/* Charts Section */}
          <div className="grid grid-cols-3 gap-6 p-6">
            <div className="col-span-1 p-6 border border-[#E8DECF] rounded-xl">
              <h3 className="font-medium text-gray-600 mb-4">Tài khoản mới theo tháng</h3>
              <div className="h-64 bg-gray-50 rounded-lg"></div>
            </div>

            <div className="col-span-1 p-6 border border-[#E8DECF] rounded-xl">
              <h3 className="font-medium text-gray-600 mb-4">Phân tích cảm xúc bài viết</h3>
              <div className="h-64 bg-gray-50 rounded-lg"></div>
            </div>

            <div className="col-span-1 p-6 border border-[#E8DECF] rounded-xl">
              <h3 className="font-medium text-gray-600 mb-4">Lượt truy cập theo ngày</h3>
              <div className="h-64 bg-gray-50 rounded-lg"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
