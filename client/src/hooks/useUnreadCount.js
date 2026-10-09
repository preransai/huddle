import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../lib/api';
import { keys } from '../lib/queryClient';

// Fetched once, then kept current by socket events (see useNotificationSocket).
// The occasional refetch is a safety net in case the socket dropped an event
// while reconnecting.
export function useUnreadCount() {
  const { data } = useQuery({
    queryKey: keys.unreadCount,
    queryFn: notificationsApi.unreadCount,
    refetchInterval: 2 * 60 * 1000,
  });
  return data?.count ?? 0;
}
