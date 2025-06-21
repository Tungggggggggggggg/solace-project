'use client';

import React, { ReactElement, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FiBell, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function HeaderAdmin({
  onOpenAuth,
  className = '',
}: {
  onOpenAuth: (tab: 'login' | 'signup') => void;
  className?: string;
}): ReactElement {
  const [notiCount, setNotiCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [visibleNotiCount, setVisibleNotiCount] = useState(5);
  const notiWrapperRef = useRef<HTMLDivElement>(null);
  const notiListRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/admin/notifications');
        const data = await res.json();
        const readNotiIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
        const unreadNotis = data.filter((noti: any) => !readNotiIds.includes(noti.id));
        setNotifications(data);
        setNotiCount(unreadNotis.length);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notiWrapperRef.current && !notiWrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  useEffect(() => {
    if (showDropdown) {
      const readIds = notifications.map((n) => n.id);
      localStorage.setItem('readNotifications', JSON.stringify(readIds));
      setNotiCount(0);
    }
  }, [showDropdown, notifications]);

  useEffect(() => {
    if (showDropdown && notiListRef.current) {
      notiListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showDropdown]);

  const handleNotiScroll = () => {
    if (!notiListRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = notiListRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      setVisibleNotiCount((prev) => Math.min(prev + 5, notifications.length));
    }
  };

  useEffect(() => {
    if (!showDropdown) return;
    const ref = notiListRef.current;
    if (ref) ref.addEventListener('scroll', handleNotiScroll);
    return () => {
      if (ref) ref.removeEventListener('scroll', handleNotiScroll);
    };
  }, [showDropdown, notifications.length]);

  const handleToggleDropdown = () => {
    if (showUserDropdown) setShowUserDropdown(false);
    setShowDropdown((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    if (showUserDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserDropdown]);

  return (
    <header
      className={`h-12 sm:h-14 lg:h-16 bg-[#AECBEB] px-4 flex items-center justify-between shadow-md ${className}`}
    >
      {/* Left: Menu button & Logo */}
      <div className="flex items-center gap-4">
        {/* Menu icon - only visible on mobile/tablet */}
        <button className="block lg:hidden p-2 rounded-md hover:bg-white/40">
          <FiMenu className="w-6 h-6 text-gray-900" />
        </button>

        {/* Logo */}
        <div className="flex items-center h-full">
          <Image
            src="/logo.png"
            alt="Solace Logo"
            width={300}
            height={90}
            className="object-contain h-24 sm:h-32 lg:h-30"
            priority
          />
        </div>
      </div>

      {/* Right: Notifications and User icon */}
      <div className="flex items-center gap-3 sm:gap-4 relative" ref={notiWrapperRef}>
        {/* Bell icon */}
        <button
          className={`p-3 sm:p-4 rounded-full relative transition-all duration-200 ${
            showDropdown ? 'bg-gray-50 hover:bg-gray-100' : 'hover:bg-gray-50'
          }`}
          onClick={handleToggleDropdown}
        >
          <FiBell
            className={`w-6 h-6 sm:w-7 h-7 transition-colors duration-200 ${
              showDropdown ? 'text-blue-700' : 'text-gray-900'
            }`}
          />
          {notiCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-sm font-bold rounded-full px-2 animate-pingOnce">
              {notiCount}
            </span>
          )}
        </button>

        {/* User icon */}
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => {
              if (showDropdown) setShowDropdown(false);
              setShowUserDropdown((prev) => !prev);
            }}
            className={`p-3 sm:p-4 hover:bg-gray-50 rounded-full transition-all duration-200 ${showUserDropdown ? 'bg-gray-50' : ''}`}
          >
            <FiUser className={`w-6 h-6 sm:w-7 h-7 transition-colors duration-200 ${showUserDropdown ? 'text-blue-700' : 'text-gray-900'}`} />
          </button>
          {showUserDropdown && (
            <div className="absolute right-0 top-full  w-36 bg-white shadow-lg rounded-xl border border-gray-200 z-50 animate-fade-in-down">
              <button
                className="block w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-xl"
                onClick={() => {
                  setShowUserDropdown(false);
                  router.push('/admin/login');
                }}
              >
                Log out
              </button>
            </div>
          )}
        </div>

        {/* Dropdown thông báo */}
        {showDropdown && (
          <div
            className="fixed sm:absolute top-14 sm:top-full right-0 sm:right-10 mt-0 w-[90vw] max-w-[320px] sm:max-w-[360px] lg:max-w-[400px] bg-white shadow-xl rounded-xl border border-gray-300 z-50 animate-fade-in-down"
          >
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-300">
              <div className="font-bold text-gray-900 text-base sm:text-lg">Thông báo mới</div>
              <button
                className="block sm:hidden p-2 hover:bg-gray-50 rounded-full"
                onClick={() => setShowDropdown(false)}
              >
                <FiX className="w-6 h-6 text-gray-900" />
              </button>
            </div>
            <div
              ref={notiListRef}
              className="max-h-80 sm:max-h-96 overflow-y-auto transition-all duration-300"
              style={{ minHeight: 150 }}
            >
              {notifications.length === 0 ? (
                <div className="p-4 text-gray-600 text-center text-base sm:text-lg">
                  Không có thông báo mới
                </div>
              ) : (
                notifications.slice(0, visibleNotiCount).map((noti) => (
                  <div
                    key={noti.id}
                    className="flex items-start gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-200 last:border-b-0 hover:bg-blue-50 cursor-pointer transition-all duration-300"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 text-2xl sm:text-3xl">
                      {noti.title === 'Báo cáo mới' ? '🚨' : '📝'}
                    </div>
                    <div className="flex flex-col flex-grow">
                      <div className="text-base sm:text-lg font-bold text-gray-900">{noti.title}</div>
                      <div className="text-sm sm:text-base text-gray-600 line-clamp-2">{noti.content}</div>
                      <div className="text-sm text-gray-500 mt-2">
                        {new Date(noti.created_at).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {visibleNotiCount < notifications.length && (
                <div className="p-3 text-center text-blue-700 text-base sm:text-lg">
                  Cuộn để xem thêm...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}