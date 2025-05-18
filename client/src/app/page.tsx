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

// Component Home hiển thị trang chính của ứng dụng
export default function Home() {
  // State để kiểm soát hiển thị modal đăng nhập/đăng ký
  const [showAuth, setShowAuth] = useState(false);
  // State để xác định tab mặc định của modal (login hoặc signup)
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');

  // Hàm mở modal với tab tương ứng
  const handleOpenAuth = (tab: 'login' | 'signup') => {
    setAuthTab(tab);
    setShowAuth(true);
  };

  return (
    // Container chính với gradient background
    <div className="min-h-screen w-full bg-gradient-to-br from-[#E1ECF7] to-[#AECBEB]">
      {/* Header với khả năng mở modal đăng nhập/đăng ký */}
      <Header onOpenAuth={handleOpenAuth} />
      {/* Modal xác thực (đăng nhập/đăng ký) */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultTab={authTab} />}
      {/* Layout chính với sidebar và nội dung */}
      <div className="flex w-full mt-4 items-center">
        {/* Sidebar trái hiển thị các icon điều hướng */}
        <LeftSidebar />
        {/* Nội dung chính */}
        <div className="flex-1">
          {/* Tabs để chuyển đổi giữa các loại bài đăng */}
          <Tabs />
          {/* Phần nhập liệu để tạo bài đăng mới */}
          <InputSection />
          {/* Component hiển thị một bài đăng mẫu */}
          <Post
            name="NAME"
            date="09:37 PM +07, May 15, 2025"
            content="Content Content Content Content Content Content Content Content Content Content Content Content Content Content Content Content Content Content"
            likes={123}
            comments={123}
            shares={123}
          />
        </div>
        {/* Sidebar phải hiển thị danh sách bạn bè */}
        <RightSidebar />
      </div>
    </div>
  );
}