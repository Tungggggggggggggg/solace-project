import React from 'react';

// Dữ liệu mẫu cho phần "Giới thiệu"
const aboutItems = [
  { iconName: 'work', label: 'Công việc', value: 'Nhà thiết kế đồ họa tại Công ty Nova' },
  { iconName: 'school', label: 'Học vấn', value: 'Đại học Mỹ thuật Công nghiệp Hà Nội (2015-2019)' },
  { iconName: 'location_on', label: 'Nơi sống', value: 'Hà Nội, Việt Nam' },
  { iconName: 'home', label: 'Quê quán', value: 'Đà Nẵng, Việt Nam' },
  { iconName: 'calendar_today', label: 'Ngày tham gia', value: '15 tháng 6, 2022' },
  { iconName: 'female', label: 'Giới tính', value: 'Nữ' },
];

// Dữ liệu mẫu cho phần "Kỹ năng"
const skills = [
  { name: 'Thiết kế đồ họa', percent: 90 },
  { name: 'UI/UX Design', percent: 85 },
  { name: 'Nhiếp ảnh', percent: 80 },
  { name: 'Photoshop', percent: 95 },
];

// Component hiển thị phần "Giới thiệu" trên trang cá nhân
const AboutSection: React.FC = () => {
  return (
    // Container chính của phần giới thiệu
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
      {/* Tiêu đề phần Giới thiệu */}
      <h2 className="text-violet-600 text-xl font-bold flex items-center gap-2 mb-4">
        {/* Icon và chữ "Giới thiệu" */}
        <span className="material-symbols-outlined" style={{ fontSize: 30 }}>info</span> Giới thiệu
      </h2>
      {/* Hiển thị các mục giới thiệu từ aboutItems */}
      {aboutItems.map((item, idx) => (
        // Mỗi mục giới thiệu
        <div key={idx} className="border-b border-dashed border-gray-200 pb-4 mb-4">
          {/* Icon và nhãn của mục */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="material-symbols-outlined" style={{ fontSize: 25 }}>{item.iconName}</span> {item.label}
          </div>
          {/* Giá trị của mục */}
          <div className="pl-5 font-medium mt-1">{item.value}</div>
        </div>
      ))}

      {/* Tiêu đề phần Liên kết xã hội */}
      <h2 className="text-violet-600 text-xl font-bold flex items-center gap-2 mt-6 mb-4">
        <span className="material-symbols-outlined" style={{ fontSize: 25 }}>link</span> Liên kết xã hội
      </h2>
      <div className="flex flex-wrap gap-3">
        {['facebook', 'instagram', 'twitter', 'linkedin', 'behance', 'dribbble'].map((icon) => (
          // Link cho mỗi icon
          <a
            key={icon}
            href="#"
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gradient-to-br hover:from-violet-500 hover:to-pink-400 text-gray-500 hover:text-white"
            aria-label={icon}
          >
            <i className={`fab fa-${icon}`} />
          </a>
        ))}
      </div>

      {/* Tiêu đề phần Kỹ năng */}
      <h2 className="text-violet-600 text-xl font-bold flex items-center gap-2 mt-6 mb-4">
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>star</span> Kỹ năng
      </h2>
      <div className="space-y-4">
        {/* Hiển thị từng kỹ năng */}
        {skills.map((skill, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-sm">
              <span>{skill.name}</span>
              <span>{skill.percent}%</span>
            </div>
            {/* Thanh tiến trình kỹ năng */}
            <div className="h-2 bg-gray-200 rounded">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-pink-400 rounded"
                style={{ width: `${skill.percent}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutSection;
