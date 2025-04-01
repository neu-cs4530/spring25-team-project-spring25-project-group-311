import { ObjectId } from 'mongodb';
import { PopulatedDatabaseQuestion, Question, VoteInterface } from '../types/types';
import api from './config';

const QUESTION_API_URL = `${process.env.REACT_APP_SERVER_URL}/question`;
const FORUM_API_URL = `${process.env.REACT_APP_SERVER_URL}/forum`;

/**
 * Function to get questions by filter.
 *
 * @param order - The order in which to fetch questions. Default is 'newest'.
 * @param search - The search term to filter questions. Default is an empty string.
 * @throws Error if there is an issue fetching or filtering questions.
 */
const getQuestionsByFilter = async (
  order: string = 'newest',
  search: string = '',
): Promise<PopulatedDatabaseQuestion[]> => {
  const res = await api.get(`${QUESTION_API_URL}/getQuestion?order=${order}&search=${search}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching or filtering questions');
  }
  return res.data;
};

/**
 * Get questions by their IDs.
 *
 * @param ids - Array of question IDs to fetch.
 * @returns A promise that resolves to an array of populated question objects.
 */
export const getQuestionsByIds = async (ids: string[]): Promise<PopulatedDatabaseQuestion[]> => {
  const response = await api.get(`${QUESTION_API_URL}/byIds`, {
    params: {
      ids: ids.join(','),
    },
  });

  return response.data;
};

/**
 * Function to get a question by its ID.
 *
 * @param qid - The ID of the question to retrieve.
 * @param username - The username of the user requesting the question.
 * @throws Error if there is an issue fetching the question by ID.
 */
const getQuestionById = async (
  qid: string,
  username: string,
): Promise<PopulatedDatabaseQuestion> => {
  const res = await api.get(`${QUESTION_API_URL}/getQuestionById/${qid}?username=${username}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching question by id');
  }
  return res.data;
};

/**
 * Function to add a new question.
 *
 * @param q - The question object to add.
 * @param fid - Optional forum to add the question object to
 * @throws Error if there is an issue creating the new question.
 */
const addQuestion = async (q: Question, fid?: string): Promise<PopulatedDatabaseQuestion> => {
  let res;
  if (!fid) {
    res = await api.post(`${QUESTION_API_URL}/addQuestion`, q);
  } else {
    res = await api.post(`${FORUM_API_URL}/addQuestion`, {
      fid,
      question: q,
    });
  }

  if (res.status !== 200) {
    throw new Error('Error while creating a new question');
  }

  return res.data;
};

/**
 * Function to upvote a question.
 *
 * @param qid - The ID of the question to upvote.
 * @param username - The username of the person upvoting the question.
 * @throws Error if there is an issue upvoting the question.
 */
const upvoteQuestion = async (qid: ObjectId, username: string): Promise<VoteInterface> => {
  const data = { qid, username };
  const res = await api.post(`${QUESTION_API_URL}/upvoteQuestion`, data);
  if (res.status !== 200) {
    throw new Error('Error while upvoting the question');
  }
  return res.data;
};

/**
 * Function to downvote a question.
 *
 * @param qid - The ID of the question to downvote.
 * @param username - The username of the person downvoting the question.
 * @throws Error if there is an issue downvoting the question.
 */
const downvoteQuestion = async (qid: ObjectId, username: string): Promise<VoteInterface> => {
  const data = { qid, username };
  const res = await api.post(`${QUESTION_API_URL}/downvoteQuestion`, data);
  if (res.status !== 200) {
    throw new Error('Error while downvoting the question');
  }
  return res.data;
};

export { getQuestionsByFilter, getQuestionById, addQuestion, upvoteQuestion, downvoteQuestion };
