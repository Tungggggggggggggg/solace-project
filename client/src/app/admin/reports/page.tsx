'use client';

import React, { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
import AdminLayout from '@/components/AdminLayout';

type Report = {
  report_id: string;
  date_reported: string;
  reported_by: string;
  reported_account: string;
  content: string;
  status: string;
};

export default function ReportsPage(): ReactElement {
  const [reportsData, setReportsData] = useState<Report[]>([]);

  // State cho bộ lọc trạng thái
  const [selectedStatus, setSelectedStatus] = useState('Tất cả trạng thái');
  const [showDropdown, setShowDropdown] = useState(false);

  // State cho các dòng đã mở rộng nội dung
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/reports');
        const result = await response.json();
        if (result.success) {
          setReportsData(result.reports);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, []);

  // Lọc dữ liệu dựa trên trạng thái
  const filteredReports = selectedStatus === 'Tất cả trạng thái'
    ? reportsData
    : reportsData.filter(report => report.status === selectedStatus);

  // Thêm hàm onOpenAuth
  const handleOpenAuth = (tab: 'login' | 'signup') => {
    console.log(`Mở tab ${tab}`); // Thay bằng logic mở modal
  };

  return (
    <AdminLayout onOpenAuth={handleOpenAuth}>
      <main className="flex-1 bg-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý báo cáo</h1>
          </div>
          <div className="overflow-x-auto">
            {/* Thanh tìm kiếm, bộ lọc và nút Thêm */}
            <div className="flex gap-4 mb-6 flex-nowrap items-center min-w-max">
              <div className="flex-1 flex min-w-0">
                <div className="w-10 h-10 bg-[#F0F2F5] flex items-center justify-center rounded-l-xl">
                  <FiSearch className="w-5 h-5 text-[#3D4D5C]" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm báo cáo..."
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
                      {['Tất cả trạng thái', 'Đã xử lý', 'Chưa xử lý'].map((status) => (
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
                Thêm báo cáo
              </button>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] table-fixed">
                <thead className="bg-white border-b border-[#DBE0E5]">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-900 w-[50px]">STT</th>
                    <th className="text-left p-4 font-medium text-gray-900 w-[100px]">Mã báo cáo</th>
                    <th className="text-left p-4 font-medium text-gray-900 w-[150px]">Ngày báo cáo</th>
                    <th className="text-left p-4 font-medium text-gray-900 w-[150px]">Người báo cáo</th>
                    <th className="text-left p-4 font-medium text-gray-900 w-[200px]">Tài khoản bị báo cáo</th>
                    <th className="text-left p-4 font-medium text-gray-900 w-[200px]">Nội dung</th>
                    <th className="text-left p-4 font-medium text-gray-900 w-[150px]">Trạng thái</th>
                    <th className="text-left p-4 font-medium text-gray-900 w-[150px]">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report, index) => {
                    const isLongContent = report.content.length > 50;
                    const isExpanded = expandedRows[report.report_id];
                    return (
                      <tr key={report.report_id} className="border-b border-[#E5E8EB]">
                        <td className="p-4 text-gray-800 whitespace-nowrap">{index + 1}</td>
                        <td className="p-4 text-gray-800 whitespace-nowrap">{report.report_id}</td>
                        <td className="p-4 text-gray-800 whitespace-nowrap">{report.date_reported}</td>
                        <td className="p-4 text-gray-800 whitespace-nowrap">{report.reported_by || 'Không xác định'}</td>
                        <td className="p-4 text-gray-800 whitespace-nowrap">{report.reported_account || 'Không xác định'}</td>
                        <td className="p-4 text-gray-800 max-w-[400px] break-words align-top">{report.content}</td>
                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`px-4 py-1 rounded-2xl text-gray-900 whitespace-nowrap ${
                              report.status === 'Đã xử lý' ? 'bg-[#AECBEB]' : 'bg-[#F0F2F5]'
                            }`}
                          >
                            {report.status}
                          </span>
                        </td>
                        <td className="p-4 flex gap-2 whitespace-nowrap">
                          <span className="material-symbols-outlined text-blue-500">mail</span>
                          <span className="material-symbols-outlined text-blue-500">visibility</span>
                          <span className="material-symbols-outlined text-gray-500">delete</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

           
           
          
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}