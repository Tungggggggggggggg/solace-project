// Import hook cần thiết
import { useState } from "react";
import Toast from "../Toast";
import { useUser } from "@/contexts/UserContext";

interface SignUpFormProps {
  onSuccess?: () => void;
}

// Component SignUpForm xử lý form đăng ký
const SignUpForm = ({ onSuccess }: SignUpFormProps) => {
  // State để quản lý dữ liệu form
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
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

  const { setUserData } = useUser();

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

  // State để lưu trữ thông báo lỗi
  const [error, setError] = useState("");

  // Hàm xử lý thay đổi giá trị input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Hàm xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setError("");

    // Basic validation
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Địa chỉ email không hợp lệ.");
      return;
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(form.password)) {
      setError("Mật khẩu cần ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.");
      return;
    }

    try {
       // Gọi API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email.toLowerCase().trim(),
          password: form.password,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      // Xử lý thành công
      showToast("Đăng ký thành công!", "success");
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      });
      setError("");

      // Auto-login after successful registration
      const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password
        }),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        // Show success feedback
        showToast("Đăng nhập thành công!", "success");
        
        // Clear form
        setForm({
          firstName: '',
          lastName: '',
          email: '',
          password: ''
        });

        // Lưu thông tin người dùng vào context
        const { user, accessToken } = data;
        setUserData(user, accessToken);      
        showToast("Đăng nhập thành công!", "success");

        // Redirect after delay
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      }

    } catch (err) {
      // Handle specific error cases
      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
      
      if (err instanceof Error) {
        if (err.message.includes('Email already exists')) {
          errorMessage = "Email đã được đăng ký. Vui lòng sử dụng email khác.";
        } else if (err.message.includes('Weak password')) {
          errorMessage = "Mật khẩu không đủ mạnh.";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      showToast(errorMessage, "error");
    }
  };

  return (
    <>
      {/* Form đăng ký với các trường họ, tên, email và password */}
      <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
        {/* Trường họ và tên */}
        <div className="w-full flex flex-col md:flex-row gap-4 box-border">
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="firstName" className="font-semibold text-black text-base">First name</label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              placeholder="Nguyen"
              className="w-full min-w-0 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-black font-medium bg-white placeholder:text-gray-400"
              value={form.firstName}
              onChange={handleChange}
              autoComplete="given-name"
            />
          </div>
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="lastName" className="font-semibold text-black text-base">Last name</label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              placeholder="Van A"
              className="w-full min-w-0 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-black font-medium bg-white placeholder:text-gray-400"
              value={form.lastName}
              onChange={handleChange}
              autoComplete="family-name"
            />
          </div>
        </div>
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
            autoComplete="new-password"
          />
        </div>
        {/* Hiển thị lỗi nếu có */}
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {/* Nút submit */}
        <button
          type="submit"
          className="w-full py-3 mt-2 bg-black text-white font-bold rounded-full hover:bg-blue-700 transition-all text-lg shadow"
        >
          Sign up
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

export default SignUpForm;