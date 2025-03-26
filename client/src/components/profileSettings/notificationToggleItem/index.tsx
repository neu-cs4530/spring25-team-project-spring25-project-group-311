import './index.css';

const NotificationToggleItem = ({
  notifType,
  toggleNotif,
}: {
  notifType: string;
  toggleNotif: (notifType: string) => void;
}) => (
  <div className='notification-display'>
    <p>{notifType === 'browser' ? 'Browser-Side Notifications' : 'Email Notifications'}</p>
    <input type='checkbox' id='showPasswordToggle' onChange={() => toggleNotif(notifType)} />
  </div>
);

export default NotificationToggleItem;
