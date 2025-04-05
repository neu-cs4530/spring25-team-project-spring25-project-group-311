import React from 'react';
import './index.css';
import { ObjectId } from 'mongodb';
import { PopulatedDatabaseNotification } from '../../../../types/types';

/**
 * NotificationCard component displays information about a notification and allows the user to click on it to read it.
 *
 * @param notification: The notification object containing details like the title, the text, the user it's associated with, etc.
 * @param handleReadNotification: A function to handle reading a notification.
 *
 */
const NotificationCard = ({
  notification,
  handleReadNotification,
}: {
  notification: PopulatedDatabaseNotification;
  handleReadNotification: (notifId: ObjectId | undefined) => void;
}) => (
  <div onClick={() => handleReadNotification(notification._id)} className='notification-card'>
    <div className='notification-header'>
      <div className='notification-title'>{notification.title}</div>
    </div>
    <div className='notification-text'>{notification.text}</div>
  </div>
);

export default NotificationCard;
