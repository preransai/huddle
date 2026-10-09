import { NavLink } from 'react-router';
import { SquarePen } from 'lucide-react';
import { UnreadBadge } from './TopBar';
import { useNavItems } from '../../hooks/useNavItems';
import { cn } from '../../utils/format';

// lg: icon + label, the active label swiped with the pink highlighter.
// md: icon only, the active icon printed on a pink block with an ink edge.
export default function SideNav({ onCompose }) {
  const items = useNavItems();

  return (
    <nav aria-label="Main" className="sticky top-22 flex flex-col items-center gap-1 lg:items-stretch">
      {items.map(({ to, label, icon: Icon, end, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          title={label}
          className="group flex items-center gap-4 rounded-sm border-2 border-transparent type-nav text-ink max-lg:p-1.5 lg:px-3 lg:py-[9px]"
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'relative inline-flex rounded-sm border-2 max-lg:p-1.5',
                  isActive
                    ? 'max-lg:border-line max-lg:bg-riso-pink max-lg:text-riso-black max-lg:forced-color-adjust-none max-lg:forced-colors:border-[HighlightText] max-lg:forced-colors:bg-[Highlight] max-lg:forced-colors:text-[HighlightText] lg:border-transparent'
                    : 'border-transparent'
                )}
              >
                <Icon className="size-6" strokeWidth={isActive ? 2.4 : 1.9} aria-hidden="true" />
                <UnreadBadge count={badge} size="sm" className="-top-3 -right-[13px] md:max-lg:-top-2 md:max-lg:-right-3" />
              </span>
              <span
                className={cn(
                  'lbl hidden decoration-2 underline-offset-4 group-hover:underline lg:inline',
                  isActive && 'highlighter font-[760]'
                )}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}

      <button
        type="button"
        onClick={onCompose}
        className="btn-primary mt-[18px] size-12 p-0 lg:h-auto lg:w-full lg:py-3.5"
        aria-label="New post"
      >
        <SquarePen className="size-5 lg:hidden" aria-hidden="true" />
        <span className="hidden type-nav font-[750] lg:inline">New post</span>
      </button>
    </nav>
  );
}
