import './index.css';
import { FaPencilAlt } from 'react-icons/fa';

/**
 * EmailDisplayItem component displays an email and allows the user to select it to replace it.
 *
 * @param email: The email itself.
 * @param selectEmailToReplace: A function to select the email to as the email you want to replace.
 */
const EmailDisplayItem = ({
  email,
  selectEmail,
  currEditMode,
  toggleReplace,
}: {
  email: string;
  selectEmail: (email: string) => void;
  currEditMode: boolean;
  toggleReplace: (val: string) => void;
}) => (
  <div className='emails-list-card'>
    <p>{email}</p>
    <FaPencilAlt
      onClick={() => {
        toggleReplace(currEditMode);
        selectEmail(email);
      }}
    />
  </div>
);

export default EmailDisplayItem;
