"use client";

import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import Toast, { ToastProps } from "./Toast";
import Link from "next/link";
import gsap, { Power3 } from "gsap";
import FilteredInput from "@/components/FilteredInput";
import { debounce } from 'lodash';
import { socket } from '@/socket';
import { access } from "fs";
import axios from 'axios';


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
  const pathname = usePathname();
  const { user, loading, logout, accessToken } = useUser();
  console.log("Header rendered with user:", user);

  // State declarations
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastProps["type"] } | null>(null);
  // Tổng số tin nhắn chưa đọc
  const [unreadCount, setUnreadCount] = useState(0);
  //Tổng số thông báo chưa đọc
  const [unreadNotifications, setUnreadNotifications] = useState(5);
  // State kiểm soát hiển thị biểu tượng tin nhắn và thông báo
  const [showMessageIcon, setShowMessageIcon] = useState(true);
  const [showNotificationIcon, setShowNotificationIcon] = useState(true);
  const [searchHistory, setSearchHistory] = useState<{ id: string; keyword: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Refs
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const loginBtnRef = useRef<HTMLButtonElement>(null);
  const signupBtnRef = useRef<HTMLButtonElement>(null);
  const messageBtnRef = useRef<HTMLButtonElement>(null);
  const notificationBtnRef = useRef<HTMLButtonElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedUpdate = useCallback(
    debounce((count: number) => {
      setUnreadCount(count);
    }, 300),
    []
  );

  // Constants
  const isControlled = typeof searchValue === 'string' && typeof onSearchChange === 'function';
  const value = isControlled ? searchValue : search;
  const reflectiveColor = "#D5BDAF";
  const inspiringColor = "#AECBEB";
  const headerBg = theme === "reflective" ? reflectiveColor : inspiringColor;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  // Hàm xử lý thay đổi giá trị ô tìm kiếm
  const handleChange = isControlled ? onSearchChange : (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);
  // Hàm xử lý sự kiện nhấn phím trong ô tìm kiếm
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onSearchKeyDown) {
      onSearchKeyDown(e);
      return;
    }
    if (e.key === 'Enter') {
      if (onSearch) onSearch();
      setShowSuggestions(false);
    }
  };
  // Hàm xử lý click nút tìm kiếm
  const handleClick = () => {
    if (onSearch) onSearch();
    setShowSuggestions(false);
  };

  // Lấy gợi ý tìm kiếm từ API khi giá trị thay đổi
  useEffect(() => {
    const keyword = value.trim();
    if (keyword) {
      fetch(`/api/search-suggestions?query=${encodeURIComponent(keyword)}`)
        .then(res => res.json())
        .then(data => {
          // Lọc lại ở client: chỉ user có avatar
          setSuggestions(Array.isArray(data) ? data.filter(s => s.type === 'user' && s.avatar) : []);
          setShowSuggestions(true);
        });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  // Đóng gợi ý khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        inputWrapperRef.current &&
        !inputWrapperRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setShowHistory(false);
      }
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

  const handleInputFocus = async () => {
    setShowSuggestions(true);
    await fetchSearchHistory();
    setShowHistory(true);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const relatedTarget = e.relatedTarget as Node;
    if (dropdownRef.current && relatedTarget && dropdownRef.current.contains(relatedTarget)) {
      return;
    }
    setTimeout(() => {
      setShowHistory(false);
      setShowSuggestions(false);
    }, 200);
  };

  const handleSearchWithHistory = async () => {
    if (onSearch) onSearch();
    else if (value.trim()) router.push(`/search?query=${encodeURIComponent(value.trim())}`);
    setShowSuggestions(false);
    await saveSearchHistory(value);
  };

  const saveSearchHistory = async (keyword: string) => {
    if (user && keyword.trim()) {
      try {
        await axios.post(`${API_URL}/api/search_history`, { keyword: keyword.trim() }, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (error) {
        console.error("Error saving search history:", error);
      }
    }
  };

  const handleSuggestionClick = useCallback(async (suggestion: SearchSuggestion) => {
    setShowSuggestions(false);
    if (suggestion.type === 'user') {
      router.push(`/profile/${suggestion.id}`);
    } else {
      if (onSearchChange) onSearchChange({ target: { value: suggestion.name } } as any);
      if (onSearch) onSearch();
    }
  }, [onSearchChange, onSearch, router]);


  // Fetch tổng số unread khi user thay đổi
  useEffect(() => {
    if (!user) return;
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/unread-total`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(data => {
        setUnreadCount(data.total);
      })
      .catch(error => {
        console.error('Error fetching unread count:', error);
      });
  }, [user, accessToken]);

  // Realtime cập nhật khi có unread tăng
  useEffect(() => {
    if (!user) return;

    const handleUnreadUpdate = (data: { total: number }) => {
      debouncedUpdate(data.total);
    };

    socket.on("unreadTotalUpdated", handleUnreadUpdate);
    
    return () => {
      socket.off("unreadTotalUpdated", handleUnreadUpdate);
      debouncedUpdate.cancel();
    };
  }, [user, debouncedUpdate]);

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
          // Lọc lại ở client: chỉ user có avatar
          setSuggestions(Array.isArray(data) ? data.filter(s => s.type === 'user' && s.avatar) : []);
          setShowSuggestions(true);
        });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputWrapperRef.current && !inputWrapperRef.current.contains(event.target as Node)) setShowSuggestions(false);
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

  // Hiệu ứng xuất hiện cho các nút
  useEffect(() => {
    const buttons = [loginBtnRef.current, signupBtnRef.current, messageBtnRef.current, notificationBtnRef.current].filter(Boolean) as HTMLButtonElement[];
    if (buttons.length > 0) {
      gsap.from(buttons, {
        opacity: 0,
        y: 30,
        duration: 0.7,
        stagger: 0,
        ease: "power3.out",
        onComplete: () => resetAnimation(buttons),
      });
    }
  }, []);

  // Xử lý click vào nút tin nhắn
  const handleMessageClick = () => {
    setShowMessageIcon(false);
    router.push("/messages");
  };

  // Xử lý click vào nút thông báo
  const handleNotificationClick = () => {
    setShowNotificationIcon(false);
    router.push("/notifications");
  };

  // Hiển thị lại các biểu tượng dựa trên route hiện tại
  useEffect(() => {
    setShowMessageIcon(pathname !== "/messages");
    setShowNotificationIcon(pathname !== "/notifications");
  }, [pathname, user]);

  // Hiệu ứng xuất hiện cho box đề xuất/lịch sử
  useEffect(() => {
    if ((showSuggestions && suggestions.length > 0) || (showHistory && searchHistory.length > 0)) {
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, y: -20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" }
      );
    }
  }, [showSuggestions, showHistory, suggestions.length, searchHistory.length]);

  // Hiệu ứng xuất hiện từng item
  useEffect(() => {
    if (showSuggestions && suggestions.length > 0 && dropdownRef.current) {
      gsap.fromTo(
        dropdownRef.current.querySelectorAll('.suggestion-item'),
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, stagger: 0.05, duration: 0.25, ease: "power2.out" }
      );
    }
    if (showHistory && searchHistory.length > 0 && dropdownRef.current) {
      gsap.fromTo(
        dropdownRef.current.querySelectorAll('.history-item'),
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, stagger: 0.05, duration: 0.25, ease: "power2.out" }
      );
    }
  }, [showSuggestions, showHistory, suggestions.length, searchHistory.length]);

  // Hàm xóa local trước, 1s sau mới xóa thật và reload lại lịch sử
  const handleDeleteKeywordByIndex = async (idx: number) => {
    const el = document.getElementById(`history-item-${idx}`);
    if (el && dropdownRef.current) {
      el.classList.add('being-removed');
      const dropdownHeight = dropdownRef.current.offsetHeight;
      dropdownRef.current.style.height = `${dropdownHeight}px`;
      await gsap.to(el, { opacity: 0, height: 0, margin: 0, duration: 0.35, ease: "power2.in" });
      dropdownRef.current.style.height = '';
    }
    const item = searchHistory[idx];
    setSearchHistory(prev => prev.filter((_, i) => i !== idx));
    if (inputRef.current) {
      inputRef.current.focus();
      setShowHistory(true);
    }
    setTimeout(async () => {
      try {
        await axios.delete(`${API_URL}/api/search_history/by-keyword/${encodeURIComponent(item.keyword)}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        });
        await fetchSearchHistory();
      } catch (error) {
        console.error("Error deleting search history:", error);
      }
    }, 1000);
  };

  // Khi focus vào input hoặc mount lại, luôn fetch lại lịch sử mới nhất
  const fetchSearchHistory = async () => {
    if (user) {
      try {
        const res = await axios.get(`${API_URL}/api/search_history`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (res.data && Array.isArray(res.data.history)) {
          setSearchHistory(res.data.history.map((h: any) => ({ id: h.id, keyword: h.keyword })));
        }
      } catch (error) {
        console.error("Error fetching search history:", error);
      }
    }
  };

  useEffect(() => {
    fetchSearchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Thêm hàm xóa tất cả với hiệu ứng:
  const handleDeleteAllHistory = async () => {
    if (!searchHistory.length) return;
    // Hiệu ứng GSAP cho tất cả item
    const ids = searchHistory.slice(0, 8).map((_, idx) => `history-item-${idx}`);
    const els = ids.map(id => document.getElementById(id)).filter(Boolean);
    if (els.length) {
      await Promise.all(els.map(el => {
        if (el) {
          el.classList.add('being-removed');
          return gsap.to(el, { opacity: 0, height: 0, margin: 0, duration: 0.35, ease: 'power2.in' });
        }
        return Promise.resolve();
      }));
    }
    setSearchHistory([]); // Xóa local ngay
    if (inputRef.current) {
      inputRef.current.focus();
      setShowHistory(true);
    }
    setTimeout(async () => {
      try {
        await axios.delete(`${API_URL}/api/search_history/all`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        });
        await fetchSearchHistory();
      } catch (error) {
        console.error('Error deleting all search history:', error);
      }
    }, 1000);
  };

  return (
    <>
      <header className="flex items-center justify-between w-full h-16 sm:h-20 px-4 sm:px-8 lg:px-16" style={{ backgroundColor: headerBg }}>
        <Link href="/" className="flex items-center h-10 w-24 sm:h-12 sm:w-32 hover:opacity-80 transition-opacity duration-200 cursor-pointer">
          <Image src="/logo.png" alt="Solace Logo" width={96} height={36} className="object-contain sm:w-128 sm:h-48" priority />
        </Link>
        <div className="flex-1 max-w-md sm:max-w-xl mx-4 sm:mx-8 relative">
          <div className="flex w-full rounded-full border border-black bg-white overflow-hidden" ref={inputWrapperRef}>
            <FilteredInput
              ref={inputRef}
              type="text"
              value={value}
              onChange={memoizedHandleChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSearchWithHistory();
                else memoizedHandleKeyDown(e);
              }}
              placeholder="Tìm kiếm..."
              className="flex-1 px-3 sm:px-5 py-2 bg-white text-sm sm:text-base font-normal placeholder:text-gray-400 focus:outline-none border-none rounded-none text-black"
            />
            <div 
              className="flex items-center justify-center px-3 sm:px-5 border-l border-black cursor-pointer" 
              style={{ minHeight: "36px", backgroundColor: headerBg }} 
              onClick={memoizedHandleClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="black" className="w-5 h-5 sm:w-6 sm:h-6">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="black" strokeWidth={2} strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div className="dropdown-wrapper absolute left-0 right-0 top-full z-50">
            {showSuggestions && suggestions.length > 0 ? (
              <div ref={dropdownRef} className="bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto mt-1">
                {suggestions.filter(s => s.type === 'user' && s.avatar).map((s, idx) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gradient-to-r from-blue-50 to-white text-gray-800 text-sm group suggestion-item transition-all duration-200"
                    onMouseEnter={e => gsap.to(e.currentTarget, { background: 'linear-gradient(to right, #e6f0fa, #ffffff)', duration: 0.2 })}
                    onMouseLeave={e => gsap.to(e.currentTarget, { background: 'transparent', duration: 0.2 })}
                    onMouseDown={() => handleSuggestionClick(s)}
                  >
                    <Image src={typeof s.avatar === 'string' && s.avatar ? s.avatar : '/default-avatar.png'} alt={s.name} width={32} height={32} className="rounded-full object-cover" />
                    <span className="font-medium text-gray-900 truncate">{s.name}</span>
                  </div>
                ))}
              </div>
            ) : showHistory && searchHistory.length > 0 ? (
              <div ref={dropdownRef} className="bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto mt-1">
                <div className="flex flex-col divide-y divide-gray-100">
                  {searchHistory.slice(0, 8).map((item, idx) => (
                    <div
                      key={item.id}
                      id={`history-item-${idx}`}
                      role="option"
                      aria-selected="false"
                      tabIndex={0}
                      className="flex items-center justify-between px-4 py-2 hover:bg-gradient-to-r from-blue-50 to-white cursor-pointer text-gray-700 group bg-white history-item transition-all duration-200"
                      onMouseEnter={e => {
                        if (!e.currentTarget.classList.contains('being-removed')) {
                          gsap.to(e.currentTarget, { background: 'linear-gradient(to right, #e6f0fa, #ffffff)', duration: 0.2 });
                        }
                      }}
                      onMouseLeave={e => {
                        if (!e.currentTarget.classList.contains('being-removed')) {
                          gsap.to(e.currentTarget, { background: 'transparent', duration: 0.2 });
                        }
                      }}
                    >
                      <div
                        className="flex items-center gap-2 flex-1 min-w-0"
                        onMouseDown={async (e) => {
                          e.stopPropagation();
                          setSearch(item.keyword);
                          setShowHistory(false);
                          if (onSearchChange) onSearchChange({ target: { value: item.keyword } } as any);
                          await saveSearchHistory(item.keyword);
                          router.push(`/search?query=${encodeURIComponent(item.keyword)}`);
                        }}
                      >
                        <span className="inline-flex items-center justify-center w-7 h-7 text-gray-500">
                          <svg viewBox="0 0 21 21" aria-hidden="true" width="20" height="20">
                            <g>
                              <path d="M9.094 3.095c-3.314 0-6 2.686-6 6s2.686 6 6 6c1.657 0 3.155-.67 4.243-1.757 1.087-1.088 1.757-2.586 1.757-4.243 0-3.314-2.686-6-6-6zm-9 6c0-4.971 4.029-9 9-9s9 4.029 9 9c0 1.943-.617 3.744-1.664 5.215l4.475 4.474-2.122 2.122-4.474-4.475c-1.471 1.047-3.272 1.664-5.215 1.664-4.97-.001-8.999-4.03-9-9z"></path>
                            </g>
                          </svg>
                        </span>
                        <span className="truncate text-sm font-medium text-gray-900">{item.keyword}</span>
                      </div>
                      <button
                        aria-label="Xóa"
                        type="button"
                        className="ml-2 p-1 rounded-full hover:bg-red-100 text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteKeywordByIndex(idx);
                        }}
                      >
                        <span className="inline-flex items-center justify-center w-6 h-6">
                          <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16">
                            <g>
                              <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path>
                            </g>
                          </svg>
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 justify-end">
          {loading ? (
            <div className="flex items-center gap-2 p-2">
              <div className="bg-gray-200 rounded-full w-6 h-6 sm:w-8 sm:h-8 animate-pulse" />
              <div className="bg-gray-200 rounded-full w-16 sm:w-20 h-4 animate-pulse" />
            </div>
          ) : !user ? (
            <>
              <button
                ref={loginBtnRef}
                onClick={() => onOpenAuth?.("login")}
                className="hidden sm:inline-flex items-center justify-center min-w-[90px] h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base font-semibold rounded-full border-2 border-[#8CA9D5] bg-white text-[#3B4252] shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8CA9D5]"
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
                className="inline-flex items-center justify-center min-w-[90px] h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base font-bold rounded-full bg-gradient-to-r from-[#8CA9D5] to-blue-600 text-white shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
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
            <>
              {showMessageIcon && (
                <button
                  ref={messageBtnRef}
                  onClick={handleMessageClick}
                  className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#8CA9D5] hover:bg-[#E1ECF7] transition-all duration-200"
                  aria-label="Messages"
                  onMouseEnter={() => handleBtnHover(messageBtnRef, 1.1)}
                  onMouseLeave={() => handleBtnLeave(messageBtnRef)}
                  onFocus={() => handleBtnHover(messageBtnRef, 1.1)}
                  onBlur={() => handleBtnLeave(messageBtnRef)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[#3B4252] text-lg sm:text-[20px]">mail</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}
              {showNotificationIcon && (
                <button
                  ref={notificationBtnRef}
                  onClick={handleNotificationClick}
                  className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#8CA9D5] hover:bg-[#E1ECF7] transition-all duration-200"
                  aria-label="Notifications"
                  onMouseEnter={() => handleBtnHover(notificationBtnRef, 1.1)}
                  onMouseLeave={() => handleBtnLeave(notificationBtnRef)}
                  onFocus={() => handleBtnHover(notificationBtnRef, 1.1)}
                  onBlur={() => handleBtnLeave(notificationBtnRef)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[#3B4252] text-lg sm:text-[20px]">notifications</span>
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              )}
              <div className="relative" ref={userMenuRef}>
                <button
                  className="flex items-center gap-1 sm:gap-2 hover:bg-gray-50 rounded-full p-1 sm:p-2 transition-all duration-300 ease-in-out group"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <Image src={user.avatar_url || "/default-avatar.png"} 
                    alt="User Avatar" width={32} height={32} className="rounded-full ring-2 ring-offset-2 ring-[#8CA9D5] group-hover:ring-blue-600 transition-all" />
                  <span className="hidden sm:inline text-sm font-medium text-gray-700 group-hover:text-blue-600">{user.last_name} {user.first_name}</span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-xl shadow-lg py-1 z-50 transform transition-all duration-200 ease-out border border-gray-100">
                    <button
                      onClick={() => router.push("/profile")}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                    >
                      <span className="material-symbols-outlined text-lg sm:text-[20px]">person</span>Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <span className="material-symbols-outlined text-lg sm:text-[20px]">logout</span>Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </header>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
});

Header.displayName = 'Header';

export default Header;