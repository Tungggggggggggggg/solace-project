"use client";

// Import thư viện và hook cần thiết
import clsx from "clsx";
import { useState } from "react";

// Component Tabs hiển thị các tab chuyển đổi giữa các loại bài đăng
const Tabs = () => {
  // State để quản lý tab đang được chọn
  const [active, setActive] = useState(0);

  return (
    // Container cho tabs
    <div className="flex flex-col items-center w-full">
      <div className="flex items-center justify-center gap-0 mb-1">
        {/* Tab Inspiring */}
        <button
          onClick={() => setActive(0)}
          className={clsx(
            "px-8 py-2 text-lg font-bold font-[Inter] rounded-[16px] transition-all duration-150",
            active === 0
              ? "bg-[#B7CCEC] text-black shadow"
              : "bg-transparent text-black hover:bg-[#e1ecf7] hover:font-extrabold"
          )}
        >
          Inspiring
        </button>
        {/* Dấu phân cách */}
        <span className="mx-4 text-2xl text-black select-none">|</span>
        {/* Tab Reflective */}
        <button
          onClick={() => setActive(1)}
          className={clsx(
            "px-8 py-2 text-lg font-bold font-[Inter] rounded-[16px] transition-all duration-150",
            active === 1
              ? "bg-[#B7CCEC] text-black shadow"
              : "bg-transparent text-black hover:bg-[#e1ecf7] hover:font-extrabold"
          )}
        >
          Reflective
        </button>
      </div>
      {/* Thanh gạch chân */}
      <div className="w-full flex justify-center">
        <div className="h-1 w-[340px] bg-black rounded-full" />
      </div>
    </div>
  );
};

export default Tabs;