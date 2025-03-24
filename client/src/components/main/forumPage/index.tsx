import React from 'react';
import './index.css';
import CreateForumButton from '../createForumButton';
import useForumPage from '../../../hooks/useForumPage';
import ForumView from './forumCard';

/**
 * ForumPage component renders a page displaying a list of forums.
 * It includes a header with the forum count and a button to create a new forum.
 */
const ForumPage = () => {
  const { forumList } = useForumPage();

  return (
    <div className='forum-container'>
      <div className='space_between right_padding'>
        <div className='bold_title'>Forums ({forumList?.length || 0})</div>
        <CreateForumButton />
      </div>
      <div id='forums_list' className='forums_list'>
        {forumList.map(forum => (
          <ForumView forum={forum} key={forum.name} />
        ))}
      </div>
      {(!forumList.length || forumList.length === 0) && (
        <div className='bold_title right_padding'>No Forums Found</div>
      )}
    </div>
  );
};

export default ForumPage;
