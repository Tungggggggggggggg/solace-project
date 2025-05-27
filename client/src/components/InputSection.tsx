// Component InputSection hiển thị phần nhập liệu để tạo bài đăng mới
const InputSection = ({ onOpenModal, theme }: { onOpenModal?: () => void, theme?: string }) => {
  const bgColor = theme === 'reflective' ? '#E3D5CA' : '#fff';
  const hoverBg = theme === 'reflective' ? '#E3D5CA' : '#B7CCEC';
  return (
    // Container cho phần nhập liệu
    <div style={{ background: bgColor }} className="rounded-[20px] border border-black/30 max-w-xl mx-auto my-6 px-6 py-4 shadow-sm flex flex-col gap-3">
      {/* Khu vực nhập văn bản */}
      <div className="flex items-center gap-3 mb-2">
        {/* Avatar placeholder */}
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="material-symbols-outlined text-black text-2xl">person</span>
        </div>
        <input
          type="text"
          placeholder="Any joyful moment today?..."
          className="flex-1 px-4 py-2 rounded-full border border-black/30 bg-white text-base font-normal placeholder:text-gray-400 focus:outline-none text-black"
          readOnly
          onClick={onOpenModal}
        />
      </div>
      {/* Các công cụ hỗ trợ đăng bài */}
      <div className="flex items-center justify-between px-2 mt-1">
        <div className="flex gap-2">
          {/* Icon thêm hình ảnh */}
          <span className="material-symbols-outlined text-black text-2xl cursor-pointer rounded-md transition-all duration-150" style={{ background: undefined }} onMouseOver={e => (e.currentTarget.style.background = hoverBg)} onMouseOut={e => (e.currentTarget.style.background = '')}>image</span>
          {/* Icon ghi âm */}
          <span className="material-symbols-outlined text-black text-2xl cursor-pointer rounded-md transition-all duration-150" style={{ background: undefined }} onMouseOver={e => (e.currentTarget.style.background = hoverBg)} onMouseOut={e => (e.currentTarget.style.background = '')}>mic</span>
          {/* Icon thêm cảm xúc */}
          <span className="material-symbols-outlined text-black text-2xl cursor-pointer rounded-md transition-all duration-150" style={{ background: undefined }} onMouseOver={e => (e.currentTarget.style.background = hoverBg)} onMouseOut={e => (e.currentTarget.style.background = '')}>mood</span>
          {/* Icon tùy chọn khác */}
          <span className="material-symbols-outlined text-black text-2xl cursor-pointer rounded-md transition-all duration-150" style={{ background: undefined }} onMouseOver={e => (e.currentTarget.style.background = hoverBg)} onMouseOut={e => (e.currentTarget.style.background = '')}>more_horiz</span>
        </div>
        {/* Icon gửi bài đăng */}
        <span className="material-symbols-outlined text-black text-2xl cursor-pointer rounded-md transition-all duration-150" style={{ background: undefined }} onMouseOver={e => (e.currentTarget.style.background = hoverBg)} onMouseOut={e => (e.currentTarget.style.background = '')}>send</span>
      </div>
    </div>
  );
};

export default InputSection;