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
import SharePostModal from './SharePostModal';
import SkeletonPost from './SkeletonPost';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  onOpenDetail?: (postObj: any) => void;
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
  feeling, 
  location, 
  onOpenDetail, 
  hideActions, 
  shared_post_id,
  onPostCreated,
  theme
}: PostProps & { shared_post_id?: string, onPostCreated?: (post: any) => void }) => {
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCount, setShareCount] = useState(shares);
  const [sharedPost, setSharedPost] = useState<any>(null);

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
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`).then(res => {
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

    if (shared_post_id) {
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${shared_post_id}`)
        .then(res => setSharedPost(res.data))
        .catch(() => setSharedPost(null));
    }

    return () => { ignore = true; };
  }, [id, currentUser, content, comments, shared_post_id]);

  const handleLike = async () => {
    if (!currentUser?.id || !id) {
      toast.info('Bạn cần đăng nhập để thực hiện chức năng này!');
      return;
    }

    const endpoint = liked ? '/api/likes/unlike' : '/api/likes/like';
    try {
      // Cập nhật local trước
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
      // Gửi request lên server để cập nhật, không lấy lại số lượng like từ response
      await axios.post(endpoint, 
        { post_id: id, user_id: currentUser.id },
        { baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000' }
      );
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser?.id) {
      toast.info('Bạn cần đăng nhập để thực hiện chức năng này!');
      return;
    }
    if (onOpenDetail && id) {
      onOpenDetail({
        id,
        name,
        date,
        content,
        likes: likeCount,
        comments: commentCount,
        shares: shareCount,
        images,
        feeling: sharedPost?.feeling || feeling,
        location: sharedPost?.location || location,
        avatar_url: avatar
      });
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser?.id) {
      toast.info('Bạn cần đăng nhập để thực hiện chức năng này!');
      return;
    }
    setShowShareModal(true);
  };

  const handleReportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser?.id) {
      toast.info('Bạn cần đăng nhập để thực hiện chức năng này!');
      return;
    }
    setShowReport(true);
  };

  const imagesArray: string[] = Array.isArray(images) ? images :
    typeof images === 'string' ? JSON.parse(images) : [];

  // Hàm mở detail bài gốc (fetch lại từ API)
  const handleOpenDetailRootPost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onOpenDetail || !sharedPost?.id) return;
    try {
      const res = await axios.get(`/api/posts/${sharedPost.id}`, {
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
      });
      if (res.data && res.data.id) {
        onOpenDetail({
          id: res.data.id,
          name: `${res.data.first_name || ''} ${res.data.last_name || ''}`.trim(),
          date: res.data.created_at || res.data.date || '',
          content: res.data.content,
          likes: res.data.likes,
          comments: res.data.comments,
          shares: res.data.shares,
          images: res.data.images,
          feeling: res.data.feeling,
          location: res.data.location,
          avatar_url: res.data.avatar_url
        });
      }
    } catch (err) {
      if (sharedPost.id) {
        onOpenDetail({
          id: sharedPost.id,
          name: `${sharedPost.first_name || ''} ${sharedPost.last_name || ''}`.trim(),
          date: sharedPost.created_at || sharedPost.date || '',
          content: sharedPost.content,
          likes: sharedPost.likes,
          comments: sharedPost.comments,
          shares: sharedPost.shares,
          images: sharedPost.images,
          feeling: sharedPost.feeling,
          location: sharedPost.location,
          avatar_url: sharedPost.avatar_url
        });
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm w-full max-w-3xl my-6 transform transition-all duration-200 hover:shadow-md relative">
      <button
        className="absolute top-4 right-4 p-2 hover:bg-slate-50 rounded-full transition-colors z-10"
        onClick={handleReportClick}
      >
        <span className="material-symbols-outlined text-slate-400">more_horiz</span>
      </button>
      {shared_post_id && sharedPost === null ? (
        <SkeletonPost />
      ) : sharedPost ? (
        <div>
          {/* Người share */}
          <div className="flex items-center gap-3 mb-4 relative">
            <Link
              href={userId === currentUser?.id ? '/profile' : `/profile/${userId}`}
              className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden group hover:ring-2 hover:ring-indigo-600 hover:ring-offset-2 transition-all"
              onClick={e => e.stopPropagation()}
            >
              {avatar ? (
                <img src={avatar} alt={name} width={40} height={40} className="object-cover w-10 h-10" />
              ) : (
                <span className="material-symbols-outlined text-slate-400">person</span>
              )}
            </Link>
            <div className="flex-grow">
              <Link
                href={userId === currentUser?.id ? '/profile' : `/profile/${userId}`}
                className="font-medium text-slate-900 block hover:text-indigo-600 transition-colors"
                onClick={e => e.stopPropagation()}
              >
                {name}
              </Link>
              <span className="text-gray-500 text-sm block">
                đã chia sẻ bài viết của <Link href={sharedPost.user_id === currentUser?.id ? '/profile' : `/profile/${sharedPost.user_id}`} className="font-semibold hover:text-indigo-600 transition-colors" onClick={e => e.stopPropagation()}>{sharedPost.first_name} {sharedPost.last_name}</Link>
              </span>
              <span className="text-sm text-slate-500 block">{formatDate(date)}</span>
            </div>
          </div>
          {/* Nội dung shareText nếu có */}
          {content && <div className="mb-2 text-slate-900 whitespace-pre-wrap">{content}</div>}
          {/* Bài viết gốc */}
          <div
            className="bg-gray-50 border rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition"
            onClick={handleOpenDetailRootPost}
          >
            <div className="flex items-center gap-2 mb-2">
              <Link href={sharedPost.user_id === currentUser?.id ? '/profile' : `/profile/${sharedPost.user_id}`} className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-indigo-600 transition-all" onClick={e => e.stopPropagation()}>
                <img src={sharedPost.avatar_url || '/images/default-avatar.png'} alt={sharedPost.first_name ? `${sharedPost.first_name} ${sharedPost.last_name}` : 'avatar'} className="w-8 h-8 rounded-full object-cover" />
              </Link>
              <Link href={sharedPost.user_id === currentUser?.id ? '/profile' : `/profile/${sharedPost.user_id}`} className="font-semibold hover:text-indigo-600 transition-colors" onClick={e => e.stopPropagation()}>
                {sharedPost.first_name} {sharedPost.last_name}
              </Link>
              <span className="text-gray-500 text-xs">{formatDate(sharedPost.created_at)}</span>
            </div>
            <div className="mb-2 text-slate-900 whitespace-pre-wrap">{sharedPost.content}</div>
            {sharedPost.images && sharedPost.images.length > 0 && (
              <div className={`grid ${sharedPost.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-2`}>
                {sharedPost.images.map((img: string, idx: number) => (
                  <div key={idx} className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center">
                    <img src={img} alt={`post-img-${idx}`} className="object-cover w-full h-full rounded-xl" />
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Nút like/share/comment giống post thường */}
          {!hideActions && (
            <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-4 mt-4">
              <button
                ref={likeBtnRef}
                onClick={handleLike}
                className="flex-1 flex items-center justify-center gap-1 py-2 text-slate-600 hover:text-rose-500 transition-all duration-200 rounded-lg hover:bg-slate-50"
              >
                <div className="w-7 h-7 flex items-center justify-center mr-1">
                  {liked ? (
                    <img src="/heart_fill.svg" alt="liked" className="w-6 h-6" />
                  ) : (
                    <img src="/heart.svg" alt="like" className="w-6 h-6" />
                  )}
                </div>
                <span
                  className="cursor-pointer hover:underline"
                  onClick={e => { e.stopPropagation(); setShowLikeList(true); }}
                >
                  {likeCount}
                </span>
              </button>
              <button
                onClick={handleCommentClick}
                className="flex-1 flex items-center justify-center gap-1 py-2 text-slate-600 hover:text-indigo-500 transition-all duration-200 rounded-lg hover:bg-slate-50"
              >
                <span className="material-symbols-outlined">chat_bubble</span>
                <span>{commentCount}</span>
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-1 py-2 text-slate-600 hover:text-emerald-500 transition-all duration-200 rounded-lg hover:bg-slate-50"
                onClick={handleShareClick}
              >
                <span className="material-symbols-outlined">share</span>
                <span>{shareCount}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
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
                  blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(48, 48))}`} />
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
                        priority={index === 0}
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
                  <div className="w-7 h-7 flex items-center justify-center mr-1">
                    {liked ? (
                      <img src="/heart_fill.svg" alt="liked" className="w-6 h-6" />
                    ) : (
                      <img src="/heart.svg" alt="like" className="w-6 h-6" />
                    )}
                  </div>
                  <span
                    className="cursor-pointer hover:underline"
                    onClick={e => { e.stopPropagation(); setShowLikeList(true); }}
                  >
                    {likeCount}
                  </span>
                </button>
                <button
                  onClick={handleCommentClick}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-slate-600 hover:text-indigo-500 transition-all duration-200 rounded-lg hover:bg-slate-50"
                >
                  <span className="material-symbols-outlined">chat_bubble</span>
                  <span>{commentCount}</span>
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-slate-600 hover:text-emerald-500 transition-all duration-200 rounded-lg hover:bg-slate-50"
                  onClick={handleShareClick}
                >
                  <span className="material-symbols-outlined">share</span>
                  <span>{shareCount}</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
      {/* Modals */}
      {showReport && (
        <ReportPostModal
          postId={id}
          reporterId={reporterId}
          onClose={() => setShowReport(false)}
        />
      )}
      {showLikeList && (
        <LikeListModal
          postId={id}
          onClose={() => setShowLikeList(false)}
        />
      )}
      {showShareModal && (
        <SharePostModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          post={{ id, name, content, images }}
          onShared={(newPost) => {
            setShowShareModal(false);
            setShareCount(shareCount + 1);
            if (onPostCreated) onPostCreated(newPost);
          }}
          typePost={theme === 'reflective' ? 'negative' : 'positive'}
        />
      )}
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default Post;