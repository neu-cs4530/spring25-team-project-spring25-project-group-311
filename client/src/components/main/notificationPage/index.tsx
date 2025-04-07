import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import useNotification from '../../../hooks/useNotification';
import NotificationCard from './notificationCard';

const NotificationPage = () => {
  const { unreadBrowserNotifs, error, handleReadNotification } = useNotification();

  const ansFilter = unreadBrowserNotifs.filter(notif =>
    notif.title.includes('New Answer to Your Post'),
  );
  const commentFilter = unreadBrowserNotifs.filter(notif =>
    notif.title.includes('New Comment to Your Post'),
  );
  const badgeFilter = unreadBrowserNotifs.filter(notif => notif.title.includes('New Badge Added'));
  const forumPostFilter = unreadBrowserNotifs.filter(notif =>
    notif.title.includes('New Post in One of Your Forums'),
  );
  const forumPermissionFilter = unreadBrowserNotifs.filter(notif =>
    notif.title.includes('Forum Permission Update'),
  );

  const ansTitle =
    ansFilter.length > 0
      ? `Answers to Your Question (${ansFilter.length})`
      : 'Answers to Your Question';
  const comTitle =
    commentFilter.length > 0
      ? `Comments to Your Questions/Answers (${commentFilter.length})`
      : 'Comments to Your Questions/Answers';
  const badgeTitle = badgeFilter.length > 0 ? `New Badges (${badgeFilter.length})` : 'New Badges';
  const forumPostTitle =
    forumPostFilter.length > 0
      ? `New Post in Forum (${forumPostFilter.length})`
      : 'New Post in Forum';
  const forumPermissionTitle =
    forumPermissionFilter.length > 0
      ? `Update to Forum Permissions (${forumPermissionFilter.length})`
      : 'Update to Forum Permissions';

  return (
    <>
      {error && <p>{error}</p>}
      <Tabs defaultActiveKey='answers' id='justify-tab-example' justify>
        <Tab eventKey='answers' title={ansTitle}>
          {ansFilter.map(bNotif => (
            <NotificationCard
              key={String(bNotif._id)}
              notification={bNotif}
              handleReadNotification={() => handleReadNotification(bNotif._id)}
            />
          ))}
        </Tab>
        <Tab eventKey='comments' title={comTitle}>
          {commentFilter.map(bNotif => (
            <NotificationCard
              key={String(bNotif._id)}
              notification={bNotif}
              handleReadNotification={() => handleReadNotification(bNotif._id)}
            />
          ))}
        </Tab>
        <Tab eventKey='badge' title={badgeTitle}>
          {badgeFilter.map(bNotif => (
            <NotificationCard
              key={String(bNotif._id)}
              notification={bNotif}
              handleReadNotification={() => handleReadNotification(bNotif._id)}
            />
          ))}
        </Tab>
        <Tab eventKey='forum' title={forumPostTitle}>
          {forumPostFilter.map(bNotif => (
            <NotificationCard
              key={String(bNotif._id)}
              notification={bNotif}
              handleReadNotification={() => handleReadNotification(bNotif._id)}
            />
          ))}
        </Tab>
        <Tab eventKey='permissions' title={forumPermissionTitle}>
          {forumPermissionFilter.map(bNotif => (
            <NotificationCard
              key={String(bNotif._id)}
              notification={bNotif}
              handleReadNotification={() => handleReadNotification(bNotif._id)}
            />
          ))}
        </Tab>
      </Tabs>
    </>
  );
};

export default NotificationPage;
