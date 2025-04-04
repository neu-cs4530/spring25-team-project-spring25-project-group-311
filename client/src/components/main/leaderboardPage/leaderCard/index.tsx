import React from 'react';
import './index.css';
import { SafeDatabaseUser } from '../../../../types/types';

/**
 * Interface representing the props for the User component.
 *
 * user - The user object containing details about the user.
 * handleUserCardViewClickHandler - The function to handle the click event on the user card.
 */
interface UserProps {
  rank: number;
  user: SafeDatabaseUser;
}

/**
 * User component renders the details of a user including its username and dateJoined.
 * Clicking on the component triggers the handleUserPage function,
 * and clicking on a tag triggers the clickTag function.
 *
 * @param user - The user object containing user details.
 */
const LeaderCard = (props: UserProps) => {
  const { rank, user } = props;

  return (
    <div className='user right_padding'>
      <div className='userRank'>#{rank}</div>
      <div className='user_mid'>
        <div className='userUsername'>{user.username}</div>
      </div>
      <div className='userStats'>
        <div>Number of badges:{user.badges.length}</div>
      </div>
    </div>
  );
};

export default LeaderCard;
