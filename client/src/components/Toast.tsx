"use client";

import React from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isClosing, setIsClosing] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const toastConfig = {
    success: {
      bgColor: 'bg-green-400',
      icon: 'check_circle',
      ringColor: 'ring-green-300',
      textColor: 'text-green-900'
    },
    error: {
      bgColor: 'bg-red-400',
      icon: 'error',
      ringColor: 'ring-red-300',
      textColor: 'text-red-900'
    },
    warning: {
      bgColor: 'bg-yellow-400',
      icon: 'warning',
      ringColor: 'ring-yellow-300',
      textColor: 'text-yellow-900'
    },
    info: {
      bgColor: 'bg-blue-400',
      icon: 'info',
      ringColor: 'ring-blue-300',
      textColor: 'text-blue-900'
    }
  };

  const config = toastConfig[type];

  return (
    <div 
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 min-w-[320px] max-w-[90vw] transition-all duration-300 ${
        isClosing 
          ? 'opacity-0 -translate-y-4' 
          : 'opacity-100 translate-y-0'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div 
        className={`
          flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg 
          ${config.bgColor} 
          ring-4 ${config.ringColor}
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
