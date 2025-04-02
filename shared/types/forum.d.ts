import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { OrderType, PopulatedDatabaseQuestion, Question } from './question';

/**
 * Represents a forum in the database.
 *
 */
export interface Forum {
  name: string;
  description: string;
  createdBy: string;
  createDateTime: Date;
  moderators: string[];
  members: string[];
  awaitingMembers: string[];
  bannedMembers: string[];
  questions: Question[];
  type: 'public' | 'private';
}

/**
 * Represents a forum in the database.
 *
 */
export interface DatabaseForum extends Omit<Forum, 'questions'> {
  _id: ObjectId;
  questions: ObjectId[];
}

export interface PopulatedDatabaseForum extends Omit<DatabaseForum, 'questions'> {
  questions: PopulatedDatabaseQuestion[];
}

/**
 * Express request for forum creation or modification.
 * - `body`: The forum object to be created or modified.
 */
export interface ForumRequest extends Request {
  body: Forum;
}

/**
 * Express request for querying a forum by its name.
 * - `forumName`: The forum name provided as a route parameter.
 */
export interface ForumByNameRequest extends Request {
  params: {
    forumName: string;
  };
}

/**
 * Express request for forum join/leave operations.
 */
export interface ForumMembershipRequest extends Request {
  body: {
    fid: string;
    username: string;
    type: 'join' | 'leave';
  };
}

export interface FindForumQuestionRequest extends Request {
  query: {
    fid: string;
    order: OrderType;
  };
}

/**
 * Represents the response for forum-related operations.
 * - If successful, returns the forum data.
 * - If unsuccessful, returns an error message.
 */
export type ForumResponse = DatabaseForum | { error: string };

/**
 * Represents the populated response for forum-related operations.
 * - If successful, returns the forum data.
 * - If unsuccessful, returns an error message.
 */
export type PopulatedForumResponse = PopulatedDatabaseForum | { error: string };

/**
 * Represents the response for multiple forum-related operations.
 * - If successful, returns an array of forums.
 * - If unsuccessful, returns an error message.
 */
export type ForumsResponse = DatabaseForum[] | { error: string };
