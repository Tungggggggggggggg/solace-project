"use client";

import React, { FC } from 'react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { logout } from "@/lib/firebaseAuth";
import Toast, { ToastProps } from "./Toast";

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
const Header: FC<HeaderProps> = ({
  onOpenAuth,
  theme = 'inspiring',
  searchValue = '',
  onSearchChange,
  onSearch,
  onSearchKeyDown
}) => {
  const router = useRouter();
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastProps['type'];
  } | null>(null);
  
  const inputRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  // Handle user menu click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    if (onSearchChange) onSearchChange({ target: { value: suggestion } } as React.ChangeEvent<HTMLInputElement>);
    else setSearch(suggestion);
    setShowSuggestions(false);
    if (onSearch) onSearch();
    else router.push(`/search?query=${encodeURIComponent(suggestion)}`);
  };

  // Toast handling
  const showToast = (message: string, type: ToastProps['type']) => {
    setToast({ message, type });
    // Auto hide after 3 seconds
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Logout handling with proper error handling and user feedback
  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      showToast('Đăng xuất thành công!', 'success');
      router.push('/'); // Redirect to home after successful logout
    } catch (error) {
      console.error('Logout error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Có lỗi xảy ra khi đăng xuất';
      showToast(errorMessage, 'error');
    }
  };

  // Xác định màu theo theme
  const reflectiveColor = '#D5BDAF';
  const inspiringColor = '#AECBEB';
  const headerBg = theme === 'reflective' ? reflectiveColor : inspiringColor;

  return (
    <>
      {/* Header container */}
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
        {/* User section */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                className="flex items-center gap-2 hover:bg-gray-50 rounded-full p-2 transition-all duration-300 ease-in-out group"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <Image
                  src={user.photoURL || '/images/default-avatar.png'}
                  alt="User Avatar"
                  width={36}
                  height={36}
                  className="rounded-full ring-2 ring-offset-2 ring-[#8CA9D5] group-hover:ring-blue-600 transition-all"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                  {user.displayName}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-50 transform transition-all duration-200 ease-out border border-gray-100">
                  <button
                    onClick={() => router.push('/profile')}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    <span className="material-symbols-outlined text-[20px]">person</span>
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenAuth?.('login')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-lg 
                transition-all duration-300 ease-in-out hover:bg-gray-50 focus:outline-none 
                focus:ring-2 focus:ring-offset-2 focus:ring-blue-200 active:scale-95"
                aria-label="Log in"
              >
                Log in
              </button>
              <button
                onClick={() => onOpenAuth?.('signup')}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#8CA9D5] to-blue-600 
                rounded-lg transition-all duration-300 ease-in-out hover:from-blue-600 hover:to-[#8CA9D5] 
                shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none 
                focus:ring-2 focus:ring-offset-2 focus:ring-blue-200 active:scale-95"
                aria-label="Sign up"
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </header>
      
      {/* Toast with improved positioning and animation */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default Header;