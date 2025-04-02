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
  AddEmailRequest,
  AddBadgesRequest,
  AddBadgeRequest,
  AddBannerRequest,
  AddSelectedBannerRequest,
  SubscribeToNotification,
  UserResponse,
  SendEmailNotif,
  ChangeFreqRequest,
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
import { getTopFivePosts, getUserForums } from '../services/forum.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const schedule = require('node-schedule');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodemailer = require('nodemailer');

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
  const isAddOrUpdateEmailBodyValid = (req: AddEmailRequest | UpdateEmailRequest): boolean =>
    req.body !== undefined &&
    req.body.username !== undefined &&
    req.body.username.trim() !== '' &&
    req.body.newEmail !== undefined &&
    req.body.newEmail.trim() !== '';

  /**
   * Validates that the request body contains all required fields to change a subscription.
   * @param req The incoming request containing user data.
   * @returns `true` if the body contains valid user fields; otherwise, `false`.
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
    req.body.frequency !== undefined;

  /**
   * Validates that the request body contains all required fields to send the email to the user.
   * @param req The incoming request containing user data.
   * @returns 'true' if the body contains valid user fields; otherwise, 'false`.
   */
  const isSendEmailNotifBodyValid = (req: SendEmailNotif): boolean =>
    req.body !== undefined && req.body.username !== undefined && req.body.username.trim() !== '';
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
  const addEmail = async (req: AddEmailRequest, res: Response): Promise<void> => {
    try {
      // Check that the given request is valid
      if (!isAddOrUpdateEmailBodyValid(req)) {
        res.status(400).send('Invalid user body');
        return;
      }

      const { username, newEmail } = req.body;

      const validateEmail = await validate(newEmail);

      if (!validateEmail.valid) {
        res.status(400).send('Invalid email');
        return;
      }

      const foundUser = await getUserByUsername(username);
      if ('error' in foundUser) {
        throw Error(foundUser.error);
      }

      const userEmails = foundUser.emails;

      if (userEmails.includes(newEmail)) {
        res.status(400).send('Email already associated with this user');
        return;
      }

      userEmails.push(newEmail);

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
      if (!isAddOrUpdateEmailBodyValid(req)) {
        res.status(400).send('Invalid user body');
        return;
      }

      const { username, newEmail } = req.body;
      const { currEmail } = req.params;

      const validateEmail = await validate(newEmail);

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

      if (userEmails.includes(newEmail)) {
        res.status(400).send('Email already associated with this user');
        return;
      }

      const currEmailIndx = userEmails.indexOf(currEmail);
      userEmails[currEmailIndx] = newEmail;

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

      if (!pinnedBadge) {
        res.status(500).send(`Error when adding a pinned badge: ${pinnedBadge}`);
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
        res.status(400).send('Invalid user body');
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
   * Sends out an email to the user regarding the top 5 posts in each of their forum.
   * @param req The request containing the username
   * @param res The response, either providing the email sent or an error
   * @returns A promise resolving to void.
   */
  const sendEmail = async (req: SendEmailNotif, res: Response): Promise<void> => {
    try {
      if (!isSendEmailNotifBodyValid(req)) {
        res.status(400).send('Invalid user body');
      }

      const { username } = req.body;

      const foundUser = await getUserByUsername(username);
      if ('error' in foundUser) {
        throw Error(foundUser.error);
      }

      if (!foundUser.emailNotif) {
        throw Error('User not subscribed to email notifs');
      }

      const allUserForums = await getUserForums(foundUser.username);
      const topFivePostsPerForum = await Promise.all(
        allUserForums.map(f => getTopFivePosts(f.name)),
      );

      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'raisa16h21@gmail.com',
          pass: 'uqby iszq gtfa chld',
        },
      });

      let forumItems = '';
      topFivePostsPerForum.forEach(forum => {
        forum.forEach(post => {
          forumItems += `<li>${post.title}</li><ul>`;
          post.answers.forEach(answer => {
            forumItems += `<li>${answer.text}</li>`;
          });
          forumItems += `</ul>`;
        });
      });

      // Email content
      const mailOptions = {
        from: 'raisa16h21@gmail.com',
        to: foundUser.emails[0],
        subject: 'FakeStackOverflow Email Digest',
        text: forumItems,
      };

      let howOftenToSend;
      switch (foundUser.emailFrequency) {
        case 'weekly':
          howOftenToSend = '25 9 * * 3';
          break;
        case 'daily':
          howOftenToSend = '30 18 * * *';
          break;
        case 'hourly':
          howOftenToSend = '30 * * * *';
          break;
        default:
          throw Error('not a valid frequency');
      }

      const email = schedule.scheduleJob(howOftenToSend, () => {
        transporter.sendMail(mailOptions, (error: Error) => {
          if (error) {
            throw Error('Error sending out email');
          }
        });
      });
      res.status(200).send(email);
    } catch (error) {
      res.status(500).send(`Error when sending email : ${error}`);
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
      }

      const { username, frequency } = req.body;

      const foundUser = await getUserByUsername(username);
      if ('error' in foundUser) {
        throw Error(foundUser.error);
      }

      const updatedUser = await updateUser(username, { emailFrequency: frequency });

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
  router.post('/sendEmail', sendEmail);
  router.patch('/changeFrequency', changeFrequency);
  return router;
};

export default userController;
