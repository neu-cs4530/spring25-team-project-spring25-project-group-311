import mongoose from 'mongoose';
import supertest from 'supertest';
import { ObjectId } from 'mongodb';
import {
  DatabaseQuestion,
  Question,
  SafeDatabaseUser,
  DatabaseNotification,
} from '@fake-stack-overflow/shared';
import { app } from '../../app';
import * as answerUtil from '../../services/answer.service';
import * as databaseUtil from '../../utils/database.util';
import * as questionUtil from '../../services/question.service';
import * as userUtil from '../../services/user.service';
import * as notifUtil from '../../services/notification.service';

const saveAnswerSpy = jest.spyOn(answerUtil, 'saveAnswer');
const addAnswerToQuestionSpy = jest.spyOn(answerUtil, 'addAnswerToQuestion');
const popDocSpy = jest.spyOn(databaseUtil, 'populateDocument');
const getQuestionByIDSpy = jest.spyOn(questionUtil, 'getQuestionByID');
const getUserByUsernameSpy = jest.spyOn(userUtil, 'getUserByUsername');
const saveNotificationSpy = jest.spyOn(notifUtil, 'saveNotification');

describe('POST /addAnswer', () => {
  it('should add a new answer to the question', async () => {
    const validQid = new mongoose.Types.ObjectId();

    const validQ: DatabaseQuestion = {
      title: 'What is love anyway',
      text: 'L is for I canot recall',
      tags: [],
      askedBy: 'singers',
      askDateTime: new Date('2024-01-01'),
      answers: [],
      views: [],
      upVotes: [],
      downVotes: [],
      comments: [],
      _id: validQid,
    };

    const validQNonDB: Question = {
      title: 'What is love anyway',
      text: 'L is for I canot recall',
      tags: [],
      askedBy: 'singers',
      askDateTime: new Date('2024-01-01'),
      answers: [],
      views: [],
      upVotes: [],
      downVotes: [],
      comments: [],
    };

    const validUser: SafeDatabaseUser = {
      _id: new mongoose.Types.ObjectId(),
      dateJoined: new Date('2023-01-01'),
      emails: [],
      badges: [],
      browserNotif: false,
      emailNotif: false,
      questionsAsked: [validQNonDB],
      answersGiven: [],
      numUpvotesDownvotes: 0,
      username: 'singers',
    };

    const savedNotif: DatabaseNotification = {
      title: 'New Answer to Your Post',
      text: 'A new answer has been given to your question: L is for I canot recall',
      type: 'browser',
      user: validUser._id,
      read: false,
      _id: new mongoose.Types.ObjectId(),
    };

    const validAid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const mockAnswer = {
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
    };
    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);

    addAnswerToQuestionSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer._id],
      comments: [],
    });

    popDocSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer],
      comments: [],
    });

    getQuestionByIDSpy.mockResolvedValueOnce(validQ);
    getUserByUsernameSpy.mockResolvedValueOnce(validUser);
    saveNotificationSpy.mockResolvedValueOnce(savedNotif);

    popDocSpy.mockResolvedValueOnce({
      title: 'New Answer to Your Post',
      text: 'A new answer has been given to your question: L is for I canot recall',
      type: 'browser',
      user: validUser,
      read: false,
      _id: savedNotif._id,
    });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(200);
    expect(getQuestionByIDSpy).toHaveBeenCalledWith(validQid.toString());
    expect(getUserByUsernameSpy).toHaveBeenCalledWith('singers');
    expect(saveNotificationSpy).toHaveBeenCalledWith({
      title: 'New Answer to Your Post',
      text: 'A new answer has been given to your question: L is for I canot recall',
      type: 'browser',
      user: validUser,
      read: false,
    });
    expect(response.body).toEqual({
      _id: validAid.toString(),
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: mockAnswer.ansDateTime.toISOString(),
      comments: [],
    });
  });

  it('should return 500 if error getting question by ID', async () => {
    const validQid = new mongoose.Types.ObjectId();

    const validAid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const mockAnswer = {
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
    };
    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);

    addAnswerToQuestionSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer._id],
      comments: [],
    });

    popDocSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer],
      comments: [],
    });

    getQuestionByIDSpy.mockResolvedValueOnce({ error: 'Error getting question' });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
  });

  it('should return 500 if there is an issue getting user', async () => {
    const validQid = new mongoose.Types.ObjectId();

    const validQ: DatabaseQuestion = {
      title: 'What is love anyway',
      text: 'L is for I canot recall',
      tags: [],
      askedBy: 'singers',
      askDateTime: new Date('2024-01-01'),
      answers: [],
      views: [],
      upVotes: [],
      downVotes: [],
      comments: [],
      _id: validQid,
    };

    const validAid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const mockAnswer = {
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
    };
    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);

    addAnswerToQuestionSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer._id],
      comments: [],
    });

    popDocSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer],
      comments: [],
    });

    getQuestionByIDSpy.mockResolvedValueOnce(validQ);
    getUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error getting user' });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
  });

  it('should return 500 if there is an issue saving notification', async () => {
    const validQid = new mongoose.Types.ObjectId();

    const validQ: DatabaseQuestion = {
      title: 'What is love anyway',
      text: 'L is for I canot recall',
      tags: [],
      askedBy: 'singers',
      askDateTime: new Date('2024-01-01'),
      answers: [],
      views: [],
      upVotes: [],
      downVotes: [],
      comments: [],
      _id: validQid,
    };

    const validQNonDB: Question = {
      title: 'What is love anyway',
      text: 'L is for I canot recall',
      tags: [],
      askedBy: 'singers',
      askDateTime: new Date('2024-01-01'),
      answers: [],
      views: [],
      upVotes: [],
      downVotes: [],
      comments: [],
    };

    const validUser: SafeDatabaseUser = {
      _id: new mongoose.Types.ObjectId(),
      dateJoined: new Date('2023-01-01'),
      emails: [],
      badges: [],
      browserNotif: false,
      emailNotif: false,
      questionsAsked: [validQNonDB],
      answersGiven: [],
      numUpvotesDownvotes: 0,
      username: 'singers',
    };

    const validAid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const mockAnswer = {
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
    };
    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);

    addAnswerToQuestionSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer._id],
      comments: [],
    });

    popDocSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer],
      comments: [],
    });

    getQuestionByIDSpy.mockResolvedValueOnce(validQ);
    getUserByUsernameSpy.mockResolvedValueOnce(validUser);
    saveNotificationSpy.mockResolvedValueOnce({ error: 'Error saving notif' });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
  });

  it('should return bad request error if answer text property is missing', async () => {
    const mockReqBody = {
      qid: 'dummyQuestionId',
      ans: {
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid answer');
  });

  it('should return bad request error if request body has qid property missing', async () => {
    const mockReqBody = {
      ans: {
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(400);
  });

  it('should return bad request error if answer object has ansBy property missing', async () => {
    const mockReqBody = {
      qid: 'dummyQuestionId',
      ans: {
        text: 'This is a test answer',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(400);
  });

  it('should return bad request error if answer object has ansDateTime property missing', async () => {
    const mockReqBody = {
      qid: 'dummyQuestionId',
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
      },
    };

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(400);
  });

  it('should return bad request error if request body is missing', async () => {
    const response = await supertest(app).post('/answer/addAnswer');

    expect(response.status).toBe(400);
  });

  it('should return database error in response if saveAnswer method throws an error', async () => {
    const validQid = new mongoose.Types.ObjectId().toString();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    saveAnswerSpy.mockResolvedValueOnce({ error: 'Error when saving an answer' });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
  });

  it('should return database error in response if update question method throws an error', async () => {
    const validQid = new mongoose.Types.ObjectId().toString();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const mockAnswer = {
      _id: new ObjectId('507f191e810c19729de860ea'),
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
    };

    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);
    addAnswerToQuestionSpy.mockResolvedValueOnce({ error: 'Error when adding answer to question' });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
  });

  it('should return database error in response if `populateDocument` method throws an error', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const mockAnswer = {
      _id: new ObjectId('507f191e810c19729de860ea'),
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
    };

    const mockQuestion = {
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer._id],
      comments: [],
    };

    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);
    addAnswerToQuestionSpy.mockResolvedValueOnce(mockQuestion);
    popDocSpy.mockResolvedValueOnce({ error: 'Error when populating document' });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
  });

  it('should add a new answer to the question', async () => {
    const validQid = new mongoose.Types.ObjectId();

    const validQ: DatabaseQuestion = {
      title: 'What is love anyway',
      text: 'L is for I canot recall',
      tags: [],
      askedBy: 'singers',
      askDateTime: new Date('2024-01-01'),
      answers: [],
      views: [],
      upVotes: [],
      downVotes: [],
      comments: [],
      _id: validQid,
    };

    const validQNonDB: Question = {
      title: 'What is love anyway',
      text: 'L is for I canot recall',
      tags: [],
      askedBy: 'singers',
      askDateTime: new Date('2024-01-01'),
      answers: [],
      views: [],
      upVotes: [],
      downVotes: [],
      comments: [],
    };

    const validUser: SafeDatabaseUser = {
      _id: new mongoose.Types.ObjectId(),
      dateJoined: new Date('2023-01-01'),
      emails: [],
      badges: [],
      browserNotif: false,
      emailNotif: false,
      questionsAsked: [validQNonDB],
      answersGiven: [],
      numUpvotesDownvotes: 0,
      username: 'singers',
    };

    const savedNotif: DatabaseNotification = {
      title: 'New Answer to Your Post',
      text: 'A new answer has been given to your question: L is for I canot recall',
      type: 'browser',
      user: validUser._id,
      read: false,
      _id: new mongoose.Types.ObjectId(),
    };

    const validAid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const mockAnswer = {
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
    };
    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);

    addAnswerToQuestionSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer._id],
      comments: [],
    });

    popDocSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer],
      comments: [],
    });

    getQuestionByIDSpy.mockResolvedValueOnce(validQ);
    getUserByUsernameSpy.mockResolvedValueOnce(validUser);
    saveNotificationSpy.mockResolvedValueOnce(savedNotif);
    popDocSpy.mockRejectedValue({ error: 'Error when populating document' });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
  });
});
