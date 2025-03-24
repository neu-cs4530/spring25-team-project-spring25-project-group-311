import React from 'react';
import './index.css';
import { useNavigate } from 'react-router-dom';
import CreateForumButton from '../createForumButton';
import useForumPage from '../../../hooks/useForumPage';
import ForumCard from './forumCard';

/**
 * Represents the ForumPage component which displays forums available to join.
 */
const ForumPage = () => {
  const navigate = useNavigate();
  const { forumList } = useForumPage();

  /**
   * Navigates to the forum details page when a forum is clicked
   */
  const handleForumClick = (forumName: string) => {
    navigate(`/forum/${forumName}`);
  };

  return (
    <>
      <div className='space_between right_padding'>
        <div className='bold_title'>Forums ({forumList?.length || 0})</div>
        <CreateForumButton />
      </div>

      <div className='forums_list'>
        {forumList && forumList.length > 0 ? (
          forumList.map(forum => (
            <ForumCard key={forum.name} forum={forum} handleForumClick={handleForumClick} />
          ))
        ) : (
          <div className='bold_title right_padding'>No Forums Found</div>
        )}
      </div>
    </>
  );
};

export default ForumPage;
