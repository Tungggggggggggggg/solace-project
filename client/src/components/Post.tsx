import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import ReportPostModal from './ReportPostModal';
import axios from 'axios';
import LikeListModal from './LikeListModal';
import gsap from 'gsap';
import { fetchForbiddenWords, filterForbiddenWords } from '../lib/forbiddenWords';
import { formatDate } from '../lib/dateUtils';
import Image from 'next/image';
import Link from 'next/link';

interface Author {
  name: string;
  avatar?: string;
  username?: string;
}

// Định nghĩa interface cho props của Post
interface PostProps {
  id: string;
  userId: string;  // Thêm userId
  name: string;
  date: string;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  images?: string[];
  avatar?: string;
  feeling?: { icon: string; label: string } | null;
  location?: string | null;
  onOpenDetail?: () => void;
  theme?: string;
  hideActions?: boolean;
  author?: Author;
}

// Thêm hàm tối ưu URL Cloudinary với các parameters phù hợp
const optimizeCloudinaryUrl = (url: string) => {
  if (!url.includes('cloudinary.com')) return url;
  
  // Thêm các parameters tối ưu cho Cloudinary
  return url.replace(
    '/upload/',
    '/upload/w_auto,c_limit,q_auto,f_auto,dpr_auto/'
  );
};

// Thêm một low-quality image placeholder cho loading state
const shimmer = (w: number, h: number) => `
  <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
      <linearGradient id="g">
        <stop stop-color="#f6f7f8" offset="0%" />
        <stop stop-color="#edeef1" offset="20%" />
        <stop stop-color="#f6f7f8" offset="40%" />
        <stop stop-color="#f6f7f8" offset="100%" />
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="#f6f7f8" />
    <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
    <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite" />
  </svg>
`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

