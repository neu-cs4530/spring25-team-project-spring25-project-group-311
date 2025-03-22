import ForumModel from '../models/forum.model';
import { Forum, DatabaseForum, ForumResponse, PopulatedDatabaseQuestion } from '../types/types';
import QuestionModel from '../models/questions.model';
import AnswerModel from '../models/answers.model';
import CommentModel from '../models/comments.model';
import TagModel from '../models/tags.model';

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
      throw Error('Forum not found');
    }

    return forum;
  } catch (error) {
    return { error: `Error occurred when finding forum: ${error}` };
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
