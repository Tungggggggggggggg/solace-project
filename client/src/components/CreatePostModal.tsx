'use client';

import { useState, useRef, ChangeEvent, useLayoutEffect, useEffect } from 'react';
import { MaterialIcon } from './MaterialIcon';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import gsap from 'gsap';

type PrivacyOption = 'public' | 'friends' | 'onlyme';

const privacyOptions: Record<PrivacyOption, { icon: string; text: string; desc: string }> = {
  public: { icon: 'public', text: 'Công khai', desc: 'Mọi người trên và ngoài Nova' },
  friends: { icon: 'people', text: 'Bạn bè', desc: 'Chỉ bạn bè của bạn' },
  onlyme: { icon: 'lock', text: 'Chỉ mình tôi', desc: 'Chỉ bạn có thể xem' },
};

const FEELINGS = [
  { icon: '😊', label: 'Vui vẻ' },
  { icon: '😢', label: 'Buồn' },
  { icon: '😡', label: 'Tức giận' },
  { icon: '🥰', label: 'Yêu đời' },
  { icon: '😱', label: 'Bất ngờ' },
  { icon: '😴', label: 'Mệt mỏi' },
  { icon: '🤩', label: 'Hào hứng' },
  { icon: '😭', label: 'Tổn thương' },
  { icon: '😇', label: 'Bình yên' },
];

const POPULAR_LOCATIONS = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Nha Trang',
  'Huế',
  'Vũng Tàu',
  'Biên Hòa',
  'Buôn Ma Thuột',
  'Quy Nhơn',
  'Phan Thiết',
  'Hạ Long',
  'Thanh Hóa',
  'Nam Định',
  'Vinh',
  'Long Xuyên',
  'Rạch Giá',
  'Thái Nguyên',
  'Bắc Ninh',
];

