import { Button as AntdButton, ButtonProps } from "antd";
import { theme as appTheme } from "../../styles/theme";

const Button = (props: ButtonProps) => {
  return (
    <AntdButton
      {...props}
      style={{
        background: appTheme.palette.wayru.secondaryContainer,
        fontSize: "14px",
        color: appTheme.palette.wayru.onSecondaryContainer,
        borderColor: "transparent",
        ...props.style,
      }}
    >
      {props.children}
    </AntdButton>
  );
};

export default Button;
