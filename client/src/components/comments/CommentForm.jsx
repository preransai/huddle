import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import Avatar from '../ui/Avatar';
import Spinner from '../ui/Spinner';
import { useAuth } from '../../context/AuthContext';
import { errorMessage, postsApi } from '../../lib/api';
import { keys } from '../../lib/queryClient';
import { updatePost } from '../../lib/cache';
import { cn } from '../../utils/format';

const MAX_LENGTH = 300;

export default function CommentForm({ postId, autoFocus }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');

  const add = useMutation({
    mutationFn: () => postsApi.addComment(postId, text.trim()),
    onSuccess: ({ comment, commentsCount }) => {
      queryClient.setQueryData(keys.comments(postId), (data) => {
        if (!data) return data;
        const [first, ...rest] = data.pages;
        return { ...data, pages: [{ ...first, comments: [comment, ...first.comments] }, ...rest] };
      });
      updatePost(queryClient, postId, (post) => ({ ...post, commentsCount }));
      setText('');
    },
    onError: (error) => toast.error(errorMessage(error, 'Could not add your comment')),
  });

  const canSend = text.trim() && text.length <= MAX_LENGTH && !add.isPending;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (canSend) add.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3.5">
      <Avatar user={user} size="sm" />
      <div className="relative min-w-0 flex-1">
        <label htmlFor="comment-text" className="sr-only">
          Write a comment
        </label>
        <input
          id="comment-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          maxLength={MAX_LENGTH + 50}
          autoComplete="off"
          autoFocus={autoFocus}
          className="input h-11 py-0 pr-12"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="absolute top-1.5 right-1.5 inline-flex size-8 items-center justify-center rounded-sm bg-ink text-sheet enabled:hover:bg-riso-blue enabled:hover:text-paper disabled:cursor-not-allowed disabled:border-2 disabled:border-dashed disabled:border-ink-3 disabled:bg-transparent disabled:text-ink-3"
          aria-label="Send comment"
        >
          {add.isPending ? <Spinner className="size-4" /> : <Send className="size-4" strokeWidth={2.2} />}
        </button>
        {text.length > MAX_LENGTH - 30 && (
          <p className={cn('mt-1.5 ml-0.5 type-meta tabular-nums', text.length > MAX_LENGTH && 'font-semibold text-danger-ink')}>
            {MAX_LENGTH - text.length} characters left
          </p>
        )}
      </div>
    </form>
  );
}
