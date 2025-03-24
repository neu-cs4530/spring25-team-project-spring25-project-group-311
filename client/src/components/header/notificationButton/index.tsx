import React from 'react';
import useNotification from '../../../hooks/useNotification';
import { FaBell } from 'react-icons/fa';
import './index.css';

const NotificationButton = () => {
  const { showNotifs, setShowNotifs, unreadNotifs, error } = useNotification();

  return (
    <>
      <button></button>
    </>
  );
};
