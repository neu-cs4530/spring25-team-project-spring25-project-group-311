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

  // const handleSortQuestions = () => {
  //   const sortedQuestions = questions.sort((a, b) => {
  //     const dateA = new Date(a.createdAt);
  //     const dateB = new Date(b.createdAt);
  //     return isSortedAsc ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
  //   });
  //   setQuestions([...sortedQuestions]);
  //   setIsSortedAsc(!isSortedAsc);
  // };

  return (
    <button className='bluebtn' onClick={handleNewQuestion}>
      Create a forum
    </button>
  );
};

export default CreateForumButton;
