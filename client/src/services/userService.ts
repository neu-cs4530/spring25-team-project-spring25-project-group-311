import axios from 'axios';
import { UserCredentials, SafeDatabaseUser } from '../types/types';
import api from './config';

const USER_API_URL = `${process.env.REACT_APP_SERVER_URL}/user`;

/**
 * Function to get users
 *
 * @throws Error if there is an issue fetching users.
 */
const getUsers = async (): Promise<SafeDatabaseUser[]> => {
  const res = await api.get(`${USER_API_URL}/getUsers`);
  if (res.status !== 200) {
    throw new Error('Error when fetching users');
  }
  return res.data;
};

/**
 * Function to get users
 *
 * @throws Error if there is an issue fetching users.
 */
const getUserByUsername = async (username: string): Promise<SafeDatabaseUser> => {
  const res = await api.get(`${USER_API_URL}/getUser/${username}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching user');
  }
  return res.data;
};

/**
 * Sends a POST request to create a new user account.
 *
 * @param user - The user credentials (username and password) for signup.
 * @returns {Promise<User>} The newly created user object.
 * @throws {Error} If an error occurs during the signup process.
 */
const createUser = async (user: UserCredentials): Promise<SafeDatabaseUser> => {
  try {
    const res = await api.post(`${USER_API_URL}/signup`, user);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Error while signing up: ${error.response.data}`);
    } else {
      throw new Error('Error while signing up');
    }
  }
};

/**
 * Sends a POST request to authenticate a user.
 *
 * @param user - The user credentials (username and password) for login.
 * @returns {Promise<User>} The authenticated user object.
 * @throws {Error} If an error occurs during the login process.
 */
