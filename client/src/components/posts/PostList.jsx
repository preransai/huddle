import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { FeedSkeleton, PostSkeleton } from '../ui/Skeleton';
import { ErrorState } from '../ui/States';
import PostCard from './PostCard';

// Renders any paginated post query (feed, profile, hashtag, latest) with the
// same loading, error, empty and infinite-scroll behaviour. Flyers sit 30px apart: room for
// each thumbtack above and each plate below.
export default function PostList({ query, empty }) {
  const { data, isPending, isError, error, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  const sentinelRef = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });

  if (isPending) return <FeedSkeleton />;
  if (isError) {
    return (
      <div className="sheet">
        <ErrorState error={error} onRetry={refetch} title="Couldn't load posts" />
      </div>
    );
  }

  const posts = data.pages.flatMap((page) => page.posts);
  if (!posts.length) return <div className="sheet">{empty}</div>;

  return (
    <div>
      <div className="space-y-7.5">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
      <div ref={sentinelRef} />
      {isFetchingNextPage && (
        <div className="mt-7.5">
          <PostSkeleton />
        </div>
      )}
      {!hasNextPage && posts.length > 5 && (
        <p className="mt-2 py-6 text-center type-meta">That's everything on the board.</p>
      )}
    </div>
  );
}
