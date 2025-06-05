"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Sidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { useState, KeyboardEvent, ChangeEvent, useEffect } from "react";
import Post from '@/components/Post';
import PostDetailPopup from '@/components/PostDetailPopup';
import gsap from "gsap";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const [search, setSearch] = useState(query);
  const [tab, setTab] = useState<"all" | "post" | "friend">("all");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [friendRequests, setFriendRequests] = useState<{ [userId: string]: boolean }>({});
  // Lấy trạng thái tab/theme từ localStorage (đồng bộ với trang chủ)
  const [theme, setTheme] = useState<'inspiring' | 'reflective'>('inspiring');
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
  const handleSearch = () => {
    if (search.trim()) {
      router.push(`/search?query=${encodeURIComponent(search.trim())}`);
    }
  };
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  // Lọc kết quả liên quan
  const posts = results.filter(item => item.type === "post");
  const users = results.filter(item => item.type === "user");

  return (
    <div className={`min-h-screen flex flex-col ${bgClass}`} style={{ fontFamily: "Inter, sans-serif" }}>
      <Header
        searchValue={search}
        onSearchChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        onSearch={handleSearch}
        onSearchKeyDown={handleKeyDown}
        theme={theme}
      />
      <div className="flex flex-1 w-full max-w-[2400px] mx-auto gap-4 py-6">
        <Sidebar theme={theme} />
        <main className="flex-1 flex flex-col items-center">
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
              <div className="text-gray-400 text-lg py-8 bg-white rounded-[32px] shadow border-2 border-[#E3E3E3] text-center">Đang tìm kiếm...</div>
            ) : tab === "all" ? (
              <>
                <div className="font-bold text-blue-700 mb-2">Bài viết</div>
                {posts.length === 0 ? (
                  <div className="text-gray-400 text-lg py-8 bg-white rounded-[32px] shadow border-2 border-[#E3E3E3] text-center">Không có bài viết phù hợp.</div>
                ) : (
                  posts.map((item) => (
                    <Post
                      key={item.id}
                      id={item.id}
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
                <div className="font-bold text-blue-700 mt-6 mb-2">Người dùng</div>
                {users.length === 0 ? (
                  <div className="text-gray-400 text-lg py-8 bg-white rounded-[32px] shadow border-2 border-[#E3E3E3] text-center">Không có người dùng phù hợp.</div>
                ) : (
                  users.map((item) => {
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
              </>
            ) : tab === "post" ? (
              <>
                <div className="font-bold text-blue-700 mb-2">Bài viết</div>
                {posts.length === 0 ? (
                  <div className="text-gray-400 text-lg py-8 bg-white rounded-[32px] shadow border-2 border-[#E3E3E3] text-center">Không có bài viết phù hợp.</div>
                ) : (
                  posts.map((item) => (
                    <Post
                      key={item.id}
                      id={item.id}
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
              </>
            ) : (
              <>
                <div className="font-bold text-blue-700 mb-2">Người dùng</div>
                {users.length === 0 ? (
                  <div className="text-gray-400 text-lg py-8 bg-white rounded-[32px] shadow border-2 border-[#E3E3E3] text-center">Không có người dùng phù hợp.</div>
                ) : (
                  users.map((item) => {
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
              </>
            )}
            {selectedPost && (
              <PostDetailPopup post={selectedPost} onClose={() => setSelectedPost(null)} theme={theme} />
            )}
          </div>
        </main>
        <RightSidebar theme={theme} />
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
    </div>
  );
} 