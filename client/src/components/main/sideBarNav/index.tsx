import React, { useState } from 'react';
import './index.css';
import { NavLink, useLocation } from 'react-router-dom';

/**
 * The SideBarNav component has four menu items: "Questions", "Tags", "Messaging", and "Users".
 * It highlights the currently selected item based on the active page and
 * triggers corresponding functions when the menu items are clicked.
 */
const SideBarNav = () => {
  const [showMessageOptions, setShowMessageOptions] = useState<boolean>(false);
  const location = useLocation();

  const toggleMessageOptions = () => {
    setShowMessageOptions(!showMessageOptions);
  };

  const isActiveMessageOption = (path: string) =>
    location.pathname === path ? 'message-option-selected ' : '';

  return (
    <div id='sideBarNav' className='sideBarNav'>
      <NavLink
        to='/home'
        id='menu_questions'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Questions
      </NavLink>
      <NavLink
        to='/tags'
        id='menu_tag'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Tags
      </NavLink>
      <NavLink
        to='/messaging'
        id='menu_messaging'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
        onClick={toggleMessageOptions}>
        Messaging
      </NavLink>
      {showMessageOptions && (
        <div className='additional-options'>
          <NavLink
            to='/messaging'
            className={`menu_button message-options ${isActiveMessageOption('/messaging')}`}>
            Global Messages
          </NavLink>
          <NavLink
            to='/messaging/direct-message'
            className={`menu_button message-options ${isActiveMessageOption('/messaging/direct-message')}`}>
            Direct Messages
          </NavLink>
        </div>
      )}
      <NavLink
        to='/forums'
        id='menu_forum'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Forums
      </NavLink>
      <NavLink
        to='/users'
        id='menu_users'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Users
      </NavLink>
      <NavLink
        to='/games'
        id='menu_games'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Games
      </NavLink>
    </div>
  );
};

export default SideBarNav;
