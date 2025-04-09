import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  AnswerUpdatePayload,
  DatabaseForum,
  ForumUpdatePayload,
  OrderType,
  PopulatedDatabaseQuestion,
} from '../types/types';
import useUserContext from './useUserContext';
import {
  approveUser,
  banUser,
  getForumById,
  getQuestionsByOrder,
  unbanUser,
  updateForumType,
} from '../services/forumService';

/**
 * Custom hook for managing the focused forum page's state, navigation, and real-time updates.
 *
 * @returns forumID - The current forum ID retrieved from the URL parameters.
 * @returns forum - The current forum object with its members, questions, and other details.
 */
const useFocusedForumPage = () => {
  const { fid } = useParams();
  const navigate = useNavigate();

  const { user, socket } = useUserContext();
  const [questionOrder, setQuestionOrder] = useState<OrderType>('newest');
  const [sortedQuestions, setSortedQuestions] = useState<PopulatedDatabaseQuestion[]>([]);
  const [forumID, setForumID] = useState<string>(fid || '');
  const [forum, setForum] = useState<DatabaseForum | null>(null);
  const [type, setType] = useState<'public' | 'private'>('public');

  const updateForum = (updatedForum: DatabaseForum) => {
    setForum(updatedForum);
  };

  const handleForumTypeChange = async (newType: 'public' | 'private') => {
    const updatedForum = await updateForumType(forumID, user.username, newType);
    setForum(updatedForum);
    setType(newType);
  };

  /**
   * Handling approving a user join request
   * @param forumId - Forum that the user is joining
   * @param member - member to approve
   */
  const handleApproveUser = async (member: string) => {
    const updatedForum = await approveUser(forumID, member, user.username);
    setForum(updatedForum);
  };

  /**
   * Handling banning a user from a forum
   * @param forumId - Forum where user will be banned
   * @param member - user to ban
   */
  const handleBanUser = async (member: string) => {
    const updatedForum = await banUser(forumID, member, user.username);
    setForum(updatedForum);
  };

  /**
   * Handling unbanning a user from a forum
   * @param forumId - Forum where a user will be unbanned
   * @param member - user to unban
   */
  const handleUnbanUser = async (member: string) => {
    try {
      const updatedForum = await unbanUser(forumID, member, user.username);
      setForum(updatedForum);
    } catch (error) {
      // console.error('Error banning user:', error);
    }
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
        setType(res?.type || 'public');
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

    /**
     * Function to handle question updates from the socket.
     *
     * @param question - the updated question object.
     */
    const handleQuestionUpdate = (question: PopulatedDatabaseQuestion) => {
      setSortedQuestions(prevQlist => {
        const questionExists = prevQlist.some(q => q._id === question._id);

        if (questionExists) {
          // Update the existing question
          return prevQlist.map(q => (q._id === question._id ? question : q));
        }

        return [question, ...prevQlist];
      });
    };

    /**
     * Function to handle answer updates from the socket.
     *
     * @param qid - The question ID.
     * @param answer - The answer object.
     */
    const handleAnswerUpdate = ({ qid, answer }: AnswerUpdatePayload) => {
      setSortedQuestions(prevQlist =>
        prevQlist.map(q => (q._id === qid ? { ...q, answers: [...q.answers, answer] } : q)),
      );
    };

    /**
     * Function to handle views updates from the socket.
     *
     * @param question - The updated question object.
     */
    const handleViewsUpdate = (question: PopulatedDatabaseQuestion) => {
      setSortedQuestions(prevQlist => prevQlist.map(q => (q._id === question._id ? question : q)));
    };

    socket.on('forumUpdate', handleForumUpdate);
    socket.on('questionUpdate', handleQuestionUpdate);
    socket.on('answerUpdate', handleAnswerUpdate);
    socket.on('viewsUpdate', handleViewsUpdate);

    return () => {
      socket.off('questionUpdate', handleQuestionUpdate);
      socket.off('answerUpdate', handleAnswerUpdate);
      socket.off('viewsUpdate', handleViewsUpdate);
      socket.off('forumUpdate', handleForumUpdate);
    };
  }, [forumID, questionOrder, socket]);

  return {
    forum,
    type,
    handleForumTypeChange,
    setForum,
    updateForum,
    handleApproveUser,
    handleBanUser,
    handleUnbanUser,
    setQuestionOrder,
    sortedQuestions,
  };
};

export default useFocusedForumPage;
