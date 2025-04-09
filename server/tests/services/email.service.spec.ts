import mongoose from 'mongoose';
import UserModel from '../../models/users.model';
import { DatabaseForum } from '../../types/types';
import { safeUser, POPULATED_QUESTIONS } from '../mockData.models';
import ForumModel from '../../models/forum.model';
import sendEmail from '../../services/email.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodemailer = require('nodemailer');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

const sendMailMock = jest.fn().mockReturnValue('Sent Email');

// In order to return a specific value you can use this instead
// const sendMailMock = jest.fn().mockReturnValue(/* Whatever you would expect as return value */);

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockReturnValue(
      (
        mailoptions: {
          from: string;
          to: string;
          subject: string;
          text: string;
        },
        callback: (error: Error) => unknown,
      ) => {},
    ),
  }),
}));

beforeEach(() => {
  sendMailMock.mockClear();
  nodemailer.createTransport.mockClear();
});

describe('test sending email to user', () => {
  test('should send email to user', async () => {
    const userForum: DatabaseForum = {
      _id: new mongoose.Types.ObjectId(),
      name: 'forum1',
      description: 'this is a forum',
      createDateTime: new Date('2024-12-03'),
      createdBy: 'user1',
      moderators: ['user1'],
      members: ['user1'],
      awaitingMembers: [],
      bannedMembers: [],
      questions: [POPULATED_QUESTIONS[0]._id],
      type: 'private',
    };
    mockingoose(UserModel).toReturn(safeUser, 'findOne');
    mockingoose(ForumModel).toReturn([userForum], 'find');
    mockingoose(ForumModel).toReturn(userForum, 'findOne');

    const email = await sendEmail('user1');

    expect(email).toBeDefined();
  });
});
