import React from 'react';
import { getMetaData } from '../../../tool';
import AnswerView from './answer';
import AnswerHeader from './header';
import { Comment } from '../../../types/types';
import './index.css';
import QuestionBody from './questionBody';
import VoteComponent from '../voteComponent';
import CommentSection from '../commentSection';
import useAnswerPage from '../../../hooks/useAnswerPage';
import useProfileSettings from '../../../hooks/useProfileSettings';

/**
 * AnswerPage component that displays the full content of a question along with its answers.
 * It also includes the functionality to vote, ask a new question, and post a new answer.
 */
const AnswerPage = () => {
  const {
    questionID,
    question,
    handleNewComment,
    handleNewAnswer,
    isForumQuestion,
    forum,
    forumTitle,
  } = useAnswerPage();

  const { verifyCommentChallenge } = useProfileSettings();

  if (!question) {
    return null;
  }

  return (
    <>
      <VoteComponent question={question} />
      <AnswerHeader
        ansCount={question.answers.length}
        title={question.title}
        forumTitle={isForumQuestion ? forumTitle : undefined}
      />
      <QuestionBody
        views={question.views.length}
        text={question.text}
        askby={question.askedBy}
        meta={getMetaData(new Date(question.askDateTime))}
      />
      <CommentSection
        comments={question.comments}
        forum={isForumQuestion && forum ? forum : undefined}
        handleAddComment={(comment: Comment) => handleNewComment(comment, 'question', questionID)}
      />
      {question.answers.map(a => (
        <AnswerView
          key={String(a._id)}
          text={a.text}
          ansBy={a.ansBy}
          meta={getMetaData(new Date(a.ansDateTime))}
          forum={isForumQuestion && forum ? forum : undefined}
          comments={a.comments}
          handleAddComment={async (comment: Comment) => {
            handleNewComment(comment, 'answer', String(a._id));
            await verifyCommentChallenge?.();
          }}
        />
      ))}
      <button
        className='bluebtn ansButton'
        onClick={() => {
          handleNewAnswer();
        }}>
        Answer Question
      </button>
    </>
  );
};

export default AnswerPage;
