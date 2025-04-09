import { ObjectId } from 'mongodb';
import {
  DatabaseAnswer,
  DatabaseComment,
  DatabaseQuestion,
  DatabaseTag,
  PopulatedDatabaseQuestion,
  SafeDatabaseUser,
  User,
  PopulatedDatabaseForum,
  DatabaseForum,
  Forum,
} from '../types/types';
import { T1_DESC, T2_DESC, T3_DESC } from '../data/posts_strings';

export const tag1: DatabaseTag = {
  _id: new ObjectId('507f191e810c19729de860ea'),
  name: 'react',
  description: T1_DESC,
};

export const tag2: DatabaseTag = {
  _id: new ObjectId('65e9a5c2b26199dbcc3e6dc8'),
  name: 'javascript',
  description: T2_DESC,
};

export const tag3: DatabaseTag = {
  _id: new ObjectId('65e9b4b1766fca9451cba653'),
  name: 'android',
  description: T3_DESC,
};

export const com1: DatabaseComment = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6de'),
  text: 'com1',
  commentBy: 'com_by1',
  commentDateTime: new Date('2023-11-18T09:25:00'),
};

export const ans1: DatabaseAnswer = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6dc'),
  text: 'ans1',
  ansBy: 'ansBy1',
  ansDateTime: new Date('2023-11-18T09:24:00'),
  comments: [],
};

export const ans2: DatabaseAnswer = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6dd'),
  text: 'ans2',
  ansBy: 'ansBy2',
  ansDateTime: new Date('2023-11-20T09:24:00'),
  comments: [],
};

export const ans3: DatabaseAnswer = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6de'),
  text: 'ans3',
  ansBy: 'ansBy3',
  ansDateTime: new Date('2023-11-19T09:24:00'),
  comments: [],
};

export const ans4: DatabaseAnswer = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6df'),
  text: 'ans4',
  ansBy: 'ansBy4',
  ansDateTime: new Date('2023-11-19T09:24:00'),
  comments: [],
};

