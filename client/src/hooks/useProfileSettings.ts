import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '../services/userService';
import { SafeDatabaseUser, SubscriptionType } from '../types/types';
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
  const handleSubscription = async (type: SubscriptionType) => {
    if (!username) return;
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
      } else if (
        userData?.questionsAsked &&
        userData?.questionsAsked?.length > 0 &&
        !userData.badges.includes('/badge_images/First_Post_Badge.png')
      ) {
        badges.push('/badge_images/First_Post_Badge.png');
      }
      if (userData && !userData.badges.includes('/badge_images/First_Post_Badge.png')) {
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

  const handleRefresh = async () => {
    handleAwardBadges();
    handleAwardBanners();
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
  };
};

export default useProfileSettings;
