import React, { useEffect, useState } from "react";
import { Progress, ProgressProps, Modal } from "antd";
import { theme as appTheme } from "../../styles/theme";
import Lottie from "lottie-react";
import rocketAnimation from "../../assets/animations/rocket.json";
import splashError from "../../assets/animations/splash-error.json";
import splashSuccess from "../../assets/animations/splash-success.json";

interface GlobalProgressProps {
  percent: number;
  status?: ProgressProps["status"];
  hideProgress: () => void;
}

const GlobalProgress: React.FC<GlobalProgressProps> = ({
  percent,
  status = "normal",
  hideProgress,
}) => {
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
          hideProgress();
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [percent, isVisible, hideProgress]);

  return (
    <Modal
      open={isVisible}
      closable={false}
      onCancel={() => setIsVisible(false)}
      footer={null}
      maskClosable={false}
      centered={false}
      width={400}
      style={{
        top: "10%",
      }}
      modalRender={(node) => (
        <div style={{ backgroundColor: "transparent" }}>
          {React.cloneElement(
            node as React.ReactElement<{
              className?: string;
              style?: React.CSSProperties;
            }>,
            {
              className: "custom-progress",
              style: {
                backgroundColor: appTheme.palette.wayru.surfaceContainerLow,
                borderRadius: "10px",
              },
            }
          )}
        </div>
      )}
    >
      <div style={{ padding: "8px", textAlign: "center" }}>
        <div
          style={{
            marginBottom: "10px",
            color: appTheme.palette.wayru.onSurface,
            fontSize: "16px",
          }}
        >
          {status === "exception" ? "Transaction failed" : status === "success" ? "Transaction completed" : "Transaction pending"} ⌛
        </div>
        <div
          style={{
            position: "relative",
            width: "200px",
            margin: "0 auto",
          }}
        >
          <Progress
            type="circle"
            percent={percent}
            size={200}
            strokeWidth={3}
            status={status}
            strokeColor={
              percent === 100 && status === "success"
                ? appTheme.palette.wayru.secondary
                : percent === 100 && status === "exception"
                ? appTheme.palette.wayru.error
                : appTheme.palette.wayru.primary
            }
            trailColor="transparent"
            format={() => null}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: status === "exception" && percent === 100
                ? "170px"
                : status === "success" && percent === 100
                ? "90px"
                : "90px",
            }}
          >
            <Lottie 
              animationData={
                status === "exception" && percent === 100
                  ? splashError
                  : status === "success" && percent === 100
                  ? splashSuccess
                  : rocketAnimation
              }
              loop={percent === 100 ? false : true}
              style={{
                filter: percent === 100 ? (
                  status === "success"
                    ? `drop-shadow(0 0 8px ${appTheme.palette.wayru.onSecondary})`
                    : status === "exception"
                    ? `drop-shadow(0 0 8px ${appTheme.palette.wayru.onError})`
                    : 'none'
                ) : 'none'
              }}
            />
          </div>
        </div>
        {percent === 100 && (
          <div
            style={{
              marginTop: "10px",
              color: appTheme.palette.wayru.onSurface,
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            {status === "success"
              ? "¡Transaction completed successfully!"
              : status === "exception"
              ? "Transaction failed. Please try again."
              : ""}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default GlobalProgress;
