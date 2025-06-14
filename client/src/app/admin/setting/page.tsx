'use client';

import React, { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiSearch, FiEye, FiTrash2 } from 'react-icons/fi';
import FilteredInput from '@/components/FilteredInput';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (search.trim() === '') fetchWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleDelete = async (id: string) => {
    setDeleteWordId(id); // Mở modal xác nhận
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
      body: JSON.stringify({ word: newWord.trim() })
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
    <AdminLayout onOpenAuth={() => {}}>
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Quản lý từ cấm</h1>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
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
              className="pl-10 pr-4 py-2 bg-[#F5F0E5] rounded-xl text-gray-800 w-full outline-none"
            />
          </div>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600"
            onClick={() => setShowAddModal(true)}
          >
            + Thêm từ cấm
          </button>
        </div>
        {/* Forbidden Words Table */}
        <div className="border border-[#DBE0E5] rounded-xl overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-white border-b border-[#DBE0E5] sticky top-0 z-10">
                <tr className="text-left">
                  <th className="p-4 text-gray-800 bg-white">Mã</th>
                  <th className="p-4 text-gray-800 bg-white">Từ cấm</th>
                  <th className="p-4 text-gray-800 bg-white">Ngày thêm</th>
                  <th className="p-4 text-gray-800 bg-white">Hành động</th>
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
                    <tr key={word.id} className="bg-white border-b border-[#E5E8EB]">
                      <td className="p-4 text-gray-800">{word.id}</td>
                      <td className="p-4 text-gray-800">{word.word}</td>
                      <td className="p-4 text-gray-800">{word.added_at}</td>
                      <td className="p-4 flex gap-2">
                        <button className="text-blue-500 hover:underline" onClick={() => setSelectedWord(word)}>
                          <FiEye />
                        </button>
                        <button onClick={() => handleDelete(word.id)} className="text-red-500 hover:underline">
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
      {selectedWord && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]"
          onClick={() => setSelectedWord(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full animate-fadeIn"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-6 text-center text-gray-800">Chi tiết từ cấm</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-base text-gray-700">Mã:</span>
                <span className="text-base text-gray-800">{selectedWord.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-base text-gray-700">Từ cấm:</span>
                <span className="text-base text-gray-800">{selectedWord.word}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-base text-gray-700">Ngày thêm:</span>
                <span className="text-base text-gray-800">{selectedWord.added_at}</span>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
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
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full animate-fadeIn"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Thêm từ cấm mới</h2>
            <FilteredInput
              className="w-full p-3 border rounded-lg mb-4"
              placeholder="Nhập từ cấm..."
              value={newWord}
              onChange={e => setNewWord(e.target.value)}
              disabled={adding}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={handleAddWord}
                disabled={adding}
              >
                {adding ? 'Đang thêm...' : 'Thêm'}
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]" onClick={() => setDeleteWordId(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md animate-fadeIn" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Xác nhận xóa</h2>
              <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa từ cấm này không? Hành động này không thể hoàn tác.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition" onClick={() => setDeleteWordId(null)}>
                Hủy
              </button>
              <button className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition font-medium" onClick={confirmDelete}>
                Xóa từ cấm
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}