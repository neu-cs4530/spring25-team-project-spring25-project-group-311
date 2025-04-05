import React, { createContext, useContext, useState } from 'react';

interface HeaderContextType {
  headerBackground: string;
  setHeaderBackground: (color: string) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [headerBackground, setHeaderBackground] = useState<string>('#dddddd');

  return (
    <HeaderContext.Provider value={{ headerBackground, setHeaderBackground }}>
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
