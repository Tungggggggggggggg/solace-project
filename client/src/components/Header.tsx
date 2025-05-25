"use client";

import React, { FC, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { logout } from "@/lib/firebaseAuth";
import Toast, { ToastProps } from "./Toast";
import gsap from "gsap";

// Định nghĩa kiểu props cho Header: quản lý các sự kiện tìm kiếm, mở modal xác thực, theme, v.v.
interface HeaderProps {
  onOpenAuth?: (tab: "login" | "signup") => void;
  theme?: "inspiring" | "reflective";
  searchValue?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: () => void;
  onSearchKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

// Danh sách gợi ý tìm kiếm mẫu
const mockSuggestions = ["ReactJS", "NextJS", "NodeJS", "Solace", "Figma", "Design System", "UI/UX", "TypeScript", "JavaScript"];

// Component Header: Thanh điều hướng trên cùng của ứng dụng
const Header: FC<HeaderProps> = ({
  onOpenAuth,
  theme = "inspiring",
  searchValue = "",
  onSearchChange,
  onSearch,
  onSearchKeyDown,
}) => {
  const router = useRouter();
  const { user } = useUser();
  // State quản lý giá trị ô tìm kiếm
  const [search, setSearch] = React.useState("");
  // State hiển thị danh sách gợi ý
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  // State lưu danh sách gợi ý đã lọc
  const [filteredSuggestions, setFilteredSuggestions] = React.useState<string[]>([]);
  // State hiển thị menu người dùng
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  // State hiển thị Toast thông báo
  const [toast, setToast] = React.useState<{ message: string; type: ToastProps["type"] } | null>(null);

  // Ref cho các phần tử DOM cần thao tác
  const inputRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const loginBtnRef = useRef<HTMLButtonElement>(null);
  const signupBtnRef = useRef<HTMLButtonElement>(null);

  // Xác định giá trị hiện tại của ô tìm kiếm
  const value = searchValue !== undefined ? searchValue : search;
  // Hàm xử lý thay đổi giá trị ô tìm kiếm
  const handleChange = onSearchChange || ((e) => setSearch(e.target.value));
  // Hàm xử lý sự kiện nhấn phím trong ô tìm kiếm
  const handleKeyDown = onSearchKeyDown || ((e) => {
    if (e.key === "Enter") {
      if (onSearch) onSearch();
      else if (search.trim()) router.push(`/search?query=${encodeURIComponent(search.trim())}`);
      setShowSuggestions(false);
    }
  });
  // Hàm xử lý click nút tìm kiếm
  const handleClick = onSearch || (() => {
    if (value.trim()) router.push(`/search?query=${encodeURIComponent(value.trim())}`);
    setShowSuggestions(false);
  });

  // Lọc gợi ý tìm kiếm khi giá trị thay đổi
  useEffect(() => {
    const keyword = value.trim().toLowerCase();
    if (keyword) {
      setFilteredSuggestions(mockSuggestions.filter((s) => s.toLowerCase().includes(keyword)));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [value]);

  // Đóng gợi ý khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) setShowSuggestions(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Đóng menu người dùng khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý chọn gợi ý tìm kiếm
  const handleSuggestionClick = (suggestion: string) => {
    if (onSearchChange) onSearchChange({ target: { value: suggestion } } as React.ChangeEvent<HTMLInputElement>);
    else setSearch(suggestion);
    setShowSuggestions(false);
    if (onSearch) onSearch();
    else router.push(`/search?query=${encodeURIComponent(suggestion)}`);
  };

  // Hiển thị Toast thông báo
  const showToast = (message: string, type: ToastProps["type"]) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Xử lý đăng xuất người dùng
  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      showToast("Đăng xuất thành công!", "success");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi đăng xuất";
      showToast(errorMessage, "error");
    }
  };

  // Reset hiệu ứng cho các nút
  const resetAnimation = (elements: (HTMLButtonElement | null)[]) => {
    gsap.set(elements.filter(Boolean) as HTMLButtonElement[], { clearProps: "all" });
  };

  // Hiệu ứng hover cho nút
  const handleBtnHover = (ref: React.RefObject<HTMLButtonElement | null>, scale = 1.08) => {
    if (ref.current) {
      gsap.to(ref.current, { scale, boxShadow: "0 4px 24px 0 rgba(140,169,213,0.18)", duration: 0.25, ease: "power2.out" });
    }
  };

  // Hiệu ứng khi rời chuột khỏi nút
  const handleBtnLeave = (ref: React.RefObject<HTMLButtonElement | null>) => {
    if (ref.current) {
      gsap.to(ref.current, { scale: 1, boxShadow: "none", duration: 0.22, ease: "power2.inOut" });
    }
  };

  // Xác định màu nền header theo theme
  const reflectiveColor = "#D5BDAF";
  const inspiringColor = "#AECBEB";
  const headerBg = theme === "reflective" ? reflectiveColor : inspiringColor;

  // Hiệu ứng xuất hiện cho các nút đăng nhập/đăng ký
  useEffect(() => {
    if (loginBtnRef.current && signupBtnRef.current) {
      gsap.from([loginBtnRef.current, signupBtnRef.current], {
        opacity: 0,
        y: 30,
        duration: 0.7,
        stagger: 0,
        ease: "power3.out",
        onComplete: () => resetAnimation([loginBtnRef.current, signupBtnRef.current]),
      });
    }
  }, []);

  return (
    <>
      {/* Header: Thanh điều hướng trên cùng, chứa logo, ô tìm kiếm, nút đăng nhập/đăng ký hoặc menu người dùng */}
      <header className="flex items-center justify-between w-full h-20 px-16" style={{ backgroundColor: headerBg }}>
        <div className="flex items-center h-12 w-32">
          <Image src="/logo.png" alt="Solace Logo" width={128} height={48} className="object-contain" priority />
        </div>
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
            <div className={`flex items-center justify-center px-5 border-l border-black`} style={{ minHeight: "40px", backgroundColor: headerBg }} onClick={handleClick}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="black" className="w-6 h-6">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="black" strokeWidth={2} strokeLinecap="round" />
              </svg>
            </div>
          </div>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 bg-white border border-black/10 rounded-b-xl shadow-lg max-h-60 overflow-y-auto">
              {filteredSuggestions.map((s, idx) => (
                <div key={s + idx} className="px-5 py-3 cursor-pointer hover:bg-[#E1ECF7] text-black text-base" onClick={() => handleSuggestionClick(s)}>
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 justify-end">
          {!user && (
            <>
              <button
                ref={loginBtnRef}
                onClick={() => onOpenAuth?.("login")}
                className="inline-flex items-center justify-center min-w-[110px] h-11 px-6 text-base font-semibold rounded-full border-2 border-[#8CA9D5] bg-white text-[#3B4252] shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8CA9D5]"
                aria-label="Log in"
                onMouseEnter={() => handleBtnHover(loginBtnRef)}
                onMouseLeave={() => handleBtnLeave(loginBtnRef)}
                onFocus={() => handleBtnHover(loginBtnRef)}
                onBlur={() => handleBtnLeave(loginBtnRef)}
                type="button"
              >
                Log in
              </button>
              <button
                ref={signupBtnRef}
                onClick={() => onOpenAuth?.("signup")}
                className="inline-flex items-center justify-center min-w-[110px] h-11 px-6 text-base font-bold rounded-full bg-gradient-to-r from-[#8CA9D5] to-blue-600 text-white shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                aria-label="Sign up"
                onMouseEnter={() => handleBtnHover(signupBtnRef)}
                onMouseLeave={() => handleBtnLeave(signupBtnRef)}
                onFocus={() => handleBtnHover(signupBtnRef)}
                onBlur={() => handleBtnLeave(signupBtnRef)}
                type="button"
              >
                Sign up
              </button>
            </>
          )}
          {user && (
            <div className="relative" ref={userMenuRef}>
              <button
                className="flex items-center gap-2 hover:bg-gray-50 rounded-full p-2 transition-all duration-300 ease-in-out group"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <Image src={user.photoURL || "/images/default-avatar.png"} alt="User Avatar" width={36} height={36} className="rounded-full ring-2 ring-offset-2 ring-[#8CA9D5] group-hover:ring-blue-600 transition-all" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{user.displayName}</span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-50 transform transition-all duration-200 ease-out border border-gray-100">
                  <button
                    onClick={() => router.push("/profile")}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    <span className="material-symbols-outlined text-[20px]">person</span>Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <span className="material-symbols-outlined text-[20px]">logout</span>Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      {/* Toast thông báo trạng thái đăng nhập/đăng xuất hoặc lỗi */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
};

export default Header;