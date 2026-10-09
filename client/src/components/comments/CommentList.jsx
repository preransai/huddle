import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import CommentItem from './CommentItem';
import Spinner from '../ui/Spinner';
import { UserRowSkeleton } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/States';
import { useAuth } from '../../context/AuthContext';
import { errorMessage, postsApi } from '../../lib/api';
import { keys } from '../../lib/queryClient';
import { updatePost } from '../../lib/cache';

export default function CommentList({ post }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: keys.comments(post._id),
    queryFn: ({ pageParam }) => postsApi.comments(post._id, pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const remove = useMutation({
    mutationFn: (comment) => postsApi.removeComment(comment._id),
    onSuccess: ({ commentsCount }, comment) => {
      queryClient.setQueryData(keys.comments(post._id), (data) => data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          comments: page.comments.filter((c) => c._id !== comment._id),
        })),
      });
      updatePost(queryClient, post._id, (p) => ({ ...p, commentsCount }));
      toast.success('Comment deleted');
    },
    onError: (error) => toast.error(errorMessage(error, 'Could not delete the comment')),
  });

  if (query.isPending) return <UserRowSkeleton count={3} />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} title="Couldn't load comments" />;

  // Pages arrive newest first, but a thread reads better top to bottom, so the
  // loaded comments are shown oldest first and older pages load in above them.
  const comments = query.data.pages.flatMap((page) => page.comments).reverse();
  if (!comments.length) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="No comments yet"
        message="Start the conversation."
        className="py-8"
      />
    );
  }

  const isPostOwner = user?._id === post.author._id;

  return (
    <>
      {query.hasNextPage && (
        <button
          type="button"
          onClick={() => query.fetchNextPage()}
          disabled={query.isFetchingNextPage}
          className="btn-ghost mb-4 w-full"
        >
          {query.isFetchingNextPage ? <Spinner className="size-4" /> : 'Show older comments'}
        </button>
      )}
      <ul className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            canDelete={isPostOwner || comment.author._id === user?._id}
            onDelete={() => remove.mutate(comment)}
            deleting={remove.isPending && remove.variables?._id === comment._id}
          />
        ))}
      </ul>
    </>
  );
}
