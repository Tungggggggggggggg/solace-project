'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, { email });

      // Nếu server trả về "message" thì xem như thành công
      if (response.data?.message) {
        toast.success(response.data.message, {
          position: 'top-center',
        });

        setTimeout(() => {
          router.push('/');
        }, 5000);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || 'Đã xảy ra lỗi khi gửi email khôi phục.';
      toast.error(errorMessage, {
        position: 'top-center',
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white dark:bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Quên mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="w-full border px-4 py-2 mb-3 rounded text-gray-700"
          type="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
        >
          Gửi
        </button>
      </form>
    </div>
  );
}
