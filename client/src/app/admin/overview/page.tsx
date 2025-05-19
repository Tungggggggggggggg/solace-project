'use client';

import type { ReactElement } from 'react';
import { FiFlag, FiUserPlus } from 'react-icons/fi';
import { HiOutlineDocumentText } from 'react-icons/hi';
import AdminLayout from '@/components/AdminLayout';

export default function AdminPage(): ReactElement {
  // Hàm xử lý mở auth modal
  const handleOpenAuth = (tab: 'login' | 'signup') => {
    console.log(`Mở tab ${tab}`); // Thay bằng logic mở modal
  };

  return (
    <AdminLayout onOpenAuth={handleOpenAuth}>
      <main className="flex-1 bg-white">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Tổng quan hệ thống</h1>
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="p-6 border border-[#DBE0E5] rounded-xl bg-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-base font-medium text-gray-900">Báo cáo vi phạm hôm nay</p>
                <FiFlag className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">24</p>
              <p className="text-sm text-[#009963]">+12% so với hôm qua</p>
            </div>
            <div className="p-6 border border-[#DBE0E5] rounded-xl bg-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-base font-medium text-gray-900">Bài đăng trong tuần</p>
                <HiOutlineDocumentText className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">156</p>
              <p className="text-sm text-[#009963]">+8% so với tuần trước</p>
            </div>
            <div className="p-6 border border-[#DBE0E5] rounded-xl bg-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-base font-medium text-gray-900">Người dùng mới hôm nay</p>
                <FiUserPlus className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">48</p>
              <p className="text-sm text-[#009963]">+15% so với hôm qua</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 border border-[#DBE0E5] rounded-xl bg-white">
              <h3 className="font-medium text-gray-600 mb-4">Tài khoản mới theo tháng</h3>
              <div className="h-64 bg-[#F0F2F5] rounded-lg"></div>
            </div>
            <div className="p-6 border border-[#DBE0E5] rounded-xl bg-white">
              <h3 className="font-medium text-gray-600 mb-4">Phân tích cảm xúc bài viết</h3>
              <div className="h-64 bg-[#F0F2F5] rounded-lg"></div>
            </div>
            <div className="p-6 border border-[#DBE0E5] rounded-xl bg-white">
              <h3 className="font-medium text-gray-600 mb-4">Lượt truy cập theo ngày</h3>
              <div className="h-64 bg-[#F0F2F5] rounded-lg"></div>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}