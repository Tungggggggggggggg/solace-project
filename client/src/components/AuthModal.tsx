"use client";

// Import hook và component cần thiết
import { useState, useEffect } from "react";
import SignUpForm from "./SignupForm/SignUpForm";
import LoginForm from "./LoginForm/LoginForm";
import Toast from "./Toast";
import { signInWithGoogle, signInWithFacebook } from "../lib/firebaseAuth";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";

// Định nghĩa interface cho props của AuthModal
interface AuthModalProps {
  onClose: () => void; /* Hàm đóng modal */
  defaultTab?: 'login' | 'signup'; /* Tab mặc định khi mở modal */
}

// Component AuthModal hiển thị modal đăng nhập/đăng ký
const AuthModal = ({ onClose, defaultTab = 'signup' }: AuthModalProps) => {
  // State để quản lý tab hiện tại (signup hoặc login)
  const [tab, setTab] = useState<'signup' | 'login'>(defaultTab);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  // Cập nhật tab khi defaultTab thay đổi
  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      setToast({ message: "Đăng nhập với Google thành công!", type: "success" });
      setTimeout(() => {
        onClose();
      }, 1000); // Đóng modal sau 1 giây
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đăng nhập với Google thất bại!";
      setToast({ message: errorMessage, type: "error" });
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await signInWithFacebook();
      setToast({ message: "Đăng nhập với Facebook thành công!", type: "success" });
      setTimeout(() => {
        onClose();
      }, 1000); // Đóng modal sau 1 giây
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đăng nhập với Facebook thất bại!";
      setToast({ message: errorMessage, type: "error" });
    }
  };

  // Hàm xử lý đăng nhập thành công
  const handleLoginSuccess = () => {
    setToast({ message: "Đăng nhập thành công!", type: "success" });
    setTimeout(() => {
      onClose();
    }, 1000); // Đóng modal sau 1 giây
  };

  return (
    <>
      {/* Modal overlay cố định trên toàn màn hình */}
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
            {tab === 'signup' ? 
              <SignUpForm onSuccess={handleLoginSuccess} /> : 
              <LoginForm onSuccess={handleLoginSuccess} />
            }
          </div>
          {/* Phân cách với chữ OR */}
          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-gray-500 text-base font-semibold mb-3 mt-3">OR</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>
          {/* Nút đăng nhập với Google */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center gap-3 border border-gray-300 rounded-full py-3 text-base mb-2 hover:bg-gray-100 transition justify-center mb-5"
          >
            <FcGoogle className="text-xl" />
            <span className="text-black">Log in with Google</span>
          </button>
          {/* Nút đăng nhập với Facebook */}
          <button
            onClick={handleFacebookLogin}
            className="w-full flex items-center gap-3 border border-gray-300 rounded-full py-3 text-base mb-2 hover:bg-gray-100 transition justify-center"
          >
            <FaFacebookF className="text-blue-600 text-xl" />
            <span className="text-black">Log in with Facebook</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default AuthModal;