import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { LogOut, User } from 'lucide-react';
import { toast } from 'sonner';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => !rootRef.current?.contains(e.target) && setOpen(false);
    const onKeyDown = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    try {
      await logout();
      navigate('/login');
    } catch {
      toast.error('Could not log out. Please try again.');
    }
  };

  // Hover = yellow + ink bar; keyboard focus adds an inset ink frame, so the two never look alike.
  const itemClass =
    'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold text-ink hover:selected-row focus-visible:focus-row';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="block rounded-full"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar user={user} size="sm" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-40 mt-2 w-60 animate-drop-in border-2 border-line bg-sheet py-1 shadow-lift"
        >
          <div className="border-b-2 border-dotted border-rule px-4 pt-2 pb-3">
            <p className="truncate type-name text-[15px]">{user.name}</p>
            <p className="truncate type-meta">@{user.username}</p>
          </div>
          <Link to={`/${user.username}`} role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
            <User className="size-4" aria-hidden="true" />
            Your profile
          </Link>
          <button type="button" role="menuitem" onClick={handleLogout} className={itemClass}>
            <LogOut className="size-4" aria-hidden="true" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
