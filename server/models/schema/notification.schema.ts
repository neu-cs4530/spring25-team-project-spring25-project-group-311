import { Schema } from 'mongoose';

/**
 * Mongoose Schema for the Notification collection.
 *
 * This schema defines the structure for storing notifications in the database.
 * Each notification contains the following fields:
 * - `title`: The title of the notification.
 * - `text`: The detailed content of the notification.
 * - `type`: The type of notification, either email or browser-side.
 * - `user`: The user that the notification will be sent to.
 * - `read`: Boolean representing whether message was read (true for yes, false for no).
 */
const notificationSchema: Schema = new Schema(
  {
    title: {
      type: String,
    },
    text: {
      type: String,
    },
    type: {
      type: String,
      enum: ['email', 'browser'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { collection: 'Notification' },
);

export default notificationSchema;
