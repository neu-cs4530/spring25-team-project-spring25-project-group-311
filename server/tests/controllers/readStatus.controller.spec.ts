import supertest from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import * as readStatusService from '../../services/readStatus.service';
// import ReadStatusModel from '../../models/readStatus.model';
import { DatabaseReadStatus } from '../../types/types';

// Create spy instances for service methods
const markAsReadSpy: jest.SpyInstance = jest.spyOn(readStatusService, 'markAsRead');
const checkReadStatusSpy: jest.SpyInstance = jest.spyOn(readStatusService, 'checkReadStatus');

describe('readStatusController', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear previous mocking info between tests to avoid tests affecting each other
  });

  describe('POST /:postId/read', () => {
    it('should mark the post as read and return success', async () => {
      const postIdVal = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      const mockReadStatus: DatabaseReadStatus = {
        _id: new mongoose.Types.ObjectId(),
        userId,
        postId: postIdVal,
        read: true,
      };

      const postId = postIdVal.toString();
      markAsReadSpy.mockResolvedValueOnce(mockReadStatus);

      const response = await supertest(app)
        .post(`/read-status/${postId.toString()}/read`)
        .send({ user: { _id: 'user123' } });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Post marked as read', postId });
    });

    it('should return 500 if there is an error marking the post as read', async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      markAsReadSpy.mockRejectedValueOnce(new Error('Error marking read'));

      const response = await supertest(app)
        .post(`/read-status/${postId}/read`)
        .send({ user: { _id: 'user123' } });

      expect(response.status).toBe(500);
      expect(response.text).toEqual('Error processing your request: Error: Error marking read');
    });

    it('should return 404 if there is no post parameter', async () => {
      const response = await supertest(app)
        .post(`/read-status/read`)
        .send({ user: { _id: 'user123' } });

      expect(response.status).toBe(404);
    });

    it('should return 401 if there is no user body given', async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      const response = await supertest(app).post(`/read-status/${postId}/read`).send({});

      expect(response.status).toBe(401);
      expect(response.text).toEqual('User not authenticated');
    });

    it('should return 401 if there is no user id given', async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      const response = await supertest(app).post(`/read-status/${postId}/read`).send({ user: {} });

      expect(response.status).toBe(401);
      expect(response.text).toEqual('User not authenticated');
    });
  });

  describe('GET /:postId', () => {
    it('should return the read status of the post', async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      const mockReadStatus = { read: true };

      checkReadStatusSpy.mockResolvedValueOnce(mockReadStatus);

      const response = await supertest(app)
        .get(`/read-status/${postId}`)
        .send({ user: { _id: 'user123' } });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ readStatus: true });
    });

    it('should return 500 if there is an error fetching the read status', async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      checkReadStatusSpy.mockRejectedValueOnce(new Error('Error checking status'));

      const response = await supertest(app)
        .get(`/read-status/${postId}`)
        .send({ user: { _id: 'user123' } });

      expect(response.status).toBe(500);
      expect(response.text).toEqual('Error processing your request: Error: Error checking status');
    });
  });
});
