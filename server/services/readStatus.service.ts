import ReadStatus from '../models/readStatus.model'; // Import your ReadStatus model
import { DatabaseReadStatus, DatabaseReadStatusResponse } from '../types/types';

/**
 * Marks a post as read for a specific user.
 * @param userId The ID of the user.
 * @param postId The ID of the post.
 * @returns A promise resolving to the updated or newly created read status document.
 */
export const markAsRead = async (
  userId: string,
  postId: string,
): Promise<DatabaseReadStatusResponse> => {
  try {
    const result: DatabaseReadStatus | null = await ReadStatus.findOneAndUpdate(
      { userId, postId },
      { read: true },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    if (!result) {
      throw Error('Error marking as read');
    }
    return result;
  } catch (error) {
    return { error: 'Error occured' };
  }
};

/**
 * Checks if a specific post has been read by a specific user.
 * @param userId The ID of the user.
 * @param postId The ID of the post.
 * @returns A promise resolving to the read status document if found, or null if not found.
 */
export const checkReadStatus = async (
  userId: string,
  postId: string,
): Promise<DatabaseReadStatusResponse> => {
  try {
    const result: DatabaseReadStatus | null = await ReadStatus.findOne({ userId, postId });
    if (!result) {
      throw Error('Error checking status');
    }
    return result; // Ensure a consistent return structure
  } catch (error) {
    return { error: 'Error occured' };
  }
};
