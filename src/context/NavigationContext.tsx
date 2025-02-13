/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState } from 'react';

type NavigationContextType = {
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
};

export const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState('deposit');

  return (
    <NavigationContext.Provider value={{ currentScreen, setCurrentScreen }}>
      {children}
    </NavigationContext.Provider>
  );
};

