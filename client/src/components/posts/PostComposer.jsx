import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import Avatar from '../ui/Avatar';
import Spinner from '../ui/Spinner';
import CharCounter from './CharCounter';
import ImagePreviews from './ImagePreviews';
import { useAuth } from '../../context/AuthContext';
import { useImageAttachments, IMAGE_TYPES, MAX_IMAGES } from '../../hooks/useImageAttachments';
import { errorMessage, postsApi } from '../../lib/api';
import { keys } from '../../lib/queryClient';
import { cn } from '../../utils/format';

const MAX_LENGTH = 500;

export default function PostComposer({ onPosted, autoFocus = false, className }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [dragging, setDragging] = useState(false);
  const attachments = useImageAttachments();
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const create = useMutation({
    mutationFn: () => {
      const form = new FormData();
      form.append('text', text.trim());
      attachments.images.forEach((img) => form.append('images', img.file));
      return postsApi.create(form);
    },
    onSuccess: ({ post }) => {
      // Show the new post at the top of the home feed right away instead of
      // waiting for a refetch.
      queryClient.setQueryData(keys.feed, (data) => {
        if (!data) return data;
        const [first, ...rest] = data.pages;
        return { ...data, pages: [{ ...first, posts: [post, ...first.posts] }, ...rest] };
      });
      queryClient.invalidateQueries({ queryKey: ['posts'], predicate: (q) => q.queryKey[1] !== 'feed' });
      queryClient.invalidateQueries({ queryKey: ['profile', user.username] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setText('');
      attachments.clear();
      if (textareaRef.current) textareaRef.current.style.height = '';
      toast.success('Your post is live');
      onPosted?.(post);
    },
    onError: (error) => toast.error(errorMessage(error, 'Could not publish your post')),
  });

  const trimmed = text.trim();
  const tooLong = text.length > MAX_LENGTH;
  const canPost = (trimmed || attachments.images.length) && !tooLong && !create.isPending;

  const handleChange = (event) => {
    setText(event.target.value);
    const el = event.target;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (canPost) create.mutate();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) handleSubmit(event);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files?.length) attachments.add(event.dataTransfer.files);
  };

  const handleDragOver = (event) => {
    if (!event.dataTransfer.types.includes('Files')) return;
    event.preventDefault();
    setDragging(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget) && setDragging(false)}
      className={cn(
        // The focus ring belongs to the form (3px, 5px inside its edge), so it reads the same on the
        // Home slip and inside the "New post" dialog. Only the textarea triggers it.
        'relative p-4 sm:p-5',
        !dragging &&
          'has-[textarea:focus-visible]:outline-3 has-[textarea:focus-visible]:-outline-offset-5 has-[textarea:focus-visible]:outline-focus',
        className
      )}
    >
      <div className="flex gap-3">
        <div className="hidden shrink-0 sm:block">
          <Avatar user={user} />
        </div>
        <div className="min-w-0 flex-1">
          <label htmlFor="composer-text" className="sr-only">
            Post text
          </label>
          <textarea
            id="composer-text"
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Pin something to the board…"
            rows={2}
            autoFocus={autoFocus}
            data-autofocus={autoFocus || undefined}
            disabled={create.isPending}
            className="block max-h-80 min-h-14 w-full resize-none bg-transparent pt-2 text-[18px] leading-normal text-ink placeholder:text-ink-3 supports-[selector(:has(*))]:focus:outline-none"
          />
          <ImagePreviews images={attachments.images} onRemove={attachments.remove} disabled={create.isPending} />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 border-t-2 border-dotted border-rule pt-3 sm:ml-14">
        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_TYPES.join(',')}
          multiple
          hidden
          onChange={(e) => {
            attachments.add(e.target.files);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={attachments.isFull || create.isPending}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm border-2 border-line text-blue-ink enabled:hover:bg-riso-yellow enabled:hover:text-riso-black disabled:cursor-not-allowed disabled:border-dashed disabled:border-ink-3 disabled:text-ink-3"
          aria-label={`Add images (up to ${MAX_IMAGES})`}
          title="Add images"
        >
          <ImagePlus className="size-5" />
        </button>
        <p className="hidden type-meta sm:block">
          {attachments.images.length
            ? `${attachments.images.length}/${MAX_IMAGES} images`
            : 'Drop images here or use the picker'}
        </p>

        <div className="ml-auto flex items-center gap-3">
          {text.length > 0 && <CharCounter length={text.length} max={MAX_LENGTH} />}
          <button type="submit" disabled={!canPost} className="btn-primary px-6">
            {create.isPending && <Spinner className="size-4" />}
            {create.isPending ? 'Posting' : 'Post'}
          </button>
        </div>
      </div>

      {dragging && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center border-[3px] border-dashed border-line bg-riso-yellow/88 px-4 text-center text-[15px] font-bold text-riso-black">
          Drop images to attach them
        </div>
      )}
    </form>
  );
}
