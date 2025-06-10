'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import { FiSearch, FiChevronDown, FiTrash2, FiEye, FiCheck } from 'react-icons/fi';
import AdminLayout from '@/components/AdminLayout';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Report = {
  report_id: string;
  date_reported: string;
  reported_by: string;
  reported_account: string;
  content: string;
  status: string;
};

export default function ReportsPage(): ReactElement {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'processed' | 'pending'>('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const fetchReports = async () => {
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (search.trim()) params.set('search', search);
    const res = await fetch(`/api/reports?${params.toString()}`);
    const result = await res.json();
    if (result.success) setReports(result.reports);
    else setReports([]);
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (search.trim() === '') fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleProcess = async (id: string) => {
    await fetch(`/api/reports/${id}/process`, { method: 'PUT' });
    toast.success('Đã xử lý báo cáo!');
    fetchReports();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa báo cáo này?')) {
      await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      toast.success('Đã xóa báo cáo!');
      fetchReports();
    }
  };

  return (
    <AdminLayout onOpenAuth={() => {}}>
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Quản lý báo cáo</h1>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={fetchReports}
              title="Tìm kiếm"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchReports()}
              placeholder="Tìm theo người báo cáo hoặc người bị báo cáo..."
              className="pl-10 pr-4 py-2 bg-[#F5F0E5] rounded-xl text-gray-800 w-full outline-none"
            />
          </div>
          <div className="relative">
            <button
              ref={dropdownRef}
              onClick={() => {
                setShowDropdown(!showDropdown);
                if (!showDropdown && dropdownRef.current) {
                  const rect = dropdownRef.current.getBoundingClientRect();
                  setDropdownPos({
                    top: rect.bottom + window.scrollY + 4,
                    left: rect.left + window.scrollX
                  });
                }
              }}
              className="px-4 py-2 text-gray-800 border rounded-xl bg-white flex items-center gap-2"
            >
              {status === 'all' ? 'Tất cả trạng thái' : status === 'processed' ? 'Đã xử lý' : 'Chưa xử lý'}
              <FiChevronDown />
            </button>
            {showDropdown && (
              <ul
                className="fixed w-40 bg-white shadow-md rounded-xl z-[9999] border"
                style={{ top: dropdownPos.top, left: dropdownPos.left }}
              >
                {['all', 'processed', 'pending'].map((s) => (
                  <li
                    key={s}
                    className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setStatus(s as 'all' | 'processed' | 'pending');
                      setShowDropdown(false);
                    }}
                  >
                    {s === 'all' ? 'Tất cả trạng thái' : s === 'processed' ? 'Đã xử lý' : 'Chưa xử lý'}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {/* Reports Table */}
        <div className="border border-[#DBE0E5] rounded-xl overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-white border-b border-[#DBE0E5] sticky top-0 z-10">
                <tr className="text-left">
                  <th className="p-4 text-gray-800 bg-white">Mã báo cáo</th>
                  <th className="p-4 text-gray-800 bg-white">Ngày báo cáo</th>
                  <th className="p-4 text-gray-800 bg-white">Người báo cáo</th>
                  <th className="p-4 text-gray-800 bg-white">Tài khoản bị báo cáo</th>
                  <th className="p-4 text-gray-800 bg-white">Nội dung</th>
                  <th className="p-4 text-gray-800 bg-white">Trạng thái</th>
                  <th className="p-4 text-gray-800 bg-white">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-500 bg-white">
                      {search.trim()
                        ? 'Không có kết quả nào phù hợp với từ khóa tìm kiếm.'
                        : 'Không có báo cáo nào phù hợp với bộ lọc hiện tại.'}
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.report_id} className="bg-white border-b border-[#E5E8EB]">
                      <td className="p-4 text-gray-800">{report.report_id}</td>
                      <td className="p-4 text-gray-800">{report.date_reported}</td>
                      <td className="p-4 text-gray-800">{report.reported_by}</td>
                      <td className="p-4 text-gray-800">{report.reported_account}</td>
                      <td className="p-4 text-gray-800 max-w-[300px] truncate" title={report.content}>{report.content}</td>
                      <td className="p-4 text-gray-800">
                        {report.status === 'Đã xử lý' ? (
                          <span className="px-2 py-1 bg-blue-200 rounded-full text-sm">Đã xử lý</span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-200 rounded-full text-sm">Chưa xử lý</span>
                        )}
                      </td>
                      <td className="p-4 flex gap-2">
                        <button className="text-blue-500 hover:underline" onClick={() => setSelectedReport(report)}>
                          <FiEye />
                        </button>
                        {report.status !== 'Đã xử lý' && (
                          <button onClick={() => handleProcess(report.report_id)} className="text-green-600 hover:underline">
                            <FiCheck />
                          </button>
                        )}
                        <button onClick={() => handleDelete(report.report_id)} className="text-red-500 hover:underline">
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <ToastContainer position="top-right" autoClose={3000} aria-label="Thông báo hệ thống" />
      {selectedReport && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Báo cáo #{selectedReport.report_id}
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                Ngày báo cáo: {selectedReport.date_reported}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                Người báo cáo: {selectedReport.reported_by}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                Tài khoản bị báo cáo: {selectedReport.reported_account}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                Trạng thái: {selectedReport.status}
              </p>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Nội dung báo cáo</h4>
              <div className="bg-gray-100 rounded-lg p-4 text-gray-800">
                {selectedReport.content}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {selectedReport.status !== 'Đã xử lý' && (
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  onClick={() => { handleProcess(selectedReport.report_id); setSelectedReport(null); }}
                >
                  Đánh dấu đã xử lý
                </button>
              )}
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                onClick={() => setSelectedReport(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
