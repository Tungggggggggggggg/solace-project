'use client';

import { useRef, useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import { FiSearch, FiEdit2, FiLock, FiUnlock } from 'react-icons/fi';
import AdminLayout from '@/components/AdminLayout';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FilteredInput from '@/components/FilteredInput';
import AdminGuard from '@/components/AdminGuard';

type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  user_info?: {
    is_active: boolean;
    created_at: string;
  };
  posts_count: number;
};

export default function UserManagementPage(): ReactElement {
  const [users, setUsers] = useState<User[]>([]);
  const [searchText, setSearchText] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [emptyReason, setEmptyReason] = useState<'search' | 'filter' | null>(null);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      let reason: 'search' | 'filter' | null = null;

      if (searchText.trim()) {
        params.set('search', searchText);
        reason = 'search';
      }

      const res = await fetch(`http://localhost:5000/api/users?${params.toString()}`);
      const data = await res.json();
      setUsers(data);
      setEmptyReason(data.length === 0 ? reason : null);
    } catch (error) {
      console.error('Lỗi khi tải người dùng:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchText.trim() === '') {
      fetchUsers();
    }
  }, [searchText]);

  const handleSearch = () => {
    fetchUsers();
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await fetch(`http://localhost:5000/api/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      toast.success(`Tài khoản đã được ${currentStatus ? 'khóa' : 'mở khóa'} thành công!`);
      fetchUsers();
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      toast.error('Đã xảy ra lỗi khi cập nhật trạng thái tài khoản.');
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleOpenAuth = (tab: 'login' | 'signup') => {
    console.log(`Mở tab ${tab}`);
  };

  return (
    <AdminGuard>
      <AdminLayout onOpenAuth={handleOpenAuth}>
        <main className="p-4 sm:p-6 max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900">Quản lý người dùng</h1>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-1">
              <FiSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                onClick={handleSearch}
                style={{ zIndex: 2 }}
                title="Tìm kiếm"
              />
              <FilteredInput
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm kiếm người dùng..."
                className="pl-10 pr-4 py-2 bg-[#F5F0E5] rounded-xl text-gray-800 w-full outline-none text-sm sm:text-base"
              />
            </div>
          </div>
          {/* Danh sách người dùng trên di động */}
          <div className="block sm:hidden">
            {users.length === 0 ? (
              <div className="p-6 text-center text-gray-500 bg-white rounded-xl border">
                {emptyReason === 'search'
                  ? 'Không có kết quả nào phù hợp với từ khóa tìm kiếm.'
                  : 'Không có người dùng nào phù hợp với bộ lọc hiện tại.'}
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="bg-white border rounded-xl p-4 mb-4 shadow-sm hover:shadow-md transition">
                  <div className="flex flex-col gap-2">
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Tên người dùng:</span>{' '}
                      <span className="text-gray-700">
                        {user.first_name} {user.last_name}
                      </span>
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Email:</span>{' '}
                      <span className="text-gray-700">{user.email}</span>
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Vai trò:</span>{' '}
                      <span className="text-gray-700">{user.role}</span>
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Trạng thái:</span>{' '}
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.user_info?.is_active ? 'bg-[#AECBEB] text-gray-900' : 'bg-[#F0F2F5] text-gray-500'
                        }`}
                      >
                        {user.user_info?.is_active ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Bài đăng:</span>{' '}
                      <span className="text-gray-700">{user.posts_count}</span>
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button className="text-blue-500 hover:text-blue-600" onClick={() => setEditingUser(user)}>
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user.id, user.user_info?.is_active ?? false)}
                        className="text-red-500 hover:text-red-600"
                      >
                        {user.user_info?.is_active ? <FiLock size={18} /> : <FiUnlock size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Bảng cho màn hình lớn */}
          <div className="hidden sm:block border border-[#DBE0E5] rounded-xl overflow-x-auto bg-white">
            <table className="w-full min-w-[800px] text-sm">
              <thead className="bg-white border-b border-[#DBE0E5] sticky top-0 z-10">
                <tr className="text-left">
                  <th className="p-3 text-gray-800 bg-white">Tên người dùng</th>
                  <th className="p-3 text-gray-800 bg-white">Email</th>
                  <th className="p-3 text-gray-800 bg-white min-w-[110px]">Trạng thái</th>
                  <th className="p-3 text-gray-800 bg-white">Bài đăng</th>
                  <th className="p-3 text-gray-800 bg-white">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500 bg-white">
                      {emptyReason === 'search'
                        ? 'Không có kết quả nào phù hợp với từ khóa tìm kiếm.'
                        : 'Không có người dùng nào phù hợp với bộ lọc hiện tại.'}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="bg-white border-b border-[#E5E8EB] hover:bg-gray-50 transition">
                      <td className="p-3 break-words whitespace-pre-line">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="p-3 break-words whitespace-pre-line">{user.email}</td>
                      <td className="p-3 min-w-[110px]">
                        <span
                          className={`px-3 py-1 rounded-2xl text-xs font-medium whitespace-nowrap ${
                            user.user_info?.is_active ? 'bg-[#AECBEB] text-gray-900' : 'bg-[#F0F2F5] text-gray-500'
                          }`}
                        >
                          {user.user_info?.is_active ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="p-3 break-words whitespace-pre-line">{user.posts_count}</td>
                      <td className="p-3 flex gap-2">
                        <button className="text-blue-500 hover:text-blue-600" onClick={() => setEditingUser(user)}>
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id, user.user_info?.is_active ?? false)}
                          className="text-red-500 hover:text-red-600"
                        >
                          {user.user_info?.is_active ? <FiLock /> : <FiUnlock />}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <ToastContainer position="top-right" autoClose={4000} aria-label="Thông báo hệ thống" />
          {/* Modal chỉnh sửa người dùng */}
          {editingUser && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
              onClick={() => setEditingUser(null)}
            >
              <div
                className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 max-w-sm w-full animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center text-gray-800">
                  Chỉnh sửa người dùng
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="font-medium text-sm sm:text-base text-gray-700">Họ:</span>
                    <FilteredInput
                      type="text"
                      className="w-full sm:w-2/3 p-2 border rounded-xl text-sm sm:text-base"
                      value={editingUser.first_name}
                      onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="font-medium text-sm sm:text-base text-gray-700">Tên:</span>
                    <FilteredInput
                      type="text"
                      className="w-full sm:w-2/3 p-2 border rounded-xl text-sm sm:text-base"
                      value={editingUser.last_name}
                      onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="font-medium text-sm sm:text-base text-gray-700">Email:</span>
                    <FilteredInput
                      type="email"
                      className="w-full sm:w-2/3 p-2 border rounded-xl text-sm sm:text-base"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4 sm:mt-6 gap-2">
                  <button
                    className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 text-sm sm:text-base"
                    onClick={() => setEditingUser(null)}
                  >
                    Đóng
                  </button>
                  <button
                    className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 text-sm sm:text-base"
                    onClick={async () => {
                      if (!editingUser.first_name.trim() || !editingUser.last_name.trim() || !editingUser.email.trim()) {
                        toast.error('Vui lòng nhập đầy đủ họ, tên và email!');
                        return;
                      }
                      if (!isValidEmail(editingUser.email)) {
                        toast.error('Email không đúng định dạng!');
                        return;
                      }
                      await fetch(`http://localhost:5000/api/users/${editingUser.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          first_name: editingUser.first_name,
                          last_name: editingUser.last_name,
                          email: editingUser.email,
                        }),
                      });
                      toast.success('Đã lưu thông tin chỉnh sửa thành công!');
                      setEditingUser(null);
                      fetchUsers();
                    }}
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </AdminLayout>
    </AdminGuard>
  );
}