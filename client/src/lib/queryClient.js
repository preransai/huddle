import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
      retry: (count, error) => {
        const status = error?.response?.status;
        // Retrying a 404 or 403 just delays showing the error.
        if (status && status < 500) return false;
        return count < 2;
      },
    },
  },
});

// Query keys in one place so cache updates after a mutation can't drift out
// of sync with the queries that read them.
export const keys = {
  me: ['me'],
  feed: ['posts', 'feed'],
  latest: ['posts', 'latest'],
  trending: ['posts', 'trending'],
  tag: (tag) => ['posts', 'tag', tag],
  userPosts: (userId, media) => ['posts', 'user', userId, media ? 'media' : 'all'],
  post: (id) => ['post', id],
  comments: (postId) => ['comments', postId],
  likes: (postId) => ['likes', postId],
  profile: (username) => ['profile', username],
  connections: (userId, type) => ['connections', userId, type],
  suggestions: ['suggestions'],
  trendingTags: ['tags', 'trending'],
  notifications: ['notifications', 'list'],
  unreadCount: ['notifications', 'unread'],
  search: (q) => ['search', q],
};
