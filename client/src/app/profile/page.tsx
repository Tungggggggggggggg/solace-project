'use client';

import { useContext, useEffect, useRef, useState, useCallback } from 'react';
import MainLayout from '@/components/MainLayout';
import Image from 'next/image';
import { UserContext } from '@/contexts/UserContext';
import gsap from 'gsap';
import InputSection from '@/components/InputSection';
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

const tabs: Tab[] = [
  { id: 'posts', label: 'Bài viết', icon: 'article' },
  { id: 'media', label: 'Ảnh/Video', icon: 'photo_library' },
  { id: 'about', label: 'Giới thiệu', icon: 'person' },
];

const POSTS_PER_PAGE = 5;

// Loading skeleton component
const ProfileSkeleton = () => (
  <div className="animate-pulse">
    <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
    <div className="flex flex-col items-center -mt-20">
      <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
      <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
      <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
      <div className="flex gap-4 mb-4">
        <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  </div>
);

export default function ProfilePage() {
  const { user, accessToken, loading: userLoading } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState<string>('posts');
  const [postsData, setPostsData] = useState<PostType[] | null>(null);
  const [mediaData, setMediaData] = useState<string[] | null>(null);
  const [tabFetched, setTabFetched] = useState<{ [key: string]: boolean }>({ posts: false, media: false, about: false });
  const [error, setError] = useState<string | null>(null);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalMedia, setTotalMedia] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowList, setShowFollowList] = useState<'followers' | 'following' | null>(null);
  const [followStatsLoading, setFollowStatsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const profileRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch user posts
  const fetchUserTabData = useCallback(async (tabId: string, isFirstLoad = false) => {
    if (!user?.id || !accessToken) return;
    try {
      const offset = 0;
      if (isFirstLoad) setInitialLoading(true);
      if (tabId === 'posts') {
        const [postsResponse, countResponse] = await Promise.all([
          axios.get<PostType[]>(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/posts/user/${user.id}`, {
            params: { limit: POSTS_PER_PAGE, offset },
            headers: { Authorization: `Bearer ${accessToken}` }
          }),
          axios.get<{totalPosts: number, totalMedia: number}>(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/posts/user/${user.id}/count`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          )
        ]);
        setPostsData(postsResponse.data);
        setTotalPosts(countResponse.data.totalPosts);
        setTotalMedia(countResponse.data.totalMedia);
        setTabFetched(prev => ({ ...prev, posts: true }));
      } else if (tabId === 'media') {
        const postsResponse = await axios.get<PostType[]>(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/posts/user/${user.id}`, {
          params: { limit: 100, offset: 0, filter: 'media' },
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        // Lấy tất cả media từ các post
        const allMedia = postsResponse.data.reduce((acc, post) => {
          if (Array.isArray(post.images)) return acc.concat(post.images);
          return acc;
        }, [] as string[]);
        setMediaData(allMedia);
        setTabFetched(prev => ({ ...prev, media: true }));
      }
    } catch {
      setError('Could not load data');
    } finally {
      setInitialLoading(false);
      if (isInitialLoad) setIsInitialLoad(false);
    }
  }, [user?.id, accessToken, isInitialLoad]);

  // Load initial posts
  useEffect(() => {
    if (!userLoading && user?.id && accessToken) {
      fetchUserTabData('posts', true);
    }
  }, [fetchUserTabData, user?.id, userLoading, accessToken]);

  // Fetch follow stats
  const fetchFollowStats = useCallback(async () => {
    if (!user?.id || !accessToken) return;
    
    setFollowStatsLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/${user.id}/follow-stats`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setFollowersCount(response.data.followers_count || 0);
      setFollowingCount(response.data.following_count || 0);
    } catch (err) {
      console.error('Error fetching follow stats:', err);
      setFollowersCount(0);
      setFollowingCount(0);
    } finally {
      setFollowStatsLoading(false);
    }
  }, [user?.id, accessToken]);

  useEffect(() => {
    if (!userLoading && user?.id && accessToken) {
      fetchFollowStats();
    }
  }, [fetchFollowStats, user?.id, userLoading, accessToken]);

  // Animation effects with conditions
  useEffect(() => {
    if (isInitialLoad) return;

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" }
    });

    if (profileRef.current) {
      tl.from(profileRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5
      });
    }

    const statElements = document.querySelectorAll(".stat-item");
    if (statElements.length) {
      tl.from(statElements, {
        y: 10,
        opacity: 0,
        stagger: 0.05,
        duration: 0.3
      }, "-=0.2");
    }

    if (contentRef.current?.children) {
      tl.from(contentRef.current.children, {
        y: 10,
        opacity: 0,
        stagger: 0.05,
        duration: 0.3
      }, "-=0.1");
    }
  }, [isInitialLoad]);

  // Tab change effect
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

  // useEffect khi chuyển tab
  useEffect(() => {
    if (!userLoading && user?.id) {
      if (!tabFetched[activeTab]) {
        fetchUserTabData(activeTab, false);
      }
    }
  }, [activeTab, fetchUserTabData, user?.id, userLoading, tabFetched]);

  if (initialLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <ProfileSkeleton />
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
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white flex items-center justify-center">
                    {user?.avatar_url ? (
                      <Image
                        src={user.avatar_url}
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
                <button className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full transition-colors flex items-center gap-2 text-sm font-medium">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                  Chỉnh sửa
                </button>
              </div>

              <div className="mt-6">
                <h1 className="text-2xl font-semibold text-slate-900">
                  {user ? `${user.first_name} ${user.last_name}` : 'Loading...'}
                </h1>
                <p className="text-slate-500 mt-1">
                  {user?.email ? `@${user.email.split('@')[0]}` : '@user'}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="stat-item rounded-xl bg-slate-50 p-4 text-center">
                  <div className="text-2xl font-semibold text-slate-900">{totalPosts || 0}</div>
                  <div className="text-sm text-slate-500">Bài viết</div>
                </div>
                <div
                  className="stat-item rounded-xl bg-slate-50 p-4 text-center cursor-pointer hover:bg-indigo-100 transition-colors"
                  onClick={() => setShowFollowList('followers')}
                >
                  <div className="text-2xl font-semibold text-slate-900">
                    {followStatsLoading ? '...' : followersCount}
                  </div>
                  <div className="text-sm text-slate-500">Người theo dõi</div>
                </div>
                <div
                  className="stat-item rounded-xl bg-slate-50 p-4 text-center cursor-pointer hover:bg-indigo-100 transition-colors"
                  onClick={() => setShowFollowList('following')}
                >
                  <div className="text-2xl font-semibold text-slate-900">
                    {followStatsLoading ? '...' : followingCount}
                  </div>
                  <div className="text-sm text-slate-500">Đang theo dõi</div>
                </div>
                <div className="stat-item rounded-xl bg-slate-50 p-4 text-center">
                  <div className="text-2xl font-semibold text-slate-900">{totalMedia}</div>
                  <div className="text-sm text-slate-500">Ảnh/Video</div>
                </div>
              </div>
            </div>
          </div>

          {/* Create Post Section */}
          <div className="mt-6">
            <InputSection />
          </div>

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
                {error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">{error}</p>
                    <button 
                      onClick={() => fetchUserTabData('posts', false)}
                      className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : !tabFetched.posts ? (
                  <div className="text-center py-8 text-slate-400">Đang tải...</div>
                ) : postsData && postsData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500">Chưa có bài viết nào</p>
                  </div>
                ) : (
                  <>
                    {postsData && postsData.map(post => (
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
                  </>
                )}
              </div>
            )}

            {activeTab === 'media' && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="grid grid-cols-3 gap-4">
                  {!tabFetched.media ? (
                    <div className="col-span-3 text-center py-8 text-slate-400">Đang tải...</div>
                  ) : mediaData && mediaData.length === 0 ? (
                    <div className="col-span-3 text-center py-8">
                      <span className="flex items-center justify-center h-full material-symbols-outlined text-slate-400 text-3xl">photo_library</span>
                      <p className="text-slate-500">Chưa có ảnh hoặc video nào</p>
                    </div>
                  ) : (
                    mediaData && mediaData.map((url, index) => (
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
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Thông tin cá nhân</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400">mail</span>
                        <span className="text-slate-600">{user?.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400">calendar_today</span>
                        <span className="text-slate-600">Tham gia từ {new Date().toLocaleDateString()}</span>
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
          type={showFollowList}
          userId={user?.id || ''}
          onClose={() => setShowFollowList(null)}
          isOpen={true}
        />
      )}
    </MainLayout>
  );
}