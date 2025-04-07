import './index.css';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

/**
 * EmailDisplayItem component displays an email and allows the user to select it to replace it.
 *
 * @param email: The email itself.
 * @param selectEmailToReplace: A function to select the email to as the email you want to replace.
 */
const EmailDisplayItem = ({
  email,
  selectReplaceEmail,
  currEditMode,
  toggleReplace,
  setDeleteEmail,
  handleDeleteEmail,
}: {
  email: string;
  selectReplaceEmail: (email: string) => void;
  currEditMode: boolean;
  toggleReplace: (val: boolean) => void;
  handleDeleteEmail: (email: string) => void;
  setDeleteEmail: (email: string) => void;
}) => (
  <div className='emails-list-card'>
    <p style={{ marginTop: '3%' }}>{email}</p>
    <FaPencilAlt
      className='edit-icon'
      onClick={() => {
        toggleReplace(currEditMode);
        selectReplaceEmail(email);
      }}
    />
    <FaTrash
      className='edit-icon'
      onClick={() => {
        setDeleteEmail(email);
        handleDeleteEmail(email);
      }}
    />
  </div>
);

export default EmailDisplayItem;
