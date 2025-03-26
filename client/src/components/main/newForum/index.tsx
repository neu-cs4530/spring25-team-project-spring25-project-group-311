import React from 'react';
import useNewForum from '../../../hooks/useNewForum';
import Form from '../baseComponents/form';
import Input from '../baseComponents/input';
import TextArea from '../baseComponents/textarea';
import './index.css';

/**
 * NewForumPage component allows users to create a new forum with a name,
 * description, and forum type (public/private).
 */
const NewForumPage = () => {
  const {
    name,
    setName,
    description,
    setDescription,
    type,
    setType,
    nameErr,
    descriptionErr,
    addForum,
  } = useNewForum();

  return (
    <Form>
      <Input
        title={'Forum Name'}
        hint={'Limit name to 50 characters or less'}
        id={'formNameInput'}
        val={name}
        setState={setName}
        err={nameErr}
      />
      <TextArea
        title={'Forum Description'}
        hint={'Limit to 500 characters'}
        id={'formDescriptionInput'}
        val={description}
        setState={setDescription}
        err={descriptionErr}
      />
      <div className='form_type_selector'>
        <label className='form_type_label'>Forum Type:</label>
        <div className='form_radio_group'>
          <label className='form_radio_label'>
            <input
              type='radio'
              name='forumType'
              value='public'
              checked={type === 'public'}
              onChange={() => setType('public')}
            />
            Public
          </label>
          <label className='form_radio_label'>
            <input
              type='radio'
              name='forumType'
              value='private'
              checked={type === 'private'}
              onChange={() => setType('private')}
            />
            Private
          </label>
        </div>
      </div>
      <div className='btn_indicator_container'>
        <button
          className='form_postBtn'
          onClick={() => {
            addForum();
          }}>
          Create Forum
        </button>
        <div className='mandatory_indicator'>* indicates mandatory fields</div>
      </div>
    </Form>
  );
};

export default NewForumPage;
