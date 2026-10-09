import { Link } from 'react-router';
import Avatar from '../ui/Avatar';
import FollowButton from './FollowButton';

export default function UserRow({ user, showBio = false, onNavigate }) {
  return (
    <div className="flex items-center gap-3">
      <Link to={`/${user.username}`} onClick={onNavigate} className="shrink-0 rounded-full">
        <Avatar user={user} size="row" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          to={`/${user.username}`}
          onClick={onNavigate}
          className="block truncate type-name text-[16px] decoration-2 underline-offset-2 hover:underline"
        >
          {user.name}
        </Link>
        <p className="truncate type-meta text-[13px]">@{user.username}</p>
        {showBio && user.bio && <p className="mt-1 line-clamp-2 text-[13px] text-ink-2">{user.bio}</p>}
      </div>
      <FollowButton user={user} size="sm" />
    </div>
  );
}
