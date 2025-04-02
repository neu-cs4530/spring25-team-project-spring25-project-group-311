import React from 'react';
import './index.css';
import { OrderType } from '@fake-stack-overflow/shared';
import AskQuestionButton from '../askQuestionButton';
import useFocusedForumPage from '../../../hooks/useFocusedForumPage';
import MembershipButton from '../membershipButton';
import { orderTypeDisplayName } from '../../../types/constants';
import OrderButton from '../questionPage/header/orderButton';
import QuestionView from '../questionPage/question';

/**
 * FocusedForumPage component that displays the full content of a forum.
 */
const FocusedForumPage = () => {
  const { forum, updateForum, setQuestionOrder, sortedQuestions } = useFocusedForumPage();

  if (!forum) {
    return null;
  }

  return (
    <div className='focused-forum-container'>
      <div className='space_between right_padding'>
        <div className='bold_title'>{forum.name}</div>
        <div className='buttons-container'>
          <div className='btns'>
            {Object.keys(orderTypeDisplayName).map(order => (
              <OrderButton
                key={order}
                orderType={order as OrderType}
                setQuestionOrder={setQuestionOrder}
              />
            ))}
          </div>
          <MembershipButton forum={forum} updateForum={updateForum} />
          <AskQuestionButton forumId={forum._id.toString()} />
        </div>
      </div>

      <div className='forum-details'>
        <div className='forum-description'>{forum.description}</div>
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

      <div id='question_list' className='question_list'>
        {sortedQuestions.map(q => (
          <QuestionView question={q} key={String(q._id)} />
        ))}
      </div>

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
    </div>
  );
};

export default FocusedForumPage;
