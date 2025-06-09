'use client';

import type { ReactElement } from 'react';
import { FiFlag, FiUserPlus } from 'react-icons/fi';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { LineChart, Line } from 'recharts';

import AdminLayout from '@/components/AdminLayout';

type Summary = {
  reports_today: number;
  reports_yesterday: number;
  posts_this_week: number;
  posts_last_week: number;
  new_users_today: number;
  new_users_yesterday: number;
};

export default function AdminPage(): ReactElement {
  // Hàm xử lý mở auth modal
  const handleOpenAuth = (tab: 'login' | 'signup') => {
    console.log(`Mở tab ${tab}`); // Thay bằng logic mở modal
  };
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/dashboard/summary')
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(err => console.error('Lỗi khi lấy dữ liệu thống kê:', err));
  }, []);

  const getGrowthPercent = (current: number, previous: number): string => {
    if (previous === 0) {
      if (current === 0) return '0%';        // Không thay đổi
      return '+100%';                         // Tăng từ 0 lên → xem như 100% 
    }
    const percent = ((current - previous) / previous) * 100;
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(1)}%`;
  };

  const [monthlyUsers, setMonthlyUsers] = useState<{ month: string; total: number }[]>([]);
  useEffect(() => {
    fetch('http://localhost:5000/api/dashboard/monthly-users')
      .then((res) => res.json())
      .then((data) =>
        setMonthlyUsers(
          data.map((item: any) => ({ month: item.month, total: Number(item.total) }))
        )
      );
  }, []);

  const [dailyVisits, setDailyVisits] = useState<{ date: string; total: number }[]>([]);
    useEffect(() => {
      fetch('http://localhost:5000/api/dashboard/daily-visits')
        .then(res => res.json())
        .then(data => setDailyVisits(data));
    }, []);

  //Khai báo state và lấy dữ liệu API phân tích cảm xúc bài viết
  const [postSentiment, setPostSentiment] = useState<{ type: string; count: number }[]>([]);
    useEffect(() => {
      fetch('http://localhost:5000/api/dashboard/post-sentiment')
        .then(res => res.json())
        .then(data => setPostSentiment(data))
        .catch(err => console.error('Lỗi khi lấy biểu đồ cảm xúc:', err));
    }, []);

    const COLORS = ['#4F46E5', '#F87171']; // Tích cực - Tiêu cực


  return (
    <AdminLayout onOpenAuth={handleOpenAuth}>
      <main className="flex-1 bg-white">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Tổng quan hệ thống</h1>
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="p-6 border border-[#DBE0E5] rounded-xl bg-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-base font-medium text-gray-900">Báo cáo vi phạm hôm nay</p>
                <FiFlag className="w-6 h-6 text-gray-800" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{summary?.reports_today ?? '...'}</p>
              <p className={`text-sm ${summary && summary.reports_today < summary.reports_yesterday ? 'text-red-500' : 'text-green-600'}`}>
                {summary ? getGrowthPercent(summary.reports_today, summary.reports_yesterday) : '...'} so với hôm qua
              </p>
            </div>

            <div className="p-6 border border-[#DBE0E5] rounded-xl bg-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-base font-medium text-gray-900">Bài đăng trong tuần</p>
                <HiOutlineDocumentText className="w-6 h-6 text-gray-800" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{summary?.posts_this_week ?? '...'}</p>
              <p className={`text-sm ${summary && summary.posts_this_week < summary.posts_last_week ? 'text-red-500' : 'text-green-600'}`}>
                {summary ? getGrowthPercent(summary.posts_this_week, summary.posts_last_week) : '...'} so với tuần trước
              </p>
            </div>

            <div className="p-6 border border-[#DBE0E5] rounded-xl bg-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-base font-medium text-gray-900">Người dùng mới hôm nay</p>
                <FiUserPlus className="w-6 h-6 text-gray-800" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{summary?.new_users_today ?? '...'}</p>
              <p className={`text-sm ${summary && summary.new_users_today < summary.new_users_yesterday ? 'text-red-500' : 'text-green-600'}`}>
                {summary ? getGrowthPercent(summary.new_users_today, summary.new_users_yesterday) : '...'} so với hôm qua
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 border border-[#DBE0E5] rounded-xl bg-white">
              <h3 className="font-medium text-gray-600 mb-4">Tài khoản mới theo tháng</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyUsers}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="p-6 border border-[#DBE0E5] rounded-xl bg-white">
              <h3 className="font-medium text-gray-600 mb-4">Phân tích cảm xúc bài viết</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={postSentiment}
                        dataKey="count"
                        nameKey="type"
                        outerRadius={80}
                        label
                      >
                        {postSentiment.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>    
            </div>
            <div className="p-6 border border-[#DBE0E5] rounded-xl bg-white">
              <h3 className="font-medium text-gray-600 mb-4">Lượt truy cập theo ngày</h3>
              <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyVisits}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}