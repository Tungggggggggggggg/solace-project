'use client';

import { useEffect, useState } from 'react';
import { FiSearch, FiChevronDown, FiTrash2, FiEye, FiCheck } from 'react-icons/fi';
import AdminLayout from '@/components/AdminLayout';

type Post = {
  id: string;
  content: string;
  created_at: string;
  type_post: 'positive' | 'negative';
  is_approved: boolean;
  like_count: number;
  first_name: string;
  last_name: string;
};

export default function PostManagementPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'all' | 'positive' | 'negative'>('all');
  const [status, setStatus] = useState<'all' | 'approved' | 'pending'>('all');
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchPosts = async () => {
    const params = new URLSearchParams();
    if (type !== 'all') params.set('type', type);
    if (status !== 'all') params.set('status', status);
    if (search.trim()) params.set('search', search);

    const res = await fetch(`http://localhost:5000/api/posts?${params.toString()}`);
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, [type, status]);

  useEffect(() => {
    if (search.trim() === '') fetchPosts();
  }, [search]);

  const handleApprove = async (id: string) => {
    await fetch(`http://localhost:5000/api/posts/${id}/approve`, { method: 'PUT' });
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa bài này?')) {
      await fetch(`http://localhost:5000/api/posts/${id}`, { method: 'DELETE' });
      fetchPosts();
    }
  };

  return (
    <AdminLayout onOpenAuth={() => {}}>
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Quản lý bài đăng</h1>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
              placeholder="Tìm kiếm bài viết..."
              className="pl-10 pr-4 py-2 bg-[#F5F0E5] rounded-xl text-gray-800 w-full outline-none"
            />
          </div>
          <button
            onClick={() => setType('positive')}
            className={`px-4 py-2 text-gray-800 rounded-lg transition-all duration-200 
             bg-blue-100 ${type === 'positive' ? 'ring-2 ring-blue-400 font-semibold' : ''}`}
          >
            Tích cực
          </button>
          <button
            onClick={() => setType('negative')}
            className={`px-4 py-2 text-gray-800 rounded-lg transition-all duration-200 
             bg-red-100 ${type === 'negative' ? 'ring-2 ring-red-400 font-semibold' : ''}`}
          >
            Tiêu cực
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="px-4 py-2 text-gray-800 border rounded-xl bg-white flex items-center gap-2"
            >
              {status === 'all' ? 'Tất cả trạng thái' : status === 'approved' ? 'Đã duyệt' : 'Chưa duyệt'}
              <FiChevronDown />
            </button>

            {showDropdown && (
              <ul className="absolute bg-white shadow-md rounded-xl mt-1 w-40 z-10">
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

        {/* Posts Table */}
        <div className="border rounded-xl overflow-x-auto">
          <div className="max-h-[500px] overflow-y-auto min-w-[700px]">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="text-left">
                  <th className="p-4 text-gray-800">Nội dung</th>
                  <th className="p-4 text-gray-800">Loại</th>
                  <th className="p-4 text-gray-800">Người đăng</th>
                  <th className="p-4 text-gray-800">Ngày đăng</th>
                  <th className="p-4 text-gray-800">Cảm xúc</th>
                  <th className="p-4 text-gray-800">Trạng thái</th>
                  <th className="p-4 text-gray-800">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-500">
                      {search.trim()
                          ? 'Không có kết quả nào phù hợp với từ khóa tìm kiếm.'
                          : 'Không có bài viết nào phù hợp với bộ lọc hiện tại.'}
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="border-t">
                      <td className="p-4 text-gray-800">{post.content}</td>
                      <td className="p-4 text-gray-800">
                        <span className={`px-2 py-1 rounded-full text-sm ${post.type_post === 'positive' ? 'bg-blue-200' : 'bg-red-100'}`}>
                          {post.type_post === 'positive' ? 'Tích cực' : 'Tiêu cực'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-800">{post.first_name} {post.last_name}</td>
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
                        <button className="text-blue-500 hover:underline">
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
    </AdminLayout>
  );
}
