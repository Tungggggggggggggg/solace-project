'use client';

import { useEffect, useRef, useState } from 'react';
import { FiSearch, FiChevronDown, FiTrash2, FiEye, FiCheck } from 'react-icons/fi';
import AdminLayout from '@/components/AdminLayout';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FilteredInput from '@/components/FilteredInput';

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
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, status]);

  useEffect(() => {
    if (search.trim() === '') fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleApprove = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    await fetch(`http://localhost:5000/api/admin/posts/${id}/approve`, { method: 'PUT' });
    toast.success(`Đã duyệt bài: "${post.content.slice(0, 50)}..."`);
    fetchPosts();
  };

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [sharedPost, setSharedPost] = useState<Post | null>(null);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

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
    <AdminLayout onOpenAuth={() => {}}>
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Quản lý bài đăng</h1>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <FilteredInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
              placeholder="Tìm kiếm bài viết..."
              className="pl-10 pr-4 py-2 bg-[#F5F0E5] rounded-xl text-gray-800 w-full outline-none"
            />
          </div>
          {['all', 'positive', 'negative'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t as any)}
              className={`px-4 py-2 text-gray-800 rounded-lg transition-all duration-200 ${
                t === 'all'
                  ? 'bg-gray-100 ' + (type === t ? 'ring-2 ring-gray-400 font-semibold' : '')
                  : t === 'positive'
                  ? 'bg-blue-100 ' + (type === t ? 'ring-2 ring-blue-400 font-semibold' : '')
                  : 'bg-red-100 ' + (type === t ? 'ring-2 ring-red-400 font-semibold' : '')
              }`}
            >
              {t === 'all' ? 'Tất cả' : t === 'positive' ? 'Tích cực' : 'Tiêu cực'}
            </button>
          ))}

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
              className="px-4 py-2 text-gray-800 border rounded-xl bg-white flex items-center gap-2"
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
                    className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
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

        {/* Table */}
        <div className="border border-[#DBE0E5] rounded-xl overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-white border-b border-[#DBE0E5] sticky top-0 z-10">
                <tr className="text-left">
                  <th className="p-4 text-gray-800 bg-white">Nội dung</th>
                  <th className="p-4 text-gray-800 bg-white">Loại</th>
                  <th className="p-4 text-gray-800 bg-white">Người đăng</th>
                  <th className="p-4 text-gray-800 bg-white">Ngày đăng</th>
                  <th className="p-4 text-gray-800 bg-white">Cảm xúc</th>
                  <th className="p-4 text-gray-800 bg-white">Trạng thái</th>
                  <th className="p-4 text-gray-800 bg-white">Hành động</th>
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
                    <tr key={post.id} className="bg-white border-b border-[#E5E8EB]">
                      <td className="p-4 text-gray-800 max-w-[300px] truncate" title={post.content}>
                        {post.content}
                      </td>
                      <td className="p-4 text-gray-800">
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            post.type_post === 'positive' ? 'bg-blue-200' : 'bg-red-100'
                          }`}
                        >
                          {post.type_post === 'positive' ? 'Tích cực' : 'Tiêu cực'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-800 max-w-[200px] truncate">
                        {post.first_name} {post.last_name}
                      </td>
                      <td className="p-4 text-gray-800">{new Date(post.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-gray-800">{post.like_count}</td>
                      <td className="p-4 text-gray-800">
                        {post.is_approved ? (
                          <span className="px-2 py-1 bg-green-200 rounded-full text-sm">Đã duyệt</span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-200 rounded-full text-sm">Chưa duyệt</span>
                        )}
                      </td>
                      <td className="p-4 flex gap-2">
                        <button className="text-blue-500 hover:underline" onClick={() => handleViewPost(post.id)}>
                          <FiEye />
                        </button>
                        {!post.is_approved && (
                          <button onClick={() => handleApprove(post.id)} className="text-green-600 hover:underline">
                            <FiCheck />
                          </button>
                        )}
                        <button onClick={() => handleDelete(post.id)} className="text-red-500 hover:underline">
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

      {/* Modal Xem chi tiết */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]" onClick={() => { setSelectedPost(null); setSharedPost(null); }}>
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            {/* Thông tin bài đăng */}
            <div className="flex items-center gap-4 mb-4">
              <img src={selectedPost.avatar_url || '/avatar.jpg'} alt="avatar" className="w-12 h-12 rounded-full object-cover border" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Bài viết của {selectedPost.first_name} {selectedPost.last_name}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(selectedPost.created_at).toLocaleString()} · {
                    selectedPost.access_modifier === 'lock' ? 'Chỉ mình tôi' :
                    selectedPost.access_modifier === 'people' ? 'Mọi người' : 'Công khai'
                  }
                </p>
                {sharedPost && (
                  <div className="text-xs text-gray-500">
                    đã chia sẻ bài viết của {sharedPost.first_name} {sharedPost.last_name}
                  </div>
                )}
              </div>
            </div>
            <p className="text-gray-700 mb-4 whitespace-pre-line">{selectedPost.content}</p>
            {/* Ảnh bài đăng */}
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
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {parsedImages.map((img, i) => (
                    <img key={i} src={img} alt={`Image ${i}`} className="w-full rounded-xl object-cover shadow" />
                  ))}
                </div>
              ) : null;
            })()}
            {/* Nếu là bài share thì hiển thị bài gốc trong khung bo viền */}
            {sharedPost && (
              <div className="border rounded-lg bg-gray-50 p-3 mt-2">
                <div className="flex items-center gap-3 mb-1">
                  <img
                    src={sharedPost.avatar_url || '/avatar.jpg'}
                    alt="avatar"
                    width={32}
                    height={32}
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
                      try { imgs = JSON.parse(sharedPost.images); } catch {}
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
                          width={96}
                          height={96}
                          className="w-24 h-24 object-cover rounded border"
                        />
                      ))}
                    </div>
                  ) : null;
                })()}
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition" onClick={() => { setSelectedPost(null); setSharedPost(null); }}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {deletePostId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]" onClick={() => setDeletePostId(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Xác nhận xóa</h2>
              <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa bài đăng này không? Hành động này không thể hoàn tác.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition" onClick={() => setDeletePostId(null)}>
                Hủy
              </button>
              <button className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition font-medium" onClick={confirmDeletePost}>
                Xóa bài
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
