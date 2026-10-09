import { useState } from 'react';
import { initials } from '../../utils/text';
import { cn } from '../../utils/format';

// One class per size (cn() does not merge, so callers never override a size with className).
const SIZES = {
  xs: 'size-7 text-[11px]',
  sm: 'size-9 text-xs',
  row: 'size-10 text-[13px]',
  md: 'size-11 text-sm',
  lg: 'size-14 text-base',
  xl: 'size-24 text-3xl',
  poster: 'size-24 text-3xl sm:size-[120px] sm:text-[40px]',
};

// Initials are printed on a flat ink (or overprint), always with legible text.
const COLORS = [
  'bg-riso-pink text-riso-black',
  'bg-riso-blue text-paper',
  'bg-riso-yellow text-riso-black',
  'bg-danger text-riso-black',
  'bg-success-fill text-paper',
  'bg-riso-black text-paper',
];

function colorFor(seed = '') {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function Avatar({ user, size = 'md', className }) {
  const [failed, setFailed] = useState(false);
  // Every face gets the 2px ink outline, unless the caller sets its own border width.
  const border = className?.includes('border-[') ? '' : 'border-2';
  const base = cn('shrink-0 rounded-full border-line object-cover', border, SIZES[size], className);

  if (user?.avatar && !failed) {
    return (
      <img
        src={user.avatar}
        alt={user.name ? `${user.name}'s avatar` : ''}
        className={cn(base, 'bg-sheet-hi')}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className={cn(base, 'inline-flex items-center justify-center font-display font-bold', colorFor(user?.username))}
      aria-hidden="true"
    >
      {initials(user?.name)}
    </span>
  );
}
