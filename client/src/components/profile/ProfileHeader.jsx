import { useState } from 'react';
import { CalendarDays, Link2, MapPin } from 'lucide-react';
import halftoneCover from '../../assets/halftone-cover.svg';
import Avatar from '../ui/Avatar';
import Misregister from '../ui/Misregister';
import RichText from '../posts/RichText';
import FollowButton from '../users/FollowButton';
import UserListModal from '../users/UserListModal';
import EditProfileModal from './EditProfileModal';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../lib/api';
import { keys } from '../../lib/queryClient';
import { compactNumber, displayUrl } from '../../utils/format';
import { joinedDate } from '../../utils/time';

// The profile is a poster on the board with a blue second plate. No cover photo? The poster prints
// a halftone field instead. The avatar is a round sticker slapped over the cover's edge.
// The section must not clip its overflow (that would cut its own second plate away); the cover
// clips itself.
function Stat({ value, children }) {
  return (
    <>
      <span className="type-numeral text-[22px] text-ink">{compactNumber(value)}</span>{' '}
      <span>{children}</span>
    </>
  );
}

const STAT = 'inline-flex items-baseline gap-1.5 text-sm text-ink-2';

export default function ProfileHeader({ profile }) {
  const { user: me } = useAuth();
  const [list, setList] = useState(null);
  const [editing, setEditing] = useState(false);
  const isMe = me?._id === profile._id;

  return (
    <section className="sheet plate plate-blue relative [--plate-r:-0.2deg] max-sm:mr-[5px]">
      <div className="aspect-[3/1] overflow-hidden border-b-2 border-line bg-sheet-hi">
        {profile.cover ? (
          <img src={profile.cover} alt={`${profile.name}'s cover`} className="size-full object-cover" />
        ) : (
          <img src={halftoneCover} alt="" className="halftone size-full object-cover" />
        )}
      </div>

      <div className="px-4 pb-[18px] sm:px-6 sm:pb-[22px]">
        <div className="flex items-end justify-between gap-3">
          <Avatar
            user={profile}
            size="poster"
            className="-mt-12 border-[3px] shadow-[0_0_0_5px_var(--hd-sheet)] sm:-mt-[62px]"
          />
          <div className="pt-3">
            {isMe ? (
              <button type="button" onClick={() => setEditing(true)} className="btn-secondary">
                Edit profile
              </button>
            ) : (
              <FollowButton user={profile} />
            )}
          </div>
        </div>

        {/* The name wraps (never truncates); its pink copy wraps on the same words. */}
        <Misregister as="h1" className="mt-3 type-h1 text-[32px] break-words sm:text-[36px]">
          {profile.name}
        </Misregister>
        <p className="mt-0.5 text-[15px] break-all text-ink-3">@{profile.username}</p>

        {profile.bio && (
          <RichText text={profile.bio} className="mt-3 type-post break-words whitespace-pre-wrap text-ink" />
        )}

        <ul className="mt-2.5 flex flex-wrap gap-x-[18px] gap-y-1 text-[13.5px] text-ink-2">
          {profile.location && (
            <li className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden="true" />
              {profile.location}
            </li>
          )}
          {profile.website && (
            <li className="inline-flex min-w-0 items-center gap-1.5">
              <Link2 className="size-4 shrink-0" aria-hidden="true" />
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="font-semibold break-all text-blue-ink decoration-2 underline-offset-[3px] hover:underline"
              >
                {displayUrl(profile.website)}
              </a>
            </li>
          )}
          <li className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" aria-hidden="true" />
            Joined {joinedDate(profile.createdAt)}
          </li>
        </ul>

        {/* Stats are one typeset line, not a row of cards. */}
        <div className="mt-4 flex flex-wrap items-baseline gap-x-[22px] gap-y-1">
          <p className={STAT}>
            <Stat value={profile.postsCount}>{profile.postsCount === 1 ? 'post' : 'posts'}</Stat>
          </p>
          <button
            type="button"
            onClick={() => setList('following')}
            className={`${STAT} rounded-xs decoration-2 underline-offset-2 hover:[&>span:last-child]:underline`}
          >
            <Stat value={profile.followingCount}>following</Stat>
          </button>
          <button
            type="button"
            onClick={() => setList('followers')}
            className={`${STAT} rounded-xs decoration-2 underline-offset-2 hover:[&>span:last-child]:underline`}
          >
            <Stat value={profile.followersCount}>{profile.followersCount === 1 ? 'follower' : 'followers'}</Stat>
          </button>
        </div>
      </div>

      <UserListModal
        open={list !== null}
        onClose={() => setList(null)}
        title={list === 'followers' ? 'Followers' : 'Following'}
        queryKey={keys.connections(profile._id, list ?? 'followers')}
        fetchPage={(cursor) =>
          list === 'following' ? usersApi.following(profile._id, cursor) : usersApi.followers(profile._id, cursor)
        }
        emptyText={list === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
      />
      {isMe && editing && <EditProfileModal onClose={() => setEditing(false)} profile={profile} />}
    </section>
  );
}
