import React from 'react';

const PhotosSection: React.FC = () => {
  const photos = [
    { url: 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4no6d9Ym26d4BPQA07sKyLEfq--AkIRx1XSxYZAwNfoCpfPTGFgk3gR0J6X45sJpEnKQOeQhjd0fumOx_nrDz3mNSBxPCB1C-xQlYAaF8niiykKsNeTb3G9ADn5ArQoV2uzWscjE_Q=w540-h312-n-k-no', label: 'Đà Lạt 2023' },
    { url: 'https://ik.imagekit.io/tvlk/blog/2023/07/bai-bien-nha-trang-8-1024x576.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2', label: 'Biển Nha Trang' },
    { url: 'https://vcdn1-vnexpress.vnecdn.net/2019/06/26/top-1561543182-8962-1561543223.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=mKX6s7Dni3W691GdDV0w7Q', label: 'Fansipan' },
    { url: 'https://cellphones.com.vn/sforum/wp-content/uploads/2024/01/dia-diem-du-lich-o-ha-noi-1.jpg', label: 'Hà Nội' },
    { url: 'https://images.hcmcpv.org.vn/res/news/2023/01/24-01-2023-doc-dao-van-hoa-am-thuc-viet-ngay-tet-4CBDB0B0.jpg', label: 'Ẩm thực' },
    { url: 'https://hotrothutuc.com/uploads/images/croped/doi-tuong-bao-ho-quyen-tac-gia-tac-pham-van-hoc-nghe-thuat-dan-gian-870x500.jpg', label: 'Tranh đông hồ' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-violet-600 text-xl font-bold flex items-center gap-2">
          <span className="material-symbols-outlined">photo_library</span> Ảnh
        </h2>
        <span className="text-sm font-semibold text-violet-600 cursor-pointer hover:underline">Xem tất cả</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo, idx) => (
          <div
            key={idx}
            className="aspect-square overflow-hidden rounded-lg relative group cursor-pointer"
          >
            <img
              src={photo.url}
              alt={photo.label}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            />
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-2 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              {photo.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotosSection;
