import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFollow } from '../../hooks/useFollow';
import { cn } from '../../utils/format';

// Blue ink means people: "Follow" is a riso-blue block with a small black offset. "Following" is
// plain paper; on hover it offers "Unfollow" in danger ink.
const SIZES = {
  sm: 'px-3 py-1.5 text-[13px]',
  md: 'min-w-[6.5rem] px-[18px] py-2.5 text-[15px]',
};

export default function FollowButton({ user, size = 'md', className }) {
  const { user: me } = useAuth();
  const follow = useFollow();
  const [hovered, setHovered] = useState(false);

  if (!me || me._id === user._id) return null;

  const following = user.isFollowing;
  const label = following ? (hovered ? 'Unfollow' : 'Following') : 'Follow';

  return (
    <button
      type="button"
      onClick={() => follow.mutate(user)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-pressed={following}
      aria-label={following ? `Unfollow ${user.name}` : `Follow ${user.name}`}
      className={cn(
        following
          ? 'btn-secondary shadow-none hover:border-danger hover:bg-danger-tint hover:text-danger-ink'
          : cn('btn-blue', size === 'md' && 'shadow-press'),
        SIZES[size] ?? SIZES.md,
        className
      )}
    >
      {label}
    </button>
  );
}
