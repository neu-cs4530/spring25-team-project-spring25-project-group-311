import React from 'react';
import useNotification from '../../../hooks/useNotification';
import './index.css';
import NotificationCard from '../notificationCard';

/**
 * Notification component renders a page for direct messaging between users.
 * It includes a list of users and a chat window to send and receive messages.
 */
const NotificationButton = () => (
  <>
    <div className='notif-section'>
      <button
        className='dropdown-button'
        data-toggle='dropdown'
        onClick={() => console.log('cool')}>
        Notifications
      </button>
    </div>
  </>
);

export default NotificationButton;
