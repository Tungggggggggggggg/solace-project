"use client";

// Import các component và hook cần thiết
import { useState } from "react";
import Header from "../components/Header";
import Tabs from "../components/Tabs";
import InputSection from "../components/InputSection";
import Post from "../components/Post";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import AuthModal from "../components/AuthModal";
import PostDetailPopup from "../components/PostDetailPopup";

// Component Home hiển thị trang chính của ứng dụng
export default function Home() {
  // State để kiểm soát hiển thị modal đăng nhập/đăng ký
  const [showAuth, setShowAuth] = useState(false);
  // State để xác định tab mặc định của modal (login hoặc signup)
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  // State để xác định tab hiện tại (0: Inspiring, 1: Reflective)
  const [activeTab, setActiveTab] = useState(0);
  // State để mở popup chi tiết bài viết
  const [openPost, setOpenPost] = useState<null | {
    id: string;
    name: string;
    date: string;
    content: string;
    likes: number;
    comments: number;
    shares: number;
  }>(null);

  // Hàm mở modal với tab tương ứng
  const handleOpenAuth = (tab: 'login' | 'signup') => {
    setAuthTab(tab);
    setShowAuth(true);
  };

  // Xác định theme dựa trên tab
  const theme = activeTab === 1 ? 'reflective' : 'inspiring';

  // Xác định class màu nền dựa trên tab
  const bgClass =
    activeTab === 0
      ? "bg-gradient-to-br from-[#E1ECF7] to-[#AECBEB]"
      : "bg-[#E9ECF1]";

  return (
    // Container chính với gradient background
    <div className={`min-h-screen w-full ${bgClass}`}>
      {/* Header với khả năng mở modal đăng nhập/đăng ký */}
      <Header onOpenAuth={handleOpenAuth} theme={theme} />
      {/* Modal xác thực (đăng nhập/đăng ký) */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultTab={authTab} />}
      {/* Layout chính với sidebar và nội dung */}
      <div className="flex w-full mt-4 items-center">
        {/* Sidebar trái hiển thị các icon điều hướng */}
        <LeftSidebar theme={theme} />
        {/* Nội dung chính */}
        <div className="flex-1">
          {/* Tabs để chuyển đổi giữa các loại bài đăng */}
          <Tabs onTabChange={setActiveTab} />
          {/* Phần nhập liệu để tạo bài đăng mới */}
          <InputSection />
          {/* Component hiển thị một bài đăng mẫu */}
          <Post
            id="1"
            name="NAME"
            date="09:37 PM +07, May 15, 2025"
            content="Content Content Content Content Content Content Content Content Content Content Content Content Content Content Content Content Content Content"
            likes={123}
            comments={123}
            shares={123}
            onOpenDetail={() => setOpenPost({
              id: "1",
              name: "NAME",
              date: "09:37 PM +07, May 15, 2025",
              content: "Content Content Content Content Content Content Content Content Content Content Content Content Content Content Content Content Content Content",
              likes: 123,
              comments: 123,
              shares: 123
            })}
          />
        </div>
        {/* Sidebar phải hiển thị danh sách bạn bè */}
        <RightSidebar theme={theme} />
      </div>
      {/* Popup chi tiết bài viết */}
      {openPost && (
        <PostDetailPopup post={openPost} onClose={() => setOpenPost(null)} />
      )}
    </div>
  );
}