import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AskQuestionButton component that renders a button for navigating to the
 * "New Forum" page. When clicked, it redirects the user to the page
 * where they can create a forum.
 */
const CreateForumButton = () => {
  const navigate = useNavigate();

  /**
   * Function to handle navigation to the "New Forum" page.
   */
  const handleNewQuestion = () => {
    navigate('/new/forum');
  };

  return (
    <button
      className='bluebtn'
      onClick={() => {
        handleNewQuestion();
      }}>
      Create a forum
    </button>
  );
};

export default CreateForumButton;
