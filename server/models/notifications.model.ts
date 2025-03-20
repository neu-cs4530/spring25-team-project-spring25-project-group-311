import mongoose, { Model } from 'mongoose';
import notificationSchema from './schema/notification.schema';
import { DatabaseNotification } from '../types/types';

/**
 * Mongoose model for the `Notification` collection.
 *
 * This model is created using the `Notification` interface and the `notificationSchema`, representing the
 * `Notification` collection in the MongoDB database, and provides an interface for interacting with
 * the stored notifications.
 *
 * @type {Model<Notification>}
 */
const NotificationModel: Model<DatabaseNotification> = mongoose.model<DatabaseNotification>(
  'Notification',
  notificationSchema,
);

export default NotificationModel;
