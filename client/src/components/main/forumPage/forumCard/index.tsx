import React from 'react';
import { ObjectId } from 'mongodb';
import { useNavigate } from 'react-router-dom';
import './index.css';
import { getMetaData } from '../../../../tool';
import { DatabaseForum } from '../../../../types/types';

/**
 * Interface representing the props for the Forum component.
 *
 * forum - the forum object containing details about the forum.
 */
interface ForumProps {
  forum: DatabaseForum;
}

const ForumView = ({ forum }: ForumProps) => {
  const navigate = useNavigate();

  /**
   * Function to navigate to the home page with the specified tag as a search parameter.
   *
   * @param forumName - The name of the tag to be added to the search parameters.
   */
  const handleForum = (forumID: ObjectId) => {
    navigate(`/forum/${forumID}`);
  };

  return (
    <div
      className='forum right_padding'
      onClick={() => {
        if (forum._id) {
          handleForum(forum._id);
        }
      }}>
      <div className='forumStats'>
        <div>{forum.members.length || 0} members</div>
        <div>{forum.questions.length || 0} questions</div>
      </div>
      <div className='forum_mid'>
        <div className='forumTitle'>{forum.name}</div>
        <div className='forumDescription'>{forum.description}</div>
      </div>
      <div className='lastActivity'>
        <div className='forum_creator'>{forum.createdBy}</div>
        <div>&nbsp;</div>
        <div className='forum_meta'>created {getMetaData(new Date(forum.createDateTime))}</div>
        <div className='forum_type'>{forum.type}</div>
      </div>
    </div>
  );
};

export default ForumView;