const loginUser = async (user: UserCredentials): Promise<SafeDatabaseUser> => {
  try {
    const res = await api.post(`${USER_API_URL}/login`, user);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Error while logging in: ${error.response.data}`);
    } else {
      throw new Error('Error while logging in');
    }
  }
};

/**
 * Deletes a user by their username.
 * @param username - The unique username of the user
 * @returns A promise that resolves to the deleted user data
 * @throws {Error} If the request to the server is unsuccessful
 */
const deleteUser = async (username: string): Promise<SafeDatabaseUser> => {
  const res = await api.delete(`${USER_API_URL}/deleteUser/${username}`);
  if (res.status !== 200) {
    throw new Error('Error when deleting user');
  }
  return res.data;
};

/**
 * Resets the password for a user.
 * @param username - The unique username of the user
 * @param newPassword - The new password to be set for the user
 * @returns A promise that resolves to the updated user data
 * @throws {Error} If the request to the server is unsuccessful
 */
const resetPassword = async (username: string, newPassword: string): Promise<SafeDatabaseUser> => {
  const res = await api.patch(`${USER_API_URL}/resetPassword`, {
    username,
    password: newPassword,
  });
  if (res.status !== 200) {
    throw new Error('Error when resetting password');
  }
  return res.data;
};

const newActiveBanner = async (username: string, banner: string): Promise<SafeDatabaseUser> => {
  const res = await api.post(`${USER_API_URL}/addSelectedBanner`, {
    username,
    banner,
  });
  if (res.status !== 200) {
    throw new Error('Error when setting new active banner');
  }
  return res.data;
};

/**
 * Updates the user's biography.
 * @param username The unique username of the user
 * @param newBiography The new biography to set for this user
 * @returns A promise resolving to the updated user
 * @throws Error if the request fails
 */
const updateBiography = async (
  username: string,
  newBiography: string,
): Promise<SafeDatabaseUser> => {
  const res = await api.patch(`${USER_API_URL}/updateBiography`, {
    username,
    biography: newBiography,
  });
  if (res.status !== 200) {
    throw new Error('Error when updating biography');
  }
  return res.data;
};

/**
 * Adds an email for the user
 * @param username The unique username of the user
 * @param newEmail The new email to add for this user
 * @returns A promise resolving to the updated user
 * @throws Error if the request fails
 */
const addEmail = async (username: string, newEmail: string): Promise<SafeDatabaseUser> => {
  const res = await api.post(`${USER_API_URL}/addEmail`, {
    username,
    newEmail,
  });
  if (res.status !== 200) {
    throw new Error('Error when adding email');
  }
  return res.data;
};

/**
 * Replaces an email for the user
 * @param username The unique username of the user
 * @param currEmail The current email of this user to replace
 * @param newEmail The new email to replace for this user
 * @returns A promise resolving to the updated user
 * @throws Error if the request fails
 */
const replaceEmail = async (
  username: string,
  currEmail: string,
  newEmail: string,
): Promise<SafeDatabaseUser> => {
  const res = await api.patch(`${USER_API_URL}/${currEmail}/replaceEmail`, {
    username,
    newEmail,
  });
  if (res.status !== 200) {
    throw new Error('Error when replacing email');
  }
  return res.data;
};

/**
 * Subscribes/unsubscribes a user from notifications.
 * @param username The unique username of the user.
 * @param notifType The type of notification a user wants (should be browser or email)
 * @returns A promsie resolving to the updated user
 * @throws Error if the request fails or if an invalid notification type is given
 */
const subscribeNotifs = async (username: string, notifType: string): Promise<SafeDatabaseUser> => {
  if (notifType !== 'browser' && notifType !== 'email') {
    throw new Error('Not a valid notification type');
  }
  const res = await api.patch(`${USER_API_URL}/changeSubscription`, {
    username,
    notifType,
  });
  if (res.status !== 200) {
    throw new Error('Error when changing subscriptions to notifications');
  }
  return res.data;
};

const awardBadges = async (username: string, badges: string[]): Promise<SafeDatabaseUser> => {
  const res = await api.post(`${USER_API_URL}/addBadges`, {
    username,
    badges,
  });
  if (res.status !== 200) {
    throw new Error('Error when awarding badge');
  }
  return res.data;
};

const awardBanners = async (username: string, banners: string[]): Promise<SafeDatabaseUser> => {
  const res = await api.post(`${USER_API_URL}/addBanners`, {
    username,
    banners,
  });
  if (res.status !== 200) {
    throw new Error(`Error when awarding banner ${banners}`);
  }
  return res.data;
};
/**
 * Changes the frequency of the email notification
 * @param username The unique username of the user.
 * @param emailFreq The frequency of the email.
 */
const changeFreq = async (username: string, emailFreq: string): Promise<SafeDatabaseUser> => {
  if (emailFreq !== 'weekly' && emailFreq !== 'daily' && emailFreq !== 'hourly') {
    throw new Error('Not a valid notification type');
  }
  const res = await api.patch(`${USER_API_URL}/changeFrequency`, {
    username,
    emailFreq,
  });
  if (res.status !== 200) {
    throw new Error('Error when changing frequency of email notification');
  }
  return res.data;
};

/**
 * Adds a pinned badge to the user through the addPinnedBadge endpoint
 * @param username string representing the user
 * @param badge string representing the image location
 * @returns updated user
 */
const addPinnedBadge = async (username: string, pinnedBadge: string): Promise<SafeDatabaseUser> => {
  const res = await api.post(`${USER_API_URL}/addPinnedBadge`, { username, pinnedBadge });
  if (res.status !== 200) {
    throw new Error('Error when adding pinned badge');
  }
  return res.data;
};

const updateStreak = async (username: string, date: Date) => {
  const res = await api.patch(`${USER_API_URL}/updateStreak`, { username, date });
  if (res.status !== 200) {
    throw new Error('Error while updating streak');
  }
  return res.data;
};

export {
  getUsers,
  getUserByUsername,
  loginUser,
  createUser,
  deleteUser,
  resetPassword,
  updateBiography,
  addEmail,
  replaceEmail,
  subscribeNotifs,
  awardBadges,
  awardBanners,
  newActiveBanner,
  changeFreq,
  addPinnedBadge,
  updateStreak,
};
