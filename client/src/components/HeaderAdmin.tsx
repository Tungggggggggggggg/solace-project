'use client';

import { ReactElement } from 'react';
import Image from 'next/image';
import { FiBell, FiUser } from 'react-icons/fi';

export default function HeaderAdmin({ onOpenAuth }: { onOpenAuth: (tab: 'login' | 'signup') => void }): ReactElement {
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