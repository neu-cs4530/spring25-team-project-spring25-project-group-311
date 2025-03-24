import { useEffect, useState } from 'react';
import useUserContext from './useUserContext';
import { DatabaseForum, Forum, ForumUpdatePayload } from '../types/types';
import { getForums } from '../services/forumService';

/**
 * Custom hook for managing the forums list page state, filtering, and real-time updates.
 *
 * @returns forumList - The list of forums to display
 * @returns setForumFilter - Function to set the filtering value of the forum search.
 */
const useForumPage = () => {
  const { user, socket } = useUserContext();

  const [forumFilter, setForumFilter] = useState<string>('');
  const [forumList, setForumList] = useState<DatabaseForum[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const forums = await getForums();
        setForumList(forums || []);
        console.log('Forums fetched:', forums);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    };

    /**
     * Removes a forum from the forumList using a filter
     * @param prevForumList the list of forums
     * @param forum the forum to remove (names are unique)
     * @returns a list without the given forum
     */
    const removeForumFromList = (prevForumList: DatabaseForum[], forum: DatabaseForum) =>
      prevForumList.filter(otherForum => forum.name !== otherForum.name);

    /**
     * Adds a forum to the forumList, if not present. Otherwise updates the forum.
     * @param prevForumList the list of forums
     * @param forum the forum to add
     * @returns a list with the forum added, or updated if present.
     */
    const addForumToList = (prevForumList: DatabaseForum[], forum: DatabaseForum) => {
      const forumExists = prevForumList.some(otherForum => otherForum.name === forum.name);

      if (forumExists) {
        // Update the existing forum
        return prevForumList.map(otherForum =>
          otherForum.name === forum.name ? forum : otherForum,
        );
      }

      return [forum, ...prevForumList];
    };

    /**
     * Function to handle forum updates from the socket.
     *
     * @param forumUpdate - the updated forum object.
     */
    const handleModifiedForumUpdate = (forumUpdate: ForumUpdatePayload) => {
      setForumList(prevForumList => {
        switch (forumUpdate.type) {
          case 'created':
          case 'updated':
            return addForumToList(prevForumList, forumUpdate.forum);
          case 'deleted':
            return removeForumFromList(prevForumList, forumUpdate.forum);
          default:
            throw new Error('Invalid forum update type');
        }
      });
    };

    fetchData();

    socket.on('forumUpdate', handleModifiedForumUpdate);

    return () => {
      socket.off('forumUpdate', handleModifiedForumUpdate);
    };
  }, [socket]);

  const filteredForumList = forumList.filter(forum => {
    if (!forum || typeof forum !== 'object') return false;

    const nameMatch =
      forum.name &&
      typeof forum.name === 'string' &&
      forum.name.toLowerCase().includes(forumFilter.toLowerCase());

    const descriptionMatch =
      forum.description &&
      typeof forum.description === 'string' &&
      forum.description.toLowerCase().includes(forumFilter.toLowerCase());

    return nameMatch || descriptionMatch;
  });
  return { forumList: filteredForumList, setForumFilter };
};

export default useForumPage;
