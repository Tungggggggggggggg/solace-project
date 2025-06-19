'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MaterialIcon } from './MaterialIcon';
import Image from 'next/image';
import { useUser } from '@/contexts/UserContext';
import { socket } from '@/socket';
import { Notification } from '@/types/notification';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
}

const NotificationsPage = () => {
  const { user, accessToken } = useUser();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'system'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const NOTI_PAGE_SIZE = 10;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchNotifications = useCallback(
    async (pageNum: number) => {
      if (!user || !accessToken || isFetchingRef.current) return;

      try {
        isFetchingRef.current = true;
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/notifications?page=${pageNum}&limit=${NOTI_PAGE_SIZE}&tab=${activeTab}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch notifications');

        const data = await response.json();
        setNotifications((prev) =>
          pageNum === 1 ? data.notifications : [...prev, ...data.notifications]
        );
        setHasMore(data.hasMore);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [user, accessToken, activeTab]
  );

  useEffect(() => {
    if (user && accessToken) {
      setPage(1);
      fetchNotifications(1);
    }
  }, [user, accessToken, activeTab, fetchNotifications]);

  // Handle real-time notifications
  useEffect(() => {
    if (!user || !socket.connected) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [user]);

  // Infinite scroll
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      if (
        scrollContainer.scrollTop + scrollContainer.clientHeight >=
          scrollContainer.scrollHeight - 100 &&
        hasMore &&
        !loading &&
        !isFetchingRef.current
      ) {
        setPage((prev) => {
          const nextPage = prev + 1;
          fetchNotifications(nextPage);
          return nextPage;
        });
      }
    };

    // Debounce scroll handler
    let timeoutId: NodeJS.Timeout;
    const debouncedHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    scrollContainer.addEventListener('scroll', debouncedHandleScroll);
    return () => {
      scrollContainer.removeEventListener('scroll', debouncedHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [hasMore, loading, fetchNotifications]);

  const markAllAsRead = async () => {
    if (!user || !accessToken) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setNotifications((prev) => prev.map((noti) => ({ ...noti, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const markAsRead = async (id: string) => {
    if (!user || !accessToken) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setNotifications((prev) =>
        prev.map((noti) => (noti.id === id ? { ...noti, is_read: true } : noti))
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  if (!mounted) return null;

  const filteredNotifications = notifications.filter((noti) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !noti.is_read;
    if (activeTab === 'system') return noti.type === 'system';
    return true;
  });

  return (
    <div className="h-full bg-gray-50 text-gray-800">
      <div className="max-w-3xl mx-auto p-5 h-full flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-purple-600">Thông báo</h1>
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-purple-600 hover:text-white transition-all duration-300">
              <MaterialIcon icon="settings" />
            </button>
          </div>
        </div>

        <div className="text-right">
          <button
            onClick={markAllAsRead}
            className="text-purple-600 font-semibold inline-flex items-center gap-1 hover:underline"
          >
            <MaterialIcon icon="done_all" />
            <span>Đánh dấu tất cả đã đọc</span>
          </button>
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-semibold relative ${activeTab === 'all' ? 'text-purple-600' : ''}`}
          >
            Tất cả
            {activeTab === 'all' && (
              <span className="absolute bottom-0 left-1/4 w-1/2 h-0.5 bg-purple-600 rounded-t"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-6 py-3 font-semibold relative ${activeTab === 'unread' ? 'text-purple-600' : ''}`}
          >
            Chưa đọc
            {activeTab === 'unread' && (
              <span className="absolute bottom-0 left-1/4 w-1/2 h-0.5 bg-purple-600 rounded-t"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-6 py-3 font-semibold relative ${activeTab === 'system' ? 'text-purple-600' : ''}`}
          >
            Hệ thống
            {activeTab === 'system' && (
              <span className="absolute bottom-0 left-1/4 w-1/2 h-0.5 bg-purple-600 rounded-t"></span>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
          {loading && page === 1 ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <MaterialIcon icon="notifications_off" className="text-4xl mb-2" />
              <p>Không có thông báo nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((noti) => (
                <div
                  key={noti.id}
                  className={`p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-start ${
                    !noti.is_read ? 'bg-purple-50' : ''
                  }`}
                >
                  {noti.type === 'system' ? (
                    <>
                      <MaterialIcon icon="info" className="text-purple-600 mr-4 text-2xl" />
                      <div className="flex-1">
                        <div className="font-semibold">{noti.title}</div>
                        <div className="mb-1">{noti.content}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(noti.created_at).toLocaleString()}
                        </div>
                      </div>
                      {!noti.is_read && <div className="w-2 h-2 bg-purple-600 rounded-full"></div>}
                    </>
                  ) : (
                    <>
                      <Image
                        src={noti.sender?.avatar_url || '/logo.png'}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full mr-4 object-cover"
                        alt={`${noti.sender?.first_name || ''} ${noti.sender?.last_name || ''}`}
                        unoptimized
                      />
                      <div className="flex-1">
                        <div className="mb-1">
                          <strong className="text-purple-600">
                            {noti.sender?.first_name} {noti.sender?.last_name}
                          </strong>{' '}
                          {noti.content}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(noti.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {noti.type === 'follow' && (
                          <button className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-purple-600 hover:text-white transition-all duration-300">
                            <MaterialIcon icon="person_add" />
                          </button>
                        )}
                        {!noti.is_read &&
                          <button
                            onClick={() => markAsRead(noti.id)}
                            className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-purple-600 hover:text-white transition-all duration-300"
                          >
                            <MaterialIcon icon="done" />
                          </button>
                        }
                      </div>
                    </>
                  )}
                </div>
              ))}
              {loading && page > 1 && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;