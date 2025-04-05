import { Server } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@fake-stack-overflow/shared/types/types';
import { ObjectId } from 'mongodb';

// export * from '../../shared/src/types/types';
export * from '@fake-stack-overflow/shared/types/types';

/**
 * Type alias for the Socket.io Server instance.
 * - Handles communication between the client and server using defined events.
 */
export type FakeSOSocket = Server<ClientToServerEvents, ServerToClientEvents>;

export interface DailyChallenge {
  _id: string;
  description: string;
  completed: boolean;
}

export interface DatabaseReadStatus {
  _id: ObjectId;
  userId: ObjectId;
  postId: ObjectId;
  read: boolean;
}
export type DatabaseReadStatusResponse = DatabaseReadStatus | { error: string };
export type ReadStatusResponse = boolean | { error: string };
