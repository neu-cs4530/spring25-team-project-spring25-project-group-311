import mongoose, { Schema } from 'mongoose';

/**
 * Mongoose schema for the Challenge collection.
 *
 * This schema defines the structure for storing challenges in the database.
 * Each challenge includes the following fields:
 * - `description`: A brief description of the challenge.
 * - `date`: The date when the challenge was created or scheduled.
 */
const challengeSchema: Schema = new Schema({
  description: { type: String },
  date: { type: Date },
});

const challenge = mongoose.model('Challenge', challengeSchema);
export default challenge;
