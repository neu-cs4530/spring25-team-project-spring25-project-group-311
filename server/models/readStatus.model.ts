import mongoose, { Model } from 'mongoose';
import readStatusSchema from './schema/readStatus.schema';
import { DatabaseReadStatus } from '../types/types';

/**
 * Mongoose model for the `ReadStatus` collection.
 *
 * This model is created using the `DatabaseReadStatus` interface, representing the
 * read status for posts in the MongoDB database, and provides an interface for interacting
 * with these records.
 *
 * @type {Model<DatabaseReadStatus>}
 */
const ReadStatusModel: Model<DatabaseReadStatus> = mongoose.model<DatabaseReadStatus>(
  'ReadStatus',
  readStatusSchema,
);

export default ReadStatusModel;