const Post = ({ 
  id, 
  userId,
  name, 
  date, 
  content, 
  likes, 
  comments, 
  shares, 
  images, 
  avatar, 
  onOpenDetail, 
  hideActions 
}: PostProps) => {
  const [showReport, setShowReport] = useState(false);
  const { user: currentUser } = useUser();
  const reporterId = currentUser?.id || '';
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [showLikeList, setShowLikeList] = useState(false);
  const likeBtnRef = useRef<HTMLButtonElement>(null);
  const [likeList, setLikeList] = useState<string[]>([]);
  const [commentCount, setCommentCount] = useState(comments);
  const [filteredContent, setFilteredContent] = useState(content);

  useEffect(() => {
    // Kiểm tra user đã like chưa
    if (currentUser?.id) {
      axios.get('/api/likes/is-liked', {
        params: { post_id: id, user_id: currentUser.id },
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
      }).then(res => {
        setLiked(res.data.liked);
        if (res.data.likeCount !== undefined) {
          setLikeCount(res.data.likeCount);
        }
        setLikeList(res.data.likeList || []);
      });
    }

    // Fetch updated comment count
    axios.get(`/api/posts/${id}`).then(res => {
      setCommentCount(res.data.comment_count || comments);
    });

    // Lọc từ cấm
    let ignore = false;
    async function filterContent() {
      const words = await fetchForbiddenWords();
      if (!ignore) {
        setFilteredContent(filterForbiddenWords(content, words));
      }
    }
    filterContent();
    return () => { ignore = true; };
  }, [id, currentUser, content, comments]);

  const handleLike = async () => {
    if (!currentUser?.id || !id) return;

    const endpoint = liked ? '/api/likes/unlike' : '/api/likes/like';
    try {
      const response = await axios.post(endpoint, 
        { post_id: id, user_id: currentUser.id },
        { baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000' }
      );

      setLiked(!liked);
      setLikeCount(response.data.likeCount);
      setLikeList(response.data.likeList || []);

      // Animate like button
      if (likeBtnRef.current) {
        if (!liked) {
          gsap.fromTo(
            likeBtnRef.current,
            { scale: 1.4, rotate: 0, filter: 'drop-shadow(0 0 24px #ff1744cc)' },
            { scale: 1, rotate: 0, filter: 'drop-shadow(0 0 18px #ff1744cc)', duration: 0.5, ease: 'elastic.out(1, 0.5)' }
          );
          gsap.fromTo(
            likeBtnRef.current,
            { rotate: -15 },
            { rotate: 15, yoyo: true, repeat: 3, duration: 0.08, ease: 'power1.inOut', clearProps: 'rotate' }
          );
        } else {
          gsap.fromTo(
            likeBtnRef.current,
            { scale: 0.8, rotate: -10, filter: 'drop-shadow(0 0 8px #ff174488)' },
            { scale: 1, rotate: 0, filter: 'none', duration: 0.35, ease: 'elastic.out(1, 0.5)' }
          );
        }
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const imagesArray: string[] = Array.isArray(images) ? images :
    typeof images === 'string' ? JSON.parse(images) : [];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm w-full max-w-3xl my-6 transform transition-all duration-200 hover:shadow-md">
      {/* Post Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link 
          href={userId === currentUser?.id ? '/profile' : `/profile/${userId}`}
          className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden group hover:ring-2 hover:ring-indigo-600 hover:ring-offset-2 transition-all"
        >
          {avatar ? (
            <Image
              src={optimizeCloudinaryUrl(avatar)}
              alt={name}
              width={48}
              height={48}
              className="object-cover rounded-full transition-transform group-hover:scale-110"
              placeholder="blur"
              blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(48, 48))}`}
            />
          ) : (
            <span className="material-symbols-outlined text-slate-400">person</span>
          )}
        </Link>
        <div className="flex-grow">
          <Link 
            href={userId === currentUser?.id ? '/profile' : `/profile/${userId}`}
            className="font-medium text-slate-900 hover:text-indigo-600 transition-colors"
          >
            {name}
          </Link>
          <p className="text-sm text-slate-500">{formatDate(date)}</p>
        </div>
        <button
          className="p-2 hover:bg-slate-50 rounded-full transition-colors"
          onClick={() => setShowReport(true)}
        >
          <span className="material-symbols-outlined text-slate-400">more_horiz</span>
        </button>
      </div>

      {/* Post Content */}
      <div className="space-y-4">
        <p className="text-slate-900 whitespace-pre-wrap">{filteredContent}</p>

        {/* Post Images */}
        {imagesArray.length > 0 && (
          <div className={`grid ${imagesArray.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
            {imagesArray.map((img: string, index: number) => (
              <div key={index} className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center group cursor-pointer hover:bg-slate-200 transition-all duration-200 overflow-hidden">
                {img.startsWith('http') ? (
                  <Image
                    src={optimizeCloudinaryUrl(img)}
                    alt={`Post image ${index + 1}`}
                    width={500}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    placeholder="blur"
                    blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(500, 300))}`}
                    priority={index === 0} // Load first image with priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:scale-110 transition-transform">
                    {img}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Post Actions */}
        {!hideActions && (
          <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-4 mt-4">
            <button
              ref={likeBtnRef}
              onClick={handleLike}
              className="flex-1 flex items-center justify-center gap-1 py-2 text-slate-600 hover:text-rose-500 transition-all duration-200 rounded-lg hover:bg-slate-50"
            >
              <span className="material-symbols-outlined" style={{ color: liked ? '#f43f5e' : 'currentColor' }}>
                favorite
              </span>
              <span>{likeCount}</span>
            </button>
            <button
              onClick={onOpenDetail}
              className="flex-1 flex items-center justify-center gap-1 py-2 text-slate-600 hover:text-indigo-500 transition-all duration-200 rounded-lg hover:bg-slate-50"
            >
              <span className="material-symbols-outlined">chat_bubble</span>
              <span>{commentCount}</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-1 py-2 text-slate-600 hover:text-emerald-500 transition-all duration-200 rounded-lg hover:bg-slate-50">
              <span className="material-symbols-outlined">share</span>
              <span>{shares}</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showReport && (
        <ReportPostModal
          postId={id}
          reporterId={reporterId}
          onClose={() => setShowReport(false)}
        />
      )}

      {showLikeList && likeList.length > 0 && (
        <LikeListModal
          postId={id}
          onClose={() => setShowLikeList(false)}
        />
      )}
    </div>
  );
};

export default Post;