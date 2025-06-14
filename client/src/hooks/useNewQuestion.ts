import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { validateHyperlink } from '../tool';
import { addQuestion } from '../services/questionService';
import useUserContext from './useUserContext';
import { Question } from '../types/types';
import {
  getQuestionsAsked,
  updateStreak,
  awardBadges,
  awardBanners,
} from '../services/userService';

/**
 * Custom hook to handle question submission and form validation
 *
 * @returns title - The current value of the title input.
 * @returns text - The current value of the text input.
 * @returns tagNames - The current value of the tags input.
 * @returns titleErr - Error message for the title field, if any.
 * @returns textErr - Error message for the text field, if any.
 * @returns tagErr - Error message for the tag field, if any.
 * @returns postQuestion - Function to validate the form and submit a new question.
 */
const useNewQuestion = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { fid } = useParams();
  const [title, setTitle] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [tagNames, setTagNames] = useState<string>('');

  const [titleErr, setTitleErr] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [tagErr, setTagErr] = useState<string>('');

  /**
   * Function to validate the form before submitting the question.
   *
   * @returns boolean - True if the form is valid, false otherwise.
   */
  const validateForm = (): boolean => {
    let isValid = true;

    if (!title) {
      setTitleErr('Title cannot be empty');
      isValid = false;
    } else if (title.length > 100) {
      setTitleErr('Title cannot be more than 100 characters');
      isValid = false;
    } else {
      setTitleErr('');
    }

    if (!text) {
      setTextErr('Question text cannot be empty');
      isValid = false;
    } else if (!validateHyperlink(text)) {
      setTextErr('Invalid hyperlink format.');
      isValid = false;
    } else {
      setTextErr('');
    }

    const tagnames = tagNames.split(' ').filter(tagName => tagName.trim() !== '');
    if (tagnames.length === 0) {
      setTagErr('Should have at least 1 tag');
      isValid = false;
    } else if (tagnames.length > 5) {
      setTagErr('Cannot have more than 5 tags');
      isValid = false;
    } else {
      setTagErr('');
    }

    for (const tagName of tagnames) {
      if (tagName.length > 20) {
        setTagErr('New tag length cannot be more than 20');
        isValid = false;
        break;
      }
    }

    return isValid;
  };

  /**
   * Function to post a question to the server.
   *
   * @returns title - The current value of the title input.
   */
  const postQuestion = async () => {
    if (!validateForm()) return;

    const tagnames = tagNames.split(' ').filter(tagName => tagName.trim() !== '');
    const tags = tagnames.map(tagName => ({
      name: tagName,
      description: 'user added tag',
    }));

    const question: Question = {
      title,
      text,
      tags,
      askedBy: user.username,
      askDateTime: new Date(),
      answers: [],
      upVotes: [],
      downVotes: [],
      views: [],
      comments: [],
    };

    let res;
    if (!fid) {
      res = await addQuestion(question);
    } else {
      res = await addQuestion(question, fid);
    }

    // Update user streak and activity log
    const userRes = await updateStreak(user.username, question.askDateTime, 'questions');
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
    }

    // Award badges if the user has 1 question
    const questionRes = await getQuestionsAsked(user.username);

    if (questionRes.length >= 1 && !user.badges.includes('/badge_images/First_Post_Badge.png')) {
      const updatedUser = await awardBadges(user.username, ['/badge_images/First_Post_Badge.png']);
      user.badges = updatedUser.badges;
      const bannersUpdatedUser = await awardBanners(user.username, ['lightblue']);
      user.banners = bannersUpdatedUser.banners;
    }

    if (questionRes.length >= 10 && !user.badges.includes('/badge_images/Ten_Posts_Badge.png')) {
      const updatedUser = await awardBadges(user.username, ['/badge_images/Ten_Posts_Badge.png']);
      user.badges = updatedUser.badges;
      const bannersUpdatedUser = await awardBanners(user.username, ['lightgreen']);
      user.banners = bannersUpdatedUser.banners;
    }

    if (res && res._id && !fid) {
      navigate('/home');
    } else if (res && res._id && fid) {
      navigate(`/forum/${fid}`);
    }
  };

  return {
    title,
    setTitle,
    text,
    setText,
    tagNames,
    setTagNames,
    titleErr,
    textErr,
    tagErr,
    postQuestion,
  };
};

export default useNewQuestion;
