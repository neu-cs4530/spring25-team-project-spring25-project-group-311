import React from 'react';
import './index.css';
import QuestionHeader from './header';
import QuestionView from './question';
import useQuestionPage from '../../../hooks/useQuestionPage';

const QuestionPage = () => {
  const { titleText, qlist, setQuestionOrder } = useQuestionPage();

  const handleUpdateReadStatus = async (id: object) => {
    try {
      const response = await fetch(`/question/markAsRead/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to update read status');
      }
      // Optionally update local state to reflect the change
      console.log('Read status updated');
    } catch (error) {
      console.error('Error updating read status:', error);
    }
  };

  return (
    <>
      <QuestionHeader
        titleText={titleText}
        qcnt={qlist.length}
        setQuestionOrder={setQuestionOrder}
      />
      <div id='question_list' className='question_list'>
        {qlist.map(question => (
          <QuestionView
            key={question._id.toString()}
            question={question}
            onUpdateReadStatus={handleUpdateReadStatus}
          />
        ))}
      </div>

      {titleText === 'Search Results' && !qlist.length && (
        <div className='bold_title right_padding'>No Questions Found</div>
      )}
    </>
  );
};

export default QuestionPage;
