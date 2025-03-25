import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { Question } from './question';

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

/**
 * Express request for forum creation or modification.
 * - `body`: The forum object to be created or modified.
 */
export interface ForumRequest extends Request {
  body: Forum;
}

/**
 * Express request for querying a forum by its id.
 * - `forumName`: The forum name provided as a route parameter.
 */
export interface ForumByIdRequest extends Request {
  params: {
    forumId: string;
  };
}

/**
 * Express request for forum join/leave operations.
 */
export interface ForumMembershipRequest extends Request {
  body: {
    forumId: string;
    username: string;
  };
}

/**
 * Represents the response for forum-related operations.
 * - If successful, returns the forum data.
 * - If unsuccessful, returns an error message.
 */
export type ForumResponse = DatabaseForum | { error: string };

/**
 * Represents the response for multiple forum-related operations.
 * - If successful, returns an array of forums.
 * - If unsuccessful, returns an error message.
 */
export type ForumsResponse = DatabaseForum[] | { error: string };
