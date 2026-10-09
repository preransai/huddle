import { Link } from 'react-router';
import { Bell, Moon, Search, Sun } from 'lucide-react';
import Logo from './Logo';
import SearchBox from './SearchBox';
import UserMenu from './UserMenu';
import { useTheme } from '../../context/ThemeContext';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import { cn } from '../../utils/format';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="icon-btn"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}

// The unread count is a round die-cut sticker slapped on the corner of the bell.
export function UnreadBadge({ count, size = 'md', className = '' }) {
  if (!count) return null;
  return (
    <span
      className={cn(
        'sticker absolute -rotate-8 bg-riso-pink text-center font-bold text-riso-black tabular-nums shadow-[0_0_0_2px_var(--hd-board)]',
        size === 'sm' ? 'h-[18px] min-w-[18px] px-[3px] text-[10px] leading-[14px]' : 'h-5 min-w-5 px-1 text-[10.5px] leading-4',
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function TopBar() {
  const unread = useUnreadCount();

  return (
    <header className="sticky top-0 z-30 border-b-2 border-line bg-board">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-3.5 sm:px-4 md:grid md:h-16 md:grid-cols-[72px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[232px_minmax(0,1fr)_300px]">
        <div className="flex items-center md:justify-center lg:justify-start">
          {/* Full wordmark on phones and wide screens; just the mark next to the icon-only nav on tablets. */}
          <span className="md:hidden lg:block">
            <Logo />
          </span>
          <span className="hidden md:block lg:hidden">
            <Logo compact />
          </span>
        </div>

        <div className="hidden md:flex md:items-center md:gap-3">
          <SearchBox className="w-full max-w-[600px]" />
          <div className="ml-auto flex items-center gap-1.5 lg:hidden">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5 md:hidden">
          <Link to="/search" className="icon-btn" aria-label="Search">
            <Search className="size-5" />
          </Link>
          <ThemeToggle />
          <UserMenu />
        </div>

        <div className="hidden items-center justify-end gap-1.5 lg:flex">
          <ThemeToggle />
          <Link to="/notifications" className="icon-btn relative" aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}>
            <Bell className="size-5" />
            <UnreadBadge count={unread} className="-top-1.5 -right-2" />
          </Link>
          <span className="ml-1.5">
            <UserMenu />
          </span>
        </div>
      </div>
    </header>
  );
}
