import { cn } from '../../utils/format';

const RADIUS = 9;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// A ring printed in riso blue that fills up as you type. Near the limit the remaining count
// appears on a yellow chip; past it, on a danger (pink x yellow) chip. Both carry riso-black text.
export default function CharCounter({ length, max }) {
  const remaining = max - length;
  const progress = Math.min(length / max, 1);
  const warn = remaining <= 20;
  const over = remaining < 0;

  return (
    <div className="flex items-center gap-2" aria-live="polite">
      {warn && (
        <span
          className={cn(
            'rounded-sm px-1.5 text-xs leading-5 font-bold text-riso-black tabular-nums',
            over ? 'bg-danger' : 'bg-riso-yellow'
          )}
        >
          {remaining}
        </span>
      )}
      <svg viewBox="0 0 24 24" className="size-6 -rotate-90" aria-hidden="true">
        <circle cx="12" cy="12" r={RADIUS} fill="none" strokeWidth="2.5" className="stroke-rule" />
        <circle
          cx="12"
          cy="12"
          r={RADIUS}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="butt"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          className={cn(
            'transition-[stroke-dashoffset] duration-150',
            over ? 'stroke-danger' : warn ? 'stroke-riso-yellow' : 'stroke-riso-blue'
          )}
        />
      </svg>
      <span className="sr-only">
        {length} of {max} characters used
      </span>
    </div>
  );
}
