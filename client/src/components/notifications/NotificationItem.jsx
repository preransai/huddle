import { Link } from 'react-router';
import Avatar from '../ui/Avatar';
import { NewSticker } from '../ui/Print';
import { cn } from '../../utils/format';
import { fullDate, relativeTime } from '../../utils/time';
import {
  NOTIFICATION_STYLES,
  notificationAction,
  notificationLink,
  notificationPreview,
} from './notificationText';

// Notifications are stickers on the board. An unread row is tinted pink, carries a pink margin
// bar with an ink edge and a "new" starburst by its time; screen readers get an sr-only "Unread".
export default function NotificationItem({ notification }) {
  const { actor, post } = notification;
  const style = NOTIFICATION_STYLES[notification.type];
  const Icon = style.icon;
  const preview = notificationPreview(notification);
  const thumbnail = notification.type !== 'follow' ? post?.images?.[0]?.url : null;
  const unread = !notification.read;

  return (
    <li>
      <Link
        to={notificationLink(notification)}
        className={cn(
          'group relative flex gap-3.5 py-4 pr-5 pl-[22px] max-sm:gap-3 max-sm:py-3.5 max-sm:pr-3.5 max-sm:pl-[18px]',
          unread ? 'bg-pink-tint' : 'hover:bg-sheet-hi'
        )}
      >
        {unread && (
          <span
            aria-hidden="true"
            className="row-bar absolute inset-y-0 left-0 w-[7px] border-r-2 border-line bg-riso-pink forced-colors:hidden"
          />
        )}
        <div className="relative shrink-0 self-start">
          <Avatar user={actor} />
          <span
            className={cn(
              'sticker absolute -right-[5px] -bottom-[5px] size-[22px] shadow-[0_0_0_2px_var(--hd-sheet)]',
              style.className
            )}
            aria-hidden="true"
          >
            <Icon className={cn('size-3', style.fill && 'fill-current')} strokeWidth={2.6} />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] leading-snug">
            <span className="type-name text-[16px] decoration-2 underline-offset-2 group-hover:underline">
              {actor.name}
            </span>{' '}
            <span className="text-ink-2">{notificationAction(notification)}</span>
          </p>
          {preview && <p className="mt-1 line-clamp-2 text-sm text-ink-2 [overflow-wrap:anywhere]">{preview}</p>}
          <p className="mt-1 flex min-h-[22px] items-center gap-2">
            {unread && <span className="sr-only">Unread</span>}
            <time dateTime={notification.createdAt} title={fullDate(notification.createdAt)} className="type-meta">
              {relativeTime(notification.createdAt)}
            </time>
            {unread && <NewSticker className="-my-1" />}
          </p>
        </div>
        {thumbnail && (
          <img
            src={thumbnail}
            alt=""
            className="size-12 shrink-0 border-2 border-line object-cover max-sm:size-11"
            loading="lazy"
          />
        )}
      </Link>
    </li>
  );
}
