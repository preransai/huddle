import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import UserRow from '../users/UserRow';
import { UserRowSkeleton, Skeleton } from '../ui/Skeleton';
import { tagsApi, usersApi } from '../../lib/api';
import { keys } from '../../lib/queryClient';
import { pluralize } from '../../utils/format';

// The right column is printed straight onto the board: no cards, just ruled headings.
function WhoToFollow() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: keys.suggestions,
    queryFn: usersApi.suggestions,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section aria-labelledby="who-to-follow">
      <h2 id="who-to-follow" className="mb-3 border-b-2 border-line pb-2 type-h2">
        Who to follow
      </h2>
      {isPending && <UserRowSkeleton count={3} />}
      {isError && (
        <p className="text-sm text-ink-2">
          Couldn't load suggestions.{' '}
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-sm font-bold text-blue-ink underline decoration-2 underline-offset-[3px]"
          >
            Retry
          </button>
        </p>
      )}
      {data && !data.users.length && <p className="text-sm text-ink-2">You're following everyone here. Nice.</p>}
      {data && data.users.length > 0 && (
        <ul className="space-y-3.5">
          {data.users.map((user) => (
            <li key={user._id}>
              <UserRow user={user} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function TrendingTags({ className = '' }) {
  const { data, isPending } = useQuery({
    queryKey: keys.trendingTags,
    queryFn: tagsApi.trending,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className={className} aria-labelledby="trending-tags">
      <h2 id="trending-tags" className="mb-3 border-b-2 border-line pb-2 type-h2">
        Trending this week
      </h2>
      {isPending && (
        <div className="space-y-2.5" role="status" aria-label="Loading trending tags">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-7 w-full" />
          ))}
        </div>
      )}
      {data && !data.tags.length && (
        <p className="text-sm text-ink-2">Nothing trending yet. Add a #hashtag to your next post.</p>
      )}
      {data && data.tags.length > 0 && (
        // A gig line-up: rank, tag, dotted leader, count.
        <ol>
          {data.tags.map((t, i) => (
            <li key={t.tag}>
              <Link
                to={`/tag/${t.tag}`}
                className="flex items-baseline gap-2.5 rounded-sm py-1.5 pr-1 pl-2 hover:selected-row focus-visible:selected-row"
              >
                <span className="rank w-[22px] shrink-0 type-numeral text-[20px] text-blue-ink">{i + 1}</span>
                <span className="min-w-0 truncate font-display text-[17px] font-[650] tracking-[-0.01em] [font-stretch:92%]">
                  #{t.tag}
                </span>
                <span className="leader" aria-hidden="true" />
                <span className="meta whitespace-nowrap type-meta tabular-nums">{pluralize(t.count, 'post')}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default function RightSidebar() {
  return (
    <aside className="sticky top-22 space-y-9">
      <WhoToFollow />
      <TrendingTags />
      <p className="text-[12.5px] text-ink-3">&copy; 2026 Huddle</p>
    </aside>
  );
}
