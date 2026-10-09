import { Bell, Compass, House, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUnreadCount } from './useUnreadCount';

// Shared by the desktop side nav and the mobile tab bar so both stay in sync.
export function useNavItems() {
  const { user } = useAuth();
  const unread = useUnreadCount();
  return [
    { to: '/', label: 'Home', icon: House, end: true },
    { to: '/explore', label: 'Explore', icon: Compass },
    { to: '/notifications', label: 'Notifications', shortLabel: 'Activity', icon: Bell, badge: unread },
    { to: `/${user.username}`, label: 'Profile', icon: User, end: true },
  ];
}
