import React from 'react';
import './index.css';

/**
 * EmailDisplayItem component displays an email and allows the user to select it to replace it.
 *
 * @param email: The email itself.
 * @param selectEmailToReplace: A function to select the email to as the email you want to replace.
 */
const EmailDisplayItem = ({
  email,
  selectEmailToReplace,
}: {
  email: string;
  selectEmailToReplace: (currEmail: string) => void;
}) => (
  <div onClick={() => selectEmailToReplace(email)} className='chats-list-card'>
    <p>{email}</p>
  </div>
);

export default EmailDisplayItem;
