import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import QuestionComponent from '../question';
import './index.css';

const PostDetail = () => {
  const { questionId } = useParams();
  console.log(`PostDetail component mounted with questionId: ${questionId}`);

  useEffect(() => {
    const markAsRead = async () => {
      console.log(`Attempting to mark question ${questionId} as read`);
      try {
        await fetch(`/api/question/${questionId}/read`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log(`Question ${questionId} marked as read.`);
      } catch (error) {
        console.error('Error marking question as read:', error);
      }
    };

    if (questionId) {
      markAsRead();
    }
  }, [questionId]);

  return <div>Question ID: {questionId}</div>;
};

export default PostDetail;
