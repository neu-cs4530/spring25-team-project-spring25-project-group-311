import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactCalendarHeatmap from 'react-calendar-heatmap';
import {
  getUserByUsername,
  deleteUser,
  resetPassword,
  updateBiography,
  addEmail,
  replaceEmail,
  subscribeNotifs,
  awardBadges,
  awardBanners,
  newActiveBanner,
  addPinnedBadge,
  changeFreq,
  deleteEmail,
  muteNotifictions,
  removePinnedBadge,
} from '../services/userService';
import { SafeDatabaseUser } from '../types/types';
import useUserContext from './useUserContext';

/**
 * A custom hook to encapsulate all logic/state for the ProfileSettings component.
 */
const useProfileSettings = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useUserContext();

  // Local state
  const [userData, setUserData] = useState<SafeDatabaseUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [editBioMode, setEditBioMode] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [replaceEmailMode, setReplaceEmailMode] = useState(false);
  const [addEmailMode, setAddEmailMode] = useState(false);
  const [emailToReplace, setEmailToReplace] = useState('');
  const [replacementEmail, setReplacementEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [floatingContent, setFloatingContent] = useState({
    content: '',
    x: 0,
    y: 0,
    visible: false,
  });

  // For delete-user confirmation modal
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const canEditProfile =
    currentUser.username && userData?.username ? currentUser.username === userData.username : false;

  useEffect(() => {
    if (!username) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await getUserByUsername(username);
        setUserData(data);
      } catch (error) {
        setErrorMessage('Error fetching user profile');
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  /**
   * Toggles the visibility of the password fields.
   */
  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

  /**
   * Validate the password fields before attempting to reset.
   */
  const validatePasswords = () => {
    if (newPassword.trim() === '' || confirmNewPassword.trim() === '') {
      setErrorMessage('Please enter and confirm your new password.');
      return false;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return false;
    }
    return true;
  };

  /**
   * Handler for resetting the password
   */
  const handleResetPassword = async () => {
    if (!username) return;
    if (!validatePasswords()) {
      return;
    }
    try {
      await resetPassword(username, newPassword);
      setSuccessMessage('Password reset successful!');
      setErrorMessage(null);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      setErrorMessage('Failed to reset password.');
      setSuccessMessage(null);
    }
  };

  const handleNewSelectedBanner = async (banner: string) => {
    if (!username) return;
    try {
      const updatedUser = await newActiveBanner(username, banner);
      await new Promise(resolve => {
        setUserData(updatedUser);
        resolve(null);
      });
      setSuccessMessage('Banner updated!');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to update banner.');
      setSuccessMessage(null);
    }
  };

  const handleUpdateBiography = async () => {
    if (!username) return;
    try {
      // Await the async call to update the biography
      const updatedUser = await updateBiography(username, newBio);

      // Ensure state updates occur sequentially after the API call completes
      await new Promise(resolve => {
        setUserData(updatedUser); // Update the user data
        setEditBioMode(false); // Exit edit mode
        resolve(null); // Resolve the promise
      });

      setSuccessMessage('Biography updated!');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to update biography.');
      setSuccessMessage(null);
    }
  };

  /**
   * Handler for adding an email.
   */
  const handleAddEmail = async () => {
    if (!username) return;
    try {
      // Await the async call to add the email
      const updatedUser = await addEmail(username, newEmail);
      // Ensure state updates occur sequentially after the API call completes
      await new Promise(resolve => {
        setUserData(updatedUser); // Update the user data
        setAddEmailMode(false); // Exit edit mode
        resolve(null); // Resolve the promise
      });

      setSuccessMessage('Email added!');
      setNewEmail('');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to add email.');
      setSuccessMessage(null);
    }
  };

  /**
   * Handler for replacing an email.
   */
  const handleReplaceEmail = async () => {
    if (!username) return;
    try {
      // Await the async call to add the email
      const updatedUser = await replaceEmail(username, emailToReplace, replacementEmail);
      // Ensure state updates occur sequentially after the API call completes
      await new Promise(resolve => {
        setUserData(updatedUser); // Update the user data
        setReplaceEmailMode(false); // Exit edit mode
        resolve(null); // Resolve the promise
      });

      setSuccessMessage('Email replaced!');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to replace email.');
      setSuccessMessage(null);
    }
  };

  /**
   * Handler for setting the subscription
   */
  const handleSubscription = async (type: string) => {
    if (!username) return;
    if (type !== 'browser' && type !== 'email') return;
    try {
      // Await the async call to subscribe to notification
      const subscribedUser = await subscribeNotifs(username, type);
      await new Promise(resolve => {
        setUserData(subscribedUser); // Update the user data
        resolve(null); // Resolve the promise
      });

      setSuccessMessage('Subscription changed!');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to change subscription.');
      setSuccessMessage(null);
    }
  };

  /**
   * Handler for changing the frequency of email notification.
   */
  const handleChangeFrequency = async (frequency: string) => {
    if (!username) return;
    if (frequency !== 'weekly' && frequency !== 'hourly' && frequency !== 'daily') return;

    try {
      const updatedUser = await changeFreq(username, frequency);
      await new Promise(resolve => {
        setUserData(updatedUser); // Update the user data
        resolve(null); // Resolve the promise
      });

      setSuccessMessage('Subscription changed!');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to change subscription.');
      setSuccessMessage(null);
    }
  };

  /**
   * Handler for muting notifications.
   */
  const handleMuteNotifications = async () => {
    if (!username) return;
    try {
      const updatedUser = await muteNotifictions(username);
      await new Promise(resolve => {
        setUserData(updatedUser); // Update the user data
        resolve(null); // Resolve the promise
      });

      setSuccessMessage('Subscription changed!');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to change subscription.');
      setSuccessMessage(null);
    }
  };

  const handleAwardBadges = async () => {
    if (!username) return;
    try {
      const badges = [];
      if (
        userData?.answersGiven &&
        userData?.answersGiven?.length >= 100 &&
        !userData.badges.includes('/badge_images/One_Hundred_Comments_Badge.png')
      ) {
        badges.push('/badge_images/One_Hundred_Comments_Badge.png');
      }
      if (
        userData?.questionsAsked &&
        userData?.questionsAsked?.length > 0 &&
        !userData.badges.includes('/badge_images/First_Post_Badge.png')
      ) {
        badges.push('/badge_images/First_Post_Badge.png');
      }

      if (badges.length > 0) {
        const updatedUser = await awardBadges(username, badges);
        await new Promise(resolve => {
          setUserData(updatedUser);
          resolve(null);
        });
        setSuccessMessage('Badges awarded!');
        setErrorMessage(null);
      } else {
        setSuccessMessage('No badges to award.');
        setErrorMessage(null);
      }
    } catch (error) {
      setErrorMessage(`Failed to award badges: ${error}`);
      setSuccessMessage(null);
    }
  };

  const handleAwardBanners = async () => {
    if (!username) return;
    try {
      const banners = [];
      if (
        userData &&
        userData.badges.includes('/badge_images/First_Post_Badge.png') &&
        !userData.banners?.includes('lightblue')
      ) {
        banners.push('lightblue');
      }
      if (
        userData &&
        userData.badges.includes('/badge_images/One_Hundred_Comments_Badge.png') &&
        !userData.banners?.includes('lightgreen')
      ) {
        banners.push('lightgreen');
      }
      if (
        userData &&
        userData.badges.includes('/badge_images/Daily_Challenge_Badge.png') &&
        !userData.banners?.includes('lightyellow')
      ) {
        banners.push('lightyellow');
      }

      if (banners.length > 0) {
        const updatedUser = await awardBanners(username, banners);
        await new Promise(resolve => {
          setUserData(updatedUser);
          resolve(null);
        });
        setSuccessMessage(`Banners awarded! ${banners} added`);
        setErrorMessage(null);
      } else {
        setSuccessMessage('No banners to award.');
        setErrorMessage(null);
      }
    } catch (error) {
      setErrorMessage(`Failed to award banners: ${error}`);
      setSuccessMessage(null);
    }
  };

  const updateChallengeStatus = async (userToUpdate: string, updates: Record<string, boolean>) => {
    try {
      const response = await fetch(`/user/${userToUpdate}/challenges/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update challenge status');
      }

      const updatedUserData = await response.json();
      setUserData(updatedUserData); // Update local state
    } catch (error) {
      console.error('Error updating challenge status:', error);
    }
  };

  const verifyCommentChallenge = async () => {
    console.log('Running verifyCommentChallenge');
    console.log('userData', userData?.username);
    console.log('userData.activityLog', userData?.activityLog);
    if (!userData?.username || !userData.activityLog) return;

    const today = new Date().toISOString().split('T')[0]; // match db
    console.log('userData.activityLog', userData.activityLog);
    console.log('today', today);

    const activity = userData.activityLog?.[today];
    console.log('Activity today:', activity);
    const hasCommentedToday = (activity?.answers ?? 0) > 0 || (activity?.questions ?? 0) > 0;

    const hasCompleted = userData.challenges?.commentPosted ?? false;

    if (hasCommentedToday && !hasCompleted) {
      await updateChallengeStatus(userData.username, { commentPosted: true });
      console.log('Challenge completed: Posted a comment');
    } else {
      console.log('Challenge Error');
    }
  };

  const verifyUpvoteChallenge = async () => {
    if (!username || !userData) return;
    try {
      const badges = [];
      const hasThreeUpvotes = userData.numUpvotesDownvotes >= 3;
      const alreadyAwarded = userData.badges.includes('/badge_images/Three_Upvotes_Badge.png');
      if (hasThreeUpvotes && !alreadyAwarded) {
        badges.push('/badge_images/Three_Upvotes_Badge.png');
      }
      if (badges.length > 0) {
        const updatedUser = await awardBadges(username, badges);
        setUserData(updatedUser);
        setSuccessMessage('Upvote challenge completed!');
        setErrorMessage(null);
      }
    } catch (error) {
      setErrorMessage(`Failed to complete upvote challenge: ${error}`);
      setSuccessMessage(null);
    }
  };

  const handleRefresh = async () => {
    handleAwardBadges();
    handleAwardBanners();
    verifyCommentChallenge();
    verifyUpvoteChallenge();
  };

  const handleAddNewBanner = async (banner: string) => {
    if (!username) return;
    try {
      const updatedUser = await awardBanners(username, [banner]);
      await new Promise(resolve => {
        setUserData(updatedUser);
        resolve(null);
      });
    } catch (error) {
      setErrorMessage(`Failed to award banner: ${error}`);
      setSuccessMessage(null);
    }
  };

  /**
   * Handler for deleting the user (triggers confirmation modal)
   */
  const handleDeleteUser = () => {
    if (!username) return;
    setShowConfirmation(true);
    setPendingAction(() => async () => {
      try {
        await deleteUser(username);
        setSuccessMessage(`User "${username}" deleted successfully.`);
        setErrorMessage(null);
        navigate('/');
      } catch (error) {
        setErrorMessage('Failed to delete user.');
        setSuccessMessage(null);
      } finally {
        setShowConfirmation(false);
      }
    });
  };

  /**
   * Handles deleting an email.
   */
  const handleDeleteEmail = async (email: string) => {
    if (!username) return;
    try {
      const updatedUser = await deleteEmail(username, email);
      setSuccessMessage(`Email "${email}" deleted successfully.`);
      setErrorMessage(null);
      setUserData(updatedUser);
    } catch (error) {
      setErrorMessage('Failed to delete email.');
      setSuccessMessage(null);
    }
  };

  /**
   * handles the on click for pinning a badge to a user
   * @param badge string representing the location of the image
   * @returns an updated user with the pinned badge
   */
  const handleAddPinnedBadge = async (badge: string) => {
    if (!username) return;
    try {
      const updatedUser = await addPinnedBadge(username, badge);
      await new Promise(resolve => {
        setUserData(updatedUser);
        resolve(null);
      });
    } catch (error) {
      setErrorMessage('Failed to pin badge');
    }
  };

  /**
   * handles the on click for pinning a badge to a user
   * @param badge string representing the location of the image
   * @returns an updated user with the pinned badge
   */
  const handleRemovePinnedBadge = async (badge: string) => {
    if (!username) return;
    try {
      const updatedUser = await removePinnedBadge(username, badge);
      await new Promise(resolve => {
        setUserData(updatedUser);
        resolve(null);
      });
    } catch (error) {
      setErrorMessage('Failed to unpin badge');
    }
  };

  /**
   * Converts a users activity log to readable values for Heatmap Calendar
   * @param log the activity log of the user
   * @returns an array of objects with date and count
   */
  const convertActivityToValues = () => {
    if (!username) return [];
    try {
      const log: Record<string, { votes?: number; questions?: number; answers?: number }> =
        userData?.activityLog || {};
      const values: { date: string; count: number }[] = [];
      if (log) {
        for (const date in log) {
          if (Object.prototype.hasOwnProperty.call(log, date)) {
            const { votes, questions, answers } = log[date];
            const total = (votes ?? 0) + (questions ?? 0) + (answers ?? 0);

            values.push({ date, count: total });
          }
        }
      }
      return values;
    } catch (error) {
      setErrorMessage('Failed to convert activity to values');
      return [];
    }
  };

  /**
   * gets the color class for the heatmap calendar based on the number of contributions
   * @param count number representing the number of contributions
   * @returns a string representing the color class
   */
  const getColorClass = (count: number) => {
    if (count === 0) return 'color-empty';
    const level = Math.min(count, 4);
    return `color-scale-${level}`;
  };

  /**
   * handles the mouse over event for the heatmap calendar
   * @param event mouse event
   * @param value the value of the heatmap calendar
   */
  const handleMouseOver = (
    event: React.MouseEvent<SVGRectElement>,
    value: ReactCalendarHeatmap.ReactCalendarHeatmapValue<string> | undefined,
  ) => {
    if (value) {
      const contribution: { votes?: number; questions?: number; answers?: number } =
        userData?.activityLog?.[value.date] ?? {};
      let content = '';
      if (contribution) {
        const { votes = 0, questions = 0, answers = 0 } = contribution;
        content = `On ${value.date}: Votes: ${votes}, Questions: ${questions}, Answers: ${answers}`;
      } else {
        content = `No contributions on ${value.date}`;
      }
      setFloatingContent({
        content,
        x: event.clientX,
        y: event.clientY,
        visible: true,
      });
    }
  };

  /**
   * handles the mouse leave event for the heatmap calendar
   */
  const handleMouseLeave = () => {
    setFloatingContent(prev => ({
      ...prev,
      visible: false,
    }));
  };

  /**
   * handles the mouse move event for the heatmap calendar
   * @param event mouse event
   */
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement> | undefined) => {
    if (floatingContent.visible) {
      setFloatingContent(prev => ({
        ...prev,
        x: event?.clientX ?? 0,
        y: event?.clientY ?? 0,
      }));
    }
  };

  return {
    userData,
    newPassword,
    confirmNewPassword,
    setNewPassword,
    setConfirmNewPassword,
    loading,
    editBioMode,
    setEditBioMode,
    newBio,
    setNewBio,
    newEmail,
    setNewEmail,
    emailToReplace,
    setEmailToReplace,
    addEmailMode,
    setAddEmailMode,
    replacementEmail,
    setReplacementEmail,
    replaceEmailMode,
    setReplaceEmailMode,
    successMessage,
    errorMessage,
    showConfirmation,
    setShowConfirmation,
    pendingAction,
    setPendingAction,
    canEditProfile,
    showPassword,
    togglePasswordVisibility,
    handleResetPassword,
    handleUpdateBiography,
    handleDeleteUser,
    handleAddEmail,
    handleReplaceEmail,
    handleSubscription,
    handleAwardBadges,
    handleRefresh,
    handleAwardBanners,
    handleNewSelectedBanner,
    handleChangeFrequency,
    handleAddNewBanner,
    handleAddPinnedBadge,
    convertActivityToValues,
    getColorClass,
    handleMouseOver,
    handleMouseLeave,
    handleMouseMove,
    floatingContent,
    handleDeleteEmail,
    handleMuteNotifications,
    verifyCommentChallenge,
    verifyUpvoteChallenge,
    updateChallengeStatus,
    handleRemovePinnedBadge,
  };
};

export default useProfileSettings;
