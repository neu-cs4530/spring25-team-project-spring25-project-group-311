import React, { useState, useEffect } from 'react';
import './index.css';
import QuestionView from '../questionPage/question';
import { PopulatedDatabaseQuestion, OrderType, AnswerUpdatePayload } from '../../../types/types';
import useUserContext from '../../../hooks/useUserContext';
import { getQuestionsByIds } from '../../../services/questionService';

interface ForumQuestionListProps {
  forumId: string;
  questionIds: string[];
}

/**
 * ForumQuestionList component renders questions for a specific forum
 * with filtering and sorting capabilities similar to the main QuestionPage.
 */
const ForumQuestionList = ({ forumId, questionIds }: ForumQuestionListProps) => {
  const [questionOrder, setQuestionOrder] = useState<OrderType>('newest');
  const [questions, setQuestions] = useState<PopulatedDatabaseQuestion[]>([]);
  const { socket } = useUserContext();

  // Sort questions based on the selected order
  const sortQuestions = (qs: PopulatedDatabaseQuestion[], order: OrderType) =>
    [...qs].sort((a, b) => {
      if (order === 'newest') {
        return new Date(b.askDateTime).getTime() - new Date(a.askDateTime).getTime();
      }
      if (order === 'active') {
        // Use the latest answer time or ask time to determine activity
        const bLatestAnswerTime =
          b.answers.length > 0
            ? Math.max(...b.answers.map(ans => new Date(ans.ansDateTime).getTime()))
            : new Date(b.askDateTime).getTime();
        const aLatestAnswerTime =
          a.answers.length > 0
            ? Math.max(...a.answers.map(ans => new Date(ans.ansDateTime).getTime()))
            : new Date(a.askDateTime).getTime();
        return bLatestAnswerTime - aLatestAnswerTime;
      }
      if (order === 'unanswered') {
        // Sort unanswered questions first, then by newest
        if (a.answers.length === 0 && b.answers.length > 0) return -1;
        if (a.answers.length > 0 && b.answers.length === 0) return 1;
        return new Date(b.askDateTime).getTime() - new Date(a.askDateTime).getTime();
      }
      if (order === 'mostViewed') {
        // Sort by view count (descending)
        return b.views.length - a.views.length;
      }
      // Default to newest if order type is not recognized
      return new Date(b.askDateTime).getTime() - new Date(a.askDateTime).getTime();
    });

  // Fetch questions by IDs
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (questionIds && questionIds.length > 0) {
          // Convert each ID to string if they're not already
          const stringIds = questionIds.map(id => (id.toString ? id.toString() : id));
          const fetchedQuestions = await getQuestionsByIds(stringIds);
          // Sort the questions based on the selected order
          const sortedQuestions = sortQuestions(fetchedQuestions || [], questionOrder);
          setQuestions(sortedQuestions);
        } else {
          setQuestions([]);
        }
      } catch (error) {
        setQuestions([]);
      }
    };

    fetchQuestions();
  }, [questionIds, questionOrder]);

  // Listen for real-time updates
  useEffect(() => {
    /**
     * Function to handle question updates from the socket.
     *
     * @param question - the updated question object.
     */
    const handleQuestionUpdate = (question: PopulatedDatabaseQuestion) => {
      // Check if the updated question belongs to this forum
      if (questionIds.some(id => id.toString() === question._id.toString())) {
        setQuestions(prevQuestions => {
          const questionExists = prevQuestions.some(
            q => q._id.toString() === question._id.toString(),
          );

          if (questionExists) {
            // Update the existing question
            return sortQuestions(
              prevQuestions.map(q => (q._id.toString() === question._id.toString() ? question : q)),
              questionOrder,
            );
          }

          // Add new question
          return sortQuestions([...prevQuestions, question], questionOrder);
        });
      }
    };

    /**
     * Function to handle answer updates from the socket.
     *
     * @param qid - The question ID.
     * @param answer - The answer object.
     */
    const handleAnswerUpdate = ({ qid, answer }: AnswerUpdatePayload) => {
      // Check if the updated question belongs to this forum
      if (questionIds.some(id => id.toString() === qid.toString())) {
        setQuestions(prevQuestions =>
          sortQuestions(
            prevQuestions.map(q =>
              q._id.toString() === qid.toString() ? { ...q, answers: [...q.answers, answer] } : q,
            ),
            questionOrder,
          ),
        );
      }
    };

    /**
     * Function to handle views updates from the socket.
     *
     * @param question - The updated question object.
     */
    const handleViewsUpdate = (question: PopulatedDatabaseQuestion) => {
      // Check if the updated question belongs to this forum
      if (questionIds.some(id => id.toString() === question._id.toString())) {
        setQuestions(prevQuestions =>
          sortQuestions(
            prevQuestions.map(q => (q._id.toString() === question._id.toString() ? question : q)),
            questionOrder,
          ),
        );
      }
    };

    socket.on('questionUpdate', handleQuestionUpdate);
    socket.on('answerUpdate', handleAnswerUpdate);
    socket.on('viewsUpdate', handleViewsUpdate);

    return () => {
      socket.off('questionUpdate', handleQuestionUpdate);
      socket.off('answerUpdate', handleAnswerUpdate);
      socket.off('viewsUpdate', handleViewsUpdate);
    };
  }, [questionIds, questionOrder, socket]);

  return (
    <div className='forum-questions-container'>
      <div className='question-sorting'>
        <span>Sort by:</span>
        <button
          className={questionOrder === 'newest' ? 'active' : ''}
          onClick={() => setQuestionOrder('newest')}>
          Newest
        </button>
        <button
          className={questionOrder === 'unanswered' ? 'active' : ''}
          onClick={() => setQuestionOrder('unanswered' as OrderType)}>
          Unanswered
        </button>
        <button
          className={questionOrder === 'active' ? 'active' : ''}
          onClick={() => setQuestionOrder('active')}>
          Active
        </button>
        <button
          className={questionOrder === 'mostViewed' ? 'active' : ''}
          onClick={() => setQuestionOrder('views' as OrderType)}>
          Most Viewed
        </button>
      </div>
      {questions.length > 0 ? (
        <div id='question_list' className='question_list'>
          {questions.map(question => (
            <QuestionView question={question} key={String(question._id)} />
          ))}
        </div>
      ) : (
        <div className='no-questions right_padding'>No questions to display in this forum.</div>
      )}
    </div>
  );
};

export default ForumQuestionList;
