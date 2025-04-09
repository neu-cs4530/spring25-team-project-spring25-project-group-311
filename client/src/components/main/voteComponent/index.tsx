import { downvoteQuestion, upvoteQuestion } from '../../../services/questionService';
import './index.css';
import useUserContext from '../../../hooks/useUserContext';
import { PopulatedDatabaseQuestion } from '../../../types/types';
import useVoteStatus from '../../../hooks/useVoteStatus';
import {
  getUpvoteDownvote,
  updateStreak,
  awardBadges,
  awardBanners,
} from '../../../services/userService';

/**
 * Interface represents the props for the VoteComponent.
 *
 * question - The question object containing voting information.
 */
interface VoteComponentProps {
  question: PopulatedDatabaseQuestion;
}

/**
 * A Vote component that allows users to upvote or downvote a question.
 *
 * @param question - The question object containing voting information.
 */
const VoteComponent = ({ question }: VoteComponentProps) => {
  const { user } = useUserContext();
  const { count, voted } = useVoteStatus({ question });

  /**
   * Function to handle upvoting or downvoting a question.
   *
   * @param type - The type of vote, either 'upvote' or 'downvote'.
   */
  const handleVote = async (type: string) => {
    try {
      if (question._id) {
        if (type === 'upvote') {
          await upvoteQuestion(question._id, user.username);
        } else if (type === 'downvote') {
          await downvoteQuestion(question._id, user.username);
        }

        // Update streak and activity log
        const userRes = await updateStreak(user.username, new Date(), 'votes');
        const voteRes = await getUpvoteDownvote(user.username);
        // awarding badges if the user has 5 upvotes
        if (voteRes >= 5 && !user.badges.includes('/badge_images/Five_Votes_Badge.png')) {
          const updatedUser = await awardBadges(user.username, [
            '/badge_images/Five_Votes_Badge.png',
          ]);
          user.badges = updatedUser.badges;
          const bannersUpdatedUser = await awardBanners(user.username, ['lightcoral']);
          user.banners = bannersUpdatedUser.banners;
        }

        user.streak = userRes.streak;
        user.activityLog = userRes.activityLog;

        if (
          user.streak &&
          user.streak.length >= 5 &&
          !user.badges.includes('/badge_images/Five_Day_Streak_Badge.png')
        ) {
          const updatedUser = await awardBadges(user.username, [
            '/badge_images/Five_Day_Streak_Badge.png',
          ]);
          user.badges = updatedUser.badges;
          const bannersUpdatedUser = await awardBanners(user.username, ['pink']);
          user.banners = bannersUpdatedUser.banners;
        }
      }
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className='vote-container'>
      <button
        className={`vote-button ${voted === 1 ? 'vote-button-upvoted' : ''}`}
        onClick={() => handleVote('upvote')}>
        Upvote
      </button>
      <button
        className={`vote-button ${voted === -1 ? 'vote-button-downvoted' : ''}`}
        onClick={() => handleVote('downvote')}>
        Downvote
      </button>
      <span className='vote-count'>{count}</span>
    </div>
  );
};

export default VoteComponent;
