import './index.css';
import { SubscriptionType } from '../../../types/types';

const NotificationToggleItem = ({
  notifType,
  toggleNotif,
}: {
  notifType: SubscriptionType;
  toggleNotif: (notifType: SubscriptionType) => void;
}) => (
  <div className='notification-display'>
    <p>{notifType.type === 'browser' ? 'Browser-Side Notifications' : 'Email Notifications'}</p>
    <input type='checkbox' id='showPasswordToggle' onChange={() => toggleNotif(notifType)} />
  </div>
);

export default NotificationToggleItem;
