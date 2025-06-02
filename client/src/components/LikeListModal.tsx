import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function LikeListModal({ postId, onClose }: { postId: string, onClose: () => void }) {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => {
    axios.get('/api/likes/list', {
      params: { post_id: postId },
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    }).then(res => setUsers(res.data));
  }, [postId]);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h4 className="font-bold mb-4">Danh sách đã thích</h4>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {users.map(u => (
            <div key={u.id} className="flex items-center gap-3">
              <img src={u.avatar_url || '/images/default-avatar.png'} className="w-8 h-8 rounded-full object-cover" />
              <span className="font-medium">{u.first_name} {u.last_name}</span>
            </div>
          ))}
        </div>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
}
