import { Server } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@fake-stack-overflow/shared/types/types';
import { Document, ObjectId } from 'mongoose';

// export * from '../../shared/src/types/types';
export * from '@fake-stack-overflow/shared/types/types';

/**
 * Type alias for the Socket.io Server instance.
 * - Handles communication between the client and server using defined events.
 */
export type FakeSOSocket = Server<ClientToServerEvents, ServerToClientEvents>;

export interface DatabaseReadStatus extends Document {
  _id: ObjectId;
  userId: ObjectId;
  postId: ObjectId;
  read: boolean;
}
