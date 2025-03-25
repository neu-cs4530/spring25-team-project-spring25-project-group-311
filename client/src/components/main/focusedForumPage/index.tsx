import React from 'react';
import { getMetaData } from '../../../tool';
import './index.css';
import AskQuestionButton from '../askQuestionButton';
import useFocusedForumPage from '../../../hooks/useFocusedForumPage';

/**
 * FocusedForumPage component that displays the full content of a forum.
 */
const FocusedForumPage = () => {
  const { forum } = useFocusedForumPage();

  if (!forum) {
    return null;
  }

  return (
    <div className='focused-forum-container'>
      <div className='space_between right_padding'>
        <div className='bold_title'>{forum.name}</div>
        <AskQuestionButton />
      </div>

      <div className='forum-details'>
        <div className='forum-description'>{forum.description}</div>
        <div className='forum-meta'>
          <span className='forum-creator'>Created by: {forum.createdBy}</span>
          <span className='forum-date'>Created {getMetaData(new Date(forum.createDateTime))}</span>
        </div>
      </div>

      <div className='forum-stats'>
        <div className='stat-box'>
          <div className='stat-number'>{forum.members.length}</div>
          <div className='stat-label'>Members</div>
        </div>
        <div className='stat-box'>
          <div className='stat-number'>{forum.moderators.length}</div>
          <div className='stat-label'>Moderators</div>
        </div>
        <div className='stat-box'>
          <div className='stat-number'>{forum.questions.length}</div>
          <div className='stat-label'>Questions</div>
        </div>
      </div>

      {/* <div className='forum-flairs-section'>
        <h3>Forum Flairs</h3>
        <div className='forum-flairs'>
          {forum.flairs.map((flair, index) => (
            <span key={index} className='forum-flair'>
              {flair}
            </span>
          ))}
        </div>
      </div> */}

      <div className='members-section'>
        <h3>Members</h3>
        <div className='members-list'>
          {forum.members.map((member, index) => (
            <div key={index} className='member-item'>
              {member}
              {forum.moderators.includes(member) && <span className='moderator-badge'>Mod</span>}
            </div>
          ))}
        </div>
      </div>

      <div className='questions-section'>
        <h3>Questions</h3>
        {forum.questions.length > 0 ? (
          <div className='questions-list'>
            <p>Questions will be displayed here</p>
            {/* This would be replaced with actual question components */}
          </div>
        ) : (
          <div className='no-questions'>No questions have been posted in this forum yet.</div>
        )}
      </div>

      <div className='forum-actions'>
        <button className='bluebtn join-button'>Join Forum</button>
        <button className='bluebtn post-question-button'>Post a Question</button>
      </div>
    </div>
  );
};

export default FocusedForumPage;
