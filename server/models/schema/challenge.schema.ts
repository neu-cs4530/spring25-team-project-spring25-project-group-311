import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Challenge collection.
 */
const challengeSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  requirement: {
    actionType: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
    timeframe: {
      type: String,
      required: true,
    },
  },
});

export default challengeSchema;
