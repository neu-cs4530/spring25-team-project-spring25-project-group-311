import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { validateHyperlink } from '../tool';
import addAnswer from '../services/answerService';
import useUserContext from './useUserContext';
import { Answer } from '../types/types';
import { getQuestionById } from '../services/questionService';
import { getForumById } from '../services/forumService';
import { updateStreak, awardBadges, awardBanners } from '../services/userService';

/**
 * Custom hook for managing the state and logic of an answer submission form.
 *
 * @returns text - the current text input for the answer.
 * @returns textErr - the error message related to the text input.
 * @returns setText - the function to update the answer text input.
 * @returns postAnswer - the function to submit the answer after validation.
 */
const useAnswerForm = () => {
  const { qid } = useParams();
  const navigate = useNavigate();

  const { user } = useUserContext();
  const [text, setText] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [questionID, setQuestionID] = useState<string>('');

  useEffect(() => {
    if (!qid) {
      setTextErr('Question ID is missing.');
      navigate('/home');
      return;
    }

    setQuestionID(qid);
  }, [qid, navigate]);

  /**
   * Function to post an answer to a question.
   * It validates the answer text and posts the answer if it is valid.
   */
  const postAnswer = async () => {
    let isValid = true;

    try {
      const res = await getQuestionById(questionID, user.username);
      if (res.forumId) {
        const forum = await getForumById(res.forumId);
        if (forum.bannedMembers.includes(user.username)) {
          setTextErr(`You cannot answer ${forum.name} questions as you have been banned.`);
          isValid = false;
        }
        if (forum.type === 'private') {
          if (!forum.members.includes(user.username)) {
            setTextErr(`Join the private forum ${forum.name} to gain permissions.`);
            isValid = false;
          }
        }
      }
    } catch (error) {
      // console.error('');
    }

    if (!text) {
      setTextErr('Answer text cannot be empty');
      isValid = false;
    }

    // Hyperlink validation
    if (!validateHyperlink(text)) {
      setTextErr('Invalid hyperlink format.');
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    const answer: Answer = {
      text,
      ansBy: user.username,
      ansDateTime: new Date(),
      comments: [],
    };

    const res = await addAnswer(questionID, answer);

    // Update streak and activity log
    const userRes = await updateStreak(user.username, answer.ansDateTime, 'answers');
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

    if (res && res._id) {
      // navigate to the question that was answered
      navigate(`/question/${questionID}`);
    }
  };

  return {
    text,
    textErr,
    setText,
    postAnswer,
  };
};

export default useAnswerForm;
