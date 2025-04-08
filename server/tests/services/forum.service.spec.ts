import mongoose from 'mongoose';
import ForumModel from '../../models/forum.model';
import {
  addUserToForum,
  getForumById,
  getForumsList,
  getUserForums,
  saveForum,
} from '../../services/forum.service';
import { DatabaseForum, PopulatedDatabaseForum } from '../../types/types';
import { forum, FORUMS, POPULATED_FORUMS, POPULATED_QUESTIONS } from '../mockData.models';

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

      mockingoose(ForumModel).toReturn(savedForum, 'create');

      const newForum = (await saveForum(forum)) as DatabaseForum;

      expect(newForum).toBeDefined();
    });

    it('should return an error if the forum is not saved', async () => {
      jest
        .spyOn(ForumModel, 'create')
        .mockRejectedValueOnce(() => new Error('Error saving document'));

      const saveError = await saveForum(forum);

      expect('error' in saveError).toBe(true);
    });
  });

  describe('getForumById', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the correct forum', async () => {
      mockingoose(ForumModel).toReturn(FORUMS[0], 'findOne');
      ForumModel.schema.path('questions', Object);

      const retrievedForum = (await getForumById(
        '67f5505718865f92b7bcd0a0',
      )) as PopulatedDatabaseForum;

      expect(retrievedForum.name).toEqual('Apple users');
      expect(retrievedForum.description).toEqual('A forum for macbook enjoyers');
      expect(retrievedForum.createDateTime).toEqual(new Date('2024-12-03'));
      expect(retrievedForum.createdBy).toEqual('fby1');
      expect(retrievedForum.moderators).toEqual(['fby1']);
      expect(retrievedForum.members).toEqual(['fby1', 'user1']);
      expect(retrievedForum.awaitingMembers).toEqual([]);
      expect(retrievedForum.bannedMembers).toEqual([]);
      expect(retrievedForum.type).toEqual('public');
      expect(retrievedForum.questions.length).toEqual(1);
      expect(retrievedForum.questions[0]._id).toEqual(POPULATED_QUESTIONS[0]._id);
    });

    it('should return an error if the forum is not found', async () => {
      mockingoose(ForumModel).toReturn(null, 'findOne');

      const retrievedForum = await getForumById('nonexistentId');

      expect(retrievedForum).toEqual({
        error: 'Error occurred when finding forum: Error: Forum not found',
      });
    });
  });

  describe('getForumsList', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return a list of forums', async () => {
      mockingoose(ForumModel).toReturn(POPULATED_FORUMS.slice(0, 2), 'find');
      ForumModel.schema.path('questions', Object);

      const result = await getForumsList();

      expect(result.length).toEqual(2);
      expect(result[0]._id.toString()).toEqual('67f5505718865f92b7bcd0a0');
      expect(result[1]._id.toString()).toEqual('67f550fb443cc714d61b7c66');
    });

    it('should return an empty list if an error occurs', async () => {
      mockingoose(ForumModel).toReturn(new Error('error'), 'find');

      const result = await getForumsList();

      expect(result.length).toEqual(0);
    });
  });

  describe('getUserForums', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return a list of forums associated with the user', async () => {
      mockingoose(ForumModel).toReturn([POPULATED_FORUMS[0]], 'find');
      ForumModel.schema.path('questions', Object);

      const result = await getUserForums('fby1');

      expect(result.length).toEqual(1);
      expect(result[0]._id.toString()).toEqual('67f5505718865f92b7bcd0a0');
    });

    it('should return an empty list if an error occurs', async () => {
      mockingoose(ForumModel).toReturn(new Error('error'), 'find');

      const result = await getUserForums('doesntExistUser');

      expect(result.length).toEqual(0);
    });
  });

  describe('addUserToForum', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('addUserToForum should add a user to a forum if no error occurs', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f5505718865f92b7bcd0a0',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn(
        { ...forumExample, members: ['user5', ...forumExample.members] },
        'findOneAndUpdate',
      );
      ForumModel.schema.path('questions', Object);

      const result = (await addUserToForum(
        '67f5505718865f92b7bcd0a0',
        'user5',
      )) as PopulatedDatabaseForum;

      expect(result.members.length).toEqual(3);
      expect(result.members).toEqual(['user5', ...forumExample.members]);
    });
  });
});
