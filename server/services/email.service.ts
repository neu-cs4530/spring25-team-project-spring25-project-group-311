import { Error } from 'mongoose';
import { getTopFivePosts, getUserForums } from './forum.service';
import { getUserByUsername } from './user.service';

// This package does not support EMCA import types
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodemailer = require('nodemailer');

/**
 * Sends an emailt to the user about a summary of their forums.
 * @param username The username of the user to send the email to.
 */
const sendEmail = async (username: string) => {
  try {
    const foundUser = await getUserByUsername(username);
    if ('error' in foundUser) {
      throw new Error(foundUser.error);
    }

    if (!foundUser.emailNotif) {
      throw new Error('User not subscribed to email notifs');
    }

    const allUserForums = await getUserForums(foundUser.username);
    const topFivePostsPerForum = await Promise.all(allUserForums.map(f => getTopFivePosts(f.name)));

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'raisa16h21@gmail.com',
        pass: 'uqby iszq gtfa chld',
      },
    });

    let forumItems = `Hi ${username} here is your digest\n`;
    topFivePostsPerForum.forEach(forum => {
      forum.forEach(post => {
        forumItems += `\t${post.title}\n`;
        post.answers.forEach(answer => {
          forumItems += `\t\t${answer.text}\n`;
        });
        forumItems += `\n`;
      });
    });

    // Email content
    const mailOptions = {
      from: 'raisa16h21@gmail.com',
      to: foundUser.emails[0],
      subject: 'CodeTGT Email Digest',
      text: forumItems,
    };

    const email = transporter.sendMail(mailOptions, (error: Error) => {
      if (error) {
        throw new Error('Error sending out email');
      }
    });
    return email;
  } catch (error) {
    return { error: `Error occurred when updating user: ${error}` };
  }
};

export default sendEmail;
