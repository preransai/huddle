import { LoaderCircle } from 'lucide-react';
import { cn } from '../../utils/format';

export default function Spinner({ className, label }) {
  return (
    <LoaderCircle
      className={cn('animate-spin', className || 'size-5')}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      role={label ? 'status' : undefined}
    />
  );
}
