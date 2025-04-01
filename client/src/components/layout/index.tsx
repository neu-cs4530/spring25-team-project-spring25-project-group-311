import React, { useEffect } from 'react';
import './index.css';
import { Outlet } from 'react-router-dom';
import SideBarNav from '../main/sideBarNav';
import Header from '../header';
import { HeaderProvider, useHeaderContext } from '../../contexts/HeaderContext';

/**
 * Main component represents the layout of the main page, including a sidebar and the main content area.
 * @param userBanner - The banner color of the current user.
 */
const LayoutContent = ({ userBanner }: { userBanner: string }) => {
  const { setHeaderBackground } = useHeaderContext();

  useEffect(() => {
    setHeaderBackground(userBanner);
  }, [userBanner, setHeaderBackground]);

  return (
    <>
      <Header />
      <div id='main' className='main'>
        <SideBarNav />
        <div id='right_main' className='right_main'>
          <Outlet />
        </div>
      </div>
    </>
  );
};

const Layout = ({ userBanner }: { userBanner: string }) => (
  <HeaderProvider>
    <LayoutContent userBanner={userBanner} />
  </HeaderProvider>
);

export default Layout;
