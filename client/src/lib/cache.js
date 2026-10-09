import { keys } from './queryClient';

// A post can be cached in several places at once (home feed, a profile tab, a
// hashtag page, trending, its own detail page). These helpers update every copy
// so a like on the feed is still there when you open the post.

function mapPostData(data, postId, fn) {
  if (!data) return data;
  const mapList = (posts) =>
    posts.map((post) => (post._id === postId ? fn(post) : post)).filter(Boolean);

  if (data.pages) {
    return { ...data, pages: data.pages.map((page) => ({ ...page, posts: mapList(page.posts) })) };
  }
  if (data.posts) return { ...data, posts: mapList(data.posts) };
  return data;
}

// fn receives a post and returns the updated post, or null to remove it.
export function updatePost(queryClient, postId, fn) {
  queryClient.setQueriesData({ queryKey: ['posts'] }, (data) => mapPostData(data, postId, fn));
  queryClient.setQueryData(keys.post(postId), (data) => {
    if (!data?.post) return data;
    const post = fn(data.post);
    return post ? { ...data, post } : data;
  });
}

function mapUserLists(data, userId, fn) {
  if (!data) return data;
  const mapList = (users) => users.map((user) => (user._id === userId ? fn(user) : user));
  if (data.pages) {
    return { ...data, pages: data.pages.map((page) => ({ ...page, users: mapList(page.users) })) };
  }
  if (data.users) return { ...data, users: mapList(data.users) };
  return data;
}

// Follow state shows up in profile headers and in every list of users.
export function updateUser(queryClient, userId, fn) {
  for (const prefix of ['connections', 'likes', 'suggestions', 'search']) {
    queryClient.setQueriesData({ queryKey: [prefix] }, (data) => mapUserLists(data, userId, fn));
  }
  queryClient.setQueriesData({ queryKey: ['profile'] }, (data) =>
    data?.user?._id === userId ? { ...data, user: fn(data.user) } : data
  );
}

// Snapshot of everything the helpers above can touch, for rolling back a
// failed optimistic update.
export function snapshot(queryClient) {
  const prefixes = ['posts', 'post', 'connections', 'likes', 'suggestions', 'search', 'profile'];
  return prefixes.flatMap((prefix) => queryClient.getQueriesData({ queryKey: [prefix] }));
}

export function restore(queryClient, saved) {
  for (const [key, data] of saved) queryClient.setQueryData(key, data);
}
