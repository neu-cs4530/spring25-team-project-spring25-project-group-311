import React from 'react';
import './index.css';
import { SafeDatabaseUser } from '../../../../types/types';

/**
 * Interface representing the props for the Leaderboard card component.
 *
 * rank - The rank of the user.
 * user - The user object containing details about the user.
 */
interface UserProps {
  rank: number;
  user: SafeDatabaseUser;
}

/**
 * Leader card component renders the details of a user including its username, rank, and badge count.
 *
 * @param user - The user object containing user details.
 * @param rank - The rank of the user.
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
