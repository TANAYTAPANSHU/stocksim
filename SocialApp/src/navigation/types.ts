export type RootStackParamList = {
  Login: undefined;
  Tabs: undefined;
  PostDetail: { postId: string };
  UserProfile: { userId: string };
};

export type TabParamList = {
  Feed: undefined;
  Search: undefined;
  Create: undefined;
  Notifications: undefined;
  Profile: undefined;
};
