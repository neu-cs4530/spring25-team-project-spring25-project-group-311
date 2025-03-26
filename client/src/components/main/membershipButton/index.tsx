import React, { useState, useEffect } from 'react';

interface MembershipButtonProps {
  forumId: string;
  isMember: boolean;
  onMembershipChange?: (joined: boolean) => void;
}

/**
 * MembershipButton component that renders a button for joining or leaving a forum.
 * The button text and action changes based on whether the user is already a member.
 */
const MembershipButton = ({ forumId, isMember, onMembershipChange }: MembershipButtonProps) => {
  const [isUserMember, setIsUserMember] = useState<boolean>(isMember);

  useEffect(() => {
    setIsUserMember(isMember);
  }, [isMember]);

  /**
   * Function to handle joining or leaving the forum
   */
  const handleMembershipChange = async () => {
    try {
      if (isUserMember) {
        // Call your API to leave the forum
        // const response = await leaveForum(forumId, user.username);
        setIsUserMember(false);
        if (onMembershipChange) onMembershipChange(false);
      } else {
        // Call your API to join the forum
        // const response = await joinForum(forumId, user.username);
        setIsUserMember(true);
        if (onMembershipChange) onMembershipChange(true);
      }
    } catch (error) {
      // console.error('Error when changing forum membership:', error);
    }
  };

  return (
    <button className={`${isUserMember ? 'redbtn' : 'bluebtn'}`} onClick={handleMembershipChange}>
      {isUserMember ? 'Leave Forum' : 'Join Forum'}
    </button>
  );
};

export default MembershipButton;
