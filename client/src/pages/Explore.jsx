import { Link, useSearchParams } from 'react-router';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Flame, Hash, Sparkles } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import PostList from '../components/posts/PostList';
import Tabs from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/States';
import { postsApi, tagsApi } from '../lib/api';
import { keys } from '../lib/queryClient';

const TABS = [
  { value: 'trending', label: 'Trending' },
  { value: 'latest', label: 'Latest' },
];

function TagChips() {
  const { data } = useQuery({ queryKey: keys.trendingTags, queryFn: tagsApi.trending, staleTime: 5 * 60 * 1000 });
  if (!data?.tags.length) return null;

  return (
    // Label chips: printed tags with a 2px ink edge. The scroller gets vertical padding so focus
    // rings are not clipped on phones.
    <div className="no-scrollbar -mx-3.5 -mt-1.5 mb-3.5 flex gap-2 overflow-x-auto px-3.5 py-1.5 sm:mx-0 sm:mt-0 sm:mb-5 sm:flex-wrap sm:overflow-visible sm:p-0">
      {data.tags.map((t) => (
        <Link
          key={t.tag}
          to={`/tag/${t.tag}`}
          className="group inline-flex shrink-0 items-center gap-1 rounded-sm border-2 border-line bg-sheet px-3 py-1.5 text-sm font-semibold text-ink hover:bg-riso-yellow hover:text-riso-black"
        >
          <Hash className="size-3.5 text-blue-ink group-hover:text-riso-black" strokeWidth={2.4} aria-hidden="true" />
          {t.tag}
        </Link>
      ))}
    </div>
  );
}

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'latest' ? 'latest' : 'trending';

  // Trending is a single ranked page, but keeping it in the same infinite-query
  // shape as the other lists means likes and deletes update it the same way.
  const trending = useInfiniteQuery({
    queryKey: keys.trending,
    queryFn: async () => ({ ...(await postsApi.trending()), nextCursor: null }),
    initialPageParam: undefined,
    getNextPageParam: () => undefined,
    enabled: tab === 'trending',
  });

  const latest = useInfiniteQuery({
    queryKey: keys.latest,
    queryFn: ({ pageParam }) => postsApi.latest(pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: tab === 'latest',
  });

  return (
    <>
      <PageHeader title="Explore" subtitle="See what people across Huddle are talking about" />
      <TagChips />
      <div className="sheet mb-7.5 overflow-hidden">
        <Tabs
          tabs={TABS}
          value={tab}
          onChange={(value) => setParams(value === 'latest' ? { tab: 'latest' } : {}, { replace: true })}
        />
      </div>
      {tab === 'trending' ? (
        <PostList
          query={trending}
          empty={
            <EmptyState icon={Flame} title="Nothing trending yet" message="Posts with the most likes and comments this week will show up here." />
          }
        />
      ) : (
        <PostList
          query={latest}
          empty={<EmptyState icon={Sparkles} title="No posts yet" message="Be the first to post something." />}
        />
      )}
    </>
  );
}
