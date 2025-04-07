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
  const { buttonText, toggleMembership } = useMembershipButton(forum, updateForum);

  return (
    <div>
      <button className={'bluebtn'} onClick={toggleMembership}>
        {buttonText}
      </button>
    </div>
  );
};

export default MembershipButton;
