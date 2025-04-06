import express, { Request, Response, Router } from 'express';
import {
  ForumRequest,
  ForumByNameRequest,
  FakeSOSocket,
  ForumMembershipRequest,
  PopulatedForumResponse,
  DatabaseForum,
  AddForumQuestionRequest,
  Question,
  PopulatedDatabaseQuestion,
  FindForumQuestionRequest,
  Notification,
  ForumModerateRequest,
  PopulatedDatabaseNotification,
} from '../types/types';
import {
  saveForum,
  getForumById,
  getForumsList,
  addUserToForum,
  removeUserFromForum,
  addQuestionToForum,
  getForumQuestionsByOrder,
  approveUser,
  banUser,
  cancelUserJoinRequest,
  unbanUser,
} from '../services/forum.service';
import { getUserByUsername } from '../services/user.service';
import { saveQuestion } from '../services/question.service';
import { processTags } from '../services/tag.service';
import { populateDocument } from '../utils/database.util';
import { saveNotification } from '../services/notification.service';

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
    req.body.createdBy !== undefined &&
    req.body.createdBy.trim() !== '' &&
    req.body.type !== undefined &&
    (req.body.type === 'public' || req.body.type === 'private');

  /**
   * Creates a forum
   *
   * @param req - The request containing the forum object
   * @param res - The response, either returning the forum list or an error
   * @returns A promise resolving to void
   */
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

      res.status(200).json(result);
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
      res.status(200).json(forums);
    } catch (error) {
      res.status(500).send(`Error when getting forums list: ${error}`);
    }
  };

  /**
   * Gets the forum questions by the provided order, responds with the list of forum questions by order.
   *
   * @param req The request object containing the forum question request
   * @param res The response object to send the result
   */
  const getQuestionsByOrder = async (
    req: FindForumQuestionRequest,
    res: Response,
  ): Promise<void> => {
    const { fid, order } = req.query;

    try {
      const qlist: PopulatedDatabaseQuestion[] = await getForumQuestionsByOrder(order, fid);
      res.json(qlist);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).send(`Error when fetching questions by filter: ${err.message}`);
      } else {
        res.status(500).send(`Error when fetching questions by filter`);
      }
    }
  };

  /**
   * Handles updating a user moderation event within the forum.
   * @param req Request containing user, moderator and type
   * @param res The response object to send the result
   * @throws Error if invalid body, incorrect moderation perms
   */
  const moderateUserMembership = async (
    req: ForumModerateRequest,
    res: Response,
  ): Promise<void> => {
    if (!req.body || !req.body.fid || !req.body.username || !req.body.moderator || !req.body.type) {
      res.status(400).send('Invalid request');
      return;
    }

    const { fid, username, moderator, type } = req.body;

    try {
      const forum = await getForumById(fid);
      if ('error' in forum) {
        throw new Error(forum.error);
      }
      if (!forum.moderators.includes(moderator)) {
        throw new Error('Invalid mod permissions');
      }

      let updatedForum: PopulatedForumResponse;
      if (type === 'approve') {
        updatedForum = await approveUser(fid, username);
      } else if (type === 'ban') {
        updatedForum = await banUser(fid, username);
      } else if (type === 'unban') {
        updatedForum = await unbanUser(fid, username);
      } else {
        throw new Error('Invalid type');
      }

      if ('error' in updatedForum) {
        throw new Error(updatedForum.error);
      }

      socket.emit('forumUpdate', {
        forum: {
          ...updatedForum,
          questions: updatedForum.questions.map(question => question._id),
        } as DatabaseForum,
        type: 'updated',
      });
      res.json(updatedForum);
    } catch (err) {
      res.status(500).send(`Error when moderating user membership: ${(err as Error).message}`);
    }
  };

  /**
   * Adds or removes a user to the forum
   *
   * @param req - The request containing the username, forumId, and type of membership change
   * @param res - The response, either returning the forum list or an error
   * @returns A promise resolving to void
   */
  const toggleUserMembership = async (
    req: ForumMembershipRequest,
    res: Response,
  ): Promise<void> => {
    if (!req.body || !req.body.fid || !req.body.username || !req.body.type) {
      res.status(400).send('Invalid request');
      return;
    }
    const { fid, username, type } = req.body;
    try {
      let updatedForum: PopulatedForumResponse;
      if (type === 'join') {
        updatedForum = await addUserToForum(fid, username);
      } else if (type === 'leave') {
        updatedForum = await removeUserFromForum(fid, username);
      } else if (type === 'cancel') {
        updatedForum = await cancelUserJoinRequest(fid, username);
      } else {
        throw new Error('Invalid type');
      }

      if ('error' in updatedForum) {
        throw new Error(updatedForum.error);
      }

      socket.emit('forumUpdate', {
        forum: {
          ...updatedForum,
          questions: updatedForum.questions.map(question => question._id),
        } as DatabaseForum,
        type: 'updated',
      });
      res.json(updatedForum);
    } catch (err) {
      res.status(500).send(`Error when updating user membership: ${(err as Error).message}`);
    }
  };

  /**
   * Adds a new question to a forum in the database. The question request and question are
   * validated and then saved. If successful, the question is associated with the corresponding
   * forum. If there is an error, the HTTP response's status is updated.
   *
   * @param req The QuestionRequest object containing the forum ID and question data.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const addQuestion = async (req: AddForumQuestionRequest, res: Response): Promise<void> => {
    if (!req.body || !req.body.fid || !req.body.question) {
      res.status(400).send('Invalid request');
      return;
    }

    // checking if the question is valid
    if (
      !(
        req.body.question.title !== undefined &&
        req.body.question.title !== '' &&
        req.body.question.text !== undefined &&
        req.body.question.text !== '' &&
        req.body.question.tags !== undefined &&
        req.body.question.tags.length > 0 &&
        req.body.question.askedBy !== undefined &&
        req.body.question.askedBy !== '' &&
        req.body.question.askDateTime !== undefined &&
        req.body.question.askDateTime !== null
      )
    ) {
      res.status(400).send('Invalid question');
      return;
    }

    const { fid } = req.body;
    const questionInfo: Question = req.body.question;

    try {
      const questionWithTags = {
        ...questionInfo,
        tags: await processTags(questionInfo.tags),
        forumId: fid,
      };

      if (questionWithTags.tags.length === 0) {
        throw new Error('Invalid tags');
      }

      const questionFromDb = await saveQuestion(questionWithTags);

      if ('error' in questionFromDb) {
        throw new Error(questionFromDb.error as string);
      }

      const result = await addQuestionToForum(fid, questionFromDb);

      if (result && 'error' in result) {
        throw new Error(result.error as string);
      }

      const foundForum = await getForumById(fid);
      if ('error' in foundForum) {
        throw new Error(foundForum.error);
      }

      foundForum.members.forEach(async user => {
        const member = await getUserByUsername(user);
        if ('error' in member) {
          throw new Error(member.error);
        }

        const newNotif: Notification = {
          title: 'New Post in One of Your Forums',
          text: `A new question ${questionFromDb.text} has been asked in your forum ${result.name} `,
          type: 'browser',
          user: member,
          read: false,
        };

        const savedNotif = await saveNotification(newNotif);
        if ('error' in savedNotif) {
          throw new Error(savedNotif.error);
        }
        const populatedNotif = await populateDocument(savedNotif._id.toString(), 'notification');
        socket.emit('notificationUpdate', {
          notification: populatedNotif as PopulatedDatabaseNotification,
          type: 'created',
        });
      });

      socket.emit('forumUpdate', {
        forum: result,
        type: 'updated',
      });
      res.status(200).json(result);
    } catch (err) {
      res.status(500).send(`Error when adding question: ${(err as Error).message}`);
    }
  };

  // Define routes for the forum-related operations
  router.post('/create', createForum);
  router.get('/getForum/:forumName', getForum);
  router.get('/getForums', getForums);
  router.post('/toggleUserMembership', toggleUserMembership);
  router.post('/moderateUserMembership', moderateUserMembership);
  router.post('/addQuestion', addQuestion);
  router.get('/getQuestion', getQuestionsByOrder);
  return router;
};

export default forumController;
