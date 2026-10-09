import { useInfiniteQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import Modal from '../ui/Modal';
import { UserRowSkeleton } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/States';
import Spinner from '../ui/Spinner';
import UserRow from './UserRow';

// Used for followers, following and "liked by". The query only runs while the
// modal is open, and stays cached for a quick reopen.
export default function UserListModal({ open, onClose, title, queryKey, fetchPage, emptyText }) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: open,
  });

  const users = query.data?.pages.flatMap((page) => page.users) ?? [];

  let content;
  if (query.isPending) content = <UserRowSkeleton count={4} />;
  else if (query.isError) content = <ErrorState error={query.error} onRetry={query.refetch} />;
  else if (!users.length) content = <EmptyState icon={Users} title={emptyText} />;
  else {
    content = (
      <ul className="divide-y-2 divide-dotted divide-rule">
        {users.map((user) => (
          <li key={user._id} className="py-3 first:pt-0 last:pb-0">
            <UserRow user={user} showBio onNavigate={onClose} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="px-5 py-4">
        {content}
        {query.hasNextPage && (
          <button
            type="button"
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
            className="btn-ghost mt-4 w-full"
          >
            {query.isFetchingNextPage ? <Spinner className="size-4" /> : 'Show more'}
          </button>
        )}
      </div>
    </Modal>
  );
}
