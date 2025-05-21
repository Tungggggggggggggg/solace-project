import React, { useState, useEffect } from 'react';
import { MaterialIcon } from './MaterialIcon';
import Image from 'next/image';

type User = {
  name: string;
  avatar: string;
};

type Notification = {
  id: number;
  type: 'like' | 'comment' | 'follow' | 'system';
  user?: User;
  content: string;
  postPreview?: string;
  comment?: string;
  time: string;
  read: boolean;
};

const NotificationsPage = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'system'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'like',
      user: {
        name: "Tuấn Anh",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg"
      },
      content: "đã thích bài viết của bạn",
      postPreview: "Thiết kế mới của tôi...",
      time: "10 phút trước",
      read: false
    },
    {
      id: 2,
      type: 'comment',
      user: {
        name: "Mai Anh",
        avatar: "https://randomuser.me/api/portraits/women/33.jpg"
      },
      content: "đã bình luận về bài viết của bạn",
      comment: "Thiết kế đẹp quá! Mình rất thích phong cách này.",
      time: "2 giờ trước",
      read: false
    },
    {
      id: 3,
      type: 'follow',
      user: {
        name: "Hương Ly",
        avatar: "https://randomuser.me/api/portraits/women/55.jpg"
      },
      content: "đã bắt đầu theo dõi bạn",
      time: "5 giờ trước",
      read: true
    },
    {
      id: 4,
      type: 'system',
      content: "Cập nhật mới: Tính năng Stories đã có sẵn",
      time: "1 ngày trước",
      read: true
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(noti => ({ ...noti, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(noti => 
      noti.id === id ? { ...noti, read: true } : noti
    ));
  };

  const filteredNotifications = notifications.filter(noti => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !noti.read;
    if (activeTab === 'system') return noti.type === 'system';
    return true;
  });

  if (!mounted) return null;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-3xl mx-auto p-5">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-purple-600">Thông báo</h1>
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-purple-600 hover:text-white transition-all duration-300">
              <MaterialIcon icon="settings" />
            </button>
          </div>
        </div>

        {/* Đánh dấu đã đọc */}
        <div className="text-right mb-6">
          <button 
            onClick={markAllAsRead}
            className="text-purple-600 font-semibold inline-flex items-center gap-1 hover:underline"
          >
            <MaterialIcon icon="done_all" />
            <span>Đánh dấu tất cả đã đọc</span>
          </button>
        </div>

        {/* Tabs */}
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

        {/* Danh sách thông báo */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <MaterialIcon icon="notifications_off" className="text-4xl mb-2" />
              <p>Không có thông báo nào</p>
            </div>
          ) : (
            filteredNotifications.map(noti => (
              <div
                key={noti.id}
                className={`p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-start ${!noti.read ? 'bg-purple-50' : ''}`}
              >
                {noti.type === 'system' ? (
                  <>
                    <MaterialIcon icon="info" className="text-purple-600 mr-4 text-2xl" />
                    <div className="flex-1">
                      <div className="mb-1">{noti.content}</div>
                      <div className="text-sm text-gray-500">{noti.time}</div>
                    </div>
                    {!noti.read && <div className="w-2 h-2 bg-purple-600 rounded-full"></div>}
                  </>
                ) : (
                  <>
                    <Image src={noti.user?.avatar || '/logo.png'} width={48} height={48} className="w-12 h-12 rounded-full mr-4 object-cover" alt={noti.user?.name || 'avatar'} unoptimized />
                    <div className="flex-1">
                      <div className="mb-1">
                        <strong className="text-purple-600">{noti.user?.name}</strong> {noti.content}
                        {noti.type === 'comment' && (
                          <div className="mt-1 text-gray-600 italic">&quot;{noti.comment}&quot;</div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{noti.time}</div>
                    </div>
                    <div className="flex gap-2">
                      {noti.type === 'follow' && (
                        <button className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-purple-600 hover:text-white transition-all duration-300">
                          <MaterialIcon icon="person_add" />
                        </button>
                      )}
                      <button 
                        onClick={() => markAsRead(noti.id)}
                        className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-purple-600 hover:text-white transition-all duration-300"
                      >
                        <MaterialIcon icon="done" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;