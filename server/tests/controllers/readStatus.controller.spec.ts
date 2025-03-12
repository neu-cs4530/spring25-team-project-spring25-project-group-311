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
      const postId = new mongoose.Types.ObjectId().toString();
      const mockReadStatus: DatabaseReadStatus = {
        _id: new mongoose.Types.ObjectId(),
        userId: 'user123',
        postId,
        read: true,
      };

      markAsReadSpy.mockResolvedValueOnce(mockReadStatus);

      const response = await supertest(app).post(`/${postId}/read`).send({ userId: 'user123' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Post marked as read', postId });
    });

    it('should return 500 if there is an error marking the post as read', async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      markAsReadSpy.mockRejectedValueOnce(new Error('Error marking read'));

      const response = await supertest(app).post(`/${postId}/read`).send({ userId: 'user123' });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error processing your request');
    });
  });

  describe('GET /:postId', () => {
    it('should return the read status of the post', async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      const mockReadStatus = { read: true };

      checkReadStatusSpy.mockResolvedValueOnce(mockReadStatus);

      const response = await supertest(app).get(`/${postId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ readStatus: true });
    });

    it('should return 500 if there is an error fetching the read status', async () => {
      const postId = new mongoose.Types.ObjectId().toString();
      checkReadStatusSpy.mockRejectedValueOnce(new Error('Error fetching read status'));

      const response = await supertest(app).get(`/${postId}`);

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error processing your request');
    });
  });
});
