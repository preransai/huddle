import { AtSign, Heart, MessageCircle, UserPlus } from 'lucide-react';

// Each notification type is a die-cut sticker in one ink (or the pink x blue overprint), slapped
// on at its own small angle. `ink` colours the live toast's offset pass; navy would vanish on
// black stock, so mentions use the blue ink there.
export const NOTIFICATION_STYLES = {
  like: { icon: Heart, className: 'bg-riso-pink text-riso-black -rotate-8', fill: true, ink: '#FF48B0' },
  comment: { icon: MessageCircle, className: 'bg-riso-blue text-paper rotate-6', fill: false, ink: '#0078BF' },
  follow: { icon: UserPlus, className: 'bg-riso-yellow text-riso-black -rotate-4', fill: false, ink: '#FFE800' },
  mention: { icon: AtSign, className: 'bg-overprint text-paper rotate-8', fill: false, ink: '#0078BF' },
};

export function notificationAction(notification) {
  switch (notification.type) {
    case 'like':
      return 'liked your post';
    case 'comment':
      return 'commented on your post';
    case 'follow':
      return 'started following you';
    case 'mention':
      return notification.comment ? 'mentioned you in a comment' : 'mentioned you in a post';
    default:
      return 'interacted with you';
  }
}

export function notificationLink(notification) {
  if (notification.type === 'follow' || !notification.post) {
    return `/${notification.actor.username}`;
  }
  return `/post/${notification.post._id}`;
}

// Long text is clamped with CSS where it's shown, so no manual truncation here.
export function notificationPreview(notification) {
  return notification.comment?.text || notification.post?.text || '';
}
