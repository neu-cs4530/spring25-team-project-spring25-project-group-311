import React from 'react';
import './index.css';
import LeaderCard from './leaderCard';
import useLeaderboardPage from '../../../hooks/useLeaderboard';

/**
 * UsersListPage component renders a page displaying a list of users
 * based on search content filtering.
 * It includes a header with a search bar.
 */
const LeaderboardListPage = () => {
  const { leaderboardList } = useLeaderboardPage();

  return (
    <div className='user-card-container'>
      <h2>Current Leaderboard</h2>
      <div id='users_list' className='users_list'>
        {leaderboardList.map((user, index) => (
          <LeaderCard user={user} key={user.username} rank={index + 1} />
        ))}
      </div>
      {(!leaderboardList.length || leaderboardList.length === 0) && (
        <div className='bold_title right_padding'>No Users To Rank</div>
      )}
    </div>
  );
};

export default LeaderboardListPage;
