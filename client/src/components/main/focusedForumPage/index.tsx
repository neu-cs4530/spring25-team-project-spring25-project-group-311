import React, { useEffect, useState } from 'react';
import './index.css';
import { OrderType } from '@fake-stack-overflow/shared';
import AskQuestionButton from '../askQuestionButton';
import useFocusedForumPage from '../../../hooks/useFocusedForumPage';
import MembershipButton from '../membershipButton';
import { orderTypeDisplayName } from '../../../types/constants';
import OrderButton from '../questionPage/header/orderButton';
import QuestionView from '../questionPage/question';
import useUserContext from '../../../hooks/useUserContext';

/**
 * FocusedForumPage component that displays the full content of a forum.
 */
const FocusedForumPage = () => {
  const { user } = useUserContext();
  const {
    forum,
    type,
    handleForumTypeChange,
    updateForum,
    handleApproveUser,
    handleBanUser,
    handleUnbanUser,
    setQuestionOrder,
    sortedQuestions,
  } = useFocusedForumPage();
  const [showAwaitingMembers, setShowAwaitingMembers] = useState<boolean>(false);
  const [showAskQuestionButton, setShowAskQuestionButton] = useState<boolean>(true);
  const [showMembershipButton, setShowMembershipButton] = useState<boolean>(true);
  const [showModOptions, setShowModOptions] = useState<boolean>(false);
  const [showCreatorOptions, setShowCreatorOptions] = useState<boolean>(false);

  // figuring out button display logic on frontend
  useEffect(() => {
    if (!forum) return;

    // ask question button logic
    let shouldShowButton = true;

    if (forum.type === 'private' && !forum.members.includes(user.username)) {
      shouldShowButton = false;
    }

    if (forum.type === 'public' && forum.bannedMembers.includes(user.username)) {
      shouldShowButton = false;
    }

    setShowAskQuestionButton(shouldShowButton);

    // membership logic
    if (forum.createdBy === user.username || forum.bannedMembers.includes(user.username)) {
      setShowMembershipButton(false);
    }

    // awaiting
    if (forum.awaitingMembers && forum.awaitingMembers.length > 0) {
      setShowAwaitingMembers(true);
    } else {
      setShowAwaitingMembers(false);
    }

    // mod perms
    if (forum.moderators.includes(user.username)) {
      setShowModOptions(true);
    }

    // creator perms
    if (forum.createdBy === user.username) {
      setShowCreatorOptions(true);
    }
  }, [forum, user.username]);

  if (!forum) {
    return null;
  }

  return (
    <div id='main' className='main'>
      <div id='middle_main' className='middle_main'>
        <div className='space_between right_padding'>
          <div className='bold_title'>{forum.name}</div>
          <div className='buttons-container'>
            {showMembershipButton && <MembershipButton forum={forum} updateForum={updateForum} />}
            {showAskQuestionButton && <AskQuestionButton forumId={forum._id.toString()} />}
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
          <div className='header1'>
            <b>Description</b>
          </div>
          <div className='member-item'> {forum.description}</div>
        </div>
        <div id='section-spacing' className='section-spacing'>
          <div className='header1'>
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
                {showModOptions && member !== user.username && (
                  <div className='member-buttons'>
                    <button className='ban-btn' onClick={() => handleBanUser(member)}>
                      Ban
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {showAwaitingMembers && (
            <div id='section-spacing' className='section-spacing'>
              <div className='header1'>
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
                    {showModOptions && (
                      <div className='member-buttons'>
                        <button className='approve-btn' onClick={() => handleApproveUser(member)}>
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {showModOptions && forum.bannedMembers.length > 0 && (
            <div id='section-spacing' className='section-spacing'>
              <div className='header1'>
                <b>Banned Members</b>
              </div>
              <div className='members-list'>
                {forum.bannedMembers.map((member, index) => (
                  <div key={index} className='member-item'>
                    {member}
                    {forum.moderators.includes(member) && (
                      <span className='moderator-badge'>
                        <b>(Mod)</b>
                      </span>
                    )}
                    {showModOptions && member !== user.username && (
                      <div className='member-buttons'>
                        <button className='unban-btn' onClick={() => handleUnbanUser(member)}>
                          Unban
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {showCreatorOptions && (
            <div className='section-spacing'>
              <label className='header1'>
                <b>Forum Type:</b>
              </label>
              <div className='form_radio_group'>
                <label className='form_radio_label'>
                  <input
                    type='radio'
                    name='forumType'
                    value='public'
                    checked={type === 'public'}
                    onChange={() => handleForumTypeChange('public')}
                  />
                  Public
                </label>
                <label className='form_radio_label'>
                  <input
                    type='radio'
                    name='forumType'
                    value='private'
                    checked={type === 'private'}
                    onChange={() => handleForumTypeChange('private')}
                  />
                  Private
                </label>
              </div>
            </div>
          )}
          <div id='section-spacing' className='section-spacing'>
            <div className='created-by'>Created by {forum.createdBy}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusedForumPage;
