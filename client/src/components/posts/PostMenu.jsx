import { useEffect, useRef, useState } from 'react';
import { Ellipsis, Link2, Trash2 } from 'lucide-react';

// Same menu treatment as the account menu: a sheet with a black lift. Hover = yellow + ink bar,
// keyboard focus adds an inset ink frame. "Delete post" prints in danger ink and fills with the
// danger overprint on hover / focus.
const ITEM = 'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold';
const ITEM_DEFAULT = `${ITEM} text-ink hover:selected-row focus-visible:focus-row`;
const ITEM_DANGER = `${ITEM} text-danger-ink hover:bg-danger hover:text-riso-black hover:shadow-[inset_4px_0_0_#141416] focus-visible:bg-danger focus-visible:text-riso-black focus-visible:shadow-[inset_4px_0_0_#141416] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-riso-black`;

export default function PostMenu({ isOwn, onCopyLink, onDelete }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const choose = (action) => () => {
    setOpen(false);
    action();
  };

  return (
    <div ref={rootRef} className="relative -mt-1 -mr-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="icon-btn"
        aria-label="Post options"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Ellipsis className="size-5" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-20 mt-1 w-48 animate-drop-in border-2 border-line bg-sheet py-1 shadow-lift"
        >
          <button type="button" role="menuitem" onClick={choose(onCopyLink)} className={ITEM_DEFAULT}>
            <Link2 className="size-4" aria-hidden="true" />
            Copy link
          </button>
          {isOwn && (
            <button type="button" role="menuitem" onClick={choose(onDelete)} className={ITEM_DANGER}>
              <Trash2 className="size-4" aria-hidden="true" />
              Delete post
            </button>
          )}
        </div>
      )}
    </div>
  );
}
