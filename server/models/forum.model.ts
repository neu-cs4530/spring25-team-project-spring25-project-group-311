import mongoose, { Model } from 'mongoose';
import forumSchema from './schema/forum.schema';
import { DatabaseForum } from '../types/types';

const ForumModel: Model<DatabaseForum> = mongoose.model<DatabaseForum>('Forum', forumSchema);

export default ForumModel;