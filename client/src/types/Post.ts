export interface PostType {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  likes: number;
  comments: number;
  shares: number;
  images?: string[];
  feeling?: { icon: string; label: string };
  location?: string;
  type_post: 'positive' | 'negative';
  shared_post_id?: string;
} 