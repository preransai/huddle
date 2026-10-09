import { cn } from '../../utils/format';

// Small pieces of the notice board: thumbtacks, hand-cut tape and die-cut stickers.
// All of them are decoration, so they are hidden from assistive tech.

export function Tack({ className, x = 0 }) {
  return <span className={cn('tack', className)} style={{ '--tack-x': `${x}px` }} aria-hidden="true" />;
}

export function Tape({ className, style }) {
  return <span className={cn('tape', className)} style={style} aria-hidden="true" />;
}

export function Sticker({ className, children, ...rest }) {
  return (
    <span className={cn('sticker', className)} {...rest}>
      {children}
    </span>
  );
}

// 14-point die-cut starburst, like a price sticker, marking an unread notification.
// Visual only: the row carries an sr-only "Unread" for screen readers.
const BURST =
  '17.0,0.0 19.9,4.1 23.9,2.6 25.2,6.7 29.9,6.7 28.9,11.3 33.6,13.2 30.2,17.0 32.6,20.6 28.9,22.7 29.9,27.3 25.2,27.3 24.4,32.3 19.9,29.9 17.0,33.0 14.1,29.9 9.8,31.9 8.8,27.3 3.7,27.6 5.1,22.7 1.4,20.6 3.8,17.0 0.9,13.3 5.1,11.3 3.7,6.4 8.8,6.7 10.1,2.6 14.1,4.1';

export function NewSticker({ className }) {
  return (
    <span
      aria-hidden="true"
      className={cn('new-sticker relative inline-grid size-[31px] shrink-0 -rotate-10 place-items-center', className)}
    >
      <svg viewBox="0 0 34 34" className="absolute inset-0 size-full overflow-visible">
        <polygon points={BURST} className="fill-riso-pink stroke-line" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <b className="relative text-[10px] leading-none font-extrabold text-riso-black">new</b>
    </span>
  );
}
