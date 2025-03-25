import express, { Response, Router } from 'express';
import {
  CreateNotificationRequest,
  FakeSOSocket,
  GetUserNotificationRequest,
  Notification,
  ReadNotificationRequest,
} from '../types/types';
import {
  getUserNotifs,
  readNotification,
  saveNotification,
} from '../services/notification.service';

/**
 * The controller handles notification related routes.
 * @param socket the socket instance to emit events
 * @returns {express.Router} The router object containing the notification routes.
 * @throws {Error} Throws an error if the notification creation fails.
 */
const notificationController = (socket: FakeSOSocket) => {
  const router: Router = express.Router();

  /**
   * Validates that the request body contains all required fields for a notification.
   * @param req The incoming request containing notification data.
   * @returns `true` if the body contains valid notification fields; otherwise, `false`.
   */
  const isNotifBodyValid = (req: CreateNotificationRequest): boolean =>
    req.body !== undefined &&
    req.body.title !== undefined &&
    req.body.title !== '' &&
    req.body.text !== undefined &&
    req.body.text !== '' &&
    req.body.user !== undefined;

  /**
   * Handles the creation of a notification.
   * @param req The request containing the title, text, and user associated with the notification
   * @param res The response, either returning the created notification or an error.
   * @returns A promise resolving to void.
   */
  const createNotification = async (
    req: CreateNotificationRequest,
    res: Response,
  ): Promise<void> => {
    if (!isNotifBodyValid(req)) {
      res.status(400).send('Invalid notification body');
      return;
    }

    try {
      const notifBody = req.body;
      const notif: Notification = {
        ...notifBody,
        read: false,
      };

      const result = await saveNotification(notif);

      if ('error' in result) {
        throw new Error(result.error);
      }

      socket.emit('notificationUpdate', {
        notification: result,
        type: 'created',
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when saving notification: ${error}`);
    }
  };

  /**
   * Route to get all the notifications associated with a particular user.
   * @param req The request containing the username in the parameter
   * @param res The response, either returning the list of notifcations or an error.
   */
  const getUserNotifications = async (
    req: GetUserNotificationRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const { username } = req.params;
      const result = await getUserNotifs(username);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when getting user notification: ${error}`);
    }
  };

  /**
   * Route to read a notification given the ID
   * @param req The request containing the notification ID in the parameter
   * @param res The response, either returning the read notification or an error.
   */
  const readNotif = async (req: ReadNotificationRequest, res: Response): Promise<void> => {
    try {
      const { notifID } = req.params;
      const readNf = await readNotification(notifID);

      if ('error' in readNf) {
        throw Error(readNf.error);
      }
      socket.emit('notificationUpdate', {
        notification: readNf,
        type: 'read',
      });
      res.status(200).json(readNf);
    } catch (error) {
      res.status(500).send(`Error when reading notification: ${error}`);
    }
  };

  router.post('/createNotif', createNotification);
  router.get('/getUserNotifs/:username', getUserNotifications);
  router.patch('/readNotif/:notifID', readNotif);
};

export default notificationController;
