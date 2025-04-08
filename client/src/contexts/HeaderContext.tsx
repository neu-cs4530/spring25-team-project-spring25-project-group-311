import { PopulatedDatabaseNotification } from '@fake-stack-overflow/shared';
import { ObjectId } from 'mongodb';
import React, { createContext, useContext, useState } from 'react';
import useNotification from '../hooks/useNotification';

interface HeaderContextType {
  headerBackground: string;
  setHeaderBackground: (color: string) => void;
  unreadBrowserNotifs: PopulatedDatabaseNotification[];
  handleReadNotification: (notifId: ObjectId | undefined) => void;
}

export const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [headerBackground, setHeaderBackground] = useState<string>('#dddddd');
  const { unreadBrowserNotifs, handleReadNotification } = useNotification();

  return (
    <HeaderContext.Provider
      value={{
        headerBackground,
        setHeaderBackground,
        unreadBrowserNotifs,
        handleReadNotification,
      }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeaderContext = (): HeaderContextType => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeaderContext must be used within a HeaderProvider');
  }
  return context;
};
