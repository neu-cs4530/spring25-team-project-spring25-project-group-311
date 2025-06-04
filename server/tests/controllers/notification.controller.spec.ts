import supertest from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import * as util from '../../services/notification.service';
import * as databaseUtil from '../../utils/database.util';
import {
  DatabaseNotification,
  SafeDatabaseUser,
  Notification,
  PopulatedDatabaseNotification,
} from '../../types/types';

const safeUser: SafeDatabaseUser = {
  username: 'user1',
  dateJoined: new Date('2024-12-03'),
  emails: [],
  badges: [],
  browserNotif: false,
  emailNotif: false,
  questionsAsked: [],
  answersGiven: [],
  numUpvotesDownvotes: 0,
  _id: new mongoose.Types.ObjectId(),
};

const safeUserJson = {
  username: 'user1',
  dateJoined: safeUser.dateJoined.toISOString(),
  emails: [],
  badges: [],
  browserNotif: false,
  emailNotif: false,
  questionsAsked: [],
  answersGiven: [],
  numUpvotesDownvotes: 0,
  _id: safeUser._id.toString(),
};

const notifOne: Notification = {
  title: 'New notification',
  text: 'This is to notify you',
  type: 'browser',
  user: safeUser,
  read: false,
};

const databaseNotifOne: DatabaseNotification = {
  title: 'New notification',
  text: 'This is to notify you',
  type: 'browser',
  user: safeUser._id,
  read: false,
  _id: new mongoose.Types.ObjectId(),
};

const populatedNotifOne: PopulatedDatabaseNotification = {
  title: 'New notification',
  text: 'This is to notify you',
  type: 'browser',
  user: safeUser,
  read: false,
  _id: databaseNotifOne._id,
};

const populatedNotifOneJSON = {
  title: 'New notification',
  text: 'This is to notify you',
  type: 'browser',
  user: safeUserJson,
  read: false,
  _id: databaseNotifOne._id.toString(),
};

const notifTwo: Notification = {
  title: 'Second notification',
  text: 'Read this',
  type: 'email',
  user: safeUser,
  read: true,
};

const databaseNotifTwo: DatabaseNotification = {
  title: 'Second notification',
  text: 'Read this',
  type: 'email',
  user: safeUser._id,
  read: true,
  _id: new mongoose.Types.ObjectId(),
};

const populatedNotifTwo: PopulatedDatabaseNotification = {
  title: 'Second notification',
  text: 'Read this',
  type: 'email',
  user: safeUser,
  read: true,
  _id: databaseNotifTwo._id,
};

const populatedNotifTwoJSON = {
  title: 'Second notification',
  text: 'Read this',
  type: 'email',
  user: safeUserJson,
  read: true,
  _id: databaseNotifTwo._id.toString(),
};
const saveNotificationSpy = jest.spyOn(util, 'saveNotification');
const getUserNotifsSpy = jest.spyOn(util, 'getUserNotifs');
const readNotificationSpy = jest.spyOn(util, 'readNotification');
const populateDocumentSpy = jest.spyOn(databaseUtil, 'populateDocument');

