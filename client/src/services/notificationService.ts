import axios from 'axios';
import { DatabaseNotification, Notification } from '@fake-stack-overflow/shared';
import { ObjectId } from 'mongodb';
import api from './config';

const NOTIFICATION_API_URL = `${process.env.REACT_APP_SERVER_URL}/notification`;

/**
 * Function to get a particular user's notifications
 * @param username The given username whose notifications we want to get
 * @returns A given user's notifications
 * @throws Error if there is an issue getting notifs.
 */
const getUserNotifs = async (username: string): Promise<DatabaseNotification[]> => {
  const res = await api.get(`${NOTIFICATION_API_URL}/getUserNotifs/${username}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching notifications');
  }
  return res.data;
};

/**
 * Function to create notification
 * @param notification the notification details () used to create the notification
 * @returns A created notification
 * @throws Error if there is an issue creating a notification
 */
const createNotif = async (
  notification: Omit<Notification, 'sent'>,
): Promise<DatabaseNotification> => {
  try {
    const res = await api.post(`${NOTIFICATION_API_URL}/createNotif/`, notification);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Error while creating notification: ${error.response.data}`);
    } else {
      throw new Error('Error while reating notification');
    }
  }
};

/**
 * Function to mark a notification as read
 * @param notifID The ID of the notification
 * @returns A read notification
 * @throws Error if there is an issue reading a notification
 */
const readNotif = async (notifID: ObjectId): Promise<DatabaseNotification> => {
  const res = await api.patch(`${NOTIFICATION_API_URL}/readNotif/${notifID}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching notifications');
  }
  return res.data;
};

export { getUserNotifs, createNotif, readNotif };
