import { Error } from 'mongoose';
import { getTopFivePosts, getUserForums } from './forum.service';
import { getUserByUsername } from './user.service';

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

    let forumItems = `Hi ${username} here is your digest`;
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
