// Import hook cần thiết từ Next.js
import { useRouter, usePathname } from "next/navigation";

// Component LeftSidebar hiển thị thanh điều hướng bên trái
interface LeftSidebarProps {
  theme?: 'inspiring' | 'reflective';
}

const LeftSidebar = ({ theme = 'inspiring' }: LeftSidebarProps) => {
  // Khởi tạo router và pathname để điều hướng và xác định trang hiện tại
  const router = useRouter();
  const pathname = usePathname();
  // Danh sách các icon điều hướng
  const icons = [
    { name: "group", route: "/" }, /* Trang chính */
    { name: "groups", route: "/" }, /* Nhóm */
    { name: "help", route: "/faq" }, /* FAQ */
    { name: "info", route: "/about" }, /* Giới thiệu */
  ];

  const iconColor = theme === 'reflective' ? '#8B5E3C' : '#2563eb';
  const activeBg = theme === 'reflective' ? 'bg-[#E3D5CA] border-[#8B5E3C]' : 'bg-blue-100 border-blue-700';
  const activeText = theme === 'reflective' ? 'text-[#8B5E3C]' : 'text-blue-700';
  const inactiveText = theme === 'reflective' ? 'text-[#8B5E3C]' : 'text-blue-600';

  return (
    // Container cho sidebar trái
    <div className={`w-24 rounded-r-[50px] flex flex-col items-center mt-8 shadow-lg py-8 ${theme === 'reflective' ? 'bg-[#D5BDAF]' : 'bg-[#AECBEB]'}`}>
      <div className="flex flex-col gap-8">
        {icons.map((icon, idx) => (
          // Nút điều hướng cho mỗi icon
          <button
            key={idx}
            onClick={() => router.push(icon.route)}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow transition-all duration-150 border-2
              ${pathname === icon.route
                ? activeBg + ' scale-110'
                : 'bg-white hover:bg-blue-50 hover:scale-105 border-transparent'}
            `}
            aria-label={icon.name}
          >
            <span className={`material-symbols-outlined ${pathname === icon.route ? activeText : inactiveText} text-3xl`} style={idx < 2 && theme === 'reflective' ? { color: '#8B5E3C' } : {}}>{icon.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LeftSidebar;