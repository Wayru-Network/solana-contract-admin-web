import { Layout, Menu } from "antd";
import {
  SettingOutlined,
  DeliveredProcedureOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { theme as appTheme } from "../../styles/theme";
import Logo from "../../assets/logo-green.png";

const { Sider } = Layout;

export const Sidebar = ({ collapsed }: { collapsed: boolean }) => {
  const IconSize = 15;
  const location = useLocation();
  const currentPath = location.pathname.substring(1) || 'settings'; // Remove leading slash

  const menuItems = [
    {
      key: "fund-contract",
      icon: <DeliveredProcedureOutlined style={{ fontSize: IconSize }} />,
      label: <Link to="/fund-contract">Fund Contract</Link>,
    },
    {
      key: "authority-configs",
      icon: <UserAddOutlined style={{ fontSize: IconSize }} />,
      label: <Link to="/authority-configs">Authority Configurations</Link>,
    },
    {
      key: "settings",
      icon: <SettingOutlined style={{ fontSize: IconSize }} />,
      label: <Link to="/settings">Settings</Link>,
    },
  ];

  return (
    <Sider
      theme="light"
      collapsed={collapsed}
      style={{
        backgroundColor: appTheme.palette.wayru.scrim,
        borderRight: `1px solid ${appTheme.palette.wayru.outline}`
      }}
    >
      <div className="logo">
        <img style={{ width: "65%", height: "60%" }} src={Logo} alt="Logo" />
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[currentPath]}
        style={{
          backgroundColor: appTheme.palette.wayru.scrim,
          fontWeight: "500",
        }}
        items={menuItems}
      />
    </Sider>
  );
};
