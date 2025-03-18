import { ObjectId } from 'mongodb';
// import { Request } from 'express';
import { User } from './user';

/**
 * Represents a notification
 * - `title`: The title of the notification
 * - `text`: The text of the notification
 * - `type`: The type of the message, either 'global' or 'direct'.
 * - `user`: The user that the notificiation will be sent to.
 * - `sent`: Boolean representing whether the notification has been sent.
 */
export interface Notification {
  title: string;
  text: string;
  type: 'email' | 'browser';
  user: User;
  sent: boolean;
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
