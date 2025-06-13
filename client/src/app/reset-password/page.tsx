'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';// Lấy token từ URL
  const [newPassword, setNewPassword] = useState('');// State lưu mật khẩu mới
  const [showPassword, setShowPassword] = useState(false);// Toggle hiển thị mật khẩu

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Gửi yêu cầu đặt lại mật khẩu
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        token,
        newPassword,
      });
      toast.success('Mật khẩu đã được đặt lại thành công!');
      setTimeout(() => {
        router.push('/');
      }, 4000);
    } catch (err) {
      toast.error('Token không hợp lệ hoặc đã hết hạn.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white dark:bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Đặt lại mật khẩu</h2>
      <form onSubmit={handleReset} className="space-y-4">
        <div className="relative">
          <input
            className="w-full border px-4 py-2 pr-10 rounded text-gray-500"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 transition text-white font-semibold py-2 rounded"
        >
          Đặt lại
        </button>
      </form>
    </div>
  );
}
