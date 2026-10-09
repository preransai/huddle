import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/format';

// Built on the native <dialog> element: showModal() gives us the focus trap,
// Escape to close and the inert background for free, which is most of what
// makes a modal accessible.
// Visually a dialog is a sheet of paper lifted off the board: square corners, 2px ink,
// an 8px flat black offset, over a dot-screened backdrop (no blur).
export default function Modal({ open, onClose, title, children, footer, size = 'md', className }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // showModal() moves focus to the first focusable element (the Close button), after React has
      // applied autoFocus; a child that wants initial focus marks itself with data-autofocus.
      dialog.querySelector('[data-autofocus]')?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  const handleCancel = (event) => {
    event.preventDefault();
    onClose();
  };

  // A click whose target is the <dialog> itself landed on the backdrop.
  const handleClick = (event) => {
    if (event.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleClick}
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        'm-auto w-[calc(100%-2rem)] border-2 border-line bg-sheet p-0 text-ink shadow-[8px_8px_0_0_var(--hd-shadow)] open:animate-drop-in',
        size === 'sm' && 'max-w-sm',
        size === 'md' && 'max-w-md',
        size === 'lg' && 'max-w-xl',
        className
      )}
    >
      {open && (
        <div className="flex max-h-[85dvh] flex-col">
          {title && (
            <div className="flex items-center justify-between border-b-2 border-line py-2.5 pr-3 pl-5">
              <h2 id={titleId} className="type-h2 text-[20px]">
                {title}
              </h2>
              <button type="button" onClick={onClose} className="icon-btn" aria-label="Close">
                <X className="size-5" />
              </button>
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {footer && (
            <div className="flex justify-end gap-2 border-t-2 border-dotted border-rule px-5 py-3">{footer}</div>
          )}
        </div>
      )}
    </dialog>
  );
}
