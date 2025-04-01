import mongoose from 'mongoose';
import ForumModel from '../../models/forum.model';
import { getForumById, saveForum } from '../../services/forum.service';
import { DatabaseForum, Forum, PopulatedDatabaseForum } from '../../types/types';
import { databaseForum, POPULATED_QUESTIONS } from '../mockData.models';

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

    it('should return the saved forum', async () => {
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

  describe('getForumById', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the correct forum', async () => {
      mockingoose(ForumModel).toReturn(databaseForum, 'findOne');
      ForumModel.schema.path('questions', Object);

      const retrievedForum = (await getForumById(
        '67e9aed01b2ac4c63eb92ab0',
      )) as PopulatedDatabaseForum;

      expect(retrievedForum.name).toEqual('forum1');
      expect(retrievedForum.description).toEqual('this is a forum');
      expect(retrievedForum.createDateTime).toEqual(new Date('2024-12-03'));
      expect(retrievedForum.createdBy).toEqual('user1');
      expect(retrievedForum.moderators).toEqual(['user1']);
      expect(retrievedForum.members).toEqual(['user1']);
      expect(retrievedForum.awaitingMembers).toEqual([]);
      expect(retrievedForum.bannedMembers).toEqual([]);
      expect(retrievedForum.type).toEqual('private');
      expect(retrievedForum.questions.length).toEqual(1);
      expect(retrievedForum.questions[0]._id).toEqual(POPULATED_QUESTIONS[0]._id);
    });
  });
});
