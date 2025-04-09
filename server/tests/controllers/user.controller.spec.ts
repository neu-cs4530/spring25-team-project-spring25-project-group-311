import supertest from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import * as util from '../../services/user.service';
import * as questionUtil from '../../services/question.service';
import * as answerUtil from '../../services/answer.service';
import {
  Answer,
  PopulatedDatabaseAnswer,
  PopulatedDatabaseQuestion,
  SafeDatabaseUser,
  User,
} from '../../types/types';
import { ans1, ans2, ans3, com1, com2, tag1, tag2, tag3 } from '../mockData.models';

const mockUser: User = {
  username: 'user1',
  password: 'password',
  dateJoined: new Date('2024-12-03'),
  emails: [],
  badges: [],
  browserNotif: false,
  emailNotif: false,
  questionsAsked: [],
  answersGiven: [],
  numUpvotesDownvotes: 0,
};

let mockSafeUser: SafeDatabaseUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'user1',
  dateJoined: new Date('2024-12-03'),
  emails: [],
  badges: [],
  browserNotif: false,
  emailNotif: false,
  questionsAsked: [],
  answersGiven: [],
  numUpvotesDownvotes: 0,
};

const mockUserJSONResponse = {
  _id: mockSafeUser._id.toString(),
  username: 'user1',
  dateJoined: new Date('2024-12-03').toISOString(),
  emails: [],
  badges: [],
  browserNotif: false,
  emailNotif: false,
  questionsAsked: [],
  answersGiven: [],
  numUpvotesDownvotes: 0,
};

const saveUserSpy = jest.spyOn(util, 'saveUser');
const loginUserSpy = jest.spyOn(util, 'loginUser');
const updatedUserSpy = jest.spyOn(util, 'updateUser');
const getUserByUsernameSpy = jest.spyOn(util, 'getUserByUsername');
const getUsersListSpy = jest.spyOn(util, 'getUsersList');
const deleteUserByUsernameSpy = jest.spyOn(util, 'deleteUserByUsername');
const getQuestionsByOrderSpy = jest.spyOn(questionUtil, 'getQuestionsByOrder');
const filterQuestionsByAskedBySpy = jest.spyOn(questionUtil, 'filterQuestionsByAskedBy');
const getAllAnswersSpy = jest.spyOn(answerUtil, 'getAllAnswers');
const getVotesSpy = jest.spyOn(questionUtil, 'getUpvotesAndDownVotesBy');

/**
 * Simplifies a question into JSON form
 * @param question The question to simplify
 * @returns The JSON-ified version of the question
 */
const simplifyQuestion = (question: PopulatedDatabaseQuestion) => ({
  ...question,
  _id: question._id.toString(), // Converting ObjectId to string
  tags: question.tags.map(tag => ({ ...tag, _id: tag._id.toString() })), // Converting tag ObjectId
  answers: question.answers.map(answer => ({
    ...answer,
    _id: answer._id.toString(),
    ansDateTime: (answer as Answer).ansDateTime.toISOString(),
  })), // Converting answer ObjectId
  askDateTime: question.askDateTime.toISOString(),
});

/**
 * Simplifies an answer into JSON form
 * @param answer The answer to simplify
 * @returns The JSON-ified version of the answer
 */
const simplifyAnswer = (answer: PopulatedDatabaseAnswer) => ({
  ...answer,
  _id: answer._id.toString(),
  ansDateTime: answer.ansDateTime.toISOString(),
  comments: answer.comments.map(comment => ({
    ...comment,
    _id: comment._id.toString(),
    commentDateTime: comment.commentDateTime.toISOString(),
  })),
});

