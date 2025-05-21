import React from 'react';
import Image from 'next/image';

const ProfileInfo: React.FC = () => {
  return (
    <div className="flex flex-col items-center -mt-24 px-4 relative z-10">
      <div className="relative mb-4">
        <Image
          src="https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474072oeB/anh-dai-dien-buon-ngau_023706184.jpg"
          alt="Avatar"
          width={160}
          height={160}
          className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg hover:scale-105 transition-transform"
          unoptimized
        />
        <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-green-500 border-2 border-white" />
      </div>
      <h1 className="text-3xl font-bold font-playfair">Nguyễn Thị Mai</h1>
      <p className="text-gray-500 text-center max-w-xl mt-2">
        Nhà thiết kế đồ họa | Nhiếp ảnh gia nghiệp dư | Yêu động vật và du lịch<br />
        &quot;Sáng tạo không giới hạn&quot;
      </p>

      <div className="flex flex-wrap gap-6 justify-center mt-6">
        {[
          { label: 'Bài viết', value: '1.2K' },
          { label: 'Người theo dõi', value: '15.8K' },
          { label: 'Đang theo dõi', value: '342' },
          { label: 'Nhóm', value: '24' },
        ].map((stat, idx) => (
          <div key={idx} className="text-center">
            <div className="text-xl font-semibold text-violet-600">{stat.value}</div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-6">
        <button className="px-6 py-2 bg-violet-600 text-white rounded-full shadow hover:-translate-y-1 transition-transform">
          <span className="material-symbols-outlined align-middle mr-1">person_add</span>
          Theo dõi
        </button>
        <button className="px-6 py-2 border-2 border-violet-600 text-violet-600 rounded-full hover:bg-violet-100">
          <span className="material-symbols-outlined align-middle mr-1">chat</span>
          Nhắn tin
        </button>
        <button className="w-11 h-11 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center hover:bg-violet-600 hover:text-white">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileInfo;
