'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactElement } from 'react';
import { FiFlag, FiUserPlus, FiBell, FiUser, FiSettings, FiSearch, FiChevronDown, FiEye, FiTrash2 } from 'react-icons/fi';
import { RiDashboardLine } from 'react-icons/ri';
import { HiOutlineUsers, HiOutlineDocumentText, HiOutlineExclamationCircle } from 'react-icons/hi';

export default function PostManagementPage(): ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Tất cả trạng thái');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeType, setActiveType] = useState<'Tích cực' | 'Tiêu cực'>('Tích cực');



  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 p-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${activeType === 'Tích cực' ? 'bg-[#AECBEB]' : 'bg-[#F8F9FB]'}`}></div>
            <h1 className="text-xl font-medium text-[#1C170D]">Solace Admin</h1>
          </div>
          
          <nav className="space-y-2">
            <Link href="/admin/overview">
                <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg text-gray-700 cursor-pointer">
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
                <div
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${
                        activeType === 'Tích cực' ? 'bg-[#AECBEB] text-black' : 'bg-[#F8F9FB] text-black'
                    }`}
                    >
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
        <header className={`h-16 px-6 flex items-center justify-between ${activeType === 'Tích cực' ? 'bg-[#AECBEB]' : 'bg-[#F8F9FB]' }`}>
          <div className="flex items-center gap-4">
            <Image src="/images/admin-logo.png" alt="Logo" width={100} height={100} className="rounded-full" />
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Post Management Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý bài đăng</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveType('Tích cực')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeType === 'Tích cực' ? 'bg-[#AECBEB] text-gray-900' : 'bg-gray-100 text-gray-900'
                }`}
              >
                Tích cực
              </button>
              <button
                onClick={() => setActiveType('Tiêu cực')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeType === 'Tiêu cực' ? 'bg-[#F8F9FB] text-gray-900' : 'bg-gray-100 text-gray-900'
                }`}
              >
                Tiêu cực
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 flex">
              <div className="w-10 h-10 bg-[#F5F0E5] flex items-center justify-center rounded-l-xl">
                <FiSearch className="w-5 h-5 text-[#A1824A]" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                className="flex-1 px-4 py-2 bg-[#F5F0E5] rounded-r-xl text-gray-900 outline-none"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="px-4 py-2 border border-[#E8DECF] rounded-xl flex items-center gap-2 text-gray-800 bg-white shadow-sm hover:bg-gray-50"
              >
                <span>{selectedStatus}</span>
                <FiChevronDown className="w-5 h-5" />
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-[#E8DECF] rounded-xl shadow-lg z-10">
                  <ul className="py-1">
                    {['Tất cả trạng thái', 'Đã duyệt', 'Chưa duyệt'].map((status) => (
                      <li
                        key={status}
                        onClick={() => {
                          setSelectedStatus(status);
                          setShowDropdown(false);
                        }}
                        className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800 ${
                          selectedStatus === status ? 'bg-gray-100 font-medium' : ''
                        }`}
                      >
                        {status}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Posts Table */}
          <div className="border border-[#E8DECF] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-white border-b border-[#E1ECF7]">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-900">Tiêu đề</th>
                  <th className="text-left p-4 font-medium text-gray-900">Loại</th>
                  <th className="text-left p-4 font-medium text-gray-900">Người đăng</th>
                  <th className="text-left p-4 font-medium text-gray-900">Ngày đăng</th>
                  <th className="text-left p-4 font-medium text-gray-900">Cảm xúc</th>
                  <th className="text-left p-4 font-medium text-gray-900">Trạng thái</th>
                  <th className="text-left p-4 font-medium text-gray-900">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#E5E8EB]">
                  <td className="p-4 text-gray-800">Chia sẻ trải nghiệm tích cực</td>
                  <td className="p-4">
                  <span className={`px-4 py-1 rounded-2xl text-gray-900 ${activeType === 'Tích cực' ? 'bg-[#AECBEB]' : 'bg-[#F8F9FB]'}`}>Tích cực </span>
                  </td>
                  <td className="p-4 text-gray-800">Nguyễn Văn A</td>
                  <td className="p-4 text-gray-800">12/05/2025</td>
                  <td className="p-4 text-gray-800">124</td>
                  <td className="p-4">
                    <span className="px-4 py-1 bg-[#AECBEB] rounded-2xl text-gray-900">Đã duyệt</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-full">
                        <FiEye className="w-5 h-5 text-gray-800" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-full">
                        <FiTrash2 className="w-5 h-5 text-gray-800" />
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Thêm các dòng khác nếu cần */}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
              <FiChevronDown className="w-5 h-5 rotate-90 text-gray-900" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F8F9FB] text-gray-900 font-bold">1</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-900">2</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-900">3</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
              <FiChevronDown className="w-5 h-5 -rotate-90 text-gray-900" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
