import React, { useState } from "react";

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
}

const PostDetailPopup = ({ post, onClose }: PostDetailPopupProps) => {
  const [comments, setComments] = useState([
    { user: post.name, text: "0 no flop r" },
  ]);
  const [input, setInput] = useState("");
  const [selectedImg, setSelectedImg] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      setComments([...comments, { user: "Bạn", text: input }]);
      setInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Nền mờ giữ nguyên Home */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm popup-overlay" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 max-w-2xl w-full shadow-xl z-10 popup-content">
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
        <div className="mb-4">
          <p className="text-black text-base font-medium font-[Inter]">{post.content}</p>
        </div>
        {/* Thống kê tương tác */}
        <div className="flex justify-between text-gray-600 mt-2 mb-4">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-xl">mood</span>
            <span className="font-bold text-base">{post.likes}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-xl">comment</span>
            <span className="font-bold text-base">{post.comments}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-xl">share</span>
            <span className="font-bold text-base">{post.shares}</span>
          </div>
        </div>
        {/* Khu vực bình luận */}
        <div className="border-t pt-4">
          <div className="mb-2 text-gray-700 font-semibold">Bình luận</div>
          {comments.map((c, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <span className="text-gray-800">{c.user}: {c.text}</span>
            </div>
          ))}
          <input
            type="text"
            placeholder="Viết bình luận..."
            className="w-full px-4 py-2 border rounded-full text-base mt-2"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
          />
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