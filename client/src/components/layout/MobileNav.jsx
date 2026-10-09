import { NavLink } from 'react-router';
import { Plus } from 'lucide-react';
import { useNavItems } from '../../hooks/useNavItems';
import { UnreadBadge } from './TopBar';
import { cn } from '../../utils/format';

export default function MobileNav({ onCompose }) {
  const [home, explore, notifications, profile] = useNavItems();

  const renderItem = ({ to, label, shortLabel, icon: Icon, end, badge }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      aria-label={label}
      className={({ isActive }) =>
        cn('flex flex-1 flex-col items-center gap-0.5 rounded-sm pt-1.5 pb-2 type-micro', isActive ? 'text-ink' : 'text-ink-2')
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'relative inline-flex rounded-sm border-2 px-2.5 py-0.5',
              isActive
                ? 'border-line bg-riso-pink text-riso-black forced-color-adjust-none forced-colors:border-[HighlightText] forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]'
                : 'border-transparent text-ink-2'
            )}
          >
            <Icon className="size-6" strokeWidth={isActive ? 2.4 : 1.9} aria-hidden="true" />
            <UnreadBadge count={badge} size="sm" className="-top-[9px] -right-[7px]" />
          </span>
          {shortLabel || label}
        </>
      )}
    </NavLink>
  );

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-line bg-board pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="flex items-center px-1">
        {renderItem(home)}
        {renderItem(explore)}
        <div className="flex flex-1 justify-center">
          <button
            type="button"
            onClick={onCompose}
            className="inline-flex h-11 w-[52px] items-center justify-center rounded-md border-2 border-line bg-ink text-sheet shadow-[3px_3px_0_0_#FF48B0] transition-[translate,box-shadow] duration-75 focus-visible:outline-offset-[6px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            aria-label="New post"
          >
            <Plus className="size-6" strokeWidth={2.6} />
          </button>
        </div>
        {renderItem(notifications)}
        {renderItem(profile)}
      </div>
    </nav>
  );
}
