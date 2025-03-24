import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Forum collection.
 *
 * This schema defines the structure for storing forums in the database.
 * Each forum includes the following fields:
 * - `name`: The name of the forum.
 * - `description`: A brief description of the forum.
 * - `flairs`: An array of strings representing available flairs for posts in the forum.
 * - `createdBy`: The user who created the forum.
 * - `createDateTime`: The date and time when the forum was created.
 * - `moderators`: An array of references to Users who moderate the forum.
 * - `members`: An array of references to Users who are members of the forum.
 * - `questions`: An array of references to Questions posted in the forum.
 * - `type`: The type of forum, either 'public' or 'private'.
 */

const forumSchema: Schema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
    },
    flairs: [{ type: String }],
    createdBy: {
      type: String,
    },
    createDateTime: {
      type: Date,
    },
    moderators: [{ type: String }],
    members: [{ type: String }],
    awaitingMembers: [{ type: String }],
    bannedMembers: [{ type: String }],
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    type: {
      type: String,
      enum: ['public', 'private'],
    },
  },
  { collection: 'Forum' },
);

export default forumSchema;
