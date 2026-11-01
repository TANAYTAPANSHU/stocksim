import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import { seedState } from '../data/seed';
import type { AppState, Comment, User } from '../types';
import { newId, reducer } from './reducer';

// Mock users that react to the current user's posts, so the Notifications tab has something to show.
const BOT_IDS = ['u_alice', 'u_bob', 'u_carol', 'u_dave'];
const BOT_COMMENTS = ['Nice post!', 'Love this.', 'Great share.'];

type AppContextValue = {
  state: AppState;
  currentUser: User | null;
  login: (username: string) => void;
  logout: () => void;
  createPost: (text: string, imageUrl?: string) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  toggleFollow: (userId: string) => void;
  markNotificationsRead: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, seedState);

  const login = useCallback((username: string) => {
    dispatch({ type: 'LOGIN', id: newId('u'), username });
  }, []);

  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);

  const createPost = useCallback((text: string, imageUrl?: string) => {
    const postId = newId('p');
    dispatch({ type: 'CREATE_POST', id: postId, text, imageUrl });

    // Simulated activity: a bot likes the post after 2s, another bot comments after 4s.
    setTimeout(() => {
      dispatch({ type: 'BOT_LIKE', postId, botId: pickRandom(BOT_IDS) });
    }, 2000);
    setTimeout(() => {
      const comment: Comment = {
        id: newId('c'),
        postId,
        authorId: pickRandom(BOT_IDS),
        text: pickRandom(BOT_COMMENTS),
        createdAt: Date.now(),
      };
      dispatch({ type: 'BOT_COMMENT', comment });
    }, 4000);
  }, []);

  const toggleLike = useCallback((postId: string) => {
    dispatch({ type: 'TOGGLE_LIKE', postId });
  }, []);

  const addComment = useCallback((postId: string, text: string) => {
    dispatch({ type: 'ADD_COMMENT', id: newId('c'), postId, text });
  }, []);

  const toggleFollow = useCallback((userId: string) => {
    dispatch({ type: 'TOGGLE_FOLLOW', userId });
  }, []);

  const markNotificationsRead = useCallback(() => {
    dispatch({ type: 'MARK_NOTIFICATIONS_READ' });
  }, []);

  const currentUser = state.currentUserId
    ? state.users[state.currentUserId] ?? null
    : null;

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      currentUser,
      login,
      logout,
      createPost,
      toggleLike,
      addComment,
      toggleFollow,
      markNotificationsRead,
    }),
    [
      state,
      currentUser,
      login,
      logout,
      createPost,
      toggleLike,
      addComment,
      toggleFollow,
      markNotificationsRead,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
}
