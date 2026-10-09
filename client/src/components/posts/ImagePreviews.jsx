import { X } from 'lucide-react';
import { cn } from '../../utils/format';

const COLUMNS = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-2' };

// The photos you are about to pin up: square-cut prints with an ink edge, each with a black
// remove tab in the corner.
export default function ImagePreviews({ images, onRemove, disabled }) {
  if (!images.length) return null;

  return (
    <ul className={cn('mt-3 grid gap-2', COLUMNS[images.length])}>
      {images.map((image, i) => (
        <li
          key={image.preview}
          className={cn(
            'group relative overflow-hidden border-2 border-line bg-sheet-hi',
            images.length === 1 ? 'aspect-[16/10]' : images.length === 3 ? 'aspect-square' : 'aspect-[4/3]'
          )}
        >
          <img
            src={image.preview}
            alt={`Selected image ${i + 1}: ${image.file.name}`}
            className="size-full object-cover"
          />
          <button
            type="button"
            onClick={() => onRemove(i)}
            disabled={disabled}
            className="absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-sm border-2 border-paper bg-riso-black text-paper hover:bg-danger hover:text-riso-black disabled:opacity-60"
            aria-label={`Remove image ${i + 1}`}
          >
            <X className="size-4" strokeWidth={2.6} />
          </button>
        </li>
      ))}
    </ul>
  );
}
