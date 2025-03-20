import { Schema } from 'mongoose';

/**
 * Mongoose schema for the User collection.
 *
 * This schema defines the structure for storing users in the database.
 * Each User includes the following fields:
 * - `username`: The username of the user.
 * - `password`: The encrypted password securing the user's account.
 * - `dateJoined`: The date the user joined the platform.
 * - `biography`: A short biography of the user.
 * - `emails`: The emails associated with this user (in the form of a list to allow for multiple emails)
 * - `badges`: The badges the user has earned.
 */
const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      immutable: true,
    },
    password: {
      type: String,
    },
    dateJoined: {
      type: Date,
    },
    biography: {
      type: String,
      default: '',
    },
    emails: [{ type: String }],
    badges: {
      type: [String],
      default: [],
    },
    browserNotif: {
      type: Boolean,
    },
    emailNotif: {
      type: Boolean,
    },
  },
  { collection: 'User' },
);

export default userSchema;
