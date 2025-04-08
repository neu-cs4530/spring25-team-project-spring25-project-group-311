import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Challenge collection.
 */
const challengeSchema = new Schema({
  title: String,
  description: String,
  date: String,
  isActive: Boolean,
});

export default challengeSchema;
