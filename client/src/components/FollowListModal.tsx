import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useUser } from '@/contexts/UserContext';
import axios from 'axios';
import Link from 'next/link';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  email: string;
  followed_at: string;
  is_following: boolean;
}

interface FollowListModalProps {
  userId: string;
  type: 'followers' | 'following';
  isOpen: boolean;
  onClose: () => void;
}

export default function FollowListModal({ userId, type, isOpen, onClose }: FollowListModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { user: currentUser, accessToken } = useUser();

  useEffect(() => {
    if (isOpen) {
      gsap.to(modalRef.current, {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        duration: 0.2
      });
      gsap.fromTo(contentRef.current, 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`/api/users/${userId}/${type}`, {
          baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [userId, type, isOpen, accessToken]);

  const handleFollow = async (targetUserId: string) => {
    try {
      const endpoint = `/api/users/${targetUserId}/follow`;
      const method = users.find(u => u.id === targetUserId)?.is_following ? 'DELETE' : 'POST';
      
      await axios({
        method,
        url: endpoint,
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      // Update local state
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === targetUserId 
          ? { ...user, is_following: !user.is_following }
          : user
      ));
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  const handleClose = () => {
    gsap.to(modalRef.current, {
      backgroundColor: 'rgba(0, 0, 0, 0)',
      duration: 0.2
    });
    gsap.to(contentRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.2,
      onComplete: onClose
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center"
      onClick={handleClose}
    >
      <div 
        ref={contentRef}
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-slate-900">
            {type === 'followers' ? 'Người theo dõi' : 'Đang theo dõi'}
          </h3>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 mb-6 animate-pulse">
                <div className="w-12 h-12 bg-slate-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                  <div className="h-3 w-24 bg-slate-200 rounded" />
                </div>
                <div className="w-24 h-8 bg-slate-200 rounded-full" />
              </div>
            ))
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {type === 'followers' 
                ? 'Chưa có người theo dõi nào'
                : 'Chưa theo dõi ai'
              }
            </div>
          ) : (
            <div className="space-y-6">
              {users.map(user => (
                <div key={user.id} className="flex items-center gap-4">
                  <Link 
                    href={user.id === currentUser?.id ? '/profile' : `/profile/${user.id}`}
                    className="flex items-center gap-4 flex-1 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden relative">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.first_name}
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-2xl text-slate-400 absolute inset-0 flex items-center justify-center">
                          person
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {user.first_name} {user.last_name}
                      </h4>
                      <p className="text-sm text-slate-500">@{user.email.split('@')[0]}</p>
                    </div>
                  </Link>
                  {currentUser?.id !== user.id && (
                    <button
                      onClick={() => handleFollow(user.id)}
                      className={`
                        px-4 py-2 rounded-full text-sm font-medium transition-all
                        ${user.is_following
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                        }
                      `}
                    >
                      {user.is_following ? 'Đang theo dõi' : 'Theo dõi'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
