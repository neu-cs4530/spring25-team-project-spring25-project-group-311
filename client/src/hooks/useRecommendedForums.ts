import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserContext from './useUserContext';
import { getPopulatedForums } from '../services/forumService';
import { PopulatedDatabaseForum, TagData } from '../types/types';
import { getTagsWithQuestionNumber } from '../services/tagService';

const RecommendedForums = () => {
  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();
  const [tags, setTags] = useState<TagData[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagData[]>([]);
  const [forums, setForums] = useState<PopulatedDatabaseForum[]>([]);

  const handleGetTags = async () => {
    const questionTags = await getTagsWithQuestionNumber();
    return questionTags;
  };

  useEffect(() => {
    handleGetTags().then(fetchedTags => setTags(fetchedTags));
  }, [tags]);

  const handleUpdateTagsAndForums = async (tag: TagData) => {
    setSelectedTags(prev => [...prev, tag]);
    const taggedForums = await getPopulatedForums();
    // setForums([]);
    setForums(
      taggedForums.filter(forum =>
        forum.questions
          .flatMap(question => question.tags.map(fTag => fTag.name))
          .includes(tag.name),
      ),
    );
  };

  const navigateHome = () => {
    navigate('/home');
  };

  const navigateForum = (forumId: string) => {
    navigate(`/forum/${forumId}`);
  };

  return {
    handleGetTags,
    tags,
    selectedTags,
    setSelectedTags,
    forums,
    setForums,
    currentUser,
    setTags,
    handleUpdateTagsAndForums,
    navigateHome,
    navigateForum,
  };
};

export default RecommendedForums;
