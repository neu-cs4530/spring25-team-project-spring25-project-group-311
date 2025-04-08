// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
// startServer() is a function that starts the server
// the server will listen on .env.CLIENT_URL if set, otherwise 8000
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { Server } from 'socket.io';
import * as http from 'http';

import answerController from './controllers/answer.controller';
import questionController from './controllers/question.controller';
import tagController from './controllers/tag.controller';
import commentController from './controllers/comment.controller';
import { FakeSOSocket } from './types/types';
import forumController from './controllers/forum.controller';
import userController from './controllers/user.controller';
import messageController from './controllers/message.controller';
import chatController from './controllers/chat.controller';
import gameController from './controllers/game.controller';
import readStatusController from './controllers/readStatus.controller';
import notificationController from './controllers/notification.controller';
import { getUsersList } from './services/user.service';
import sendEmail from './services/email.service';
import challengeController from './controllers/challenges.controller';

dotenv.config();

const MONGO_URL = `${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017'}/fake_so`;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const port = parseInt(process.env.PORT || '8000');

const app = express();
const server = http.createServer(app);
const socket: FakeSOSocket = new Server(server, {
  cors: { origin: '*' },
});

// This package does not support EMCA import types
// eslint-disable-next-line @typescript-eslint/no-var-requires
const schedule = require('node-schedule');

function connectDatabase() {
  return mongoose.connect(MONGO_URL).catch(err => console.log('MongoDB connection error: ', err));
}

function startServer() {
  connectDatabase();
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

/**
 * Schedules all the hourly email jobs
 */
async function scheduleHourlyEmails() {
  try {
    const allUsers = await getUsersList();
    if ('error' in allUsers) {
      throw Error('error getting users');
    }
    allUsers.forEach(user => {
      // Sends every half an hour.
      if (user.emailNotif && user.emailFrequency == 'hourly') {
        schedule.scheduleJob('30 * * * *', async () => {
          console.log('Hourly email sending scheduled.');
          await sendEmail(user.username);
        });
      }
    });
  } catch (error) {
    console.log('Error sending emails');
  }
}

/**
 * Schedules all the daily email jobs
 */
async function scheduleDailyEmails() {
  try {
    const allUsers = await getUsersList();
    if ('error' in allUsers) {
      throw Error('error getting users');
    }
    allUsers.forEach(user => {
      // Sends every day at 6:30PM
      if (user.emailNotif && user.emailFrequency == 'daily') {
        schedule.scheduleJob('30 18 * * *', async () => {
          await sendEmail(user.username);
        });
      }
    });
  } catch (error) {
    console.log('Error sending emails');
  }
}

/**
 * Schedules all the weekly email jobs
 */
async function scheduleWeeklyEmails() {
  try {
    const allUsers = await getUsersList();
    if ('error' in allUsers) {
      throw Error('error getting users');
    }
    allUsers.forEach(user => {
      // Sends out every Friday at 6:30 PM
      if (user.emailNotif && user.emailFrequency == 'weekly') {
        schedule.scheduleJob('30 18 * * 5', async () => {
          await sendEmail(user.username);
        });
        console.log('woo');
      }
    });
  } catch (error) {
    console.log('Error sending emails');
  }
}

socket.on('connection', socket => {
  console.log('A user connected ->', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  socket.close();

  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

app.use(
  cors({
    credentials: true,
    origin: [CLIENT_URL],
  }),
);

app.use(express.json());

app.get('/', (_: Request, res: Response) => {
  res.send('hello world');
  res.end();
});

app.use('/question', questionController(socket));
app.use('/tag', tagController());
app.use('/forum', forumController(socket));
app.use('/answer', answerController(socket));
app.use('/comment', commentController(socket));
app.use('/messaging', messageController(socket));
app.use('/user', userController(socket));
app.use('/chat', chatController(socket));
app.use('/games', gameController(socket));
app.use('/read-status', readStatusController());
app.use('/notification', notificationController(socket));
app.use('/challenges', challengeController(socket));

// Export the app instance
export {
  app,
  server,
  startServer,
  scheduleHourlyEmails,
  scheduleDailyEmails,
  scheduleWeeklyEmails,
};
