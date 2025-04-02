import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
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

  const updateForum = (updatedForum: DatabaseForum) => {
    setForum(updatedForum);
  };

  useEffect(() => {
    if (!fid) {
      navigate('/forums');
      return;
    }

    setForumID(fid);
  }, [fid, navigate]);

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

  useEffect(() => {
    const handleForumUpdate = (forumUpdate: { forum: DatabaseForum; type: string }) => {
      if (forumUpdate && forumUpdate.forum && forumUpdate.forum._id && forumID) {
        const updateId = String(forumUpdate.forum._id);

        if (updateId === forumID) {
          setForum(forumUpdate.forum);
        }
      }
    };

    socket.on('forumUpdate', handleForumUpdate);

    return () => {
      socket.off('forumUpdate', handleForumUpdate);
    };
  }, [forumID, socket]);

  return {
    forumID,
    forum,
    updateForum,
  };
};

export default useFocusedForumPage;
