import React from 'react';
import { useNavigate } from 'react-router-dom';
import useHeader from '../../hooks/useHeader';
import './index.css';
import useUserContext from '../../hooks/useUserContext';
import NotificationButton from './notificationButton';
import { useHeaderContext } from '../../contexts/HeaderContext';

/**
 * Header component that renders the main title and a search bar.
 * The search bar allows the user to input a query and navigate to the search results page
 * when they press Enter
 * @param userBanner - The banner color of the current user.
 */
const Header = ({ userBanner }: { userBanner: string }) => {
  const { val, handleInputChange, handleKeyDown, handleSignOut } = useHeader();
  const { user: currentUser } = useUserContext();
  const { headerBackground } = useHeaderContext();

  const getBackgroundColor = () => userBanner;

  const navigate = useNavigate();
  return (
    <div
      id='header'
      className='header'
      style={{ '--header-background': headerBackground } as React.CSSProperties}>
      <div></div>
      <div className='title'>Fake Stack Overflow</div>
      <input
        id='searchBar'
        placeholder='Search ...'
        type='text'
        value={val}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleSignOut} className='logout-button'>
        Log out
      </button>
      <NotificationButton />
      <button
        className='view-profile-button'
        onClick={() => navigate(`/user/${currentUser.username}`)}>
        View Profile
      </button>
    </div>
  );
};

export default Header;
