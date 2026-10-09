import { Link, useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { FileX } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import PostCard from '../components/posts/PostCard';
import CommentForm from '../components/comments/CommentForm';
import CommentList from '../components/comments/CommentList';
import { PostSkeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import { postsApi } from '../lib/api';
import { keys } from '../lib/queryClient';
import { pluralize } from '../utils/format';

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: keys.post(id),
    queryFn: () => postsApi.get(id),
  });

  let content;
  if (isPending) {
    content = <PostSkeleton withImage />;
  } else if (isError) {
    const status = error?.response?.status;
    content = (
      <div className="sheet">
        {status === 404 || status === 400 ? (
          <EmptyState
            icon={FileX}
            title="This post isn't available"
            message="It may have been deleted by its author."
            action={<Link to="/" className="btn-primary">Back to home</Link>}
          />
        ) : (
          <ErrorState error={error} onRetry={refetch} title="Couldn't load this post" />
        )}
      </div>
    );
  } else {
    const { post } = data;
    content = (
      <>
        <PostCard post={post} detailed onDeleted={() => navigate('/', { replace: true })} />
        {/* The letters page under the flyer: plain paper, no tack or plate. */}
        <section
          className="sheet mt-7.5 px-4 pt-3.5 pb-4 sm:px-5 sm:pt-[18px] sm:pb-5"
          aria-labelledby="comments-heading"
        >
          <h2 id="comments-heading" className="mb-[18px] border-b-2 border-line pb-2 type-h2 tabular-nums">
            {post.commentsCount ? pluralize(post.commentsCount, 'comment') : 'Comments'}
          </h2>
          <CommentList post={post} />
          <div className="mt-[22px] border-t-2 border-dotted border-rule pt-4">
            <CommentForm postId={post._id} />
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Post" back />
      {content}
    </>
  );
}
