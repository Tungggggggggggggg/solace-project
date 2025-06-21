'use client';

import React, { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiSearch, FiEye, FiTrash2 } from 'react-icons/fi';
import FilteredInput from '@/components/FilteredInput';
import AdminGuard from '@/components/AdminGuard';

type ForbiddenWord = {
  id: string;
  word: string;
  added_at: string;
};

export default function SettingPage(): ReactElement {
  const [words, setWords] = useState<ForbiddenWord[]>([]);
  const [search, setSearch] = useState('');
  const [selectedWord, setSelectedWord] = useState<ForbiddenWord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [adding, setAdding] = useState(false);
  const [deleteWordId, setDeleteWordId] = useState<string | null>(null);

  const fetchWords = async () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search);
    const res = await fetch(`/api/forbidden_words?${params.toString()}`);
    const result = await res.json();
    if (result.success) setWords(result.forbiddenWords);
    else setWords([]);
  };

  useEffect(() => {
    fetchWords();
  }, []);

  useEffect(() => {
    if (search.trim() === '') fetchWords();
  }, [search]);

  const handleDelete = async (id: string) => {
    setDeleteWordId(id);
  };

  const confirmDelete = async () => {
    if (deleteWordId) {
      await fetch(`/api/forbidden_words/${deleteWordId}`, { method: 'DELETE' });
      toast.success('Đã xóa từ cấm!');
      setDeleteWordId(null);
      fetchWords();
    }
  };

  const handleAddWord = async () => {
    if (!newWord.trim()) return;
    setAdding(true);
    const res = await fetch('/api/forbidden_words', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: newWord.trim() }),
    });
    const result = await res.json();
    setAdding(false);
    if (result.success) {
      toast.success('Đã thêm từ cấm mới!');
      setNewWord('');
      setShowAddModal(false);
      fetchWords();
    } else {
      toast.error('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  return (
    <AdminGuard>
      <AdminLayout onOpenAuth={() => {}}>
        <main className="p-4 sm:p-6 max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900">Quản lý từ cấm</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-1">
              <FiSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                onClick={fetchWords}
                style={{ zIndex: 2 }}
                title="Tìm kiếm"
              />
              <FilteredInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchWords()}
                placeholder="Tìm kiếm từ cấm..."
                className="pl-10 pr-4 py-2 bg-[#F5F0E5] rounded-xl text-gray-800 w-full outline-none text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Danh sách từ cấm trên di động */}
          <div className="block sm:hidden">
            {words.length === 0 ? (
              <div className="p-6 text-center text-gray-500 bg-white rounded-xl border">
                {search.trim()
                  ? 'Không có kết quả nào phù hợp với từ khóa tìm kiếm.'
                  : 'Không có từ cấm nào phù hợp với bộ lọc hiện tại.'}
              </div>
            ) : (
              words.map((word) => (
                <div key={word.id} className="bg-white border rounded-xl p-4 mb-4 shadow-sm hover:shadow-md transition">
                  <div className="flex flex-col gap-2">
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Mã:</span>{' '}
                      <span className="text-gray-700">{word.id}</span>
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Từ cấm:</span>{' '}
                      <span className="text-gray-700">{word.word}</span>
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Ngày thêm:</span>{' '}
                      <span className="text-gray-700">{word.added_at}</span>
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button className="text-blue-500 hover:text-blue-600" onClick={() => setSelectedWord(word)}>
                        <FiEye size={18} />
                      </button>
                      <button onClick={() => handleDelete(word.id)} className="text-red-500 hover:text-red-600">
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bảng cho màn hình lớn */}
          <div className="hidden sm:block border border-[#DBE0E5] rounded-xl overflow-x-auto bg-white">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-white border-b border-[#DBE0E5] sticky top-0 z-10">
                <tr className="text-left">
                  <th className="p-3 text-gray-800 bg-white">Mã</th>
                  <th className="p-3 text-gray-800 bg-white">Từ cấm</th>
                  <th className="p-3 text-gray-800 bg-white">Ngày thêm</th>
                  <th className="p-3 text-gray-800 bg-white">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {words.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-500 bg-white">
                      {search.trim()
                        ? 'Không có kết quả nào phù hợp với từ khóa tìm kiếm.'
                        : 'Không có từ cấm nào phù hợp với bộ lọc hiện tại.'}
                    </td>
                  </tr>
                ) : (
                  words.map((word) => (
                    <tr key={word.id} className="bg-white border-b border-[#E5E8EB] hover:bg-gray-50 transition">
                      <td className="p-3 text-gray-800 break-words whitespace-pre-line">{word.id}</td>
                      <td className="p-3 text-gray-800 break-words whitespace-pre-line">{word.word}</td>
                      <td className="p-3 text-gray-800 break-words whitespace-pre-line">{word.added_at}</td>
                      <td className="p-3 flex gap-2">
                        <button className="text-blue-500 hover:text-blue-600" onClick={() => setSelectedWord(word)}>
                          <FiEye />
                        </button>
                        <button onClick={() => handleDelete(word.id)} className="text-red-500 hover:text-red-600">
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <ToastContainer position="top-right" autoClose={3000} aria-label="Thông báo hệ thống" />

          {/* Modal xem chi tiết từ cấm */}
          {selectedWord && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
              onClick={() => setSelectedWord(null)}
            >
              <div
                className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 max-w-sm w-full animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center text-gray-800">Chi tiết từ cấm</h2>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm sm:text-base">Mã:</span>
                    <span className="text-sm sm:text-base text-gray-800">{selectedWord.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm sm:text-base">Từ cấm:</span>
                    <span className="text-sm sm:text-base text-gray-800">{selectedWord.word}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm sm:text-base">Ngày thêm:</span>
                    <span className="text-sm sm:text-base text-gray-800">{selectedWord.added_at}</span>
                  </div>
                </div>
                <div className="flex justify-end mt-4 sm:mt-6">
                  <button
                    className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 text-sm sm:text-base"
                    onClick={() => setSelectedWord(null)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal thêm từ cấm */}
          {showAddModal && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
              onClick={() => setShowAddModal(false)}
            >
              <div
                className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 max-w-sm w-full animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">Thêm từ cấm mới</h2>
                <FilteredInput
                  className="w-full p-2 sm:p-3 border rounded-xl mb-4 text-sm sm:text-base"
                  placeholder="Nhập từ cấm..."
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  disabled={adding}
                />
                <div className="flex justify-end gap-2">
                  <button
                    className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 text-sm sm:text-base"
                    onClick={handleAddWord}
                    disabled={adding}
                  >
                    {adding ? 'Đang thêm...' : 'Thêm'}
                  </button>
                  <button
                    className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 text-sm sm:text-base"
                    onClick={() => setShowAddModal(false)}
                    disabled={adding}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal xác nhận xóa */}
          {deleteWordId && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
              onClick={() => setDeleteWordId(null)}
            >
              <div
                className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 w-full max-w-sm animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-lg sm:text-xl font-bold mb-4 text-center text-gray-800">Xác nhận xóa</h2>
                <p className="mb-4 sm:mb-6 text-center text-gray-600 text-sm sm:text-base">
                  Bạn có chắc chắn muốn xóa từ cấm này không? Hành động này không thể hoàn tác.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm sm:text-base"
                    onClick={() => setDeleteWordId(null)}
                  >
                    Hủy
                  </button>
                  <button
                    className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium text-sm sm:text-base"
                    onClick={confirmDelete}
                  >
                    Xóa từ cấm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Nút Thêm từ cấm (sticky trên di động) */}
          <div className="block sm:hidden fixed bottom-7 right-4 z-50">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 text-sm"
              onClick={() => setShowAddModal(true)}
            >
              + Thêm từ cấm
            </button>
          </div>
        </main>
      </AdminLayout>
    </AdminGuard>
  );
}