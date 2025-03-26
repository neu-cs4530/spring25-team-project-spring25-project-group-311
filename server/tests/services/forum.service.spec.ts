import mongoose from 'mongoose';
import ForumModel from '../../models/forum.model';
import { saveForum } from '../../services/forum.service';
import { DatabaseForum, Forum } from '../../types/types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Forum model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveForum', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the saved user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const savedForum = {
        _id: new mongoose.Types.ObjectId(),
        moderators: [userId],
        members: [userId],
        questions: [],
      };

      const forum: Forum = {
        name: 'Forum',
        description: 'This is a forum',
        createdBy: 'user123',
        createDateTime: new Date(),
        moderators: ['user123'],
        members: ['user123'],
        awaitingMembers: [],
        bannedMembers: [],
        questions: [],
        type: 'public',
      };

      mockingoose(ForumModel).toReturn(savedForum, 'create');

      const newForum = (await saveForum(forum)) as DatabaseForum;

      expect(newForum).toBeDefined();
    });
  });
});
