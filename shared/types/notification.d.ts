import { ObjectId } from 'mongodb';
import { Request } from 'express';
import { SafeDatabaseUser } from './user';

/**
 * Represents a notification
 * - `title`: The title of the notification
 * - `text`: The text of the notification
 * - `type`: The type of the message, either 'global' or 'direct'.
 * - `user`: The user that the notificiation will be sent to.
 * - `read`: Boolean representing whether the notification has been read.
 */
export interface Notification {
  title: string;
  text: string;
  type: 'email' | 'browser';
  user: SafeDatabaseUser;
  read: boolean;
}

/**
 * Represents a notification stored in the database.
 * - `_id`: Unique identifier for the notification.
 * - `title`: The title of the notification
 * - `text`: The text of the notification
 * - `type`: The type of the message, either 'global' or 'direct'.
 * - `user`: The user that the notificiation will be sent to.
 * - `sent`: Boolean representing whether the notification has been sent.
 */
export interface DatabaseNotification extends Notification {
  _id: ObjectId;
}

/**
 * Type representing possible responses for a Notification-related operation.
 * - Either a `DatabaseNotification` object or an error message.
 */
export type NotificationResponse = DatabaseNotification | { error: string };

/**
 * Type representing a request to create a notification.
 * - `title`: The title of the notification
 * - `text`: The text of the notification
 * - `type`: The type of the notification -- either email notif or a browser notif
 * - `user`: The user associated with the notification
 */
export interface CreateNotificationRequest extends Request {
  body: {
    title: string;
    text: string;
    type: 'email' | 'browser';
    user: User;
  };
}

/**
 * Type representing a request to get notifications for a specific user.
 * - `username`: The username of the given user whose notifications you want to get (param)
 */
export interface GetUserNotificationRequest extends Request {
  params: {
    username: string;
  };
}

/**
 * Type representing a read notification request with the notification in the parameter.
 * - `notifID`: The ID of the notification we want to read. (param)
 */
export interface ReadNotificationRequest extends Request {
  params: {
    notifID: string;
  };
}
