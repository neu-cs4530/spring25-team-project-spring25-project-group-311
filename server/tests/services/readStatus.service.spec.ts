import ReadStatusModel from '../../models/readStatus.model';
import { markAsRead, checkReadStatus } from '../../services/readStatus.service';
// import { DatabaseReadStatus } from '../../types/types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('ReadStatus service', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  describe('markAsRead', () => {
    test('should mark a post as read and return the updated read status document', async () => {
      const userId = 'user123';
      const postId = 'post123';
      const mockReadStatus = { userId, postId, read: true };

      mockingoose(ReadStatusModel).toReturn(mockReadStatus, 'findOneAndUpdate');

      const result = await markAsRead(userId, postId);
      expect(result).toBeDefined();
      expect(result.read).toBe(true);
      expect(result.userId).toEqual(userId);
      expect(result.postId).toEqual(postId);
    });

    test('should handle errors when marking a post as read', async () => {
      mockingoose(ReadStatusModel).toReturn(new Error('DB Error'), 'findOneAndUpdate');

      await expect(markAsRead('user123', 'post123')).rejects.toThrow('DB Error');
    });
  });

  describe('checkReadStatus', () => {
    test('should return the read status for a given user and post', async () => {
      const userId = 'user123';
      const postId = 'post123';
      const mockReadStatus = { read: true };

      mockingoose(ReadStatusModel).toReturn(mockReadStatus, 'findOne');

      const result = await checkReadStatus(userId, postId);
      expect(result).toBeDefined();
      expect(result.read).toBe(true);
    });

    test('should handle errors when checking read status', async () => {
      mockingoose(ReadStatusModel).toReturn(new Error('DB Error'), 'findOne');

      await expect(checkReadStatus('user123', 'post123')).rejects.toThrow('DB Error');
    });
  });
});
