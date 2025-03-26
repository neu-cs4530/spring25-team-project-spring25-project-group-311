import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserContext from './useUserContext';
import { createForum } from '../services/forumService';
import { Forum } from '../types/types';

const useNewForum = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [type, setType] = useState<'public' | 'private'>('public');

  const [nameErr, setNameErr] = useState<string>('');
  const [descriptionErr, setDescriptionErr] = useState<string>('');

  const validateForm = (): boolean => {
    let isValid = true;

    if (!name) {
      setNameErr('Forum name cannot be empty');
      isValid = false;
    } else if (name.length > 50) {
      setNameErr('Forum name cannot be more than 50 characters');
      isValid = false;
    } else {
      setNameErr('');
    }

    if (!description) {
      setDescriptionErr('Forum description cannot be empty');
      isValid = false;
    } else if (description.length > 500) {
      setDescriptionErr('Description cannot be more than 500 characters');
      isValid = false;
    } else {
      setDescriptionErr('');
    }

    return isValid;
  };

  const addForum = async () => {
    if (!validateForm()) return;
    const forum: Forum = {
      name,
      description,
      createdBy: user.username,
      createDateTime: new Date(),
      type,
      moderators: [],
      members: [],
      awaitingMembers: [],
      bannedMembers: [],
      questions: [],
    };

    const res = await createForum(forum);

    if (res && res._id) {
      navigate('/forums');
    }
  };

  return {
    name,
    setName,
    description,
    setDescription,
    type,
    setType,
    nameErr,
    descriptionErr,
    addForum,
  };
};

export default useNewForum;
