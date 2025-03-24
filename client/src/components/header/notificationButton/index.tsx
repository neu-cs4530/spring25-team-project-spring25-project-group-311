import React from 'react';
import { FaBell } from 'react-icons/fa';
import useNotification from '../../../hooks/useNotification';
import './index.css';
import NotificationCard from '../notificationCard';

/**
 * Notification component renders a page for direct messaging between users.
 * It includes a list of users and a chat window to send and receive messages.
 */
const NotificationButton = () => {
  const {
    showBrowserNotifs,
    setShowBrowserNotifs,
    unreadBrowserNotifs,
    error,
    handleReadNotification,
  } = useNotification();

  return (
    <>
      {error && <div className='direct-message-error'>{error}</div>}
      <div>
        <FaBell
          style={unreadBrowserNotifs.length > 0 ? { color: 'red' } : { color: 'blue' }}
          onClick={() => setShowBrowserNotifs(show => !show)}></FaBell>
        {showBrowserNotifs && (
          <div className='browser-notif-list'>
            {unreadBrowserNotifs.map(bNotif => (
              <NotificationCard
                key={String(bNotif._id)}
                notification={bNotif}
                handleReadNotification={() => handleReadNotification(bNotif._id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationButton;
