import mongoose from 'mongoose';
import AnswerModel from './models/answers.model';
import QuestionModel from './models/questions.model';
import TagModel from './models/tags.model';
import ChallengeModel from './models/challenge.model';
import {
  Answer,
  Comment,
  DatabaseAnswer,
  DatabaseComment,
  DatabaseForum,
  DatabaseQuestion,
  DatabaseTag,
  DatabaseUser,
  Forum,
  Tag,
  User,
  Challenge,
  DatabaseChallenge,
} from './types/types';
import {
  Q1_DESC,
  Q1_TXT,
  Q2_DESC,
  Q2_TXT,
  Q3_DESC,
  Q3_TXT,
  Q4_DESC,
  Q4_TXT,
  A1_TXT,
  A2_TXT,
  A3_TXT,
  A4_TXT,
  A5_TXT,
  A6_TXT,
  A7_TXT,
  A8_TXT,
  T1_NAME,
  T1_DESC,
  T2_NAME,
  T2_DESC,
  T3_NAME,
  T3_DESC,
  T4_NAME,
  T4_DESC,
  T5_NAME,
  T5_DESC,
  T6_NAME,
  T6_DESC,
  C1_TEXT,
  C2_TEXT,
  C3_TEXT,
  C4_TEXT,
  C5_TEXT,
  C6_TEXT,
  C7_TEXT,
  C8_TEXT,
  C9_TEXT,
  C10_TEXT,
  C11_TEXT,
  C12_TEXT,
} from './data/posts_strings';
import CommentModel from './models/comments.model';
import UserModel from './models/users.model';
import ForumModel from './models/forum.model';

// Pass URL of your mongoDB instance as first argument(e.g., mongodb://127.0.0.1:27017/fake_so)
const userArgs = process.argv.slice(2);

if (!userArgs[0].startsWith('mongodb')) {
  throw new Error('ERROR: You need to specify a valid mongodb URL as the first argument');
}

const mongoDB = userArgs[0];
mongoose.connect(mongoDB);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

/**
 * Creates a new Tag document in the database.
 *
 * @param name The name of the tag.
 * @param description The description of the tag.
 * @returns A Promise that resolves to the created Tag document.
 * @throws An error if the name is empty.
 */
async function tagCreate(name: string, description: string): Promise<DatabaseTag> {
  if (name === '') throw new Error('Invalid Tag Format');
  const tag: Tag = { name: name, description: description };
  return await TagModel.create(tag);
}

/**
 * Creates a new Comment document in the database.
 *
 * @param text The content of the comment.
 * @param commentBy The username of the user who commented.
 * @param commentDateTime The date and time when the comment was posted.
 * @returns A Promise that resolves to the created Comment document.
 * @throws An error if any of the parameters are invalid.
 */
async function commentCreate(
  text: string,
  commentBy: string,
  commentDateTime: Date,
): Promise<DatabaseComment> {
  if (text === '' || commentBy === '' || commentDateTime == null)
    throw new Error('Invalid Comment Format');
  const commentDetail: Comment = {
    text: text,
    commentBy: commentBy,
    commentDateTime: commentDateTime,
  };
  return await CommentModel.create(commentDetail);
}

/**
 * Creates a new Answer document in the database.
 *
 * @param text The content of the answer.
 * @param ansBy The username of the user who wrote the answer.
 * @param ansDateTime The date and time when the answer was created.
 * @param comments The comments that have been added to the answer.
 * @returns A Promise that resolves to the created Answer document.
 * @throws An error if any of the parameters are invalid.
 */
async function answerCreate(
  text: string,
  ansBy: string,
  ansDateTime: Date,
  comments: Comment[],
): Promise<DatabaseAnswer> {
  if (text === '' || ansBy === '' || ansDateTime == null || comments == null)
    throw new Error('Invalid Answer Format');
  const answerDetail: Answer = {
    text: text,
    ansBy: ansBy,
    ansDateTime: ansDateTime,
    comments: comments,
  };
  return await AnswerModel.create(answerDetail);
}

