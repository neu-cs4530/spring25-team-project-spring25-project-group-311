import supertest from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import * as util from '../../services/user.service';
import { SafeDatabaseUser, User } from '../../types/types';

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

const mockSafeUser: SafeDatabaseUser = {
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
        newEmail: 'raisa16h21@gmail.com',
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
        newEmail: 'raisa16h21@gmail.com',
      };

      const response = await supertest(app).post('/user/addEmail').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request having empty username', async () => {
      const mockReqBody = {
        username: '',
        newEmail: 'raisa16h21@gmail.com',
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
        newEmail: '',
      };

      const response = await supertest(app).post('/user/addEmail').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request having an invalid email', async () => {
      const mockReqBody = {
        username: 'newUser',
        newEmail: 'abcefghijklmnopqrstuvwxyz',
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
        newEmail: 'raisa16h21@gmail.com',
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
        newEmail: 'raisa16h21@gmail.com',
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
        newEmail: 'raisa16h21@gmail.com',
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
        newEmail: 'raisa16h21@gmail.com',
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
      const mockReqBody = { username: 'newUser', newEmail: 'raisa16h21@gmail.com' };

      const response = await supertest(app).patch('/user/replaceEmail').send(mockReqBody);

      expect(response.status).toBe(404);
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        newEmail: 'raisa16h21@gmail.com',
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
        newEmail: 'raisa16h21@gmail.com',
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
        newEmail: '',
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
        newEmail: 'abcefghijklmnopqrstuvwxyz',
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
        newEmail: 'raisa16h21@gmail.com',
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
        newEmail: 'emcd.ny@gmail.com',
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
        newEmail: 'raisa16h21@gmail.com',
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
        newEmail: 'raisa16h21@gmail.com',
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

  describe('POST /addBadge', () => {
    it('should successfully add a badge given correct arguments', async () => {
      const safeUserBadges = {
        _id: new mongoose.Types.ObjectId(),
        username: 'newUser',
        dateJoined: new Date('2024-12-03'),
        emails: ['eroev@gmail.com'],
        badges: ['badge1', 'badge2'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockReqBody = {
        username: 'newUser',
        badge: 'badge3',
      };

      const mockSafeUserBadges = {
        _id: safeUserBadges._id,
        username: 'newUser',
        dateJoined: new Date('2024-12-03'),
        emails: ['eroev@gmail.com'],
        badges: ['badge1', 'badge2', 'badge3'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      const mockUserBadgeJSONResponse = {
        _id: mockSafeUserBadges._id.toString(),
        username: 'newUser',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: ['eroev@gmail.com'],
        badges: ['badge1', 'badge2', 'badge3'],
        browserNotif: false,
        emailNotif: false,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(safeUserBadges);

      updatedUserSpy.mockResolvedValueOnce(mockSafeUserBadges);

      const response = await supertest(app).post('/user/addBadges').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserBadgeJSONResponse);
      expect(updatedUserSpy).toHaveBeenCalledWith(safeUserBadges.username, {
        badges: ['badge1', 'badge2', 'badge3'],
      });
    });
  });

  describe('PATCH /changeSubscription', () => {
    it('should opt a user in for browser subscriptions', async () => {
      const mockReqBody = {
        username: 'user1',
        notifType: { type: 'browser' },
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
        notifType: { type: 'email' },
      };

      const emailNotifUser = {
        _id: mockSafeUser._id,
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

      const mockBrowserNotifResponse = {
        _id: emailNotifUser._id.toString(),
        username: 'user1',
        dateJoined: new Date('2024-12-03').toISOString(),
        emails: [],
        badges: [],
        browserNotif: false,
        emailNotif: true,
        questionsAsked: [],
        answersGiven: [],
        numUpvotesDownvotes: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);
      updatedUserSpy.mockResolvedValueOnce(emailNotifUser);

      const response = await supertest(app).patch('/user/changeSubscription').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBrowserNotifResponse);
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
        notifType: { type: 'browser' },
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
        notifType: { type: 'email' },
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
        notifType: { type: 'browser' },
      };

      const response = await supertest(app).patch('/user/changeSubscription').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return a 400 error if there is a blank username', async () => {
      const mockReqBody = {
        username: '',
        notifType: { type: 'browser' },
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
        notifType: { type: 'email' },
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
        notifType: { type: 'browser' },
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
});
