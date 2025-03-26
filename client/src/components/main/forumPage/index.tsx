import React, { useState, useEffect } from 'react';

import './index.css';
import CreateForumButton from '../createForumButton';
import useForumPage from '../../../hooks/useForumPage';
import ForumView from './forumCard';
import { DatabaseForum } from '../../../types/types';

/**
 * ForumPage component renders a page displaying a list of forums.
 * It includes a header with the forum count and a button to create a new forum.
 */
const ForumPage = () => {
  const { forumList } = useForumPage();
  const [sortedForums, setSortedForums] = useState<DatabaseForum[]>([]);
  const [isSortedAsc, setIsSortedAsc] = useState(true);
  const [userSorted, setUserSorted] = useState(false);

  // updates sortedForums based on chages to forumList
  useEffect(() => {
    if (!userSorted) {
      setSortedForums(prev => {
        // check if current forum list has the same length as previous
        const sameLength = prev.length === forumList.length;
        const sameIds = prev.every((f, i) => f._id === forumList[i]?._id);
        return sameLength && sameIds ? prev : forumList;
      });
    }
  }, [forumList, userSorted]);

  const handleSort = () => {
    const sorted = [...sortedForums].sort((a, b) => {
      const dateA = new Date(a.createDateTime).getTime();
      const dateB = new Date(b.createDateTime).getTime();
      return isSortedAsc ? dateA - dateB : dateB - dateA;
    });
    setSortedForums(sorted);
    setIsSortedAsc(!isSortedAsc);
    setUserSorted(true);
  };

  return (
    <div className='forum-container'>
      <div className='space_between right_padding'>
        <div className='bold_title'>Forums ({sortedForums?.length})</div>
        <div className='button-group'>
          <CreateForumButton />
          <button className='greybtn' onClick={handleSort}>
            Sort by Date {isSortedAsc ? '▲' : '▼'}
          </button>
        </div>
      </div>
      <div id='forums_list' className='forums_list'>
        {sortedForums.map(forum => (
          <ForumView forum={forum} key={forum.name} />
        ))}
      </div>
      {!sortedForums.length && <div className='bold_title right_padding'>No Forums Found</div>}
    </div>
  );
};

export default ForumPage;