/**
 * Creates a new Question document in the database.
 *
 * @param title The title of the question.
 * @param text The content of the question.
 * @param tags An array of tags associated with the question.
 * @param answers An array of answers associated with the question.
 * @param askedBy The username of the user who asked the question.
 * @param askDateTime The date and time when the question was asked.
 * @param views An array of usernames who have viewed the question.
 * @param comments An array of comments associated with the question.
 * @returns A Promise that resolves to the created Question document.
 * @throws An error if any of the parameters are invalid.
 */
async function questionCreate(
  title: string,
  text: string,
  tags: DatabaseTag[],
  answers: DatabaseAnswer[],
  askedBy: string,
  askDateTime: Date,
  views: string[],
  comments: Comment[],
): Promise<DatabaseQuestion> {
  if (
    title === '' ||
    text === '' ||
    tags.length === 0 ||
    askedBy === '' ||
    askDateTime == null ||
    comments == null
  )
    throw new Error('Invalid Question Format');
  return await QuestionModel.create({
    title: title,
    text: text,
    tags: tags,
    askedBy: askedBy,
    answers: answers,
    views: views,
    askDateTime: askDateTime,
    upVotes: [],
    downVotes: [],
    comments: comments,
  });
}

/**
 * Creates a new Challenge document in the database.
 *
 * @param title The title of the challenge.
 * @param description The description of the challenge.
 * @param isActive Whether the challenge is active.
 * @param requirement The requirement object containing actionType, count, and timeframe.
 * @returns A Promise that resolves to the created Challenge document.
 */
async function challengeCreate(
  title: string,
  description: string,
  isActive: boolean,
  date: string,
): Promise<DatabaseChallenge> {
  return await ChallengeModel.create({
    title: title,
    description: description,
    isActive: isActive,
    date: date,
  });
}

async function userCreate(
  username: string,
  password: string,
  dateJoined: Date,
  biography?: string,
  emails?: string[],
  badges?: string[],
  banners?: string[],
  streak?: Date[],
  activityLog?: { [date: string]: { votes: number; questions: number; answers: number } },
  browserNotif?: boolean,
  emailNotif?: boolean,
  mutedTime?: Date,
  challenges?: {
    commentPosted?: boolean;
    threeUpvotes?: boolean;
    [key: string]: boolean | undefined;
  },
  challengeCompletions?: { challenge: string; date: string }[],
): Promise<DatabaseUser> {
  if (username === '' || password === '' || dateJoined === null) {
    throw new Error('Invalid User Format');
  }

  const userDetail: User = {
    username,
    password,
    dateJoined,
    biography: biography ?? '',
    emails: emails ?? [],
    badges: badges ?? [],
    banners: banners ?? [],
    selectedBanner: '#dddddd',
    streak: streak ?? [new Date(0)],
    activityLog: activityLog ?? {},
    pinnedBadge: [],
    browserNotif: browserNotif ?? false,
    emailNotif: emailNotif ?? false,
    emailFrequency: 'weekly',
    questionsAsked: [],
    answersGiven: [],
    numUpvotesDownvotes: 0,
    mutedTime: mutedTime ?? new Date('December 17, 1995 03:24:00'),
    challenges: challenges ?? {},
    challengeCompletions: challengeCompletions ?? [],
  };

  return await UserModel.create(userDetail);
}

async function forumCreate(
  name: string,
  description: string,
  createdBy: string,
  createDateTime: Date,
  type: string,
): Promise<DatabaseForum> {
  if (
    name === '' ||
    description === '' ||
    createdBy === '' ||
    createDateTime === null ||
    type === '' ||
    (type !== 'public' && type !== 'private')
  )
    throw new Error('Invalid Question Format');

  const newForum: Forum = {
    name,
    description,
    createdBy,
    createDateTime,
    moderators: [createdBy],
    members: [createdBy],
    awaitingMembers: [],
    bannedMembers: [],
    questions: [],
    type: type,
  };

  return await ForumModel.create(newForum);
}

