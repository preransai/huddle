import { useState } from 'react';
import { Link } from 'react-router';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import Avatar from '../ui/Avatar';
import ConfirmDialog from '../ui/ConfirmDialog';
import { Tack } from '../ui/Print';
import UserListModal from '../users/UserListModal';
import RichText from './RichText';
import ImageGrid from './ImageGrid';
import PostMenu from './PostMenu';
import { useAuth } from '../../context/AuthContext';
import { useDeletePost, useToggleLike } from '../../hooks/usePostActions';
import { postsApi } from '../../lib/api';
import { keys } from '../../lib/queryClient';
import { compactNumber, cn } from '../../utils/format';
import { printRun } from '../../utils/print';
import { fullDate, shortTime } from '../../utils/time';

// A post is a flyer pinned to the board: a sheet with a thumbtack on top and its frame printed
// a second time in the post's run ink, a few px off and a hair skewed (the "plate"). The run is
// derived from the post id, so a post looks the same wherever it appears.
// The article must stay a non-clipping, non-stacking `relative` box, or the plate breaks.
export default function PostCard({ post, detailed = false, onDeleted }) {
  const { user } = useAuth();
  const toggleLike = useToggleLike();
  const deletePost = useDeletePost();
  const [showLikes, setShowLikes] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Only stamp the heart when the user clicks it, not for posts that load already liked.
  const [animateLike, setAnimateLike] = useState(false);

  const { author } = post;
  const isOwn = user?._id === author._id;
  const postUrl = `/post/${post._id}`;
  const run = printRun(post._id);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${postUrl}`);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Could not copy the link');
    }
  };

  const handleDelete = () => {
    deletePost.mutate(post, {
      onSuccess: () => {
        setConfirmDelete(false);
        onDeleted?.();
      },
    });
  };

  return (
    <article
      aria-label={`Post by ${author.name}`}
      style={{ '--plate-r': `${run.plateR}deg` }}
      className={cn('sheet plate relative px-4 pt-5 pb-2 max-sm:mr-[5px] sm:px-[22px] sm:pt-6', run.plate)}
    >
      <Tack className={run.tack} x={run.tackX} />
      <header className="flex items-start gap-3">
        <Link to={`/${author.username}`} className="shrink-0 rounded-full">
          <Avatar user={author} />
        </Link>
        <div className="min-w-0 flex-1 pt-px">
          <Link
            to={`/${author.username}`}
            className="block truncate type-name decoration-2 underline-offset-2 hover:underline"
          >
            {author.name}
          </Link>
          <p className="truncate type-meta">
            @{author.username}
            <span aria-hidden="true"> · </span>
            <Link to={postUrl} className="rounded-xs decoration-2 hover:underline" title={fullDate(post.createdAt)}>
              <time dateTime={post.createdAt}>{shortTime(post.createdAt)}</time>
            </Link>
          </p>
        </div>
        <PostMenu isOwn={isOwn} onCopyLink={copyLink} onDelete={() => setConfirmDelete(true)} />
      </header>

      <RichText
        text={post.text}
        className={cn(
          'mt-3 break-words whitespace-pre-wrap text-ink',
          detailed ? 'text-[19px] leading-normal' : 'type-post'
        )}
      />
      <ImageGrid
        images={post.images}
        alt={`Photo shared by ${author.name}`}
        tape={run.tape}
        tapeX={run.tackX * -4}
      />

      {detailed && <p className="mt-3.5 type-meta">{fullDate(post.createdAt)}</p>}

      {/* The dotted rule runs the width of the text column; the buttons sit 4px wider so their
          icons line up optically with the text edge. */}
      <footer className="mt-3 border-t-2 border-dotted border-rule pt-2">
        <div className="-mx-1 flex items-center gap-0.5 text-sm text-ink-2">
        <div className="flex items-center">
          {/* Liking stamps the heart in pink ink; the ink outline and aria-pressed carry the state too. */}
          <button
            type="button"
            onClick={() => {
              setAnimateLike(!post.liked);
              toggleLike.mutate({ post });
            }}
            aria-pressed={post.liked}
            aria-label={post.liked ? 'Unlike' : 'Like'}
            className="icon-btn hover:bg-pink-tint"
          >
            <Heart
              className={cn(
                'size-[19px]',
                post.liked && '-rotate-8 fill-riso-pink',
                post.liked && animateLike && 'animate-stamp'
              )}
              strokeWidth={2.2}
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            onClick={() => setShowLikes(true)}
            disabled={!post.likesCount}
            className="min-w-6 rounded-sm px-1 py-1 text-left font-semibold text-ink tabular-nums decoration-2 underline-offset-2 hover:underline disabled:no-underline"
            aria-label={`See who liked this (${post.likesCount})`}
          >
            {compactNumber(post.likesCount)}
          </button>
        </div>

        <Link
          to={postUrl}
          className="ml-2 inline-flex items-center gap-1.5 rounded-sm border-2 border-transparent py-1.5 pr-2.5 pl-2 font-semibold tabular-nums hover:border-line hover:text-ink"
          aria-label={`Comments (${post.commentsCount})`}
        >
          <MessageCircle className="size-[19px]" strokeWidth={2.2} aria-hidden="true" />
          {compactNumber(post.commentsCount)}
        </Link>

        <button type="button" onClick={copyLink} className="icon-btn ml-auto" aria-label="Copy link to post">
          <Share2 className="size-[18px]" strokeWidth={2.2} aria-hidden="true" />
        </button>
        </div>
      </footer>

      <UserListModal
        open={showLikes}
        onClose={() => setShowLikes(false)}
        title="Liked by"
        queryKey={keys.likes(post._id)}
        fetchPage={(cursor) => postsApi.likes(post._id, cursor)}
        emptyText="No likes yet."
      />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        pending={deletePost.isPending}
        title="Delete this post?"
        message="It will be removed from your profile, the feeds of your followers and search. This can't be undone."
        confirmLabel="Delete"
      />
    </article>
  );
}
