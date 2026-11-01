import type { AppState } from '../types';

const now = Date.now();
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Mock users act as the "other people" in the app. The current user is created at login.
export const seedState: AppState = {
  currentUserId: null,
  users: {
    u_alice: {
      id: 'u_alice',
      username: 'alice',
      bio: 'Coffee first, code second.',
      followers: ['u_bob', 'u_carol'],
      following: ['u_bob', 'u_carol'],
    },
    u_bob: {
      id: 'u_bob',
      username: 'bob',
      bio: 'Mobile developer. Ships on Fridays.',
      followers: ['u_alice'],
      following: ['u_alice'],
    },
    u_carol: {
      id: 'u_carol',
      username: 'carol',
      bio: 'Photography and long hikes.',
      followers: ['u_alice', 'u_dave'],
      following: ['u_alice'],
    },
    u_dave: {
      id: 'u_dave',
      username: 'dave',
      bio: 'Here for the memes.',
      followers: [],
      following: ['u_carol'],
    },
  },
  posts: [
    {
      id: 'p_1',
      authorId: 'u_alice',
      text: 'Just shipped my first React Native screen. Hot reload still feels like magic.',
      likedBy: ['u_bob', 'u_carol'],
      createdAt: now - 2 * HOUR,
    },
    {
      id: 'p_2',
      authorId: 'u_bob',
      text: 'Tip: keep your FlatList keyExtractor stable. Your scroll will thank you.',
      likedBy: ['u_alice'],
      createdAt: now - 5 * HOUR,
    },
    {
      id: 'p_3',
      authorId: 'u_carol',
      text: 'Golden hour at the lake.',
      imageUrl: 'https://picsum.photos/seed/lake/800/500',
      likedBy: ['u_alice', 'u_bob', 'u_dave'],
      createdAt: now - 1 * DAY,
    },
    {
      id: 'p_4',
      authorId: 'u_dave',
      text: 'Monday again. Coffee is doing its best.',
      likedBy: [],
      createdAt: now - 2 * DAY,
    },
  ],
  comments: [
    {
      id: 'c_1',
      postId: 'p_1',
      authorId: 'u_bob',
      text: 'Welcome to the club!',
      createdAt: now - 1.5 * HOUR,
    },
    {
      id: 'c_2',
      postId: 'p_1',
      authorId: 'u_carol',
      text: 'Looks great, what did you build?',
      createdAt: now - 1 * HOUR,
    },
    {
      id: 'c_3',
      postId: 'p_3',
      authorId: 'u_alice',
      text: 'Wow, gorgeous shot.',
      createdAt: now - 20 * HOUR,
    },
  ],
  notifications: [],
};
