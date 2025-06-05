"use client";

// Import các component và hook cần thiết cho trang chủ
import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Tabs from "@/components/Tabs";
import InputSection from "@/components/InputSection";
import Post from "@/components/Post";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import AuthModal from "@/components/AuthModal";
import PostDetailPopup from "@/components/PostDetailPopup";
import { useUser } from "@/contexts/UserContext";
import CreatePost from "@/components/CreatePost";
import CreatePostModal from "@/components/CreatePostModal";
import axios from "axios";

// Component Home: Trang chính của ứng dụng mạng xã hội Solace
export default function Home() {
  const { user } = useUser();
  // State kiểm soát hiển thị modal xác thực (đăng nhập/đăng ký)
  const [showAuth, setShowAuth] = useState(false);
  // State xác định tab mặc định của modal xác thực ('login' hoặc 'signup')
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  // State xác định tab hiện tại của giao diện chính (0: Inspiring, 1: Reflective)
  const [activeTab, setActiveTab] = useState(0);
  // State lưu thông tin bài viết đang được xem chi tiết (nếu có)
  const [openPost, setOpenPost] = useState<null | {
    id: string;
    name: string;
    date: string;
    content: string;
    likes: number;
    comments: number;
    shares: number;
    images: string[];
    feeling: string;
    location: string;
  }>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [posts, setPosts] = useState<any[]>([]); // State lưu danh sách bài viết
  const [visibleCount, setVisibleCount] = useState(3); // Số post hiển thị ban đầu

  // Mở modal xác thực với tab tương ứng (login/signup), chỉ khi chưa đăng nhập
  const handleOpenAuth = (tab: 'login' | 'signup') => {
    if (!user) {
      setAuthTab(tab);
      setShowAuth(true);
    }
  };

  // Đóng modal xác thực sau khi đăng nhập/đăng ký thành công
  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  // Xác định theme màu sắc dựa trên tab hiện tại
  const theme = activeTab === 1 ? 'reflective' : 'inspiring';

  // Xác định class màu nền dựa trên tab hiện tại
  const bgClass =
    activeTab === 0
      ? "bg-gradient-to-br from-[#E1ECF7] to-[#AECBEB]"
      : "bg-[#E9ECF1]";

  // Callback khi đăng bài thành công
  const handlePostCreated = (newPost: any) => {
    setPosts(prev => [newPost, ...prev]);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('/api/posts', {
          baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
        });
        setPosts(res.data);
      } catch (err) {
        // Có thể xử lý lỗi ở đây nếu muốn
      }
    };
    fetchPosts();
  }, []);

  // Lọc bài viết theo tab
  const filteredPosts = posts.filter(post =>
    activeTab === 0 ? post.type_post === 'positive' : post.type_post === 'negative'
  );

  // Lazy load: tăng số lượng post hiển thị khi kéo gần cuối trang
  const handleScroll = useCallback(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
      setVisibleCount((prev) => Math.min(prev + 4, filteredPosts.length));
    }
  }, [filteredPosts.length]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setVisibleCount(4); // Reset khi đổi tab hoặc posts
  }, [activeTab, posts]);

  return (
    // Container chính với hiệu ứng nền phù hợp theme
    <div className={`min-h-screen w-full ${bgClass}`}>
      {/* Header: Thanh điều hướng trên cùng, cho phép mở modal xác thực */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 50 }}>
        <Header onOpenAuth={handleOpenAuth} theme={theme} />
      </div>
      {/* Modal xác thực (đăng nhập/đăng ký), chỉ hiển thị khi chưa đăng nhập */}
      {showAuth && !user && (
        <AuthModal 
          onClose={() => setShowAuth(false)} 
          defaultTab={authTab} 
          onSuccess={handleAuthSuccess} // Đóng modal khi xác thực thành công
        />
      )}
      <div style={{ marginTop: 80 }}>
        {/* Layout chính gồm sidebar trái, nội dung trung tâm và sidebar phải */}
        <div className="flex w-full mt-4">
          {/* Sidebar trái */}
          <div style={{ position: 'fixed', top: 200, left: 0, zIndex: 20 }}>
            <LeftSidebar theme={theme} />
          </div>
          {/* Nội dung trung tâm, thêm margin-left để không bị che */}
          <div className="flex-1 flex flex-col items-center" style={{ marginLeft: 120, marginRight: 120 }}>
            {/* Tabs: Chuyển đổi giữa các loại bài đăng (Inspiring/Reflective) */}
            <div style={{ marginTop: 32 }} />
            <Tabs onTabChange={setActiveTab} />
            {/* Thay InputSection bằng CreatePost */}
            <div style={{ width: 'calc(100% - 60px)', maxWidth: '836px', margin: '16px auto 0 auto' }}>
              <InputSection onOpenModal={() => setShowCreatePost(true)} theme={theme} />
            </div>
            {/* Hiển thị danh sách bài viết mới nhất */}
            {filteredPosts.slice(0, visibleCount).map(post => (
              <Post
                key={post.id}
                theme={theme}
                id={post.id}
                name={post.first_name && post.last_name ? `${post.first_name} ${post.last_name}` : ''}
                date={post.created_at || ""}
                content={post.content}
                likes={post.likes || 0}
                comments={post.comments || 0}
                shares={post.shares || 0}
                images={post.images}
                avatar={post.avatar_url || undefined}
                feeling={post.feeling}
                location={post.location}
                onOpenDetail={() => setOpenPost({
                  id: post.id,
                  name: post.first_name && post.last_name ? `${post.first_name} ${post.last_name}` : '',
                  date: post.created_at || "",
                  content: post.content,
                  likes: post.likes || 0,
                  comments: post.comments || 0,
                  shares: post.shares || 0,
                  images: post.images,
                  feeling: post.feeling,
                  location: post.location,
                })}
              />
            ))}
          </div>
          {/* Sidebar phải */}
          <div style={{ position: 'fixed', top: 200, right: 0, zIndex: 20 }}>
            <RightSidebar theme={theme} />
          </div>
        </div>
      </div>
      {/* Popup chi tiết bài viết, hiển thị khi người dùng chọn xem chi tiết */}
      {openPost && (
        <PostDetailPopup post={openPost} onClose={() => setOpenPost(null)} />
      )}
      {showCreatePost && (
        <CreatePostModal 
          onClose={() => setShowCreatePost(false)} 
          onPostCreated={handlePostCreated} 
          theme={theme}
          defaultTypePost={activeTab === 0 ? 'positive' : 'negative'}
        />
      )}
    </div>
  );
}