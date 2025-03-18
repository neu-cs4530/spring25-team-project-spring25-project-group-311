// import { ObjectId } from 'mongodb';
import ForumModel from '../models/forum.model';
import { Forum, DatabaseForum, ForumResponse } from '../types/types';

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
 * @param {string} forumName - The name of the forum to find.
 * @returns {Promise<ForumResponse>} - Resolves with the found forum or an error message.
 */
export const getForumByName = async (forumName: string): Promise<ForumResponse> => {
  try {
    const forum: DatabaseForum | null = await ForumModel.findOne({ name: forumName });

    if (!forum) {
      throw Error('User not found');
    }

    return forum;
  } catch (error) {
    return { error: `Error occurred when finding forum: ${error}` };
  }
};
