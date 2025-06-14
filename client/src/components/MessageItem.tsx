import { FC, useRef, memo, useState, useEffect } from 'react';
import clsx from 'clsx';
import gsap from 'gsap';
import FsLightbox from 'fslightbox-react';
import { MaterialIcon } from './MaterialIcon';
import { Message } from '@/types/chat';

interface MessageItemProps {
  message: Message;
  userId: string;
  onReply: (message: Message) => void;
  showDate: boolean;
  scrollToMessage?: (messageId: string) => void;
}

const MessageItemComponent: FC<MessageItemProps> = ({
  message,
  userId,
  onReply,
  showDate,
  scrollToMessage,
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [toggler, setToggler] = useState(false);

  const openLightbox = () => {
    setToggler(!toggler);
  };

  const isOwn = message.sender_id === userId;

  const handleReplyClick = () => {
    if (message.reply_to_message_id && scrollToMessage) {
      scrollToMessage(message.reply_to_message_id);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <div
      id={`message-${message.id}`}
      className={clsx(
        'flex px-4 py-2 group',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Avatar nếu không phải tin của mình */}
      {!isOwn && (
        <div className="w-9 h-9 mr-2 flex-shrink-0">
          <img
            src={message.sender_avatar || '/default-avatar.png'}
            alt="Avatar"
            className="w-full h-full rounded-full object-cover border border-gray-300"
          />
        </div>
      )}

      {/* Vùng chứa toàn bộ nội dung tin nhắn */}
      <div className="relative flex max-w-[80%]">
        {/* Nút reply - luôn hiển thị nhưng ẩn cho đến khi hover */}
        <button
          onClick={() => onReply(message)}
          title="Trả lời"
          className={clsx(
            'absolute top-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 transform -translate-y-1/2',
            isOwn
              ? '-left-10 hover:-translate-x-1'
              : '-right-10 hover:translate-x-1',
            'bg-white border border-gray-200 shadow rounded-full p-1.5 w-8 h-8 flex items-center justify-center',
            'hover:bg-gray-100 focus:outline-none'
          )}
        >
          <MaterialIcon icon="reply" className="text-sm text-gray-600" />
        </button>

        <div className="flex flex-col w-full">
          {/* Quote trả lời */}
          {message.reply_to_message_id && message.reply_to_sender_name && (
            <div
              className={clsx(
                'mb-2 border-l-4 pl-3 py-2 rounded-lg cursor-pointer transition-colors text-gray-900',
                isOwn
                  ? 'border-[#D0E8FF] bg-[#E6F4FF] hover:bg-[#D0E8FF]'
                  : 'border-[#C9D6DF] bg-[#F0F4F8] hover:bg-[#E2E8F0]'
              )}
              onClick={handleReplyClick}
              role="button"
              tabIndex={0}
              title="Xem tin nhắn gốc"
            >
              <div className="font-semibold text-sm truncate">{message.reply_to_sender_name}</div>
              <div className="text-xs line-clamp-2">
                {message.reply_to_content || (message.reply_to_type === 'image' ? '📷 Hình ảnh' : 'Không có nội dung')}
              </div>
            </div>
          )}

          {/* Tin nhắn hình ảnh */}
          {message.type === 'image' && message.image_url && (
            <>
              <figure
                className="mb-2 cursor-pointer rounded-lg overflow-hidden"
                onClick={openLightbox}
                role="button"
                tabIndex={0}
              >
                <img
                  ref={imageRef}
                  src={message.image_url}
                  alt="Sent content"
                  loading="lazy"
                  className="max-w-full max-h-64 object-cover rounded-lg border border-gray-200 shadow hover:shadow-lg transition-shadow duration-300"
                />
              </figure>
              <FsLightbox toggler={toggler} sources={[message.image_url]} key={message.id} type="image" />
            </>
          )}

          {/* Khung tin nhắn văn bản - chỉ hiển thị nếu có nội dung */}
          {message.content && (
            <div
              className={clsx(
                'px-4 py-2 rounded-2xl whitespace-pre-wrap break-words shadow-sm text-gray-900',
                isOwn
                  ? 'bg-[#CCE5FF] rounded-br-sm self-end hover:bg-[#B3D8FF]'
                  : 'bg-[#F1F5F9] rounded-bl-sm self-start hover:bg-[#E2E8F0]'
              )}
            >
              <div>{message.content}</div>
            </div>
          )}

          {/* Thời gian */}
          {showDate && (
            <div
              className={clsx(
                'text-xs mt-1 text-gray-700',
                isOwn ? 'text-right' : 'text-left'
              )}
            >
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const MessageItem = memo(MessageItemComponent);