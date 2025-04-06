import express, { Request, Response, Router } from 'express';
import validate from 'deep-email-validator';
import {
  UserRequest,
  User,
  UserCredentials,
  UserByUsernameRequest,
  FakeSOSocket,
  UpdateBiographyRequest,
  UpdateEmailRequest,
  AddOrDeleteEmailRequest,
  AddBadgesRequest,
  AddBadgeRequest,
  AddBannerRequest,
  AddSelectedBannerRequest,
  SubscribeToNotification,
  UserResponse,
  ChangeFreqRequest,
  Notification,
  UpdateStreakRequest,
  MuteUserNotif,
} from '../types/types';
import {
  deleteUserByUsername,
  getUserByUsername,
  getUsersList,
  loginUser,
  saveUser,
  updateUser,
} from '../services/user.service';
import {
  getQuestionsByOrder,
  filterQuestionsByAskedBy,
  getUpvotesAndDownVotesBy,
} from '../services/question.service';
import { getAllAnswers } from '../services/answer.service';
import { saveNotification } from '../services/notification.service';
import { populateDocument } from '../utils/database.util';

const userController = (socket: FakeSOSocket) => {
  const router: Router = express.Router();

  /**
   * Validates that the request body contains all required fields for a user.
   * @param req The incoming request containing user data.
   * @returns `true` if the body contains valid user fields; otherwise, `false`.
   */
  const isUserBodyValid = (req: UserRequest): boolean =>
    req.body !== undefined &&
    req.body.username !== undefined &&
    req.body.username !== '' &&
    req.body.password !== undefined &&
    req.body.password !== '';

  /**
   * Validates that the request body contains all required fields to update a biography.
   * @param req The incoming request containing user data.
   * @returns `true` if the body contains valid user fields; otherwise, `false`.
   */
  const isUpdateBiographyBodyValid = (req: UpdateBiographyRequest): boolean =>
    req.body !== undefined &&
    req.body.username !== undefined &&
    req.body.username.trim() !== '' &&
    req.body.biography !== undefined;

  /**
   * Validates that the request body contains all required fields to add or replace an email.
   * @param req The incoming request containing user data.
   * @returns `true` if the body contains valid user fields; otherwise, `false`.
   */
  const isAddDeleteOrUpdateEmailBodyValid = (
    req: AddOrDeleteEmailRequest | UpdateEmailRequest,
  ): boolean =>
    req.body !== undefined &&
    req.body.username !== undefined &&
    req.body.username.trim() !== '' &&
    req.body.email !== undefined &&
    req.body.email.trim() !== '';

  const isMuteNotifBodyValid = (req: MuteUserNotif): boolean =>
    req.body !== undefined && req.body.username !== undefined && req.body.username.trim() !== '';
  /**
   * Uses regex testing to determine whether an email is valid or not (does it contain letters, numbers and specific symbols
   * and does it have an @ symbol and ends with a . something)?
   * @param em The email to validate
   * @returns `true` if the email is valid; otherwise, `false`.
   */
  const isEmailValid = (em: string): boolean => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(em);
  };

  /**
   * Validates that the request body contains all required fields to change a subscription.
   * @param req The incoming request containing user data. d
   * @returns `true` if the body contains valid user fields; otherwise, `false`cd.
   */
  const isChangeSubscriptionBodyValid = (req: SubscribeToNotification): boolean =>
    req.body !== undefined &&
    req.body.username !== undefined &&
    req.body.username.trim() !== '' &&
    req.body.notifType !== undefined;

  /**
   * Validates that the request body contains all required fields to change the frequency of a subscription.
   * @param req The incoming request containing user data.
   * @returns 'true' if the body contains valid user fields; otherwise, 'false`.
   */
  const isChangeFreqBodyValid = (req: ChangeFreqRequest): boolean =>
    req.body !== undefined &&
    req.body.username !== undefined &&
    req.body.username.trim() !== '' &&
    req.body.emailFreq !== undefined;

  const isAddPinnedBadgeRequestValid = (req: AddBadgeRequest): boolean =>
    req.body !== undefined && req.body.username !== undefined && req.body.pinnedBadge !== undefined;

  const areDatesSequential = (dates: Date[]): boolean => {
    if (dates.length <= 1) {
      return true;
    }

    for (let i = 1; i < dates.length; i++) {
      const prevDate = dates[i - 1];
      const curDate = dates[i];
      const expectedDate = new Date(prevDate);
      expectedDate.setDate(prevDate.getDate() + 1);

      if (curDate.getTime() !== expectedDate.getTime()) {
        return false;
      }
    }

    return true;
  };

  /**
   * Handles the creation of a new user account.
   * @param req The request containing username, email, and password in the body.
   * @param res The response, either returning the created user or an error.
   * @returns A promise resolving to void.
   */
  const createUser = async (req: UserRequest, res: Response): Promise<void> => {
    if (!isUserBodyValid(req)) {
      res.status(400).send('Invalid user body');
      return;
    }

    const requestUser = req.body;

    const user: User = {
      ...requestUser,
      dateJoined: new Date(),
      biography: requestUser.biography ?? '',
      emails: requestUser.emails ?? [],
      badges: [],
      banners: [],
      browserNotif: false,
      emailNotif: false,
      questionsAsked: [],
      answersGiven: [],
      numUpvotesDownvotes: 0,
    };

    try {
      const result = await saveUser(user);

      if ('error' in result) {
        throw new Error(result.error);
      }

      socket.emit('userUpdate', {
        user: result,
        type: 'created',
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when saving user: ${error}`);
    }
  };

  /**
   * Handles user login by validating credentials.
   * @param req The request containing username and password in the body.
   * @param res The response, either returning the user or an error.
   * @returns A promise resolving to void.
   */
  const userLogin = async (req: UserRequest, res: Response): Promise<void> => {
    try {
      if (!isUserBodyValid(req)) {
        res.status(400).send('Invalid user body');
        return;
      }

      const loginCredentials: UserCredentials = {
        username: req.body.username,
        password: req.body.password,
      };

      const user = await loginUser(loginCredentials);

      if ('error' in user) {
        throw Error(user.error);
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).send('Login failed');
    }
  };

  /**
   * Retrieves a user by their username.
   * @param req The request containing the username as a route parameter.
   * @param res The response, either returning the user or an error.
   * @returns A promise resolving to void.
   */
  const getUser = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      const user = await getUserByUsername(username);

      if ('error' in user) {
        throw Error(user.error);
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).send(`Error when getting user by username: ${error}`);
    }
  };

  /**
   * Retrieves all users from the database.
   * @param res The response, either returning the users or an error.
   * @returns A promise resolving to void.
   */
  const getUsers = async (_: Request, res: Response): Promise<void> => {
    try {
      const users = await getUsersList();

      if ('error' in users) {
        throw Error(users.error);
      }

      res.status(200).json(users);
    } catch (error) {
      res.status(500).send(`Error when getting users: ${error}`);
    }
  };

  /**
   * Deletes a user by their username.
   * @param req The request containing the username as a route parameter.
   * @param res The response, either confirming deletion or returning an error.
   * @returns A promise resolving to void.
   */
  const deleteUser = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      const deletedUser = await deleteUserByUsername(username);

      if ('error' in deletedUser) {
        throw Error(deletedUser.error);
      }

      socket.emit('userUpdate', {
        user: deletedUser,
        type: 'deleted',
      });
      res.status(200).json(deletedUser);
    } catch (error) {
      res.status(500).send(`Error when deleting user by username: ${error}`);
    }
  };

  /**
   * Resets a user's password.
   * @param req The request containing the username and new password in the body.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const resetPassword = async (req: UserRequest, res: Response): Promise<void> => {
    try {
      if (!isUserBodyValid(req)) {
        res.status(400).send('Invalid user body');
        return;
      }

      const updatedUser = await updateUser(req.body.username, { password: req.body.password });

      if ('error' in updatedUser) {
        throw Error(updatedUser.error);
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when updating user password: ${error}`);
    }
  };

  /**
   * Updates a user's biography.
   * @param req The request containing the username and biography in the body.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const updateBiography = async (req: UpdateBiographyRequest, res: Response): Promise<void> => {
    try {
      if (!isUpdateBiographyBodyValid(req)) {
        res.status(400).send('Invalid user body');
        return;
      }

      // Validate that request has username and biography
      const { username, biography } = req.body;

      // Call the same updateUser(...) service used by resetPassword
      const updatedUser = await updateUser(username, { biography });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      // Emit socket event for real-time updates
      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when updating user biography: ${error}`);
    }
  };

  /**
   * Adds an emal to a user's account
   * @param req The request containing the username and the email to add.
   * @param res The response, either confirming the addition or returning an error.
   * @returns A promise resolving to void
   */
  const addEmail = async (req: AddOrDeleteEmailRequest, res: Response): Promise<void> => {
    try {
      // Check that the given request is valid
      if (!isAddDeleteOrUpdateEmailBodyValid(req)) {
        res.status(400).send('Invalid user body');
        return;
      }

      const { username, email } = req.body;

      const validateEmail = await isEmailValid(email);

      if (!validateEmail) {
        res.status(400).send(`Invalid email`);
        return;
      }

      const foundUser = await getUserByUsername(username);
      if ('error' in foundUser) {
        throw Error(foundUser.error);
      }

      const userEmails = foundUser.emails;

      if (userEmails.includes(email)) {
        res.status(400).send('Email already associated with this user');
        return;
      }

      userEmails.push(email);

      const updatedUser = await updateUser(username, { emails: userEmails });
      if ('error' in updatedUser) {
        throw Error(updatedUser.error);
      }

      // Emit socket event for real-time updates
      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when adding user email: ${error}`);
    }
  };

  /**
   * Replaces an existing email on a user's account with a new email
   * @param req The request containing the username, the email to add, and the email to replace
   * @param res The response, either confirming the replacement or returning an error.
   * @returns A promise resolving to void
   */
  const replaceEmail = async (req: UpdateEmailRequest, res: Response): Promise<void> => {
    try {
      // Check that the given request is valid
      if (!isAddDeleteOrUpdateEmailBodyValid(req)) {
        res.status(400).send('Invalid user body');
        return;
      }

      const { username, email } = req.body;
      const { currEmail } = req.params;

      const validateEmail = await validate(email);

      if (!validateEmail.valid) {
        res.status(400).send('Invalid email');
        return;
      }

      const foundUser = await getUserByUsername(username);
      if ('error' in foundUser) {
        throw Error(foundUser.error);
      }

      const userEmails = foundUser.emails;
      if (userEmails.includes(currEmail) === false) {
        res.status(400).send('Provided email is not associated with user');
        return;
      }

      if (userEmails.includes(email)) {
        res.status(400).send('Email already associated with this user');
        return;
      }

      const currEmailIndx = userEmails.indexOf(currEmail);
      userEmails[currEmailIndx] = email;

      const updatedUser = await updateUser(username, { emails: userEmails });
      if ('error' in updatedUser) {
        throw Error(updatedUser.error);
      }

      // Emit socket event for real-time updates
      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when replacing user email: ${error}`);
    }
  };

  /**
   * Adds a badge to the user's account
   * @param req The request containing the username and the badge to add
   * @param res The response, either confirming the new badge or an error.
   * @returns A promise resolving to void.
   */
  const addBadges = async (req: AddBadgesRequest, res: Response): Promise<void> => {
    try {
      const { username, badges } = req.body;

      const foundUser = await getUserByUsername(username);
      if ('error' in foundUser) {
        throw Error(foundUser.error);
      }

      const userBadges = foundUser.badges;
      if (badges.some(badge => userBadges.includes(badge))) {
        res.status(400).send('Badge(s) already associated with this user');
        return;
      }

      userBadges.push(...badges);

      const updatedUser = await updateUser(username, { badges: userBadges });
      if ('error' in updatedUser) {
        throw Error(updatedUser.error);
      }

      // Emit socket event for real-time updates
      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      badges.forEach(async badge => {
        const newNotif: Notification = {
          title: 'New Badge Added',
          text: `You have received a new badge: ${badge}`,
          type: 'browser',
          user: updatedUser,
          read: false,
        };

        const createdNotif = await saveNotification(newNotif);
        if ('error' in createdNotif) {
          throw new Error(createdNotif.error);
        }

        const populatedNotification = await populateDocument(
          createdNotif._id.toString(),
          'notification',
        );

        if ('error' in populatedNotification) {
          throw new Error(populatedNotification.error);
        }

        socket.emit('notificationUpdate', {
          notification: populatedNotification,
          type: 'created',
        });
      });
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when adding user badge: ${error}`);
    }
  };

  /**
   * Adds a pinned badge to a user
   * @param req The request containing the username and the badge the user would like pinned
   * @param res The response containing either the user or an error
   * @returns A promise resolving to void.
   */
  const addPinnedBadge = async (req: AddBadgeRequest, res: Response): Promise<void> => {
    try {
      const { username, pinnedBadge } = req.body;

      if (!isAddPinnedBadgeRequestValid(req)) {
        res.status(400).send(`invalid body`);
      }

      if (!pinnedBadge) {
        res.status(400).send(`Error when adding a pinned badge: ${pinnedBadge}`);
      }

      const foundUser = await getUserByUsername(username);
      if ('error' in foundUser) {
        throw Error(foundUser.error);
      }

      const updatedUser = await updateUser(username, { pinnedBadge });
      if ('error' in updatedUser) {
        throw Error(updatedUser.error);
      }

      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when adding a pinned badge: ${error}`);
    }
  };

  const addBanners = async (req: AddBannerRequest, res: Response): Promise<void> => {
    try {
      const { username, banners } = req.body;

      if (!Array.isArray(banners) || banners.length === 0) {
        res.status(400).send(`Invalid banner data: ${banners}`);
        return;
      }

      const foundUser = await getUserByUsername(username);
      if ('error' in foundUser) {
        throw Error(foundUser.error);
      }

      const userBanners = foundUser.banners ?? [];
      if (userBanners.length !== 0 && banners.some(banner1 => userBanners.includes(banner1))) {
        res.status(400).send('Banner(s) already associated with this user');
        return;
      }

      userBanners.push(...banners);

      const updatedUser = await updateUser(username, { banners: userBanners });
      if ('error' in updatedUser) {
        throw Error(updatedUser.error);
      }

      // Emit socket event for real-time updates
      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when adding user banner: ${error}`);
    }
  };

  const addSelectedBanner = async (req: AddSelectedBannerRequest, res: Response): Promise<void> => {
    try {
      const { username, banner } = req.body;

      const foundUser = await getUserByUsername(username);
      if ('error' in foundUser) {
        throw Error(foundUser.error);
      }

      const updatedUser = await updateUser(username, { selectedBanner: banner });
      if ('error' in updatedUser) {
        throw Error(updatedUser.error);
      }

      // Emit socket event for real-time updates
      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when adding selected banner: ${error}`);
    }
  };

  /**
   * Subscribes/unsubscribe a user to notifications
   * @param req The request containing the username and the notification type
   * @param res The response, either confirming the subscription or an error.
   * @returns A promise resolving to void.
   */
  const changeNotifSubscription = async (
    req: SubscribeToNotification,
    res: Response,
  ): Promise<void> => {
    try {
      if (!isChangeSubscriptionBodyValid(req)) {
        res.status(400).send(`Invalid user body`);
        return;
      }

      const { username } = req.body;
      const { notifType } = req.body;
      const { emailFrequency } = req.body;

      const foundUser = await getUserByUsername(username);
      if ('error' in foundUser) {
        throw Error(foundUser.error);
      }

      let updatedUser: UserResponse;
      if (notifType === 'browser') {
        updatedUser = await updateUser(username, { browserNotif: !foundUser.browserNotif });
      } else {
        updatedUser = await updateUser(username, {
          emailNotif: !foundUser.emailNotif,
          emailFrequency,
        });
      }

      if ('error' in updatedUser) {
        throw Error(updatedUser.error);
      }

      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when changing subscription to notification: ${error}`);
    }
  };

  /**
   * Gets a list of all questions asked by the user
   * @param req The request containing the username
   * @param res The response, either providing a list of questions or an error.
   * @returns A promise resolving to void.
   */
  const getQuestionsAsked = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      const foundUser = await getUserByUsername(username);
      if ('error' in foundUser) {
        throw Error(foundUser.error);
      }

      const allQuestions = await getQuestionsByOrder('newest');
      const userQuestions = await filterQuestionsByAskedBy(allQuestions, username);
      res.status(200).send(userQuestions);
    } catch (error) {
      res.status(500).send(`Error when getting questions asked: ${error}`);
    }
  };

  /**
   * Gets a list of all the answers given by the user
   * @param req The request containing the username
   * @param res The response, either providing a list of answers or an error
   * @returns A promise resolving to void.
   */
  const getAnswersGiven = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      const foundUser = await getUserByUsername(username);
      if ('error' in foundUser) {
        throw Error(foundUser.error);
      }

      const allAnswers = await getAllAnswers();
      const userAnswers = allAnswers.filter(a => a.ansBy === username);
      res.status(200).send(userAnswers);
    } catch (error) {
      res.status(500).send(`Error when getting answers given: ${error}`);
    }
  };

  /**
   * Gets the count of all votes (up and down votes) made by the user
   * @param req The request containing the username
   * @param res The response, either providing a count of votes or an error
   * @returns A promise resolving to void.
   */
  const getUpvotesAndDownVotes = async (
    req: UserByUsernameRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const { username } = req.params;

      const foundUser = await getUserByUsername(username);
      if ('error' in foundUser) {
        throw Error(foundUser.error);
      }

      const upAndDownVoteCount = await getUpvotesAndDownVotesBy(username);
      res.status(200).send(upAndDownVoteCount);
    } catch (error) {
      res.status(500).send(`Error when getting number of up and down votes: ${error}`);
    }
  };

  /**
   * Changes the frequency of a user's email notifications.
   * @param req The request containing the username and the frequency
   * @param res The response, either providing the updated user or an error
   */
  const changeFrequency = async (req: ChangeFreqRequest, res: Response): Promise<void> => {
    try {
      if (!isChangeFreqBodyValid(req)) {
        res.status(400).send('Invalid user body');
        return;
      }

      const { username, emailFreq } = req.body;

      const foundUser = await getUserByUsername(username);
      if ('error' in foundUser) {
        throw Error(foundUser.error);
      }

      const updatedUser = await updateUser(username, { emailFrequency: emailFreq });

      if ('error' in updatedUser) {
        throw Error(updatedUser.error);
      }

      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error changing the frequency: ${error}`);
    }
  };

  const updateUserStreak = async (req: UpdateStreakRequest, res: Response): Promise<void> => {
    try {
      const { username, date } = req.body;

      const foundUser = await getUserByUsername(username);
      if ('error' in foundUser) {
        throw Error(foundUser.error);
      }

      // if the user doesnt have an activty log give it an empty one
      if (!foundUser.activityLog) {
        foundUser.activityLog = [];
      }

      // if the user doesnt have a streak update the streak with the date
      if (!foundUser.streak || foundUser.streak.length === 0) {
        // if the user doesnt already have this date in its activity log add it to its activity log
        if (!foundUser.activityLog.includes(date)) {
          foundUser.activityLog.push(date);
        }
        foundUser.streak = [date];
      }
      // if the user does have a streak
      else {
        // if this date is not already in its activity log add it
        if (!foundUser.activityLog.includes(date)) {
          foundUser.activityLog.push(date);
        }
        // if the user streak does not include this date push the date onto its streak
        if (!foundUser.streak.includes(date)) {
          foundUser.streak.push(date);
          // if the dates are not sequential reset the streak to just this date
          if (!areDatesSequential(foundUser.streak)) {
            foundUser.streak = [date];
          }
        }
      }

      const updatedUser = await updateUser(username, {
        streak: foundUser.streak,
        activityLog: foundUser.activityLog,
      });

      if ('error' in updatedUser) {
        throw Error(updatedUser.error);
      }

      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error updating user streak: ${error}`);
    }
  };

  /**
   * Deletes an emal from a user's account
   * @param req The request containing the username and the email to remove.
   * @param res The response, either confirming the removal or returning an error.
   * @returns A promise resolving to void
   */
  const deleteEmail = async (req: AddOrDeleteEmailRequest, res: Response): Promise<void> => {
    try {
      // Check that the given request is valid
      if (!isAddDeleteOrUpdateEmailBodyValid(req)) {
        res.status(400).send('Invalid user body');
        return;
      }
      
      const { username, email } = req.body;

      const foundUser = await getUserByUsername(username);
      if ('error' in foundUser) {
        throw Error(foundUser.error);
      }
      
      const userEmails = foundUser.emails;

      if (!userEmails.includes(email)) {
        res.status(400).send('Email not associated with this user');
        return;
      }

      const updatedEmails = userEmails.filter(em => em !== email);

      const updatedUser = await updateUser(username, { emails: updatedEmails });
      
      if ('error' in updatedUser) {
        throw Error(updatedUser.error);
      }

      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when adding user email: ${error}`);
    }
  };
  
   * Mutes a user's notifications for an hour.
   * @param req The request containing the username
   * @param res The response, either providing the updated user or an error
   */
  const muteNotifications = async (req: MuteUserNotif, res: Response): Promise<void> => {
    try {
      if (!isMuteNotifBodyValid(req)) {
        res.status(400).send('Email not associated with this user');
        return;
      }
      
      const { username } = req.body;
      
      const foundUser = await getUserByUsername(username);
      if ('error' in foundUser) {
        throw Error(foundUser.error);
      }
      
      let endMuteTime;
      if (!foundUser.mutedTime || (foundUser.mutedTime && new Date() > foundUser.mutedTime)) {
        // User is choosing to mute
        endMuteTime = new Date(Date.now() + 60 * 60 * 1000);
      } else {
        endMuteTime = new Date('December 17, 1995 03:24:00');
      }

      const updatedUser = await updateUser(username, {
        mutedTime: endMuteTime,
      });
      
      if ('error' in updatedUser) {
        throw Error(updatedUser.error);
      }
      
      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error changing the frequency: ${error}`);
    }
  };


  // Define routes for the user-related operations.
  router.post('/signup', createUser);
  router.post('/login', userLogin);
  router.patch('/resetPassword', resetPassword);
  router.get('/getUser/:username', getUser);
  router.get('/getUsers', getUsers);
  router.delete('/deleteUser/:username', deleteUser);
  router.patch('/updateBiography', updateBiography);
  router.patch('/:currEmail/replaceEmail', replaceEmail);
  router.post('/addEmail', addEmail);
  router.post('/addBadges', addBadges);
  router.post('/addPinnedBadge', addPinnedBadge);
  router.post('/addBanners', addBanners);
  router.post('/addSelectedBanner', addSelectedBanner);
  router.patch('/changeSubscription', changeNotifSubscription);
  router.get('/getQuestionsAsked', getQuestionsAsked);
  router.get('/getAnswersGiven', getAnswersGiven);
  router.get('/getVoteCount', getUpvotesAndDownVotes);
  router.patch('/changeFrequency', changeFrequency);
  router.patch('/updateStreak', updateUserStreak);
  router.patch('/deleteEmail', deleteEmail);
  router.patch('/muteNotification', muteNotifications);
  return router;
};

export default userController;
