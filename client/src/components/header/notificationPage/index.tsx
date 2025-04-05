import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

function NotificationPage = () => {
  const {
    showBrowserNotifs,
    setShowBrowserNotifs,
    unreadBrowserNotifs,
    error,
    handleReadNotification,
  } = useNotification();
  return (
    <Tabs defaultActiveKey='answers' id='justify-tab-example' justify>
      <Tab eventKey='answers' title='Answers to Your Questions'>
        Tab content for Home
      </Tab>
      <Tab eventKey='comments' title='Comments to Your Questions/Answers'>
        Tab content for Profile
      </Tab>
      <Tab eventKey='badge' title='New Badges'>
        Tab content for Loooonger Tab
      </Tab>
      <Tab eventKey='forum' title='New Posts in Forum'>
        Tab content for Contact
      </Tab>
      <Tab eventKey='permissions' title='Forum Permissions'>
        Tab content for Contact2
      </Tab>
    </Tabs>
  );
}

export default NotificationPage;

/*
{showBrowserNotifs && (
          <div>
            {unreadBrowserNotifs.map(bNotif => (
              <NotificationCard
                key={String(bNotif._id)}
                notification={bNotif}
                handleReadNotification={() => handleReadNotification(bNotif._id)}
              />
            ))}
          </div>
        )}
*/
