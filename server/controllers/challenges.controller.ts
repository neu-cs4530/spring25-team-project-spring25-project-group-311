import express, { Request, Response } from 'express';
import ChallengeCompletion from '../models/schema/challengeCompletion.schema';
import { FakeSOSocket } from '../types/types';
import ChallengeModel from '../models/challenge.model';

const challengeController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Fetch the daily challenge for the current day.
   */
  router.get('/daily', async (req: Request, res: Response) => {
    // get the current date in UTC
    const utcToday = new Date(new Date().toISOString().substring(0, 10));
    const utcTomorrow = new Date(utcToday);
    utcTomorrow.setDate(utcToday.getDate() + 1);

    try {
      console.log(`Looking for challenges between ${utcToday} and ${utcTomorrow}`);

      const dailyChallenge = await ChallengeModel.findOne({
        date: {
          $gte: utcToday.toISOString(),
          $lt: utcTomorrow.toISOString(),
        },
        isActive: true,
      });

      if (!dailyChallenge) {
        res.status(404).json({ message: 'No challenge available for today' });
        return;
      }
      res.json(dailyChallenge);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching daily challenge' });
    }
  });

  /**
   * Fetch all challenges.
   */
  router.post('/complete/:challengeId', async (req: Request, res: Response) => {
    const { userId } = req.body;
    const { challengeId } = req.params;

    try {
      const existingCompletion = await ChallengeCompletion.findOne({
        userId,
        challengeId,
      }).exec();

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
      socket.emit('challengeCompleted', { userId, challengeId });
      res.status(201).json({ message: 'Challenge completed successfully', completion });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  });

  return router;
};

export default challengeController;
