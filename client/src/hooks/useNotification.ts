import { useEffect, useState } from 'react';
import { DatabaseNotification, NotificationUpdatePayload } from '@fake-stack-overflow/shared';
import useUserContext from './useUserContext';
import { getUserNotifs } from '../services/notificationService';

/**
 * useNotification is a custom hook that provides state and functions for giving notifications
 * It includes a selected user, notifications, and a new message state.
 */
const useNotification = () => {
  const { user, socket } = useUserContext();
  const [showNotifs, setShowNotifs] = useState<boolean>(false);
  const [unreadNotifs, setUnreadNotifs] = useState<DatabaseNotification[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnreadNotifs = async () => {
      const userUnreadNotifs = await getUserNotifs(user.username);
      setUnreadNotifs(userUnreadNotifs);
    };

    const handleNotificationUpdate = (notifUpdate: NotificationUpdatePayload) => {
      const { notification, type } = notifUpdate;

      switch (type) {
        case 'created': {
          if (notification.user === user) {
            setUnreadNotifs(prevUnreadNotifs => [notification, ...prevUnreadNotifs]);
          }
          return;
        }
        case 'read': {
          if (notification.user === user) {
            setUnreadNotifs(prevUnreadNotifs => prevUnreadNotifs.filter(n => n !== notification));
          }
          return;
        }
        default: {
          setError('Invalid notification update type');
        }
      }
    };

    fetchUnreadNotifs();

    socket.on('notificationUpdate', handleNotificationUpdate);

    return () => {
      socket.off('notificationUpdate', handleNotificationUpdate);
    };
  }, [user, socket]);

  return {
    showNotifs,
    setShowNotifs,
    unreadNotifs,
    error,
  };
};

export default useNotification;
