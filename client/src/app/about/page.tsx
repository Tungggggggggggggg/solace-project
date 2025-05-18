"use client";

// Import các component và hook cần thiết
import Header from "../../components/Header";
import LeftSidebar from "../../components/LeftSidebar";
import { useRouter } from "next/navigation";
import React from "react";

// Component AboutPage hiển thị trang giới thiệu về Solace
const AboutPage = () => {
  // Khởi tạo router để điều hướng
  const router = useRouter();

  return (
    // Container chính với gradient background
    <div className="min-h-screen flex flex-col w-full bg-gradient-to-br from-[#E1ECF7] to-[#AECBEB]">
      {/* Header component hiển thị logo và thanh tìm kiếm */}
      <Header />
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

            {/* Nội dung chính được đặt trong một div có z-index cao để tránh bị che bởi các vòng tròn trang trí */}
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
                <h1 className="text-5xl font-extrabold text-blue-400 mb-4">Solace</h1>
                <p className="text-xl text-black">Tìm hiểu thêm về sứ mệnh và giá trị của chúng tôi</p>
              </header>

              {/* Nội dung giới thiệu được chia thành các section */}
              <div className="space-y-6">
                {/* Section sứ mệnh */}
                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-blue-400">
                    <span className="material-symbols-outlined text-black">flag</span>
                    Sứ mệnh
                  </h2>
                  <p className="text-black">
                    Solace là nền tảng xã hội nơi mọi người có thể chia sẻ cảm xúc, câu chuyện cá nhân,
                    lan tỏa năng lượng tích cực và đồng cảm. Chúng tôi hướng tới xây dựng một cộng đồng
                    an toàn, thân thiện, nơi mọi người được lắng nghe và thấu hiểu.
                  </p>
                </section>
                {/* Section mục tiêu */}
                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-blue-400">
                    <span className="material-symbols-outlined text-black">target</span>
                    Mục tiêu
                  </h2>
                  <ul className="list-disc pl-6 text-black space-y-2">
                    <li>Tạo không gian an toàn để mọi người bộc lộ cảm xúc, hỗ trợ ẩn danh, không lo bị đánh giá.</li>
                    <li>Xây dựng cộng đồng đồng cảm, giúp giảm căng thẳng và lan tỏa năng lượng tích cực.</li>
                    <li>Nhắm đến người trẻ (Gen Z, Millennials) và thị trường quốc tế.</li>
                  </ul>
                </section>
                {/* Section slogan */}
                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-blue-400">
                    <span className="material-symbols-outlined text-black">lightbulb</span>
                    Slogan
                  </h2>
                  <p className="italic text-black">
                    Share Your Heart, Find Your Peace <span className="text-gray-600">(Chia sẻ trái tim, tìm bình yên)</span>
                  </p>
                </section>
                {/* Section giá trị cốt lõi */}
                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-blue-400">
                    <span className="material-symbols-outlined text-black">verified</span>
                    Giá trị cốt lõi
                  </h2>
                  <ul className="list-disc pl-6 text-black space-y-2">
                    <li>Đồng cảm và tôn trọng sự đa dạng cảm xúc.</li>
                    <li>Bảo mật và quyền riêng tư cho người dùng.</li>
                    <li>Khuyến khích sự tích cực, truyền cảm hứng.</li>
                    <li>Phát triển cộng đồng bền vững, hỗ trợ lẫn nhau.</li>
                  </ul>
                </section>
                {/* Section đội ngũ phát triển */}
                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-blue-400">
                    <span className="material-symbols-outlined text-black">group</span>
                    Đội ngũ phát triển
                  </h2>
                  <p className="text-black">
                    Solace được xây dựng bởi một nhóm bạn trẻ đam mê công nghệ, tâm lý học và mong muốn
                    tạo ra giá trị tích cực cho xã hội. Chúng tôi luôn lắng nghe ý kiến đóng góp để hoàn
                    thiện sản phẩm tốt hơn mỗi ngày.
                  </p>
                </section>
                {/* Section liên hệ */}
                <section>
                  <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-blue-400">
                    <span className="material-symbols-outlined text-black">email</span>
                    Liên hệ
                  </h2>
                  <p className="text-black">
                    Email: <a href="mailto:support@solace.com" className="text-blue-600 underline">support@solace.com</a>
                  </p>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AboutPage;