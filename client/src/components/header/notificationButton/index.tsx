import React from 'react';
import './index.css';
import { useNavigate } from 'react-router-dom';

/**
 * Notification component renders a page for direct messaging between users.
 * It includes a list of users and a chat window to send and receive messages.
 */
const NotificationButton = () => {
  const navigate = useNavigate();
  return (
    <div className='notif-section'>
      <button
        className='dropdown-button'
        data-toggle='dropdown'
        onClick={() => navigate('/notifications')}>
        Notifications
      </button>
    </div>
  );
};

export default NotificationButton;
