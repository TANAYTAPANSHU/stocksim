export type User = {
  id: string;
  username: string;
  bio: string;
  followers: string[];
  following: string[];
};

export type Post = {
  id: string;
  authorId: string;
  text: string;
  imageUrl?: string;
  likedBy: string[];
  createdAt: number;
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  createdAt: number;
};

export type NotificationType = 'like' | 'comment' | 'follow';

export type AppNotification = {
  id: string;
  recipientId: string;
  type: NotificationType;
  actorId: string;
  postId?: string;
  createdAt: number;
  read: boolean;
};

export type AppState = {
  currentUserId: string | null;
  users: Record<string, User>;
  posts: Post[];
  comments: Comment[];
  notifications: AppNotification[];
};
