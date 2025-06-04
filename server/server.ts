// // Run this script to launch the server.

import {
  server,
  app,
  startServer,
  scheduleDailyEmails,
  scheduleHourlyEmails,
  scheduleWeeklyEmails,
} from './app';

startServer();
scheduleDailyEmails();
scheduleHourlyEmails();
scheduleWeeklyEmails();
export { app, server };
