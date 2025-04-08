import { Socket } from 'socket.io-client';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@fake-stack-overflow/shared/types/types';

export * from '@fake-stack-overflow/shared/types/types';
export interface Challenge {
  _id: ObjectId;
  title: string;
  description: string;
  date: string;
  isActive: boolean;
}
export interface ChallengeCompletionEntry {
  challenge: string;
  date: string;
}

export type FakeSOSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
