'use client';

import { useEffect, useRef, useState } from 'react';
import { FiSearch, FiChevronDown, FiTrash2, FiEye, FiCheck } from 'react-icons/fi';
import AdminLayout from '@/components/AdminLayout';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { socket } from '@/socket';
import AdminGuard from '@/components/AdminGuard';
import { FixedSizeList as List } from 'react-window';

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
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const statusDropdownRef = useRef<HTMLButtonElement>(null);
  const timeDropdownRef = useRef<HTMLButtonElement>(null);
  const statusDropdownMenuRef = useRef<HTMLUListElement>(null);
  const timeDropdownMenuRef = useRef<HTMLUListElement>(null);
  const [sortTime, setSortTime] = useState<'newest' | 'oldest' | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [sharedPost, setSharedPost] = useState<Post | null>(null);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [listHeight, setListHeight] = useState(420);
  const [listWidth, setListWidth] = useState<string | number>('100%');
  const listRef = useRef<List>(null);

  const truncateIfNeeded = (text: string): string => {
    if (text == null || typeof text !== 'string') {
      return '';
    }
    const trimmedText = text.trim();
    
    // 1. Process each "word" based on the 7-char rule
    const processedWords = trimmedText.split(/\s+/).map(word => {
        if (word.length > 7) {
            return word.substring(0, 7); // Truncate long words
        }
        return word;
    });

    // 2. Determine word limit based on screen size
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : Infinity;
    const wordLimit = (windowWidth >= 620 && windowWidth <= 1500) ? 3 : 5;

    // 3. Apply word limit
    if (processedWords.length > wordLimit) {
        return processedWords.slice(0, wordLimit).join(' ') + '...';
    }

    // 4. Join the words and add ellipsis if any truncation happened
    const finalResult = processedWords.join(' ');
    if (finalResult.length < trimmedText.length) {
        return finalResult + '...';
    }

    return finalResult;
  };

  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector('.table-container');
      if (container) {
        const height = Math.min(600, window.innerHeight * 0.6);
        const width = container.clientWidth;
        setListHeight(height);
        setListWidth(width > 900 ? width : 900);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchPosts = async () => {
    const params = new URLSearchParams();
    if (type !== 'all') params.set('type', type);
    if (status !== 'all') params.set('status', status);
    if (search.trim()) params.set('search', search);

    const res = await fetch(`http://localhost:5000/api/admin/posts?${params.toString()}`);
    const data = await res.json();
    let sortedPosts = [...data];

    if (sortTime === 'newest') {
      sortedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortTime === 'oldest') {
      sortedPosts.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    setPosts(sortedPosts);
  };

  useEffect(() => {
    fetchPosts();

    const handleNewPost = (data: { post: Post }) => {
      setPosts((prev) =>
        [data.post, ...prev].sort((a, b) =>
          sortTime === 'newest'
            ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            : sortTime === 'oldest'
            ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            : 0
        )
      );
    };

    const handlePostApproved = (data: { post: Post }) => {
      setPosts((prev) =>
        prev
          .map((p) => (p.id === data.post.id ? { ...p, is_approved: true } : p))
          .sort((a, b) =>
            sortTime === 'newest'
              ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              : sortTime === 'oldest'
              ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              : 0
          )
      );
    };

    const handlePostDeleted = (data: { postId: string }) => {
      setPosts((prev) =>
        prev
          .filter((p) => p.id !== data.postId)
          .sort((a, b) =>
            sortTime === 'newest'
              ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              : sortTime === 'oldest'
              ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              : 0
          )
      );
    };

    socket.on('newPost', handleNewPost);
    socket.on('postApproved', handlePostApproved);
    socket.on('postDeleted', handlePostDeleted);

    return () => {
      socket.off('newPost', handleNewPost);
      socket.off('postApproved', handlePostApproved);
      socket.off('postDeleted', handlePostDeleted);
    };
  }, [type, status, sortTime]);

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

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-1">
              <FiSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                onClick={fetchPosts}
                title="Tìm kiếm"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
                placeholder="Tìm kiếm bài viết..."
                className="pl-10 pr-4 py-2 bg-[#F5F0E5] rounded-xl text-gray-800 w-full outline-none text-sm sm:text-base"
              />
            </div>
            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={() => setType('positive')}
                className={`px-4 py-2 text-gray-800 rounded-lg transition-all duration-200 ${
                  type === 'positive' ? 'bg-blue-100 ring-2 ring-blue-400 font-semibold' : 'bg-blue-100 hover:bg-blue-200'
                }`}
              >
                Tích cực
              </button>
              <button
                onClick={() => setType('negative')}
                className={`px-4 py-2 text-gray-800 rounded-lg transition-all duration-200 ${
                  type === 'negative' ? 'bg-red-100 ring-2 ring-red-400 font-semibold' : 'bg-red-100 hover:bg-red-200'
                }`}
              >
                Tiêu cực
              </button>
              <button
                onClick={() => setType('all')}
                className={`px-4 py-2 text-gray-800 rounded-lg transition-all duration-200 ${
                  type === 'all' ? 'bg-gray-100 ring-2 ring-gray-400 font-semibold' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
            </div>
            <div className="relative inline-block">
              <button
                ref={statusDropdownRef}
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="px-4 py-2 text-gray-800 border rounded-xl bg-white flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto"
              >
                {status === 'all' ? 'Tất cả trạng thái' : status === 'approved' ? 'Đã duyệt' : 'Chưa duyệt'}
                <FiChevronDown />
              </button>
              {showStatusDropdown && (
                <ul
                  ref={statusDropdownMenuRef}
                  className="absolute left-0 top-full w-full bg-white shadow-md rounded-xl z-50 border mt-1"
                  style={{ minWidth: statusDropdownRef.current?.offsetWidth }}
                >
                  {['all', 'approved', 'pending']
                    .filter((s) => s !== status)
                    .map((s) => (
                      <li
                        key={s}
                        className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                          setStatus(s as 'all' | 'approved' | 'pending');
                          setShowStatusDropdown(false);
                          fetchPosts();
                        }}
                      >
                        {s === 'all' ? 'Tất cả trạng thái' : s === 'approved' ? 'Đã duyệt' : 'Chưa duyệt'}
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <div className="relative inline-block">
              <button
                ref={timeDropdownRef}
                onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                className="px-4 py-2 text-gray-800 border rounded-xl bg-white flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto"
              >
                {sortTime === 'newest'
                  ? 'Bài đăng mới nhất'
                  : sortTime === 'oldest'
                  ? 'Bài đăng cũ nhất'
                  : 'Thời gian'}
                <FiChevronDown />
              </button>
              {showTimeDropdown && (
                <ul
                  ref={timeDropdownMenuRef}
                  className="absolute left-0 top-full w-full bg-white shadow-md rounded-xl z-50 border mt-1"
                  style={{ minWidth: timeDropdownRef.current?.offsetWidth }}
                >
                  {['newest', 'oldest']
                    .filter((t) => t !== sortTime)
                    .map((t) => (
                      <li
                        key={t}
                        className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                          setSortTime(t as 'newest' | 'oldest');
                          setShowTimeDropdown(false);
                          fetchPosts();
                        }}
                      >
                        {t === 'newest' ? 'Bài đăng mới nhất' : 'Bài đăng cũ nhất'}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>

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
                      <span className="text-gray-700 break-words whitespace-pre-wrap" title={post.content}>
                        {truncateIfNeeded(post.content)}
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

          <div className="hidden sm:block table-container border border-[#DBE0E5] rounded-xl bg-white">
            <style>
              {`
                .table-container {
                  overflow-x: auto;
                }
              `}
            </style>
            <div className="overflow-x-auto relative">
              <div className="flex w-full min-w-[900px] text-sm font-semibold bg-white border-b border-[#DBE0E5] sticky top-0 z-10">
                <div className="p-3 flex-1 min-w-[120px] text-gray-800 flex justify-center items-center text-center">Nội dung</div>
                <div className="p-3 flex-1 min-w-[120px] text-gray-800 flex justify-center items-center text-center">Loại</div>
                <div className="p-3 flex-1 min-w-[120px] text-gray-800 flex justify-center items-center text-center">Người đăng</div>
                <div className="p-3 flex-1 min-w-[120px] text-gray-800 flex justify-center items-center text-center">Ngày đăng</div>
                <div className="p-3 flex-1 min-w-[120px] text-gray-800 flex justify-center items-center text-center">Cảm xúc</div>
                <div className="p-3 flex-1 min-w-[120px] text-gray-800 flex justify-center items-center text-center">Trạng thái</div>
                <div className="p-3 flex-1 min-w-[150px] text-gray-800 flex justify-center items-center text-center">Hành động</div>
              </div>
              {posts.length === 0 ? (
                <div className="p-6 text-center text-gray-500 bg-white">
                  {search.trim()
                    ? 'Không có kết quả nào phù hợp với từ khóa tìm kiếm.'
                    : 'Không có bài viết nào phù hợp với bộ lọc hiện tại.'}
                </div>
              ) : (
                <List
                  ref={listRef}
                  height={listHeight}
                  itemCount={posts.length}
                  itemSize={56}
                  width={listWidth}
                  className="relative z-10"
                >
                  {Row}
                </List>
              )}
            </div>
          </div>

          <ToastContainer position="top-right" autoClose={3000} aria-label="Thông báo hệ thống" />

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
                <div className="text-gray-700 text-sm sm:text-base mb-4 whitespace-pre-wrap break-words">
                  {selectedPost.content.match(/.{1,40}/g)?.map((line, index) => (
                    <p key={index}>{line}</p>
                  )) || selectedPost.content}
                </div>
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
                        <img key={i} src={img} alt={`Image ${i}`} className="w-full rounded-xl object-cover shadow" />
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
                          {sharedPost.created_at ? new Date(sharedPost.created_at).toLocaleString('vi-VN') : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-800 text-sm whitespace-pre-wrap break-words">
                      {sharedPost.content.match(/.{1,40}/g)?.map((line, index) => (
                        <p key={index}>{line}</p>
                      )) || sharedPost.content}
                    </div>
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

  function Row({ index, style }: { index: number; style: React.CSSProperties }) {
    const post = posts[index];
    return (
      <div
        key={post.id}
        style={style}
        className="flex w-full text-sm bg-white border-b border-[#E5E8EB] hover:bg-gray-50 transition items-center"
      >
        <div className="p-3 flex-1 min-w-[120px] text-center" title={post.content}>
          {truncateIfNeeded(post.content)}
        </div>
        <div className="p-3 flex-1 min-w-[120px] flex justify-center items-center text-center">
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              post.type_post === 'positive' ? 'bg-blue-200' : 'bg-red-100'
            }`}
          >
            {post.type_post === 'positive' ? 'Tích cực' : 'Tiêu cực'}
          </span>
        </div>
        <div className="p-3 flex-1 min-w-[120px] text-center">
          {post.first_name} {post.last_name}
        </div>
        <div className="p-3 flex-1 min-w-[120px] text-center">{new Date(post.created_at).toLocaleDateString()}</div>
        <div className="p-3 flex-1 min-w-[120px] text-center">{post.like_count}</div>
        <div className="p-3 flex-1 min-w-[120px] flex justify-center items-center text-center">
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              post.is_approved ? 'bg-green-200' : 'bg-yellow-200'
            }`}
          >
            {post.is_approved ? 'Đã duyệt' : 'Chưa duyệt'}
          </span>
        </div>
        <div className="p-3 flex-1 min-w-[150px] flex gap-2 justify-center items-center">
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
        </div>
      </div>
    );
  }
}