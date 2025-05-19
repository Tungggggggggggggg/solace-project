'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { FC } from 'react';
import { MaterialIcon } from './MaterialIcon';
import clsx from 'clsx';

interface User {
  id: number;
  name: string;
  avatar: string;
  online: boolean;
}

interface Message {
  id: number;
  text: string;
  time: string;
  sent: boolean;
  date: string;
  image?: string;
}

interface Conversation {
  id: number;
  user: User;
  lastMessage: {
    text: string;
    time: string;
    unread: number;
  };
}

const MessagePage: FC = () => {
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<number, Message[]>>({});
  const [friends, setFriends] = useState<User[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tạo dữ liệu mẫu
  useEffect(() => {
    const sampleConversations: Conversation[] = [
      {
        id: 1,
        user: {
          id: 1,
          name: 'Mai Anh',
          avatar: 'https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/09/18/458/avatar-dep-4.jpg',
          online: true,
        },
        lastMessage: {
          text: 'Mình đã xem thiết kế của bạn, rất đẹp!',
          time: '10:30 AM',
          unread: 2,
        },
      },
      {
        id: 2,
        user: {
          id: 2,
          name: 'Tuấn Anh',
          avatar: 'https://i.pinimg.com/originals/8f/33/30/8f3330d6163782b88b506d396f5d156f.jpg',
          online: false,
        },
        lastMessage: {
          text: 'Cảm ơn bạn đã giúp đỡ!',
          time: 'Hôm qua',
          unread: 0,
        },
      },
    ];

    const sampleMessages: Record<number, Message[]> = {
      1: [
        { id: 1, text: 'Chào Mai Anh...', time: '10:20 AM', sent: true, date: 'Hôm nay' },
        { id: 2, text: 'Bạn có thể xem...', time: '10:21 AM', sent: true, date: 'Hôm nay' },
        { id: 3, text: 'Mình đã xem...', time: '10:30 AM', sent: false, date: 'Hôm nay' },
      ],
      2: [
        { id: 1, text: 'Bạn có thể giúp...', time: '9:00 AM', sent: false, date: 'Hôm qua' },
        { id: 2, text: 'Tất nhiên rồi...', time: '9:15 AM', sent: true, date: 'Hôm qua' },
      ],
    };

    const sampleFriends: User[] = [
      { id: 1, name: 'Mai Anh', avatar: 'https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/09/18/458/avatar-dep-4.jpg', online: true },
      { id: 2, name: 'Tuấn Anh', avatar: 'https://i.pinimg.com/originals/8f/33/30/8f3330d6163782b88b506d396f5d156f.jpg', online: false },
    ];

    setConversations(sampleConversations);
    setMessages(sampleMessages);
    setFriends(sampleFriends);

    // Kiểm tra để hiển thi giao diện mobile
    setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  // Handle sidebar open/close
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(!currentId);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile, currentId]);

  // Auto-scroll ởn tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentId]);

  // handle upload hình ảnh
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length || !currentId) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        
        const newMsg: Message = {
          id: Date.now(),
          text: `Đã gửi ảnh: ${file.name}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sent: true,
          date: 'Hôm nay',
          image: imageUrl,
        };

        setMessages(prev => ({
          ...prev,
          [currentId]: [...(prev[currentId] || []), newMsg]
        }));

        // Cập nhật tin nhắn cuối cùng trong cuộc trò chuyện
        setConversations(prev => prev.map(conv => 
          conv.id === currentId 
            ? { 
                ...conv, 
                lastMessage: {
                  text: `Đã gửi ảnh: ${file.name}`,
                  time: newMsg.time,
                  unread: 0
                }
              } 
            : conv
        ));
      };
      reader.readAsDataURL(file);
    });

    e.target.value = ''; // Reset input
  }, [currentId]);

  // Gửi tin nhắn
  const handleSend = useCallback(() => {
    if (!text.trim() || !currentId) return;
    
    const newMsg: Message = {
      id: Date.now(),
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sent: true,
      date: 'Hôm nay',
    };

    setMessages(prev => ({
      ...prev,
      [currentId]: [...(prev[currentId] || []), newMsg]
    }));

    // Cập nhật tin nhắn cuối cùng trong cuộc trò chuyện
    setConversations(prev => prev.map(conv => 
      conv.id === currentId 
        ? { 
            ...conv, 
            lastMessage: {
              text: text,
              time: newMsg.time,
              unread: 0
            }
          } 
        : conv
    ));

    setText('');
    textareaRef.current?.focus();
  }, [text, currentId]);

  // nhấn phím Enter để gửi tin nhắn
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Băt đầu cuộc trò chuyện mới
  const startNewConversation = useCallback((friendId: number) => {
    const existingConv = conversations.find(conv => conv.user.id === friendId);
    
    if (existingConv) {
      setCurrentId(existingConv.id);
    } else {
      const friend = friends.find(f => f.id === friendId);
      if (!friend) return;

      const newConv: Conversation = {
        id: Math.max(...conversations.map(c => c.id), 0) + 1,
        user: friend,
        lastMessage: {
          text: "",
          time: "",
          unread: 0
        }
      };

      setConversations(prev => [newConv, ...prev]);
      setCurrentId(newConv.id);
      setMessages(prev => ({ ...prev, [newConv.id]: [] }));
    }

    setShowNewModal(false);
  }, [conversations, friends]);

  const currentMessages = currentId ? messages[currentId] || [] : [];
  const currentConversation = currentId ? conversations.find(c => c.id === currentId) : null;

  return (
    <div className="flex w-full min-h-screen bg-[#f8f9fd] font-sans text-[#2d3436]">
      {/* Sidebar */}
      <div 
        className={clsx(
          'w-[320px] bg-white border-r border-[rgba(0,0,0,0.05)] flex flex-col transition-transform duration-300',
          isMobile && (sidebarOpen ? 'translate-x-0' : '-translate-x-full'),
          isMobile && 'fixed z-20 h-full'
        )}
      >
        <div className="flex justify-between items-center p-4 border-b border-[rgba(0,0,0,0.05)]">
          <h2 className="text-xl font-bold text-[#6c5ce7]">Tin nhắn</h2>
          <button
            onClick={() => setShowNewModal(true)}
            className="w-9 h-9 bg-[#6c5ce7] text-white rounded-full flex items-center justify-center hover:scale-105 hover:shadow-[0_3px_10px_rgba(108,92,231,0.3)] transition-all duration-300"
          >
            <MaterialIcon icon="edit" />
          </button>
        </div>
        
        <div className="p-3 sticky top-0 bg-white z-10">
          <input
            type="text"
            placeholder="Tìm kiếm tin nhắn..."
            className="w-full rounded-full px-4 py-2 text-sm bg-[#f8f9fd] focus:outline-none focus:ring-2 focus:ring-[rgba(108,92,231,0.12)] focus:bg-white transition-all duration-300"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => setCurrentId(conv.id)}
              className={clsx(
                'flex items-center p-3 cursor-pointer transition-colors duration-300',
                currentId === conv.id 
                  ? 'bg-[rgba(108,92,231,0.12)] border-l-2 border-[#6c5ce7]' 
                  : 'hover:bg-[rgba(108,92,231,0.12)]'
              )}
            >
              <div className="relative">
                <img
                  src={conv.user.avatar}
                  alt={conv.user.name}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                {conv.user.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00b894] border-2 border-white"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{conv.user.name}</div>
                <div className="text-xs text-[#636e72] truncate">{conv.lastMessage.text}</div>
              </div>
              <div className="ml-auto text-right text-xs text-[#636e72]">
                <div>{conv.lastMessage.time}</div>
                {conv.lastMessage.unread > 0 && (
                  <div className="w-5 h-5 text-white bg-[#fd79a8] rounded-full flex items-center justify-center text-[10px] font-bold mt-1">
                    {conv.lastMessage.unread}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={clsx(
        'flex-1 flex flex-col bg-white',
        isMobile ? (sidebarOpen ? 'hidden' : 'block') : 'block',
        isMobile && 'fixed w-full h-full'
      )}>
        {currentConversation ? (
          <>
            <div className="flex items-center justify-between p-3 border-b border-[rgba(0,0,0,0.05)]">
              <div className="flex items-center">
                {isMobile && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="mr-3 text-xl text-[#2d3436] hover:text-[#6c5ce7] transition-all duration-300"
                  >
                    <MaterialIcon icon="arrow_back" />
                  </button>
                )}
                <img
                  src={currentConversation.user.avatar}
                  alt={currentConversation.user.name}
                  className="w-9 h-9 rounded-full object-cover mr-3"
                />
                <div>
                  <div className="font-medium text-sm">{currentConversation.user.name}</div>
                  <div className="flex items-center text-xs text-[#636e72]">
                    <span className={`w-2 h-2 rounded-full mr-1 ${currentConversation.user.online ? 'bg-[#00b894]' : 'bg-[#636e72]'}`}></span>
                    {currentConversation.user.online ? 'Đang hoạt động' : 'Offline'}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {['call', 'videocam', 'info'].map((icon) => (
                  <button 
                    key={icon}
                    className="w-8 h-8 bg-[#f8f9fd] rounded-full flex items-center justify-center hover:bg-[#6c5ce7] hover:text-white transition-all duration-300"
                  >
                    <MaterialIcon icon={icon} />
                  </button>
                ))}
              </div>
            </div>

            <div 
              ref={messagesEndRef}
              className="flex-1 p-4 overflow-y-auto bg-no-repeat bg-center bg-[length:50%]"
            >
              {currentMessages.map((msg, i) => {
                const showDate = i === 0 || currentMessages[i - 1].date !== msg.date;
                
                return (
                  <div key={msg.id} className="space-y-2 my-2">
                    {showDate && (
                      <div className="relative my-3 text-center">
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-[rgba(0,0,0,0.05)]"></div>
                        <span className="relative inline-block px-3 py-1 text-xs text-[#636e72] bg-white rounded-full">
                          {msg.date}
                        </span>
                      </div>
                    )}
                    <div
                      className={clsx(
                        'max-w-[65%] p-3 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition-all duration-300',
                        msg.sent 
                          ? 'ml-auto bg-[#6c5ce7] text-white rounded-br-none' 
                          : 'mr-auto bg-[#f8f9fd] text-[#2d3436] rounded-bl-none'
                      )}
                    >
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="Sent content"
                          className="max-w-full h-auto rounded-lg mb-2"
                        />
                      )}
                      <div>{msg.text}</div>
                      <div className={clsx(
                        'text-[11px] mt-1 text-right',
                        msg.sent ? 'text-white/80' : 'text-[#636e72]'
                      )}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 p-3 border-t border-[rgba(0,0,0,0.05)]">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-9 h-9 rounded-full bg-[#f8f9fd] flex items-center justify-center hover:bg-[rgba(108,92,231,0.12)] transition-all duration-300"
              >
                <MaterialIcon icon="attach_file" />
              </button>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhắn tin..."
                className="flex-1 resize-none max-h-[100px] text-sm bg-[#f8f9fd] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[rgba(108,92,231,0.12)] focus:bg-white transition-all duration-300"
                rows={1}
              />
              <button
                onClick={handleSend}
                className="w-10 h-10 rounded-full bg-[#6c5ce7] text-white flex items-center justify-center hover:scale-110 hover:shadow-[0_3px_10px_rgba(108,92,231,0.3)] transition-all duration-300 disabled:opacity-50"
                disabled={!text.trim()}
              >
                <MaterialIcon icon="send" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#636e72]">
            Chọn một cuộc trò chuyện để bắt đầu
          </div>
        )}
      </div>

      {/* Tạo tin nhắn mới */}
      {showNewModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNewModal(false)}
          />
          
          <div 
            className="relative bg-white rounded-xl w-full max-w-md mx-4 shadow-xl animate-fade-in"
            style={{ marginTop: '-10%' }}
          >
            <div className="flex justify-between items-center p-4 border-b border-[rgba(0,0,0,0.05)]">
              <h3 className="text-lg font-bold text-[#6c5ce7]">Tin nhắn mới</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-2xl text-[#636e72] hover:text-[#6c5ce7] transition-colors duration-300"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <input
                type="text"
                placeholder="Tìm kiếm bạn bè..."
                className="w-full rounded-full px-4 py-2 text-sm bg-[#f8f9fd] mb-4 focus:outline-none focus:ring-2 focus:ring-[rgba(108,92,231,0.12)] transition-all duration-300"
              />
              
              <div className="space-y-2">
                {friends.map(friend => (
                  <div
                    key={friend.id}
                    onClick={() => {
                      startNewConversation(friend.id);
                      setShowNewModal(false);
                    }}
                    className="flex items-center p-3 rounded-lg hover:bg-[rgba(108,92,231,0.08)] cursor-pointer transition-colors duration-300"
                  >
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-10 h-10 rounded-full object-cover mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{friend.name}</div>
                      <div className="text-xs text-[#636e72]">
                        {friend.online ? 'Đang hoạt động' : 'Offline'}
                      </div>
                    </div>
                    {friend.online && (
                      <div className="w-2 h-2 rounded-full bg-[#00b894] ml-2"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ẩn file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        multiple
        className="hidden"
      />
    </div>
  );
};

// Animation styles
const styles = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
// Thêm styles vào document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = styles;
  document.head.appendChild(style);
}

export default MessagePage;