import AnswerModel from '../models/answers.model';
import CommentModel from '../models/comments.model';
import ForumModel from '../models/forum.model';
import QuestionModel from '../models/questions.model';
import TagModel from '../models/tags.model';
import {
  Forum,
  DatabaseForum,
  ForumResponse,
  PopulatedDatabaseForum,
  PopulatedDatabaseQuestion,
  PopulatedForumResponse,
  DatabaseQuestion,
  OrderType,
} from '../types/types';
import {
  sortQuestionsByActive,
  sortQuestionsByMostViews,
  sortQuestionsByNewest,
  sortQuestionsByUnanswered,
} from '../utils/sort.util';

/**
 * Saves a new forum to the database.
 *
 * @param {Forum} forum - The forum object to be saved.
 * @returns {Promise<ForumResponse>} - The saved forum or an error message.
 */
export const saveForum = async (forum: Forum): Promise<ForumResponse> => {
  try {
    const result: DatabaseForum = await ForumModel.create(forum);
    return result;
  } catch (error) {
    return { error: `Error occurred when saving forum: ${error}` };
  }
};

/**
 * Retrieves a forum from the database by its name.
 *
 * @param {string} forumId - The name of the forum to find.
 * @returns {Promise<PopulatedForumResponse>} - Resolves with the found forum or an error message.
 */
export const getForumById = async (forumId: string): Promise<PopulatedForumResponse> => {
  try {
    const forum: PopulatedDatabaseForum | null = await ForumModel.findOne({
      _id: forumId,
    }).populate<{
      questions: PopulatedDatabaseQuestion[];
    }>([{ path: 'questions', model: QuestionModel }]);

    if (!forum) {
      throw Error('Forum not found');
    }

    return forum;
  } catch (error) {
    return { error: `Error occurred when finding forum: ${error}` };
  }
};

/**
 * Retrieves all forums from the database.
 *
 * @returns {Promise<ForumsResponse>} Array of forums or an error message.
 */
export const getForumsList = async (): Promise<PopulatedDatabaseForum[]> => {
  try {
    const forums: PopulatedDatabaseForum[] = await ForumModel.find().populate<{
      questions: PopulatedDatabaseQuestion[];
    }>([
      {
        path: 'questions',
        model: QuestionModel,
        populate: [
          { path: 'tags', model: TagModel },
          {
            path: 'answers',
            model: AnswerModel,
            populate: { path: 'comments', model: CommentModel },
          },
          { path: 'comments', model: CommentModel },
        ],
      },
    ]);
    return forums;
  } catch (error) {
    return [];
  }
};

/**
 * Retrieves all forums associated with a user.
 * @param username The unique username of the user.
 * @returns {Promise<ForumsResponse>} Array of forums.
 */
export const getUserForums = async (username: string): Promise<DatabaseForum[]> => {
  try {
    const forums: DatabaseForum[] = await ForumModel.find({ members: { $in: [username] } });
    return forums;
  } catch (error) {
    return [];
  }
};

/**
 * Adds a user to a forum.
 *
 * @param {string} fid - The id of the forum to update
 * @param {string} username - The username of the user to add to the forum.
 * @returns {Promise<PopulatedForumResponse>} - Resolves with the found forum or an error message.
 */
