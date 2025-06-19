import React, { useState, useRef, useLayoutEffect } from "react";
import CommentsSection from './CommentsSection';
import { useUser } from '../contexts/UserContext';
import gsap from 'gsap';
import Image from 'next/image';
import { formatDate } from '../lib/dateUtils';
import SkeletonPost from './SkeletonPost';

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
    avatar_url?: string;
    shared_name?: string;
    shared_avatar_url?: string;
    shared_date?: string;
    shared_post?: {
      id: string;
      name: string;
      date: string;
      content: string;
      likes: number;
      comments: number;
      shares: number;
      images?: string[];
      avatar_url?: string;
    };
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
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-4 overflow-hidden">
            {post.shared_post ? (
              post.avatar_url ? (
                <Image src={post.avatar_url} alt={post.name || 'avatar'} width={48} height={48} className="object-cover w-12 h-12" />
              ) : (
                <span className="material-symbols-outlined text-[40px] text-slate-300 flex items-center justify-center w-12 h-12">person</span>
              )
            ) : (
              post.avatar_url ? (
                <Image src={post.avatar_url} alt={post.name || 'avatar'} width={48} height={48} className="object-cover w-12 h-12" />
              ) : (
                <span className="material-symbols-outlined text-[40px] text-slate-300 flex items-center justify-center w-12 h-12">person</span>
              )
            )}
          </div>
          <div>
            <h3 className="text-black font-bold text-lg font-[Inter]">{post.name}</h3>
            <p className="text-gray-500 text-sm font-[Inter]">{formatDate(post.date)}</p>
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
        {/* Nếu là post share, hiển thị div bài gốc bên trong detail */}
        {typeof post.shared_post !== 'undefined' && post.shared_post === null ? (
          <SkeletonPost />
        ) : post.shared_post && (
          <div className="shared-root-post bg-gray-50 border rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              {post.shared_post.avatar_url ? (
                <Image src={post.shared_post.avatar_url} alt={post.shared_post.name || 'avatar'} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[28px] text-slate-300 flex items-center justify-center w-8 h-8">person</span>
              )}
              <span className="font-semibold">{post.shared_post.name}</span>
              <span className="text-gray-500 text-xs">{formatDate(post.shared_post.date)}</span>
            </div>
            <div className="mb-2 text-slate-900 whitespace-pre-wrap">{post.shared_post.content}</div>
            {post.shared_post.images && post.shared_post.images.length > 0 && (
              <div className={`grid ${post.shared_post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-2`}>
                {post.shared_post.images.map((img, idx) => (
                  <div key={idx} className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center">
                    <Image src={img} alt={`post-img-${idx}`} width={500} height={300} className="object-cover w-full h-full rounded-xl" />
                  </div>
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