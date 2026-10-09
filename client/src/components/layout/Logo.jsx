import { useId } from 'react';
import { Link } from 'react-router';
import Misregister from '../ui/Misregister';
import { cn } from '../../utils/format';

// Two hand-drawn comic balloons, pink and blue, heads together; where the two inks overlap they
// overprint to navy. viewBox 0 0 40 32 (the favicon is the same mark in 0 -4 40 40).
const PINK =
  'M2.6 12.1C3 6.6 8.2 3 14.8 3.2C21.6 3.4 26.8 7.2 26.6 12.6C26.4 17.7 21.5 21.3 15.1 21.5C13.8 21.55 12.6 21.4 11.5 21.15C9.8 24.2 7.1 26.8 3.2 28.1C5.2 25.8 6.1 23.4 6.3 20.1C4 18.2 2.4 15.4 2.6 12.1Z';
const BLUE =
  'M13.8 16.4C13.8 11.2 18.6 7.6 24.9 7.5C31.6 7.4 36.9 11 36.7 16.4C36.6 19.5 35 22.1 32.5 23.6C33 26 34.3 28.3 36.6 29.9C33.3 29.7 30.3 28 28.6 25.7C27.8 25.8 27 25.8 26.2 25.8C19.4 25.7 13.8 21.8 13.8 16.4Z';

export function LogoMark({ className = 'h-8 w-10' }) {
  // The mark can render several times on one page, so each copy gets its own clip id.
  const clip = useId();
  return (
    <svg viewBox="0 0 40 32" aria-hidden="true" className={cn('logomark shrink-0', className)}>
      <defs>
        <clipPath id={clip}>
          <path d={PINK} />
        </clipPath>
      </defs>
      <path fill="#FF48B0" d={PINK} />
      <path fill="#0078BF" d={BLUE} />
      <path fill="#002284" clipPath={`url(#${clip})`} d={BLUE} />
    </svg>
  );
}

export default function Logo({ className, compact = false }) {
  return (
    <Link to="/" className={cn('inline-flex items-center gap-2.5 rounded-sm', className)} aria-label="Huddle home">
      <LogoMark />
      {!compact && <Misregister className="type-wordmark text-riso-blue">huddle</Misregister>}
    </Link>
  );
}
