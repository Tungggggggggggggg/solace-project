import React, { ReactElement, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FiBell, FiUser } from 'react-icons/fi';

export default function HeaderAdmin({
  onOpenAuth,
}: {
  onOpenAuth: (tab: 'login' | 'signup') => void;
}): ReactElement {
  const [notiCount, setNotiCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [visibleNotiCount, setVisibleNotiCount] = useState(5);
  const notiWrapperRef = useRef<HTMLDivElement>(null);
  const notiListRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
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

  // Click outside dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notiWrapperRef.current && !notiWrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // Đánh dấu đã đọc khi mở dropdown
  useEffect(() => {
    if (showDropdown) {
      const readIds = notifications.map((n) => n.id);
      localStorage.setItem('readNotifications', JSON.stringify(readIds));
      setNotiCount(0);
    }
  }, [showDropdown, notifications]);

  // Tải thêm khi cuộn
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

  return (
    <header className="h-16 bg-[#AECBEB] px-6 flex items-center justify-between fixed top-0 left-64 right-0 z-30">
      <div className="flex items-center gap-4">
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
      </div>

      <div className="flex items-center gap-4 relative" ref={notiWrapperRef}>
        {/* Bell icon */}
        <button
          className="p-2 hover:bg-gray-100 rounded-full relative"
          onClick={() => setShowDropdown((prev) => !prev)}
        >
          <FiBell className="w-6 h-6 text-gray-600" />
          {notiCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 animate-pingOnce">
              {notiCount}
            </span>
          )}
        </button>

        {/* User icon */}
        <button onClick={() => onOpenAuth('login')} className="p-2 hover:bg-gray-100 rounded-full">
          <FiUser className="w-6 h-6 text-gray-600" />
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div
            className="absolute right-10 mt-2 w-96 bg-white shadow-lg rounded-xl border z-50 animate-slide-down"
            style={{ top: '100%' }}
          >
            <div className="p-4 border-b font-semibold text-gray-700">Thông báo mới</div>
            <div
              ref={notiListRef}
              className="max-h-96 overflow-y-auto transition-all duration-300"
              style={{ minHeight: 120 }}
            >
              {notifications.length === 0 ? (
                <div className="p-4 text-gray-500 text-center">Không có thông báo mới</div>
              ) : (
                notifications.slice(0, visibleNotiCount).map((noti) => (
                  <div
                    key={noti.id}
                    className="flex items-start gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer transition-all duration-300"
                  >
                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                      {noti.title === 'Báo cáo mới' ? '🚨' : '📝'}
                    </div>

                    <div className="flex flex-col flex-grow">
                      <div className="text-sm font-semibold text-gray-800">{noti.title}</div>
                      <div className="text-sm text-gray-600 line-clamp-2">{noti.content}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(noti.created_at).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {visibleNotiCount < notifications.length && (
                <div className="p-2 text-center text-blue-500 text-sm">Cuộn để xem thêm...</div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
