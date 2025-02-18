/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState } from 'react';
import GlobalProgress from '../components/GlobalProgress/GlobalProgress';
import { ProgressProps } from 'antd';

interface GlobalProgressContextType {
  showProgress: (initialPercent?: number) => void;
  hideProgress: () => void;
  updateProgress: (percent: number) => void;
  setProgressStatus: (status: ProgressProps['status']) => void;
}

export const GlobalProgressContext = createContext<GlobalProgressContextType | undefined>(undefined);

export const GlobalProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [percent, setPercent] = useState(0);
  const [status, setStatus] = useState<ProgressProps['status']>('normal');

  const showProgress = (initialPercent: number = 0) => {
    setPercent(initialPercent);
    setStatus('normal');
  };

  const hideProgress = () => {
    setPercent(0);
  };

  const updateProgress = (newPercent: number) => {
    setPercent(newPercent);
  };

  const setProgressStatus = (newStatus: ProgressProps['status']) => {
    setStatus(newStatus);
  };

  return (
    <GlobalProgressContext.Provider
      value={{
        showProgress,
        hideProgress,
        updateProgress,
        setProgressStatus,
      }}
    >
      <GlobalProgress percent={percent} status={status} />
      {children}
    </GlobalProgressContext.Provider>
  );
}; 