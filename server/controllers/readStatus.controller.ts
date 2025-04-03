import express, { Request, Response, Router } from 'express';
import { markAsRead, checkReadStatus } from '../services/readStatus.service';

// Extending the Express request to include user data
interface AuthRequest extends Request {
  body: {
    user: { _id: string };
  };
  params: {
    postId: string;
  };
}

export const readStatusController = (router: Router = express.Router()) => {
  // Middleware to ensure user is authenticated
  const authenticate = (req: AuthRequest, res: Response, next: () => unknown) => {
    if (!req.body.user || !req.body.user._id) {
      res.status(401).send('User not authenticated');
      return;
    }
    next();
  };

  router.post('/:postId/read', authenticate, async (req: AuthRequest, res: Response) => {
    const userId = req.body.user._id; // Extracted user ID from the authenticated user
    const { postId } = req.params;

    try {
      const result = await markAsRead(userId, postId);
      if ('error' in result) {
        throw Error('Error marking as read');
      }
      res.status(200).json({ message: 'Post marked as read', postId });
    } catch (error) {
      res.status(500).send(`Error processing your request: ${error}`);
    }
  });

  router.get('/:postId', authenticate, async (req: AuthRequest, res: Response) => {
    const userId = req.body.user._id; // Extracted user ID from the authenticated user
    const { postId } = req.params;

    try {
      const result = await checkReadStatus(userId, postId);
      if ('error' in result) {
        throw Error('Error checking status');
      }
      res.status(200).json({ readStatus: result.read });
    } catch (error) {
      res.status(500).send(`Error processing your request: ${error}`);
    }
  });

  return router;
};

export default readStatusController;
