import './index.css';

/**
 * EmailDisplayItem component displays an email and allows the user to select it to replace it.
 *
 * @param email: The email itself.
 * @param selectEmailToReplace: A function to select the email to as the email you want to replace.
 */
const EmailDisplayItem = ({
  email,
  selectEmail,
}: {
  email: string;
  selectEmail: (email: string) => void;
}) => (
  <div onClick={() => selectEmail(email)} className='emails-list-card'>
    <p>{email}</p>
  </div>
);

export default EmailDisplayItem;