export const addUserToForum = async (
  fid: string,
  username: string,
): Promise<PopulatedForumResponse> => {
  try {
    const forum = await getForumById(fid);

    if ('error' in forum) {
      throw new Error(forum.error);
    }

    if (
      forum.members.includes(username) ||
      forum.awaitingMembers.includes(username) ||
      forum.bannedMembers.includes(username)
    ) {
      return forum;
    }

    let updatedForum: PopulatedDatabaseForum | null;
    if (forum.type === 'public') {
      updatedForum = await ForumModel.findOneAndUpdate(
        { _id: fid },
        { $addToSet: { members: username } },
        { new: true },
      ).populate<{
        questions: PopulatedDatabaseQuestion[];
      }>([{ path: 'questions', model: QuestionModel }]);
    } else if (forum.type === 'private') {
      updatedForum = await ForumModel.findOneAndUpdate(
        { _id: fid },
        { $addToSet: { awaitingMembers: username } },
        { new: true },
      ).populate<{
        questions: PopulatedDatabaseQuestion[];
      }>([{ path: 'questions', model: QuestionModel }]);
    } else {
      throw Error('Invalid forum type');
    }

    if (!updatedForum) {
      throw Error('Error updating forum');
    }

    return updatedForum;
  } catch (error) {
    return { error: `Error occurred when adding user to forum: ${error}` };
  }
};

/**
 * Cancels a user's request to join a private forum
 *
 * @param {string} fid - The id of the forum to update
 * @param {string} username - The username of the user to remove from awaiting members.
 * @returns {Promise<PopulatedForumResponse>} - Resolves with the found forum or an error message.
 */
export const cancelUserJoinRequest = async (
  fid: string,
  username: string,
): Promise<PopulatedForumResponse> => {
  try {
    const forum = await getForumById(fid);

    if ('error' in forum) {
      throw new Error(forum.error);
    }

    // nothing to be done
    if (!forum.awaitingMembers.includes(username) || forum.type === 'public') {
      return forum;
    }

    const updatedForum: PopulatedDatabaseForum | null = await ForumModel.findOneAndUpdate(
      { _id: fid },
      { $pull: { awaitingMembers: username } },
      { new: true },
    ).populate<{
      questions: PopulatedDatabaseQuestion[];
    }>([{ path: 'questions', model: QuestionModel }]);

    if (!updatedForum) {
      throw Error('Error updating forum');
    }

    return updatedForum;
  } catch (error) {
    return { error: `Error occurred when adding user to forum: ${error}` };
  }
};

/**
 * Bans a user if they are a member.
 *
 * @param {string} fid - The id of the forum to update
 * @param {string} username - The username of the user to ban
 * @returns {Promise<PopulatedForumResponse>} - Resolves with the found forum or an error message.
 */
export const banUser = async (fid: string, username: string): Promise<PopulatedForumResponse> => {
  try {
    const forum = await getForumById(fid);

    if ('error' in forum) {
      throw new Error(forum.error);
    }

    // no action should be taken
    if (forum.bannedMembers.includes(username) || forum.awaitingMembers.includes(username)) {
      return forum;
    }

    let updatedForum: PopulatedDatabaseForum | null;
    if (forum.members.includes(username)) {
      updatedForum = await ForumModel.findOneAndUpdate(
        { _id: fid },
        { $addToSet: { bannedMembers: username }, $pull: { members: username } },
        { new: true },
      ).populate<{
        questions: PopulatedDatabaseQuestion[];
      }>([{ path: 'questions', model: QuestionModel }]);
    } else {
      return forum;
    }

    if (!updatedForum) {
      throw Error('Error updating forum');
    }

    return updatedForum;
  } catch (error) {
    return { error: `Error occurred when banning user from forum: ${error}` };
  }
};

/**
 * Unbans a user if they are banned.
 *
 * @param {string} fid - The id of the forum to update
 * @param {string} username - The username of the user to unban
 * @returns {Promise<PopulatedForumResponse>} - Resolves with the found forum or an error message.
 */
export const unbanUser = async (fid: string, username: string): Promise<PopulatedForumResponse> => {
  try {
    const forum = await getForumById(fid);

    if ('error' in forum) {
      throw new Error(forum.error);
    }

    // no action should be taken
    if (!forum.bannedMembers.includes(username)) {
      return forum;
    }

    const updatedForum: PopulatedDatabaseForum | null = await ForumModel.findOneAndUpdate(
      { _id: fid },
      { $pull: { bannedMembers: username } },
      { new: true },
    ).populate<{
      questions: PopulatedDatabaseQuestion[];
    }>([{ path: 'questions', model: QuestionModel }]);

    if (!updatedForum) {
      throw Error('Error updating forum');
    }

    return updatedForum;
  } catch (error) {
    return { error: `Error occurred when banning user from forum: ${error}` };
  }
};

