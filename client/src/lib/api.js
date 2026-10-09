import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ERR_NETWORK') return 'Could not reach the server. Check your connection.';
  return fallback;
}

export function fieldErrors(error) {
  const list = error?.response?.data?.errors || [];
  return Object.fromEntries(list.map((e) => [e.field, e.message]));
}

const unwrap = (promise) => promise.then((res) => res.data);

export const authApi = {
  me: () => unwrap(api.get('/auth/me')),
  login: (body) => unwrap(api.post('/auth/login', body)),
  register: (body) => unwrap(api.post('/auth/register', body)),
  logout: () => api.post('/auth/logout'),
};

export const postsApi = {
  feed: (cursor) => unwrap(api.get('/posts/feed', { params: { cursor } })),
  latest: (cursor) => unwrap(api.get('/posts/latest', { params: { cursor } })),
  trending: () => unwrap(api.get('/posts/trending')),
  byTag: (tag, cursor) => unwrap(api.get(`/posts/tag/${encodeURIComponent(tag)}`, { params: { cursor } })),
  byUser: (userId, cursor, media) =>
    unwrap(api.get(`/users/${userId}/posts`, { params: { cursor, media: media || undefined } })),
  get: (id) => unwrap(api.get(`/posts/${id}`)),
  create: (formData) => unwrap(api.post('/posts', formData)),
  remove: (id) => api.delete(`/posts/${id}`),
  like: (id) => unwrap(api.post(`/posts/${id}/like`)),
  unlike: (id) => unwrap(api.delete(`/posts/${id}/like`)),
  likes: (id, cursor) => unwrap(api.get(`/posts/${id}/likes`, { params: { cursor } })),
  comments: (id, cursor) => unwrap(api.get(`/posts/${id}/comments`, { params: { cursor } })),
  addComment: (id, text) => unwrap(api.post(`/posts/${id}/comments`, { text })),
  removeComment: (commentId) => unwrap(api.delete(`/comments/${commentId}`)),
};

export const usersApi = {
  profile: (username) => unwrap(api.get(`/users/${encodeURIComponent(username)}`)),
  updateMe: (formData) => unwrap(api.patch('/users/me', formData)),
  follow: (id) => unwrap(api.post(`/users/${id}/follow`)),
  unfollow: (id) => unwrap(api.delete(`/users/${id}/follow`)),
  followers: (id, cursor) => unwrap(api.get(`/users/${id}/followers`, { params: { cursor } })),
  following: (id, cursor) => unwrap(api.get(`/users/${id}/following`, { params: { cursor } })),
  suggestions: () => unwrap(api.get('/users/suggestions')),
  search: (q) => unwrap(api.get('/users/search', { params: { q } })),
};

export const notificationsApi = {
  list: (cursor) => unwrap(api.get('/notifications', { params: { cursor } })),
  unreadCount: () => unwrap(api.get('/notifications/unread-count')),
  markAllRead: () => unwrap(api.post('/notifications/read-all')),
};

export const tagsApi = {
  trending: () => unwrap(api.get('/tags/trending')),
  search: (q) => unwrap(api.get('/tags/search', { params: { q } })),
};