const ALL_ANSWERS: PopulatedDatabaseAnswer[] = [
  {
    _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6af'),
    text: '2 + 2 = 4',
    ansBy: 'user1',
    ansDateTime: new Date('2023-11-19T09:24:00'),
    comments: [com1, com2],
  },
  {
    _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6bf'),
    text: '1 + 1 = 2',
    ansBy: 'user3',
    ansDateTime: new Date('2023-10-19T09:24:00'),
    comments: [com2],
  },
  {
    _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6bf'),
    text: '1 * 1 = 1',
    ansBy: 'user1',
    ansDateTime: new Date('2023-09-19T09:24:00'),
    comments: [com2],
  },
];
const ALL_QUESTIONS: PopulatedDatabaseQuestion[] = [
  {
    _id: new mongoose.Types.ObjectId(),
    title: 'Quick question about storage on android',
    text: 'I would like to know the best way to go about storing an array on an android phone so that even when the app/activity ended the data remains',
    tags: [tag3, tag2],
    answers: [
      { ...ans1, comments: [] },
      { ...ans2, comments: [] },
    ],
    askedBy: 'q_by1',
    askDateTime: new Date('2023-11-16T09:24:00'),
    views: ['question1_user', 'question2_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: 'Object storage for a web application',
    text: 'I am currently working on a website where, roughly 40 million documents and images should be served to its users. I need suggestions on which method is the most suitable for storing content with subject to these requirements.',
    tags: [tag1, tag2],
    answers: [
      { ...ans1, comments: [] },
      { ...ans2, comments: [] },
      { ...ans3, comments: [] },
    ],
    askedBy: 'q_by1',
    askDateTime: new Date('2023-11-17T09:24:00'),
    views: ['question2_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: 'Is there a language to write programmes by pictures?',
    text: 'Does something like that exist?',
    tags: [],
    answers: [],
    askedBy: 'q_by3',
    askDateTime: new Date('2023-11-19T09:24:00'),
    views: ['question1_user', 'question2_user', 'question3_user', 'question4_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
];

describe('Test userController', () => {
  describe('POST /signup', () => {
    it('should create a new user given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
        biography: 'This is a test biography',
      };

      saveUserSpy.mockResolvedValueOnce({
        ...mockSafeUser,
        biography: mockReqBody.biography,
      });

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockUserJSONResponse,
        biography: mockReqBody.biography,
      });
      expect(saveUserSpy).toHaveBeenCalledWith({
        ...mockReqBody,
        biography: mockReqBody.biography,
        dateJoined: expect.any(Date),
        emails: [],
        badges: [],
        banners: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      });
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        password: mockUser.password,
      };

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        password: mockUser.password,
      };

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing password', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty password', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: '',
      };

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 500 for a database error while saving', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
      };

      saveUserSpy.mockResolvedValueOnce({ error: 'Error saving user' });

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /login', () => {
    it('should succesfully login for a user given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
      };

      loginUserSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(loginUserSpy).toHaveBeenCalledWith(mockReqBody);
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        password: mockUser.password,
      };

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        password: mockUser.password,
      };

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing password', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty password', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: '',
      };

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 500 for a database error while saving', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
      };

      loginUserSpy.mockResolvedValueOnce({
        error: 'Error authenticating user',
      });

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /resetPassword', () => {
    it('should succesfully return updated user object given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: 'newPassword',
      };

      updatedUserSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...mockUserJSONResponse });
      expect(updatedUserSpy).toHaveBeenCalledWith(mockUser.username, {
        password: 'newPassword',
      });
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        password: 'newPassword',
      };

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        password: 'newPassword',
      };

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing password', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty password', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: '',
      };

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 500 for a database error while updating', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: 'newPassword',
      };

      updatedUserSpy.mockResolvedValueOnce({ error: 'Error updating user' });

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('GET /getUser', () => {
    it('should return the user given correct arguments', async () => {
      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).get(`/user/getUser/${mockUser.username}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(getUserByUsernameSpy).toHaveBeenCalledWith(mockUser.username);
    });

    it('should return 500 if database error while searching username', async () => {
      getUserByUsernameSpy.mockResolvedValueOnce({
        error: 'Error finding user',
      });

      const response = await supertest(app).get(`/user/getUser/${mockUser.username}`);

      expect(response.status).toBe(500);
    });

    it('should return 404 if username not provided', async () => {
      // Express automatically returns 404 for missing parameters when
      // defined as required in the route
      const response = await supertest(app).get('/user/getUser/');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /getUsers', () => {
    it('should return the users from the database', async () => {
      getUsersListSpy.mockResolvedValueOnce([mockSafeUser]);

      const response = await supertest(app).get(`/user/getUsers`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([mockUserJSONResponse]);
      expect(getUsersListSpy).toHaveBeenCalled();
    });

    it('should return 500 if database error while finding users', async () => {
      getUsersListSpy.mockResolvedValueOnce({ error: 'Error finding users' });

      const response = await supertest(app).get(`/user/getUsers`);

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /deleteUser', () => {
    it('should return the deleted user given correct arguments', async () => {
      deleteUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).delete(`/user/deleteUser/${mockUser.username}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(deleteUserByUsernameSpy).toHaveBeenCalledWith(mockUser.username);
    });

    it('should return 500 if database error while searching username', async () => {
      deleteUserByUsernameSpy.mockResolvedValueOnce({
        error: 'Error deleting user',
      });

      const response = await supertest(app).delete(`/user/deleteUser/${mockUser.username}`);

      expect(response.status).toBe(500);
    });

    it('should return 404 if username not provided', async () => {
      // Express automatically returns 404 for missing parameters when
      // defined as required in the route
      const response = await supertest(app).delete('/user/deleteUser/');
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /updateBiography', () => {
    it('should successfully update biography given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        biography: 'This is my new bio',
      };

      // Mock a successful updateUser call
      updatedUserSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      // Ensure updateUser is called with the correct args
      expect(updatedUserSpy).toHaveBeenCalledWith(mockUser.username, {
        biography: 'This is my new bio',
      });
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        biography: 'some new biography',
      };

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        biography: 'a new bio',
      };

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing biography field', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 500 if updateUser returns an error', async () => {
      const mockReqBody = {
        username: mockUser.username,
        biography: 'Attempting update biography',
      };

      // Simulate a DB error
      updatedUserSpy.mockResolvedValueOnce({ error: 'Error updating user' });

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain(
        'Error when updating user biography: Error: Error updating user',
      );
    });
  });

  describe('POST /addEmail', () => {
    it('should successfully add an email given correct arguments', async () => {
      const safeUserEmails = {
        _id: new mongoose.Types.ObjectId(),
        username: 'newUser',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'newUser',
        email: 'raisa16h21@gmail.com',
      };

      const mockSafeUserEmails = {
        _id: safeUserEmails._id,
        username: 'newUser',
        dateJoined: new Date('2024-12-03'),
        emails: ['raisa16h21@gmail.com'],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockUserEmailJSONResponse = {
        _id: mockSafeUserEmails._id.toString(),
        username: 'newUser',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: ['raisa16h21@gmail.com'],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(safeUserEmails);

      // Mock a successful updateUser call
      updatedUserSpy.mockResolvedValueOnce(mockSafeUserEmails);

      const response = await supertest(app).post('/user/addEmail').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserEmailJSONResponse);
      // Ensure updateUser is called with the correct args
      expect(updatedUserSpy).toHaveBeenCalledWith(safeUserEmails.username, {
        emails: ['raisa16h21@gmail.com'],
      });
    });

    it('should return 400 for empty request', async () => {
      const mockReqBody = {};

      const response = await supertest(app).post('/user/addEmail').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        email: 'raisa16h21@gmail.com',
      };

      const response = await supertest(app).post('/user/addEmail').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request having empty username', async () => {
      const mockReqBody = {
        username: '',
        email: 'raisa16h21@gmail.com',
      };

      const response = await supertest(app).post('/user/addEmail').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing email', async () => {
      const mockReqBody = {
        username: 'newUser',
      };

      const response = await supertest(app).post('/user/addEmail').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request having empty email', async () => {
      const mockReqBody = {
        username: 'newUser',
        email: '',
      };

      const response = await supertest(app).post('/user/addEmail').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request having an invalid email', async () => {
      const mockReqBody = {
        username: 'newUser',
        email: 'abcefghijklmnopqrstuvwxyz',
      };

      const response = await supertest(app).post('/user/addEmail').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid email');
    });

    it('should return 400 if the email I am trying to add is already associated with this user', async () => {
      const safeUserEmails = {
        _id: new mongoose.Types.ObjectId(),
        username: 'newUser',
        dateJoined: new Date('2024-12-03'),
        emails: ['raisa16h21@gmail.com'],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'newUser',
        email: 'raisa16h21@gmail.com',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(safeUserEmails);

      const response = await supertest(app).post('/user/addEmail').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Email already associated with this user');
    });

    it('should return 500 if user does not exist', async () => {
      getUserByUsernameSpy.mockResolvedValueOnce({
        error: 'Error when getting user',
      });

      const mockReqBody = {
        username: 'newUser',
        email: 'raisa16h21@gmail.com',
      };

      const response = await supertest(app).post('/user/addEmail').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toEqual('Error when adding user email: Error: Error when getting user');
      expect(getUserByUsernameSpy).toHaveBeenCalledWith(mockReqBody.username);
    });

    it('should return 500 if an error occurs while updating user', async () => {
      const safeUserEmails = {
        _id: new mongoose.Types.ObjectId(),
        username: 'newUser',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const userEmails = {
        username: 'newUser',
        password: 'randomPassword',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'newUser',
        email: 'raisa16h21@gmail.com',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(safeUserEmails);

      // Mock a successful updateUser call
      updatedUserSpy.mockResolvedValueOnce({
        error: 'Error while updating user',
      });

      const response = await supertest(app).post('/user/addEmail').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toEqual(
        'Error when adding user email: Error: Error while updating user',
      );
      expect(getUserByUsernameSpy).toHaveBeenCalledWith(mockReqBody.username);
      expect(updatedUserSpy).toHaveBeenCalledWith(userEmails.username, {
        emails: ['raisa16h21@gmail.com'],
      });
    });
  });
  describe('PATCH /:email/replaceEmail', () => {
    it('should successfully add an email given correct arguments', async () => {
      const safeUserEmails = {
        _id: new mongoose.Types.ObjectId(),
        username: 'newUser',
        dateJoined: new Date('2024-12-03'),
        emails: ['bhuiyan.r@northeastern.edu', 'emcd.ny@gmail.com'],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'newUser',
        email: 'raisa16h21@gmail.com',
      };

      const mockSafeUserEmails = {
        _id: safeUserEmails._id,
        username: 'newUser',
        dateJoined: new Date('2024-12-03'),
        emails: ['raisa16h21@gmail.com', 'emcd.ny@gmail.com'],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockUserEmailJSONResponse = {
        _id: mockSafeUserEmails._id.toString(),
        username: 'newUser',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: ['raisa16h21@gmail.com', 'emcd.ny@gmail.com'],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(safeUserEmails);

      // Mock a successful updateUser call
      updatedUserSpy.mockResolvedValueOnce(mockSafeUserEmails);

      const response = await supertest(app)
        .patch('/user/bhuiyan.r@northeastern.edu/replaceEmail')
        .send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserEmailJSONResponse);
      // Ensure updateUser is called with the correct args
      expect(updatedUserSpy).toHaveBeenCalledWith(safeUserEmails.username, {
        emails: ['raisa16h21@gmail.com', 'emcd.ny@gmail.com'],
      });
    });

    it('should return 400 for empty request', async () => {
      const mockReqBody = {};

      const response = await supertest(app)
        .patch('/user/bhuiyan.r@northeastern.edu/replaceEmail')
        .send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 404 for not having a current email parameter', async () => {
      const mockReqBody = { username: 'newUser', email: 'raisa16h21@gmail.com' };

      const response = await supertest(app).patch('/user/replaceEmail').send(mockReqBody);

      expect(response.status).toBe(404);
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        email: 'raisa16h21@gmail.com',
      };

      const response = await supertest(app)
        .patch('/user/bhuiyan.r@northeastern.edu/replaceEmail')
        .send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request having empty username', async () => {
      const mockReqBody = {
        username: '',
        email: 'raisa16h21@gmail.com',
      };

      const response = await supertest(app)
        .patch('/user/bhuiyan.r@northeastern.edu/replaceEmail')
        .send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing new email', async () => {
      const mockReqBody = {
        username: 'newUser',
      };

      const response = await supertest(app)
        .patch('/user/bhuiyan.r@northeastern.edu/replaceEmail')
        .send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request having empty new email', async () => {
      const mockReqBody = {
        username: 'newUser',
        email: '',
      };

      const response = await supertest(app)
        .patch('/user/bhuiyan.r@northeastern.edu/replaceEmail')
        .send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request having an invalid new email', async () => {
      const mockReqBody = {
        username: 'newUser',
        email: 'abcefghijklmnopqrstuvwxyz',
      };

      const response = await supertest(app)
        .patch('/user/raisa16h21@gmail.com/replaceEmail')
        .send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid email');
    });

    it('should return 400 for request having a current email that is not associated with the user', async () => {
      const safeUserEmails = {
        _id: new mongoose.Types.ObjectId(),
        username: 'newUser',
        dateJoined: new Date('2024-12-03'),
        emails: ['bhuiyan.r@northeastern.edu'],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'newUser',
        email: 'raisa16h21@gmail.com',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(safeUserEmails);

      const response = await supertest(app)
        .patch('/user/he.maxw@northeastern.edu/replaceEmail')
        .send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Provided email is not associated with user');
    });

    it('should return 400 if trying to replace email with a different email that is already associated with the user', async () => {
      const safeUserEmails = {
        _id: new mongoose.Types.ObjectId(),
        username: 'newUser',
        dateJoined: new Date('2024-12-03'),
        emails: ['bhuiyan.r@northeastern.edu', 'emcd.ny@gmail.com'],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'newUser',
        email: 'emcd.ny@gmail.com',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(safeUserEmails);

      const response = await supertest(app)
        .patch('/user/bhuiyan.r@northeastern.edu/replaceEmail')
        .send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Email already associated with this user');
    });

    it('should return 500 if user does not exist', async () => {
      getUserByUsernameSpy.mockResolvedValueOnce({
        error: 'Error when getting user',
      });

      const mockReqBody = {
        username: 'newUser',
        email: 'raisa16h21@gmail.com',
      };

      const response = await supertest(app)
        .patch('/user/bhuiyan.r@northeastern.edu/replaceEmail')
        .send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toEqual(
        'Error when replacing user email: Error: Error when getting user',
      );
      expect(getUserByUsernameSpy).toHaveBeenCalledWith(mockReqBody.username);
    });

    it('should return 500 if an error occurs while updating user', async () => {
      const safeUserEmails = {
        _id: new mongoose.Types.ObjectId(),
        username: 'newUser',
        dateJoined: new Date('2024-12-03'),
        emails: ['emcd.ny@gmail.com', 'he.maxw@northeastern.edu'],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'newUser',
        email: 'raisa16h21@gmail.com',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(safeUserEmails);

      // Mock a successful updateUser call
      updatedUserSpy.mockResolvedValueOnce({ error: 'Error while updating user' });
      const response = await supertest(app)
        .patch('/user/emcd.ny@gmail.com/replaceEmail')
        .send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toEqual(
        'Error when replacing user email: Error: Error while updating user',
      );
      expect(getUserByUsernameSpy).toHaveBeenCalledWith(mockReqBody.username);
      expect(updatedUserSpy).toHaveBeenCalledWith(safeUserEmails.username, {
        emails: ['raisa16h21@gmail.com', 'he.maxw@northeastern.edu'],
      });
    });
  });

  describe('PATCH /changeSubscription', () => {
    it('should opt a user in for browser subscriptions', async () => {
      const mockReqBody = {
        username: 'user1',
        notifType: 'browser',
      };

      const browserNotifUser = {
        _id: mockSafeUser._id,
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: true,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockBrowserNotifResponse = {
        _id: browserNotifUser._id.toString(),
        username: 'user1',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: [],
        browserNotif: true,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);
      updatedUserSpy.mockResolvedValueOnce(browserNotifUser);

      const response = await supertest(app).patch('/user/changeSubscription').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBrowserNotifResponse);
    });

    it('should opt a user in for email subscriptions', async () => {
      const mockReqBody = {
        username: 'user1',
        notifType: 'email',
        emailFrequency: 'hourly',
      };

      const emailNotifUser = {
        _id: mockSafeUser._id,
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: true,
        emailFrequency: 'hourly',
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockEmailNotifResponse = {
        _id: emailNotifUser._id.toString(),
        username: 'user1',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: true,
        emailFrequency: 'hourly',
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);
      updatedUserSpy.mockResolvedValueOnce(emailNotifUser);

      const response = await supertest(app).patch('/user/changeSubscription').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockEmailNotifResponse);
    });

    it('should opt a user out for browser subscriptions', async () => {
      const mockSafeUserBrowser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: true,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user1',
        notifType: 'browser',
      };

      const browserNotifUser = {
        _id: mockSafeUserBrowser._id,
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockBrowserNotifResponse = {
        _id: browserNotifUser._id.toString(),
        username: 'user1',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUserBrowser);
      updatedUserSpy.mockResolvedValueOnce(browserNotifUser);

      const response = await supertest(app).patch('/user/changeSubscription').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBrowserNotifResponse);
    });

    it('should opt a user out for email subscriptions', async () => {
      const mockSafeUserEmail: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: true,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user1',
        notifType: 'email',
      };

      const emailNotifUser = {
        _id: mockSafeUserEmail._id,
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockBrowserNotifResponse = {
        _id: emailNotifUser._id.toString(),
        username: 'user1',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUserEmail);
      updatedUserSpy.mockResolvedValueOnce(emailNotifUser);

      const response = await supertest(app).patch('/user/changeSubscription').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBrowserNotifResponse);
    });

    it('should return a 400 error if there is no request body', async () => {
      const mockReqBody = {};

      const response = await supertest(app).patch('/user/changeSubscription').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return a 400 error if there is no username', async () => {
      const mockReqBody = {
        notifType: 'browser',
      };

      const response = await supertest(app).patch('/user/changeSubscription').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return a 400 error if there is a blank username', async () => {
      const mockReqBody = {
        username: '',
        notifType: 'browser',
      };

      const response = await supertest(app).patch('/user/changeSubscription').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return a 400 error if there is no notifType', async () => {
      const mockReqBody = {
        username: 'user1',
      };

      const response = await supertest(app).patch('/user/changeSubscription').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return a 500 error if there is no user associated with the given username', async () => {
      const mockReqBody = {
        username: 'user1',
        notifType: 'email',
      };

      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error getting user' });

      const response = await supertest(app).patch('/user/changeSubscription').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toEqual(
        'Error when changing subscription to notification: Error: Error getting user',
      );
      expect(getUserByUsernameSpy).toHaveBeenCalledWith(mockReqBody.username);
    });

    it('should return a 500 error if there is an error with updating the user', async () => {
      const mockReqBody = {
        username: 'user1',
        notifType: 'browser',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);
      updatedUserSpy.mockResolvedValueOnce({ error: 'Error when updating user' });

      const response = await supertest(app).patch('/user/changeSubscription').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toEqual(
        'Error when changing subscription to notification: Error: Error when updating user',
      );
      expect(getUserByUsernameSpy).toHaveBeenCalledWith(mockReqBody.username);
    });
  });

  describe('PATCH /updateStreak', () => {
    it('should successfully update the user streak and activity log', async () => {
      const mockReqBody = {
        username: 'user1',
        date: new Date().toISOString(),
        activity: 'votes',
      };

      const mockUserWithStreak = {
        ...mockSafeUser,
        streak: [new Date('2025-04-01')],
        activityLog: {},
      };

      const updatedUser = {
        ...mockUserWithStreak,
        streak: [new Date('2025-04-01'), new Date(mockReqBody.date)],
        activityLog: {
          [mockReqBody.date.split('T')[0]]: { votes: 1, questions: 0, answers: 0 },
        },
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockUserWithStreak);
      updatedUserSpy.mockResolvedValueOnce(updatedUser);

      const response = await supertest(app).patch('/user/updateStreak').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockUserJSONResponse,
        streak: updatedUser.streak.map(date => date.toISOString()),
        activityLog: updatedUser.activityLog,
      });
      expect(getUserByUsernameSpy).toHaveBeenCalledWith(mockReqBody.username);
    });

    it('should return 400 if username is missing', async () => {
      const mockReqBody = {
        date: new Date().toISOString(),
        activity: 'votes',
      };

      const response = await supertest(app).patch('/user/updateStreak').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Body invalid');
    });

    it('should return 400 if activity is invalid', async () => {
      const mockReqBody = {
        username: 'user1',
        date: new Date().toISOString(),
        activity: 'invalidActivity',
      };

      const mockUserWithStreak = {
        ...mockSafeUser,
        streak: [new Date('2024-12-02')],
        activityLog: {},
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockUserWithStreak);

      const response = await supertest(app).patch('/user/updateStreak').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain(
        'Error updating user streak: Error: Invalid activity type: invalidActivity',
      );
    });

    it('should return 500 if user does not exist', async () => {
      const mockReqBody = {
        username: 'user1',
        date: new Date().toISOString(),
        activity: 'votes',
      };

      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'User not found' });

      const response = await supertest(app).patch('/user/updateStreak').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toEqual('Error updating user streak: Error: User not found');
      expect(getUserByUsernameSpy).toHaveBeenCalledWith(mockReqBody.username);
    });

    it('should return 500 if there is an error updating the user', async () => {
      const mockReqBody = {
        username: 'user1',
        date: new Date().toISOString(),
        activity: 'votes',
      };

      const mockUserWithStreak = {
        ...mockSafeUser,
        streak: [new Date('2024-12-02')],
        activityLog: {},
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockUserWithStreak);
      updatedUserSpy.mockResolvedValueOnce({ error: 'Error updating user' });

      const response = await supertest(app).patch('/user/updateStreak').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toEqual('Error updating user streak: Error: Error updating user');
      expect(getUserByUsernameSpy).toHaveBeenCalledWith(mockReqBody.username);
      expect(updatedUserSpy).toHaveBeenCalledWith(mockReqBody.username, expect.any(Object));
    });
  });

  describe('POST /addBadges', () => {
    beforeEach(() => {
      mockSafeUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };
    });

    it('should add badges to a user', async () => {
      const mockReqBody = {
        username: 'user1',
        badges: ['badge1', 'badge2'],
      };

      const addedBadgeUser = {
        _id: mockSafeUser._id,
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: mockReqBody.badges,
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockAddBadgeResponse = {
        _id: addedBadgeUser._id.toString(),
        username: 'user1',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: mockReqBody.badges,
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);
      updatedUserSpy.mockResolvedValueOnce(addedBadgeUser);

      const response = await supertest(app).post('/user/addBadges').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAddBadgeResponse);
    });

    it('should return 400 if request body undefined', async () => {
      const mockReqBody = {};
      const response = await supertest(app).post('/user/addBadges').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 if request username is undefined', async () => {
      const mockReqBody = {
        badges: ['badgeA'],
      };
      const response = await supertest(app).post('/user/addBadges').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 if request username is empty string', async () => {
      const mockReqBody = {
        username: '',
        badges: ['badgeA'],
      };
      const response = await supertest(app).post('/user/addBadges').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 if request badges are undefined', async () => {
      const mockReqBody = {
        username: 'user1',
      };
      const response = await supertest(app).post('/user/addBadges').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 user already has badge', async () => {
      const mockReqBody = {
        username: 'user1',
        badges: ['badge3', 'badge4'],
      };

      const badgeUser = {
        _id: mockSafeUser._id,
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: ['badge4'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(badgeUser);

      const response = await supertest(app).post('/user/addBadges').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Badge(s) already associated with this user');
    });

    it('should return 500 if there is an error getting user', async () => {
      const mockReqBody = {
        username: 'user1',
        badges: ['badge1', 'badge2'],
      };

      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error getting user' });

      const response = await supertest(app).post('/user/addBadges').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toEqual(`Error when adding user badge: Error: Error getting user`);
    });

    it('should return 500 if there is an error updating user', async () => {
      const mockReqBody = {
        username: 'user1',
        badges: ['badge1', 'badge2'],
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);
      updatedUserSpy.mockResolvedValueOnce({ error: 'Error updating user' });

      const response = await supertest(app).post('/user/addBadges').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toEqual(`Error when adding user badge: Error: Error updating user`);
    });
  });

  describe('POST /addPinnedBadge', () => {
    it('should add the pinned badge to the user', async () => {
      const mockSafeUnpinUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user3',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: ['pin1'],
        pinnedBadge: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockSafePinUser = {
        _id: mockSafeUnpinUser._id,
        username: 'user3',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: ['pin1'],
        pinnedBadge: ['pin1'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockSafePinUserJSON = {
        _id: mockSafePinUser._id.toString(),
        username: 'user3',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: ['pin1'],
        pinnedBadge: ['pin1'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user3',
        pinnedBadge: 'pin1',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUnpinUser);
      updatedUserSpy.mockResolvedValueOnce(mockSafePinUser);

      const response = await supertest(app).post('/user/addPinnedBadge').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSafePinUserJSON);
    });

    it('should add the pinned badge to the user given one badge is already pinned', async () => {
      const mockSafeUnpinUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user3',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: ['pin1', 'pin2', 'pin3', 'pin4'],
        pinnedBadge: ['pin1'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockSafePinUser = {
        _id: mockSafeUnpinUser._id,
        username: 'user3',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: ['pin1', 'pin2', 'pin3', 'pin4'],
        pinnedBadge: ['pin1', 'pin2'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockSafePinUserJSON = {
        _id: mockSafePinUser._id.toString(),
        username: 'user3',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: ['pin1', 'pin2', 'pin3', 'pin4'],
        pinnedBadge: ['pin1', 'pin2'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user3',
        pinnedBadge: 'pin2',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUnpinUser);
      updatedUserSpy.mockResolvedValueOnce(mockSafePinUser);

      const response = await supertest(app).post('/user/addPinnedBadge').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSafePinUserJSON);
    });

    it('should add the pinned badge to the user given two badges are already pinned', async () => {
      const mockSafeUnpinUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user3',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: ['pin1', 'pin2', 'pin3', 'pin4'],
        pinnedBadge: ['pin1', 'pin2'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockSafePinUser = {
        _id: mockSafeUnpinUser._id,
        username: 'user3',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: ['pin1', 'pin2', 'pin3', 'pin4'],
        pinnedBadge: ['pin1', 'pin2', 'pin3'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockSafePinUserJSON = {
        _id: mockSafePinUser._id.toString(),
        username: 'user3',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: ['pin1', 'pin2', 'pin3', 'pin4'],
        pinnedBadge: ['pin1', 'pin2', 'pin3'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user3',
        pinnedBadge: 'pin3',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUnpinUser);
      updatedUserSpy.mockResolvedValueOnce(mockSafePinUser);

      const response = await supertest(app).post('/user/addPinnedBadge').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSafePinUserJSON);
    });

    it('should return 400 if the request body is undefined', async () => {
      const mockReqBody = {};
      const response = await supertest(app).post('/user/addPinnedBadge').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('invalid body');
    });

    it('should return 400 if the request username is undefined', async () => {
      const mockReqBody = {
        pinnedBadge: 'pin',
      };
      const response = await supertest(app).post('/user/addPinnedBadge').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('invalid body');
    });

    it('should return 400 if the request username is empty', async () => {
      const mockReqBody = {
        username: '',
        pinnedBadge: 'pin',
      };
      const response = await supertest(app).post('/user/addPinnedBadge').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('invalid body');
    });

    it('should return 400 if the request pinned badge is undefined', async () => {
      const mockReqBody = {
        username: 'user5',
      };
      const response = await supertest(app).post('/user/addPinnedBadge').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('invalid body');
    });

    it('should return 500 if there is an error getting the user', async () => {
      const mockReqBody = {
        username: 'user5',
        pinnedBadge: 'pin3',
      };

      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error getting user' });
      const response = await supertest(app).post('/user/addPinnedBadge').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toEqual('Error when adding a pinned badge: Error: Error getting user');
    });

    it('should return 500 if there is an error updating the user', async () => {
      const mockReqBody = {
        username: 'user5',
        pinnedBadge: 'pin1',
      };

      const mockSafeUnpinUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user5',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: ['pin1'],
        pinnedBadge: [''],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUnpinUser);
      updatedUserSpy.mockResolvedValueOnce({ error: 'Error updating the user' });
      const response = await supertest(app).post('/user/addPinnedBadge').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toEqual(
        'Error when adding a pinned badge: Error: Error updating the user',
      );
    });

    it('should return 500 if the badge we are trying to pin is already pinned', async () => {
      const mockSafeUnpinUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user3',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: ['pin1', 'pin2', 'pin3', 'pin4'],
        pinnedBadge: ['pin1', 'pin2'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user3',
        pinnedBadge: 'pin2',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUnpinUser);

      const response = await supertest(app).post('/user/addPinnedBadge').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toEqual(
        'Error when adding a pinned badge: Error: Badge is already pinned',
      );
    });

    it('should return 500 if there are already 3 badges pinned', async () => {
      const mockSafeUnpinUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user3',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: ['pin1', 'pin2', 'pin3', 'pin4'],
        pinnedBadge: ['pin1', 'pin2', 'pin3'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user3',
        pinnedBadge: 'pin2',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUnpinUser);

      const response = await supertest(app).post('/user/addPinnedBadge').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toEqual(
        'Error when adding a pinned badge: Error: There are already 3 badges pinned',
      );
    });
  });

  describe('PATCH /removePinnedBadge', () => {
    it('should remove the single pinned badge from the user', async () => {
      const mockSafeUnpinUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user3',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: ['pin1'],
        pinnedBadge: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockSafePinUser = {
        _id: mockSafeUnpinUser._id,
        username: 'user3',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: ['pin1'],
        pinnedBadge: ['pin1'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockSafeUnPinUserJSON = {
        _id: mockSafePinUser._id.toString(),
        username: 'user3',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: ['pin1'],
        pinnedBadge: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user3',
        pinnedBadge: 'pin1',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafePinUser);
      updatedUserSpy.mockResolvedValueOnce(mockSafeUnpinUser);

      const response = await supertest(app).patch('/user/removePinnedBadge').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSafeUnPinUserJSON);
    });

    it('should remove the pinned badge to the user given two badges are already pinned', async () => {
      const mockSafeUnpinUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user3',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: ['pin1', 'pin2', 'pin3', 'pin4'],
        pinnedBadge: ['pin1'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockSafePinUser = {
        _id: mockSafeUnpinUser._id,
        username: 'user3',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: ['pin1', 'pin2', 'pin3', 'pin4'],
        pinnedBadge: ['pin1', 'pin2'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockSafeUnpinUserJSON = {
        _id: mockSafePinUser._id.toString(),
        username: 'user3',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: ['pin1', 'pin2', 'pin3', 'pin4'],
        pinnedBadge: ['pin1'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user3',
        pinnedBadge: 'pin2',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafePinUser);
      updatedUserSpy.mockResolvedValueOnce(mockSafeUnpinUser);

      const response = await supertest(app).patch('/user/removePinnedBadge').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSafeUnpinUserJSON);
    });

    it('should remove the pinned badge to the user given three badges are already pinned', async () => {
      const mockSafeUnpinUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user3',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: ['pin1', 'pin2', 'pin3', 'pin4'],
        pinnedBadge: ['pin1', 'pin2'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockSafePinUser = {
        _id: mockSafeUnpinUser._id,
        username: 'user3',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: ['pin1', 'pin2', 'pin3', 'pin4'],
        pinnedBadge: ['pin1', 'pin2', 'pin3'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockSafeUnpinUserJSON = {
        _id: mockSafePinUser._id.toString(),
        username: 'user3',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: ['pin1', 'pin2', 'pin3', 'pin4'],
        pinnedBadge: ['pin1', 'pin2'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user3',
        pinnedBadge: 'pin3',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafePinUser);
      updatedUserSpy.mockResolvedValueOnce(mockSafeUnpinUser);

      const response = await supertest(app).patch('/user/removePinnedBadge').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSafeUnpinUserJSON);
    });

    it('should return 400 if the request body is undefined', async () => {
      const mockReqBody = {};
      const response = await supertest(app).patch('/user/removePinnedBadge').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('invalid body');
    });

    it('should return 400 if the request username is undefined', async () => {
      const mockReqBody = {
        pinnedBadge: 'pin',
      };
      const response = await supertest(app).patch('/user/removePinnedBadge').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('invalid body');
    });

    it('should return 400 if the request username is empty', async () => {
      const mockReqBody = {
        username: '',
        pinnedBadge: 'pin',
      };
      const response = await supertest(app).patch('/user/removePinnedBadge').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('invalid body');
    });

    it('should return 400 if the request pinned badge is undefined', async () => {
      const mockReqBody = {
        username: 'user5',
      };
      const response = await supertest(app).patch('/user/removePinnedBadge').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('invalid body');
    });

    it('should return 500 if the request pinned badge is not pinned', async () => {
      const mockReqBody = {
        username: 'user3',
        pinnedBadge: 'pin1',
      };

      const mockSafeUnpinUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user3',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: ['pin1'],
        pinnedBadge: [''],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUnpinUser);
      const response = await supertest(app).patch('/user/removePinnedBadge').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toEqual(
        'Error when removing a pinned badge: Error: Badge is already not pinned',
      );
    });

    it('should return 500 if there is an error getting the user', async () => {
      const mockReqBody = {
        username: 'user5',
        pinnedBadge: 'pin3',
      };

      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error getting user' });
      const response = await supertest(app).patch('/user/removePinnedBadge').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toEqual(
        'Error when removing a pinned badge: Error: Error getting user',
      );
    });

    it('should return 500 if there is an error updating the user', async () => {
      const mockReqBody = {
        username: 'user5',
        pinnedBadge: 'pin1',
      };

      const mockSafeUnpinUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user5',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: ['pin1'],
        pinnedBadge: ['pin1'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUnpinUser);
      updatedUserSpy.mockResolvedValueOnce({ error: 'Error updating the user' });
      const response = await supertest(app).patch('/user/removePinnedBadge').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toEqual(
        'Error when removing a pinned badge: Error: Error updating the user',
      );
    });

    it('should return 500 if the badge we are trying to unpin is not pinned', async () => {
      const mockSafeUnpinUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user3',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: ['pin1', 'pin2', 'pin3', 'pin4'],
        pinnedBadge: ['pin1', 'pin2'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user3',
        pinnedBadge: 'pin3',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUnpinUser);

      const response = await supertest(app).patch('/user/removePinnedBadge').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toEqual(
        'Error when removing a pinned badge: Error: Badge is already not pinned',
      );
    });

    it('should return 500 if there are already 0 badges pinned', async () => {
      const mockSafeUnpinUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user3',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: ['pin1', 'pin2', 'pin3', 'pin4'],
        pinnedBadge: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user3',
        pinnedBadge: 'pin2',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUnpinUser);

      const response = await supertest(app).patch('/user/removePinnedBadge').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toEqual(
        'Error when removing a pinned badge: Error: There are already no badges pinned',
      );
    });
  });

  describe('POST /addBanners', () => {
    it('should add banners to a user', async () => {
      const mockNoBannerUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        banners: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user1',
        banners: ['#FF0000', '#0000FF'],
      };

      const addedBannerUser: SafeDatabaseUser = {
        _id: mockNoBannerUser._id,
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        banners: mockReqBody.banners,
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockAddBannerResponse = {
        _id: addedBannerUser._id.toString(),
        username: 'user1',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: [],
        banners: mockReqBody.banners,
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockNoBannerUser);
      updatedUserSpy.mockResolvedValueOnce(addedBannerUser);

      const response = await supertest(app).post('/user/addBanners').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAddBannerResponse);
    });

    it('should add banners to a user who already has banners', async () => {
      const mockABannerUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        banners: ['#000000'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user1',
        banners: ['#FF0000', '#0000FF'],
      };

      const addedBannerUser: SafeDatabaseUser = {
        _id: mockABannerUser._id,
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        banners: ['#000000', '#FF0000', '#0000FF'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockAddBannerResponse = {
        _id: addedBannerUser._id.toString(),
        username: 'user1',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: [],
        banners: ['#000000', '#FF0000', '#0000FF'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockABannerUser);
      updatedUserSpy.mockResolvedValueOnce(addedBannerUser);

      const response = await supertest(app).post('/user/addBanners').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAddBannerResponse);
    });

    it('should return 400 if banner already given to a user', async () => {
      const mockOneBannerUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        banners: ['#FF0000'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user1',
        banners: ['#FF0000', '#0000FF'],
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockOneBannerUser);

      const response = await supertest(app).post('/user/addBanners').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Banner(s) already associated with this user');
    });

    it('should return 400 if req body is undefined', async () => {
      const mockReqBody = {};

      const response = await supertest(app).post('/user/addBanners').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 if req username is undefined', async () => {
      const mockReqBody = {
        banners: ['#0000FF'],
      };

      const response = await supertest(app).post('/user/addBanners').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 if req username is empty', async () => {
      const mockReqBody = {
        username: '',
        banners: ['#FF0000'],
      };

      const response = await supertest(app).post('/user/addBanners').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 if req banners is undefined', async () => {
      const mockReqBody = {
        username: 'nolan',
      };

      const response = await supertest(app).post('/user/addBanners').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 if req banners is empty', async () => {
      const mockReqBody = {
        username: 'nolan',
        banners: [],
      };

      const response = await supertest(app).post('/user/addBanners').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid banner data: ');
    });

    it('should return 500 if there is an error getting the user', async () => {
      const mockReqBody = {
        username: 'bradford',
        banners: ['#0000FF'],
      };

      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error getting user' });
      const response = await supertest(app).post('/user/addBanners').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toEqual('Error when adding user banner: Error: Error getting user');
    });

    it('should return 500 if there is an error updating the user', async () => {
      const mockReqBody = {
        username: 'jackson',
        banners: ['#0000FF'],
      };

      const mockSingleBannerUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'jackson',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        banners: ['cyan'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSingleBannerUser);
      updatedUserSpy.mockResolvedValueOnce({ error: 'Error updating user' });
      const response = await supertest(app).post('/user/addBanners').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toEqual('Error when adding user banner: Error: Error updating user');
    });
  });

  describe('POST /addSelectedBanner', () => {
    it('should add the selected banner', async () => {
      const mockBanneredUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'talia',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        banners: ['#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', '#4B0082', '#8F00FF'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'talia',
        banner: '#008000',
      };

      const pickedBannerUser = {
        _id: mockBanneredUser._id,
        username: 'talia',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        banners: mockBanneredUser.banners,
        selectedBanner: '#008000',
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockAddBannerResponse = {
        _id: pickedBannerUser._id.toString(),
        username: 'talia',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: [],
        banners: mockBanneredUser.banners,
        selectedBanner: '#008000',
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockBanneredUser);
      updatedUserSpy.mockResolvedValueOnce(pickedBannerUser);

      const response = await supertest(app).post('/user/addSelectedBanner').send(mockReqBody);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAddBannerResponse);
    });

    it('should return 400 if the body is undefined', async () => {
      const mockReqBody = {};

      const response = await supertest(app).post('/user/addSelectedBanner').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 if the req username is undefined', async () => {
      const mockReqBody = {
        banner: '#0000FF',
      };

      const response = await supertest(app).post('/user/addSelectedBanner').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 if the req username is empty', async () => {
      const mockReqBody = {
        username: '',
        banner: '#0000FF',
      };

      const response = await supertest(app).post('/user/addSelectedBanner').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 if the req banner is undefined', async () => {
      const mockReqBody = {
        username: 'timothee',
      };

      const response = await supertest(app).post('/user/addSelectedBanner').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 if the req banner is empty string', async () => {
      const mockReqBody = {
        username: 'timothee',
        banner: '',
      };

      const response = await supertest(app).post('/user/addSelectedBanner').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 500 if there is an error getting the user', async () => {
      const mockReqBody = {
        username: 'rosa',
        banner: '#0000FF',
      };

      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error getting user' });
      const response = await supertest(app).post('/user/addSelectedBanner').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toEqual('Error when adding selected banner: Error: Error getting user');
    });

    it('should return 500 if there is an error updating the user', async () => {
      const mockReqBody = {
        username: 'holt',
        banner: '#0000FF',
      };

      const mockNoBannerUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'holt',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        banners: ['#0000FF'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockNoBannerUser);
      updatedUserSpy.mockResolvedValueOnce({ error: 'Error updating user' });

      const response = await supertest(app).post('/user/addSelectedBanner').send(mockReqBody);
      expect(response.status).toBe(500);
      expect(response.text).toEqual(
        'Error when adding selected banner: Error: Error updating user',
      );
    });
  });

  describe('GET /getQuestionsAsked', () => {
    it('should get all the questions asked by a user', async () => {
      const userQuestions = [ALL_QUESTIONS[1], ALL_QUESTIONS[0]];
      const foundQuestions = userQuestions.map(q => simplifyQuestion(q));

      const askerUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'q_by1',
        dateJoined: new Date('2023-05-19T09:24:0'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [ALL_QUESTIONS[1], ALL_QUESTIONS[0]],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(askerUser);
      getQuestionsByOrderSpy.mockResolvedValueOnce(ALL_QUESTIONS);
      filterQuestionsByAskedBySpy.mockReturnValueOnce(userQuestions);

      const response = await supertest(app).get('/user/getQuestionsAsked/q_by1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(foundQuestions);
    });

    it('should return a 404 if not given a username', async () => {
      const response = await supertest(app).get('/user/getQuestionsAsked');
      expect(response.status).toBe(404);
    });

    it('should return an empty list if there are no questions at all', async () => {
      const askerUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'q_by1',
        dateJoined: new Date('2023-05-19T09:24:0'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(askerUser);
      getQuestionsByOrderSpy.mockResolvedValueOnce([]);
      filterQuestionsByAskedBySpy.mockReturnValueOnce([]);

      const response = await supertest(app).get('/user/getQuestionsAsked/q_by1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return an empty list if there are no questions with said user', async () => {
      const askerUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'q_by1',
        dateJoined: new Date('2023-05-19T09:24:0'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(askerUser);
      getQuestionsByOrderSpy.mockResolvedValueOnce([ALL_QUESTIONS[2]]);
      filterQuestionsByAskedBySpy.mockReturnValueOnce([]);

      const response = await supertest(app).get('/user/getQuestionsAsked/q_by1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 500 if there is an error getting the user', async () => {
      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error getting user' });

      const response = await supertest(app).get('/user/getQuestionsAsked/q_by1');

      expect(response.status).toBe(500);
      expect(response.text).toEqual(
        'Error when getting questions asked: Error: Error getting user',
      );
    });

    it('should return 500 if there is an error with getting the questions', async () => {
      const askerUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'q_by1',
        dateJoined: new Date('2023-05-19T09:24:0'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(askerUser);
      getQuestionsByOrderSpy.mockRejectedValueOnce(new Error('Error fetching questions'));

      const response = await supertest(app).get('/user/getQuestionsAsked/q_by1');

      expect(response.status).toBe(500);
      expect(response.text).toEqual(
        'Error when getting questions asked: Error: Error fetching questions',
      );
    });

    it('should return 500 if there is an error with filtering questions', async () => {
      const askerUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'q_by1',
        dateJoined: new Date('2023-05-19T09:24:0'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(askerUser);
      getQuestionsByOrderSpy.mockRejectedValueOnce(ALL_QUESTIONS);
      filterQuestionsByAskedBySpy.mockImplementationOnce(() => {
        throw new Error('Error filtering questions');
      });

      const response = await supertest(app).get('/user/getQuestionsAsked/q_by1');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /getAnswersGiven', () => {
    it('should provide all the answers given by the user', async () => {
      const userAnswers = [ALL_ANSWERS[0], ALL_ANSWERS[2]];
      const foundAnswers = userAnswers.map(a => simplifyAnswer(a));

      const answererUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user1',
        dateJoined: new Date('2023-05-19T09:24:0'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [ALL_ANSWERS[0], ALL_ANSWERS[0]],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValue(answererUser);
      getAllAnswersSpy.mockResolvedValue(ALL_ANSWERS);

      const response = await supertest(app).get('/user/getAnswersGiven/user1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(foundAnswers);
    });

    it('should provide an empty list if there are no answers for the user ', async () => {
      const answererUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user5',
        dateJoined: new Date('2023-05-19T09:24:0'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValue(answererUser);
      getAllAnswersSpy.mockResolvedValue(ALL_ANSWERS);

      const response = await supertest(app).get('/user/getAnswersGiven/user5');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should provide an empty list if there are no answers at all ', async () => {
      const answererUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user1',
        dateJoined: new Date('2023-05-19T09:24:0'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValue(answererUser);
      getAllAnswersSpy.mockResolvedValue([]);

      const response = await supertest(app).get('/user/getAnswersGiven/user1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 500 if there is an error getting the user', async () => {
      getUserByUsernameSpy.mockResolvedValue({ error: 'Error getting user' });
      getAllAnswersSpy.mockResolvedValue([]);

      const response = await supertest(app).get('/user/getAnswersGiven/user5');

      expect(response.status).toBe(500);
      expect(response.text).toEqual('Error when getting answers given: Error: Error getting user');
    });

    it('should reutn 404 if a username is not provided', async () => {
      const response = await supertest(app).get('/user/getAnswersGiven');
      expect(response.status).toBe(404);
    });

    it('should return 500 if there is an error getting all answers', async () => {
      const answererUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user5',
        dateJoined: new Date('2023-05-19T09:24:0'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValue(answererUser);
      getAllAnswersSpy.mockRejectedValue(new Error('Error fetching answers'));

      const response = await supertest(app).get('/user/getAnswersGiven/user5');

      expect(response.status).toBe(500);
      expect(response.text).toEqual(
        'Error when getting answers given: Error: Error fetching answers',
      );
    });
  });

  describe('GET /getVoteCount', () => {
    it('should get the vote count for a user', async () => {
      const voter: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user5',
        dateJoined: new Date('2023-05-19T09:24:0'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 5,
      };

      getUserByUsernameSpy.mockResolvedValue(voter);
      getVotesSpy.mockResolvedValue(5);

      const response = await supertest(app).get('/user/getVoteCount/user5');
      expect(response.status).toBe(200);
      expect(response.text).toEqual('5');
    });

    it('should get 0 for a user who has not voted', async () => {
      const nonVoter: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user5',
        dateJoined: new Date('2023-05-19T09:24:0'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValue(nonVoter);
      getVotesSpy.mockResolvedValue(0);

      const response = await supertest(app).get('/user/getVoteCount/user5');
      expect(response.status).toBe(200);
      expect(response.text).toEqual('0');
    });

    it('should return 404 if not given a username', async () => {
      const response = await supertest(app).get('/user/getVoteCount');
      expect(response.status).toBe(404);
    });

    it('should return 500 if there is an error with getting the user', async () => {
      getUserByUsernameSpy.mockResolvedValue({ error: 'Error with getting the user' });

      const response = await supertest(app).get('/user/getVoteCount/user5');

      expect(response.status).toBe(500);
      expect(response.text).toEqual(
        'Error when getting number of up and down votes: Error: Error with getting the user',
      );
    });

    it('should return 500 if there is an error with getting the count', async () => {
      const nonVoter: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user5',
        dateJoined: new Date('2023-05-19T09:24:0'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValue(nonVoter);
      getVotesSpy.mockRejectedValue(new Error('Error fetching vote count'));

      const response = await supertest(app).get('/user/getVoteCount/user5');

      expect(response.status).toBe(500);
      expect(response.text).toEqual(
        'Error when getting number of up and down votes: Error: Error fetching vote count',
      );
    });
  });

  describe('PATCH /changeFrequency', () => {
    it('should change a user email frequency from weekly to hourly', async () => {
      const mockWeeklyUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        emailFrequency: 'weekly',
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockHourlyUser: SafeDatabaseUser = {
        _id: mockWeeklyUser._id,
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        emailFrequency: 'hourly',
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockUserHourlyJSONResponse = {
        _id: mockHourlyUser._id.toString(),
        username: 'user1',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        emailFrequency: 'hourly',
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user1',
        emailFreq: 'hourly',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockWeeklyUser);
      updatedUserSpy.mockResolvedValueOnce(mockHourlyUser);

      const response = await supertest(app).patch('/user/changeFrequency').send(mockReqBody);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserHourlyJSONResponse);
    });

    it('should change a user email frequency from weekly to daily', async () => {
      const mockWeeklyUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        emailFrequency: 'weekly',
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockDailyUser: SafeDatabaseUser = {
        _id: mockWeeklyUser._id,
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        emailFrequency: 'daily',
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockUserDailyJSONResponse = {
        _id: mockWeeklyUser._id.toString(),
        username: 'user1',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        emailFrequency: 'daily',
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user1',
        emailFreq: 'daily',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockWeeklyUser);
      updatedUserSpy.mockResolvedValueOnce(mockDailyUser);

      const response = await supertest(app).patch('/user/changeFrequency').send(mockReqBody);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserDailyJSONResponse);
    });

    it('should change a user email frequency from hourly to weekly', async () => {
      const mockWeeklyUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        emailFrequency: 'weekly',
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockHourlyUser: SafeDatabaseUser = {
        _id: mockWeeklyUser._id,
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        emailFrequency: 'hourly',
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockUserWeeklyJSONResponse = {
        _id: mockWeeklyUser._id.toString(),
        username: 'user1',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        emailFrequency: 'weekly',
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user1',
        emailFreq: 'weekly',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockHourlyUser);
      updatedUserSpy.mockResolvedValueOnce(mockWeeklyUser);

      const response = await supertest(app).patch('/user/changeFrequency').send(mockReqBody);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserWeeklyJSONResponse);
    });

    it('should change a user email frequency from daily to weekly', async () => {
      const mockWeeklyUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        emailFrequency: 'weekly',
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockDailyUser: SafeDatabaseUser = {
        _id: mockWeeklyUser._id,
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        emailFrequency: 'daily',
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockUserWeeklyJSONResponse = {
        _id: mockWeeklyUser._id.toString(),
        username: 'user1',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        emailFrequency: 'weekly',
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user1',
        emailFreq: 'weekly',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockDailyUser);
      updatedUserSpy.mockResolvedValueOnce(mockWeeklyUser);

      const response = await supertest(app).patch('/user/changeFrequency').send(mockReqBody);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserWeeklyJSONResponse);
    });

    it('should change a user email frequency from hourly to daily', async () => {
      const mockHourlyUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        emailFrequency: 'weekly',
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockDailyUser: SafeDatabaseUser = {
        _id: mockHourlyUser._id,
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        emailFrequency: 'daily',
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockUserDailyJSONResponse = {
        _id: mockHourlyUser._id.toString(),
        username: 'user1',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        emailFrequency: 'daily',
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user1',
        emailFreq: 'daily',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockHourlyUser);
      updatedUserSpy.mockResolvedValueOnce(mockDailyUser);

      const response = await supertest(app).patch('/user/changeFrequency').send(mockReqBody);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserDailyJSONResponse);
    });

    it('should change a user email frequency from daily to hourly', async () => {
      const mockHourlyUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        emailFrequency: 'hourly',
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockDailyUser: SafeDatabaseUser = {
        _id: mockHourlyUser._id,
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        emailFrequency: 'daily',
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockUserHourlyJSONResponse = {
        _id: mockHourlyUser._id.toString(),
        username: 'user1',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        emailFrequency: 'hourly',
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user1',
        emailFreq: 'daily',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockDailyUser);
      updatedUserSpy.mockResolvedValueOnce(mockHourlyUser);

      const response = await supertest(app).patch('/user/changeFrequency').send(mockReqBody);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserHourlyJSONResponse);
    });

    it('should return 400 if the request body is undefineed', async () => {
      const mockReqBody = {};

      const response = await supertest(app).patch('/user/changeFrequency').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 if the request username is undefineed', async () => {
      const mockReqBody = {
        emailFreq: 'daily',
      };

      const response = await supertest(app).patch('/user/changeFrequency').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 if the request username is empty', async () => {
      const mockReqBody = {
        username: '',
        emailFreq: 'daily',
      };

      const response = await supertest(app).patch('/user/changeFrequency').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 if the request emailFreq is undefined', async () => {
      const mockReqBody = {
        username: 'user1',
      };

      const response = await supertest(app).patch('/user/changeFrequency').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 if the request emailFreq is empty', async () => {
      const mockReqBody = {
        username: 'user1',
        emailFreq: '',
      };

      const response = await supertest(app).patch('/user/changeFrequency').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 if the request emailFreq is something not weekly, hourly, or daily', async () => {
      const mockReqBody = {
        username: 'user1',
        emailFreq: 'monthly',
      };

      const response = await supertest(app).patch('/user/changeFrequency').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 500 if there is an error getting the user', async () => {
      const mockReqBody = {
        username: 'user1',
        emailFreq: 'hourly',
      };

      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error getting user' });

      const response = await supertest(app).patch('/user/changeFrequency').send(mockReqBody);
      expect(response.status).toBe(500);
      expect(response.text).toEqual('Error changing the frequency: Error: Error getting user');
    });

    it('should return 500 if there is an error updating the user', async () => {
      const mockWeeklyUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        emailFrequency: 'weekly',
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user1',
        emailFreq: 'daily',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockWeeklyUser);
      updatedUserSpy.mockResolvedValueOnce({ error: 'Error updating the user' });

      const response = await supertest(app).patch('/user/changeFrequency').send(mockReqBody);
      expect(response.status).toBe(500);
      expect(response.text).toEqual('Error changing the frequency: Error: Error updating the user');
    });
  });

  describe('PATCH /muteNotifications', () => {
    it('should mute a user with a muted time already defined', async () => {
      const mockSafePrevMutedUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        mutedTime: new Date('March 17, 2025 03:24:00'),
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockSafeNewMutedUser: SafeDatabaseUser = {
        _id: mockSafePrevMutedUser._id,
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        mutedTime: new Date('April 8, 2025 05:00:00'),
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockUserJSONNewMutedResponse = {
        _id: mockSafePrevMutedUser._id.toString(),
        username: 'user1',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        mutedTime: new Date('April 8, 2025 05:00:00').toISOString(),
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user1',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafePrevMutedUser);
      updatedUserSpy.mockResolvedValueOnce(mockSafeNewMutedUser);

      const response = await supertest(app).patch('/user/muteNotification').send(mockReqBody);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONNewMutedResponse);
    });

    it('should mute a user with a muted time not defined', async () => {
      const mockSafePrevMutedUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockSafeNewMutedUser: SafeDatabaseUser = {
        _id: mockSafePrevMutedUser._id,
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        mutedTime: new Date('April 8, 2025 05:00:00'),
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockUserJSONNewMutedResponse = {
        _id: mockSafePrevMutedUser._id.toString(),
        username: 'user1',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        mutedTime: new Date('April 8, 2025 05:00:00').toISOString(),
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user1',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafePrevMutedUser);
      updatedUserSpy.mockResolvedValueOnce(mockSafeNewMutedUser);

      const response = await supertest(app).patch('/user/muteNotification').send(mockReqBody);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONNewMutedResponse);
    });

    it('should unmute a user with a muted time not defined', async () => {
      const mockSafeNewUnMutedUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        mutedTime: new Date('December 17, 1995 03:24:00'),
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockSafeNewMutedUser: SafeDatabaseUser = {
        _id: mockSafeNewUnMutedUser._id,
        username: 'user1',
        dateJoined: new Date('2024-12-03'),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        mutedTime: new Date('April 8, 2025 05:00:00'),
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockUserJSONNewUnMutedResponse = {
        _id: mockSafeNewUnMutedUser._id.toString(),
        username: 'user1',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        mutedTime: new Date('December 17, 1995 03:24:00').toISOString(),
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'user1',
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeNewMutedUser);
      updatedUserSpy.mockResolvedValueOnce(mockSafeNewUnMutedUser);

      const response = await supertest(app).patch('/user/muteNotification').send(mockReqBody);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONNewUnMutedResponse);
    });

    it('should return 400 with a req username not defined', async () => {
      const mockReqBody = {};

      const response = await supertest(app).patch('/user/muteNotification').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 with empty req', async () => {
      const response = await supertest(app).patch('/user/muteNotification').send();
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 with empty username', async () => {
      const mockReqBody = {
        username: '',
      };

      const response = await supertest(app).patch('/user/muteNotification').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });
  });
});
