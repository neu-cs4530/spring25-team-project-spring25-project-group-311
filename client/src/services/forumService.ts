import axios from 'axios';
import { DatabaseForum, Forum } from '../types/types';
import api from './config';

const FORUM_API_URL = `${process.env.REACT_APP_SERVER_URL}/forum`;

const getForums = async (): Promise<DatabaseForum[]> => {
  const res = await api.get(`${FORUM_API_URL}/getForums`);
  if (res.status !== 200) {
    throw new Error('Error when fetching forums');
  }
  return res.data;
};

/**
 * Function to get a forum by its name
 *
 * @param forum - The unique identifier of the forum
 * @returns {Promise<Forum>} The forum object
 * @throws Error if there is an issue fetching the forum.
 */
const getForumByName = async (forum: string): Promise<DatabaseForum> => {
  const res = await api.get(`${FORUM_API_URL}/getForum/${forum}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching forum');
  }
  return res.data;
};

/**
 * Sends a POST request to create a new forum.
 *
 * @param forum - The forum data to create
 * @returns {Promise<Forum>} The newly created forum object
 * @throws {Error} If an error occurs during the creation process
 */
const createForum = async (forum: Forum): Promise<DatabaseForum> => {
  try {
    const res = await api.post(`${FORUM_API_URL}/create`, forum);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Error while creating forum: ${error.response.data}`);
    } else {
      throw new Error('Error while creating forum');
    }
  }
};

/**
 * Updates a forum by its name
 *
 * @param forum - The unique name of the forum
 * @param updates - The fields to update
 * @returns {Promise<Forum>} The updated forum object
 * @throws {Error} If an error occurs during the update process
 */
const updateForum = async (forumId: string, updates: Partial<Forum>): Promise<Forum> => {
  try {
    const res = await api.patch(`${FORUM_API_URL}/update/${forumId}`, updates);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Error while updating forum: ${error.response.data}`);
    } else {
      throw new Error('Error while updating forum');
    }
  }
};

/**
 * Deletes a forum by its name
 *
 * @param forum - The unique identifier of the forum
 * @returns {Promise<Forum>} The deleted forum object
 * @throws {Error} If an error occurs during the deletion process
 */
const deleteForum = async (forum: string): Promise<Forum> => {
  const res = await api.delete(`${FORUM_API_URL}/delete/${forum}`);
  if (res.status !== 200) {
    throw new Error('Error when deleting forum');
  }
  return res.data;
};

export { getForums, getForumByName, createForum, updateForum, deleteForum };
