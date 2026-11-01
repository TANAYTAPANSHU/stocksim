import { seedState } from '../src/data/seed';
import { reducer } from '../src/store/reducer';

describe('login', () => {
  test('creates a new user and logs them in', () => {
    const state = reducer(seedState, { type: 'LOGIN', id: 'u_new', username: 'Eve' });
    expect(state.currentUserId).toBe('u_new');
    expect(state.users.u_new.username).toBe('eve');
  });

  test('logs in an existing user instead of duplicating', () => {
    const state = reducer(seedState, { type: 'LOGIN', id: 'u_x', username: 'alice' });
    expect(state.currentUserId).toBe('u_alice');
    expect(state.users.u_x).toBeUndefined();
  });
});

describe('posts', () => {
  test('new post goes to the top with the current user as author', () => {
    const logged = reducer(seedState, { type: 'LOGIN', id: 'u_me', username: 'me_user' });
    const state = reducer(logged, { type: 'CREATE_POST', id: 'p_new', text: 'hi' });
    expect(state.posts[0].id).toBe('p_new');
    expect(state.posts[0].authorId).toBe('u_me');
  });

  test('creating a post while logged out does nothing', () => {
    const state = reducer(seedState, { type: 'CREATE_POST', id: 'p_new', text: 'hi' });
    expect(state.posts).toHaveLength(seedState.posts.length);
  });
});

describe('likes', () => {
  test('liking adds the user and notifies the author', () => {
    const logged = reducer(seedState, { type: 'LOGIN', id: 'u_me', username: 'me_user' });
    const state = reducer(logged, { type: 'TOGGLE_LIKE', postId: 'p_1' });
    const post = state.posts.find(p => p.id === 'p_1');
    expect(post?.likedBy).toContain('u_me');
    expect(state.notifications[0]).toMatchObject({
      recipientId: 'u_alice',
      type: 'like',
      actorId: 'u_me',
      read: false,
    });
  });

  test('liking twice toggles it back off without a new notification', () => {
    const logged = reducer(seedState, { type: 'LOGIN', id: 'u_me', username: 'me_user' });
    const liked = reducer(logged, { type: 'TOGGLE_LIKE', postId: 'p_1' });
    const unliked = reducer(liked, { type: 'TOGGLE_LIKE', postId: 'p_1' });
    expect(unliked.posts.find(p => p.id === 'p_1')?.likedBy).not.toContain('u_me');
    expect(unliked.notifications).toHaveLength(1);
  });

  test('liking your own post does not notify you', () => {
    const logged = reducer(seedState, { type: 'LOGIN', id: 'u_me', username: 'me_user' });
    const posted = reducer(logged, { type: 'CREATE_POST', id: 'p_mine', text: 'x' });
    const state = reducer(posted, { type: 'TOGGLE_LIKE', postId: 'p_mine' });
    expect(state.notifications).toHaveLength(0);
  });
});

describe('comments', () => {
  test('adding a comment stores it and notifies the author', () => {
    const logged = reducer(seedState, { type: 'LOGIN', id: 'u_me', username: 'me_user' });
    const state = reducer(logged, {
      type: 'ADD_COMMENT',
      id: 'c_new',
      postId: 'p_2',
      text: 'Great tip',
    });
    expect(state.comments.find(c => c.id === 'c_new')).toMatchObject({
      postId: 'p_2',
      authorId: 'u_me',
      text: 'Great tip',
    });
    expect(state.notifications[0]).toMatchObject({ recipientId: 'u_bob', type: 'comment' });
  });
});

describe('follow', () => {
  test('following updates both sides and notifies the target', () => {
    const logged = reducer(seedState, { type: 'LOGIN', id: 'u_me', username: 'me_user' });
    const state = reducer(logged, { type: 'TOGGLE_FOLLOW', userId: 'u_dave' });
    expect(state.users.u_me.following).toContain('u_dave');
    expect(state.users.u_dave.followers).toContain('u_me');
    expect(state.notifications[0]).toMatchObject({ recipientId: 'u_dave', type: 'follow' });
  });

  test('unfollowing reverses the follow', () => {
    const logged = reducer(seedState, { type: 'LOGIN', id: 'u_me', username: 'me_user' });
    const followed = reducer(logged, { type: 'TOGGLE_FOLLOW', userId: 'u_dave' });
    const unfollowed = reducer(followed, { type: 'TOGGLE_FOLLOW', userId: 'u_dave' });
    expect(unfollowed.users.u_me.following).not.toContain('u_dave');
    expect(unfollowed.users.u_dave.followers).not.toContain('u_me');
  });
});

describe('bot activity and notifications', () => {
  test('bot like on my post creates a notification for me', () => {
    const logged = reducer(seedState, { type: 'LOGIN', id: 'u_me', username: 'me_user' });
    const posted = reducer(logged, { type: 'CREATE_POST', id: 'p_mine', text: 'x' });
    const state = reducer(posted, { type: 'BOT_LIKE', postId: 'p_mine', botId: 'u_bob' });
    expect(state.posts[0].likedBy).toEqual(['u_bob']);
    expect(state.notifications[0]).toMatchObject({ recipientId: 'u_me', type: 'like' });
  });

  test('marking notifications read only affects the current user', () => {
    const logged = reducer(seedState, { type: 'LOGIN', id: 'u_me', username: 'me_user' });
    const posted = reducer(logged, { type: 'CREATE_POST', id: 'p_mine', text: 'x' });
    const withLike = reducer(posted, { type: 'BOT_LIKE', postId: 'p_mine', botId: 'u_bob' });
    const withOther = {
      ...withLike,
      notifications: [
        ...withLike.notifications,
        { ...withLike.notifications[0], id: 'n_other', recipientId: 'u_alice', read: false },
      ],
    };
    const state = reducer(withOther, { type: 'MARK_NOTIFICATIONS_READ' });
    expect(state.notifications.find(n => n.id === 'n_other')?.read).toBe(false);
    expect(state.notifications.find(n => n.recipientId === 'u_me')?.read).toBe(true);
  });
});
