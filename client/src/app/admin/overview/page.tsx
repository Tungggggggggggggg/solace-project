'use client';

import type { ReactElement } from 'react';
import { FiFlag, FiUserPlus } from 'react-icons/fi';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
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
  
  // Gọi API lấy dữ liệu thống kê tổng quan (báo cáo, bài đăng, người dùng)
  useEffect(() => {
    fetch('http://localhost:5000/api/dashboard/summary')
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(err => console.error('Lỗi khi lấy dữ liệu thống kê:', err));
  }, []);

  // Hàm tính phần trăm tăng trưởng giữa 2 giá trị
  const getGrowthPercent = (current: number, previous: number): string => {
    if (previous === 0) {
      if (current === 0) return '0%';        // Không thay đổi
      return '+100%';                         // Tăng từ 0 lên → xem như 100% 
    }
    const percent = ((current - previous) / previous) * 100;
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(1)}%`;
  };

  const [selectedYear, setSelectedYear] = useState(2025);
  const [monthlyUsers, setMonthlyUsers] = useState<{ month: string; total: number }[]>([]);
  
  // Gọi API lấy dữ liệu người dùng theo tháng, có lọc theo năm
  useEffect(() => {
    fetch(`http://localhost:5000/api/dashboard/monthly-users?year=${selectedYear}`)
      .then((res) => res.json())
      .then((data) =>
        setMonthlyUsers(
          data.map((item: any) => ({ month: item.month, total: Number(item.total) }))
        )
      );
  }, [selectedYear]);

  const COLORS = [
    '#6366F1', // Indigo
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#22C55E', // Green
    '#0EA5E9', // Sky Blue
    '#E11D48', // Rose
  ];
  

  const average = monthlyUsers.reduce((sum, item) => sum + item.total, 0) / monthlyUsers.length;
  
  // Hàm render phần trăm trên biểu đồ tròn cảm xúc
  const renderCustomizedLabel = ({ percent }: { percent: number }) =>
    `${(percent * 100).toFixed(0)}%`;
  
  const [visitRange, setVisitRange] = useState('7');
  const [dailyVisits, setDailyVisits] = useState<{ date: string; total: number }[]>([]);

  // Gọi API lấy dữ liệu lượt truy cập theo ngày, có lọc theo khoảng thời gian
  useEffect(() => {
    fetch(`http://localhost:5000/api/dashboard/daily-visits?range=${visitRange}`)
      .then(res => res.json())
      .then(data => setDailyVisits(data));
  }, [visitRange]);


  //Khai báo state và lấy dữ liệu API phân tích cảm xúc bài viết
  const [sentimentRange, setSentimentRange] = useState('month');
  const [postSentiment, setPostSentiment] = useState<{ type: string; count: number }[]>([]);
  
  // Gọi API lấy dữ liệu cảm xúc bài viết, có lọc theo tuần/tháng
  useEffect(() => {
    fetch(`http://localhost:5000/api/dashboard/post-sentiment?range=${sentimentRange}`)
      .then(res => res.json())
      .then(data => setPostSentiment(data))
      .catch(err => console.error('Lỗi khi lấy biểu đồ cảm xúc:', err));
  }, [sentimentRange]);


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
            <div className="p-6 border border-[#DBE0E5] rounded-xl bg-white col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">📈 Tài khoản mới theo tháng</h3>
                <div>
                  <label className="mr-2 font-medium text-gray-700">Chọn năm:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                  </select>
                </div>
              </div>
              <div className="h-72 bg-[#FAFAFA] rounded-2xl px-4 py-2 shadow-inner">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyUsers} barCategoryGap="20%">
                    <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: 8, borderColor: '#E5E7EB' }}
                      labelStyle={{ color: '#374151', fontWeight: 500 }}
                      cursor={{ fill: '#F3F4F6' }}
                    />
                    <ReferenceLine
                      y={average}
                      stroke="#EF4444"
                      strokeDasharray="4 2"
                      label={{
                        value: 'Trung bình',
                        position: 'top',
                        fill: '#EF4444',
                        fontSize: 12
                      }}
                    />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                      {monthlyUsers.map((_, index) => (
                        <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="p-6 border border-[#DBE0E5] rounded-xl bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className=" text-lg font-semibold text-gray-800">💬 Phân tích cảm xúc bài viết</h3>
                <select
                  value={sentimentRange}
                  onChange={(e) => setSentimentRange(e.target.value)}
                  className="p-2 border rounded"
                >
                  <option value="week">7 ngày gần nhất</option>
                  <option value="month">Tháng này</option>
                </select>
              </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={postSentiment}
                        dataKey="count"
                        nameKey="type"
                        outerRadius={80}
                        label={renderCustomizedLabel}
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">📊 Lượt truy cập theo ngày</h3>
                <select
                  value={visitRange}
                  onChange={(e) => setVisitRange(e.target.value)}
                  className="p-2 border rounded"
                >
                  <option value="7">7 ngày</option>
                  <option value="30">30 ngày</option>
                  <option value="all">Toàn bộ</option>
                </select>
              </div>
              <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyVisits}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={3}
                    dot={{ r: 4, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
                  />
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