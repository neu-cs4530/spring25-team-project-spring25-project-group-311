import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { User, DatabaseUser } from './user';
import { Question } from './question';

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
  moderators: User[];
  members: User[];
  questions: Question[];
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
  questions: ObjectId[];
}
