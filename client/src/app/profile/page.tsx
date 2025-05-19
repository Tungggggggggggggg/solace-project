'use client';

import React from 'react';
import DarkModeToggle from '../../components/DarkModeToggle';
import ProfileHeader from '../../components/ProfileHeader';
import ProfileInfo from '../../components/ProfileInfo';
import ProfileTabs from '../../components/ProfileTabs';
import AboutSection from '../../components/AboutSection';
import FriendsSection from '../../components/FriendsSection';
import PhotosSection from '../../components/PhotosSection';
import CreatePost from '../../components/CreatePost';
import PostsSection from '../../components/PostsSection';

export default function ProfilePage() {
return (
<div className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-white min-h-screen font-inter">
<DarkModeToggle />
<ProfileHeader />
<ProfileInfo />
<ProfileTabs />
<main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 mt-8">
    <div className="flex flex-col gap-8">
      <AboutSection />
      <FriendsSection />
      <PhotosSection />
    </div>
    <div className="flex flex-col gap-8">
      <CreatePost />
      <PostsSection />
    </div>
  </main>
</div>
);
}