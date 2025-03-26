import React from 'react';
import './index.css';
import { Outlet } from 'react-router-dom';
import SideBarNav from '../main/sideBarNav';
import Header from '../header';

/**
 * Main component represents the layout of the main page, including a sidebar and the main content area.
 * @param userBanner - The banner color of the current user.
 */
const Layout = ({ userBanner }: { userBanner: string }) => (
  <>
    <Header userBanner={userBanner} />
    <div id='main' className='main'>
      <SideBarNav />
      <div id='right_main' className='right_main'>
        <Outlet />
      </div>
    </div>
  </>
);

export default Layout;