/**
 * Populates the database with predefined data.
 * Logs the status of the operation to the console.
 */
const populate = async () => {
  try {
    await userCreate(
      'sana',
      'sanaPassword',
      new Date('2023-12-11T03:30:00'),
      'I am a software engineer.',
      ['raisa16h21@gmail.com', 'baig.ar@northeastern.edu'],
      [],
      [],
      undefined,
      undefined,
      true,
      true,
    );
    await userCreate(
      'ihba001',
      'SomePassword#123',
      new Date('2022-12-11T03:30:00'),
      'I am a student.',
    );
    await userCreate(
      'saltyPeter',
      'VeryStrongPassword#!@',
      new Date('2023-12-11T03:30:00'),
      'I am a chef.',
      undefined,
      ['/badge_images/First_Post_Badge.png'],
      ['lightblue'],
    );
    await userCreate(
      'monkeyABC',
      'password',
      new Date('2023-11-11T03:30:00'),
      'I am a monkey.',
      ['raisa16h21@gmail.com', 'emcd.ny@gmail.com', 'bhuiyan.r@northeastern.edu'],
      ['/badge_images/First_Post_Badge.png'],
      ['lightblue'],
      [new Date('2025-04-07T18:32:05.527Z')],
      {},
      true,
      false,
    );
    await userCreate('hamkalo', 'redapplecar', new Date('2023-12-02T03:30:00'), 'I am a hamster.');
    await userCreate(
      'azad',
      'treeorangeBike',
      new Date('2023-06-11T03:30:00'),
      'I am a free spirit.',
    );
    await userCreate(
      'abhi3241',
      '112@realpassword',
      new Date('2023-01-12T03:30:00'),
      'I am a student.',
    );
    await userCreate(
      'Joji John',
      'jurassicPark#12',
      new Date('2023-10-11T03:30:00'),
      'I like Jurassic Park.',
      undefined,
      ['/badge_images/First_Post_Badge.png'],
      ['lightblue'],
    );
    await userCreate(
      'abaya',
      'letmein',
      new Date('2023-04-20T03:30:00'),
      'I like fashion designing.',
    );
    await userCreate(
      'mackson3332',
      'TrIcKyPhRaSe',
      new Date('2023-07-26T03:30:00'),
      'I am a magician.',
    );
    await userCreate(
      'alia',
      'correcthorsebatterystaple',
      new Date('2023-03-19T03:30:00'),
      'I am an actress.',
    );
    await userCreate(
      'elephantCDE',
      'ElephantPass123',
      new Date('2023-05-10T14:28:01'),
      'I am an elephant lover.',
      undefined,
      ['/badge_images/First_Post_Badge.png'],
      ['lightblue'],
    );
    await userCreate('asdf', 'asdf', new Date('2025-03-14T21:42:53.585Z'));
    await userCreate(
      'bram',
      'bram',
      new Date('2025-03-17T19:40:24.720Z'),
      undefined,
      undefined,
      undefined,
      undefined,
      [new Date('2025-04-08T03:53:13.640Z')],
      {
        '2025-04-08': {
          votes: 0,
          questions: 1,
          answers: 0,
        },
      },
      false,
      false,
      undefined,
      undefined,
      [
        {
          challenge: 'commentPosted',
          date: '2025-04-08',
        },
        {
          challenge: 'questionPosted',
          date: '2025-04-08',
        },
      ],
    );
    await userCreate('felix', 'abc', new Date('2025-03-18T20:17:32.354Z'));
    await userCreate('felix3', 'abc', new Date('2025-03-20T21:55:44.098Z'));
    await userCreate(
      'test4',
      'test4',
      new Date('2025-03-21T19:05:36.403Z'),
      undefined,
      undefined,
      undefined,
      undefined,
      [new Date('2025-04-08T01:00:46.039Z')],
      {
        '2025-04-07': {
          votes: 2,
          questions: 3,
          answers: 0,
        },
        '2025-04-08': {
          votes: 0,
          questions: 2,
          answers: 0,
        },
      },
      false,
      false,
      undefined,
      undefined,
      [
        {
          challenge: 'commentPosted',
          date: '2025-04-08',
        },
        {
          challenge: 'questionPosted',
          date: '2025-04-08',
        },
      ],
    );
    await userCreate(
      'felix_test',
      'abc',
      new Date('2025-03-25T16:07:47.395Z'),
      'updated',
      undefined,
      [],
      [],
      [new Date('2025-04-08T02:02:42.885Z')],
      {
        '2025-04-05': {
          votes: 2,
          questions: 1,
          answers: 0,
        },
        '2025-04-07': {
          votes: 4,
          questions: 0,
          answers: 3,
        },
        '2025-04-08': {
          votes: 5,
          questions: 1,
          answers: 0,
        },
      },
      false,
      false,
      undefined,
      undefined,
      [
        {
          challenge: 'commentPosted',
          date: '2025-04-08',
        },
        {
          challenge: 'threeUpvotes',
          date: '2025-04-08',
        },
        {
          challenge: 'questionPosted',
          date: '2025-04-08',
        },
      ],
    );
    await userCreate('max-test', 'password', new Date('2025-03-26T22:33:29.398Z'));
    await userCreate('r_bhuiyan', '2025Neu', new Date('2025-04-01T18:53:47.182Z'));
    await userCreate(
      'j_peralta',
      'bk99',
      new Date('2025-04-01T18:55:26.031Z'),
      'I am in Brooklyn 99',
    );
    await userCreate('new_acc', '12345', new Date('2025-04-02T00:05:10.734Z'));
    await userCreate(
      'five_hargreeve',
      'umbrella',
      new Date('2025-04-05T06:26:58.495Z'),
      '',
      ['bhuiyan.r@northeastern.edu'],
      undefined,
      undefined,
      undefined,
      undefined,
      false,
      true,
    );
    await userCreate('r_bh', '01032003', new Date('2025-04-05T22:45:39.201Z'));

    await forumCreate(
      'test-forum',
      'hi this is a desc',
      'max-test',
      new Date('2025-03-26T22:33:44.398Z'),
      'public',
    );
    await forumCreate('hi', 'boo', 'sana', new Date('2025-03-26T22:33:44.996Z'), 'public');
    await forumCreate(
      'TestForum',
      'This is a test forum',
      'sana',
      new Date('2025-03-27T15:15:41.627Z'),
      'public',
    );
    await forumCreate(
      'A Private Forum...',
      'This is a private forum how ominous',
      'sana',
      new Date('2025-03-27T15:16:04.488Z'),
      'private',
    );
    await forumCreate('cat', 'meow', 'sana', new Date('2025-03-28T21:20:19.962'), 'public');
    await forumCreate(
      'this is a forum',
      'this is a forum description',
      'test4',
      new Date('2025-04-01T02:49:58.928Z'),
      'public',
    );
    await forumCreate(
      'forum question test',
      'my forum',
      'monkeyABC',
      new Date('2025-04-01T02:53:06.268Z'),
      'private',
    );
    await forumCreate(
      'apple',
      'fruit',
      'monkeyABC',
      new Date('2025-04-01T03:00:04.719Z'),
      'private',
    );
    await forumCreate(
      'macbook users',
      'a forum for ppl who use macs',
      'test4',
      new Date('2025-04-01T16:43:23.974Z'),
      'public',
    );
    await forumCreate(
      'linux',
      'a place to discuss linux',
      'test4',
      new Date('2025-04-01T16:44:09.486Z'),
      'public',
    );
    await forumCreate(
      'this is a forum 2',
      'example forum',
      'sana',
      new Date('2025-04-01T16:55:15.966Z'),
      'public',
    );
    await forumCreate(
      'Mitochondria',
      'The mitochondria is what?',
      'test4',
      new Date('2025-04-07T19:06:58.860Z'),
      'private',
    );
    await forumCreate(
      'Wicked Fans',
      'For those of us fans of the wicket movie...the musical who knows?',
      'sana',
      new Date('2025-04-07T22:45:05.443Z'),
      'public',
    );

    const t1 = await tagCreate(T1_NAME, T1_DESC);
    const t2 = await tagCreate(T2_NAME, T2_DESC);
    const t3 = await tagCreate(T3_NAME, T3_DESC);
    const t4 = await tagCreate(T4_NAME, T4_DESC);
    const t5 = await tagCreate(T5_NAME, T5_DESC);
    const t6 = await tagCreate(T6_NAME, T6_DESC);

    const c1 = await commentCreate(C1_TEXT, 'sana', new Date('2023-12-12T03:30:00'));
    const c2 = await commentCreate(C2_TEXT, 'ihba001', new Date('2023-12-01T15:24:19'));
    const c3 = await commentCreate(C3_TEXT, 'saltyPeter', new Date('2023-12-18T09:24:00'));
    const c4 = await commentCreate(C4_TEXT, 'monkeyABC', new Date('2023-12-20T03:24:42'));
    const c5 = await commentCreate(C5_TEXT, 'hamkalo', new Date('2023-12-23T08:24:00'));
    const c6 = await commentCreate(C6_TEXT, 'azad', new Date('2023-12-22T17:19:00'));
    const c7 = await commentCreate(C7_TEXT, 'hamkalo', new Date('2023-12-22T21:17:53'));
    const c8 = await commentCreate(C8_TEXT, 'alia', new Date('2023-12-19T18:20:59'));
    const c9 = await commentCreate(C9_TEXT, 'ihba001', new Date('2022-02-20T03:00:00'));
    const c10 = await commentCreate(C10_TEXT, 'abhi3241', new Date('2023-02-10T11:24:30'));
    const c11 = await commentCreate(C11_TEXT, 'Joji John', new Date('2023-03-18T01:02:15'));
    const c12 = await commentCreate(C12_TEXT, 'abaya', new Date('2023-04-10T14:28:01'));

    const a1 = await answerCreate(A1_TXT, 'hamkalo', new Date('2023-11-20T03:24:42'), [c1]);
    const a2 = await answerCreate(A2_TXT, 'azad', new Date('2023-11-23T08:24:00'), [c2]);
    const a3 = await answerCreate(A3_TXT, 'abaya', new Date('2023-11-18T09:24:00'), [c3]);
    const a4 = await answerCreate(A4_TXT, 'alia', new Date('2023-11-12T03:30:00'), [c4]);
    const a5 = await answerCreate(A5_TXT, 'sana', new Date('2023-11-01T15:24:19'), [c5]);
    const a6 = await answerCreate(A6_TXT, 'abhi3241', new Date('2023-02-19T18:20:59'), [c6]);
    const a7 = await answerCreate(A7_TXT, 'mackson3332', new Date('2023-02-22T17:19:00'), [c7]);
    const a8 = await answerCreate(A8_TXT, 'ihba001', new Date('2023-03-22T21:17:53'), [c8]);

    await questionCreate(
      Q1_DESC,
      Q1_TXT,
      [t1, t2],
      [a1, a2],
      'Joji John',
      new Date('2022-01-20T03:00:00'),
      ['sana', 'abaya', 'alia'],
      [c9],
    );
    await questionCreate(
      Q2_DESC,
      Q2_TXT,
      [t3, t4, t2],
      [a3, a4, a5],
      'saltyPeter',
      new Date('2023-01-10T11:24:30'),
      ['mackson3332'],
      [c10],
    );
    await questionCreate(
      Q3_DESC,
      Q3_TXT,
      [t5, t6],
      [a6, a7],
      'monkeyABC',
      new Date('2023-02-18T01:02:15'),
      ['monkeyABC', 'elephantCDE'],
      [c11],
    );
    await questionCreate(
      Q4_DESC,
      Q4_TXT,
      [t3, t4, t5],
      [a8],
      'elephantCDE',
      new Date('2023-03-10T14:28:01'),
      [],
      [c12],
    );

    await challengeCreate('New Horizons', 'Asked a question', true, '2025-04-08T00:00:00.000Z');
    await challengeCreate(
      'Conversationalist',
      'Answer a question',
      true,
      '2025-04-09T00:00:00.000Z',
    );
    await challengeCreate(
      'Community Engager',
      'Upvote 3 posts today',
      true,
      '2025-04-10T00:00:00.000Z',
    );
    await challengeCreate('New Horizons', 'Asked a question', true, '2025-04-11T00:00:00.000Z');
    await challengeCreate(
      'Conversationalist',
      'Answer a question',
      true,
      '2025-04-12T00:00:00.000Z',
    );
    await challengeCreate(
      'Community Engager',
      'Upvote 3 posts today',
      true,
      '2025-04-13T00:00:00.000Z',
    );
    await challengeCreate(
      'New Horizons',
      'Asked a question',
      true,
      '2025-04-14T00:00:00.000Z',
    );
    await challengeCreate(
      'Conversationalist',
      'Answer a question',
      true,
      '2025-04-15T00:00:00.000Z',
    );
    await challengeCreate(
      'Community Engager',
      'Upvote 3 posts today',
      true,
      '2025-04-16T00:00:00.000Z',
    );
    await challengeCreate(
      'New Horizons',
      'Asked a question',
      true,
      '2025-04-17T00:00:00.000Z',
    );
    await challengeCreate(
      'Conversationalist',
      'Answer a question',
      true,
      '2025-04-18T00:00:00.000Z',
    );
    await challengeCreate(
      'Community Engager',
      'Upvote 3 posts today',
      true,
      '2025-04-19T00:00:00.000Z',
    );
    await challengeCreate(
      'New Horizons',
      'Asked a question',
      true,
      '2025-04-20T00:00:00.000Z',
    );
    await challengeCreate(
      'Conversationalist',
      'Answer a question',
      true,
      '2025-04-21T00:00:00.000Z',
    );
    await challengeCreate(
      'Community Engager',
      'Upvote 3 posts today',
      true,
      '2025-04-22T00:00:00.000Z',
    );
    await challengeCreate(
      'New Horizons',
      'Asked a question',
      true,
      '2025-04-23T00:00:00.000Z',
    );
    await challengeCreate(
      'Conversationalist',
      'Answer a question',
      true,
      '2025-04-24T00:00:00.000Z',
    );
    await challengeCreate(
      'Community Engager',
      'Upvote 3 posts today',
      true,
      '2025-04-25T00:00:00.000Z',
    );
    await challengeCreate(
      'New Horizons',
      'Asked a question',
      true,
      '2025-04-26T00:00:00.000Z',
    );
    await challengeCreate(
      'Conversationalist',
      'Answer a question',
      true,
      '2025-04-27T00:00:00.000Z',
    );
    await challengeCreate(
      'Community Engager',
      'Upvote 3 posts today',
      true,
      '2025-04-28T00:00:00.000Z',
    );
    await challengeCreate(
      'New Horizons',
      'Asked a question',
      true,
      '2025-04-29T00:00:00.000Z',
    );
    await challengeCreate(
      'Conversationalist',
      'Answer a question',
      true,
      '2025-04-30T00:00:00.000Z',
    );
    await challengeCreate(
      'Community Engager',
      'Upvote 3 posts today',
      true,
      '2025-05-01T00:00:00.000Z',
    );

    console.log('Database populated');
  } catch (err) {
    console.log('ERROR: ' + err);
  } finally {
    if (db) db.close();
    console.log('done');
  }
};

populate();

console.log('Processing ...');
