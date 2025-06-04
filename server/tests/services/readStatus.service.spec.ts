import ReadStatusModel from '../../models/readStatus.model';
import { markAsRead, checkReadStatus } from '../../services/readStatus.service';
import { ans1, ans2, com1, QUESTIONS, safeUser } from '../mockData.models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('ReadStatus service', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  describe('markAsRead', () => {
    test('should mark a post as read and return the updated read status document', async () => {
      const userId = safeUser._id;
      const postId = ans1._id;
      const mockReadStatus = { userId, postId, read: true };

      mockingoose(ReadStatusModel).toReturn(mockReadStatus, 'findOneAndUpdate');

      const result = await markAsRead(userId.toString(), postId.toString());
      if ('error' in result) {
        throw new Error(`Expected a ReadStatus, got error: ${result.error}`);
      }
      expect(result).toBeDefined();
      expect(result.read).toBe(true);
      expect(result.userId).toEqual(userId);
      expect(result.postId).toEqual(postId);
    });

    test('should handle errors when marking a post as read', async () => {
      mockingoose(ReadStatusModel).toReturn(new Error('DB Error'), 'findOneAndUpdate');

      const result = await markAsRead(safeUser._id.toString(), com1._id.toString());
      expect('error' in result).toBe(true);
    });

    test('should return an error if the database returns null', async () => {
      mockingoose(ReadStatusModel).toReturn(null, 'findOneAndUpdate');

      const result = await markAsRead(safeUser._id.toString(), QUESTIONS[0]._id.toString());
      expect('error' in result).toBe(true);
    });
  });

  describe('checkReadStatus', () => {
    test('should return the read status for a given user and post', async () => {
      const userId = safeUser._id;
      const postId = QUESTIONS[1]._id;
      const mockReadStatus = { read: true };

      mockingoose(ReadStatusModel).toReturn(mockReadStatus, 'findOne');

      const result = await checkReadStatus(userId.toString(), postId.toString());
      if ('error' in result) {
        throw new Error(`Expected a ReadStatus, got error: ${result.error}`);
      }

      expect(result).toBeDefined();
      expect(result.read).toBe(true);
    });

    test('should handle errors when checking read status', async () => {
      mockingoose(ReadStatusModel).toReturn(new Error('DB Error'), 'findOne');

      const result = await checkReadStatus(safeUser._id.toString(), ans2._id.toString());
      expect('error' in result).toBe(true);
    });

    test('should handle errors if database returns null', async () => {
      mockingoose(ReadStatusModel).toReturn(null, 'findOne');

      const result = await checkReadStatus(safeUser._id.toString(), com1._id.toString());
      expect('error' in result).toBe(true);
    });
  });
});
