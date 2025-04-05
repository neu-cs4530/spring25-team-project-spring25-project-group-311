import express, { Response } from 'express';
import { ObjectId } from 'mongodb';
import {
  Answer,
  AddAnswerRequest,
  FakeSOSocket,
  PopulatedDatabaseAnswer,
  Notification,
} from '../types/types';
import { addAnswerToQuestion, saveAnswer } from '../services/answer.service';
import { populateDocument } from '../utils/database.util';
import { getQuestionByID } from '../services/question.service';
import { getUserByUsername } from '../services/user.service';
import { saveNotification } from '../services/notification.service';

const answerController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Checks if the provided answer request contains the required fields.
   *
   * @param req The request object containing the answer data.
   *
   * @returns `true` if the request is valid, otherwise `false`.
   */
  function isRequestValid(req: AddAnswerRequest): boolean {
    return !!req.body.qid && !!req.body.ans;
  }

  /**
   * Checks if the provided answer contains the required fields.
   *
   * @param ans The answer object to validate.
   *
   * @returns `true` if the answer is valid, otherwise `false`.
   */
  function isAnswerValid(ans: Answer): boolean {
    return !!ans.text && !!ans.ansBy && !!ans.ansDateTime;
  }

  /**
   * Adds a new answer to a question in the database. The answer request and answer are
   * validated and then saved. If successful, the answer is associated with the corresponding
   * question. If there is an error, the HTTP response's status is updated. In addition,
   * a browser notification is created for the person who asked the question notifying them
   * that a response was given to their question.
   *
   * @param req The AnswerRequest object containing the question ID and answer data.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const addAnswer = async (req: AddAnswerRequest, res: Response): Promise<void> => {
    if (!isRequestValid(req)) {
      res.status(400).send('Invalid request');
      return;
    }
    if (!isAnswerValid(req.body.ans)) {
      res.status(400).send('Invalid answer');
      return;
    }

    const { qid } = req.body;
    const ansInfo: Answer = req.body.ans;

    try {
      const ansFromDb = await saveAnswer(ansInfo);

      if ('error' in ansFromDb) {
        throw new Error(ansFromDb.error as string);
      }

      const status = await addAnswerToQuestion(qid, ansFromDb);

      if (status && 'error' in status) {
        throw new Error(status.error as string);
      }

      const populatedAns = await populateDocument(ansFromDb._id.toString(), 'answer');

      if (populatedAns && 'error' in populatedAns) {
        throw new Error(populatedAns.error);
      }

      const foundQuestion = await getQuestionByID(qid);

      if ('error' in foundQuestion) {
        throw new Error(foundQuestion.error as string);
      }

      const asker = await getUserByUsername(foundQuestion.askedBy);

      if ('error' in asker) {
        throw new Error(asker.error as string);
      }

      // The new notification
      const newNotif: Notification = {
        title: 'New Answer to Your Post',
        text: `A new answer has been given to your question: ${foundQuestion.text}`,
        type: 'browser',
        user: asker,
        read: false,
      };

      const savedNotif = await saveNotification(newNotif);
      if ('error' in savedNotif) {
        throw new Error(savedNotif.error as string);
      }

      const populatedNotif = await populateDocument(savedNotif._id.toString(), 'notification');

      // Populates the fields of the answer that was added and emits the new object
      socket.emit('answerUpdate', {
        qid: new ObjectId(qid),
        answer: populatedAns as PopulatedDatabaseAnswer,
      });

      socket.emit('notificationUpdate', {
        notification: populatedNotif,
        type: 'created',
      });
      res.json(ansFromDb);
    } catch (err) {
      res.status(500).send(`Error when adding answer: ${(err as Error).message}`);
    }
  };

  // add appropriate HTTP verbs and their endpoints to the router.
  router.post('/addAnswer', addAnswer);

  return router;
};

export default answerController;
