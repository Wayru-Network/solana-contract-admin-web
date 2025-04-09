import React from "react";

interface FormScreenWrapperProps {
  children: React.ReactNode;
  maxWidth?: number | string;
  maxHeight?: number | string;
}
export const FormScreenWrapper = ({
  children,
  maxWidth = 600,
}: FormScreenWrapperProps) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          width: "auto",
          maxWidth: maxWidth,
          margin: "0 auto",
          padding: "24px",
        }}
      >
        {children}
      </div>
    </div>
  );
};