/**
 *
 *
 * @param {string} fid - The id of the forum to update
 * @param {string} username - tThe username of the user to approve
 * @returns {Promise<PopulatedForumResponse>} - Resolves with the found forum or an error message.
 */
export const approveUser = async (
  fid: string,
  username: string,
): Promise<PopulatedForumResponse> => {
  try {
    const forum = await getForumById(fid);

    if ('error' in forum) {
      throw new Error(forum.error);
    }

    let updatedForum: PopulatedDatabaseForum | null;
    if (forum.type === 'private' && forum.awaitingMembers.includes(username)) {
      updatedForum = await ForumModel.findOneAndUpdate(
        { _id: fid },
        { $addToSet: { members: username }, $pull: { awaitingMembers: username } },
        { new: true },
      ).populate<{
        questions: PopulatedDatabaseQuestion[];
      }>([{ path: 'questions', model: QuestionModel }]);
    } else {
      return forum;
    }

    if (!updatedForum) {
      throw Error('Error');
    }

    return updatedForum;
  } catch (error) {
    return { error: `Error occurred when approving user to private forum: ${error}` };
  }
};

/**
 * Updates a forum to the new type, if private forum becomes public
 * all members are approved automatically.
 *
 * @param {string} fid - The ID of the forum to update type
 * @param type - New type of the forum
 */
export const updateForumTypeSetting = async (
  fid: string,
  type: string,
): Promise<PopulatedForumResponse> => {
  try {
    if (!(type === 'private' || type === 'public')) {
      throw new Error('Invalid type');
    }

    const forum = await getForumById(fid);
    if ('error' in forum) {
      throw new Error(forum.error);
    }

    // nothing to be done
    if (forum.type === type) {
      return forum;
    }

    let updatedForum: PopulatedDatabaseForum | null;
    if (type === 'private') {
      updatedForum = await ForumModel.findOneAndUpdate(
        { _id: fid },
        { type: 'private' },
        { new: true },
      ).populate<{
        questions: PopulatedDatabaseQuestion[];
      }>([{ path: 'questions', model: QuestionModel }]);
    } else if (type === 'public') {
      updatedForum = await ForumModel.findOneAndUpdate(
        { _id: fid },
        [
          {
            $set: {
              type: 'public',
              members: { $concatArrays: ['$members', '$awaitingMembers'] },
              awaitingMembers: [],
            },
          },
        ],
        { new: true },
      ).populate<{
        questions: PopulatedDatabaseQuestion[];
      }>([{ path: 'questions', model: QuestionModel }]);
    } else {
      throw Error('Invalid type');
    }

    if (!updatedForum) {
      throw Error('Error updating forum');
    }

    return updatedForum;
  } catch (error) {
    return { error: 'Error when updating forum type' };
  }
};

/**
 * Creates and adds a question to a specified forum.
 *
 * @param {string} fid - The ID of the forum to which the question will be added
 * @param {DatabaseQuestion} question - The question object to be added to the forum
 * @returns A promise that resolves to a populated forum response or an error object
 */
export const addQuestionToForum = async (
  fid: string,
  question: DatabaseQuestion,
): Promise<PopulatedForumResponse> => {
  try {
    if (
      !(
        question.title !== undefined &&
        question.title !== '' &&
        question.text !== undefined &&
        question.text !== '' &&
        question.tags !== undefined &&
        question.tags.length > 0 &&
        question.askedBy !== undefined &&
        question.askedBy !== '' &&
        question.askDateTime !== undefined &&
        question.askDateTime !== null
      )
    ) {
      throw new Error('Invalid question');
    }

    const result: PopulatedDatabaseForum | null = await ForumModel.findOneAndUpdate(
      { _id: fid },
      { $push: { questions: { $each: [question._id], $position: 0 } } },
      { new: true },
    ).populate<{
      questions: PopulatedDatabaseQuestion[];
    }>([{ path: 'questions', model: QuestionModel }]);

    if (result === null) {
      throw new Error('Error when adding question to forum');
    }
    return result;
  } catch (error) {
    return { error: 'Error when adding question to forum' };
  }
};

