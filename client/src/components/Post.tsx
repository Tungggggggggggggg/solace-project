import React from 'react';
import { useState } from "react";
import ReportPostModal from './ReportPostModal';
import { useUser } from '../contexts/UserContext';


// Định nghĩa interface cho props của Post
interface PostProps {
  id: string; /* ID của bài đăng */
  name: string; /* Tên người đăng */
  date: string; /* Thời gian đăng */
  content: string; /* Nội dung bài đăng */
  likes: number; /* Số lượt thích */
  comments: number; /* Số bình luận */
  shares: number; /* Số lượt chia sẻ */
  images?: string[]; /* Mảng URL của các hình ảnh */
  avatar?: string;
  feeling?: { icon: string; label: string } | null;
  location?: string | null;
  onOpenDetail?: () => void;
  theme?: string;
}

// Hàm tối ưu URL ảnh Cloudinary
function getOptimizedCloudinaryUrl(url: string, width = 1000) {
  if (!url.includes('cloudinary.com')) return url;
  return url.replace(
    '/upload/',
    `/upload/w_${width},q_auto,f_auto/`
  );
}

// Component Post hiển thị một bài đăng
const Post = ({ id, name, date, content, likes, comments, shares, images, avatar, feeling, location, onOpenDetail, theme }: PostProps) => {
  const [clicked, setClicked] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const bgColor = theme === 'reflective' ? '#E3D5CA' : '#E1ECF7';
  const { user } = useUser();
  const reporterId = user?.uid || '';

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
      style={{ background: bgColor }}
      className={`relative rounded-[40px] shadow max-w-xl mx-auto my-6 px-8 py-6 post-card animate-fadein ${clicked ? 'clicked' : ''}`}
    >
      {/* Nút 3 chấm báo cáo */}
      <button
        className="absolute top-4 right-6 text-gray-500 hover:bg-gray-200 rounded-full p-2 z-10"
        onClick={() => setShowReport(true)}
        title="Báo cáo bài viết"
      >
        <span className="material-symbols-outlined text-2xl">more_horiz</span>
      </button>
      {showReport && (
        <ReportPostModal
          postId={id}
          reporterId={reporterId}
          onClose={() => setShowReport(false)}
        />
      )}
      {/* Thông tin người đăng */}
      <div className="flex items-center mb-3">
        {/* Avatar người đăng */}
        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-4 overflow-hidden">
          {avatar ? (
            <img src={avatar} alt="avatar" className="w-12 h-12 object-cover rounded-full" />
          ) : (
            <span className="material-symbols-outlined text-gray-500 text-3xl">person</span>
          )}
        </div>
        <div>
          <h3 className="text-black font-bold text-lg font-[Inter]">{name}</h3>
          <p className="text-gray-500 text-sm font-[Inter]">{date}</p>
        </div>
      </div>
      {/* Dòng trạng thái cảm xúc/vị trí */}
      {(feeling && location) && (
        <div className="mb-2 flex flex-wrap items-center gap-2 text-base font-medium">
          <span className="font-semibold">{name}</span>
          <span>đang cảm thấy</span>
          <span className="text-xl">{feeling.icon}</span>
          <span className="font-semibold text-[#6c5ce7]">{feeling.label}</span>
          <span>tại</span>
          <span className="font-semibold text-[#6c5ce7]">{location}</span>
        </div>
      )}
      {(feeling && !location) && (
        <div className="mb-2 flex flex-wrap items-center gap-2 text-base font-medium">
          <span className="font-semibold">{name}</span>
          <span>đang cảm thấy</span>
          <span className="text-xl">{feeling.icon}</span>
          <span className="font-semibold text-[#6c5ce7]">{feeling.label}</span>
        </div>
      )}
      {(feeling && !location) && (
        <div className="mb-2 flex flex-wrap items-center gap-2 text-base font-medium">
          <span className="font-semibold">{name}</span>
          <span>đang cảm thấy</span>
          <span className="text-xl">{feeling.icon}</span>
          <span className="font-semibold text-[#6c5ce7]">{feeling.label}</span>
        </div>
      )}
      {/* Nội dung bài đăng (clickable) */}
      <div>
        <p className="text-black mb-4 font-[Inter] text-base font-medium cursor-pointer" onClick={handleOpenDetail}>{content}</p>
        {/* Hình ảnh minh họa (clickable) */}
        {images && images.length > 0 && (
          <div className="flex space-x-3 mb-4">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={getOptimizedCloudinaryUrl(img, 1000)}
                alt={`post-img-${idx}`}
                className="w-1/3 h-28 object-cover rounded-[20px] cursor-pointer"
                onClick={handleOpenDetail}
              />
            ))}
          </div>
        )}
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