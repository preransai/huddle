import { cn } from '../../utils/format';

// A row of tabs divided by ink rules; the active label gets the highlighter swipe.
// Uses buttons with aria-pressed rather than the full ARIA tabs pattern, since each tab just
// swaps the list below it.
export default function Tabs({ tabs, value, onChange, className }) {
  return (
    <div className={cn('flex divide-x-2 divide-line', className)}>
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            aria-pressed={active}
            className={cn(
              'relative flex-1 px-4 py-3 font-display text-[17px] font-bold [font-stretch:92%]',
              active ? 'text-ink' : 'text-ink-2 decoration-2 underline-offset-4 hover:text-ink hover:underline'
            )}
          >
            {active ? <span className="highlighter">{tab.label}</span> : tab.label}
          </button>
        );
      })}
    </div>
  );
}
