'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { MaterialIcon } from './MaterialIcon';

type PrivacyOption = 'public' | 'friends' | 'onlyme';

const privacyOptions: Record<PrivacyOption, { icon: string; text: string; desc: string }> = {
  public: { icon: 'public', text: 'Công khai', desc: 'Mọi người trên và ngoài Nova' },
  friends: { icon: 'people', text: 'Bạn bè', desc: 'Chỉ bạn bè của bạn' },
  onlyme: { icon: 'lock', text: 'Chỉ mình tôi', desc: 'Chỉ bạn có thể xem' },
};

export default function CreatePostModal() {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<PrivacyOption>('public');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAddImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    if (images.length + e.target.files.length > 9) {
      alert('Bạn chỉ có thể tải lên tối đa 9 ảnh');
      return;
    }
    const files = Array.from(e.target.files).map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    const newList = [...images];
    newList.splice(index, 1);
    setImages(newList);
  };

  const isValid = content.trim() !== '' || images.length > 0;

  const handlePost = () => {
    console.log({ content, images, privacy });
    alert('Bài viết đã được đăng!');
    setContent('');
    setImages([]);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50 font-inter text-[#1c1e21]">
      <div className="bg-white w-full max-w-xl rounded-[20px] overflow-hidden shadow-lg animate-[modalFadeIn_0.4s_ease-out]">
        <div className="flex justify-between items-center px-8 py-6 border-b bg-gradient-to-r from-white to-[#f8f9fd]">
          <h3 className="text-[22px] font-bold text-[#1c1e21] tracking-tight">Tạo bài viết</h3>
          <button
            className="text-[#606770] text-2xl hover:text-[--primary] hover:scale-110 hover:rotate-90 transition"
            onClick={() => alert('Modal sẽ đóng trong ứng dụng thực tế')}
          >
            ×
          </button>
        </div>

        <div className="px-8 py-8 bg-white">
          <div className="flex items-center mb-6">
            <img
              src="https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474072oeB/anh-dai-dien-buon-ngau_023706184.jpg"
              className="w-12 h-12 rounded-full border-2 border-[--primary-light] object-cover mr-4"
              alt="avatar"
            />
            <div>
              <div className="font-semibold">Nguyễn Thị Mai</div>
              <div
                onClick={() => setShowPrivacyModal(true)}
                className="flex items-center bg-[--primary-light] px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-purple-100 transition mt-1"
              >
                <MaterialIcon icon={privacyOptions[privacy].icon} className="text-[--primary] text-base mr-1" />
                <span className="font-medium text-[#1c1e21]">{privacyOptions[privacy].text}</span>
                <MaterialIcon icon="arrow_drop_down" className="text-[#606770] ml-1" />
              </div>
            </div>
          </div>

          <textarea
            placeholder="Bạn đang nghĩ gì?"
            className="w-full min-h-[160px] border border-black/10 bg-[#f0f2f5] p-4 rounded-xl text-base resize-none focus:outline-none focus:ring-2 focus:ring-[--primary-light] mb-6 text-[#1c1e21]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {images.map((img, i) => (
                <div key={i} className="relative rounded-xl aspect-square overflow-hidden shadow group">
                  <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-7 h-7 text-white bg-black/60 rounded-full flex items-center justify-center hover:bg-[--accent] transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <input type="file" hidden ref={fileRef} accept="image/*" multiple onChange={handleAddImage} />
          {images.length < 1 && (
            <div
              className="text-center py-8 px-6 bg-[#f0f2f5] border-2 border-dashed border-black/10 rounded-xl cursor-pointer hover:border-[--primary] hover:bg-[--primary-light] transition mb-6"
              onClick={() => fileRef.current?.click()}
            >
              <MaterialIcon icon="photo_camera" className="text-[--primary] text-4xl mb-2" />
              <div className="font-semibold">Thêm ảnh</div>
              <div className="text-sm text-[#606770]">Kéo thả hoặc chọn từ thiết bị</div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center font-semibold mb-3">
              <MaterialIcon icon="emoji_emotions" className="text-[--primary] mr-2" />
              <span>Thêm vào bài viết</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                ['mood', 'Cảm xúc'],
                ['person', 'Gắn thẻ'],
                ['location_on', 'Vị trí'],
                ['poll', 'Bình chọn'],
              ].map(([icon, label]) => (
                <button
                  key={label}
                  className="flex items-center bg-[#f0f2f5] px-4 py-2 rounded-full text-sm font-medium hover:bg-[--primary-light] transition"
                >
                  <MaterialIcon icon={icon} className="text-[--primary] mr-1" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end px-8 py-5 border-t bg-gradient-to-r from-[#f8f9fd] to-white">
          <button
            disabled={!isValid}
            onClick={handlePost}
            className={`px-8 py-3 rounded-full font-semibold text-white transition ${
              isValid ? 'bg-[--primary] hover:bg-[#5b4cd6] hover:-translate-y-0.5 shadow-lg' : 'bg-[#ccd0d5] cursor-not-allowed'
            }`}
          >
            Đăng
          </button>
        </div>
      </div>

      {showPrivacyModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowPrivacyModal(false)}
        >
          <div
            className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl animate-[modalFadeIn_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold mb-4">Ai có thể xem bài viết của bạn?</h4>
            {(['public', 'friends', 'onlyme'] as PrivacyOption[]).map((opt) => (
              <div
                key={opt}
                className={`flex items-center p-3 rounded-lg cursor-pointer mb-2 transition ${
                  privacy === opt ? 'bg-[--primary-light]' : 'hover:bg-gray-100'
                }`}
                onClick={() => {
                  setPrivacy(opt);
                  setShowPrivacyModal(false);
                }}
              >
                <MaterialIcon icon={privacyOptions[opt].icon} className="text-[--primary] text-[22px] mr-3" />
                <div className="flex-1">
                  <div className="font-semibold">{privacyOptions[opt].text}</div>
                  <div className="text-xs text-[#606770]">{privacyOptions[opt].desc}</div>
                </div>
                {privacy === opt && <MaterialIcon icon="check" className="text-[--primary]" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
