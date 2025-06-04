import mongoose, { Model } from 'mongoose';
import forumSchema from './schema/forum.schema';
import { DatabaseForum } from '../types/types';

/**
 * Mongoose model for the Forum collection.
 *
 * This model is created using the `Forum` interface and the `forumSchema`, representing the
 * `Forum` collection in the MongoDB database, and provides an interface for interacting with
 * the stored forums.
 *
 * @type {Model<DatabaseForum>}
 */
const ForumModel: Model<DatabaseForum> = mongoose.model<DatabaseForum>('Forum', forumSchema);

export default ForumModel;
