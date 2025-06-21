'use client';

import { useEffect, useRef, useState } from 'react';
import { FiSearch, FiChevronDown, FiTrash2, FiEye, FiCheck } from 'react-icons/fi';
import AdminLayout from '@/components/AdminLayout';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FilteredInput from '@/components/FilteredInput';
import { socket } from '@/socket';
import AdminGuard from '@/components/AdminGuard';

type Post = {
  id: string;
  content: string;
  created_at: string;
  type_post: 'positive' | 'negative';
  is_approved: boolean;
  like_count: number;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  access_modifier?: 'public' | 'people' | 'lock';
  images?: string[] | string;
  shared_post_id?: string | null;
};

export default function PostManagementPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'all' | 'positive' | 'negative'>('all');
  const [status, setStatus] = useState<'all' | 'approved' | 'pending'>('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const filterDropdownRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [filterDropdownPos, setFilterDropdownPos] = useState({ top: 0, left: 0 });
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [sharedPost, setSharedPost] = useState<Post | null>(null);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

  const fetchPosts = async () => {
    const params = new URLSearchParams();
    if (type !== 'all') params.set('type', type);
    if (status !== 'all') params.set('status', status);
    if (search.trim()) params.set('search', search);

    const res = await fetch(`http://localhost:5000/api/admin/posts?${params.toString()}`);
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();

    const handleNewPost = (data: { post: Post }) => {
      setPosts((prev) => [data.post, ...prev]);
    };

    const handlePostApproved = (data: { post: Post }) => {
      setPosts((prev) =>
        prev.map((p) => (p.id === data.post.id ? { ...p, is_approved: true } : p))
      );
    };

    const handlePostDeleted = (data: { postId: string }) => {
      setPosts((prev) => prev.filter((p) => p.id !== data.postId));
    };

    socket.on('newPost', handleNewPost);
    socket.on('postApproved', handlePostApproved);
    socket.on('postDeleted', handlePostDeleted);

    return () => {
      socket.off('newPost', handleNewPost);
      socket.off('postApproved', handlePostApproved);
      socket.off('postDeleted', handlePostDeleted);
    };
  }, [type, status]);

  useEffect(() => {
    if (search.trim() === '') fetchPosts();
  }, [search]);

  const handleApprove = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    await fetch(`http://localhost:5000/api/admin/posts/${id}/approve`, { method: 'PUT' });
    toast.success(`Đã duyệt bài: "${post.content.slice(0, 50)}..."`);
    fetchPosts();
  };

  const handleViewPost = async (postId: string) => {
    setSelectedPost(null);
    setSharedPost(null);
    try {
      const res = await fetch(`/api/admin/posts/${postId}`);
      if (!res.ok) return;
      const data = await res.json();
      setSelectedPost(data.post);
      setSharedPost(data.shared_post);
    } catch {
      setSelectedPost(null);
      setSharedPost(null);
    }
  };

  const handleDelete = (id: string) => {
    setDeletePostId(id);
  };

  const confirmDeletePost = async () => {
    if (deletePostId) {
      const post = posts.find((p) => p.id === deletePostId);
      if (!post) return;
      await fetch(`http://localhost:5000/api/admin/posts/${deletePostId}`, { method: 'DELETE' });
      toast.success(`Đã xóa bài: "${post.content.slice(0, 50)}..."`);
      setDeletePostId(null);
      fetchPosts();
    }
  };

  return (
    <AdminGuard>
      <AdminLayout onOpenAuth={() => {}}>
        <main className="p-4 sm:p-6 max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900">Quản lý bài đăng</h1>

          {/* Bộ lọc */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-1">
              <FiSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                onClick={fetchPosts}
                title="Tìm kiếm"
              />
              <FilteredInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
                placeholder="Tìm kiếm bài viết..."
                className="pl-10 pr-4 py-2 bg-[#F5F0E5] rounded-xl text-gray-800 w-full outline-none text-sm sm:text-base"
              />
            </div>
            <div className="relative">
              <button
                ref={filterDropdownRef}
                onClick={() => {
                  setShowFilterDropdown(!showFilterDropdown);
                  if (!showFilterDropdown && filterDropdownRef.current) {
                    const rect = filterDropdownRef.current.getBoundingClientRect();
                    setFilterDropdownPos({
                      top: rect.bottom + window.scrollY + 4,
                      left: rect.left + window.scrollX,
                    });
                  }
                }}
                className="px-4 py-2 text-gray-800 border rounded-xl bg-white flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto"
              >
                {type === 'all' ? 'Loại: Tất cả' : type === 'positive' ? 'Loại: Tích cực' : 'Loại: Tiêu cực'}
                <FiChevronDown />
              </button>
              {showFilterDropdown && (
                <ul
                  className="fixed w-40 bg-white shadow-md rounded-xl z-[9999] border"
                  style={{ top: filterDropdownPos.top, left: filterDropdownPos.left }}
                >
                  {['all', 'positive', 'negative'].map((t) => (
                    <li
                      key={t}
                      className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setType(t as any);
                        setShowFilterDropdown(false);
                      }}
                    >
                      {t === 'all' ? 'Tất cả' : t === 'positive' ? 'Tích cực' : 'Tiêu cực'}
                    </li>
                  ))}
                </ul>
              )}
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
                      left: rect.left + window.scrollX,
                    });
                  }
                }}
                className="px-4 py-2 text-gray-800 border rounded-xl bg-white flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto"
              >
                {status === 'all' ? 'Tất cả trạng thái' : status === 'approved' ? 'Đã duyệt' : 'Chưa duyệt'}
                <FiChevronDown />
              </button>
              {showDropdown && (
                <ul
                  className="fixed w-40 bg-white shadow-md rounded-xl z-[9999] border"
                  style={{ top: dropdownPos.top, left: dropdownPos.left }}
                >
                  {['all', 'approved', 'pending'].map((s) => (
                    <li
                      key={s}
                      className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setStatus(s as any);
                        setShowDropdown(false);
                      }}
                    >
                      {s === 'all' ? 'Tất cả trạng thái' : s === 'approved' ? 'Đã duyệt' : 'Chưa duyệt'}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Danh sách bài đăng trên di động */}
          <div className="block sm:hidden">
            {posts.length === 0 ? (
              <div className="p-6 text-center text-gray-500 bg-white rounded-xl border">
                {search.trim()
                  ? 'Không có kết quả nào phù hợp với từ khóa tìm kiếm.'
                  : 'Không có bài viết nào phù hợp với bộ lọc hiện tại.'}
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white border rounded-xl p-4 mb-4 shadow-sm hover:shadow-md transition">
                  <div className="flex flex-col gap-2">
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Người đăng:</span>{' '}
                      <span className="text-gray-700">{post.first_name} {post.last_name}</span>
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Nội dung:</span>{' '}
                      <span className="text-gray-700 whitespace-pre-line" title={post.content}>
                        {post.content.length > 100 ? post.content.slice(0, 100) + '...' : post.content}
                      </span>
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Loại:</span>{' '}
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          post.type_post === 'positive' ? 'bg-blue-200' : 'bg-red-100'
                        }`}
                      >
                        {post.type_post === 'positive' ? 'Tích cực' : 'Tiêu cực'}
                      </span>
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Ngày đăng:</span>{' '}
                      <span className="text-gray-700">{new Date(post.created_at).toLocaleDateString()}</span>
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Cảm xúc:</span>{' '}
                      <span className="text-gray-700">{post.like_count}</span>
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Trạng thái:</span>{' '}
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          post.is_approved ? 'bg-green-200' : 'bg-yellow-200'
                        }`}
                      >
                        {post.is_approved ? 'Đã duyệt' : 'Chưa duyệt'}
                      </span>
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button className="text-blue-500 hover:text-blue-600" onClick={() => handleViewPost(post.id)}>
                        <FiEye size={18} />
                      </button>
                      {!post.is_approved && (
                        <button onClick={() => handleApprove(post.id)} className="text-green-600 hover:text-green-700">
                          <FiCheck size={18} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(post.id)} className="text-red-500 hover:text-red-600">
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
            <table className="w-full min-w-[800px] text-sm">
              <thead className="bg-white border-b border-[#DBE0E5] sticky top-0 z-10">
                <tr className="text-left">
                  <th className="p-3 text-gray-800 bg-white">Nội dung</th>
                  <th className="p-3 text-gray-800 bg-white">Loại</th>
                  <th className="p-3 text-gray-800 bg-white">Người đăng</th>
                  <th className="p-3 text-gray-800 bg-white">Ngày đăng</th>
                  <th className="p-3 text-gray-800 bg-white">Cảm xúc</th>
                  <th className="p-3 text-gray-800 bg-white min-w-[110px]">Trạng thái</th>
                  <th className="p-3 text-gray-800 bg-white">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-500 bg-white">
                      {search.trim()
                        ? 'Không có kết quả nào phù hợp với từ khóa tìm kiếm.'
                        : 'Không có bài viết nào phù hợp với bộ lọc hiện tại.'}
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="bg-white border-b border-[#E5E8EB] hover:bg-gray-50 transition">
                      <td className="p-3 break-words whitespace-pre-line" title={post.content}>
                        {post.content.length > 40 ? post.content.slice(0, 40) + '...' : post.content}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            post.type_post === 'positive' ? 'bg-blue-200' : 'bg-red-100'
                          }`}
                        >
                          {post.type_post === 'positive' ? 'Tích cực' : 'Tiêu cực'}
                        </span>
                      </td>
                      <td className="p-3 break-words whitespace-pre-line">
                        {post.first_name} {post.last_name}
                      </td>
                      <td className="p-3 whitespace-nowrap">{new Date(post.created_at).toLocaleDateString()}</td>
                      <td className="p-3">{post.like_count}</td>
                      <td className="p-3 min-w-[110px] whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            post.is_approved ? 'bg-green-200' : 'bg-yellow-200'
                          }`}
                        >
                          {post.is_approved ? 'Đã duyệt' : 'Chưa duyệt'}
                        </span>
                      </td>
                      <td className="p-3 flex gap-2">
                        <button className="text-blue-500 hover:text-blue-600" onClick={() => handleViewPost(post.id)}>
                          <FiEye />
                        </button>
                        {!post.is_approved && (
                          <button
                            onClick={() => handleApprove(post.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <FiCheck />
                          </button>
                        )}
                        <button onClick={() => handleDelete(post.id)} className="text-red-500 hover:text-red-600">
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

          {/* Modal Xem chi tiết */}
          {selectedPost && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
              onClick={() => {
                setSelectedPost(null);
                setSharedPost(null);
              }}
            >
              <div
                className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                  <img
                    src={selectedPost.avatar_url || '/avatar.jpg'}
                    alt="avatar"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border"
                  />
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                      Bài viết của {selectedPost.first_name} {selectedPost.last_name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {new Date(selectedPost.created_at).toLocaleString()} ·{' '}
                      {selectedPost.access_modifier === 'lock'
                        ? 'Chỉ mình tôi'
                        : selectedPost.access_modifier === 'people'
                        ? 'Mọi người'
                        : 'Công khai'}
                    </p>
                    {sharedPost && (
                      <div className="text-xs text-gray-500">
                        đã chia sẻ bài viết của {sharedPost.first_name} {sharedPost.last_name}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 text-sm sm:text-base mb-4 whitespace-pre-line">
                  {selectedPost.content}
                </p>
                {(() => {
                  let parsedImages: string[] = [];
                  if (selectedPost.images) {
                    if (typeof selectedPost.images === 'string') {
                      try {
                        parsedImages = JSON.parse(selectedPost.images);
                      } catch {}
                    } else if (Array.isArray(selectedPost.images)) {
                      parsedImages = selectedPost.images;
                    }
                  }
                  return parsedImages.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {parsedImages.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Image ${i}`}
                          className="w-full rounded-xl object-cover shadow"
                        />
                      ))}
                    </div>
                  ) : null;
                })()}
                {sharedPost && (
                  <div className="border rounded-lg bg-gray-50 p-3 mt-2">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1">
                      <img
                        src={sharedPost.avatar_url || '/avatar.jpg'}
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover border"
                      />
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {sharedPost.first_name} {sharedPost.last_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {sharedPost.created_at
                            ? new Date(sharedPost.created_at).toLocaleString('vi-VN')
                            : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-800 text-sm whitespace-pre-line">{sharedPost.content}</div>
                    {(() => {
                      let imgs: string[] = [];
                      if (sharedPost.images) {
                        if (typeof sharedPost.images === 'string') {
                          try {
                            imgs = JSON.parse(sharedPost.images);
                          } catch {}
                        } else if (Array.isArray(sharedPost.images)) {
                          imgs = sharedPost.images;
                        }
                      }
                      return imgs.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {imgs.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Ảnh ${idx + 1}`}
                              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded border"
                            />
                          ))}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
                <div className="flex justify-end mt-4 gap-2">
                  {!selectedPost.is_approved && (
                    <button
                      className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 text-sm sm:text-base"
                      onClick={() => {
                        handleApprove(selectedPost.id);
                        setSelectedPost(null);
                        setSharedPost(null);
                      }}
                    >
                      Duyệt bài
                    </button>
                  )}
                  <button
                    className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 text-sm sm:text-base"
                    onClick={() => {
                      setSelectedPost(null);
                      setSharedPost(null);
                    }}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal xác nhận xóa */}
          {deletePostId && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
              onClick={() => setDeletePostId(null)}
            >
              <div
                className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 w-full max-w-sm animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center text-center">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Xác nhận xóa</h2>
                  <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                    Bạn có chắc chắn muốn xóa bài đăng này không? Hành động này không thể hoàn tác.
                  </p>
                </div>
                <div className="flex justify-end gap-2 sm:gap-3">
                  <button
                    className="px-3 sm:px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-sm sm:text-base"
                    onClick={() => setDeletePostId(null)}
                  >
                    Hủy
                  </button>
                  <button
                    className="px-3 sm:px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition font-medium sm:text-center text-sm sm:text-base"
                    onClick={confirmDeletePost}
                  >
                    Xóa bài
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