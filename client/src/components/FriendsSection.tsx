import React from 'react';
import Image from 'next/image';
import { MaterialIcon } from './MaterialIcon';

const friends = [
	{
		name: 'Mai Anh',
		mutual: 12,
		avatar: 'https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/09/18/458/avatar-dep-4.jpg',
	},
	{
		name: 'Tuấn Anh',
		mutual: 8,
		avatar: 'https://i.pinimg.com/originals/8f/33/30/8f3330d6163782b88b506d396f5d156f.jpg',
	},
	{
		name: 'Hương Ly',
		mutual: 15,
		avatar: 'https://anhdep.edu.vn/upload/2024/05/top-99-avatar-facebook-dep-mien-phi-cho-moi-phong-cach-1.webp',
	},
	{
		name: 'Minh Đức',
		mutual: 5,
		avatar: 'https://m.yodycdn.com/blog/avatar-dep-cho-nam-yody-vn.jpg',
	},
];

const FriendsSection: React.FC = () => {
	return (
		<div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-violet-600 text-xl font-bold flex items-center gap-2">
					<MaterialIcon icon="group" className="text-violet-600 text-2xl" /> Bạn bè
				</h2>
				<span className="text-sm font-semibold text-violet-600 cursor-pointer hover:underline">
					Xem tất cả
				</span>
			</div>
			<div className="grid grid-cols-2 gap-4">
				{friends.map((friend) => (
					<div
						key={friend.name}
						className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
					>
						<Image
							src={friend.avatar}
							alt={friend.name}
							width={80}
							height={80}
							className="w-20 h-20 rounded-full object-cover border-2 border-violet-200 hover:border-violet-500"
							unoptimized
						/>
						<p className="mt-2 font-medium text-sm text-center">{friend.name}</p>
						<p className="text-xs text-gray-500">{friend.mutual} bạn chung</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default FriendsSection;
