'use client';

import React, { useContext, useEffect, useRef, useState, useCallback, use as useUnwrap } from 'react';
import MainLayout from '@/components/MainLayout';
import Image from 'next/image';
import { UserContext } from '@/contexts/UserContext';
import gsap from 'gsap';
import Post from '@/components/Post';
import axios from 'axios';
import FollowListModal from '@/components/FollowListModal';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface PostType {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  type_post: 'positive' | 'negative';
  like_count: number;
  comment_count: number;
  images: string[];
  feeling?: {
    icon: string;
    label: string;
  };
  location?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  is_liked?: boolean;
}

interface ProfileUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
}

const tabs: Tab[] = [
  { id: 'posts', label: 'Bài viết', icon: 'article' },
  { id: 'media', label: 'Ảnh/Video', icon: 'photo_library' },
  { id: 'about', label: 'Giới thiệu', icon: 'person' },
];

const POSTS_PER_PAGE = 5;

// Custom hook để xử lý API calls
const useAPI = () => {
  const { accessToken } = useContext(UserContext);
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const apiCall = async (endpoint: string, options: Record<string, unknown> = {}) => {
    try {
      const headers = typeof options.headers === 'object' && options.headers !== null ? options.headers : {};
      const response = await axios({
        ...options,
        url: endpoint,
        baseURL,
        headers: {
          ...headers,
          Authorization: `Bearer ${accessToken}`
        }
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(`API Error (${endpoint}):`, error);
        throw new Error(error.response?.data?.error || 'Đã có lỗi xảy ra');
      }
      throw error;
    }
  };

  return { apiCall };
};

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = useUnwrap(params);
  const { apiCall } = useAPI();
  const { user: currentUser } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState<string>('posts');
  const [userPosts, setUserPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [userMedia, setUserMedia] = useState<string[]>([]);
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowList, setShowFollowList] = useState<'followers' | 'following' | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [totalPosts, setTotalPosts] = useState<number | null>(null);

  const profileRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const [userResponse, followStats] = await Promise.all([
          apiCall(`/api/users/${unwrappedParams.id}`),
          apiCall(`/api/users/${unwrappedParams.id}/follow-stats`)
        ]);

        setProfileUser(userResponse);
        setFollowersCount(followStats.followers_count);
        setFollowingCount(followStats.following_count);
        setIsFollowing(!!followStats.is_following);
        // Lấy tổng số bài viết nếu có API
        try {
          const postStats = await apiCall(`/api/users/${unwrappedParams.id}/post-stats`);
          setTotalPosts(postStats.total_posts ?? null);
        } catch {
          setTotalPosts(null); // fallback nếu không có API
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
          console.error('Error fetching user:', error);
        } else {
          setError('Đã có lỗi xảy ra');
        }
      } finally {
        setLoading(false);
      }
    };

    if (unwrappedParams.id) {
      fetchUser();
    }
  }, [unwrappedParams.id]);

  // Tính toán tổng số media từ tất cả bài viết
  useEffect(() => {
    setUserMedia(userPosts.reduce((acc, post) => {
      if (Array.isArray(post.images)) {
        return acc.concat(post.images);
      }
      return acc;
    }, [] as string[]));
  }, [userPosts]);

  // Tối ưu hàm fetchUserPosts
  const fetchUserPosts = async (pageIndex: number = 0) => {
    if (!unwrappedParams.id) return;
    try {
      const offset = pageIndex * POSTS_PER_PAGE;
      if (pageIndex > 0) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params: Record<string, unknown> = {
        limit: POSTS_PER_PAGE,
        offset,
        viewer_id: currentUser?.id // Thêm viewer_id để server kiểm tra quyền truy cập
      };

      // Chỉ filter media khi tab là 'media'
      if (activeTab === 'media') {
        params.filter = 'media';
      }

      const posts = await apiCall(`/api/posts/user/${unwrappedParams.id}`, {
        params,
        headers: {
          'Cache-Control': 'no-cache' // Đảm bảo luôn lấy dữ liệu mới nhất
        }
      });

      // Validate và format dữ liệu trước khi set state
      const formattedPosts = Array.isArray(posts) ? posts.map(post => ({
        ...post,
        images: post.images ? (
          typeof post.images === 'string' ? JSON.parse(post.images) : post.images
        ) : [],
        feeling: post.feeling ? (
          typeof post.feeling === 'string' ? JSON.parse(post.feeling) : post.feeling
        ) : undefined
      })) : [];

      if (pageIndex === 0) {
        setUserPosts(formattedPosts);
      } else {
        setUserPosts(prev => [...prev, ...formattedPosts]);
      }

      setHasMore(formattedPosts.length === POSTS_PER_PAGE);
      setError(null);

      // Cập nhật tổng số bài viết nếu cần
      if (activeTab === 'posts' && pageIndex === 0 && totalPosts === null) {
        try {
          const stats = await apiCall(`/api/users/${unwrappedParams.id}/post-stats`);
          setTotalPosts(stats.total_posts ?? formattedPosts.length);
        } catch (error) {
          console.warn('Could not fetch total posts:', error);
          setTotalPosts(formattedPosts.length);
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'Đã có lỗi xảy ra khi tải bài viết';
        setError(errorMessage);
        console.error('Error fetching posts:', error);
      } else {
        setError('Đã có lỗi không xác định xảy ra');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load initial posts
  useEffect(() => {
    fetchUserPosts(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unwrappedParams.id, activeTab]);

  // Handle infinite scroll
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000 &&
      !loadingMore &&
      hasMore &&
      !loading &&
      !error
    ) {
      setPage(prev => prev + 1);
    }
  }, [loadingMore, hasMore, loading, error]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Load more posts when page changes
  useEffect(() => {
    if (page > 0) {
      fetchUserPosts(page);
    }
  }, [page, fetchUserPosts]);

  // Animation effects
  useEffect(() => {
    const tl = gsap.timeline({
      defaults: { ease: "power3.out" }
    });

    if (profileRef.current) {
      tl.from(profileRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8
      });
    }

    const statElements = document.querySelectorAll(".stat-item");
    if (statElements.length) {
      tl.from(statElements, {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5
      }, "-=0.4");
    }

    if (contentRef.current?.children) {
      tl.from(contentRef.current.children, {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5
      }, "-=0.2");
    }
  }, []);

  // Tab change animation
  useEffect(() => {
    if (contentRef.current?.children) {
      gsap.from(contentRef.current.children, {
        y: 15,
        opacity: 0,
        stagger: 0.05,
        duration: 0.4,
        ease: "power2.out"
      });
    }
  }, [activeTab]);

  // Reset pagination and posts when tab changes
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    setUserPosts([]);
  }, [activeTab, unwrappedParams.id]);

  // Hàm xử lý follow/unfollow
  const handleFollowToggle = async () => {
    if (!profileUser) return;
    setLoading(true);
    try {
      const endpoint = `/api/users/${profileUser.id}/follow`;
      const method = isFollowing ? 'DELETE' : 'POST';
      await apiCall(endpoint, { method });
      setIsFollowing((prev) => !prev);
      setFollowersCount((prev) => prev + (isFollowing ? -1 : 1));
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  // Nếu là profile của chính mình, chuyển hướng sang /profile
  if (currentUser?.id === unwrappedParams.id) {
    if (typeof window !== 'undefined') {
      window.location.replace('/profile');
    }
    return null;
  }

  if (!profileUser || error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          {error ? (
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Profile Card */}
          <div ref={profileRef} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Profile Header */}
            <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2)_0%,rgba(0,0,0,0)_70%)]" />
            </div>
            {/* User Info */}
            <div className="px-6 pb-6">
              <div className="flex justify-between items-end -mt-16">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                    {profileUser?.avatar_url ? (
                      <Image
                        src={profileUser.avatar_url}
                        alt="Profile"
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-[48px] text-slate-300">
                        person
                      </span>
                    )}
                  </div>
                </div>
                {/* Nút Follow/Unfollow */}
                {currentUser?.id !== unwrappedParams.id && (
                  <button
                    className={`px-4 py-2 rounded-full font-medium flex items-center gap-2 text-sm shadow transition-all duration-200
                      ${isFollowing ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}
                    `}
                    onClick={async () => {
                      await handleFollowToggle();
                    }}
                    disabled={loading}
                    onMouseEnter={e => {
                      if (isFollowing) {
                        gsap.to(e.currentTarget, { scale: 1.05, background: 'linear-gradient(90deg,#f43f5e,#6366f1)', duration: 0.2 });
                      } else {
                        gsap.to(e.currentTarget, { scale: 1.05, background: '#e0e7ff', duration: 0.2 });
                      }
                    }}
                    onMouseLeave={e => {
                      gsap.to(e.currentTarget, { scale: 1, background: isFollowing ? 'linear-gradient(90deg,#34d399,#3b82f6)' : '#f1f5f9', duration: 0.2 });
                    }}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isFollowing ? 'check' : 'person_add'}
                    </span>
                    {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                  </button>
                )}
              </div>
              <div className="mt-6">
                <h1 className="text-2xl font-semibold text-slate-900">
                  {profileUser ? `${profileUser.first_name} ${profileUser.last_name}` : 'Loading...'}
                </h1>
                <p className="text-slate-500 mt-1">
                  {profileUser?.email ? `@${profileUser.email.split('@')[0]}` : '@user'}
                </p>
              </div>
              {/* Stats Grid */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="stat-item rounded-xl bg-slate-50 p-4 text-center">
                  <div className="text-2xl font-semibold text-slate-900">{totalPosts !== null ? totalPosts : userPosts.length}</div>
                  <div className="text-sm text-slate-500">Bài viết</div>
                </div>
                <div
                  className="stat-item rounded-xl bg-slate-50 p-4 text-center cursor-pointer hover:bg-indigo-100 transition-colors"
                  onClick={() => setShowFollowList('followers')}
                >
                  <div className="text-2xl font-semibold text-slate-900">{followersCount}</div>
                  <div className="text-sm text-slate-500">Người theo dõi</div>
                </div>
                <div
                  className="stat-item rounded-xl bg-slate-50 p-4 text-center cursor-pointer hover:bg-indigo-100 transition-colors"
                  onClick={() => setShowFollowList('following')}
                >
                  <div className="text-2xl font-semibold text-slate-900">{followingCount}</div>
                  <div className="text-sm text-slate-500">Đang theo dõi</div>
                </div>
                <div className="stat-item rounded-xl bg-slate-50 p-4 text-center">
                  <div className="text-2xl font-semibold text-slate-900">{userMedia.length}</div>
                  <div className="text-sm text-slate-500">Ảnh/Video</div>
                </div>
              </div>
            </div>
          </div>
          {/* Không render InputSection (đăng bài) nếu không phải chủ tài khoản */}
          {/* Navigation Tabs */}
          <div className="mt-6 flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all
                  ${activeTab === tab.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:bg-white/60'
                  }
                `}
              >
                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          {/* Tab Content */}
          <div className="mt-6" ref={contentRef}>
            {activeTab === 'posts' && (
              <div className="space-y-6">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-slate-200" />
                        <div className="flex-1">
                          <div className="h-4 w-24 bg-slate-200 rounded mb-2" />
                          <div className="h-3 w-16 bg-slate-200 rounded" />
                        </div>
                      </div>
                      <div className="h-20 bg-slate-200 rounded mb-4" />
                      <div className="flex gap-4">
                        <div className="h-4 w-12 bg-slate-200 rounded" />
                        <div className="h-4 w-12 bg-slate-200 rounded" />
                        <div className="h-4 w-12 bg-slate-200 rounded" />
                      </div>
                    </div>
                  ))
                ) : userPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500">Chưa có bài viết nào</p>
                  </div>
                ) : (
                  <>
                    {userPosts.map(post => (
                      <Post
                        key={post.id}
                        id={post.id}
                        userId={post.user_id}
                        name={`${post.first_name} ${post.last_name}`}
                        date={post.created_at}
                        content={post.content}
                        likes={post.like_count}
                        comments={post.comment_count}
                        shares={0}
                        images={post.images}
                        avatar={post.avatar_url}
                        feeling={post.feeling}
                        location={post.location}
                      />
                    ))}
                    {loadingMore && (
                      <div className="py-4 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            {activeTab === 'media' && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="grid grid-cols-3 gap-4">
                  {userMedia.length === 0 ? (
                    <div className="col-span-3 text-center py-8">
                      <span className="flex items-center justify-center h-full material-symbols-outlined text-slate-400 text-3xl">photo_library</span>
                      <p className="text-slate-500">Chưa có ảnh hoặc video nào</p>
                    </div>
                  ) : (
                    userMedia.map((url, index) => (
                      <div key={index} className="aspect-square bg-slate-100 rounded-lg overflow-hidden relative group">
                        <Image
                          src={url}
                          alt={`Media ${index + 1}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                          sizes="(max-width: 768px) 33vw, 300px"
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            {activeTab === 'about' && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Thông tin cơ bản</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-slate-600">
                        <span className="material-symbols-outlined text-slate-400">mail</span>
                        <span>{profileUser?.email || 'Chưa cập nhật email'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <span className="material-symbols-outlined text-slate-400">cake</span>
                        <span>Chưa cập nhật ngày sinh</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <span className="material-symbols-outlined text-slate-400">location_on</span>
                        <span>Chưa cập nhật địa chỉ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showFollowList && (
        <FollowListModal
          userId={unwrappedParams.id}
          type={showFollowList}
          isOpen={true}
          onClose={() => setShowFollowList(null)}
        />
      )}
    </MainLayout>
  );
}
