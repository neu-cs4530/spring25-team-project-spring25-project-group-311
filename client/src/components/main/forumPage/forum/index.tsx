import React from 'react';
import './index.css';
import { DatabaseForum, Forum } from '../../../../types/types';

interface ForumProps {
  f: Forum;
  clickForum: (forumName: string) => void;
}

