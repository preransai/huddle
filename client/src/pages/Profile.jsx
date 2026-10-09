import { Link, useParams, useSearchParams } from 'react-router';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { PenLine, UserX } from 'lucide-react';
import ProfileHeader from '../components/profile/ProfileHeader';
import MediaGrid from '../components/profile/MediaGrid';
import PostList from '../components/posts/PostList';
import Tabs from '../components/ui/Tabs';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import { useAuth } from '../context/AuthContext';
import { postsApi, usersApi } from '../lib/api';
import { keys } from '../lib/queryClient';

const TABS = [
  { value: 'posts', label: 'Posts' },
  { value: 'media', label: 'Media' },
];

function ProfileSkeleton() {
  return (
    // An unprinted poster: dashed outline, no plate yet.
    <div className="sheet overflow-hidden border-dashed border-ink-3" role="status" aria-label="Loading profile">
      <Skeleton className="aspect-[3/1] border-b-2 border-dashed border-ink-3" />
      <div className="px-4 pb-6 sm:px-6">
        <Skeleton className="-mt-12 size-24 rounded-full shadow-[0_0_0_5px_var(--hd-sheet)] sm:-mt-[62px] sm:size-[120px]" />
        <Skeleton className="mt-4 h-6 w-48" />
        <Skeleton className="mt-2 h-4 w-28" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </div>
    </div>
  );
}

export default function Profile() {
  const username = useParams().username.toLowerCase();
  const { user: me } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'media' ? 'media' : 'posts';

  const profileQuery = useQuery({
    queryKey: keys.profile(username),
    queryFn: () => usersApi.profile(username),
  });
  const profile = profileQuery.data?.user;

  const postsQuery = useInfiniteQuery({
    queryKey: keys.userPosts(profile?._id, tab === 'media'),
    queryFn: ({ pageParam }) => postsApi.byUser(profile._id, pageParam, tab === 'media'),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(profile),
  });

  if (profileQuery.isPending) return <ProfileSkeleton />;
  if (profileQuery.isError) {
    const notFound = profileQuery.error?.response?.status === 404;
    return (
      <div className="sheet">
        {notFound ? (
          <EmptyState
            icon={UserX}
            title="This account doesn't exist"
            message={`Nobody on Huddle goes by @${username}. Check the spelling or try searching.`}
            action={<Link to="/search" className="btn-primary">Search people</Link>}
          />
        ) : (
          <ErrorState error={profileQuery.error} onRetry={profileQuery.refetch} title="Couldn't load this profile" />
        )}
      </div>
    );
  }

  const isMe = me?._id === profile._id;

  return (
    <>
      <title>{`${profile.name} (@${profile.username}) | Huddle`}</title>
      <ProfileHeader profile={profile} />
      <div className="sheet mt-7.5 mb-7.5 overflow-hidden">
        <Tabs
          tabs={TABS}
          value={tab}
          onChange={(value) => setParams(value === 'media' ? { tab: 'media' } : {}, { replace: true })}
        />
        {tab === 'media' && (
          <div className="border-t-2 border-line">
            <MediaGrid query={postsQuery} isMe={isMe} />
          </div>
        )}
      </div>
      {tab === 'posts' && (
        <PostList
          query={postsQuery}
          empty={
            <EmptyState
              icon={PenLine}
              title={isMe ? "You haven't posted yet" : 'No posts yet'}
              message={isMe ? 'Share your first post from the home page.' : `When @${profile.username} posts, it will show up here.`}
            />
          }
        />
      )}
    </>
  );
}
