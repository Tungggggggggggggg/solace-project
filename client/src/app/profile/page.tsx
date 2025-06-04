'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import Image from 'next/image';
import { UserContext } from '@/contexts/UserContext';
import gsap from 'gsap';
import InputSection from '@/components/InputSection';

interface Tab {
    id: string;
    label: string;
    icon: string;
}

interface User {
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
}

// Sample posts data với thông tin người dùng đang đăng nhập
const getSamplePosts = (user: User | null) => [
    {
        id: 1,
        author: {
            name: user ? `${user.first_name} ${user.last_name}` : 'Người dùng Solace',
            avatar: user?.avatar_url || '',
            username: user?.email ? user.email.split('@')[0] : 'user'
        },
        content: "Hôm nay là một ngày tuyệt vời! Vừa hoàn thành xong dự án lớn cùng team 🌞",
        images: ["photo_camera", "photo_camera", "photo_camera"],
        likes: 42,
        comments: 5,
        shares: 2,
        time: "2 giờ trước"
    },
    {
        id: 2,
        author: {
            name: user ? `${user.first_name} ${user.last_name}` : 'Người dùng Solace',
            avatar: user?.avatar_url || '',
            username: user?.email ? user.email.split('@')[0] : 'user'
        },
        content: "Mới học được một công nghệ mới thú vị! 💻 Stack công nghệ này có vẻ rất triển vọng và đáng để đầu tư thời gian tìm hiểu sâu hơn. #coding #learning",
        images: ["code", "terminal"],
        likes: 89,
        comments: 12,
        shares: 8,
        time: "5 giờ trước"
    },
    {
        id: 3,
        author: {
            name: user ? `${user.first_name} ${user.last_name}` : 'Người dùng Solace',
            avatar: user?.avatar_url || '',
            username: user?.email ? user.email.split('@')[0] : 'user'
        },
        content: "Vừa đọc xong một cuốn sách hay về phát triển bản thân. Học được nhiều điều thú vị! 📚✨ Các bạn có recommend cuốn sách nào hay không?",
        likes: 156,
        comments: 24,
        shares: 15,
        time: "8 giờ trước"
    },
    {
        id: 4,
        author: {
            name: user ? `${user.first_name} ${user.last_name}` : 'Người dùng Solace',
            avatar: user?.avatar_url || '',
            username: user?.email ? user.email.split('@')[0] : 'user'
        },
        content: "Buổi gặp mặt team hôm nay thật vui! 🎉 Cảm ơn mọi người đã luôn nhiệt tình và hỗ trợ nhau. Chúc team sẽ tiếp tục phát triển mạnh mẽ! 💪",
        images: ["groups", "celebration"],
        likes: 203,
        comments: 18,
        shares: 5,
        time: "1 ngày trước"
    }
];

const tabs: Tab[] = [
    { id: 'posts', label: 'Bài viết', icon: 'article' },
    { id: 'media', label: 'Ảnh/Video', icon: 'photo_library' },
    { id: 'about', label: 'Giới thiệu', icon: 'person' },
];

