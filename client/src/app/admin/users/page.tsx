'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';
import { FiSearch, FiChevronDown, FiEdit2, FiLock, FiUnlock } from 'react-icons/fi';
import AdminLayout from '@/components/AdminLayout';

export default function UserManagementPage(): ReactElement {
  const [selectedStatus, setSelectedStatus] = useState('Tất cả trạng thái');
  const [showDropdown, setShowDropdown] = useState(false);

  // Thêm hàm onOpenAuth
  const handleOpenAuth = (tab: 'login' | 'signup') => {
    console.log(`Mở tab ${tab}`); // Thay bằng logic mở modal
  };

  return (
    <AdminLayout onOpenAuth={handleOpenAuth}>
      <main className="flex-1 bg-white">
        {/* Content: User Management */}
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 flex">
              <div className="w-10 h-10 bg-[#F0F2F5] flex items-center justify-center rounded-l-xl">
                <FiSearch className="w-5 h-5 text-[#3D4D5C]" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                className="flex-1 px-4 py-2 bg-[#F0F2F5] rounded-r-xl text-[#3D4D5C] outline-none"
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
                    {['Tất cả trạng thái', 'Hoạt động', 'Đã khóa'].map((status) => (
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

          {/* Users Table */}
          <div className="border border-[#DBE0E5] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-white border-b border-[#DBE0E5]">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-900">Họ tên</th>
                  <th className="text-left p-4 font-medium text-gray-900">Email</th>
                  <th className="text-left p-4 font-medium text-gray-900">Ngày đăng ký</th>
                  <th className="text-left p-4 font-medium text-gray-900">Trạng thái</th>
                  <th className="text-left p-4 font-medium text-gray-900">Bài đăng</th>
                  <th className="text-left p-4 font-medium text-gray-900">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#E5E8EB]">
                  <td className="p-4 text-gray-800">Nguyễn Văn A</td>
                  <td className="p-4 text-gray-800">nguyenvana@email.com</td>
                  <td className="p-4 text-gray-800">12/05/2025</td>
                  <td className="p-4">
                    <span className="px-4 py-1 bg-[#AECBEB] rounded-2xl text-gray-900">Hoạt động</span>
                  </td>
                  <td className="p-4 text-gray-800">24</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-full">
                        <FiEdit2 className="w-5 h-5 text-gray-800" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-full">
                        <FiLock className="w-5 h-5 text-gray-800" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-[#E5E8EB]">
                  <td className="p-4 text-gray-800">Trần Thị B</td>
                  <td className="p-4 text-gray-800">tranthib@email.com</td>
                  <td className="p-4 text-gray-800">10/05/2025</td>
                  <td className="p-4">
                    <span className="px-4 py-1 bg-[#F0F2F5] rounded-2xl text-gray-900">Đã khóa</span>
                  </td>
                  <td className="p-4 text-gray-800">15</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-full">
                        <FiEdit2 className="w-5 h-5 text-gray-800" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-full">
                        <FiUnlock className="w-5 h-5 text-gray-800" />
                      </button>
                    </div>
                  </td>
                </tr>
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
    </AdminLayout>
  );
}