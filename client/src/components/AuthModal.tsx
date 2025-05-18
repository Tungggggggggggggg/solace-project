// Import hook và component cần thiết
import { useState, useEffect } from "react";
import SignUpForm from "./SignupForm/SignUpForm";
import LoginForm from "./LoginForm/LoginForm";

// Định nghĩa interface cho props của AuthModal
interface AuthModalProps {
  onClose: () => void; /* Hàm đóng modal */
  defaultTab?: 'login' | 'signup'; /* Tab mặc định khi mở modal */
}

// Component AuthModal hiển thị modal đăng nhập/đăng ký
const AuthModal = ({ onClose, defaultTab = 'signup' }: AuthModalProps) => {
  // State để quản lý tab hiện tại (signup hoặc login)
  const [tab, setTab] = useState<'signup' | 'login'>(defaultTab);

  // Cập nhật tab khi defaultTab thay đổi
  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  return (
    // Modal overlay cố định trên toàn màn hình
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      {/* Nội dung modal */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 mx-2 sm:mx-4 md:mx-8 lg:mx-0">
        {/* Nút đóng modal */}
        <button
          className="absolute top-4 right-4 text-2xl text-black hover:scale-110 transition"
          onClick={onClose}
          aria-label="Đóng"
        >
          ×
        </button>
        {/* Tabs chuyển đổi giữa đăng ký và đăng nhập */}
        <div className="flex mb-10 gap-0">
          <button
            className={`flex-1 py-3 rounded-l-xl text-lg font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-200 ${tab === 'signup' ? 'bg-[#8CA9D5] text-black shadow' : 'bg-gray-200 text-black/70'}`}
            onClick={() => setTab('signup')}
          >
            Sign up
          </button>
          <button
            className={`flex-1 py-3 rounded-r-xl text-lg font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-200 ${tab === 'login' ? 'bg-[#8CA9D5] text-black shadow' : 'bg-gray-200 text-black/70'}`}
            onClick={() => setTab('login')}
          >
            Log in
          </button>
        </div>
        {/* Hiển thị form tương ứng với tab được chọn */}
        <div>
          {tab === 'signup' ? <SignUpForm /> : <LoginForm />}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;