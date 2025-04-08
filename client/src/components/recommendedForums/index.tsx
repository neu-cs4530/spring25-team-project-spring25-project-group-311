import React from 'react';
import './index.css';
import useRecommendedForums from '../../hooks/useRecommendedForums';

const RecommendedForums: React.FC = () => {
  const { tags, forums, handleUpdateTagsAndForums, navigateHome, navigateForum } =
    useRecommendedForums();

  return (
    <div className='recommended-forums-container'>
      <h2>Recommended Forums</h2>
      <div>
        <p>Select an interest:</p>
      </div>
      <div className='tags-container'>
        {tags.map(tag => (
          <div key={tag.name} className='tags' style={{ width: 'auto', height: 'auto' }}>
            <button
              className='login-button'
              onClick={() => handleUpdateTagsAndForums(tag)}
              style={{
                display: 'grid',
                height: 'auto',
                justifyContent: 'center',
                backgroundColor: 'lightblue',
                color: 'purple',
              }}>
              {tag.name}
            </button>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 'revert' }}>Here are some forums you might be interested in:</p>
      {forums.map(forum => (
        <div key={forum.name} style={{ display: 'inline-block', marginRight: '1rem' }}>
          <button className='login-button' onClick={() => navigateForum(forum._id.toString())}>
            {forum.name}
          </button>
        </div>
      ))}
      <button className='login-button' onClick={navigateHome}>
        Move on
      </button>
    </div>
  );
};

export default RecommendedForums;
