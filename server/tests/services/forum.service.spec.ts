import mongoose from 'mongoose';
import ForumModel from '../../models/forum.model';
import {
  addQuestionToForum,
  addUserToForum,
  approveUser,
  banUser,
  cancelUserJoinRequest,
  getForumById,
  getForumQuestionsByOrder,
  getForumsList,
  getTopFivePosts,
  getUserForums,
  removeUserFromForum,
  saveForum,
  unbanUser,
  updateForumTypeSetting,
} from '../../services/forum.service';
import {
  DatabaseForum,
  PopulatedDatabaseForum,
  PopulatedDatabaseQuestion,
} from '../../types/types';
import {
  forum,
  FORUMS,
  POPULATED_FORUMS,
  POPULATED_QUESTIONS,
  POPULATED_QUESTIONS_VOTES,
  QUESTIONS,
} from '../mockData.models';
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

    it('addUserToForum should return an error if the forum is not found', async () => {
      mockingoose(ForumModel).toReturn(new Error('error'), 'findOneAndUpdate');
      ForumModel.schema.path('questions', Object);

      const result = (await addUserToForum(
        '67f5505718865f92b7bcd0a0',
        'user5',
      )) as PopulatedDatabaseForum;

      expect(result).toEqual({
        error:
          'Error occurred when adding user to forum: Error: Error occurred when finding forum: Error: Forum not found',
      });
    });

    it('addUserToForum should just return the forum if the user is already in it', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f5505718865f92b7bcd0a0',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOneAndUpdate');
      ForumModel.schema.path('questions', Object);

      const result = (await addUserToForum(
        '67f5505718865f92b7bcd0a0',
        'fby1',
      )) as PopulatedDatabaseForum;

      expect(result.members.length).toEqual(2);
      expect(result.members).toEqual(POPULATED_FORUMS[0].members);
    });

    it('addUserToForum should add the user to awaiting if private', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f550fb443cc714d61b7c66',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn(
        { ...forumExample, awaitingMembers: ['fby1'] },
        'findOneAndUpdate',
      );
      ForumModel.schema.path('questions', Object);

      const result = (await addUserToForum(
        '67f5505718865f92b7bcd0a0',
        'fby1',
      )) as PopulatedDatabaseForum;

      expect(result.awaitingMembers.length).toEqual(1);
      expect(result.awaitingMembers).toEqual(['fby1']);
    });

    it('handling invalid forum type', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f550fb443cc714d61b7c66',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample, type: 'invalid' }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn(
        { ...forumExample, awaitingMembers: ['fby1'] },
        'findOneAndUpdate',
      );
      ForumModel.schema.path('questions', Object);

      const result = (await addUserToForum(
        '67f5505718865f92b7bcd0a0',
        'fby1',
      )) as PopulatedDatabaseForum;

      expect(result).toEqual({
        error: 'Error occurred when adding user to forum: Error: Invalid forum type',
      });
    });

    it('handling null updated forum', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f550fb443cc714d61b7c66',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn(null, 'findOneAndUpdate');
      ForumModel.schema.path('questions', Object);

      const result = (await addUserToForum(
        '67f5505718865f92b7bcd0a0',
        'fby1',
      )) as PopulatedDatabaseForum;

      expect(result).toEqual({
        error: 'Error occurred when adding user to forum: Error: Error updating forum',
      });
    });
  });

  describe('cancelUserJoinRequest', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should cancel a user join request', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f550fb443cc714d61b7c66',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn(
        { ...forumExample, awaitingMembers: [] },
        'findOneAndUpdate',
      );
      ForumModel.schema.path('questions', Object);

      const result = (await cancelUserJoinRequest(
        '67f550fb443cc714d61b7c66',
        'user3',
      )) as PopulatedDatabaseForum;

      expect(result.awaitingMembers.length).toEqual(0);
      expect(result.awaitingMembers).toEqual([]);
    });

    it('should return an error if getting forum errors', async () => {
      mockingoose(ForumModel).toReturn(new Error('Forum not found'), 'findOne');
      ForumModel.schema.path('questions', Object);

      const result = (await cancelUserJoinRequest(
        '67f550fb443cc714d61b7c66',
        'user3',
      )) as PopulatedDatabaseForum;

      expect(result).toEqual({
        error:
          'Error occurred when adding user to forum: Error: Error occurred when finding forum: Error: Forum not found',
      });
    });

    it('nothing should happen if it is public or if awaiting members does not have the user', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f5505718865f92b7bcd0a0',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOneAndUpdate');
      ForumModel.schema.path('questions', Object);

      const result = (await cancelUserJoinRequest(
        '67f5505718865f92b7bcd0a0',
        'user3',
      )) as PopulatedDatabaseForum;

      expect(result.awaitingMembers.length).toEqual(0);
      expect(result.awaitingMembers).toEqual([]);
    });

    it('handling null updated forum', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f550fb443cc714d61b7c66',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn(null, 'findOneAndUpdate');
      ForumModel.schema.path('questions', Object);

      const result = (await cancelUserJoinRequest(
        '67f550fb443cc714d61b7c66',
        'user3',
      )) as PopulatedDatabaseForum;

      expect(result).toEqual({
        error: 'Error occurred when adding user to forum: Error: Error updating forum',
      });
    });
  });

  describe('banUser', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should ban a user from a forum', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f5505718865f92b7bcd0a0',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn(
        { ...forumExample, members: ['fby1'], bannedMembers: ['user1'] },
        'findOneAndUpdate',
      );
      ForumModel.schema.path('questions', Object);

      const result = (await banUser('67f550fb443cc714d61b7c66', 'user1')) as PopulatedDatabaseForum;

      expect(result.members.length).toEqual(1);
      expect(result.members).toEqual(['fby1']);
      expect(result.bannedMembers.length).toEqual(1);
      expect(result.bannedMembers).toEqual(['user1']);
    });

    it('should return an error if getting forum errors', async () => {
      mockingoose(ForumModel).toReturn(new Error('Forum not found'), 'findOne');
      ForumModel.schema.path('questions', Object);

      const result = (await banUser('67f550fb443cc714d61b7c66', 'user3')) as PopulatedDatabaseForum;

      expect(result).toEqual({
        error:
          'Error occurred when banning user from forum: Error: Error occurred when finding forum: Error: Forum not found',
      });
    });

    it('nothing should happen if they are already banned or awaiting', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f55100a3e3397af21a72e9',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOneAndUpdate');
      ForumModel.schema.path('questions', Object);

      const result = (await banUser('67f55100a3e3397af21a72e9', 'user4')) as PopulatedDatabaseForum;

      expect(result.members.length).toEqual(2);
      expect(result.members).toEqual(['fby3', 'user3']);
      expect(result.bannedMembers.length).toEqual(1);
      expect(result.bannedMembers).toEqual(['user4']);
    });

    it('nothing should happen if they arent a member', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f55100a3e3397af21a72e9',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOneAndUpdate');
      ForumModel.schema.path('questions', Object);

      const result = (await banUser('67f55100a3e3397af21a72e9', 'user8')) as PopulatedDatabaseForum;

      expect(result.members.length).toEqual(2);
      expect(result.members).toEqual(['fby3', 'user3']);
      expect(result.bannedMembers.length).toEqual(1);
      expect(result.bannedMembers).toEqual(['user4']);
    });

    it('handling null updated forum', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f55100a3e3397af21a72e9',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn(null, 'findOneAndUpdate');
      ForumModel.schema.path('questions', Object);

      const result = (await banUser('67f55100a3e3397af21a72e9', 'user3')) as PopulatedDatabaseForum;

      expect(result).toEqual({
        error: 'Error occurred when banning user from forum: Error: Error updating forum',
      });
    });
  });

  describe('unbanUser', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should unban a user from a forum', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f55100a3e3397af21a72e9',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn({ ...forumExample, bannedMembers: [] }, 'findOneAndUpdate');
      ForumModel.schema.path('questions', Object);

      const result = (await unbanUser(
        '67f55100a3e3397af21a72e9',
        'user4',
      )) as PopulatedDatabaseForum;

      expect(result.members.length).toEqual(2);
      expect(result.members).toEqual(['fby3', 'user3']);
      expect(result.bannedMembers.length).toEqual(0);
      expect(result.bannedMembers).toEqual([]);
    });

    it('should return an error if getting forum errors', async () => {
      mockingoose(ForumModel).toReturn(new Error('Forum not found'), 'findOne');
      ForumModel.schema.path('questions', Object);

      const result = (await unbanUser(
        '67f55100a3e3397af21a72e9',
        'user4',
      )) as PopulatedDatabaseForum;

      expect(result).toEqual({
        error:
          'Error occurred when unbanning user from forum: Error: Error occurred when finding forum: Error: Forum not found',
      });
    });

    it('nothing should happen if they arent banned', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f55100a3e3397af21a72e9',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOneAndUpdate');
      ForumModel.schema.path('questions', Object);

      const result = (await unbanUser(
        '67f55100a3e3397af21a72e9',
        'user3',
      )) as PopulatedDatabaseForum;

      expect(result.name).toEqual('Andriod users');
      expect(result.members.length).toEqual(2);
      expect(result.members).toEqual(forumExample.members);
      expect(result.bannedMembers.length).toEqual(1);
      expect(result.bannedMembers).toEqual(forumExample.bannedMembers);
    });

    it('handling null updated forum', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f55100a3e3397af21a72e9',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn(null, 'findOneAndUpdate');
      ForumModel.schema.path('questions', Object);

      const result = (await unbanUser(
        '67f55100a3e3397af21a72e9',
        'user4',
      )) as PopulatedDatabaseForum;

      expect(result).toEqual({
        error: 'Error occurred when unbanning user from forum: Error: Error updating forum',
      });
    });
  });

  describe('approveUser', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should approve a user awaiting in a private forum', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f550fb443cc714d61b7c66',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn(
        { ...forumExample, awaitingMembers: [], members: [...forumExample.members, 'user3'] },
        'findOneAndUpdate',
      );
      ForumModel.schema.path('questions', Object);

      const result = (await approveUser(
        '67f550fb443cc714d61b7c66',
        'user3',
      )) as PopulatedDatabaseForum;

      expect(result.members.length).toEqual(3);
      expect(result.members).toEqual([...forumExample.members, 'user3']);
      expect(result.awaitingMembers.length).toEqual(0);
      expect(result.awaitingMembers).toEqual([]);
    });

    it('should return an error if getting forum errors', async () => {
      mockingoose(ForumModel).toReturn(new Error('Forum not found'), 'findOne');
      ForumModel.schema.path('questions', Object);

      const result = (await approveUser(
        '67f550fb443cc714d61b7c66',
        'user3',
      )) as PopulatedDatabaseForum;

      expect(result).toEqual({
        error:
          'Error occurred when approving user to private forum: Error: Error occurred when finding forum: Error: Forum not found',
      });
    });

    it('handling null updated forum', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f550fb443cc714d61b7c66',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn(null, 'findOneAndUpdate');
      ForumModel.schema.path('questions', Object);

      const result = (await approveUser(
        '67f550fb443cc714d61b7c66',
        'user3',
      )) as PopulatedDatabaseForum;

      expect(result).toEqual({
        error: 'Error occurred when approving user to private forum: Error: Error updating forum',
      });
    });

    it('public forums should just return', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f5505718865f92b7bcd0a0',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOneAndUpdate');
      ForumModel.schema.path('questions', Object);

      const result = (await approveUser(
        '67f5505718865f92b7bcd0a0',
        'user3',
      )) as PopulatedDatabaseForum;

      expect(result.members.length).toEqual(2);
      expect(result.members).toEqual([...forumExample.members]);
      expect(result.awaitingMembers.length).toEqual(0);
      expect(result.awaitingMembers).toEqual([]);
    });
  });

  describe('updateForumTypeSetting', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('incorrect type should throw an error', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f5505718865f92b7bcd0a0',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      const result = (await updateForumTypeSetting(
        '67f5505718865f92b7bcd0a0',
        'invalidType',
      )) as PopulatedDatabaseForum;

      expect(result).toEqual({
        error: 'Error when updating forum type: Error: Invalid type',
      });
    });

    it('should return an error if getting forum errors', async () => {
      mockingoose(ForumModel).toReturn(new Error('Forum not found'), 'findOne');
      ForumModel.schema.path('questions', Object);

      const result = (await updateForumTypeSetting(
        '67f550fb443cc714d61b7c66',
        'private',
      )) as PopulatedDatabaseForum;

      expect(result).toEqual({
        error:
          'Error when updating forum type: Error: Error occurred when finding forum: Error: Forum not found',
      });
    });

    it('nothing happens if its the same type', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f5505718865f92b7bcd0a0',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOneAndUpdate');
      ForumModel.schema.path('questions', Object);

      const result = (await updateForumTypeSetting(
        '67f5505718865f92b7bcd0a0',
        'public',
      )) as PopulatedDatabaseForum;

      expect(result.type).toEqual(forumExample.type);
    });

    it('public to private', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f5505718865f92b7bcd0a0',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn({ ...forumExample, type: 'private' }, 'findOneAndUpdate');
      ForumModel.schema.path('questions', Object);

      const result = (await updateForumTypeSetting(
        '67f5505718865f92b7bcd0a0',
        'private',
      )) as PopulatedDatabaseForum;

      expect(result.type).toEqual('private');
    });

    it('private to public', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f550fb443cc714d61b7c66',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn(
        {
          ...forumExample,
          members: [...forumExample.members, ...forumExample.awaitingMembers],
          awaitingMembers: [],
          type: 'public',
        },
        'findOneAndUpdate',
      );
      ForumModel.schema.path('questions', Object);

      const result = (await updateForumTypeSetting(
        '67f550fb443cc714d61b7c66',
        'public',
      )) as PopulatedDatabaseForum;

      expect(result.type).toEqual('public');
      expect(result.members).toEqual([...forumExample.members, ...forumExample.awaitingMembers]);
      expect(result.awaitingMembers).toEqual([]);
    });

    it('handling null updated forum', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f550fb443cc714d61b7c66',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn(null, 'findOneAndUpdate');
      ForumModel.schema.path('questions', Object);

      const result = (await updateForumTypeSetting(
        '67f550fb443cc714d61b7c66',
        'public',
      )) as PopulatedDatabaseForum;

      expect(result).toEqual({
        error: 'Error when updating forum type: Error: Error updating forum',
      });
    });
  });

  describe('addQuestionToForum', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('invalid questions should err', async () => {
      const invalidQuestion = { ...QUESTIONS[0], title: '' };
      const result = (await addQuestionToForum(
        '67f550fb443cc714d61b7c66',
        invalidQuestion,
      )) as PopulatedDatabaseForum;

      expect(result).toEqual({
        error: 'Error when adding question to forum: Error: Invalid question',
      });
    });

    it('should add question if its a reasonable qeustion', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f550fb443cc714d61b7c66',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn(
        {
          ...forumExample,
          questions: [...forumExample.questions, POPULATED_QUESTIONS[0]],
          type: 'public',
        },
        'findOneAndUpdate',
      );
      ForumModel.schema.path('questions', Object);

      const result = (await addQuestionToForum(
        '67f550fb443cc714d61b7c66',
        QUESTIONS[0],
      )) as PopulatedDatabaseForum;

      expect(result.questions.length).toEqual(2);
      expect(result.questions).toEqual([...forumExample.questions, POPULATED_QUESTIONS[0]]);
    });

    it('handling null updated forum', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f550fb443cc714d61b7c66',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn(null, 'findOneAndUpdate');
      ForumModel.schema.path('questions', Object);

      const result = (await addQuestionToForum(
        '67f550fb443cc714d61b7c66',
        QUESTIONS[0],
      )) as PopulatedDatabaseForum;

      expect(result).toEqual({
        error: 'Error when adding question to forum: Error: Error when adding question to forum',
      });
    });
  });

  describe('removeUserFromForum', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return an error if getting forum errors', async () => {
      mockingoose(ForumModel).toReturn(new Error('Forum not found'), 'findOne');
      ForumModel.schema.path('questions', Object);

      const result = (await removeUserFromForum(
        '67f550fb443cc714d61b7c66',
        'user2',
      )) as PopulatedDatabaseForum;

      expect(result).toEqual({
        error:
          'Error occurred when removing user from forum: Error: Error occurred when finding forum: Error: Forum not found',
      });
    });

    it('should return the existing forum if user is not in the members', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f550fb443cc714d61b7c66',
      )[0];

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
      ForumModel.schema.path('questions', Object);

      mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOneAndUpdate');
      ForumModel.schema.path('questions', Object);

      const result = (await removeUserFromForum(
        '67f550fb443cc714d61b7c66',
        'thisUserIsNotInTheForum',
      )) as PopulatedDatabaseForum;

      expect(result.members).toEqual(forumExample.members);
    });
  });

  it('should remove a user from forum if everything else is ok', async () => {
    const forumExample = POPULATED_FORUMS.filter(
      f => f._id && f._id.toString() === '67f550fb443cc714d61b7c66',
    )[0];

    mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
    ForumModel.schema.path('questions', Object);

    mockingoose(ForumModel).toReturn({ ...forumExample, members: ['fby2'] }, 'findOneAndUpdate');
    ForumModel.schema.path('questions', Object);

    const result = (await removeUserFromForum(
      '67f550fb443cc714d61b7c66',
      'user2',
    )) as PopulatedDatabaseForum;

    expect(result.members.length).toEqual(1);
    expect(result.members).toEqual(['fby2']);
  });

  it('handling null updated forum', async () => {
    const forumExample = POPULATED_FORUMS.filter(
      f => f._id && f._id.toString() === '67f550fb443cc714d61b7c66',
    )[0];

    mockingoose(ForumModel).toReturn({ ...forumExample }, 'findOne');
    ForumModel.schema.path('questions', Object);

    mockingoose(ForumModel).toReturn(null, 'findOneAndUpdate');
    ForumModel.schema.path('questions', Object);

    const result = (await removeUserFromForum(
      '67f550fb443cc714d61b7c66',
      'user2',
    )) as PopulatedDatabaseForum;

    expect(result).toEqual({
      error: 'Error occurred when removing user from forum: Error: Error updating forum',
    });
  });

  describe('getForumQuestionsByOrder', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return an empty list if there is an error getting forum', async () => {
      mockingoose(ForumModel).toReturn(new Error('Forum not found'), 'findOne');
      ForumModel.schema.path('questions', Object);

      const result = (await getForumQuestionsByOrder(
        'active',
        '67f550fb443cc714d61b7c66',
      )) as PopulatedDatabaseQuestion[];

      expect(result).toEqual([]);
    });

    it('should return in active order', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f55100a3e3397af21a72e9',
      )[0];
      mockingoose(ForumModel).toReturn(forumExample, 'findOne');
      ForumModel.schema.path('questions', Object);

      const result = (await getForumQuestionsByOrder(
        'active',
        '67f55100a3e3397af21a72e9',
      )) as PopulatedDatabaseQuestion[];

      expect(result).toEqual([POPULATED_QUESTIONS[3], POPULATED_QUESTIONS[2]]);
    });

    it('should return in unanswered order', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f55100a3e3397af21a72e9',
      )[0];
      mockingoose(ForumModel).toReturn(forumExample, 'findOne');
      ForumModel.schema.path('questions', Object);

      const result = (await getForumQuestionsByOrder(
        'unanswered',
        '67f55100a3e3397af21a72e9',
      )) as PopulatedDatabaseQuestion[];

      expect(result).toEqual([POPULATED_QUESTIONS[3], POPULATED_QUESTIONS[2]]);
    });

    it('should return in newest order', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f55100a3e3397af21a72e9',
      )[0];
      mockingoose(ForumModel).toReturn(forumExample, 'findOne');
      ForumModel.schema.path('questions', Object);

      const result = (await getForumQuestionsByOrder(
        'newest',
        '67f55100a3e3397af21a72e9',
      )) as PopulatedDatabaseQuestion[];

      expect(result).toEqual([POPULATED_QUESTIONS[3], POPULATED_QUESTIONS[2]]);
    });

    it('should return in most viewed order', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f55100a3e3397af21a72e9',
      )[0];
      mockingoose(ForumModel).toReturn(forumExample, 'findOne');
      ForumModel.schema.path('questions', Object);

      const result = (await getForumQuestionsByOrder(
        'mostViewed',
        '67f55100a3e3397af21a72e9',
      )) as PopulatedDatabaseQuestion[];

      expect(result).toEqual([POPULATED_QUESTIONS[2], POPULATED_QUESTIONS[3]]);
    });

    it('null forum should return empty list', async () => {
      mockingoose(ForumModel).toReturn(null, 'findOne');
      ForumModel.schema.path('questions', Object);

      const result = (await getForumQuestionsByOrder(
        'active',
        '67f550fb443cc714d61b7c66',
      )) as PopulatedDatabaseQuestion[];

      expect(result).toEqual([]);
    });
  });

  describe('getTopFivePosts', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return empty list if forum is null', async () => {
      mockingoose(ForumModel).toReturn(null, 'findOne');
      ForumModel.schema.path('questions', Object);

      const result = (await getTopFivePosts(
        'A forum for macbook enjoyers',
      )) as PopulatedDatabaseQuestion[];

      expect(result).toEqual([]);
    });

    it('should return top 5 posts', async () => {
      const forumExample = POPULATED_FORUMS.filter(
        f => f._id && f._id.toString() === '67f68effb1251856a192f471',
      )[0];
      mockingoose(ForumModel).toReturn(forumExample, 'findOne');
      ForumModel.schema.path('questions', Object);

      const result = (await getTopFivePosts('Andriod users 2')) as PopulatedDatabaseQuestion[];

      expect(result).toEqual([
        POPULATED_QUESTIONS_VOTES[3],
        POPULATED_QUESTIONS_VOTES[0],
        POPULATED_QUESTIONS_VOTES[1],
        POPULATED_QUESTIONS_VOTES[2],
      ]);
    });
  });
});
