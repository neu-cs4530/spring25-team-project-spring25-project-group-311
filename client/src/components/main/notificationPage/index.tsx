import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import useNotification from '../../../hooks/useNotification';
import NotificationCard from './notificationCard';

const NotificationPage = () => {
  const { unreadBrowserNotifs, error, handleReadNotification } = useNotification();
  return (
    <>
      {error && <p>{error}</p>}
      <Tabs defaultActiveKey='answers' id='justify-tab-example' justify>
        <Tab eventKey='answers' title='Answers to Your Questions'>
          {unreadBrowserNotifs
            .filter(notif => notif.title.includes('New Answer to Your Post'))
            .map(bNotif => (
              <NotificationCard
                key={String(bNotif._id)}
                notification={bNotif}
                handleReadNotification={() => handleReadNotification(bNotif._id)}
              />
            ))}
        </Tab>
        <Tab eventKey='comments' title='Comments to Your Questions/Answers'>
          {unreadBrowserNotifs
            .filter(notif => notif.title.includes('New Comment to Your Post'))
            .map(bNotif => (
              <NotificationCard
                key={String(bNotif._id)}
                notification={bNotif}
                handleReadNotification={() => handleReadNotification(bNotif._id)}
              />
            ))}
        </Tab>
        <Tab eventKey='badge' title='New Badges'>
          {unreadBrowserNotifs
            .filter(notif => notif.title.includes('You have received a new badge'))
            .map(bNotif => (
              <NotificationCard
                key={String(bNotif._id)}
                notification={bNotif}
                handleReadNotification={() => handleReadNotification(bNotif._id)}
              />
            ))}
        </Tab>
        <Tab eventKey='forum' title='New Posts in Forum'>
          Tab content for Contact
        </Tab>
        <Tab eventKey='permissions' title='Forum Permissions'>
          Tab content for Contact2
        </Tab>
      </Tabs>
    </>
  );
};

export default NotificationPage;
