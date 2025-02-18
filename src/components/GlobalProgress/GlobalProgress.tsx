import React, { useEffect, useState } from 'react';
import { Progress, ProgressProps, Modal } from 'antd';
import { theme as appTheme } from '../../styles/theme';
import { CloseOutlined } from '@ant-design/icons';

interface GlobalProgressProps {
  percent: number;
  status?: ProgressProps['status']
}

const GlobalProgress: React.FC<GlobalProgressProps> = ({ percent, status = 'normal' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show modal when percent is greater than 0
    if (percent > 0 && percent < 100) {
      setIsVisible(true);
    }
    
    // Handle completion
    if (percent === 100) {
      const timer = setTimeout(() => {
        // Close modal after 5 seconds when percent reaches 100
        if (isVisible) {
          setIsVisible(false);
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [percent, isVisible]);

  return (
    <Modal
      open={isVisible}
      closable={percent === 100}
      onCancel={() => setIsVisible(false)}
      footer={null}
      maskClosable={percent === 100}
      centered={false}
      width={400}
      style={{
        top: '10%'
      }}
      closeIcon={
        <CloseOutlined style={{ color: appTheme.palette.wayru.onSurface }} />
      }
      modalRender={(node) => (
        <div style={{ backgroundColor: 'transparent' }}>
          {React.cloneElement(node as React.ReactElement, {
            style: { backgroundColor: appTheme.palette.wayru.surfaceContainerLow }
          })}
        </div>
      )}
    >
      <div style={{ padding: '8px', textAlign: 'center' }}>
        <div style={{ marginBottom: '10px', color: appTheme.palette.wayru.onSurface }}>
        Sending transaction ⌛
        </div>
        <Progress 
          percent={percent} 
          size={"default"}
          status={status}
          strokeColor={
            status === 'success' 
              ? appTheme.palette.wayru.secondary 
              : status === 'exception'
              ? appTheme.palette.error.main
              : appTheme.palette.wayru.primary
          }
          trailColor="transparent"
          format={(percent) => (
            <span style={{ color: appTheme.palette.wayru.onSurface }}>
              {percent}%
            </span>
          )}
        />
        {percent === 100 && (
          <div 
            style={{ 
              marginTop: '10px', 
              color: appTheme.palette.wayru.onSurface,
              textAlign: 'center'
            }}
          >
            {status === 'success' 
              ? '¡Transaction completed successfully!' 
              : status === 'exception'
              ? 'Transaction failed. Please try again.'
              : ''}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default GlobalProgress; 