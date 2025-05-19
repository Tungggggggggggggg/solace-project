'use client';

import React, { useState } from 'react';
import type { ReactElement } from 'react';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
import AdminLayout from '@/components/AdminLayout';

export default function SettingsPage(): ReactElement {
  // Dữ liệu giả lập cho bảng từ cấm
  const settingsData = [
    {
      stt: 1,
      settingName: 'mã',
      dateAdded: '12/05/2025',
      addedBy: 'Admin 1',
      status: 'Đã duyệt',
    },
    {
      stt: 2,
      settingName: 'ĐM',
      dateAdded: '10/05/2025',
      addedBy: 'Admin 2',
      status: 'Chưa duyệt',
    },
  ];

  // State cho bộ lọc trạng thái
  const [selectedStatus, setSelectedStatus] = useState('Tất cả trạng thái');
  const [showDropdown, setShowDropdown] = useState(false);

  // Lọc dữ liệu dựa trên trạng thái
  const filteredSettings = selectedStatus === 'Tất cả trạng thái'
    ? settingsData
    : settingsData.filter((setting) => setting.status === selectedStatus);

  // Hàm xử lý mở auth modal
  const handleOpenAuth = (tab: 'login' | 'signup') => {
    console.log(`Mở tab ${tab}`); // Thay bằng logic mở modal
  };

  return (
    <AdminLayout onOpenAuth={handleOpenAuth}>
      <main className="flex-1 bg-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý cài đặt</h1>
          </div>
          {/* Thanh tìm kiếm, bộ lọc và nút Thêm */}
          <div className="flex gap-4 mb-6 flex-nowrap items-center min-w-0">
            <div className="flex-1 flex min-w-0">
              <div className="w-10 h-10 bg-[#F0F2F5] flex items-center justify-center rounded-l-xl">
                <FiSearch className="w-5 h-5 text-[#3D4D5C]" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm từ cấm..."
                className="flex-1 px-4 py-2 bg-[#F0F2F5] rounded-r-xl text-[#3D4D5C] outline-none min-w-0"
                disabled
              />
            </div>
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="px-4 py-2 border border-[#E8DECF] rounded-xl flex items-center gap-2 text-gray-800 bg-white shadow-sm hover:bg-gray-50 whitespace-nowrap"
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
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2 flex-shrink-0 whitespace-nowrap"
              disabled
            >
              <span className="material-symbols-outlined">add</span>
              Thêm từ cấm
            </button>
          </div>

          {/* Bảng dữ liệu */}
          <div className="border border-[#DBE0E5] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-white border-b border-[#DBE0E5]">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-900">STT</th>
                  <th className="text-left p-4 font-medium text-gray-900">Từ cấm</th>
                  <th className="text-left p-4 font-medium text-gray-900">Ngày thêm</th>
                  <th className="text-left p-4 font-medium text-gray-900">Người thêm</th>
                  <th className="text-left p-4 font-medium text-gray-900">Trạng thái</th>
                  <th className="text-left p-4 font-medium text-gray-900">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredSettings.map((setting) => (
                  <tr key={setting.stt} className="border-b border-[#E5E8EB]">
                    <td className="p-4 text-gray-800 whitespace-nowrap">{setting.stt}</td>
                    <td className="p-4 text-gray-800 text-ellipsis overflow-hidden">{setting.settingName}</td>
                    <td className="p-4 text-gray-800 whitespace-nowrap">{setting.dateAdded}</td>
                    <td className="p-4 text-gray-800 whitespace-nowrap">{setting.addedBy}</td>
                    <td className="p-4">
                      <span
                        className={`px-4 py-1 rounded-2xl text-gray-900 whitespace-nowrap ${
                          setting.status === 'Đã duyệt' ? 'bg-[#AECBEB]' : 'bg-[#F0F2F5]'
                        }`}
                      >
                        {setting.status}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2 whitespace-nowrap">
                      <span className="material-symbols-outlined text-blue-500">visibility</span>
                      <span className="material-symbols-outlined text-gray-500">delete</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100" disabled>
              <FiChevronDown className="w-5 h-5 rotate-90 text-gray-900" />
            </button>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F8F9FB] text-gray-900 font-bold"
              disabled
            >
              1
            </button>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-900"
              disabled
            >
              2
            </button>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-900"
              disabled
            >
              3
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100" disabled>
              <FiChevronDown className="w-5 h-5 -rotate-90 text-gray-900" />
            </button>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}