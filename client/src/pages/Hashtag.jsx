import { useParams } from 'react-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Hash } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import PostList from '../components/posts/PostList';
import { EmptyState } from '../components/ui/States';
import { postsApi } from '../lib/api';
import { keys } from '../lib/queryClient';
import { pluralize } from '../utils/format';

export default function Hashtag() {
  const tag = useParams().tag.toLowerCase();

  const query = useInfiniteQuery({
    queryKey: keys.tag(tag),
    queryFn: ({ pageParam }) => postsApi.byTag(tag, pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const total = query.data?.pages[0]?.total;

  return (
    <>
      <PageHeader
        title={`#${tag}`}
        subtitle={total !== undefined ? pluralize(total, 'post') : 'Loading posts'}
        back
      />
      <PostList
        query={query}
        empty={
          <EmptyState
            icon={Hash}
            title={`No posts with #${tag} yet`}
            message="Use this hashtag in a post and it will show up here."
          />
        }
      />
    </>
  );
}
