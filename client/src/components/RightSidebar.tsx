// Component RightSidebar hiển thị danh sách bạn bè
interface RightSidebarProps {
  theme?: 'inspiring' | 'reflective';
}

const RightSidebar = ({ theme = 'inspiring' }: RightSidebarProps) => {
  // Danh sách bạn bè mẫu
  const friends = ["NAME", "NAME", "NAME", "NAME", "NAME"];

  return (
    // Container cho sidebar phải
    <div className={`w-56 p-6 rounded-l-[50px] flex flex-col items-center ${theme === 'reflective' ? 'bg-[#D5BDAF]' : 'bg-[#AECBEB]'}`}>
      {/* Tiêu đề */}
      <div className="text-center mb-6">
        <h2 className="text-black font-bold text-xl font-[Inter] mb-2">Friend</h2>
        <hr className="border-black/20 mb-4" />
      </div>
      {/* Danh sách bạn bè */}
      <div className="flex flex-col w-full">
        {friends.map((friend, index) => (
          <div key={index}>
            <div className="flex items-center gap-3 w-full px-2 py-2">
              {/* Avatar và trạng thái online */}
              <div className="relative w-10 h-10">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-500 text-2xl">person</span>
                </div>
                <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              {/* Tên bạn bè */}
              <span className="text-black font-medium font-[Inter]">{friend}</span>
            </div>
            {/* Đường phân cách giữa các bạn bè */}
            {index < friends.length - 1 && (
              <hr className="border-black/30 mx-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RightSidebar;