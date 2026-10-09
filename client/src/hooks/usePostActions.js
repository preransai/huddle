import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { errorMessage, postsApi } from '../lib/api';
import { keys } from '../lib/queryClient';
import { restore, snapshot, updatePost } from '../lib/cache';

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ post }) => (post.liked ? postsApi.unlike(post._id) : postsApi.like(post._id)),
    onMutate: async ({ post }) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const saved = snapshot(queryClient);
      updatePost(queryClient, post._id, (p) => ({
        ...p,
        liked: !post.liked,
        likesCount: Math.max(0, p.likesCount + (post.liked ? -1 : 1)),
      }));
      return { saved };
    },
    onError: (error, variables, context) => {
      restore(queryClient, context.saved);
      toast.error(errorMessage(error, 'Could not update the like'));
    },
    onSuccess: (data, { post }) => {
      // Trust the server's count, but only if no newer toggle has happened since.
      updatePost(queryClient, post._id, (p) =>
        p.liked === data.liked ? { ...p, likesCount: data.likesCount } : p
      );
      queryClient.invalidateQueries({ queryKey: keys.likes(post._id) });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post) => postsApi.remove(post._id),
    onSuccess: (data, post) => {
      updatePost(queryClient, post._id, () => null);
      queryClient.removeQueries({ queryKey: keys.post(post._id) });
      queryClient.invalidateQueries({ queryKey: ['profile', post.author.username] });
      queryClient.invalidateQueries({ queryKey: keys.trendingTags });
      toast.success('Post deleted');
    },
    onError: (error) => toast.error(errorMessage(error, 'Could not delete the post')),
  });
}
