import { useEffect, useState } from 'react';
import useUserContext from './useUserContext';
import { SafeDatabaseUser, UserUpdatePayload } from '../types/types';
import { getUsers } from '../services/userService';

/**
 * Hook to create the leaerboard page ranking users based on the number of badges they have.
 * @returns leaderboardlist ranking users.
 */
const useLeaderboardPage = () => {
  const { socket } = useUserContext();

  const [leaderboardList, setLeaderboardList] = useState<SafeDatabaseUser[]>([]);

  useEffect(() => {
    /**
     * Function to fetch users based and update the user list
     */
    const fetchData = async () => {
      try {
        const res = await getUsers();
        const sortedRes = res.sort((user1, user2) => {
          if (user1.badges.length > user2.badges.length) {
            return -1;
          }
          if (user1.badges.length < user2.badges.length) {
            return 1;
          }
          return 0;
        });
        setLeaderboardList(sortedRes || []);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    };

    /**
     * Removes a user from the userList using a filter
     * @param prevUserList the list of users
     * @param user the user to remove
     * @returns a list without the given user
     */
    const removeUserFromList = (prevUserList: SafeDatabaseUser[], user: SafeDatabaseUser) =>
      prevUserList.filter(otherUser => user.username !== otherUser.username);

    /**
     * Adds a user to the userList, if not present. Otherwise updates the user.
     * @param prevUserList the list of users
     * @param user the user to add
     * @returns a list with the user added, or updated if present.
     */
    const addUserToList = (prevUserList: SafeDatabaseUser[], user: SafeDatabaseUser) => {
      const userExists = prevUserList.some(otherUser => otherUser.username === user.username);

      if (userExists) {
        // Update the existing user
        return prevUserList.map(otherUser =>
          otherUser.username === user.username ? user : otherUser,
        );
      }

      return [user, ...prevUserList];
    };

    /**
     * Function to handle user updates from the socket.
     *
     * @param user - the updated user object.
     */
    const handleModifiedUserUpdate = (userUpdate: UserUpdatePayload) => {
      setLeaderboardList(prevUserList => {
        switch (userUpdate.type) {
          case 'created':
          case 'updated':
            return addUserToList(prevUserList, userUpdate.user);
          case 'deleted':
            return removeUserFromList(prevUserList, userUpdate.user);
          default:
            throw new Error('Invalid user update type');
        }
      });
    };

    fetchData();

    socket.on('userUpdate', handleModifiedUserUpdate);

    return () => {
      socket.off('userUpdate', handleModifiedUserUpdate);
    };
  }, [socket]);

  return { leaderboardList };
};

export default useLeaderboardPage;
