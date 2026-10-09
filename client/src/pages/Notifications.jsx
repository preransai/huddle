import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BellOff, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '../components/layout/PageHeader';
import NotificationItem from '../components/notifications/NotificationItem';
import Spinner from '../components/ui/Spinner';
import { UserRowSkeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useUnreadCount } from '../hooks/useUnreadCount';
import { errorMessage, notificationsApi } from '../lib/api';
import { keys } from '../lib/queryClient';

export default function Notifications() {
  const queryClient = useQueryClient();
  const unread = useUnreadCount();

  const query = useInfiniteQuery({
    queryKey: keys.notifications,
    queryFn: ({ pageParam }) => notificationsApi.list(pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
  const sentinelRef = useInfiniteScroll(query);

  const markAll = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      queryClient.setQueryData(keys.unreadCount, { count: 0 });
      queryClient.setQueryData(keys.notifications, (data) => data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          notifications: page.notifications.map((n) => ({ ...n, read: true })),
        })),
      });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  let content;
  if (query.isPending) {
    content = (
      <div className="p-5">
        <UserRowSkeleton count={6} />
      </div>
    );
  } else if (query.isError) {
    content = <ErrorState error={query.error} onRetry={query.refetch} title="Couldn't load notifications" />;
  } else {
    const notifications = query.data.pages.flatMap((page) => page.notifications);
    content = notifications.length ? (
      <>
        <ul className="divide-y-2 divide-dotted divide-rule">
          {notifications.map((n) => (
            <NotificationItem key={n._id} notification={n} />
          ))}
        </ul>
        <div ref={sentinelRef} />
        {query.isFetchingNextPage && (
          <div className="flex justify-center border-t-2 border-dotted border-rule py-4">
            <Spinner className="size-5 text-ink-3" />
          </div>
        )}
      </>
    ) : (
      <EmptyState
        icon={BellOff}
        title="No notifications yet"
        message="When someone likes, comments on or mentions your posts, or follows you, you'll see it here."
      />
    );
  }

  return (
    <>
      <PageHeader title="Notifications" subtitle={unread ? `${unread} unread` : 'You are all caught up'}>
        <button
          type="button"
          onClick={() => markAll.mutate()}
          disabled={!unread || markAll.isPending}
          className="btn-secondary shrink-0 gap-1.5 px-3 py-1.5 text-[13px] max-sm:px-2.5 max-sm:text-[12.5px]"
        >
          {markAll.isPending ? <Spinner className="size-4" /> : <CheckCheck className="size-4" aria-hidden="true" />}
          Mark all as read
        </button>
      </PageHeader>
      <div className="sheet overflow-hidden">{content}</div>
    </>
  );
}
