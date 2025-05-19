import React, { useState } from 'react';

const tabs = [
  'Bài viết',
  'Giới thiệu',
  'Bạn bè',
  'Ảnh',
  'Video',
  'Đánh dấu',
  'Sự kiện',
];

const ProfileTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Bài viết');

  return (
    <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-6xl mx-auto flex overflow-x-auto px-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative py-4 px-6 text-sm font-semibold whitespace-nowrap transition-colors duration-200
              ${activeTab === tab ? 'text-violet-600' : 'text-gray-500 hover:text-violet-600'}`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-1/4 w-1/2 h-0.5 bg-violet-600 rounded-t" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileTabs;
