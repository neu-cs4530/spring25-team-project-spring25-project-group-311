// import { ObjectId } from 'mongodb';
import AnswerModel from '../models/answers.model';
import CommentModel from '../models/comments.model';
import ForumModel from '../models/forum.model';
import QuestionModel from '../models/questions.model';
import TagModel from '../models/tags.model';
import {
  Forum,
  DatabaseForum,
  ForumResponse,
  // ForumsResponse,
  PopulatedDatabaseForum,
  PopulatedDatabaseQuestion,
  PopulatedForumResponse,
} from '../types/types';

/**
 * Saves a new forum to the database.
 *
 * @param {Forum} forum - The forum object to be saved.
 * @returns {Promise<ForumResponse>} - The saved forum or an error message.
 */
export const saveForum = async (forum: Forum): Promise<ForumResponse> => {
  try {
    const result: DatabaseForum = await ForumModel.create(forum);

    if (!result) {
      throw Error('Failed to create forum');
    }

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
    const forum: PopulatedDatabaseForum | null = await ForumModel.findOne({ _id: forumId });

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
    }>([{ path: 'questions', model: QuestionModel }]);
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

    if (forum.members.includes(username)) {
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
