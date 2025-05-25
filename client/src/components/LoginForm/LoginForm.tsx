// Import hook cần thiết
import { useState } from "react";
import { signInWithEmail } from "@/lib/firebaseAuth";
import Toast from "../Toast";

// Định nghĩa kiểu cho props của component LoginForm
interface LoginFormProps {
  onSuccess?: () => void;
}

// Component LoginForm xử lý form đăng nhập
const LoginForm = ({ onSuccess }: LoginFormProps) => {
  // State để quản lý dữ liệu form
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  
  // State để quản lý toast
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    show: false,
    message: '',
    type: 'info'
  });

  // Hàm hiển thị toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setToast({ show: true, message, type });
  };

  // Hàm đóng toast
  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  // Hàm xử lý thay đổi giá trị input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Hàm xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Kiểm tra dữ liệu đầu vào
    if (!form.email || !form.password) {
      showToast("Vui lòng điền đầy đủ thông tin", "warning");
      return;
    }

    try {
      // Gọi hàm đăng nhập
      await signInWithEmail(form.email, form.password);
      // Hiển thị thông báo thành công sau khi đăng nhập
      showToast("Đăng nhập thành công!", "success");
      // Callback khi đăng nhập thành công
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      // Hiển thị thông báo lỗi
      showToast(errorMessage, "error");
    }
  };

  return (
    <>
      {/* Form đăng nhập với các trường email và password */}
      <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
        {/* Trường email */}
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="font-semibold text-black text-base">Email address</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="abc@gmail.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-black font-medium bg-white placeholder:text-gray-400"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </div>
        {/* Trường password */}
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="font-semibold text-black text-base">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="12345678"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-black font-medium bg-white placeholder:text-gray-400"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
        </div>
        {/* Nút submit */}
        <button
          type="submit"
          className="w-full py-3 mt-2 bg-black text-white font-bold rounded-full hover:bg-blue-700 transition-all text-lg shadow"
        >
          Log in
        </button>
      </form>

      {/* Toast notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </>
  );
};

export default LoginForm;