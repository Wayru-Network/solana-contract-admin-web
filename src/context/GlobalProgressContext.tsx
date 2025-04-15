/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState } from 'react';
import GlobalProgress from '../components/GlobalProgress/GlobalProgress';
import { ProgressProps } from 'antd';

interface GlobalProgressContextType {
  hideProgress: () => void;
  setProgressState: (newState: {
    percent: number;
    status?: ProgressProps['status'];
  }) => void;
}

export const GlobalProgressContext = createContext<GlobalProgressContextType | undefined>(undefined);

export const GlobalProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<{
    status: ProgressProps['status'];
    percent: number;
  }>({
    status: 'normal',
    percent: 0,
  });

  const hideProgress = () => {
    setState({
      ...state,
      percent: 0,
      status: 'normal',
    });
  };


  const setProgressState = (newState: {
    percent: number;
    status?: ProgressProps['status'];
  }) => {
    setState({
      ...state,
      ...newState,
    });
  };

  return (
    <GlobalProgressContext.Provider
      value={{
        hideProgress,
        setProgressState
      }}
    >
      <GlobalProgress percent={state.percent} status={state.status} hideProgress={hideProgress} />
      {children}
    </GlobalProgressContext.Provider>
  );
}; 