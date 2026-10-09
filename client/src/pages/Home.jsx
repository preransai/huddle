import { Link } from 'react-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import PostComposer from '../components/posts/PostComposer';
import PostList from '../components/posts/PostList';
import { EmptyState } from '../components/ui/States';
import { postsApi } from '../lib/api';
import { keys } from '../lib/queryClient';

export default function Home() {
  const feed = useInfiniteQuery({
    queryKey: keys.feed,
    queryFn: ({ pageParam }) => postsApi.feed(pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  return (
    <>
      <title>Home | Huddle</title>
      <h1 className="sr-only">Home</h1>
      {/* The slip you are about to pin up: pressable, so a solid pink pass; no tack or plate yet. */}
      <div className="sheet mb-7.5 shadow-pass-pink max-sm:mr-[5px]">
        <PostComposer />
      </div>
      <PostList
        query={feed}
        empty={
          <EmptyState
            icon={Users}
            title="Nothing pinned up yet"
            message="Posts from people you follow show up here. Find a few people to follow on Explore."
            action={
              <Link to="/explore" className="btn-primary">
                Explore Huddle
              </Link>
            }
          />
        }
      />
    </>
  );
}
