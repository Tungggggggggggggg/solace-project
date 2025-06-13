import React, { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../contexts/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

interface PostContent {
  id: string;
  name: string;
  content: string;
  images?: string[];
}

interface SharePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostContent;
  onShared: (newPost: any) => void;
  typePost: 'positive' | 'negative';
}

const SharePostModal: React.FC<SharePostModalProps> = ({ isOpen, onClose, post, onShared, typePost }) => {
  const [shareText, setShareText] = useState('');
  const { user } = useContext(UserContext);

  if (!isOpen) return null;

  const handleShare = async () => {
    if (!user?.id) {
      toast.error('Bạn cần đăng nhập để chia sẻ bài viết!');
      return;
    }

    try {
      const res = await axios.post('/api/posts', {
        user_id: user.id,
        content: shareText || `Đã chia sẻ một bài viết từ ${post.name}`,
        shared_post_id: post.id,
        privacy: 'public',
        type_post: typePost,
        images: null,
        feeling: null,
        location: null,
      }, {
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
      });

      await axios.post('/api/posts/increment-shares', {
        postId: post.id,
      }, {
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
      });

      toast.success('Bài viết đã được chia sẻ thành công!');
      onShared(res.data);
    } catch (error) {
      console.error('Lỗi khi chia sẻ bài viết:', error);
      toast.error('Có lỗi xảy ra khi chia sẻ bài viết. Vui lòng thử lại!');
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50" style={{ backdropFilter: 'blur(5px)' }}>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4"
      >
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold">Chia sẻ</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div className="flex items-center mb-4">
          {user && <img src={user.avatar_url || '/images/default-avatar.png'} alt="User Avatar" className="w-12 h-12 rounded-full object-cover" />}
          <div className="ml-3 flex-1">
            <p className="font-semibold">{user ? `${user.first_name} ${user.last_name}` : ''}</p>
          </div>
        </div>

        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Hãy nói gì đó về nội dung này..."
          value={shareText}
          onChange={(e) => setShareText(e.target.value)}
        ></textarea>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleShare}
            className="px-6 py-3 rounded-lg bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors w-full"
          >
            Chia sẻ ngay
          </button>
        </div>
      </motion.div>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SharePostModal; 