export default function ProfilePage() {
    const { user } = useContext(UserContext);
    const [activeTab, setActiveTab] = useState<string>('posts');
    const profileRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const posts = getSamplePosts(user);

    useEffect(() => {
        const tl = gsap.timeline({
            defaults: { ease: "power3.out" }
        });

        // Profile animation
        tl.from(profileRef.current, {
            y: 30,
            opacity: 0,
            duration: 0.8
        });

        // Stats animation
        tl.from(".stat-item", {
            y: 20,
            opacity: 0,
            stagger: 0.1,
            duration: 0.5
        }, "-=0.4");

        // Content animation
        if (contentRef.current) {
            tl.from(contentRef.current.children, {
                y: 20,
                opacity: 0,
                stagger: 0.1,
                duration: 0.5
            }, "-=0.2");
        }
    }, []);

    // Tab change animation
    useEffect(() => {
        if (contentRef.current) {
            gsap.from(contentRef.current.children, {
                y: 15,
                opacity: 0,
                stagger: 0.05,
                duration: 0.4,
                ease: "power2.out"
            });
        }
    }, [activeTab]);

    return (
        <MainLayout>
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Profile Card */}
                    <div ref={profileRef} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        {/* Profile Header */}
                        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2)_0%,rgba(0,0,0,0)_70%)]" />
                        </div>

                        <div className="px-6 pb-6">
                            {/* Avatar and Actions */}
                            <div className="flex justify-between items-end -mt-16">
                                <div className="relative">                                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white relative flex items-center justify-center transform transition-transform hover:scale-105">
                                        {user?.avatar_url ? (
                                            <div className="absolute inset-0 rounded-full overflow-hidden">
                                                <Image
                                                    src={user.avatar_url}
                                                    alt="Profile"
                                                    fill
                                                    className="object-cover rounded-full"
                                                    sizes="128px"
                                                    priority
                                                />
                                            </div>
                                        ) : (
                                            <span className="material-symbols-outlined text-[48px] text-slate-300">
                                                person
                                            </span>
                                        )}
                                    </div>
                                    <button className="absolute bottom-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-sm transition-colors">
                                        <span className="material-symbols-outlined text-slate-600">photo_camera</span>
                                    </button>
                                </div>

                                <button className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full transition-colors flex items-center gap-2 text-sm font-medium">
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                    Chỉnh sửa
                                </button>
                            </div>

                            {/* User Info */}
                            <div className="mt-6">
                                <h1 className="text-2xl font-semibold text-slate-900">
                                    {user ? `${user.first_name} ${user.last_name}` : 'Người dùng Solace'}
                                </h1>
                                <p className="text-slate-500 mt-1">
                                    {user?.email ? `@${user.email.split('@')[0]}` : '@user'}
                                </p>
                                <p className="mt-4 text-slate-600">
                                    Xin chào! Tôi là một người dùng của Solace. Rất vui được kết nối với mọi người.
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div className="mt-6 grid grid-cols-4 gap-4">
                                <div className="stat-item rounded-xl bg-slate-50 p-4 text-center hover:bg-slate-100 transition-colors cursor-pointer">
                                    <div className="text-2xl font-semibold text-slate-900">125</div>
                                    <div className="text-sm text-slate-500">Bài viết</div>
                                </div>
                                <div className="stat-item rounded-xl bg-slate-50 p-4 text-center hover:bg-slate-100 transition-colors cursor-pointer">
                                    <div className="text-2xl font-semibold text-slate-900">15.2K</div>
                                    <div className="text-sm text-slate-500">Người theo dõi</div>
                                </div>
                                <div className="stat-item rounded-xl bg-slate-50 p-4 text-center hover:bg-slate-100 transition-colors cursor-pointer">
                                    <div className="text-2xl font-semibold text-slate-900">1.1K</div>
                                    <div className="text-sm text-slate-500">Đang theo dõi</div>
                                </div>
                                <div className="stat-item rounded-xl bg-slate-50 p-4 text-center hover:bg-slate-100 transition-colors cursor-pointer">
                                    <div className="text-2xl font-semibold text-slate-900">438</div>
                                    <div className="text-sm text-slate-500">Ảnh/Video</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Create Post Section */}
                    <div className="mt-6">
                        <InputSection />
                    </div>

                    {/* Navigation Tabs */}
                    <div className="mt-6 flex gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all
                  ${activeTab === tab.id
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-slate-600 hover:bg-white/60'
                                    }
                `}
                            >
                                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="mt-6" ref={contentRef}>
                        {activeTab === 'posts' && (
                            <div className="space-y-6">
                                {posts.map(post => (
                                    <div key={post.id} className="bg-white rounded-2xl p-6 shadow-sm">
                                        {/* Post Header */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                                                {post.author.avatar ? (
                                                    <Image
                                                        src={post.author.avatar}
                                                        alt={post.author.name}
                                                        width={48}
                                                        height={48}
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <span className="material-symbols-outlined text-slate-400">person</span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-slate-900">{post.author.name}</h3>
                                                <p className="text-sm text-slate-500">@{post.author.username} · {post.time}</p>
                                            </div>
                                            <button className="ml-auto p-2 hover:bg-slate-50 rounded-full transition-colors">
                                                <span className="material-symbols-outlined text-slate-400">more_horiz</span>
                                            </button>
                                        </div>

                                        {/* Post Content */}
                                        <p className="text-slate-900 mb-4 whitespace-pre-wrap">{post.content}</p>

                                        {/* Post Images */}
                                        {post.images && (
                                            <div className={`grid ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-4`}>
                                                {post.images.map((icon, index) => (
                                                    <div key={index} className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center group hover:bg-slate-200 transition-colors cursor-pointer">
                                                        <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:scale-110 transition-transform">
                                                            {icon}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Post Actions */}
                                        <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-4">
                                            <button className="flex-1 flex items-center justify-center gap-1 py-2 text-slate-600 hover:text-rose-500 transition-colors rounded-lg hover:bg-slate-50">
                                                <span className="material-symbols-outlined">favorite</span>
                                                <span>{post.likes}</span>
                                            </button>
                                            <button className="flex-1 flex items-center justify-center gap-1 py-2 text-slate-600 hover:text-indigo-500 transition-colors rounded-lg hover:bg-slate-50">
                                                <span className="material-symbols-outlined">chat_bubble</span>
                                                <span>{post.comments}</span>
                                            </button>
                                            <button className="flex-1 flex items-center justify-center gap-1 py-2 text-slate-600 hover:text-emerald-500 transition-colors rounded-lg hover:bg-slate-50">
                                                <span className="material-symbols-outlined">share</span>
                                                <span>{post.shares}</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === 'media' && (
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="grid grid-cols-3 gap-4">
                                    {[1, 2, 3, 4, 5, 6].map((item) => (
                                        <div key={item} className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                                            <span className="flex items-center justify-center h-full material-symbols-outlined text-slate-400 text-3xl">image</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'about' && (
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-slate-900 mb-4">Thông tin cơ bản</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <span className="material-symbols-outlined text-slate-400">mail</span>
                                                <span>{user?.email || 'Chưa cập nhật email'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <span className="material-symbols-outlined text-slate-400">cake</span>
                                                <span>Chưa cập nhật ngày sinh</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <span className="material-symbols-outlined text-slate-400">location_on</span>
                                                <span>Chưa cập nhật địa chỉ</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}