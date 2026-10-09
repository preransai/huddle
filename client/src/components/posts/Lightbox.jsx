import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

// The photo as a print with a white border, laid on black stock. The viewer is always dark,
// so its focus ring is always the yellow ink.
const CONTROL =
  'inline-flex size-11 items-center justify-center rounded-sm border-2 border-paper bg-riso-black text-paper hover:bg-riso-pink hover:text-riso-black';

export default function Lightbox({ images, startIndex = 0, onClose, alt }) {
  const [index, setIndex] = useState(startIndex);
  const dialogRef = useRef(null);
  const count = images.length;

  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      if (dialog.open) dialog.close();
    };
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') prev();
    if (event.key === 'ArrowRight') next();
  };

  const image = images[index];

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-label="Image viewer"
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-night/95 p-0 text-paper [--hd-focus:#FFE800] backdrop:bg-night/80"
    >
      <div
        className="flex size-full items-center justify-center p-4 sm:p-12"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <img
          key={image.url}
          src={image.url}
          alt={alt ? `${alt} (image ${index + 1} of ${count})` : `Image ${index + 1} of ${count}`}
          className="max-h-full max-w-full animate-fade-in border-[6px] border-paper object-contain"
        />
      </div>

      <button
        type="button"
        onClick={onClose}
        className={`${CONTROL} absolute top-4 right-4`}
        aria-label="Close image viewer"
        autoFocus
      >
        <X className="size-5" strokeWidth={2.4} />
      </button>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className={`${CONTROL} absolute top-1/2 left-3 -translate-y-1/2 sm:left-6`}
            aria-label="Previous image"
          >
            <ChevronLeft className="size-6" strokeWidth={2.4} />
          </button>
          <button
            type="button"
            onClick={next}
            className={`${CONTROL} absolute top-1/2 right-3 -translate-y-1/2 sm:right-6`}
            aria-label="Next image"
          >
            <ChevronRight className="size-6" strokeWidth={2.4} />
          </button>
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-sm border-2 border-riso-black bg-paper px-2.5 py-1 font-display text-sm font-bold text-riso-black tabular-nums">
            {index + 1} / {count}
          </p>
        </>
      )}
    </dialog>
  );
}
