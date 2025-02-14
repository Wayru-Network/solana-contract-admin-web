/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState } from 'react';

type NavigationScreen = 'fund-contract' | 'settings' | 'authority-configs';
type NavigationContextType = {
  currentScreen: NavigationScreen;
  setCurrentScreen: (screen: NavigationScreen) => void;
};

export const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<NavigationScreen>('fund-contract');

  return (
    <NavigationContext.Provider value={{ currentScreen, setCurrentScreen }}>
      {children}
    </NavigationContext.Provider>
  );
};

