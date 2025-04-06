import React from 'react';
import useNotification from '../../../hooks/useNotification';
import './index.css';
import NotificationCard from '../notificationCard';

/**
 * Notification component renders a page for direct messaging between users.
 * It includes a list of users and a chat window to send and receive messages.
 */
const NotificationButton = (count: number) => {
  const {
    showBrowserNotifs,
    setShowBrowserNotifs,
    unreadBrowserNotifs,
    error,
    handleReadNotification,
  } = useNotification();

  return (
    <>
      {error && <div className='notif-error'>{error}</div>}
      <div className='notif-section'>
        <button
          className='dropdown-button'
          data-toggle='dropdown'
          onClick={() => setShowBrowserNotifs(prev => !prev)}>
          Notifications
        </button>
        {showBrowserNotifs && (
          <div>
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
