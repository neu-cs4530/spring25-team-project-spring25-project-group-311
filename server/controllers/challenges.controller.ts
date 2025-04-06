import express, { Request, Response, Router } from 'express';
import challenge from '../models/schema/challenge.schema';
import ChallengeCompletion from '../models/schema/challengeCompletion.schema';
import { FakeSOSocket } from '../types/types';

const userController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Fetch the daily challenge for the current day.
   */
  router.get('/challenges/daily', async (req: Request, res: Response) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      const challengeDate = await challenge.findOne({
        date: { $gte: today, $lt: tomorrow },
      });
      if (!challengeDate) {
        res.status(404).json({ message: 'No challenge available for today' });
        return; // return after sending response
      }
      res.json(challengeDate);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  });

  /**
   * Fetch all challenges.
   */
  router.post('/challenges/complete/:challengeId', async (req: Request, res: Response) => {
    const { userId } = req.body;
    const { challengeId } = req.params;

    try {
      const existingCompletion = await ChallengeCompletion.findOne({
        userId,
        challengeId,
      });

      if (existingCompletion) {
        res.status(409).json({ message: 'Challenge already completed by this user' });
        return; // return after sending response
      }

      const completion = new ChallengeCompletion({
        userId,
        challengeId,
        completionDate: new Date(),
      });
      await completion.save();

      res.status(201).json({ message: 'Challenge completed successfully', completion });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  });

  return router;
};

export default userController;
