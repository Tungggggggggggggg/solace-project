'use client';

import React, { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
import AdminLayout from '@/components/AdminLayout';
import Toast from '@/components/Toast';

export default function SettingsPage(): ReactElement {
  const [forbiddenWords, setForbiddenWords] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('Tất cả trạng thái');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info' | 'warning'}|null>(null);

  useEffect(() => {
    const fetchForbiddenWords = async () => {
      try {
        const response = await fetch('/api/forbidden_words');
        const result = await response.json();
        if (result.success) {
          setForbiddenWords(result.forbiddenWords);
        }
      } catch (error) {
        setForbiddenWords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchForbiddenWords();
  }, []);

  // Lọc dữ liệu dựa trên trạng thái
  const filteredWords = selectedStatus === 'Tất cả trạng thái'
    ? forbiddenWords
    : forbiddenWords.filter(word => word.status === selectedStatus);

  // Thêm từ cấm
  const handleAddForbiddenWord = async () => {
    if (!newWord.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/forbidden_words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: newWord, added_by: 'Admin', status: 'Chưa duyệt' }),
      });
      const data = await res.json();
      if (data.success) {
        setForbiddenWords(prev => [data.forbiddenWord, ...prev]);
        setShowAddModal(false);
        setNewWord('');
        setToast({ message: 'Thêm từ cấm thành công!', type: 'success' });
      }
    } finally {
      setAdding(false);
    }
  };

  // Xóa từ cấm
  const handleDeleteForbiddenWord = async (id: string) => {
    console.log('Xóa từ cấm id:', id);
    if (!window.confirm('Bạn có chắc muốn xóa từ này?')) return;
    const res = await fetch(`/api/forbidden_words/${id}`, { method: 'DELETE' });
    const data = await res.json();
    console.log('Kết quả xóa:', data);
    if (data.success) {
      setForbiddenWords(prev => prev.filter(w => w.id !== id));
    } else {
      setToast({ message: 'Xóa thất bại!', type: 'error' });
    }
  };

  // Hàm xử lý mở auth modal
  const handleOpenAuth = (tab: 'login' | 'signup') => {
    console.log(`Mở tab ${tab}`); // Thay bằng logic mở modal
  };

  return (
    <AdminLayout onOpenAuth={handleOpenAuth}>
      <main className="flex-1 bg-white">
        {/* Toast notification */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý từ cấm</h1>
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
                onClick={() => setShowAddModal(true)}
              >
                <span className="material-symbols-outlined">add</span>
                Thêm từ cấm
              </button>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] table-fixed">
                <thead className="bg-white border-b border-[#DBE0E5]">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-900 w-[50px]">STT</th>
                    <th className="text-left p-4 font-medium text-gray-900 w-[200px]">Từ cấm</th>
                    <th className="text-left p-4 font-medium text-gray-900 w-[150px]">Ngày thêm</th>
                    <th className="text-left p-4 font-medium text-gray-900 w-[150px]">Người thêm</th>
                    <th className="text-left p-4 font-medium text-gray-900 w-[150px]">Trạng thái</th>
                    <th className="text-left p-4 font-medium text-gray-900 w-[150px]">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="p-4 text-center">Đang tải...</td></tr>
                  ) : filteredWords.length === 0 ? (
                    <tr><td colSpan={6} className="p-4 text-center">Không có từ cấm nào</td></tr>
                  ) : (
                    filteredWords.map((fw) => (
                      <tr key={fw.id} className="border-b border-[#E5E8EB]">
                        <td className="p-4 text-gray-800 whitespace-nowrap">{fw.stt}</td>
                        <td className="p-4 text-gray-800 whitespace-nowrap">{fw.word}</td>
                        <td className="p-4 text-gray-800 whitespace-nowrap">{fw.added_at}</td>
                        <td className="p-4 text-gray-800 whitespace-nowrap">{fw.added_by}</td>
                        <td className="p-4">
                          <span className={`px-4 py-1 rounded-2xl text-gray-900 whitespace-nowrap ${
                            fw.status === 'Đã duyệt' ? 'bg-[#AECBEB]' : 'bg-[#F0F2F5]'
                          }`}>
                            {fw.status}
                          </span>
                        </td>
                        <td className="p-4 flex gap-2 whitespace-nowrap">
                          <span className="material-symbols-outlined text-blue-500">visibility</span>
                          <span className="material-symbols-outlined text-gray-500 cursor-pointer hover:text-red-500" onClick={() => handleDeleteForbiddenWord(fw.id)} title="Xóa">delete</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal thêm từ cấm */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl animate-[modalFadeIn_0.3s_ease-out]" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Thêm từ cấm mới</h2>
            <input
              className="w-full border px-4 py-2 rounded mb-4"
              placeholder="Nhập từ cấm..."
              value={newWord}
              onChange={e => setNewWord(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowAddModal(false)}>Hủy</button>
              <button className="px-4 py-2 rounded bg-blue-500 text-white" onClick={handleAddForbiddenWord} disabled={adding}>{adding ? 'Đang thêm...' : 'Thêm'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}