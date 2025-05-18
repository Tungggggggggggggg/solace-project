"use client";

// Import component và hook cần thiết
import Image from "next/image";

// Định nghĩa interface cho props của Header
interface HeaderProps {
  onOpenAuth?: (tab: 'login' | 'signup') => void; /* Hàm mở modal đăng nhập/đăng ký */
}

// Component Header hiển thị logo, thanh tìm kiếm và nút đăng nhập/đăng ký
const Header = ({ onOpenAuth }: HeaderProps) => {
  return (
    // Header container
    <header className="flex items-center justify-between w-full h-20 px-16 bg-[#AECBEB]">
      {/* Logo */}
      <div className="flex items-center h-12 w-32">
        <Image
          src="/logo.png"
          alt="Solace Logo"
          width={128}
          height={48}
          className="object-contain"
          priority
        />
      </div>
      {/* Thanh tìm kiếm */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="flex w-full rounded-full border border-black bg-white overflow-hidden">
          <input
            type="text"
            placeholder="Search for anything ..."
            className="flex-1 px-5 py-2 bg-white text-base font-normal placeholder:text-gray-400 focus:outline-none border-none rounded-none text-black"
          />
          <div
            className="flex items-center justify-center px-5 bg-[#AECBEB] border-l border-black"
            style={{ minHeight: '40px' }}
          >
            {/* Icon tìm kiếm */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="black" className="w-6 h-6">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="black" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
      {/* Nút đăng nhập/đăng ký và thông tin người dùng */}
      <div className="flex items-center space-x-4">
        <button
          className="px-4 py-2 rounded-full bg-white text-black font-semibold border border-black/20 hover:bg-gray-100 transition"
          onClick={() => onOpenAuth && onOpenAuth('login')}
        >
          Đăng nhập
        </button>
        <button
          className="px-4 py-2 rounded-full bg-[#AECBEB] text-black font-semibold border border-black/20 hover:bg-[#B7CCEC] transition"
          onClick={() => onOpenAuth && onOpenAuth('signup')}
        >
          Đăng ký
        </button>
        {/* Tên người dùng */}
        <span className="text-gray-800 font-semibold text-base">NAME</span>
        {/* Avatar người dùng */}
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          <span className="material-symbols-outlined text-gray-500 text-3xl">person</span>
        </div>
      </div>
    </header>
  );
};

export default Header;