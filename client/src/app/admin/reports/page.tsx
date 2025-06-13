'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import { FiSearch, FiChevronDown, FiTrash2, FiEye, FiCheck, FiMail } from 'react-icons/fi';
import AdminLayout from '@/components/AdminLayout';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import FilteredInput from '@/components/FilteredInput';
type Report = {
  report_id: string;
  date_reported: string;
  reported_by: string;
  reported_account: string;
  content: string;
  status: string;
  reporter_id: string;
  reported_user_id: string;
};

type ReportedPost = {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at?: string;
  content?: string;
  images?: string;
};

export default function ReportsPage(): ReactElement {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'processed' | 'pending'>('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportedPost, setReportedPost] = useState<ReportedPost | null>(null);
  const [sharedPost, setSharedPost] = useState<ReportedPost | null>(null);
  const [showMailDialog, setShowMailDialog] = useState(false);
  const [mailTarget, setMailTarget] = useState<'reporter' | 'reported'>('reporter');
  const [mailTitle, setMailTitle] = useState('');
  const [mailContent, setMailContent] = useState('');
  const [mailType, setMailType] = useState('system');
  const [mailUserId, setMailUserId] = useState<string | null>(null);
  const [mailReport, setMailReport] = useState<Report | null>(null);
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);


  // Lấy danh sách báo cáo từ API dựa vào trạng thái và từ khóa tìm kiếm
  const fetchReports = async () => {
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (search.trim()) params.set('search', search);
    const res = await fetch(`/api/reports?${params.toString()}`);
    const result = await res.json();
    if (result.success) setReports(result.reports);
    else setReports([]);
  };

  // Khi thay đổi trạng thái lọc, tự động lấy lại danh sách báo cáo
  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Khi xóa hết từ khóa tìm kiếm, tự động lấy lại danh sách báo cáo
  useEffect(() => {
    if (search.trim() === '') fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Đánh dấu báo cáo đã xử lý
  const handleProcess = async (id: string) => {
    await fetch(`/api/reports/${id}/process`, { method: 'PUT' });
    toast.success('Đã xử lý báo cáo!');
    fetchReports();
  };

  // Xóa báo cáo
  const handleDelete = (id: string) => {
    setDeleteReportId(id); // Mở modal xác nhận
  };

  const confirmDelete = async () => {
    if (deleteReportId) {
      await fetch(`/api/reports/${deleteReportId}`, { method: 'DELETE' });
      toast.success('Đã xóa báo cáo!');
      setDeleteReportId(null);
      fetchReports();
    }
  };

  // Xem chi tiết báo cáo (và bài đăng bị báo cáo)
  const handleViewReport = async (report: Report) => {
    const res = await fetch(`/api/reports/${report.report_id}`);
    const result = await res.json();
    if (result.success) {
      setSelectedReport(result.report);
      setReportedPost(result.post);
      setSharedPost(result.shared_post || null); // <-- thêm dòng này
    } else {
      toast.error(result.error || 'Không lấy được chi tiết báo cáo');
    }
  };

  // Khi bấm icon thư, mở dialog gửi thông báo và chọn mặc định người nhận
  const handleOpenMailDialog = (report: Report, target: 'reporter' | 'reported') => {
    setMailReport(report); // Lưu report cho dialog gửi thư
    setMailTarget(target);
    setShowMailDialog(true);
    setMailTitle('');
    setMailContent('');
    setMailType('system');
    const userId = target === 'reporter' ? report.reporter_id : report.reported_user_id;
    setMailUserId(userId);

    setSelectedReport(null); // Đóng dialog xem chi tiết nếu đang mở
    setReportedPost(null);
  };

  // Gửi thông báo (notification) đến user đã chọn
  const handleSendNotification = async () => {
    if (!mailTitle.trim() || !mailContent.trim()) {
      toast.error('Vui lòng nhập tiêu đề và nội dung!');
      return;
    }
    if (!mailUserId) {
      toast.error('Không xác định được người nhận!');
      return;
    }
    const res = await fetch('/api/reports/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: mailUserId,
        title: mailTitle,
        content: mailContent,
        type: 'system',
      }),
    });
    const result = await res.json();
    if (result.success) {
      toast.success('Đã gửi thông báo!');
      setShowMailDialog(false);
    } else {
      toast.error(result.message || 'Gửi thông báo thất bại!');
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
            <FilteredInput
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
                        <button className="text-blue-500 hover:underline" onClick={() => handleViewReport(report)}>
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
                         {/* Icon gửi thư */}
                        <button
                          className="text-orange-500 hover:underline"
                          title="Gửi thông báo"
                          onClick={() => {
                            setSelectedReport(null); // Đóng dialog xem chi tiết nếu đang mở
                            setReportedPost(null);
                            handleOpenMailDialog(report, 'reporter');
                          }}
                        >
                          <FiMail />
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
      
         {/* Dialog gửi thông báo */}
      {showMailDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]" onClick={() => setShowMailDialog(false)}>
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md animate-fadeIn"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Gửi thông báo</h2>
            <div className="mb-3">
              <label className="block font-medium mb-1">Gửi cho:</label>
              <select
                className="w-full p-2 border rounded mb-2"
                value={mailTarget}
                onChange={e => {
                  setMailTarget(e.target.value as 'reporter' | 'reported');
                  if (mailReport) {
                    const userId =
                      e.target.value === 'reporter'
                        ? mailReport.reporter_id
                        : mailReport.reported_user_id;
                    setMailUserId(userId);
                  }
                }}
              >
                <option value="reporter">Người báo cáo</option>
                <option value="reported">Người bị báo cáo</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block font-medium mb-1">Tiêu đề</label>
              <FilteredInput
                className="w-full p-2 border rounded"
                value={mailTitle}
                onChange={e => setMailTitle(e.target.value)}
                placeholder="Nhập tiêu đề..."
              />
            </div>
            <div className="mb-3">
              <label className="block font-medium mb-1">Nội dung</label>
              <textarea
                className="w-full p-2 border rounded"
                value={mailContent}
                onChange={e => setMailContent(e.target.value)}
                placeholder="Nhập nội dung..."
                rows={4}
              />
            </div>
            <div className="mb-3">
              <label className="block font-medium mb-1">Loại thông báo</label>
              <FilteredInput
                className="w-full p-2 border rounded"
                value={mailType}
                disabled 
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={handleSendNotification}
              >
                Gửi
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                onClick={() => setShowMailDialog(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedReport && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]"
          onClick={() => { setSelectedReport(null); setReportedPost(null); }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Thông tin báo cáo */}
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
              {/* Thông tin bài đăng bị báo cáo */}
            {reportedPost && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Bài đăng bị báo cáo</h4>
                <div className="bg-white rounded-xl shadow border p-4 flex flex-col gap-2">
                  {/* Header: Avatar, tên, trạng thái share, thời gian */}
                  <div className="flex items-center gap-3">
                    {reportedPost.avatar_url && (
                      <Image
                        src={reportedPost.avatar_url}
                        alt="avatar"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">
                        {(reportedPost.first_name || '') + ' ' + (reportedPost.last_name || '')}
                      </div>
                      {/* Nếu là bài share thì hiển thị trạng thái chia sẻ */}
                      {sharedPost && (
                        <div className="text-xs text-gray-500">
                          đã chia sẻ bài viết của {(sharedPost.first_name || '') + ' ' + (sharedPost.last_name || '')}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {reportedPost.created_at
                          ? new Date(reportedPost.created_at).toLocaleString('vi-VN')
                          : ''}
                      </div>
                    </div>
                  </div>
                  {/* Nội dung bài chia sẻ */}
                  <div className="text-gray-800 whitespace-pre-line">{reportedPost.content}</div>
                  {/* Ảnh bài chia sẻ nếu có */}
                  {reportedPost.images && (() => {
                    let imgs: string[] = [];
                    try {
                      imgs = JSON.parse(reportedPost.images);
                    } catch {}
                    return Array.isArray(imgs) && imgs.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {imgs.map((img, idx) => (
                          <Image
                            key={idx}
                            src={img}
                            alt={`Ảnh ${idx + 1}`}
                            width={128}
                            height={128}
                            className="w-32 h-32 object-cover rounded border"
                            unoptimized
                          />
                        ))}
                      </div>
                    ) : null;
                  })()}
                  {/* Nếu là bài share thì hiển thị bài gốc trong khung bo viền */}
                  {sharedPost && (
                    <div className="border rounded-lg bg-gray-50 p-3 mt-2">
                      <div className="flex items-center gap-3 mb-1">
                        {sharedPost.avatar_url && (
                          <Image
                            src={sharedPost.avatar_url}
                            alt="avatar"
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover border"
                          />
                        )}
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {(sharedPost.first_name || '') + ' ' + (sharedPost.last_name || '')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {sharedPost.created_at
                              ? new Date(sharedPost.created_at).toLocaleString('vi-VN')
                              : ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-800 text-sm whitespace-pre-line">{sharedPost.content}</div>
                      {sharedPost.images && (() => {
                        let imgs: string[] = [];
                        try {
                          imgs = JSON.parse(sharedPost.images);
                        } catch {}
                        return Array.isArray(imgs) && imgs.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {imgs.map((img, idx) => (
                              <Image
                                key={idx}
                                src={img}
                                alt={`Ảnh ${idx + 1}`}
                                width={96}
                                height={96}
                                className="w-24 h-24 object-cover rounded border"
                                unoptimized
                              />
                            ))}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}
            
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
      {deleteReportId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]" onClick={() => setDeleteReportId(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4 text-center">Xác nhận xóa</h2>
            <p className="mb-6 text-center">Bạn có chắc chắn muốn xóa báo cáo này?</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                onClick={confirmDelete}
              >
                Xóa
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                onClick={() => setDeleteReportId(null)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
