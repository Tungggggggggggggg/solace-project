"use client";

import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import Toast, { ToastProps } from "./Toast";
import Link from "next/link";
import gsap from "gsap";
import FilteredInput from "@/components/FilteredInput";


// Định nghĩa kiểu props cho Header
interface HeaderProps {
  onOpenAuth?: (tab: "login" | "signup") => void;
  theme?: "inspiring" | "reflective";
  searchValue?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: () => void;
  onSearchKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

// Định nghĩa kiểu dữ liệu cho các gợi ý tìm kiếm
interface SearchSuggestion {
  id: string | number;
  name: string;
  type: 'user' | 'post';
  avatar?: string;
}

// Component Header: Thanh điều hướng trên cùng của ứng dụng
const Header = memo<HeaderProps>(({
  onOpenAuth,
  theme = "inspiring",
  searchValue = "",
  onSearchChange,
  onSearch,
  onSearchKeyDown,
}) => {
  const router = useRouter();
  const { user, loading, logout } = useUser();
  console.log("Header rendered with user:", user);

  // State declarations
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastProps["type"] } | null>(null);

  // Refs
  const inputRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const loginBtnRef = useRef<HTMLButtonElement>(null);
  const signupBtnRef = useRef<HTMLButtonElement>(null);

  // Constants
  const isControlled = typeof searchValue === 'string' && typeof onSearchChange === 'function';
  const value = isControlled ? searchValue : search;
  const reflectiveColor = "#D5BDAF";
  const inspiringColor = "#AECBEB";
  const headerBg = theme === "reflective" ? reflectiveColor : inspiringColor;

  // Memoized handlers
  const memoizedHandleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isControlled && onSearchChange) {
      onSearchChange(e);
    } else {
      setSearch(e.target.value);
    }
  }, [isControlled, onSearchChange]);

  const memoizedHandleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onSearchKeyDown) {
      onSearchKeyDown(e);
      return;
    }
    if (e.key === "Enter") {
      if (onSearch) {
        onSearch();
      } else if (value.trim()) {
        router.push(`/search?query=${encodeURIComponent(value.trim())}`);
      }
      setShowSuggestions(false);
    }
  }, [onSearchKeyDown, onSearch, value, router]);

  const memoizedHandleClick = useCallback(() => {
    if (onSearch) {
      onSearch();
    } else if (value.trim()) {
      router.push(`/search?query=${encodeURIComponent(value.trim())}`);
    }
    setShowSuggestions(false);
  }, [onSearch, value, router]);

  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    setShowSuggestions(false);
    if (suggestion.type === 'user') {
      router.push(`/profile/${suggestion.id}`);
    } else if (suggestion.type === 'post') {
      router.push(`/posts/${suggestion.id}`);
    } else {
      if (onSearchChange) onSearchChange({ target: { value: suggestion.name } } as React.ChangeEvent<HTMLInputElement>);
      else setSearch(suggestion.name);
      if (onSearch) onSearch();
      else router.push(`/search?query=${encodeURIComponent(suggestion.name)}`);
    }
  }, [router, onSearchChange, onSearch, setSearch]);

  // Functions
  const showToast = (message: string, type: ToastProps["type"]) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = async () => {
    if (loading) return;
    try {
      await logout();
      showToast("Đăng xuất thành công!", "success");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi đăng xuất";
      showToast(errorMessage, "error");
    }
  };

  const resetAnimation = (elements: (HTMLButtonElement | null)[]) => {
    gsap.set(elements.filter(Boolean) as HTMLButtonElement[], { clearProps: "all" });
  };

  const handleBtnHover = (ref: React.RefObject<HTMLButtonElement | null>, scale = 1.08) => {
    if (ref.current) {
      gsap.to(ref.current, { scale, boxShadow: "0 4px 24px 0 rgba(140,169,213,0.18)", duration: 0.25, ease: "power2.out" });
    }
  };

  const handleBtnLeave = (ref: React.RefObject<HTMLButtonElement | null>) => {
    if (ref.current) {
      gsap.to(ref.current, { scale: 1, boxShadow: "none", duration: 0.22, ease: "power2.inOut" });
    }
  };

  // Effects
  useEffect(() => {
    const keyword = value.trim();
    if (keyword) {
      fetch(`/api/search-suggestions?query=${encodeURIComponent(keyword)}`)
        .then(res => res.json())
        .then(data => {
          setSuggestions(Array.isArray(data) ? data : []);
          setShowSuggestions(true);
        });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) setShowSuggestions(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      <header className="flex items-center justify-between w-full h-20 px-16" style={{ backgroundColor: headerBg }}>
        <Link href="/" className="flex items-center h-12 w-32 hover:opacity-80 transition-opacity duration-200 cursor-pointer">
          <Image src="/logo.png" alt="Solace Logo" width={128} height={48} className="object-contain" priority />
        </Link>
        <div className="flex-1 max-w-xl mx-8 relative">
          <div className="flex w-full rounded-full border border-black bg-white overflow-hidden" ref={inputRef}>
            <FilteredInput
              type="text"
              value={value}
              onChange={memoizedHandleChange}
              onKeyDown={memoizedHandleKeyDown}
              placeholder="Search for anything ..."
              className="flex-1 px-5 py-2 bg-white text-base font-normal placeholder:text-gray-400 focus:outline-none border-none rounded-none text-black"
              onFocus={() => value && setShowSuggestions(true)}
            />
            <div 
              className="flex items-center justify-center px-5 border-l border-black cursor-pointer" 
              style={{ minHeight: "40px", backgroundColor: headerBg }} 
              onClick={memoizedHandleClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="black" className="w-6 h-6">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="black" strokeWidth={2} strokeLinecap="round" />
              </svg>
            </div>
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 bg-white border border-black/10 rounded-b-xl shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((s, idx) => (
                <div 
                  key={s.id + s.type + idx} 
                  className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-[#E1ECF7] text-black text-base" 
                  onClick={() => handleSuggestionClick(s)}
                >
                  {s.avatar && <Image src={s.avatar} alt={s.name} width={32} height={32} className="rounded-full" />}
                  <span className="font-medium">{s.name}</span>
                  <span className="ml-auto text-xs px-2 py-1 rounded bg-gray-100 text-gray-500 border border-gray-200">
                    {s.type === 'user' ? 'User' : 'Post'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 justify-end">
          {loading ? (
            <div className="flex items-center gap-2 p-2">
              <div className="bg-gray-200 rounded-full w-8 h-8 animate-pulse" />
              <div className="bg-gray-200 rounded-full w-20 h-4 animate-pulse" />
            </div>
          ) : !user ? (
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
          ) : (
            <div className="relative" ref={userMenuRef}>
              <button
                className="flex items-center gap-2 hover:bg-gray-50 rounded-full p-2 transition-all duration-300 ease-in-out group"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <Image 
                  src={user.avatar_url || "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="} 
                  alt="User Avatar" 
                  width={36} 
                  height={36} 
                  className="rounded-full ring-2 ring-offset-2 ring-[#8CA9D5] group-hover:ring-blue-600 transition-all" 
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                  {user.last_name} {user.first_name}
                </span>
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
});

Header.displayName = 'Header';

export default Header;