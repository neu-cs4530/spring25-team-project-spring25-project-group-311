import React, { useState } from 'react';
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
  const [showAwaitingMembers, setShowAwaitingMembers] = useState<boolean>(false);

  if (forum?.awaitingMembers) {
    if (forum?.awaitingMembers.length > 0) setShowAwaitingMembers(true);
  }
  if (!forum) {
    return null;
  }

  function handleApprove(member: string): void {
    throw new Error('Function not implemented.');
  }

  function handleBan(member: string): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div id='main' className='main'>
      <div id='middle_main' className='middle_main'>
        <div className='space_between right_padding'>
          <div className='bold_title'>{forum.name}</div>
          <div className='buttons-container'>
            <MembershipButton forum={forum} updateForum={updateForum} />
            <AskQuestionButton forumId={forum._id.toString()} />
          </div>
        </div>
        <div className='space_between right_padding'>
          <div id='question_count'>{sortedQuestions.length} questions</div>
          <div className='btns'>
            {Object.keys(orderTypeDisplayName).map(order => (
              <OrderButton
                key={order}
                orderType={order as OrderType}
                setQuestionOrder={setQuestionOrder}
              />
            ))}
          </div>
        </div>
        <div id='question_list' className='question_list'>
          {sortedQuestions.map(q => (
            <QuestionView question={q} key={String(q._id)} />
          ))}
        </div>
      </div>
      <div id='sideBarNav' className='sideBarNav'>
        <div>
          <div className='h1'>
            <b>Description</b>
          </div>
          <div className='member-item'> {forum.description}</div>
        </div>
        <div id='section-spacing' className='section-spacing'>
          <div className='h1'>
            <b>Members</b>
          </div>
          <div className='members-list'>
            {forum.members.map((member, index) => (
              <div key={index} className='member-item'>
                {member}
                {forum.moderators.includes(member) && (
                  <span className='moderator-badge'>
                    <b>(Mod)</b>
                  </span>
                )}
                <div className='member-buttons'>
                  <button className='approve-btn' onClick={() => handleApprove(member)}>
                    Approve
                  </button>
                  <button className='ban-btn' onClick={() => handleBan(member)}>
                    Ban
                  </button>
                </div>
              </div>
            ))}
          </div>
          {showAwaitingMembers && (
            <div id='section-spacing' className='section-spacing'>
              <div className='h1'>
                <b>Awaiting Members</b>
              </div>
              <div className='members-list'>
                {forum.awaitingMembers.map((member, index) => (
                  <div key={index} className='member-item'>
                    {member}
                    {forum.moderators.includes(member) && (
                      <span className='moderator-badge'>
                        <b>(Mod)</b>
                      </span>
                    )}
                    <div className='member-buttons'>
                      <button className='approve-btn' onClick={() => handleApprove(member)}>
                        Approve
                      </button>
                      <button className='ban-btn' onClick={() => handleBan(member)}>
                        Ban
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FocusedForumPage;
