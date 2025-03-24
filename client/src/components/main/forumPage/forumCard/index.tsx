import React from 'react';
import './index.css';
import { DatabaseForum } from '../../../../types/types';

/**
 * Interface representing the props for the ForumCard component.
 *
 * forum - The forum object containing details about the forum.
 * handleForumClick - The function to handle clicking on the forum card.
 */
interface ForumCardProps {
  forum: DatabaseForum;
  handleForumClick: (forumName: string) => void;
}

/**
 * ForumCard component renders the details of a forum including its name, description, and flairs.
 */
const ForumCard = (props: ForumCardProps) => {
  const { forum, handleForumClick } = props;

  return (
    <div className='forum_card right_padding' onClick={() => handleForumClick(forum.name)}>
      <div className='forum_content'>
        <div className='forum_name'>{forum.name}</div>
        <div className='forum_description'>{forum.description}</div>
        <div className='forum_flairs'>
          {forum.flairs.map((flair, index) => (
            <span key={index} className='forum_flair'>
              {flair}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForumCard;
