"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Sidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { useState, KeyboardEvent, ChangeEvent } from "react";

const mockResults = [
  {
    id: 1,
    type: "friend",
    name: "Nguyễn Văn A",
    desc: "Bạn bè",
    avatar: "/avatar1.png",
  },
  {
    id: 2,
    type: "group",
    name: "Nhóm Lập Trình",
    desc: "Nhóm",
    avatar: "/group.svg",
  },
  {
    id: 3,
    type: "post",
    name: "Bài viết về React",
    desc: "Bài viết",
    avatar: "/post.svg",
  },
];

function removeVietnameseTones(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const [search, setSearch] = useState(query);
  const [tab, setTab] = useState<"all" | "post" | "friend">("all");

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
  const filtered = mockResults.filter(
    (item) =>
      removeVietnameseTones(item.name).includes(removeVietnameseTones(query)) ||
      removeVietnameseTones(item.desc).includes(removeVietnameseTones(query))
  );
  const posts = filtered.filter(item => item.type === "post");
  const friends = filtered.filter(item => item.type === "friend");

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
      <Header
        searchValue={search}
        onSearchChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        onSearch={handleSearch}
        onSearchKeyDown={handleKeyDown}
      />
      <div className="flex flex-1 w-full max-w-[2400px] mx-auto gap-4 py-6">
        <Sidebar />
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
              Kết quả tìm kiếm cho: <span className="text-blue-600">"{query}"</span>
            </span>
          </div>
          {/* Tabs với hiệu ứng underline trượt */}
          <div className="flex gap-6 mb-6 text-lg font-semibold relative">
            {["all", "post", "friend"].map((t, idx) => (
              <button
                key={t}
                className={
                  tab === t
                    ? "text-blue-700 relative"
                    : "text-gray-500 relative"
                }
                style={{ transition: 'color 0.2s' }}
                onClick={() => setTab(t as any)}
              >
                {t === "all" ? "Tất cả" : t === "post" ? "Bài viết" : "Bạn bè"}
                {tab === t && (
                  <span className="absolute left-0 right-0 -bottom-1 h-1 bg-blue-700 rounded-full animate-slidein" style={{ transition: 'all 0.3s cubic-bezier(.4,2,.6,1)' }} />
                )}
              </button>
            ))}
          </div>
          {/* Nội dung theo tab với hiệu ứng fade-in */}
          <div className="w-full max-w-3xl flex flex-col gap-6 animate-fadein">
            {tab === "all" && (
              <>
                <div className="font-bold text-blue-700 mb-2">Bài viết</div>
                {posts.length === 0 ? (
                  <div className="text-gray-400 text-lg py-8 bg-white rounded-[32px] shadow border-2 border-[#E3E3E3] text-center">Không có bài viết phù hợp.</div>
                ) : (
                  posts.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-5 bg-white rounded-[32px] shadow px-8 py-6 border-2 border-[#E3E3E3] search-card"
                    >
                      <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center border">
                        <Image src={item.avatar} alt={item.name} width={48} height={48} className="rounded-full" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="font-semibold text-xl">{item.name}</span>
                        <span className="text-base text-gray-500">{item.desc}</span>
                      </div>
                      {/* Icon actions demo */}
                      <div className="flex gap-6 ml-auto">
                        <div className="flex items-center gap-1 text-gray-500"><span role="img" aria-label="like">😊</span> Likes</div>
                        <div className="flex items-center gap-1 text-gray-500"><span role="img" aria-label="comment">💬</span> Comments</div>
                        <div className="flex items-center gap-1 text-gray-500"><span role="img" aria-label="share">🔗</span> Share</div>
                      </div>
                    </div>
                  ))
                )}
                <div className="font-bold text-blue-700 mt-6 mb-2">Bạn Bè</div>
                {friends.length === 0 ? (
                  <div className="text-gray-400 text-lg py-8 bg-white rounded-[32px] shadow border-2 border-[#E3E3E3] text-center">Không có bạn bè phù hợp.</div>
                ) : (
                  friends.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-5 bg-white rounded-[32px] shadow px-8 py-4 border-2 border-[#E3E3E3] search-card"
                    >
                      <div className="w-14 h-14 rounded-full bg-[#F5F5F5] flex items-center justify-center border">
                        <Image src={item.avatar} alt={item.name} width={40} height={40} className="rounded-full" />
                      </div>
                      <span className="font-semibold text-lg flex-1">{item.name}</span>
                      <button className="bg-blue-500 text-white rounded-full px-4 py-2 font-semibold hover:bg-blue-600 transition">Add friend</button>
                    </div>
                  ))
                )}
              </>
            )}
            {tab === "post" && (
              <>
                <div className="font-bold text-blue-700 mb-2">Bài viết</div>
                {posts.length === 0 ? (
                  <div className="text-gray-400 text-lg py-8 bg-white rounded-[32px] shadow border-2 border-[#E3E3E3] text-center">Không có bài viết phù hợp.</div>
                ) : (
                  posts.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-5 bg-white rounded-[32px] shadow px-8 py-6 border-2 border-[#E3E3E3] search-card"
                    >
                      <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center border">
                        <Image src={item.avatar} alt={item.name} width={48} height={48} className="rounded-full" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="font-semibold text-xl">{item.name}</span>
                        <span className="text-base text-gray-500">{item.desc}</span>
                      </div>
                      <div className="flex gap-6 ml-auto">
                        <div className="flex items-center gap-1 text-gray-500"><span role="img" aria-label="like">😊</span> Likes</div>
                        <div className="flex items-center gap-1 text-gray-500"><span role="img" aria-label="comment">💬</span> Comments</div>
                        <div className="flex items-center gap-1 text-gray-500"><span role="img" aria-label="share">🔗</span> Share</div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
            {tab === "friend" && (
              <>
                <div className="font-bold text-blue-700 mb-2">Bạn Bè</div>
                {friends.length === 0 ? (
                  <div className="text-gray-400 text-lg py-8 bg-white rounded-[32px] shadow border-2 border-[#E3E3E3] text-center">Không có bạn bè phù hợp.</div>
                ) : (
                  friends.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-5 bg-white rounded-[32px] shadow px-8 py-4 border-2 border-[#E3E3E3] search-card"
                    >
                      <div className="w-14 h-14 rounded-full bg-[#F5F5F5] flex items-center justify-center border">
                        <Image src={item.avatar} alt={item.name} width={40} height={40} className="rounded-full" />
                      </div>
                      <span className="font-semibold text-lg flex-1">{item.name}</span>
                      <button className="bg-blue-500 text-white rounded-full px-4 py-2 font-semibold hover:bg-blue-600 transition">Add friend</button>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </main>
        <RightSidebar />
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