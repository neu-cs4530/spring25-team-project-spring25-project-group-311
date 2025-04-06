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
import { approveUser, banUser, unbanUser } from '../../../services/forumService';

/**
 * FocusedForumPage component that displays the full content of a forum.
 */
const FocusedForumPage = () => {
  const { user } = useUserContext();
  const { forum, setForum, updateForum, setQuestionOrder, sortedQuestions } = useFocusedForumPage();
  const [showAwaitingMembers, setShowAwaitingMembers] = useState<boolean>(false);
  const [showAskQuestionButton, setShowAskQuestionButton] = useState<boolean>(true);
  const [showMembershipButton, setShowMembershipButton] = useState<boolean>(true);
  const [showModOptions, setShowModOptions] = useState<boolean>(false);

  /**
   * Handling approving a user join request
   * @param forumId - Forum that the user is joining
   * @param member - member to approve
   */
  const handleApproveUser = async (forumId: string, member: string) => {
    try {
      const updatedForum = await approveUser(forumId, member, user.username);
      setForum(updatedForum);
    } catch (error) {
      // console.error('Error approving user:', error);
    }
  };

  /**
   * Handling banning a user from a forum
   * @param forumId - Forum where user will be banned
   * @param member - user to ban
   */
  const handleBanUser = async (forumId: string, member: string) => {
    try {
      const updatedForum = await banUser(forumId, member, user.username);
      setForum(updatedForum);
    } catch (error) {
      // console.error('Error banning user:', error);
    }
  };

  /**
   * Handling unbanning a user from a forum
   * @param forumId - Forum where a user will be unbanned
   * @param member - user to unban
   */
  const handleUnbanUser = async (forumId: string, member: string) => {
    try {
      const updatedForum = await unbanUser(forumId, member, user.username);
      setForum(updatedForum);
    } catch (error) {
      // console.error('Error banning user:', error);
    }
  };

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
                    <button
                      className='ban-btn'
                      onClick={() => handleBanUser(String(forum._id), member)}>
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
                        <button
                          className='approve-btn'
                          onClick={() => handleApproveUser(String(forum._id), member)}>
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
                        <button
                          className='unban-btn'
                          onClick={() => handleUnbanUser(String(forum._id), member)}>
                          Unban
                        </button>
                      </div>
                    )}
                  </div>
                ))}
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
