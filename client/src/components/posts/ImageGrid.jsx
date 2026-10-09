import { useState } from 'react';
import { cn } from '../../utils/format';
import { Tape } from '../ui/Print';
import Lightbox from './Lightbox';

// Grid layouts per image count, the same idea most social apps use:
// 1 = natural aspect ratio (clamped), 2 = side by side, 3 = one tall + two
// stacked, 4 = 2x2. The photos are pasted up like a contact sheet: 2px ink gutters.
const LAYOUTS = {
  2: { grid: 'grid-cols-2 aspect-[16/9]', items: ['', ''] },
  3: { grid: 'grid-cols-2 grid-rows-2 aspect-[16/9] max-sm:aspect-[4/3]', items: ['row-span-2', '', ''] },
  4: { grid: 'grid-cols-2 grid-rows-2 aspect-[16/9]', items: ['', '', '', ''] },
};

function singleAspect(image) {
  if (!image.width || !image.height) return 4 / 3;
  // Very tall photos would push the whole feed down, so clamp to 4:5.
  return Math.min(Math.max(image.width / image.height, 4 / 5), 2);
}

// Hand-cut tape holding the photos onto the flyer. The variant comes from the post's print run;
// a strip straddles the photo's edge and never covers more than ~10px of the picture.
function TapeStrips({ tape, tapeX, count }) {
  if (tape === 'top') return <Tape className="tape-top" style={{ '--tape-x': `${tapeX}px` }} />;
  if (tape === 'tr') return <Tape className="tape-tr" />;
  if (tape === 'pair' && count > 1) {
    return (
      <>
        <Tape className="tape-tl" />
        <Tape className="tape-tr" />
      </>
    );
  }
  return <Tape className="tape-tl" />;
}

export default function ImageGrid({ images, alt = '', tape = 'tl', tapeX = 0 }) {
  const [openIndex, setOpenIndex] = useState(null);
  if (!images?.length) return null;

  const layout = LAYOUTS[images.length];
  const describe = (i) =>
    alt ? `${alt} (image ${i + 1} of ${images.length})` : `Image ${i + 1} of ${images.length}`;

  return (
    <>
      {/* mt-6 leaves room above the photos for the tape without touching the post text */}
      <div className="relative mt-6">
        <TapeStrips tape={tape} tapeX={tapeX} count={images.length} />
        <div
          className={cn('grid gap-0.5 overflow-hidden border-2 border-line bg-line', layout?.grid)}
          style={layout ? undefined : { aspectRatio: singleAspect(images[0]) }}
        >
          {images.map((image, i) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setOpenIndex(i)}
              className={cn(
                'group relative min-h-0 overflow-hidden bg-sheet-hi after:pointer-events-none after:absolute after:inset-0 after:border-[3px] after:border-riso-pink after:opacity-0 hover:after:opacity-100 focus-visible:outline-offset-[-3px]',
                layout?.items[i]
              )}
              aria-label={`View image ${i + 1} of ${images.length}`}
            >
              <img src={image.url} alt={describe(i)} loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
      </div>
      {openIndex !== null && (
        <Lightbox images={images} startIndex={openIndex} onClose={() => setOpenIndex(null)} alt={alt} />
      )}
    </>
  );
}
