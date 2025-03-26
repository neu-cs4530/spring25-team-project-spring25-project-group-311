import { DatabaseNotification } from '@fake-stack-overflow/shared';
import { ObjectId } from 'mongodb';
import NotificationModel from '../../models/notifications.model';
import { safeUser } from '../mockData.models';
import {
  getUserNotifs,
  readNotification,
  saveNotification,
} from '../../services/notification.service';
import UserModel from '../../models/users.model';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Notification model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveNotification', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the saved notification', async () => {
      mockingoose(NotificationModel).toReturn(
        {
          title: 'New notification',
          text: 'This is to notify you',
          type: 'browser',
          user: safeUser,
          read: false,
        },
        'create',
      );

      const saveNotif = (await saveNotification({
        title: 'New notification',
        text: 'This is to notify you',
        type: 'browser',
        user: safeUser,
        read: false,
      })) as DatabaseNotification;

      expect(saveNotif._id).toBeDefined();
      expect(saveNotif.title).toEqual('New notification');
      expect(saveNotif.text).toEqual('This is to notify you');
      expect(saveNotif.type).toEqual('browser');
      expect(saveNotif.user).toEqual(safeUser._id);
      expect(saveNotif.read).toEqual(false);
    });
    it('should throw an error if error when saving to database', async () => {
      jest
        .spyOn(NotificationModel, 'create')
        .mockRejectedValueOnce(() => new Error('Error saving document'));

      const saveError = await saveNotification({
        title: 'New notification',
        text: 'This is to notify you',
        type: 'browser',
        user: safeUser,
        read: false,
      });

      expect('error' in saveError).toBe(true);
    });
  });

  describe('getUserNotifs', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return a list of notifications associated with a user', async () => {
      const notifications: DatabaseNotification[] = [
        {
          title: 'New notification',
          text: 'This is to notify you',
          type: 'browser',
          user: safeUser._id,
          read: false,
          _id: new ObjectId(),
        },
        {
          title: 'Second notification',
          text: 'Look at this',
          type: 'email',
          user: safeUser._id,
          read: false,
          _id: new ObjectId(),
        },
      ];

      mockingoose(UserModel).toReturn(safeUser, 'findOne');
      mockingoose(NotificationModel).toReturn(notifications, 'find');

      const retrievedNotifs = (await getUserNotifs(safeUser.username)) as DatabaseNotification[];
      expect(retrievedNotifs.length).toEqual(2);

      expect(retrievedNotifs[0]._id).toBeDefined();
      expect(retrievedNotifs[0].title).toEqual('New notification');
      expect(retrievedNotifs[0].text).toEqual('This is to notify you');
      expect(retrievedNotifs[0].type).toEqual('browser');
      expect(retrievedNotifs[0].user).toEqual(safeUser._id);
      expect(retrievedNotifs[0].read).toEqual(false);

      expect(retrievedNotifs[1]._id).toBeDefined();
      expect(retrievedNotifs[1].title).toEqual('Second notification');
      expect(retrievedNotifs[1].text).toEqual('Look at this');
      expect(retrievedNotifs[1].type).toEqual('email');
      expect(retrievedNotifs[1].user).toEqual(safeUser._id);
      expect(retrievedNotifs[1].read).toEqual(false);
    });

    it('should return an empty list of notifications associated with a user if there are no notifs', async () => {
      const notifications: DatabaseNotification[] = [];

      mockingoose(UserModel).toReturn(safeUser, 'findOne');
      mockingoose(NotificationModel).toReturn(notifications, 'find');

      const retrievedNotifs = (await getUserNotifs(safeUser.username)) as DatabaseNotification[];
      expect(retrievedNotifs.length).toEqual(0);
    });

    it('should return an empty list of notifications if the user is not a valid user', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');

      const retrievedNotifs = await getUserNotifs(safeUser.username);
      expect(retrievedNotifs.length).toEqual(0);
    });

    it('should return an empty list of notifications if there is an error getting the user', async () => {
      mockingoose(UserModel).toReturn(new Error('database error'), 'findOne');

      const retrievedNotifs = await getUserNotifs(safeUser.username);
      expect(retrievedNotifs.length).toEqual(0);
    });

    it('should return an empty list of notifications if there is an error getting the notifications', async () => {
      mockingoose(UserModel).toReturn(safeUser, 'findOne');
      mockingoose(NotificationModel).toReturn(new Error('database error'), 'find');

      const retrievedNotifs = await getUserNotifs(safeUser.username);
      expect(retrievedNotifs.length).toEqual(0);
    });
  });

  describe('readNotification', () => {
    it('should successfuly read a browser notification', async () => {
      const notif = {
        title: 'New notification',
        text: 'This is to notify you',
        type: 'browser',
        user: safeUser._id,
        read: true,
        _id: new ObjectId(),
      };

      mockingoose(NotificationModel).toReturn(notif, 'findOneAndUpdate');

      const readNotif = (await readNotification(notif._id.toString())) as DatabaseNotification;
      expect(readNotif._id).toBeDefined();
      expect(readNotif._id).toEqual(notif._id);
      expect(readNotif.title).toEqual('New notification');
      expect(readNotif.text).toEqual('This is to notify you');
      expect(readNotif.type).toEqual('browser');
      expect(readNotif.user).toEqual(safeUser._id);
      expect(readNotif.read).toEqual(true);
    });
    it('should successfuly read an email notification', async () => {
      const notif = {
        title: 'New notification 2',
        text: 'This is to notify you!',
        type: 'email',
        user: safeUser._id,
        read: true,
        _id: new ObjectId(),
      };

      mockingoose(NotificationModel).toReturn(notif, 'findOneAndUpdate');

      const readNotif = (await readNotification(notif._id.toString())) as DatabaseNotification;
      expect(readNotif._id).toBeDefined();
      expect(readNotif._id).toEqual(notif._id);
      expect(readNotif.title).toEqual('New notification 2');
      expect(readNotif.text).toEqual('This is to notify you!');
      expect(readNotif.type).toEqual('email');
      expect(readNotif.user).toEqual(safeUser._id);
      expect(readNotif.read).toEqual(true);
    });

    it('should throw an error if there is no notification with this id', async () => {
      mockingoose(NotificationModel).toReturn(null, 'findOneAndUpdate');
      const readNotif = await readNotification(new ObjectId().toString());
      expect('error' in readNotif).toBe(true);
    });

    it('should throw an error if there is a database error', async () => {
      mockingoose(NotificationModel).toReturn(new Error('database error'), 'findOneAndUpdate');
      const readNotif = await readNotification(new ObjectId().toString());
      expect('error' in readNotif).toBe(true);
    });
  });
});
