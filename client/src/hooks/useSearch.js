import { useQuery } from '@tanstack/react-query';
import { tagsApi, usersApi } from '../lib/api';
import { keys } from '../lib/queryClient';
import { useDebounce } from './useDebounce';

// Debounced so typing "ananya" sends one request instead of six.
export function useSearch(rawQuery, delay = 250) {
  const q = useDebounce(rawQuery.trim(), delay);
  const enabled = q.length > 0;

  const users = useQuery({
    queryKey: keys.search(`users:${q}`),
    queryFn: () => usersApi.search(q),
    enabled: enabled && !q.startsWith('#'),
    staleTime: 60 * 1000,
  });

  const tags = useQuery({
    queryKey: keys.search(`tags:${q}`),
    queryFn: () => tagsApi.search(q),
    enabled: enabled && !q.startsWith('@'),
    staleTime: 60 * 1000,
  });

  return {
    q,
    users: enabled ? users.data?.users ?? [] : [],
    tags: enabled ? tags.data?.tags ?? [] : [],
    isLoading: enabled && (users.isFetching || tags.isFetching),
    isSettled: rawQuery.trim() === q,
    isError: users.isError || tags.isError,
  };
}
