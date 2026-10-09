import { CircleAlert, RefreshCw } from 'lucide-react';
import discYellow from '../../assets/halftone-disc-yellow.svg';
import discDanger from '../../assets/halftone-disc-danger.svg';
import { errorMessage } from '../../lib/api';
import { cn } from '../../utils/format';

// Empty and error states get a printed mark instead of an icon in a tinted tile: a halftone
// disc with the icon printed over it (twice, off register, for the empty state).
export function EmptyState({ icon: Icon, title, message, action, className }) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-14 text-center', className)}>
      {Icon && (
        <span className="relative mb-5 flex size-[104px] items-center justify-center" aria-hidden="true">
          <img src={discYellow} alt="" className="halftone absolute inset-0 size-full" />
          <span className="misreg text-riso-blue [--misreg-x:3px] [--misreg-y:2px]">
            <Icon className="block size-10" strokeWidth={2.2} />
            <span className="misreg-copy">
              <Icon className="block size-10" strokeWidth={2.2} />
            </span>
          </span>
        </span>
      )}
      <h3 className="max-w-full type-h3 [overflow-wrap:anywhere]">{title}</h3>
      {message && <p className="mt-1.5 max-w-xs text-[14.5px] text-ink-2 [overflow-wrap:anywhere]">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry, title = 'Something went wrong', className }) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)} role="alert">
      <span className="relative mb-5 flex size-[104px] items-center justify-center" aria-hidden="true">
        <img src={discDanger} alt="" className="halftone absolute inset-0 size-full" />
        <CircleAlert className="relative size-10 text-ink" strokeWidth={2.2} />
      </span>
      <h3 className="max-w-full type-h3 [overflow-wrap:anywhere]">{title}</h3>
      <p className="mt-1.5 max-w-xs text-[14.5px] text-ink-2 [overflow-wrap:anywhere]">{errorMessage(error)}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary mt-5">
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );
}
