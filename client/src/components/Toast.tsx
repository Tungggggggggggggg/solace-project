"use client";

import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

// Định nghĩa kiểu props cho Toast
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

// Component Toast: Hiển thị thông báo trạng thái với hiệu ứng động và màu sắc theo loại thông báo
const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const toastRef = useRef<HTMLDivElement>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Hiệu ứng xuất hiện khi Toast được mount
  useEffect(() => {
    if (toastRef.current) {
      gsap.fromTo(
        toastRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' }
      );
    }
    // Tự động đóng Toast sau 3 giây
    closeTimeout.current = setTimeout(() => setIsClosing(true), 3000);
    return () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, []);

  // Hiệu ứng biến mất khi Toast đóng
  useEffect(() => {
    if (isClosing && toastRef.current) {
      gsap.to(toastRef.current, {
        opacity: 0,
        y: -24,
        scale: 0.92,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: onClose,
      });
    }
  }, [isClosing, onClose]);

  // Cấu hình màu sắc, icon, border cho từng loại Toast
  const toastConfig = {
    success: {
      bgColor: 'bg-green-100',
      icon: 'check_circle',
      borderColor: 'border-green-400',
      textColor: 'text-green-800'
    },
    error: {
      bgColor: 'bg-red-100',
      icon: 'error',
      borderColor: 'border-red-400',
      textColor: 'text-red-800'
    },
    warning: {
      bgColor: 'bg-yellow-100',
      icon: 'warning',
      borderColor: 'border-yellow-400',
      textColor: 'text-yellow-800'
    },
    info: {
      bgColor: 'bg-blue-100',
      icon: 'info',
      borderColor: 'border-blue-400',
      textColor: 'text-blue-800'
    }
  };

  const config = toastConfig[type];

  return (
    <div
      ref={toastRef}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] min-w-[320px] max-w-[90vw]`}
      role="alert"
      aria-live="assertive"
    >
      <div
        className={`
          flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg
          ${config.bgColor}
          border ${config.borderColor}
          backdrop-blur-sm bg-opacity-90
        `}
      >
        <span className={`material-symbols-outlined ${config.textColor} text-2xl`}>
          {config.icon}
        </span>
        <p className={`font-medium text-base ${config.textColor}`}>{message}</p>
        <button
          onClick={() => setIsClosing(true)}
          className="ml-auto text-black/60 hover:text-black transition-colors"
          aria-label="Đóng thông báo"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  );
};

export type { ToastProps };
export default Toast;
