"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Sidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { useState, KeyboardEvent, ChangeEvent, useEffect, useRef } from "react";
import Post from '@/components/Post';
import PostDetailPopup from '@/components/PostDetailPopup';
import gsap from "gsap";
import SkeletonPost from '@/components/SkeletonPost';
import { useUser } from '@/contexts/UserContext';
import AuthModal from '@/components/AuthModal';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const [search, setSearch] = useState(query);
  const [tab, setTab] = useState<"all" | "post" | "user">("all");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [friendRequests, setFriendRequests] = useState<{ [userId: string]: boolean }>({});
  // Lấy trạng thái tab/theme từ localStorage (đồng bộ với trang chủ)
  const [theme, setTheme] = useState<'inspiring' | 'reflective'>('inspiring');
  // State cho lazy load
  const [postLimit, setPostLimit] = useState(3);
  const [userLimit, setUserLimit] = useState(5);
  const [postTabLimit, setPostTabLimit] = useState(3);
  const [userTabLimit, setUserTabLimit] = useState(6);
  const [combinedLimit, setCombinedLimit] = useState(5);
  const loaderRef = useRef<HTMLDivElement>(null);
  const { user, accessToken } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    function syncTheme() {
      const tab = localStorage.getItem('activeTab');
      if (tab === '1' || tab === 'reflective') setTheme('reflective');
      else setTheme('inspiring');
    }
    syncTheme();
    window.addEventListener('storage', syncTheme);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') syncTheme();
    });
    return () => {
      window.removeEventListener('storage', syncTheme);
      document.removeEventListener('visibilitychange', syncTheme);
    };
  }, []);
  // Trang chủ: Inspiring = bg-gradient-to-br from-[#E1ECF7] to-[#AECBEB], Reflective = bg-[#E9ECF1]
  const bgClass = theme === 'reflective'
    ? 'bg-[#E9ECF1]'
    : 'bg-gradient-to-br from-[#E1ECF7] to-[#AECBEB]';

  // Gọi API lấy kết quả tìm kiếm
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    setLoading(true);
    fetch(`/api/search-suggestions?query=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => setResults(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [query]);

  // Khi tìm kiếm mới
  const handleSearch = async () => {
    if (search.trim()) {
      if (user && accessToken) {
        await fetch(`${API_URL}/api/search_history`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ keyword: search.trim() }),
        });
      }
      router.push(`/search?query=${encodeURIComponent(search.trim())}`);
    }
  };
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Lọc kết quả liên quan
  const allPosts = results.filter(item => item.type === "post");
  const allUsers = results.filter(item => item.type === "user");
  const postsTab = allPosts.slice(0, postTabLimit);
  const usersTab = allUsers.slice(0, userTabLimit);

  // Lazy load cho các tab
  useEffect(() => {
    const currentLoaderRef = loaderRef.current;
    if (!currentLoaderRef) return;

    const observer = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (tab === 'post') {
          setPostTabLimit(limit => Math.min(limit + 3, allPosts.length));
        } else if (tab === 'user') {
          setUserTabLimit(limit => Math.min(limit + 6, allUsers.length));
        } else if (tab === 'all') {
          setCombinedLimit(limit => Math.min(limit + 10, results.length));
        }
      }
    });

    observer.observe(currentLoaderRef);

    return () => {
      if (currentLoaderRef) observer.unobserve(currentLoaderRef);
    };
  }, [tab, postTabLimit, userTabLimit, combinedLimit, allPosts.length, allUsers.length, results.length]);

  // Reset giới hạn khi thay đổi tab hoặc query
  useEffect(() => {
    setPostTabLimit(3);
    setUserTabLimit(6);
    setCombinedLimit(10);
  }, [tab, query]);

  return (
    <div className={`min-h-screen w-full ${bgClass}`}> 
      {/* Header cố định trên cùng */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Header
          searchValue={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          onSearch={handleSearch}
          onSearchKeyDown={handleKeyDown}
          theme={theme}
          onOpenAuth={(tab) => { setAuthTab(tab); setShowAuthModal(true); }}
        />
      </div>
      {/* Main Content */}
      <div className="pt-20">
        <div className="flex w-full">
          {/* Sidebar trái cố định */}
          <div className="fixed top-[80px] left-0 z-20">
            <Sidebar theme={theme} />
          </div>
          {/* Nội dung trung tâm */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-3xl px-4" style={{ minHeight: '100vh' }}>
              {/* Nút quay về trang chủ */}
              <nav className="w-full max-w-3xl mb-4">
                <button
                  onClick={() => router.push("/")}
                  className="inline-flex items-center gap-2 text-gray-700 hover:text-blue-700 font-medium transition-all hover:-translate-x-1 hover:scale-105 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full shadow-md hover:shadow-xl duration-200"
                  style={{ transition: 'all 0.2s cubic-bezier(.4,2,.6,1)' }}
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  Về trang chủ
                </button>
              </nav>
              {/* Tiêu đề */}
              <div className="w-full max-w-3xl mb-6">
                <span className="font-bold text-2xl text-[#1E1E1E]">
                  Kết quả tìm kiếm cho: <span className="text-blue-600">&quot;{query}&quot;</span>
                </span>
              </div>
              {/* Tabs với hiệu ứng underline trượt */}
              <div className="flex gap-6 mb-6 text-lg font-semibold relative">
                {[
                  { key: "all", label: "Tất cả" },
                  { key: "post", label: "Bài viết" },
                  { key: "user", label: "Người dùng" },
                ].map((t) => (
                  <button
                    key={t.key}
                    className={
                      tab === t.key
                        ? "text-blue-700 relative"
                        : "text-gray-500 relative"
                    }
                    style={{ transition: 'color 0.2s' }}
                    onClick={() => setTab(t.key as any)}
                  >
                    {t.label}
                    {tab === t.key && (
                      <span className="absolute left-0 right-0 -bottom-1 h-1 bg-blue-700 rounded-full animate-slidein" style={{ transition: 'all 0.3s cubic-bezier(.4,2,.6,1)' }} />
                    )}
                  </button>
                ))}
              </div>
              {/* Nội dung theo tab với hiệu ứng fade-in */}
              <div className="w-full max-w-3xl flex flex-col gap-6 animate-fadein">
                {loading ? (
                  <>
                    <SkeletonPost />
                    <SkeletonPost />
                    <SkeletonPost />
                  </>
                ) : tab === "all" ? (
                  <>
                    {results.length === 0 ? (
                      <div className="text-gray-400 text-lg py-8 bg-white rounded-[32px] shadow border-2 border-[#E3E3E3] text-center">Không có kết quả phù hợp.</div>
                    ) : (
                      <>
                        {/* Render 2 post đầu */}
                        {allPosts.slice(0, 2).map((item) => (
                          <Post
                            key={item.id}
                            id={item.id}
                            userId={item.user_id}
                            name={`${item.first_name || ''} ${item.last_name || ''}`.trim() || "Người dùng ẩn danh"}
                            date={item.created_at || ''}
                            content={item.content}
                            likes={item.like_count || 0}
                            comments={item.comment_count || 0}
                            shares={item.shares || 0}
                            images={item.images || []}
                            avatar={item.avatar_url}
                            feeling={item.feeling}
                            location={item.location}
                            onOpenDetail={() => setSelectedPost(item)}
                            theme={theme}
                          />
                        ))}

                        {/* Chỉ render div 'Mọi người' sau 2 post đầu nếu có user */}
                        {allUsers.length > 0 && (
                          <div className="rounded-2xl shadow px-8 py-6 border-2 border-[#E3E3E3] bg-white mb-6">
                            <div className="font-bold text-lg mb-4">Mọi người</div>
                            {allUsers.slice(0, 3).map((item) => {
                              function stringToColor(str: string) {
                                let hash = 0;
                                for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
                                const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
                                return '#' + '00000'.substring(0, 6 - c.length) + c;
                              }
                              const isAnonymous = !item.name || item.name.toLowerCase().includes('ẩn danh');
                              const avatarBg = isAnonymous ? '#E5E7EB' : stringToColor(item.id || item.name || 'user');
                              const initials = item.name ? item.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0,2) : 'U';
                              return (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-5 rounded-[32px] px-4 py-3 border mb-3 bg-[#F8FAFC]"
                                >
                                  <div className="w-12 h-12 rounded-full flex items-center justify-center border" style={{ background: avatarBg }}>
                                    {item.avatar ? (
                                      <Image src={item.avatar} alt={item.name} width={40} height={40} className="rounded-full" />
                                    ) : isAnonymous ? (
                                      <span className="material-symbols-outlined text-gray-400 text-3xl">person</span>
                                    ) : (
                                      <span className="text-white font-bold text-xl">{initials}</span>
                                    )}
                                  </div>
                                  <span className={`font-semibold text-base flex-1 ${isAnonymous ? 'text-gray-600' : ''}`}>{item.name || 'Người dùng'}</span>
                                  {friendRequests[item.id] ? (
                                    <button
                                      className="friend-btn px-4 py-2 rounded-full bg-gray-400 text-white font-semibold shadow cursor-not-allowed text-sm"
                                      disabled
                                    >
                                      Đã theo dõi
                                    </button>
                                  ) : (
                                    <button
                                      className="friend-btn px-4 py-2 rounded-full bg-blue-500 text-white font-semibold shadow transition-all hover:bg-blue-600 hover:scale-105 text-sm"
                                      onClick={() => {
                                        if (!user) {
                                          setShowAuthModal(true);
                                          return;
                                        }
                                        setFriendRequests(prev => ({ ...prev, [item.id]: true }));
                                        // TODO: Gửi request follow lên server ở đây nếu muốn
                                      }}
                                    >
                                      Follow
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                            <button
                              className="mt-2 px-4 py-2 rounded-full bg-slate-100 text-blue-700 font-semibold hover:bg-blue-50 transition-all"
                              onClick={() => setTab('user')}
                            >
                              Xem tất cả
                            </button>
                          </div>
                        )}

                        {/* Render các post còn lại */}
                        {allPosts.slice(2, combinedLimit).map((item) => (
                          <Post
                            key={item.id}
                            id={item.id}
                            userId={item.user_id}
                            name={`${item.first_name || ''} ${item.last_name || ''}`.trim() || "Người dùng ẩn danh"}
                            date={item.created_at || ''}
                            content={item.content}
                            likes={item.like_count || 0}
                            comments={item.comment_count || 0}
                            shares={item.shares || 0}
                            images={item.images || []}
                            avatar={item.avatar_url}
                            feeling={item.feeling}
                            location={item.location}
                            onOpenDetail={() => setSelectedPost(item)}
                            theme={theme}
                          />
                        ))}
                      </>
                    )}
                    {(tab === 'all' && combinedLimit < results.length) && (
                      <div ref={loaderRef} className="w-full flex justify-center py-4">
                        <span className="text-gray-400">Đang tải thêm...</span>
                      </div>
                    )}
                  </>
                ) : tab === "post" ? (
                  <>
                    {postsTab.length === 0 ? (
                      <div className="text-gray-400 text-lg py-8 bg-white rounded-[32px] shadow border-2 border-[#E3E3E3] text-center">Không có bài viết phù hợp.</div>
                    ) : (
                      postsTab.map((item) => (
                        <Post
                          key={item.id}
                          id={item.id}
                          userId={item.user_id}
                          name={`${item.first_name || ''} ${item.last_name || ''}`.trim() || "Người dùng ẩn danh"}
                          date={item.created_at || ''}
                          content={item.content}
                          likes={item.like_count || 0}
                          comments={item.comment_count || 0}
                          shares={item.shares || 0}
                          images={item.images || []}
                          avatar={item.avatar_url}
                          feeling={item.feeling}
                          location={item.location}
                          onOpenDetail={() => setSelectedPost(item)}
                          theme={theme}
                        />
                      ))
                    )}
                    {postsTab.length < allPosts.length && (
                      <div ref={loaderRef} className="w-full flex justify-center py-4">
                        <span className="text-gray-400">Đang tải thêm...</span>
                      </div>
                    )}
                  </>
                ) : tab === "user" ? (
                  <>
                    {usersTab.length === 0 ? (
                      <div className="text-gray-400 text-lg py-8 bg-white rounded-[32px] shadow border-2 border-[#E3E3E3] text-center">Không có người dùng phù hợp.</div>
                    ) : (
                      usersTab.map((item) => {
                        function stringToColor(str: string) {
                          let hash = 0;
                          for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
                          const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
                          return '#' + '00000'.substring(0, 6 - c.length) + c;
                        }
                        const isAnonymous = !item.name || item.name.toLowerCase().includes('ẩn danh');
                        const avatarBg = isAnonymous ? '#E5E7EB' : stringToColor(item.id || item.name || 'user');
                        const initials = item.name ? item.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0,2) : 'U';
                        return (
                          <div
                            key={item.id}
                            className={`flex items-center gap-5 rounded-[32px] shadow px-8 py-4 border-2 border-[#E3E3E3] search-card mb-4 ${theme === 'reflective' ? 'bg-[#E9ECF1]' : 'bg-white'} ${theme === 'reflective' ? 'hover:bg-[#e3e3e3]' : 'hover:bg-blue-50'}`}
                          >
                            <div className="w-14 h-14 rounded-full flex items-center justify-center border" style={{ background: avatarBg }}>
                              {item.avatar ? (
                                <Image src={item.avatar} alt={item.name} width={40} height={40} className="rounded-full" />
                              ) : isAnonymous ? (
                                <span className="material-symbols-outlined text-gray-400 text-3xl">person</span>
                              ) : (
                                <span className="text-white font-bold text-xl">{initials}</span>
                              )}
                            </div>
                            <span className={`font-semibold text-lg flex-1 ${isAnonymous ? 'text-gray-600' : ''}`}>{item.name || 'Người dùng'}</span>
                            {friendRequests[item.id] ? (
                              <button
                                className="friend-btn px-5 py-2 rounded-full bg-gray-400 text-white font-semibold shadow cursor-not-allowed"
                                disabled
                              >
                                Đã theo dõi
                              </button>
                            ) : (
                              <button
                                className="friend-btn px-5 py-2 rounded-full bg-blue-500 text-white font-semibold shadow transition-all hover:bg-blue-600 hover:scale-105"
                                onClick={() => {
                                  if (!user) {
                                    setShowAuthModal(true);
                                    return;
                                  }
                                  setFriendRequests(prev => ({ ...prev, [item.id]: true }));
                                  // TODO: Gửi request follow lên server ở đây nếu muốn
                                }}
                              >
                                Follow
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                    {usersTab.length < allUsers.length && (
                      <div ref={loaderRef} className="w-full flex justify-center py-4">
                        <span className="text-gray-400">Đang tải thêm...</span>
                      </div>
                    )}
                  </>
                ) : null}
                {selectedPost && (
                  <PostDetailPopup post={selectedPost} onClose={() => setSelectedPost(null)} theme={theme} />
                )}
              </div>
            </div>
          </div>
          {/* Sidebar phải cố định */}
          <div className="fixed top-[80px] right-0 z-20">
            <RightSidebar theme={theme} />
          </div>
        </div>
      </div>
      {/* Thêm style động cho hiệu ứng đặc sắc */}
      <style jsx global>{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fadein {
          animation: fadein 0.5s cubic-bezier(.4,2,.6,1);
        }
        @keyframes slidein {
          from { width: 0; opacity: 0; }
          to { width: 100%; opacity: 1; }
        }
        .animate-slidein {
          animation: slidein 0.3s cubic-bezier(.4,2,.6,1);
        }
        .search-card {
          transition: transform 0.2s cubic-bezier(.4,2,.6,1), box-shadow 0.2s;
        }
        .search-card:hover {
          transform: scale(1.03) translateY(-2px);
          box-shadow: 0 8px 32px 0 rgba(8,90,180,0.10), 0 1.5px 6px 0 rgba(0,0,0,0.08);
        }
      `}</style>
      {showAuthModal && !user && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          defaultTab={authTab} 
          onSuccess={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}