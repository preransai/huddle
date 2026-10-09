import Avatar from '../ui/Avatar';
import { cn } from '../../utils/format';
import { NOTIFICATION_STYLES, notificationAction, notificationPreview } from './notificationText';

// A live notification: a straight sheet with 6px die-cut corners and a 4px offset pass printed in
// the type's ink. Only the round type sticker is rotated.
export default function NotificationToast({ notification, onOpen }) {
  const style = NOTIFICATION_STYLES[notification.type];
  const Icon = style.icon;
  const preview = notificationPreview(notification);

  return (
    <button
      type="button"
      onClick={onOpen}
      style={{ '--toast-ink': style.ink }}
      className="flex w-[calc(100vw-2rem)] max-w-[360px] items-start gap-3 rounded-md border-2 border-line bg-sheet py-3 pr-3.5 pl-3 text-left font-sans text-ink shadow-[4px_4px_0_0_var(--toast-ink)] hover:bg-sheet-hi focus-visible:outline-offset-[6px]"
    >
      <div className="relative shrink-0">
        <Avatar user={notification.actor} size="row" />
        <span
          className={cn(
            'sticker absolute -right-1 -bottom-1 size-5 shadow-[0_0_0_2px_var(--hd-sheet)]',
            style.className
          )}
          aria-hidden="true"
        >
          <Icon className={cn('size-2.5', style.fill && 'fill-current')} strokeWidth={2.6} />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug">
          <span className="type-name text-[15px]">{notification.actor.name}</span>{' '}
          {notificationAction(notification)}
        </p>
        {preview && (
          <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-ink-3 [overflow-wrap:anywhere]">{preview}</p>
        )}
      </div>
    </button>
  );
}
