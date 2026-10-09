import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import Misregister from '../ui/Misregister';

export default function PageHeader({ title, subtitle, back = false, children }) {
  const navigate = useNavigate();

  const goBack = () => {
    // history.state.idx is set by React Router; 0 means this page was opened directly.
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/');
  };

  return (
    <div className="mb-5 flex items-center gap-3 px-1">
      <title>{`${title} | Huddle`}</title>
      {back && (
        <button type="button" onClick={goBack} className="icon-btn -ml-2 shrink-0" aria-label="Go back">
          <ArrowLeft className="size-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        {/* truncate-print clips with a margin, so descenders and the pink copy survive truncation */}
        <Misregister as="h1" className="type-h1 truncate-print">
          {title}
        </Misregister>
        {subtitle && <p className="mt-0.5 truncate text-sm text-ink-2 tabular-nums">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
