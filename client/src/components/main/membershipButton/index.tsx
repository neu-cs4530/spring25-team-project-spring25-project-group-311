import React from 'react';
import { DatabaseForum } from '@fake-stack-overflow/shared';
import useMembershipButton from '../../../hooks/useMembershipButton';

interface MembershipButtonProps {
  forum: DatabaseForum;
  updateForum: (forum: DatabaseForum) => void;
}

/**
 * MembershipButton component that renders a button for joining or leaving a forum.
 * The button text and action changes based on whether the user is already a member.
 */
const MembershipButton = ({ forum, updateForum }: MembershipButtonProps) => {
  const { buttonText, isMember, isAwaitingApproval, error, toggleMembership } = useMembershipButton(
    forum,
    updateForum,
  );

  return (
    <div>
      <button
        className={`bluebtn ${isMember ? 'leave-button' : 'join-button'}`}
        onClick={toggleMembership}>
        {buttonText}
      </button>
      {isAwaitingApproval && <div className='awaiting-text'>Your request is pending approval</div>}
      {error && <div className='error-text'>{error}</div>}
    </div>
  );
};

export default MembershipButton;
