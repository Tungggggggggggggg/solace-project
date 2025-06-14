import { FC, ChangeEvent, KeyboardEvent } from 'react';
import clsx from 'clsx';
import { MaterialIcon } from './MaterialIcon';
import { Message } from '@/types/chat';

interface MessageInputProps {
  text: string;
  replyingTo: Message | null;
  pendingImageUrl: string | undefined;
  isUploading: boolean;
  showImageUpload: boolean;
  onTextChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyPress: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onCancelReply: () => void;
  onCancelImage: () => void;
  onImageToggle: () => void;
}

export const MessageInput: FC<MessageInputProps> = ({
  text,
  replyingTo,
  pendingImageUrl,
  isUploading,
  showImageUpload,
  onTextChange,
  onKeyPress,
  onSend,
  onCancelReply,
  onCancelImage,
  onImageToggle
}) => {
  const disableSend = (!text.trim() && !pendingImageUrl) || isUploading;

  return (
    <div className="flex flex-col gap-2 p-4 border-t border-gray-200 bg-white">
      {/* Reply Section */}
      {replyingTo && (
        <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 p-3 rounded-lg shadow-sm">
          <div className="flex-1">
            <div className="text-sm font-semibold text-indigo-700">
              Trả lời {replyingTo.sender_name}
            </div>
            <div className="text-xs text-indigo-500 truncate">
              {replyingTo.content || '📷 Hình ảnh'}
            </div>
          </div>
          <button
            onClick={onCancelReply}
            className="text-indigo-400 hover:text-indigo-600 p-1"
            aria-label="Hủy trả lời"
          >
            <MaterialIcon icon="close" />
          </button>
        </div>
      )}

      {/* Pending Image */}
      {pendingImageUrl && (
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <img
              src={pendingImageUrl}
              alt="Pending"
              className="w-14 h-14 object-cover rounded-lg border border-gray-300 shadow"
            />
            <span className="text-sm text-gray-600">Ảnh sẵn sàng gửi</span>
          </div>
          <button
            onClick={onCancelImage}
            className="text-slate-400 hover:text-slate-600 p-1"
            aria-label="Hủy ảnh"
          >
            <MaterialIcon icon="close" />
          </button>
        </div>
      )}

      {/* Input Actions */}
      <div className="flex items-end gap-2">
        {/* Emoji */}
        <button
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-amber-100 transition"
          aria-label="Biểu cảm"
        >
          <MaterialIcon icon="emoji_emotions" />
        </button>

        {/* Image Upload */}
        <button
          onClick={onImageToggle}
          className={clsx(
            'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
            isUploading
              ? 'bg-gray-200 cursor-not-allowed'
              : showImageUpload || pendingImageUrl
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-100 hover:bg-indigo-100'
          )}
          aria-label="Đính kèm ảnh"
          disabled={isUploading}
        >
          <MaterialIcon icon="photo_camera" />
        </button>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={onTextChange}
            onKeyPress={onKeyPress}
            placeholder="Nhập tin nhắn..."
            className="w-full resize-none max-h-32 text-sm bg-gray-100 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            rows={1}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={onSend}
          disabled={disableSend}
          className={clsx(
            'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
            disableSend
              ? 'bg-gray-300 text-white cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          )}
          aria-label="Gửi tin nhắn"
        >
          <MaterialIcon icon="send" />
        </button>
      </div>
    </div>
  );
};
