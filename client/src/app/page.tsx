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
import CreatePostModal from "@/components/CreatePostModal";
import axios from "axios";
import type { PostType } from '@/types/Post';
import SkeletonPost from "@/components/SkeletonPost";

interface OpenPostType {
  id: string;
  name: string;
  date: string;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  images?: string[];
  avatar_url?: string;
  feeling?: { icon: string; label: string };
  location?: string;
  shared_post?: any;
}

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
  const [openPost, setOpenPost] = useState<OpenPostType | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [posts, setPosts] = useState<PostType[]>([]); // State lưu danh sách bài viết
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
      ? "bg-slate-50"
      : "bg-[#F8F9FA]";

  // Callback khi đăng bài thành công
  const handlePostCreated = (newPost: PostType) => {
    // Bổ sung tên và avatar nếu thiếu (thường xảy ra với post mới tạo)
    const completedPost = {
      ...newPost,
      first_name: newPost.first_name || user?.first_name || '',
      last_name: newPost.last_name || user?.last_name || '',
      avatar_url: newPost.avatar_url || user?.avatar_url || '',
    };
    setPosts(prev => [completedPost, ...prev]);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get<PostType[]>('/api/posts', {
          baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
        });
        setPosts(res.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
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
    <div className={`min-h-screen w-full ${bgClass}`}>
      {/* Header: Thanh điều hướng trên cùng, cho phép mở modal xác thực */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Header onOpenAuth={handleOpenAuth} theme={theme} />
      </div>

      {/* Modal xác thực */}
      {showAuth && !user && (
        <AuthModal 
          onClose={() => setShowAuth(false)} 
          defaultTab={authTab} 
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Main Content */}
      <div className="pt-20">
        <div className="flex w-full">
          {/* Sidebar trái */}
          <div className="fixed top-[5.5rem] left-0 z-20">
            <LeftSidebar theme={theme} />
          </div>

          {/* Nội dung trung tâm */}
          <div className="flex-1 flex flex-col items-center mx-auto px-4" style={{ maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto' }}>
            {/* Tabs */}
            <div className="w-full max-w-3xl mt-8">
              <Tabs onTabChange={setActiveTab} />
            </div>

            {/* Create Post Section */}
            <div className="w-full max-w-3xl mt-6">
              <InputSection onOpenModal={() => setShowCreatePost(true)} theme={theme} />
            </div>

            {/* Posts List */}
            <div className="w-full max-w-3xl pt-6 pb-20">
              {filteredPosts.slice(0, visibleCount).map(post => (
                <Post
                  key={post.id}
                  theme={theme}
                  id={post.id}
                  userId={post.user_id}
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
                  shared_post_id={post.shared_post_id}
                  onOpenDetail={postObj => setOpenPost({
                    id: postObj.id,
                    name: postObj.name || `${postObj.first_name || ''} ${postObj.last_name || ''}`.trim(),
                    date: postObj.date || postObj.created_at || '',
                    content: postObj.content,
                    likes: postObj.likes,
                    comments: postObj.comments,
                    shares: postObj.shares,
                    images: postObj.images,
                    avatar_url: postObj.avatar_url || postObj.avatar,
                    feeling: postObj.feeling,
                    location: postObj.location,
                    shared_post: postObj.shared_post, 
                  })}
                  onPostCreated={handlePostCreated}
                />
              ))}
            </div>
          </div>

          {/* Sidebar phải */}
          <div className="fixed top-[5.5rem] right-0 z-20">
            <RightSidebar theme={theme} />
          </div>
        </div>
      </div>

      {/* Popups & Modals */}
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