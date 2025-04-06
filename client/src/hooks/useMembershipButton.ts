import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import useUserContext from './useUserContext';
import { DatabaseForum } from '../types/types';
import { getForumById, joinForum, leaveForum } from '../services/forumService';

/**
 * Custom hook for managing forum membership status and actions.
 * Uses forum ID from URL parameters and current user context.
 *
 * @returns buttonText - The text to display on the membership button.
 * @returns isMember - Boolean indicating if the user is a member of the forum.
 * @returns isAwaitingApproval - Boolean indicating if the user is awaiting approval to join.
 * @returns error - Any error message from membership operations.
 * @returns toggleMembership - Function to handle joining or leaving the forum.
 * @returns forum - The forum data.
 */
const useMembershipButton = (
  initialForum: DatabaseForum,
  updateParentForum: (forum: DatabaseForum) => void,
) => {
  const { user, socket } = useUserContext();
  const { fid } = useParams();

  const [isMember, setIsMember] = useState<boolean>(false);
  const [isAwaitingApproval, setIsAwaitingApproval] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>('Join Forum');
  const [error, setError] = useState<string | null>(null);
  const [forum, setForum] = useState<DatabaseForum | null>(initialForum);

  /**
   * Fetch forum data using the ID from params
   */
  useEffect(() => {
    const fetchForum = async () => {
      if (!fid) return;

      try {
        const data = await getForumById(fid);
        setForum(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    fetchForum();
  }, [fid]);

  /**
   * Listen for forum updates from the socket
   */
  useEffect(() => {
    const handleForumUpdate = (forumUpdate: { forum: DatabaseForum }) => {
      if (forumUpdate.forum && forumUpdate.forum._id === forum?._id) {
        setForum(forumUpdate.forum);
      }
    };

    socket.on('forumUpdate', handleForumUpdate);

    return () => {
      socket.off('forumUpdate', handleForumUpdate);
    };
  }, [socket, forum?._id]);

  /**
   * Determine membership status whenever forum or user changes
   */
  useEffect(() => {
    if (!forum || !user) return;

    const userInMembers = forum.members?.includes(user.username);
    const userAwaitingApproval = forum.awaitingMembers?.includes(user.username);

    setIsMember(userInMembers);
    setIsAwaitingApproval(userAwaitingApproval);

    if (userInMembers || userAwaitingApproval) {
      setButtonText('Leave Forum');
    } else {
      setButtonText('Join Forum');
    }
  }, [forum, user]);

  /**
   * Toggle membership status (join or leave forum)
   */
  const toggleMembership = useCallback(async () => {
    if (!user || !forum) return;

    const forumId = forum._id.toString();
    setError(null);

    try {
      if (isMember || isAwaitingApproval) {
        const updatedForum = await leaveForum(forumId, user.username);

        setIsMember(false);
        setIsAwaitingApproval(false);
        setButtonText('Join Forum');
        setForum(updatedForum);
        updateParentForum(updatedForum);
      } else {
        const updatedForum = await joinForum(forumId, user.username);

        const userAwaitingApproval = updatedForum.awaitingMembers?.includes(user.username);
        const userInMembers = updatedForum.members?.includes(user.username);

        setIsAwaitingApproval(userAwaitingApproval);
        setIsMember(userInMembers);
        setButtonText('Leave Forum');
        setForum(updatedForum);
        updateParentForum(updatedForum);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, [user, forum, isMember, isAwaitingApproval, updateParentForum]);

  return {
    buttonText,
    isMember,
    isAwaitingApproval,
    error,
    toggleMembership,
    forum,
  };
};

export default useMembershipButton;
