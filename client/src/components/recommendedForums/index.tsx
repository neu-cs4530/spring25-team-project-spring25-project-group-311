import React from 'react';
import './index.css';
import useRecommendedForums from '../../hooks/useRecommendedForums';

const RecommendedForums: React.FC = () => {
    const {tags, forums, selectedTags, handleUpdateTagsAndForums, navigateHome, handleUnselectTagsAndForums, navigateForum} = useRecommendedForums();

    return (
        <div className='recommended-forums-container'>
            <h2>Recommended Forums</h2>
            <p>Select an interest:</p>
            {tags.map(tag => (
                console.log('tag: ', tag),
                <div key={tag.name} style={{ display: 'inline-block', marginRight: '1rem', width: '75px' }}>
                    { !selectedTags.includes(tag) && <button
                        className='login-button'
                        onClick={() => handleUpdateTagsAndForums(tag)}
                        style={{ width: '75px', display: 'inline-block', marginRight: '1rem' }}>
                        {tag.name} 
                    </button>}
                    { selectedTags.includes(tag) && <button
                        className='login-button'
                        onClick={() => handleUnselectTagsAndForums(tag)}
                        style={{ width: '75px', display: 'inline-block', marginRight: '1rem' }}>
                        {tag.name} 
                    </button>}
                </div>
            ))}
            <p>Here are some forums you might be interested in:</p>
            {forums.map(forum => (
                <div key={forum.name} style={{ display: 'inline-block', marginRight: '1rem' }}>
                    <button className='login-button' onClick={ () => navigateForum(forum._id.toString())}>
                        {forum.name} 
                    </button>
                </div>
            ))}
            <button className='login-button' onClick={navigateHome}>Move on</button>
        </div>
    );
}

export default RecommendedForums;