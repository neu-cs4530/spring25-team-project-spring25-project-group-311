import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import QuestionComponent from '../question';
import './index.css';

const PostDetail = () => {
  const { postId } = useParams();

  useEffect(() => {
    const markAsRead = async () => {
      console.log(`Attempting to mark question ${postId} as read`);
      try {
        await fetch(`/api/questions/${postId}/read`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log(`Question ${postId} marked as read.`);
      } catch (error) {
        console.error('Error marking question as read:', error);
      }
    };

    if (postId) {
      markAsRead();
    }
  }, [postId]);

  return <div>Question ID: {postId}</div>;
};

export default PostDetail;
