import React from 'react';
import { useState } from "react";

// Định nghĩa interface cho props của Post
interface PostProps {
  id: string; /* ID của bài đăng */
  name: string; /* Tên người đăng */
  date: string; /* Thời gian đăng */
  content: string; /* Nội dung bài đăng */
  likes: number; /* Số lượt thích */
  comments: number; /* Số bình luận */
  shares: number; /* Số lượt chia sẻ */
  onOpenDetail?: () => void;
}

// Component Post hiển thị một bài đăng
const Post = ({ id, name, date, content, likes, comments, shares, onOpenDetail }: PostProps) => {
  const [clicked, setClicked] = useState(false);

  // Hàm chuyển sang trang chi tiết
  const handleOpenDetail = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setClicked(true);
    setTimeout(() => {
      onOpenDetail?.();
      setClicked(false);
    }, 300);
  };
  return (
    // Container cho bài đăng
    <div 
      id={`post-${id}`}
      className={`bg-[#E1ECF7] rounded-[40px] shadow max-w-xl mx-auto my-6 px-8 py-6 post-card animate-fadein ${clicked ? 'clicked' : ''}`}
    >
      {/* Thông tin người đăng */}
      <div className="flex items-center mb-3">
        {/* Avatar placeholder */}
        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-4">
          <span className="material-symbols-outlined text-gray-500 text-3xl">person</span>
        </div>
        <div>
          <h3 className="text-black font-bold text-lg font-[Inter]">{name}</h3>
          <p className="text-gray-500 text-sm font-[Inter]">{date}</p>
        </div>
      </div>
      {/* Nội dung bài đăng (clickable) */}
      <div onClick={handleOpenDetail} className="cursor-pointer">
        <p className="text-black mb-4 font-[Inter] text-base font-medium">{content}</p>
        {/* Hình ảnh minh họa (clickable) */}
        <div className="flex space-x-3 mb-4">
          {[1,2,3].map((_, idx) => (
            <div key={idx} className="w-1/3 h-28 bg-gray-200 rounded-[20px] flex items-center justify-center overflow-hidden cursor-pointer" onClick={handleOpenDetail}>
              <span className="material-symbols-outlined text-blue-500 text-4xl">image</span>
            </div>
          ))}
        </div>
      </div>
      {/* Thống kê tương tác */}
      <div className="flex justify-between text-gray-600 mt-2">
        <div className="flex items-center space-x-2">
          <span className="material-symbols-outlined text-xl">mood</span>
          <span className="font-bold text-base">{likes}</span>
        </div>
        <div className="flex items-center space-x-2 cursor-pointer" onClick={handleOpenDetail}>
          <span className="material-symbols-outlined text-xl">comment</span>
          <span className="font-bold text-base">{comments}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="material-symbols-outlined text-xl">share</span>
          <span className="font-bold text-base">{shares}</span>
        </div>
      </div>
    </div>
  );
};

export default Post;