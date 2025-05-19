'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ReactElement } from 'react';
import { FiBell, FiUser, FiSearch } from 'react-icons/fi';

export default function HeaderAdmin({ onOpenAuth }: { onOpenAuth: (tab: 'login' | 'signup') => void }): ReactElement {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className=" h-16 bg-[#AECBEB] px-6 flex items-center justify-between fixed top-0 left-64 right-0 z-30 ">
      {/* Logo bên trái */}
      <div className="flex items-center gap-4">
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
      </div>

      {/* Thanh tìm kiếm ở giữa */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-96">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#AECBEB] bg-white"
          />
        </div>
      </div>

      {/* Biểu tượng bên phải */}
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <FiBell className="w-6 h-6 text-gray-600" />
        </button>
        <button onClick={() => onOpenAuth('login')} className="p-2 hover:bg-gray-100 rounded-full">
          <FiUser className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </header>
  );
}