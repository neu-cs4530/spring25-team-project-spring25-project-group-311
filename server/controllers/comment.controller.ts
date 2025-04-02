import express, { Response } from 'express';
import { ObjectId } from 'mongodb';
import {
  Comment,
  AddCommentRequest,
  FakeSOSocket,
  PopulatedDatabaseQuestion,
  PopulatedDatabaseAnswer,
  QuestionResponse,
  AnswerResponse,
  UserResponse,
  Notification,
} from '../types/types';
import { addComment, saveComment } from '../services/comment.service';
import { populateDocument } from '../utils/database.util';
import { getQuestionByID } from '../services/question.service';
import { getAnswerById } from '../services/answer.service';
import { getUserByUsername } from '../services/user.service';
import { saveNotification } from '../services/notification.service';

const commentController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Checks if the provided answer request contains the required fields.
   *
   * @param req The request object containing the answer data.
   *
   * @returns `true` if the request is valid, otherwise `false`.
   */
  const isRequestValid = (req: AddCommentRequest): boolean =>
    !!req.body.id &&
    !!req.body.type &&
    (req.body.type === 'question' || req.body.type === 'answer') &&
    !!req.body.comment &&
    req.body.comment.text !== undefined &&
    req.body.comment.commentBy !== undefined &&
    req.body.comment.commentDateTime !== undefined;

  /**
   * Validates the comment object to ensure it is not empty.
   *
   * @param comment The comment to validate.
   *
   * @returns `true` if the coment is valid, otherwise `false`.
   */
  const isCommentValid = (comment: Comment): boolean =>
    comment.text !== undefined &&
    comment.text !== '' &&
    comment.commentBy !== undefined &&
    comment.commentBy !== '' &&
    comment.commentDateTime !== undefined &&
    comment.commentDateTime !== null;

  /**
   * Handles adding a new comment to the specified question or answer. The comment is first validated and then saved.
   * If the comment is invalid or saving fails, the HTTP response status is updated.
   *
   * @param req The AddCommentRequest object containing the comment data.
   * @param res The HTTP response object used to send back the result of the operation.
   * @param type The type of the comment, either 'question' or 'answer'.
   *
   * @returns A Promise that resolves to void.
   */
  const addCommentRoute = async (req: AddCommentRequest, res: Response): Promise<void> => {
    if (!isRequestValid(req)) {
      res.status(400).send('Invalid request');
      return;
    }

    const id = req.body.id as string;

    if (!ObjectId.isValid(id)) {
      res.status(400).send('Invalid ID format');
      return;
    }

    const { comment, type } = req.body;

    if (!isCommentValid(comment)) {
      res.status(400).send('Invalid comment body');
      return;
    }

    try {
      const comFromDb = await saveComment(comment);

      if ('error' in comFromDb) {
        throw new Error(comFromDb.error);
      }

      const status = await addComment(id, type, comFromDb);

      if (status && 'error' in status) {
        throw new Error(status.error);
      }

      // Populates the fields of the question or answer that this comment
      // was added to, and emits the updated object
      const populatedDoc = await populateDocument(id, type);

      if (populatedDoc && 'error' in populatedDoc) {
        throw new Error(populatedDoc.error);
      }

      let foundParentPost: QuestionResponse | AnswerResponse;
      let asker: UserResponse;

      if (type === 'question') {
        foundParentPost = await getQuestionByID(id);

        if ('error' in foundParentPost) {
          throw new Error(foundParentPost.error as string);
        }

        asker = await getUserByUsername(foundParentPost.askedBy);
      } else {
        foundParentPost = await getAnswerById(id);

        if ('error' in foundParentPost) {
          throw new Error(foundParentPost.error as string);
        }

        asker = await getUserByUsername(foundParentPost.ansBy);
      }

      if ('error' in asker) {
        throw new Error(asker.error as string);
      }

      // The new notification
      const newNotif: Notification = {
        title: 'New Comment to Your Post',
        text: `A new comment has been given to your question ${foundParentPost.text}`,
        type: 'browser',
        user: asker,
        read: false,
      };

      const savedNotif = await saveNotification(newNotif);
      if ('error' in savedNotif) {
        throw new Error(savedNotif.error as string);
      }

      const populatedNotif = await populateDocument(savedNotif._id.toString(), 'notification');

      socket.emit('commentUpdate', {
        result: populatedDoc as PopulatedDatabaseQuestion | PopulatedDatabaseAnswer,
        type,
      });

      socket.emit('notificationUpdate', {
        notification: populatedNotif,
        type: 'created',
      });
      res.json(comFromDb);
    } catch (err: unknown) {
      res.status(500).send(`Error when adding comment: ${(err as Error).message}`);
    }
  };

  router.post('/addComment', addCommentRoute);

  return router;
};

export default commentController;