/**
 * Removes a user from a forum.
 *
 * @param {string} fid - The id of the forum to update
 * @param {string} username - The username of the user to remove from  the forum.
 * @returns {Promise<PopulatedForumResponse>} - Resolves with the found forum or an error message.
 */
export const removeUserFromForum = async (
  fid: string,
  username: string,
): Promise<PopulatedForumResponse> => {
  try {
    const forum = await getForumById(fid);
    if ('error' in forum) {
      throw new Error(forum.error);
    }

    if (!forum.members.includes(username)) {
      return forum;
    }

    const updatedForum = await ForumModel.findOneAndUpdate(
      { _id: fid },
      { $pull: { members: username } },
      { new: true },
    ).populate<{
      questions: PopulatedDatabaseQuestion[];
    }>([{ path: 'questions', model: QuestionModel }]);

    if (!updatedForum) {
      throw Error('Error updating forum');
    }

    return updatedForum;
  } catch (error) {
    return { error: `Error occurred when removing user from forum: ${error}` };
  }
};

/**
 * Retrieves questions of a forum ordered by specified criteria.
 * @param {OrderType} order - The order type to filter the questions
 * @param {string} fid - The forum from which to return the questions
 * @returns {Promise<Question[]>} - The ordered list of questions
 */
export const getForumQuestionsByOrder = async (
  order: OrderType,
  fid: string,
): Promise<PopulatedDatabaseQuestion[]> => {
  try {
    const forum = await ForumModel.findOne({ _id: fid }).populate<{
      questions: PopulatedDatabaseQuestion[];
    }>([{ path: 'questions', model: QuestionModel, populate: { path: 'tags', model: TagModel } }]);

    if (!forum) {
      return [];
    }

    const qlist = forum.questions;

    switch (order) {
      case 'active':
        return sortQuestionsByActive(qlist);
      case 'unanswered':
        return sortQuestionsByUnanswered(qlist);
      case 'newest':
        return sortQuestionsByNewest(qlist);
      case 'mostViewed':
      default:
        return sortQuestionsByMostViews(qlist);
    }
  } catch (error) {
    return [];
  }
};

/**
 * Generates the top 5 posts for a given forum
 * @param forumName the name of the forum we want to get the top 5 posts from.
 * @returns {Promise<PopulatedDatabaseQuestion[]>} - Resolves with a list of populated database questions
 */
export const getTopFivePosts = async (forumName: string): Promise<PopulatedDatabaseQuestion[]> => {
  try {
    const forum = await ForumModel.findOne({ name: forumName }).populate<{
      questions: PopulatedDatabaseQuestion[];
    }>([
      {
        path: 'questions',
        model: QuestionModel,
        populate: { path: 'answers', model: AnswerModel },
      },
      {
        path: 'questions',
        model: QuestionModel,
        populate: { path: 'comments', model: CommentModel },
      },
      {
        path: 'questions',
        model: QuestionModel,
        populate: { path: 'tags', model: TagModel },
      },
    ]);

    if (!forum) {
      throw Error('Forum not found');
    }

    const forumPosts = forum.questions.sort((a, b) => {
      if (a.upVotes > b.upVotes) {
        return 1;
      }
      if (a.upVotes < b.upVotes) {
        return -1;
      }
      return 0;
    });
    return forumPosts.slice(0, 5);
  } catch (error) {
    return [];
  }
};
