'use client';

import { useRef } from 'react';
import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import { FiSearch, FiChevronDown, FiEdit2, FiLock, FiUnlock } from 'react-icons/fi';
import AdminLayout from '@/components/AdminLayout';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FilteredInput from '@/components/FilteredInput';



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
  const [selectedStatus, setSelectedStatus] = useState('Tất cả trạng thái');
  const [showDropdown, setShowDropdown] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [emptyReason, setEmptyReason] = useState<'search' | 'filter' | null>(null);




  // Fetch danh sách người dùng
  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      let reason: 'search' | 'filter' | null = null;
  
      if (selectedStatus !== 'Tất cả trạng thái') {
        params.set('status', selectedStatus);
        reason = 'filter';
      }
  
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus]);

  useEffect(() => {
    if (searchText.trim() === '') {
      fetchUsers();
      
    }
        // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);
  

  const handleSearch = () => {
    fetchUsers();
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await fetch(`http://localhost:5000/api/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      toast.success(`Tài khoản đã được ${currentStatus ? 'khóa' : 'mở khóa'} thành công!`);
  
      // Refresh danh sách
      fetchUsers();
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      toast.error('Đã xảy ra lỗi khi cập nhật trạng thái tài khoản.');
    }
  };
  // Kiểm tra email hợp lệ
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleOpenAuth = (tab: 'login' | 'signup') => {
    console.log(`Mở tab ${tab}`);
  };

  return (
    <AdminLayout onOpenAuth={handleOpenAuth}>
      <main className="flex-1 bg-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 flex">
              <div className="w-10 h-10 bg-[#F0F2F5] flex items-center justify-center rounded-l-xl">
                <FiSearch className="w-5 h-5 text-[#3D4D5C]" />
              </div>
              <FilteredInput
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm kiếm người dùng..."
                className="flex-1 px-4 py-2 bg-[#F0F2F5] rounded-r-xl text-[#3D4D5C] outline-none"
              />
            </div>
            <div className="relative">
            <button
              ref={dropdownButtonRef}
              onClick={() => {
                setShowDropdown(!showDropdown);

                // Tính vị trí button để hiển thị dropdown đúng chỗ
                if (!showDropdown && dropdownButtonRef.current) {
                  const rect = dropdownButtonRef.current.getBoundingClientRect();
                  setDropdownPosition({
                    top: rect.bottom + window.scrollY + 4,
                    left: rect.left + window.scrollX
                  });
                }
              }}
              className="px-4 py-2 border border-[#E8DECF] rounded-xl flex items-center gap-2 text-gray-800 bg-white shadow-sm hover:bg-gray-50"
            >
              <span>{selectedStatus}</span>
              <FiChevronDown className="w-5 h-5" />
            </button>
            {showDropdown && (
              <div
                className="fixed w-48 bg-white border border-[#E8DECF] rounded-xl shadow-lg z-50"
                style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
              >
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
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-white border-b border-[#DBE0E5] sticky top-0 z-10">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-900 bg-white">Tên người dùng</th>
                    <th className="text-left p-4 font-medium text-gray-900 bg-white">Email</th>
                    <th className="text-left p-4 font-medium text-gray-900 bg-white">Trạng thái</th>
                    <th className="text-left p-4 font-medium text-gray-900 bg-white">Bài đăng</th>
                    <th className="text-left p-4 font-medium text-gray-900 bg-white">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        {emptyReason === 'search'
                          ? 'Không có kết quả nào phù hợp với từ khóa tìm kiếm.'
                          : emptyReason === 'filter'
                          ? 'Không có người nào phù hợp với bộ lọc hiện tại.'
                          : 'Không có người dùng nào.'}
                      </td>
                    </tr>
                  )}
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-[#E5E8EB]">
                      <td className="p-4 text-gray-800">{user.first_name} {user.last_name}</td>
                      <td className="p-4 text-gray-800">{user.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-4 py-1 rounded-2xl text-gray-900 ${
                            user.user_info?.is_active ? 'bg-[#AECBEB]' : 'bg-[#F0F2F5]'
                          }`}
                        >
                          {user.user_info?.is_active ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-800">{user.posts_count}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                        <button
                          className="p-2 hover:bg-gray-100 rounded-full"
                          onClick={() => setEditingUser(user)}
                        >
                          <FiEdit2 className="w-5 h-5 text-gray-800" />
                        </button>

                          <button
                            className="p-2 hover:bg-gray-100 rounded-full"
                            onClick={() =>
                              toggleUserStatus(user.id, user.user_info?.is_active ?? false)
                            }
                          >
                            {user.user_info?.is_active ? (
                              <FiLock className="w-5 h-5 text-gray-800" />
                            ) : (
                              <FiUnlock className="w-5 h-5 text-gray-800" />
                            )}
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <ToastContainer position="top-right" autoClose={4000} aria-label="Thông báo hệ thống" />
      {editingUser && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setEditingUser(null)}
        >
          <div
            className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()} // Chặn đóng khi click trong popup
          >
            <h2 className="text-2xl text-gray-800 font-bold mb-4">Chỉnh sửa người dùng</h2>
            <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First_name</label>
                <FilteredInput
                  type="text"
                  className="w-full px-4 py-2 text-gray-800 border rounded-xl mt-1"
                  value={editingUser.first_name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, first_name: e.target.value })
                  }
                 />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last_name</label>
                <FilteredInput
                  type="text"
                  className="w-full px-4 py-2 text-gray-800 border rounded-xl mt-1"
                  value={editingUser.last_name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, last_name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <FilteredInput
                  type="email"
                  className="w-full px-4 py-2 text-gray-800 border rounded-xl mt-1"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 text-gray-800 bg-gray-200 rounded-xl"
                onClick={() => setEditingUser(null)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-xl"
                onClick={async () => {
                  if (
                    !editingUser.first_name.trim() ||
                    !editingUser.last_name.trim() ||
                    !editingUser.email.trim()
                  ) {
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

    </AdminLayout>
  );
}
