import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { keys } from '../lib/queryClient';
import NotificationToast from '../components/notifications/NotificationToast';
import { notificationLink } from '../components/notifications/notificationText';

// One socket per logged-in session. The server authenticates the handshake
// with the same cookie as the REST API and puts us in our own room, so all we
// do here is listen.
export function useNotificationSocket(userId) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return undefined;

    const socket = io({ withCredentials: true });

    socket.on('notification:new', (notification) => {
      queryClient.setQueryData(keys.unreadCount, (data) => ({ count: (data?.count ?? 0) + 1 }));
      queryClient.invalidateQueries({ queryKey: keys.notifications });

      toast.custom(
        (id) => (
          <NotificationToast
            notification={notification}
            onOpen={() => {
              toast.dismiss(id);
              navigate(notificationLink(notification));
            }}
          />
        ),
        { duration: 5000 }
      );
    });

    socket.on('notification:read-all', () => {
      queryClient.setQueryData(keys.unreadCount, { count: 0 });
      queryClient.invalidateQueries({ queryKey: keys.notifications });
    });

    return () => socket.disconnect();
  }, [userId, queryClient, navigate]);
}
