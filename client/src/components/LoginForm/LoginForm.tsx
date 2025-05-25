// Import các hook và component cần thiết cho form đăng nhập
import { useState, useEffect } from "react";
import { signInWithEmail } from "@/lib/firebaseAuth";
import Toast from "../Toast";

// Định nghĩa kiểu props cho LoginForm: cho phép truyền callback khi đăng nhập thành công
interface LoginFormProps {
  onSuccess?: () => void;
}

// Component LoginForm: Xử lý logic và giao diện form đăng nhập người dùng
const LoginForm = ({ onSuccess }: LoginFormProps) => {
  // State lưu trữ giá trị các trường nhập liệu của form
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  
  // State quản lý trạng thái và nội dung của Toast thông báo
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    show: false,
    message: '',
    type: 'info'
  });

  // Hàm hiển thị Toast với nội dung và loại thông báo tương ứng
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000); // Tự động ẩn Toast sau 3 giây
  };

  // Hàm đóng Toast thủ công
  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  // Xử lý thay đổi giá trị input và cập nhật state form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Xử lý submit form đăng nhập
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Kiểm tra dữ liệu đầu vào hợp lệ
    if (!form.email || !form.password) {
      showToast("Vui lòng điền đầy đủ thông tin", "warning");
      return;
    }
    try {
      // Gọi hàm đăng nhập bằng email và password
      await signInWithEmail(form.email, form.password);
      // Hiển thị thông báo thành công
      showToast("Đăng nhập thành công!", "success");
      // Gọi callback khi đăng nhập thành công (nếu có)
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err) {
      // Xử lý lỗi đăng nhập và hiển thị thông báo lỗi
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      showToast(errorMessage, "error");
    }
  };

  // Log trạng thái Toast để debug (có thể xóa khi production)
  useEffect(() => {
    console.log('Toast state:', toast);
  }, [toast]);

  return (
    <>
      {/* Form đăng nhập với các trường email và password */}
      <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
        {/* Nhập email */}
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
        {/* Nhập mật khẩu */}
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
        {/* Nút submit đăng nhập */}
        <button
          type="submit"
          className="w-full py-3 mt-2 bg-black text-white font-bold rounded-full hover:bg-blue-700 transition-all text-lg shadow"
        >
          Log in
        </button>
      </form>

      {/* Hiển thị Toast thông báo nếu có */}
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