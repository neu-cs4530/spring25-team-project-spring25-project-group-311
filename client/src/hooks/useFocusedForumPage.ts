import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  DatabaseForum,
  ForumUpdatePayload,
  OrderType,
  PopulatedDatabaseQuestion,
} from '../types/types';
import useUserContext from './useUserContext';
import { getForumById, getQuestionsByOrder } from '../services/forumService';

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
  const [questionOrder, setQuestionOrder] = useState<OrderType>('newest');
  const [sortedQuestions, setSortedQuestions] = useState<PopulatedDatabaseQuestion[]>([]);
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
    /**
     * Function to fetch questions based on the order
     */
    const fetchSortedQuestions = async () => {
      if (forumID) {
        try {
          const questions = await getQuestionsByOrder(forumID, questionOrder);
          setSortedQuestions(questions || []);
        } catch (error) {
          // console.log(error);
        }
      }
    };

    fetchSortedQuestions().catch(() => {});
  }, [forumID, questionOrder]);

  useEffect(() => {
    const handleForumUpdate = (forumUpdate: ForumUpdatePayload) => {
      if (forumUpdate && forumUpdate.forum && forumUpdate.forum._id && forumID) {
        const updateId = String(forumUpdate.forum._id);

        if (updateId === forumID) {
          setForum(forumUpdate.forum);
        }

        const fetchUpdatedQuestions = async () => {
          try {
            const questions = await getQuestionsByOrder(forumID, questionOrder);
            setSortedQuestions(questions);
          } catch (error) {
            // console.error('Error fetching updated questions:', error);
          }
        };

        fetchUpdatedQuestions().catch(() => {});
      }
    };

    socket.on('forumUpdate', handleForumUpdate);

    return () => {
      socket.off('forumUpdate', handleForumUpdate);
    };
  }, [forumID, questionOrder, socket]);

  return {
    forum,
    updateForum,
    setQuestionOrder,
    sortedQuestions,
  };
};

export default useFocusedForumPage;
