import type {
  AppNotification,
  AppState,
  Comment,
  NotificationType,
  Post,
  User,
} from '../types';

export type Action =
  | { type: 'LOGIN'; id: string; username: string }
  | { type: 'LOGOUT' }
  | { type: 'CREATE_POST'; id: string; text: string; imageUrl?: string }
  | { type: 'TOGGLE_LIKE'; postId: string }
  | { type: 'ADD_COMMENT'; id: string; postId: string; text: string }
  | { type: 'TOGGLE_FOLLOW'; userId: string }
  | { type: 'MARK_NOTIFICATIONS_READ' }
  | { type: 'BOT_LIKE'; postId: string; botId: string }
  | { type: 'BOT_COMMENT'; comment: Comment };

let counter = 0;
export function newId(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}`;
}

function makeNotification(
  recipientId: string,
  type: NotificationType,
  actorId: string,
  postId?: string,
): AppNotification {
  return {
    id: newId('n'),
    recipientId,
    type,
    actorId,
    postId,
    createdAt: Date.now(),
    read: false,
  };
}

// Adds a notification, but never tells a user about their own actions.
function withNotification(
  notifications: AppNotification[],
  recipientId: string,
  type: NotificationType,
  actorId: string,
  postId?: string,
): AppNotification[] {
  if (recipientId === actorId) return notifications;
  return [makeNotification(recipientId, type, actorId, postId), ...notifications];
}

function updateUser(
  users: Record<string, User>,
  userId: string,
  update: (user: User) => User,
): Record<string, User> {
  const user = users[userId];
  if (!user) return users;
  return { ...users, [userId]: update(user) };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN': {
      const username = action.username.trim().toLowerCase();
      const existing = Object.values(state.users).find(
        u => u.username === username,
      );
      if (existing) {
        return { ...state, currentUserId: existing.id };
      }
      const user: User = {
        id: action.id,
        username,
        bio: 'New here. Say hi!',
        followers: [],
        following: [],
      };
      return {
        ...state,
        currentUserId: user.id,
        users: { ...state.users, [user.id]: user },
      };
    }

    case 'LOGOUT':
      return { ...state, currentUserId: null };

    case 'CREATE_POST': {
      const me = state.currentUserId;
      if (!me) return state;
      const post: Post = {
        id: action.id,
        authorId: me,
        text: action.text,
        imageUrl: action.imageUrl,
        likedBy: [],
        createdAt: Date.now(),
      };
      return { ...state, posts: [post, ...state.posts] };
    }

    case 'TOGGLE_LIKE': {
      const me = state.currentUserId;
      const post = state.posts.find(p => p.id === action.postId);
      if (!me || !post) return state;

      const alreadyLiked = post.likedBy.includes(me);
      const likedBy = alreadyLiked
        ? post.likedBy.filter(id => id !== me)
        : [...post.likedBy, me];

      return {
        ...state,
        posts: state.posts.map(p => (p.id === post.id ? { ...p, likedBy } : p)),
        notifications: alreadyLiked
          ? state.notifications
          : withNotification(
              state.notifications,
              post.authorId,
              'like',
              me,
              post.id,
            ),
      };
    }

    case 'ADD_COMMENT': {
      const me = state.currentUserId;
      const post = state.posts.find(p => p.id === action.postId);
      if (!me || !post) return state;
      const comment: Comment = {
        id: action.id,
        postId: post.id,
        authorId: me,
        text: action.text,
        createdAt: Date.now(),
      };
      return {
        ...state,
        comments: [...state.comments, comment],
        notifications: withNotification(
          state.notifications,
          post.authorId,
          'comment',
          me,
          post.id,
        ),
      };
    }

    case 'TOGGLE_FOLLOW': {
      const me = state.currentUserId;
      if (!me || me === action.userId) return state;
      const isFollowing = state.users[me]?.following.includes(action.userId);

      let users = updateUser(state.users, me, u => ({
        ...u,
        following: isFollowing
          ? u.following.filter(id => id !== action.userId)
          : [...u.following, action.userId],
      }));
      users = updateUser(users, action.userId, u => ({
        ...u,
        followers: isFollowing
          ? u.followers.filter(id => id !== me)
          : [...u.followers, me],
      }));

      return {
        ...state,
        users,
        notifications: isFollowing
          ? state.notifications
          : withNotification(state.notifications, action.userId, 'follow', me),
      };
    }

    case 'MARK_NOTIFICATIONS_READ': {
      const me = state.currentUserId;
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.recipientId === me ? { ...n, read: true } : n,
        ),
      };
    }

    case 'BOT_LIKE': {
      const post = state.posts.find(p => p.id === action.postId);
      if (!post || post.likedBy.includes(action.botId)) return state;
      if (action.botId === state.currentUserId) return state;
      return {
        ...state,
        posts: state.posts.map(p =>
          p.id === post.id
            ? { ...p, likedBy: [...p.likedBy, action.botId] }
            : p,
        ),
        notifications: withNotification(
          state.notifications,
          post.authorId,
          'like',
          action.botId,
          post.id,
        ),
      };
    }

    case 'BOT_COMMENT': {
      const post = state.posts.find(p => p.id === action.comment.postId);
      if (!post || action.comment.authorId === state.currentUserId) return state;
      return {
        ...state,
        comments: [...state.comments, action.comment],
        notifications: withNotification(
          state.notifications,
          post.authorId,
          'comment',
          action.comment.authorId,
          post.id,
        ),
      };
    }

    default:
      return state;
  }
}
