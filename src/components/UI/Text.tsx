import { TextProps } from "antd/es/typography/Text";
import { Typography } from "antd";
import { theme as appTheme } from "../../styles/theme";

export const Text = ({ children, ...props }: TextProps) => {
  const color = props.color || appTheme.palette.text.color
  return <Typography.Text style={{ color, ...props.style }}>{children}</Typography.Text>;
};

