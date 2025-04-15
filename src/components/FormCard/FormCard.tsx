import { Typography } from "antd";
import { Card } from "antd";
const { Title } = Typography;
import { theme as appTheme } from "../../styles/theme";

interface FormCardProps {
  title: string;
  formBody: React.ReactNode;
  bottomComponent?: React.ReactNode;
  minWidth?: string | number;
}

export const FormCard = ({
  title,
  formBody,   
  bottomComponent,
  minWidth = 400,
}: FormCardProps) => {
  return (
    <Card
      style={{
        background: 'rgba(19, 18, 18, 0.25)',
        boxShadow: '0 0px 9px 0 rgba(20, 32, 20, 0.8)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)', //For Safari
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '10px',
        minWidth: minWidth,
      }}
    >
      <Title
        style={{
          color: appTheme.palette.text.color,
          marginBottom: 28,
          textAlign: "center",
        }}
        level={3}
      >
        {title}
      </Title>
      {formBody}
      {bottomComponent}
    </Card>
  );
};