describe('Test notificationController', () => {
  describe('POST /createNotif', () => {
    it('should create a notification given the correct arguments', async () => {
      const mockReqBody = {
        title: notifOne.title,
        text: notifOne.text,
        type: notifOne.type,
        user: safeUserJson,
      };

      saveNotificationSpy.mockResolvedValueOnce(databaseNotifOne);
      populateDocumentSpy.mockResolvedValueOnce(populatedNotifOne);
      const response = await supertest(app).post('/notification/createNotif').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(populatedNotifOneJSON);
      expect(saveNotificationSpy).toHaveBeenCalledWith({
        ...mockReqBody,
        read: false,
      });
      expect(populateDocumentSpy).toHaveBeenCalledWith(
        databaseNotifOne._id.toString(),
        'notification',
      );
    });

    it('should return 400 error for empty req body', async () => {
      const mockReqBody = {};
      const response = await supertest(app).post('/notification/createNotif').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid notification body');
    });

    it('should return 400 error for req body missing title', async () => {
      const mockReqBody = {
        text: notifOne.text,
        type: notifOne.type,
        user: notifOne.user,
      };
      const response = await supertest(app).post('/notification/createNotif').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid notification body');
    });

    it('should return 400 error for req body having blank title', async () => {
      const mockReqBody = {
        title: '',
        text: notifOne.text,
        type: notifOne.type,
        user: notifOne.user,
      };
      const response = await supertest(app).post('/notification/createNotif').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid notification body');
    });

    it('should return 400 error for req body missing text', async () => {
      const mockReqBody = {
        title: notifTwo,
        type: notifTwo.type,
        user: notifTwo.user,
      };
      const response = await supertest(app).post('/notification/createNotif').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid notification body');
    });

    it('should return 400 error for req body having blank text', async () => {
      const mockReqBody = {
        title: notifTwo.title,
        text: '',
        type: notifTwo.type,
        user: notifTwo.user,
      };
      const response = await supertest(app).post('/notification/createNotif').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid notification body');
    });

    it('should return 400 error for req body missing type', async () => {
      const mockReqBody = {
        title: notifTwo.title,
        text: notifTwo.text,
        user: notifTwo.user,
      };
      const response = await supertest(app).post('/notification/createNotif').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid notification body');
    });

    it('should return 400 error for req body missing user', async () => {
      const mockReqBody = {
        title: notifTwo.title,
        text: notifTwo.text,
        type: notifTwo.type,
      };
      const response = await supertest(app).post('/notification/createNotif').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid notification body');
    });

    it('should return 500 error if there is an error with saving the notification', async () => {
      const mockReqBody = {
        title: notifTwo.title,
        text: notifTwo.text,
        type: notifTwo.type,
        user: safeUserJson,
      };

      saveNotificationSpy.mockResolvedValueOnce({ error: 'Error saving notification' });

      const response = await supertest(app).post('/notification/createNotif').send(mockReqBody);
      expect(response.status).toBe(500);
      expect(response.text).toEqual(
        'Error when saving notification: Error: Error saving notification',
      );
    });

    it('should return 500 error if there is an error with populating the notification', async () => {
      const mockReqBody = {
        title: notifTwo.title,
        text: notifTwo.text,
        type: notifTwo.type,
        user: safeUserJson,
      };

      saveNotificationSpy.mockResolvedValueOnce(databaseNotifOne);
      populateDocumentSpy.mockResolvedValueOnce({ error: 'Error populating document' });

      const response = await supertest(app).post('/notification/createNotif').send(mockReqBody);
      expect(response.status).toBe(500);
      expect(response.text).toEqual(
        'Error when saving notification: Error: Error populating document',
      );
    });
  });

  describe('GET /getUserNotifs/:username', () => {
    it('should get a list of notifications for a given username', async () => {
      getUserNotifsSpy.mockResolvedValueOnce([databaseNotifOne, databaseNotifTwo]);
      populateDocumentSpy.mockResolvedValueOnce(populatedNotifOne);
      populateDocumentSpy.mockResolvedValueOnce(populatedNotifTwo);

      const response = await supertest(app).get(`/notification/getUserNotifs/${safeUser.username}`);
      expect(response.status).toBe(200);
      expect(getUserNotifsSpy).toHaveBeenCalledWith(safeUser.username);
      expect(populateDocumentSpy).toHaveBeenCalledWith(
        databaseNotifOne._id.toString(),
        'notification',
      );
      expect(populateDocumentSpy).toHaveBeenCalledWith(
        databaseNotifTwo._id.toString(),
        'notification',
      );
      expect(response.body).toMatchObject([populatedNotifOneJSON, populatedNotifTwoJSON]);
    });

    it('should return a 404 error if not given a username', async () => {
      const response = await supertest(app).get(`/notification/getUserNotifs/`);
      expect(response.status).toBe(404);
    });

    it('should return a 500 error if there is an error populating notifications', async () => {
      getUserNotifsSpy.mockResolvedValueOnce([databaseNotifOne, databaseNotifTwo]);
      populateDocumentSpy.mockResolvedValue({ error: 'Error populating document' });

      const response = await supertest(app).get(`/notification/getUserNotifs/${safeUser.username}`);
      expect(response.status).toBe(500);
      expect(getUserNotifsSpy).toHaveBeenCalledWith(safeUser.username);
    });
  });

  describe('PATCH /readNotif/:notifID', () => {
    it('should return the read notification', async () => {
      readNotificationSpy.mockResolvedValueOnce(databaseNotifTwo);
      populateDocumentSpy.mockResolvedValueOnce(populatedNotifTwo);
      const response = await supertest(app).patch(
        `/notification/readNotif/${databaseNotifTwo._id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(populatedNotifTwoJSON);
      expect(readNotificationSpy).toHaveBeenCalledWith(databaseNotifTwo._id.toString());
      expect(populateDocumentSpy).toHaveBeenCalledWith(
        databaseNotifTwo._id.toString(),
        'notification',
      );
    });

    it('should return a 404 error if not given a notification ID', async () => {
      const response = await supertest(app).patch(`/notification/readNotif/`);
      expect(response.status).toBe(404);
    });

    it('should return a 500 if there is an error reading notification', async () => {
      readNotificationSpy.mockResolvedValueOnce({ error: 'Error reading notification' });
      const response = await supertest(app).patch(
        `/notification/readNotif/${databaseNotifTwo._id}`,
      );

      expect(response.status).toBe(500);
      expect(readNotificationSpy).toHaveBeenCalledWith(databaseNotifTwo._id.toString());
      expect(response.text).toEqual(
        'Error when reading notification: Error: Error reading notification',
      );
    });

    it('should return the read notification', async () => {
      readNotificationSpy.mockResolvedValueOnce(databaseNotifTwo);
      populateDocumentSpy.mockResolvedValueOnce({ error: 'Error populating document' });
      const response = await supertest(app).patch(
        `/notification/readNotif/${databaseNotifTwo._id}`,
      );

      expect(response.status).toBe(500);
      expect(readNotificationSpy).toHaveBeenCalledWith(databaseNotifTwo._id.toString());
      expect(response.text).toEqual(
        'Error when reading notification: Error: Error populating document',
      );
    });
  });
});
