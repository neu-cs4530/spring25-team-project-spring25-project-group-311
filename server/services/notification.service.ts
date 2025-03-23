import NotificationModel from '../models/notifications.model';
import UserModel from '../models/users.model';
import {
  DatabaseNotification,
  DatabaseUser,
  Notification,
  NotificationResponse,
} from '../types/types';

/**
 * Saves a new notification to the database
 * @param notif the notification to save
 * @returns {Promise<NotificationResponse>} Resolves with the saved notification object or an error message.
 */
export const saveNotification = async (notif: Notification): Promise<NotificationResponse> => {
  try {
    const result: DatabaseNotification = await NotificationModel.create(notif);

    if (!result) {
      throw Error('Failed to create notification');
    }

    return result;
  } catch (error) {
    return { error: `Error occurred when saving notification: ${error}` };
  }
};

/**
 * Gets all notifications associated wtih a given user
 * @param username the username whose notifications we're looking for
 * @returns {Promise<DatabaseNotification[]>} Resolves with a list of notifications associated with the given user.
 */
export const getUserNotifs = async (username: string): Promise<DatabaseNotification[]> => {
  try {
    const user: DatabaseUser | null = await UserModel.findOne({ username });

    if (!user) {
      throw Error('No user found');
    }

    const userNotifs = await NotificationModel.find({ username });
    return userNotifs;
  } catch (error) {
    return [];
  }
};
