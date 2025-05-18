"use client";

// Import các component và hook cần thiết
import LeftSidebar from "../../components/LeftSidebar";
import Header from "../../components/Header";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import AuthModal from "../../components/AuthModal";

// Component FAQPage hiển thị trang câu hỏi thường gặp
const FAQPage = () => {
  // Khởi tạo router để điều hướng
  const router = useRouter();
  // State để kiểm soát hiển thị modal đăng nhập/đăng ký
  const [showAuth, setShowAuth] = useState(false);
  // State để xác định tab mặc định của modal (login hoặc signup)
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  // State để theo dõi câu hỏi đang được mở
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  // Hàm mở modal với tab được chỉ định
  const handleOpenAuth = (tab: 'login' | 'signup') => {
    setAuthTab(tab);
    setShowAuth(true);
  };

  // Dữ liệu FAQ được lưu trữ dưới dạng mảng các object
  const faqData = [
    {
      question: "Solace là gì?",
      answer: "Solace là nền tảng mạng xã hội giúp bạn chia sẻ cảm xúc, câu chuyện cá nhân, lan tỏa năng lượng tích cực và đồng cảm với cộng đồng. Bạn có thể đăng tải những khoảnh khắc vui, buồn, truyền cảm hứng hoặc tìm kiếm sự đồng cảm từ người khác.",
      icon: "favorite"
    },
    {
      question: "Tôi có thể sử dụng Solace miễn phí không?",
      answer: "Hoàn toàn miễn phí! Bạn chỉ cần đăng ký tài khoản để bắt đầu chia sẻ và kết nối với cộng đồng.",
      icon: "card_giftcard"
    },
    {
      question: "Solace bảo vệ quyền riêng tư của tôi như thế nào?",
      answer: "Chúng tôi cam kết bảo mật thông tin cá nhân của bạn. Bạn có thể chia sẻ ẩn danh, kiểm soát ai có thể xem bài viết và luôn có quyền xóa dữ liệu bất cứ lúc nào.",
      icon: "security"
    },
    {
      question: "Làm sao để tìm kiếm hoặc kết bạn với người khác?",
      answer: "Bạn có thể sử dụng thanh tìm kiếm để tìm bạn bè, chủ đề hoặc bài viết. Hệ thống gợi ý bạn bè dựa trên sở thích và hoạt động của bạn.",
      icon: "group_add"
    },
    {
      question: "Tôi gặp sự cố hoặc muốn góp ý, liên hệ ở đâu?",
      answer: "Bạn có thể gửi phản hồi qua mục \"Liên hệ\" trên website hoặc email trực tiếp cho đội ngũ hỗ trợ của Solace. Chúng tôi luôn lắng nghe và phản hồi nhanh chóng.",
      icon: "support_agent"
    },
    {
      question: "Tôi có thể chia sẻ những nội dung gì?",
      answer: "Bạn có thể chia sẻ cảm xúc, câu chuyện cá nhân, hình ảnh, video, hoặc những điều truyền cảm hứng, khó khăn trong cuộc sống. Chúng tôi khuyến khích nội dung tích cực, đồng cảm và tôn trọng lẫn nhau.",
      icon: "diversity_3"
    }
  ];

  return (
    // Container chính với gradient background
    <div className="min-h-screen flex flex-col w-full bg-gradient-to-br from-[#E1ECF7] to-[#AECBEB]">
      {/* Header component với khả năng mở modal đăng nhập/đăng ký */}
      <Header onOpenAuth={handleOpenAuth} />
      {/* Modal xác thực (đăng nhập/đăng ký) */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultTab={authTab} />}
      {/* Layout chính với sidebar và nội dung */}
      <div className="flex flex-1 w-full mt-4 items-start">
        {/* Sidebar trái hiển thị các icon điều hướng */}
        <LeftSidebar />
        {/* Nội dung chính của trang */}
        <main className="flex-1 flex flex-col items-center px-6 md:px-12 pb-16">
          <div className="w-full max-w-4xl relative">
            {/* Các vòng tròn trang trí mờ để tăng tính thẩm mỹ */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl -mr-48 -mt-24" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl -ml-48 -mb-24" />

            {/* Nội dung chính được đặt trong một div có z-index cao */}
            <div className="relative z-10">
              {/* Nút điều hướng quay về trang chủ */}
              <nav className="mb-12">
                <button
                  onClick={() => router.push("/")}
                  className="inline-flex items-center gap-2 text-gray-700 hover:text-blue-700 font-medium transition-all hover:-translate-x-1 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  Về trang chủ
                </button>
              </nav>

              {/* Tiêu đề chính của trang */}
              <header className="mb-16 text-center">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
                  Câu hỏi thường gặp
                  <span className="text-blue-400"> FAQ</span>
                </h1>
                <p className="text-xl text-gray-600">Tất cả những điều bạn cần biết về Solace</p>
              </header>

              {/* FAQ Accordion hiển thị danh sách câu hỏi và câu trả lời */}
              <div className="space-y-6">
                {faqData.map((faq, index) => (
                  <div
                    key={index}
                    className="backdrop-blur-sm bg-white/60 rounded-2xl transition-all duration-300"
                  >
                    {/* Nút để mở/đóng câu trả lời */}
                    <button
                      onClick={() => setActiveQuestion(activeQuestion === index ? null : index)}
                      className="w-full px-8 py-6 flex items-center justify-between text-left group hover:bg-white/80 rounded-2xl transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-blue-600 text-3xl group-hover:scale-110 transition-transform">{faq.icon}</span>
                        <h2 className="text-xl font-bold text-gray-800">{faq.question}</h2>
                      </div>
                      <span
                        className={`material-symbols-outlined text-blue-600 transition-transform duration-300 ${
                          activeQuestion === index ? 'rotate-180' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                    {/* Nội dung câu trả lời, hiển thị khi được chọn */}
                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        activeQuestion === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <p className="px-8 pb-6 pl-20 text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer với thông tin liên hệ */}
              <footer className="mt-16 text-center">
                <div className="inline-flex items-center gap-8 px-8 py-4 bg-white/60 backdrop-blur-sm rounded-full">
                  <a href="mailto:support@solace.com" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <span className="material-symbols-outlined">mail</span>
                    <span>support@solace.com</span>
                  </a>
                  <div className="h-6 w-px bg-gray-300"></div>
                  <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <span className="material-symbols-outlined">chat</span>
                    <span>Live Chat</span>
                  </a>
                </div>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FAQPage;