export default function CreatePostModal({ onClose, onPostCreated, theme, defaultTypePost }: { onClose?: () => void, onPostCreated?: (post: any) => void, theme?: string, defaultTypePost?: 'positive' | 'negative' }) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<PrivacyOption>('public');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useUser();
  const [selectedFeeling, setSelectedFeeling] = useState<{icon: string, label: string} | null>(null);
  const [showFeelingModal, setShowFeelingModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const feelingModalRef = useRef<HTMLDivElement>(null);
  const locationModalRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const [typePost, setTypePost] = useState<'positive' | 'negative'>(defaultTypePost || 'positive');

  useEffect(() => {
    if (defaultTypePost) setTypePost(defaultTypePost);
  }, [defaultTypePost]);

  const handleAddImage = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    if (images.length + e.target.files.length > 9) {
      alert('Bạn chỉ có thể tải lên tối đa 9 ảnh');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    Array.from(e.target.files).forEach(file => formData.append('media', file));
    formData.append('user_id', user?.id || '');
    formData.append('content', content);
    formData.append('privacy', privacy);
    try {
      const res = await axios.post('/api/posts/upload-media', formData, {
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImages(prev => [...prev, ...res.data.images]);
      console.log('Uploaded images:', res.data.images);
    } catch (err) {
      alert('Upload ảnh thất bại');
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    const newList = [...images];
    newList.splice(index, 1);
    setImages(newList);
  };

  const isValid = content.trim() !== '' || images.length > 0;

  const handlePost = async () => {
    if (uploading) return;
    if (!user?.id) {
      alert('Bạn cần đăng nhập để đăng bài!');
      return;
    }
    if (!content.trim() && images.length === 0) {
      alert('Nội dung bài viết không được để trống!');
      return;
    }
    setUploading(true);
    try {
      const res = await axios.post('/api/posts', {
        user_id: user?.id || '',
        content,
        privacy,
        images: images.length > 0 ? images : null,
        feeling: selectedFeeling ? { icon: selectedFeeling.icon, label: selectedFeeling.label } : null,
        location: selectedLocation || null,
        type_post: typePost,
      }, {
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
      });
      alert('Bài viết đã được đăng!');
      setContent('');
      setImages([]);
      setSelectedFeeling(null);
      setSelectedLocation(null);
      if (onClose) onClose();
      if (onPostCreated) onPostCreated(res.data);
    } catch (err) {
      alert('Đăng bài thất bại');
    }
    setUploading(false);
  };

  useLayoutEffect(() => {
    if (showFeelingModal && feelingModalRef.current) {
      gsap.fromTo(
        feelingModalRef.current,
        { scale: 0.8, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, [showFeelingModal]);

  useLayoutEffect(() => {
    if (showLocationModal && locationModalRef.current) {
      gsap.fromTo(
        locationModalRef.current,
        { scale: 0.8, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, [showLocationModal]);

  useLayoutEffect(() => {
    if ((selectedFeeling || selectedLocation) && statusRef.current) {
      gsap.fromTo(
        statusRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [selectedFeeling, selectedLocation]);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50 font-inter text-[#1c1e21]"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl rounded-[20px] overflow-hidden shadow-lg animate-[modalFadeIn_0.4s_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-8 py-6 border-b bg-gradient-to-r from-white to-[#f8f9fd]">
          <h3 className="text-[22px] font-bold text-[#1c1e21] tracking-tight">Tạo bài viết</h3>
          <button
            className="text-[#606770] text-2xl hover:text-[--primary] hover:scale-110 hover:rotate-90 transition"
            onClick={onClose ? onClose : () => alert('Modal sẽ đóng trong ứng dụng thực tế')}
          >
            ×
          </button>
        </div>

        <div className="px-8 py-8 bg-white">
          <div className="flex items-center mb-6">
            <img
              src={user?.avatar_url || '/images/default-avatar.png'}
              className="w-12 h-12 rounded-full border-2 border-[--primary-light] object-cover mr-4"
              alt="avatar"
            />
            <div>
              <div className="font-semibold">
                {user?.first_name && user?.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : 'Ẩn danh'}
              </div>

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

          {/* Hiển thị cảm xúc và vị trí đã chọn */}
          {((selectedFeeling && selectedLocation) || (!selectedFeeling && selectedLocation)) && (
            <div ref={statusRef} className="mb-3 flex flex-wrap items-center gap-2 text-lg font-medium">
              <span className="font-semibold">{user?.first_name && user?.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : 'Bạn'}</span>
              {selectedFeeling && <><span>đang cảm thấy</span><span className="text-2xl">{selectedFeeling.icon}</span><span className="font-semibold text-[#6c5ce7]">{selectedFeeling.label}</span></>}
              <span>tại</span>
              <span className="font-semibold text-[#6c5ce7]">{selectedLocation}</span>
              {selectedFeeling && <button className="ml-2 text-gray-400 hover:text-red-500 text-xl" onClick={() => setSelectedFeeling(null)} title="Xóa cảm xúc">×</button>}
              {selectedLocation && <button className="ml-2 text-gray-400 hover:text-red-500 text-xl" onClick={() => setSelectedLocation(null)} title="Xóa vị trí">×</button>}
            </div>
          )}
          {selectedFeeling && !selectedLocation && (
            <div ref={statusRef} className="mb-3 flex flex-wrap items-center gap-2 text-lg font-medium">
              <span className="font-semibold">{user?.first_name && user?.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : 'Bạn'}</span>
              <span>đang cảm thấy</span>
              <span className="text-2xl">{selectedFeeling.icon}</span>
              <span className="font-semibold text-[#6c5ce7]">{selectedFeeling.label}</span>
              <button className="ml-2 text-gray-400 hover:text-red-500 text-xl" onClick={() => setSelectedFeeling(null)} title="Xóa cảm xúc">×</button>
            </div>
          )}

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
              {images.length < 9 && (
                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed border-black/20 rounded-xl aspect-square cursor-pointer hover:border-[--primary] hover:bg-[--primary-light] transition"
                  onClick={() => fileRef.current?.click()}
                >
                  <MaterialIcon icon="add_a_photo" className="text-[--primary] text-3xl mb-1" />
                  <span className="text-sm font-medium">Thêm ảnh</span>
                </div>
              )}
            </div>
          )}

          <input type="file" hidden ref={fileRef} accept="image/*,video/*" multiple onChange={handleAddImage} />
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
              <button
                type="button"
                className="flex items-center gap-2 px-5 py-3 rounded-full text-base font-semibold shadow bg-gradient-to-r from-[#f0f2f5] to-[#e0e7ff] hover:from-[#e0e7ff] hover:to-[#f0f2f5] hover:scale-105 transition-all border border-[#e0e7ff] focus:ring-2 focus:ring-[#6c5ce7]"
                onClick={() => setShowFeelingModal(true)}
              >
                <MaterialIcon icon="mood" className="text-yellow-500 text-2xl" />
                Cảm xúc
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-5 py-3 rounded-full text-base font-semibold shadow bg-gradient-to-r from-[#f0f2f5] to-[#e0e7ff] hover:from-[#e0e7ff] hover:to-[#f0f2f5] hover:scale-105 transition-all border border-[#e0e7ff] focus:ring-2 focus:ring-[#6c5ce7]"
                onClick={() => setShowLocationModal(true)}
              >
                <MaterialIcon icon="location_on" className="text-pink-500 text-2xl" />
                Vị trí
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-5 py-3 rounded-full text-base font-semibold shadow bg-gradient-to-r from-[#f0f2f5] to-[#e0e7ff] hover:from-[#e0e7ff] hover:to-[#f0f2f5] hover:scale-105 transition-all border border-[#e0e7ff] focus:ring-2 focus:ring-[#6c5ce7]"
              >
                <MaterialIcon icon="person" className="text-blue-500 text-2xl" />
                Gắn thẻ
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-5 py-3 rounded-full text-base font-semibold shadow bg-gradient-to-r from-[#f0f2f5] to-[#e0e7ff] hover:from-[#e0e7ff] hover:to-[#f0f2f5] hover:scale-105 transition-all border border-[#e0e7ff] focus:ring-2 focus:ring-[#6c5ce7]"
              >
                <MaterialIcon icon="poll" className="text-green-500 text-2xl" />
                Bình chọn
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end px-8 py-5 border-t bg-gradient-to-r from-[#f8f9fd] to-white">
          <button
            disabled={!isValid || uploading}
            onClick={handlePost}
            style={theme === 'reflective' ? { background: '#E3D5CA', color: '#222' } : theme === 'inspiring' ? { background: '#6c5ce7', color: '#fff' } : {}}
            className={`px-8 py-3 rounded-full font-semibold transition ${
              isValid && !uploading
                ? (theme === 'reflective'
                    ? 'hover:brightness-95 shadow-lg'
                    : 'hover:bg-[#5b4cd6] hover:-translate-y-0.5 shadow-lg text-white')
                : 'bg-[#ccd0d5] cursor-not-allowed text-white'
            }`}
          >
            {uploading ? 'Đang đăng...' : 'Đăng'}
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

      {showFeelingModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowFeelingModal(false)}>
          <div ref={feelingModalRef} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative animate-[modalFadeIn_0.3s_ease-out]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold">Chọn cảm xúc</h4>
              <button className="text-2xl text-gray-400 hover:text-red-500" onClick={() => setShowFeelingModal(false)}>×</button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {FEELINGS.map(feel => (
                <button
                  key={feel.label}
                  className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-[#f0f2f5] transition"
                  onClick={() => { setSelectedFeeling(feel); setShowFeelingModal(false); }}
                >
                  <span className="text-3xl mb-1">{feel.icon}</span>
                  <span className="font-medium">{feel.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showLocationModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowLocationModal(false)}>
          <div ref={locationModalRef} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative animate-[modalFadeIn_0.3s_ease-out]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold">Chọn vị trí</h4>
              <button className="text-2xl text-gray-400 hover:text-red-500" onClick={() => setShowLocationModal(false)}>×</button>
            </div>
            <button
              className="w-full mb-4 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[#f0f2f5] hover:bg-[--primary-light] transition font-medium"
              disabled={isGettingLocation}
              onClick={async () => {
                if (!navigator.geolocation) {
                  alert('Trình duyệt không hỗ trợ định vị!');
                  return;
                }
                setIsGettingLocation(true);
                navigator.geolocation.getCurrentPosition(async (pos) => {
                  try {
                    const latitude = pos.coords.latitude;
                    const longitude = pos.coords.longitude;
                    // Gọi API reverse geocode (dùng OpenStreetMap miễn phí)
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    setSelectedLocation(data.display_name || `${latitude},${longitude}`);
                    setShowLocationModal(false);
                  } catch {
                    setSelectedLocation(`${pos.coords.latitude},${pos.coords.longitude}`);
                    setShowLocationModal(false);
                  }
                  setIsGettingLocation(false);
                }, (err) => {
                  alert('Không lấy được vị trí!');
                  setIsGettingLocation(false);
                });
              }}
            >
              <MaterialIcon icon="my_location" className="text-[--primary] text-xl" />
              {isGettingLocation ? 'Đang lấy vị trí...' : 'Lấy vị trí hiện tại'}
            </button>
            <div className="mb-2 text-gray-700 font-semibold">Hoặc chọn vị trí phổ biến:</div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {POPULAR_LOCATIONS.map(loc => (
                <button
                  key={loc}
                  className="py-2 px-3 rounded-lg bg-[#f0f2f5] hover:bg-[--primary-light] transition font-medium text-sm"
                  onClick={() => { setSelectedLocation(loc); setShowLocationModal(false); }}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
