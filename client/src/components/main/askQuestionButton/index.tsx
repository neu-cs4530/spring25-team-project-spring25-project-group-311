import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AskQuestionButtonProps {
  forumId?: string;
}

/**
 * AskQuestionButton component that renders a button for navigating to the
 * "New Question" page. When clicked, it redirects the user to the page
 * where they can ask a new question.
 */
const AskQuestionButton = ({ forumId }: AskQuestionButtonProps) => {
  const navigate = useNavigate();

  /**
   * Function to handle navigation to the "New Question" page.
   * If a forumId is provided, it will be included in the URL as a query parameter
   */
  const handleNewQuestion = () => {
    if (forumId) {
      navigate(`/forum/${forumId}/new/question`);
    } else {
      navigate('/new/question');
    }
  };

  return (
    <button
      className='bluebtn'
      onClick={() => {
        handleNewQuestion();
      }}>
      Ask a Question
    </button>
  );
};

export default AskQuestionButton;
