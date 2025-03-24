import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // will change to hook later, placeholder
import './index.css';

/**
 * FocusedForumPage displays details for a specific forum
 */
const FocusedForumPage = () => {
  const { forumName } = useParams<{ forumName: string }>();

  return (
    <div className='focused_forum_container'>
      <h1 className='forum_title'>{forumName}</h1>
    </div>
  );
};

export default FocusedForumPage;
