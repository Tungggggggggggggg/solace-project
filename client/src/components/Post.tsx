import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import ReportPostModal from './ReportPostModal';
import axios from 'axios';
import LikeListModal from './LikeListModal';
import gsap from 'gsap';

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
  const reporterId = user?.id || '';
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [showLikeList, setShowLikeList] = useState(false);
  const likeBtnRef = useRef<HTMLButtonElement>(null);
  const [likeList, setLikeList] = useState<string[]>([]); // Khai báo state cho danh sách người đã like
  const [commentCount, setCommentCount] = useState(comments);

  useEffect(() => {
    // Kiểm tra user đã like chưa
    if (user?.id) {
      axios.get('/api/likes/is-liked', {
        params: { post_id: id, user_id: user.id },
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
      }).then(res => {
        console.log('API Response:', res.data); // Debug API response
        setLiked(res.data.liked);
        if (res.data.likeCount !== undefined) {
          setLikeCount(res.data.likeCount); // Ensure like count is updated
        } else {
          console.warn('likeCount is undefined in API response');
        }
        setLikeList(res.data.likeList); // Update like list
      });
    }

    // Fetch updated comment count if needed
    axios.get(`/api/posts/${id}`).then(res => {
      setCommentCount(res.data.comment_count);
    });
  }, [id, user]);

  const handleLike = async () => {
    if (!user?.id) return;
    if (!id || !user.id) {
      console.warn('Thiếu post_id hoặc user_id khi like post:', { post_id: id, user_id: user?.id });
      return;
    }
    if (liked) {
      const response = await axios.post('/api/likes/unlike', { post_id: id, user_id: user.id }, { baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000' });
      console.log('Unlike Response:', response.data); // Debug unlike response
      setLiked(false);
      setLikeCount(response.data.likeCount); // Cập nhật số lượng like từ backend
      setLikeList(response.data.likeList); // Cập nhật danh sách người đã like
      // Hiệu ứng unlike: scale nhỏ, rung nhẹ
      if (likeBtnRef.current) {
        gsap.fromTo(
          likeBtnRef.current,
          { scale: 0.8, rotate: -10, filter: 'drop-shadow(0 0 8px #ff174488)' },
          { scale: 1, rotate: 0, filter: 'drop-shadow(0 0 8px #ff174488)', duration: 0.35, ease: 'elastic.out(1, 0.5)' }
        );
      }
    } else {
      const response = await axios.post('/api/likes/like', { post_id: id, user_id: user.id }, { baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000' });
      console.log('Like Response:', response.data); // Debug like response
      setLiked(true);
      setLikeCount(response.data.likeCount); // Cập nhật số lượng like từ backend
      setLikeList(response.data.likeList); // Cập nhật danh sách người đã like
      // Hiệu ứng like: scale lớn, rung, glow đỏ mạnh
      if (likeBtnRef.current) {
        gsap.fromTo(
          likeBtnRef.current,
          { scale: 1.4, rotate: 0, filter: 'drop-shadow(0 0 24px #ff1744cc)' },
          { scale: 1, rotate: 0, filter: 'drop-shadow(0 0 18px #ff1744cc)', duration: 0.5, ease: 'elastic.out(1, 0.5)' }
        );
        // Rung trái tim
        gsap.fromTo(
          likeBtnRef.current,
          { rotate: -15 },
          { rotate: 15, yoyo: true, repeat: 3, duration: 0.08, ease: 'power1.inOut', clearProps: 'rotate' }
        );
      }
    }
  };

  // Hàm chuyển sang trang chi tiết
  const handleOpenDetail = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setClicked(true);
    setTimeout(() => {
      onOpenDetail?.();
      setClicked(false);
    }, 300);
  };

  // Đảm bảo images luôn là mảng
  let imagesArray: string[] = [];
  if (Array.isArray(images)) {
    imagesArray = images;
  } else if (typeof images === 'string') {
    try {
      imagesArray = JSON.parse(images);
    } catch {
      imagesArray = [];
    }
  }

  // Thống kê tương tác
  console.log('Rendering likeCount:', likeCount, 'comments:', comments);

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
        {imagesArray.length > 0 && (
          <div className="flex space-x-3 mb-4">
            {imagesArray.map((img, idx) => (
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
      {(likeCount > 0 || commentCount > 0) && (
        <div className="flex justify-between items-center border-t border-gray-300 py-2 mt-4">
          {likeCount > 0 && (
            <div className="flex items-center space-x-1 cursor-pointer" onClick={() => setShowLikeList(true)}>
              <span className="font-bold text-base">{likeCount} người đã thích</span>
            </div>
          )}
          {commentCount > 0 && (
            <div className="flex items-center space-x-1">
              <span className="font-bold text-base">{commentCount} bình luận</span>
            </div>
          )}
        </div>
      )}
      <div className="flex justify-between text-gray-600 mt-2">
        <div className="flex items-center space-x-2">
          <button
            ref={likeBtnRef}
            onClick={handleLike}
            className={`text-xl transition-all duration-200 hover:scale-110`}
            style={{
              filter: liked ? 'drop-shadow(0 0 18px #ff1744cc)' : 'none',
              transform: liked ? 'scale(1.18)' : 'scale(1)'
            }}
          >
            {liked ? (
              <img src="/heart_fill.svg" alt="liked" width="28" height="28" />
            ) : (
              <img src="/heart.svg" alt="unliked" width="28" height="28" />
            )}
          </button>
          <span className="font-bold text-base ml-1" onClick={() => setShowLikeList(true)}>{likeCount}</span>
        </div>
        <div className="flex items-center space-x-2 cursor-pointer" onClick={handleOpenDetail}>
          <span className="material-symbols-outlined text-xl">comment</span>
          <span className="font-bold text-base">{commentCount}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="material-symbols-outlined text-xl">share</span>
          <span className="font-bold text-base">{shares}</span>
        </div>
      </div>
      {showLikeList && <LikeListModal postId={id} onClose={() => setShowLikeList(false)} />}
    </div>
  );
};

export default Post;