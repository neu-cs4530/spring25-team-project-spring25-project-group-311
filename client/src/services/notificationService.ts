import { PopulatedDatabaseNotification } from '@fake-stack-overflow/shared';
import { ObjectId } from 'mongodb';
import api from './config';

const NOTIFICATION_API_URL = `${process.env.REACT_APP_SERVER_URL}/notification`;

/**
 * Function to get a particular user's notifications
 * @param username The given username whose notifications we want to get
 * @returns A given user's notifications
 * @throws Error if there is an issue getting notifs.
 */
const getUserNotifs = async (username: string): Promise<PopulatedDatabaseNotification[]> => {
  const res = await api.get(`${NOTIFICATION_API_URL}/getUserNotifs/${username}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching notifications');
  }
  return res.data;
};

/**
 * Function to mark a notification as read
 * @param notifID The ID of the notification
 * @returns A read notification
 * @throws Error if there is an issue reading a notification
 */
const readNotif = async (notifID: ObjectId): Promise<PopulatedDatabaseNotification> => {
  const res = await api.patch(`${NOTIFICATION_API_URL}/readNotif/${notifID}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching notifications');
  }
  return res.data;
};

export { getUserNotifs, readNotif };
