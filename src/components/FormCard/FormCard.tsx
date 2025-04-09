import { Typography } from "antd";
import { Card } from "antd";
const { Title } = Typography;
import { theme as appTheme } from "../../styles/theme";


interface FormCardProps {
  title: string;
  formBody: React.ReactNode;
  bottomComponent?: React.ReactNode;
}

export const FormCard = ({
  title,
  formBody,
  bottomComponent,
}: FormCardProps) => {

  return (
    <Card>
      <Title
        style={{
          color: appTheme.palette.text.color,
          marginBottom: 28,
          textAlign: "center",
        }}
        level={2}
      >
        {title}
      </Title>
      {formBody}
      {bottomComponent}
    </Card>
  );
};
