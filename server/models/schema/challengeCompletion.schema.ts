import mongoose, { Schema } from 'mongoose';
/**
 * Mongoose schema for the ChallengeCompletion collection.
 *
 * This schema defines the structure for storing challenge completions in the database.
 * Each challenge completion includes the following fields:
 * - `userId`: The ID of the user who completed the challenge.
 * - `challengeId`: The ID of the challenge that was completed.
 * - `completionDate`: The date when the challenge was completed.
 */
const challengeCompletionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true },
  completionDate: { type: Date, default: Date.now },
});

const challengeCompletion = mongoose.model('ChallengeCompletion', challengeCompletionSchema);
export default challengeCompletion;
