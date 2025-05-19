"use client";

// Import component và hook cần thiết
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

// Định nghĩa interface cho props của Header
interface HeaderProps {
  onOpenAuth?: (tab: 'login' | 'signup') => void; /* Hàm mở modal đăng nhập/đăng ký */
  theme?: 'inspiring' | 'reflective';
  searchValue?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: () => void;
  onSearchKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const mockSuggestions = [
  "ReactJS",
  "NextJS",
  "NodeJS",
  "Solace",
  "Figma",
  "Design System",
  "UI/UX",
  "TypeScript",
  "JavaScript",
];

// Component Header hiển thị logo, thanh tìm kiếm và nút đăng nhập/đăng ký
const Header = ({ onOpenAuth, theme = 'inspiring', searchValue, onSearchChange, onSearch, onSearchKeyDown, ...props }: HeaderProps) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLDivElement>(null);

  // Nếu không truyền props thì dùng state nội bộ
  const value = searchValue !== undefined ? searchValue : search;
  const handleChange = onSearchChange || ((e) => {
    setSearch(e.target.value);
  });
  const handleKeyDown = onSearchKeyDown || ((e) => {
    if (e.key === "Enter") {
      if (onSearch) onSearch();
      else if (search.trim()) router.push(`/search?query=${encodeURIComponent(search.trim())}`);
      setShowSuggestions(false);
    }
  });
  const handleClick = onSearch || (() => {
    if (value.trim()) router.push(`/search?query=${encodeURIComponent(value.trim())}`);
    setShowSuggestions(false);
  });

  // Gợi ý khi nhập
  useEffect(() => {
    const keyword = value.trim().toLowerCase();
    if (keyword) {
      setFilteredSuggestions(
        mockSuggestions.filter((s) => s.toLowerCase().includes(keyword))
      );
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [value]);

  // Đóng gợi ý khi click ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    if (onSearchChange) onSearchChange({ target: { value: suggestion } } as any);
    else setSearch(suggestion);
    setShowSuggestions(false);
    if (onSearch) onSearch();
    else router.push(`/search?query=${encodeURIComponent(suggestion)}`);
  };

  // Xác định màu theo theme
  const reflectiveColor = '#D5BDAF';
  const inspiringColor = '#AECBEB';
  const headerBg = theme === 'reflective' ? reflectiveColor : inspiringColor;

  return (
    // Header container
    <header className={`flex items-center justify-between w-full h-20 px-16`} style={{ backgroundColor: headerBg }}>
      {/* Logo */}
      <div className="flex items-center h-12 w-32">
        <Image
          src="/logo.png"
          alt="Solace Logo"
          width={128}
          height={48}
          className="object-contain"
          priority
        />
      </div>
      {/* Thanh tìm kiếm */}
      <div className="flex-1 max-w-xl mx-8 relative">
        <div className="flex w-full rounded-full border border-black bg-white overflow-hidden" ref={inputRef}>
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Search for anything ..."
            className="flex-1 px-5 py-2 bg-white text-base font-normal placeholder:text-gray-400 focus:outline-none border-none rounded-none text-black"
            onFocus={() => value && setShowSuggestions(true)}
          />
          <div
            className={`flex items-center justify-center px-5 border-l border-black`}
            style={{ minHeight: '40px', backgroundColor: headerBg }}
            onClick={handleClick}
          >
            {/* Icon tìm kiếm */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="black" className="w-6 h-6">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="black" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </div>
        </div>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 bg-white border border-black/10 rounded-b-xl shadow-lg max-h-60 overflow-y-auto">
            {filteredSuggestions.map((s, idx) => (
              <div
                key={s + idx}
                className="px-5 py-3 cursor-pointer hover:bg-[#E1ECF7] text-black text-base"
                onClick={() => handleSuggestionClick(s)}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Nút đăng nhập/đăng ký và thông tin người dùng */}
      <div className="flex items-center space-x-4">
        <button
          className="px-4 py-2 rounded-full bg-white text-black font-semibold border border-black/20 hover:bg-gray-100 transition"
          onClick={() => onOpenAuth && onOpenAuth('login')}
        >
          Đăng nhập
        </button>
        <button
          className={`px-4 py-2 rounded-full text-black font-semibold border border-black/20 hover:bg-[#B7CCEC] transition`}
          style={{ backgroundColor: headerBg }}
          onClick={() => onOpenAuth && onOpenAuth('signup')}
        >
          Đăng ký
        </button>
        {/* Tên người dùng */}
        <span className="text-gray-800 font-semibold text-base">NAME</span>
        {/* Avatar người dùng */}
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          <span className="material-symbols-outlined text-gray-500 text-3xl">person</span>
        </div>
      </div>
    </header>
  );
};

export default Header;