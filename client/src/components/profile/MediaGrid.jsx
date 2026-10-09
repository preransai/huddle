import { Link } from 'react-router';
import { Images } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/States';
import Spinner from '../ui/Spinner';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';

// A contact sheet: square frames with 2px ink gutters. Trailing cells of the last row are left
// as blank paper so the sheet stays a clean rectangle.
const GRID = 'grid grid-cols-3 gap-0.5 bg-line';

export default function MediaGrid({ query, isMe }) {
  const sentinelRef = useInfiniteScroll(query);

  if (query.isPending) {
    return (
      <div className={GRID} role="status" aria-label="Loading media">
        {Array.from({ length: 9 }, (_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    );
  }
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;

  const items = query.data.pages
    .flatMap((page) => page.posts)
    .flatMap((post) => post.images.map((image, i) => ({ post, image, key: `${post._id}-${i}` })));

  if (!items.length) {
    return (
      <EmptyState
        icon={Images}
        title="No photos yet"
        message={isMe ? 'Photos you post will show up here.' : 'Photos they post will show up here.'}
      />
    );
  }

  const blanks = (3 - (items.length % 3)) % 3;

  return (
    <>
      <ul className={GRID}>
        {items.map(({ post, image, key }) => (
          <li key={key}>
            <Link
              to={`/post/${post._id}`}
              className="group relative block aspect-square overflow-hidden bg-sheet-hi after:pointer-events-none after:absolute after:inset-0 after:border-[3px] after:border-riso-pink after:opacity-0 hover:after:opacity-100 focus-visible:outline-offset-[-3px]"
            >
              <img
                src={image.url}
                alt={post.text ? `From a post: ${post.text.slice(0, 80)}` : 'Photo from a post'}
                loading="lazy"
                className="size-full object-cover"
              />
            </Link>
          </li>
        ))}
        {Array.from({ length: blanks }, (_, i) => (
          <li key={`blank-${i}`} aria-hidden="true" className="bg-sheet" />
        ))}
      </ul>
      <div ref={sentinelRef} />
      {query.isFetchingNextPage && (
        <div className="flex justify-center border-t-2 border-line py-4">
          <Spinner className="size-5 text-ink-3" />
        </div>
      )}
    </>
  );
}
