import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { errorMessage, usersApi } from '../lib/api';
import { keys } from '../lib/queryClient';
import { restore, snapshot, updateUser } from '../lib/cache';
import { useAuth } from '../context/AuthContext';

export function useFollow() {
  const queryClient = useQueryClient();
  const { user: me, setUser } = useAuth();

  return useMutation({
    mutationFn: (user) => (user.isFollowing ? usersApi.unfollow(user._id) : usersApi.follow(user._id)),
    onMutate: async (user) => {
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      const saved = snapshot(queryClient);
      const delta = user.isFollowing ? -1 : 1;
      updateUser(queryClient, user._id, (u) => ({
        ...u,
        isFollowing: !user.isFollowing,
        followersCount: Math.max(0, (u.followersCount ?? 0) + delta),
      }));
      return { saved, delta };
    },
    onError: (error, user, context) => {
      restore(queryClient, context.saved);
      toast.error(errorMessage(error, 'Could not update follow'));
    },
    onSuccess: (data, user, context) => {
      updateUser(queryClient, user._id, (u) => ({ ...u, followersCount: data.followersCount }));
      if (me) setUser({ ...me, followingCount: Math.max(0, (me.followingCount ?? 0) + context.delta) });
      queryClient.invalidateQueries({ queryKey: ['profile', me?.username] });
      queryClient.invalidateQueries({ queryKey: keys.feed });
    },
  });
}