export const QUESTIONS: DatabaseQuestion[] = [
  {
    _id: new ObjectId('65e9b58910afe6e94fc6e6dc'),
    title: 'Quick question about storage on android',
    text: 'I would like to know the best way to go about storing an array on an android phone so that even when the app/activity ended the data remains',
    tags: [tag3._id, tag2._id],
    answers: [ans1._id, ans2._id],
    askedBy: 'q_by1',
    askDateTime: new Date('2023-11-16T09:24:00'),
    views: ['question1_user', 'question2_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
  {
    _id: new ObjectId('65e9b5a995b6c7045a30d823'),
    title: 'Object storage for a web application',
    text: 'I am currently working on a website where, roughly 40 million documents and images should be served to its users. I need suggestions on which method is the most suitable for storing content with subject to these requirements.',
    tags: [tag1._id, tag2._id],
    answers: [ans1._id, ans2._id, ans3._id],
    askedBy: 'q_by2',
    askDateTime: new Date('2023-11-17T09:24:00'),
    views: ['question2_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
  {
    _id: new ObjectId('65e9b9b44c052f0a08ecade0'),
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
  {
    _id: new ObjectId('65e9b716ff0e892116b2de09'),
    title: 'Unanswered Question #2',
    text: 'Does something like that exist?',
    tags: [],
    answers: [],
    askedBy: 'q_by4',
    askDateTime: new Date('2023-11-20T09:24:00'),
    views: [],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
];

export const POPULATED_QUESTIONS: PopulatedDatabaseQuestion[] = [
  {
    _id: new ObjectId('65e9b58910afe6e94fc6e6dc'),
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
    _id: new ObjectId('65e9b5a995b6c7045a30d823'),
    title: 'Object storage for a web application',
    text: 'I am currently working on a website where, roughly 40 million documents and images should be served to its users. I need suggestions on which method is the most suitable for storing content with subject to these requirements.',
    tags: [tag1, tag2],
    answers: [
      { ...ans1, comments: [] },
      { ...ans2, comments: [] },
      { ...ans3, comments: [] },
    ],
    askedBy: 'q_by2',
    askDateTime: new Date('2023-11-17T09:24:00'),
    views: ['question2_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
  {
    _id: new ObjectId('65e9b9b44c052f0a08ecade0'),
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
  {
    _id: new ObjectId('65e9b716ff0e892116b2de09'),
    title: 'Unanswered Question #2',
    text: 'Does something like that exist?',
    tags: [],
    answers: [],
    askedBy: 'q_by4',
    askDateTime: new Date('2023-11-20T09:24:00'),
    views: [],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
];

export const user: User = {
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

export const safeUser: SafeDatabaseUser = {
  _id: new ObjectId(),
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

// FORUM MOCK DATA

export const forum: Forum = {
  name: 'Forum',
  description: 'This is a forum',
  createdBy: 'user123',
  createDateTime: new Date(),
  moderators: ['user123'],
  members: ['user123'],
  awaitingMembers: [],
  bannedMembers: [],
  questions: [],
  type: 'public',
};

export const forum2: Forum = {
  name: 'Second forum',
  description: 'we love cats',
  createdBy: 'user123',
  createDateTime: new Date(),
  moderators: ['user123'],
  members: ['user123'],
  awaitingMembers: [],
  bannedMembers: [],
  questions: [],
  type: 'public',
};

export const FORUMS: DatabaseForum[] = [
  {
    _id: new ObjectId('67f5505718865f92b7bcd0a0'),
    name: 'Apple users',
    description: 'A forum for macbook enjoyers',
    createdBy: 'fby1',
    createDateTime: new Date('2024-12-03'),
    moderators: ['fby1'],
    members: ['fby1', 'user1'],
    awaitingMembers: [],
    bannedMembers: [],
    questions: [QUESTIONS[0]._id],
    type: 'public',
  },
  {
    _id: new ObjectId('67f550fb443cc714d61b7c66'),
    name: 'Windows users',
    description: 'A forum for PC enjoyers',
    createdBy: 'fby2',
    createDateTime: new Date('2024-12-03'),
    moderators: ['fby2'],
    members: ['fby2', 'user2'],
    awaitingMembers: ['user3'],
    bannedMembers: [],
    questions: [QUESTIONS[1]._id],
    type: 'private',
  },
  {
    _id: new ObjectId('67f55100a3e3397af21a72e9'),
    name: 'Andriod users',
    description: 'A forum for andriod enjoyers',
    createdBy: 'fby3',
    createDateTime: new Date('2024-12-03'),
    moderators: ['fby3'],
    members: ['fby3', 'user3'],
    awaitingMembers: [],
    bannedMembers: ['user4'],
    questions: [QUESTIONS[2]._id, QUESTIONS[3]._id],
    type: 'public',
  },
];

export const POPULATED_FORUMS: PopulatedDatabaseForum[] = [
  {
    _id: new ObjectId('67f5505718865f92b7bcd0a0'),
    name: 'Apple users',
    description: 'A forum for macbook enjoyers',
    createdBy: 'fby1',
    createDateTime: new Date('2024-12-03'),
    moderators: ['fby1'],
    members: ['fby1', 'user1'],
    awaitingMembers: [],
    bannedMembers: [],
    questions: [POPULATED_QUESTIONS[0]],
    type: 'public',
  },
  {
    _id: new ObjectId('67f550fb443cc714d61b7c66'),
    name: 'Windows users',
    description: 'A forum for PC enjoyers',
    createdBy: 'fby2',
    createDateTime: new Date('2024-12-03'),
    moderators: ['fby2'],
    members: ['fby2', 'user2'],
    awaitingMembers: ['user3'],
    bannedMembers: [],
    questions: [POPULATED_QUESTIONS[1]],
    type: 'private',
  },
  {
    _id: new ObjectId('67f55100a3e3397af21a72e9'),
    name: 'Andriod users',
    description: 'A forum for andriod enjoyers',
    createdBy: 'fby3',
    createDateTime: new Date('2024-12-03'),
    moderators: ['fby3'],
    members: ['fby3', 'user3'],
    awaitingMembers: [],
    bannedMembers: ['user4'],
    questions: [POPULATED_QUESTIONS[2], POPULATED_QUESTIONS[3]],
    type: 'public',
  },
];
