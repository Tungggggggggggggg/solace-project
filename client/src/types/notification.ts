export interface User {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
}

export interface Notification {
  id: string;
  user_id: string;
  sender_id?: string;
  title: string;
  content: string;
  type: 'like' | 'comment' | 'follow' | 'system' | 'message';
  is_read: boolean;
  related_type?: 'post' | 'comment' | 'message';
  related_id?: string;
  created_at: string;
  sender?: User;
}