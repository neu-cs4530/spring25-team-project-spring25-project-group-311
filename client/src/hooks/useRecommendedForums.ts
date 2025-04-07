import useUserContext from './useUserContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPopulatedForums } from '../services/forumService';
import { DatabaseTag, PopulatedDatabaseForum } from '../types/types';

const recommendedForums = () => {
  const { user : currentUser } = useUserContext();
  const navigate = useNavigate();
  const [tags, setTags] = useState<DatabaseTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<DatabaseTag[]>([]);
  const [forums, setForums] = useState<PopulatedDatabaseForum[]>([]);

  const handleGetTags = async () => {
    const taggedForums = await getPopulatedForums();
    const questions = taggedForums.flatMap(forum => forum.questions);
    const tags = questions.flatMap(question => question.tags);
    const uniqueTags = [...new Set(tags)];
    return uniqueTags;
  }

  useEffect(() => {
    handleGetTags().then(fetchedTags => setTags(fetchedTags));
    console.log(tags.map(tag => tag.name));
}, [handleGetTags]);

  const handleUpdateTagsAndForums = async (tag: DatabaseTag) => {
    setSelectedTags(prev => [...prev, tag]);
    const taggedForums = await getPopulatedForums();
    setForums([]);
    for (const forum of taggedForums) {
      const questions = forum.questions;
      const curForumTags = questions.flatMap(question => question.tags);
      if (curForumTags.some(tag => tags.includes(tag))) {
        setForums(prev => [...prev, forum]);
      }
    }
  }

  const handleUnselectTagsAndForums = async (tag: DatabaseTag) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
    const taggedForums = await getPopulatedForums();
    for (const forum of taggedForums) {
      const questions = forum.questions;
      const curForumTags = questions.flatMap(question => question.tags);
      if (curForumTags.some(tag => tags.includes(tag))) {
        setForums(prev => [...prev, forum]);
      }
    }
  }

  const navigateHome = () => {
    navigate('/home');
  };

  const navigateForum = (forumId: string) => {
    navigate(`/forum/${forumId}`);
  };


  return {handleGetTags,
         tags,
         selectedTags,
         setSelectedTags,
         forums,
         setForums,
         currentUser,
         setTags,
         handleUpdateTagsAndForums,
         navigateHome,
         handleUnselectTagsAndForums,
         navigateForum,};
}

export default recommendedForums;