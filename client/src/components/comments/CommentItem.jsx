import { Link } from 'react-router';
import { Trash2 } from 'lucide-react';
import Avatar from '../ui/Avatar';
import RichText from '../posts/RichText';
import { fullDate, relativeTime } from '../../utils/time';

// A comment is somebody talking about the flyer: a lettered speech balloon whose tail points at
// the speaker's avatar.
export default function CommentItem({ comment, canDelete, onDelete, deleting }) {
  const { author } = comment;

  return (
    <li className="flex items-start gap-3.5">
      <Link to={`/${author.username}`} className="shrink-0 rounded-full">
        <Avatar user={author} size="sm" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="balloon">
          <div className="flex min-w-0 items-baseline gap-2">
            <Link
              to={`/${author.username}`}
              className="max-w-full shrink-0 truncate font-display text-[15px] font-bold tracking-[-0.01em] [font-stretch:94%] decoration-2 underline-offset-2 hover:underline"
            >
              {author.name}
            </Link>
            <span className="min-w-0 truncate type-meta text-[13px]">@{author.username}</span>
          </div>
          <RichText
            text={comment.text}
            className="mt-[3px] text-[15px] leading-[1.45] break-words whitespace-pre-wrap text-ink"
          />
        </div>
        <div className="mt-[5px] ml-0.5 flex items-center gap-3.5 text-[13px] text-ink-3">
          <time dateTime={comment.createdAt} title={fullDate(comment.createdAt)}>
            {relativeTime(comment.createdAt)}
          </time>
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1 rounded-xs font-semibold hover:text-danger-ink disabled:opacity-50"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              {deleting ? 'Deleting' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
