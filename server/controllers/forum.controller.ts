import express, { Request, Response, Router } from 'express';
import { ForumRequest, ForumByNameRequest, FakeSOSocket } from '../types/types';
import { saveForum, getForumById, getForumsList } from '../services/forum.service';
import { getUserByUsername } from '../services/user.service';

const forumController = (socket: FakeSOSocket) => {
  const router: Router = express.Router();

  /**
   * Validates that the request body contains all required fields for a forum.
   *
   * @param req - The incoming request containing forum data
   * @returns `true` if the body contains valid forum fields; otherwise, `false`
   */
  const isForumBodyValid = (req: ForumRequest): boolean =>
    req.body !== undefined &&
    req.body.name !== undefined &&
    req.body.name.trim() !== '' &&
    req.body.description !== undefined &&
    req.body.description.trim() !== '' &&
    req.body.flairs !== undefined &&
    Array.isArray(req.body.flairs) &&
    req.body.flairs.length > 0 &&
    req.body.createdBy !== undefined &&
    req.body.createdBy.trim() !== '' &&
    req.body.type !== undefined &&
    (req.body.type === 'public' || req.body.type === 'private');

  const createForum = async (req: ForumRequest, res: Response): Promise<void> => {
    try {
      if (!isForumBodyValid(req)) {
        res.status(400).send('Invalid forum data.');
        return;
      }

      const forumData = req.body;
      forumData.createDateTime = new Date();

      // Get the creator user from database to use as reference
      const creatorUser = await getUserByUsername(forumData.createdBy);

      if ('error' in creatorUser) {
        throw new Error(`Creator user not found: ${creatorUser.error}`);
      }

      // Ensure the creator is included in moderators and members as references
      if (!forumData.moderators || !Array.isArray(forumData.moderators)) {
        forumData.moderators = [forumData.createdBy];
      } else if (!forumData.moderators.includes(forumData.createdBy)) {
        forumData.moderators.push(forumData.createdBy);
      }

      if (!forumData.members || !Array.isArray(forumData.members)) {
        forumData.members = [forumData.createdBy];
      } else if (!forumData.members.includes(forumData.createdBy)) {
        forumData.members.push(forumData.createdBy);
      }

      // The remaining should be empty
      forumData.awaitingMembers = [];
      forumData.bannedMembers = [];
      forumData.questions = [];

      const result = await saveForum(forumData);

      if ('error' in result) {
        throw new Error(result.error);
      }

      socket.emit('forumUpdate', {
        forum: result,
        type: 'created',
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(500).send(`Error when creating forum: ${error}`);
    }
  };

  /**
   * Retrieves a forum by its name.
   *
   * @param req - The request containing the forum name as a route parameter
   * @param res - The response, either returning the forum or an error
   * @returns A promise resolving to void
   */
  const getForum = async (req: ForumByNameRequest, res: Response): Promise<void> => {
    try {
      const { forumName } = req.params;

      if (!forumName || forumName.trim() === '') {
        res.status(400).send('Forum name is required');
        return;
      }

      const forum = await getForumById(forumName);

      if ('error' in forum) {
        throw Error(forum.error);
      }

      res.status(200).json(forum);
    } catch (error) {
      res.status(500).send(`Error when retrieving forum: ${error}`);
    }
  };

  /**
   * Gets a list of all forums.
   *
   * @param req - The request containing the user object
   * @param res - The response, either returning the forum list or an error
   * @returns A promise resolving to void
   */
  const getForums = async (_: Request, res: Response): Promise<void> => {
    try {
      const forums = await getForumsList();

      if ('error' in forums) {
        throw Error(forums.error);
      }

      res.status(200).json(forums);
    } catch (error) {
      res.status(500).send(`Error when getting forums list: ${error}`);
    }
  };

  // Define routes for the forum-related operations
  router.post('/create', createForum);
  router.get('/getForum/:forumName', getForum);
  router.get('/getForums', getForums);
  return router;
};

export default forumController;
