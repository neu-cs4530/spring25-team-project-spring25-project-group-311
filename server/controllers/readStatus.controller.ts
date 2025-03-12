import express, { Request, Response, Router } from 'express';
import { markAsRead, checkReadStatus } from '../services/readStatus.service';

// Extending the Express request to include user data
interface AuthRequest extends Request {
  user: { _id: string };
}

export const readStatusController = (router: Router = express.Router()) => {
  // Middleware to ensure user is authenticated
  const authenticate = (req: AuthRequest, res: Response, next: Function) => {
    if (!req.user || !req.user._id) {
      res.status(401).send('User not authenticated');
      return;
    }
    next();
  };

  router.post('/:postId/read', authenticate, async (req: AuthRequest, res: Response) => {
    const userId = req.user._id; // Extracted user ID from the authenticated user
    const { postId } = req.params;

    try {
      const result = await markAsRead(userId, postId);
      if ('error' in result) {
        res.status(500).json({ message: 'Failed to mark as read', error: result.error });
        return;
      }
      res.status(200).json({ message: 'Post marked as read', postId });
    } catch (error) {
      res.status(500).json({ message: 'Error processing your request', error: error.message });
    }
  });

  router.get('/:postId', authenticate, async (req: AuthRequest, res: Response) => {
    const userId = req.user._id; // Extracted user ID from the authenticated user
    const { postId } = req.params;

    try {
      const result = await checkReadStatus(userId, postId);
      if ('error' in result) {
        res.status(500).json({ message: 'Failed to check read status', error: result.error });
        return;
      }
      res.status(200).json({ readStatus: result.read });
    } catch (error) {
      res.status(500).json({ message: 'Error processing your request', error: error.message });
    }
  });

  return router;
};

export default readStatusController;
