import { Layout, Menu } from "antd";
import {
  SettingOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { useNavigation } from "../../hooks/useNavigationContext";
  const { Sider } = Layout;

export const Sidebar = ({ collapsed }: { collapsed: boolean }) => {
  const IconSize = 21;
  const { setCurrentScreen } = useNavigation();

  const menuItems = [
    {
      key: "deposit",
      icon: <WalletOutlined style={{ fontSize: IconSize }} />,
      label: "Deposit",
      onClick: () => setCurrentScreen("deposit"),
    },
    {
      key: "settings",
      icon: <SettingOutlined style={{ fontSize: IconSize }} />,
      label: "Settings",
      onClick: () => setCurrentScreen("settings"),
    },
  ];

  return (
    <Sider theme="light" collapsed={collapsed}>
    <div className="demo-logo-vertical" />
    <Menu
      theme="light"
      mode="inline"
      items={menuItems}
    />
  </Sider>
  );
};