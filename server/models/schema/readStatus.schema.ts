import mongoose from 'mongoose';

// Define schema for tracking whether post has read by a user
const readStatusSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  read: { type: Boolean, default: false },
});

export default readStatusSchema;
