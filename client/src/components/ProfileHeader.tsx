import React from 'react';

const ProfileHeader: React.FC = () => {
  return (
    <div className="relative mb-8 overflow-hidden">
      <div className="h-[400px] relative overflow-hidden rounded-b-2xl">
        <img
          src="https://marketplace.canva.com/EAE96UKaJP0/2/0/1600w/canva-%E1%BA%A3nh-c%E1%BA%AFt-d%C3%A1n-ngh%E1%BB%87-thu%E1%BA%ADt-l%E1%BB%8Bch-ghi-nh%E1%BB%9B%2C-h%C3%ACnh-n%E1%BB%81n-m%C3%A1y-t%C3%ADnh-sMZ9vopIaog.jpg"
          alt="Cover"
          className="w-full h-full object-cover transition-all duration-500"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/10 to-black/30" />
      </div>

      <div className="absolute top-6 right-6 flex gap-3 z-10">
        {["share", "bookmark", "settings"].map((icon, idx) => (
          <button
            key={idx}
            title={icon}
            className="w-11 h-11 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow hover:bg-violet-600 hover:text-white transition-all"
          >
            <span className="material-symbols-outlined">{icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileHeader;
