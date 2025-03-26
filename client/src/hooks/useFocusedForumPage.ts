import { useNavigate, useParams } from 'react-router-dom';
import { SetStateAction, useEffect, useState } from 'react';
import { DatabaseForum } from '../types/types';
import useUserContext from './useUserContext';
import { getForumById } from '../services/forumService';

/**
 * Custom hook for managing the focused forum page's state, navigation, and real-time updates.
 *
 * @returns forumID - The current forum ID retrieved from the URL parameters.
 * @returns forum - The current forum object with its members, questions, and other details.
 */
const useFocusedForumPage = () => {
  const { fid } = useParams();
  const navigate = useNavigate();

  const { socket } = useUserContext();
  const [forumID, setForumID] = useState<string>(fid || '');
  const [forum, setForum] = useState<DatabaseForum | null>(null);

  // Handle navigation if no forum ID is provided
  useEffect(() => {
    if (!fid) {
      navigate('/forums');
      return;
    }

    setForumID(fid);
  }, [fid, navigate]);

  // Fetch forum data when ID changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getForumById(forumID);
        setForum(res || null);
      } catch (error) {
        // console.error('Error fetching forum:', error);
      }
    };

    fetchData().catch(() => {});
  }, [forumID]);

  // Listen for real-time updates to the forum
  useEffect(() => {
    const handleForumUpdate = (forumUpdate: { forum: SetStateAction<DatabaseForum | null> }) => {
      if (forumUpdate.forum && forumUpdate.forum.name === forum?.name) {
        setForum(forumUpdate.forum);
      }
    };

    socket.on('forumUpdate', handleForumUpdate);

    return () => {
      socket.off('forumUpdate', handleForumUpdate);
    };
  }, [forum?.name, socket]);

  return {
    forumID,
    forum,
  };
};

export default useFocusedForumPage;
