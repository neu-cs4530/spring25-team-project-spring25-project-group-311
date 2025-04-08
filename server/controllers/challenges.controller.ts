import express, { Request, Response } from 'express';
import { FakeSOSocket } from '../types/types';
import ChallengeModel from '../models/challenge.model';
import { getUserByUsername, updateUser } from '../services/user.service';

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
    const today = new Date().toISOString().split('T')[0];

    try {
      const user = await getUserByUsername(userId);
      if ('error' in user) throw new Error(user.error);

      const alreadyCompleted = user.challengeCompletions?.some(
        (entry: { challenge: string; date: string }) =>
          entry.challenge === challengeId && entry.date === today,
      );

      if (alreadyCompleted) {
        return res.status(409).json({ message: 'Challenge already completed today' });
      }

      const updatedCompletions = [
        ...(user.challengeCompletions || []),
        { challenge: challengeId, date: today },
      ];

      const updatedUser = await updateUser(user.username, {
        challengeCompletions: updatedCompletions,
      });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      return res
        .status(201)
        .json({ message: 'Challenge completed successfully', user: updatedUser });
    } catch (error) {
      return res.status(500).json({ message: `Error completing challenge: ${error}` });
    }
  });

  return router;
};

export default challengeController;
