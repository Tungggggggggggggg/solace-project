// Import hook cần thiết
import { useState } from "react";

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
  // State để lưu trữ thông báo lỗi
  const [error, setError] = useState("");

  // Hàm xử lý thay đổi giá trị input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Hàm xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Kiểm tra dữ liệu đầu vào
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    setError("");
    alert("Đăng ký thành công!");
    onSuccess?.();
  };

  return (
    // Form đăng ký với các trường họ, tên, email và password
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
  );
};

export default SignUpForm;