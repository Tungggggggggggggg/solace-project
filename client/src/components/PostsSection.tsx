import React from 'react';

const PostsSection: React.FC = () => {
  const posts = [
    {
      name: 'Nguyễn Thị Mai',
      avatar: 'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474072oeB/anh-dai-dien-buon-ngau_023706184.jpg',
      time: '2 giờ trước',
      audience: 'public',
      content:
        'Chào mọi người! Đây là một số bức ảnh mình mới chụp trong chuyến đi Đà Lạt vừa rồi. Cảnh đẹp quá trời luôn! 😍\n\nMình đã thử nghiệm một số kỹ thuật chụp ảnh mới, các bạn cho mình xin ý kiến nhé!\n\n#DaLat #Travel #Photography',
      image: 'https://source.unsplash.com/random/800x500?dalat',
      liked: true,
      likes: 128,
      comments: 24,
      shares: 5,
    },
    {
      name: 'Nguyễn Thị Mai',
      avatar: 'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474072oeB/anh-dai-dien-buon-ngau_023706184.jpg',
      time: '1 ngày trước',
      audience: 'group',
      content:
        'Mình vừa hoàn thành xong dự án thiết kế nhận diện thương hiệu mới cho một quán cafe...\n\n#Design #Branding #GraphicDesign',
      image: 'https://source.unsplash.com/random/800x500?design',
      liked: false,
      likes: 89,
      comments: 15,
      shares: 2,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow space-y-6">
      {posts.map((post, idx) => (
        <div
          key={idx}
          className="p-5 rounded-xl shadow hover:shadow-lg hover:-translate-y-1 transition bg-white dark:bg-gray-900"
        >
          <div className="flex items-center mb-4">
            <img
              src={post.avatar}
              alt={post.name}
              className="w-12 h-12 rounded-full object-cover mr-4"
            />
            <div className="flex-1">
              <div className="font-semibold">{post.name}</div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                {post.time} ·{' '}
                <span className="material-symbols-outlined text-base">
                  {post.audience === 'group' ? 'group' : 'public'}
                </span>
              </div>
            </div>
            <div className="cursor-pointer w-9 h-9 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
              <span className="material-symbols-outlined">more_horiz</span>
            </div>
          </div>
          <div className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-300 mb-3">
            {post.content}
          </div>
          {post.image && (
            <img
              src={post.image}
              alt=""
              className="w-full rounded-lg object-cover mb-3 max-h-[500px] cursor-pointer hover:scale-105 transition-transform"
            />
          )}
          <div className="flex justify-between text-sm text-gray-500 border-t pt-3">
            <div className="flex items-center gap-1">
              <span className={`material-symbols-outlined text-pink-400`}>
                {post.liked ? 'favorite' : 'favorite_border'}
              </span>
              {post.likes}
            </div>
            <div>{post.comments} bình luận · {post.shares} chia sẻ</div>
          </div>
          <div className="flex justify-around text-sm font-semibold mt-3 text-gray-600 dark:text-gray-400">
            <div className={`flex items-center gap-1 cursor-pointer ${post.liked ? 'text-pink-500' : ''}`}>
              <span className="material-symbols-outlined">favorite</span>
              Thích
            </div>
            <div className="flex items-center gap-1 cursor-pointer">
              <span className="material-symbols-outlined">chat_bubble</span>
              Bình luận
            </div>
            <div className="flex items-center gap-1 cursor-pointer">
              <span className="material-symbols-outlined">share</span>
              Chia sẻ
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostsSection;
