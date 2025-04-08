import mongoose, { Model } from 'mongoose';
import { DatabaseChallenge } from '../types/types';
import challengeSchema from './schema/challenge.schema';
/**
 * Mongoose model for the Challenge collection.
 *
 * This model is created using the `Challenge` interface and the `challengeSchema`, representing the
 * `Challenge` collection in the MongoDB database, and provides an interface for interacting with
 * the stored challenges.
 *
 * @type {Model<DatabaseChallenge>}
 */
const ChallengeModel: Model<DatabaseChallenge> = mongoose.model<DatabaseChallenge>(
  'Challenge',
  challengeSchema,
);

export default ChallengeModel;
