"use client";

// Import các component và hook cần thiết cho trang chủ
import { useState } from "react";
import Header from "@/components/Header";
import Tabs from "@/components/Tabs";
import InputSection from "@/components/InputSection";
import Post from "@/components/Post";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import AuthModal from "@/components/AuthModal";
import PostDetailPopup from "@/components/PostDetailPopup";
import { useUser } from "@/contexts/UserContext";

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
  }>(null);

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

  return (
    // Container chính với hiệu ứng nền phù hợp theme
    <div className={`min-h-screen w-full ${bgClass}`}>
      {/* Header: Thanh điều hướng trên cùng, cho phép mở modal xác thực */}
      <Header onOpenAuth={handleOpenAuth} theme={theme} />
      {/* Modal xác thực (đăng nhập/đăng ký), chỉ hiển thị khi chưa đăng nhập */}
      {showAuth && !user && (
        <AuthModal 
          onClose={() => setShowAuth(false)} 
          defaultTab={authTab} 
          onSuccess={handleAuthSuccess} // Đóng modal khi xác thực thành công
        />
      )}
      {/* Layout chính gồm sidebar trái, nội dung trung tâm và sidebar phải */}
      <div className="flex w-full mt-4 items-center">
        {/* Sidebar trái: Điều hướng các chức năng chính */}
        <LeftSidebar theme={theme} />
        {/* Nội dung trung tâm */}
        <div className="flex-1">
          {/* Tabs: Chuyển đổi giữa các loại bài đăng (Inspiring/Reflective) */}
          <Tabs onTabChange={setActiveTab} />
          {/* Khu vực nhập liệu để tạo bài đăng mới */}
          <InputSection />
          {/* Hiển thị một bài đăng mẫu, có thể mở popup chi tiết */}
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
        {/* Sidebar phải: Hiển thị danh sách bạn bè hoặc thông tin phụ */}
        <RightSidebar theme={theme} />
      </div>
      {/* Popup chi tiết bài viết, hiển thị khi người dùng chọn xem chi tiết */}
      {openPost && (
        <PostDetailPopup post={openPost} onClose={() => setOpenPost(null)} />
      )}
    </div>
  );
}