import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { User, DatabaseUser } from './user';
import { PopulatedDatabaseQuestion, Question } from './question';
import { PopulatedDatabaseChat } from './chat';

/**
 * Represents a forum in the database.
 *
 */
export interface Forum {
  name: string;
  description: string;
  flairs: string[];
  createdBy: string;
  createDateTime: Date;
  moderators: string[];
  members: string[];
  awaitingMembers: string[];
  bannedMembers: string[];
  questions: PopulatedDatabaseQuestion[];
  type: 'public' | 'private';
}

/**
 * Represents a forum in the database.
 *
 */
export interface DatabaseForum extends Forum {
  _id: ObjectId;
  moderators: ObjectId[];
  members: ObjectId[];
  awaitingMembers: ObjectId[];
  bannedMembers: ObjectId[];
  questions: ObjectId[];
}

export type ForumResponse = DatabaseForum | { error: string };
