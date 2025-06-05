import React, { useState, useRef, useLayoutEffect } from "react";
import CommentsSection from './CommentsSection';
import { useUser } from '../contexts/UserContext';
import gsap from 'gsap';

interface PostDetailPopupProps {
  post: {
    id: string;
    name: string;
    date: string;
    content: string;
    likes: number;
    comments: number;
    shares: number;
    images?: string[];
  };
  onClose: () => void;
  theme?: 'inspiring' | 'reflective';
}

const PostDetailPopup = ({ post, onClose, theme = 'inspiring' }: PostDetailPopupProps) => {
  const [selectedImg, setSelectedImg] = useState(0);
  const { user } = useUser();
  const popupRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);

  const bgColor = theme === 'reflective' ? '#E3D5CA' : '#E1ECF7';

  useLayoutEffect(() => {
    if (popupRef.current) {
      gsap.fromTo(
        popupRef.current,
        { scale: 0.85, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }
    if (imgRef.current) {
      gsap.fromTo(imgRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.2 });
    }
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.35 });
    }
    if (commentsRef.current) {
      gsap.fromTo(commentsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.5 });
    }
    return () => {
      if (popupRef.current) {
        gsap.to(popupRef.current, {
          scale: 0.85,
          opacity: 0,
          y: 40,
          duration: 0.3,
          ease: 'power3.in',
        });
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Nền mờ giữ nguyên Home */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm popup-overlay" onClick={onClose} />
      <div ref={popupRef} className="relative rounded-2xl p-6 max-w-2xl w-full shadow-xl z-10 popup-content" style={{ background: bgColor }}>
        {/* Nút đóng */}
        <button
          className="absolute top-3 right-3 text-2xl text-black hover:scale-110 transition"
          onClick={onClose}
          aria-label="Đóng"
        >
          ×
        </button>
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-4">
            <span className="material-symbols-outlined text-gray-500 text-3xl">person</span>
          </div>
          <div>
            <h3 className="text-black font-bold text-lg font-[Inter]">{post.name}</h3>
            <p className="text-gray-500 text-sm font-[Inter]">{post.date}</p>
          </div>
        </div>
        {/* Nội dung & ảnh */}
        {(post.images && post.images.length > 0 ? post.images : []).length > 0 && (
          <div className="flex flex-col items-center mb-4">
            <img
              ref={imgRef}
              src={(post.images && post.images[selectedImg]) || ''}
              alt="post-large"
              className="max-h-[400px] max-w-full rounded-2xl mb-2 object-contain cursor-pointer"
              onClick={() => post.images && window.open(post.images[selectedImg], '_blank')}
            />
            {post.images && post.images.length > 1 && (
              <div className="flex gap-2 mt-2">
                {post.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`thumb-${idx}`}
                    className={`w-16 h-16 object-cover rounded-lg border-2 cursor-pointer ${selectedImg === idx ? 'border-blue-500' : 'border-transparent'}`}
                    onClick={() => setSelectedImg(idx)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        <div className="mb-4" ref={contentRef}>
          <p className="text-black text-base font-medium font-[Inter]">{post.content}</p>
        </div>
        {/* Khu vực bình luận */}
        <div className="border-t pt-4" ref={commentsRef}>
          <CommentsSection postId={post.id} currentUser={user} />
        </div>
      </div>
      <style jsx global>{`
        .popup-overlay {
          animation: fadein-overlay 0.3s cubic-bezier(.4,2,.6,1);
        }
        @keyframes fadein-overlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .popup-content {
          animation: popup-zoom-in 0.35s cubic-bezier(.4,2,.6,1);
          transform-origin: center;
        }
        @keyframes popup-zoom-in {
          0% { opacity: 0; transform: scale(0.85) translateY(40px);}
          100% { opacity: 1; transform: scale(1) translateY(0);}
        }
      `}</style>
    </div>
  );
};

export default PostDetailPopup; 