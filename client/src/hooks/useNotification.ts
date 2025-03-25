import { useEffect, useState } from 'react';
import { DatabaseNotification, NotificationUpdatePayload } from '@fake-stack-overflow/shared';
import { ObjectId } from 'mongodb';
import useUserContext from './useUserContext';
import { getUserNotifs, readNotif } from '../services/notificationService';

/**
 * useNotification is a custom hook that provides state and functions for giving notifications
 * It includes a selected user, notifications, and a new message state.
 */
const useNotification = () => {
  const { user, socket } = useUserContext();
  const [showBrowserNotifs, setShowBrowserNotifs] = useState<boolean>(false);
  const [unreadBrowserNotifs, setUnreadBrowserNotifs] = useState<DatabaseNotification[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Function to read notification
   */
  const handleReadNotification = async (notifId: ObjectId | undefined) => {
    if (!notifId) {
      setError('Invalid notification ID');
      return;
    }

    await readNotif(notifId);
  };

  useEffect(() => {
    const fetchUnreadBrowserNotifs = async () => {
      const userUnreadNotifs = (await getUserNotifs(user.username)).filter(
        n => n.type === 'browser' && n.read === false,
      );
      setUnreadBrowserNotifs(userUnreadNotifs);
    };

    const handleNotificationUpdate = (notifUpdate: NotificationUpdatePayload) => {
      const { notification, type } = notifUpdate;

      switch (type) {
        case 'created': {
          if (notification.user === user) {
            setUnreadBrowserNotifs(prevUnreadNotifs => [notification, ...prevUnreadNotifs]);
          }
          return;
        }
        case 'read': {
          if (notification.user === user) {
            setUnreadBrowserNotifs(prevUnreadNotifs =>
              prevUnreadNotifs.filter(n => n !== notification),
            );
          }
          return;
        }
        default: {
          setError('Invalid notification update type');
        }
      }
    };

    fetchUnreadBrowserNotifs();

    socket.on('notificationUpdate', handleNotificationUpdate);

    return () => {
      socket.off('notificationUpdate', handleNotificationUpdate);
    };
  }, [user, socket]);

  return {
    showBrowserNotifs,
    setShowBrowserNotifs,
    unreadBrowserNotifs,
    error,
    handleReadNotification,
  };
};

export default useNotification;
