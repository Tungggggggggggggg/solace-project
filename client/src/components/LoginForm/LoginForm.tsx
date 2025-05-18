// Import hook và icon cần thiết
import { useState } from "react";
import { FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

// Component LoginForm xử lý form đăng nhập
const LoginForm = () => {
  // State để quản lý dữ liệu form
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  // State để lưu trữ thông báo lỗi
  const [error, setError] = useState("");

  // Hàm xử lý thay đổi giá trị input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Hàm xử lý submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Kiểm tra dữ liệu đầu vào
    if (!form.email || !form.password) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    setError("");
    alert("Đăng nhập thành công!");
  };

  return (
    // Form đăng nhập với các trường email và password
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
      {/* Hiển thị lỗi nếu có */}
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
      {/* Nút submit */}
      <button
        type="submit"
        className="w-full py-3 mt-2 bg-black text-white font-bold rounded-full hover:bg-blue-700 transition-all text-lg shadow"
      >
        Log in
      </button>
      {/* Phân cách cho các tùy chọn đăng nhập khác */}
      <div className="flex items-center gap-2 my-2">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="text-gray-500 text-base font-semibold">OR</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>
      {/* Nút đăng nhập bằng Facebook */}
      <button
        type="button"
        className="w-full flex items-center gap-3 border border-gray-300 rounded-full py-3 text-base mb-2 hover:bg-gray-100 transition justify-center"
      >
        <span className="text-blue-600 text-2xl"><FaFacebookF /></span>
        <span className="text-black">Log in with Facebook</span>
      </button>
      {/* Nút đăng nhập bằng Google */}
      <button
        type="button"
        className="w-full flex items-center gap-3 border border-gray-300 rounded-full py-3 text-base hover:bg-gray-100 transition justify-center"
      >
        <span className="text-xl"><FcGoogle /></span>
        <span className="text-black">Log in with Google</span>
      </button>
    </form>
  );
};

export default LoginForm;