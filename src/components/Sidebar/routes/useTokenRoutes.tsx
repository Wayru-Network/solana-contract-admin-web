import { MenuProps } from "antd";
import { useNavigate } from "react-router-dom";

export const useTokenRoutes = () => {
  const navigate = useNavigate();
  const tokenRoutes: MenuProps['items'] = [
    {
      key: 'mint-tokens',
      label: 'Mint Tokens',
      onClick: () => {
        navigate('/mint-tokens');
      },
    },
    {
      key: 'update-token-metadata',
      label: 'Update Token Metadata',
      onClick: () => {
        navigate('/update-token-metadata');
      },
    }
  ];

  return {tokenRoutes};
};