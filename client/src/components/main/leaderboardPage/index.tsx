import React from 'react';
import './index.css';
import LeaderCard from './leaderCard';
import useLeaderboardPage from '../../../hooks/useLeaderboard';

/**
 * LeaderboardList component renders a page displaying a list of users
 * ranked by the number of badges the user has.
 */
const LeaderboardListPage = () => {
  const { err, leaderboardList } = useLeaderboardPage();

  return (
    <div className='user-card-container'>
      {err && <p className='error-message'>{err}</p>}
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
