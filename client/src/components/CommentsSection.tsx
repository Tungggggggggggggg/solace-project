import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import gsap from 'gsap';

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

export default function CommentsSection({ postId, currentUser }: { postId: string, currentUser: any }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const inputGroupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Lấy danh sách comment khi mở post
  useEffect(() => {
    const fetchComments = async () => {
      const res = await axios.get(`/api/comments?post_id=${postId}`, {
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
      });
      setComments(res.data);
    };
    fetchComments();
  }, [postId]);

  useEffect(() => {
    if (inputGroupRef.current) {
      gsap.fromTo(
        inputGroupRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.6, ease: 'power3.out' }
      );
    }
  }, []);

  // Thêm comment mới
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/comments', {
        post_id: postId,
        user_id: currentUser.id,
        content: newComment,
      }, {
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
      });
      setComments(prev => [...prev, res.data]);
      setNewComment('');
    } catch (err) {
      alert('Bình luận thất bại');
    }
    setLoading(false);
  };

  return (
    <div className="mt-4">
      <h4 className="font-semibold mb-2">Bình luận</h4>
      <div className="space-y-4 mb-4">
        {comments.map(c => (
          <div key={c.id} className="flex items-start gap-3">
            <img src={c.avatar_url || '/images/default-avatar.png'} className="w-8 h-8 rounded-full object-cover" alt="avatar" />
            <div>
              <div className="font-medium">{c.first_name} {c.last_name}</div>
              <div className="text-sm text-gray-700">{c.content}</div>
              <div className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
      <div
        ref={inputGroupRef}
        className="flex items-center gap-2 transition-all"
        style={{
          transform: isFocused ? 'scale(1.03)' : 'scale(1)',
          boxShadow: isFocused ? '0 2px 8px #b7caff33' : 'none',
          border: isFocused ? '2px solid #6c5ce7' : '1px solid #ccc',
          borderRadius: 12,
          background: isFocused ? '#f8f9fd' : '#fff',
          padding: 4,
        }}
      >
        <input
          ref={inputRef}
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 px-3 py-2 border-none outline-none bg-transparent"
          placeholder="Viết bình luận..."
        />
        <button
          onClick={handleAddComment}
          disabled={loading || !newComment.trim()}
          className="px-4 py-2 rounded transition-all"
          style={{
            background: isFocused ? '#6c5ce7' : '#b7ccfc',
            color: '#fff',
            opacity: loading || !newComment.trim() ? 0.5 : 1,
            transform: isFocused ? 'scale(1.08)' : 'scale(1)',
            boxShadow: isFocused ? '0 2px 8px #6c5ce799' : 'none',
          }}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
