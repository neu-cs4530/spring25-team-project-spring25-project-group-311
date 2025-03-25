// import { ObjectId } from 'mongodb';
import ForumModel from '../models/forum.model';
import { Forum, DatabaseForum, ForumResponse, ForumsResponse } from '../types/types';
import { updateUser } from './user.service';

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
 * @returns {Promise<ForumResponse>} - Resolves with the found forum or an error message.
 */
export const getForumById = async (forumId: string): Promise<ForumResponse> => {
  try {
    const forum: DatabaseForum | null = await ForumModel.findOne({ _id: forumId });

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
export const getForumsList = async (): Promise<ForumsResponse> => {
  try {
    const forums: DatabaseForum[] = await ForumModel.find();
    return forums;
  } catch (error) {
    return { error: `Error occurred when retrieving forums: ${error}` };
  }
};

export const addUserToForum = async (fid: string, username: string): Promise<ForumResponse> => {
  try {
    const forum = await getForumById(fid);

    if ('error' in forum) {
      throw new Error(forum.error);
    }

    if (forum.members.includes(username)) {
      return forum;
    }

    let updatedForum: DatabaseForum | null;
    if (forum.type === 'public') {
      updatedForum = await ForumModel.findOneAndUpdate(
        { _id: fid },
        { $addToSet: { members: username } },
        { new: true },
      );
    } else if (forum.type === 'private') {
      updatedForum = await ForumModel.findOneAndUpdate(
        { _id: fid },
        { $addToSet: { awaitingMembers: username } },
        { new: true },
      );
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

export const removeUserFromForum = async (
  fid: string,
  username: string,
): Promise<ForumResponse> => {
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
    );

    if (!updatedForum) {
      throw Error('Error updating forum');
    }

    return updatedForum;
  } catch (error) {
    return { error: `Error occurred when removing user from forum: ${error}` };
  }
};
