import { Layout, Menu } from "antd";
import {
  SettingOutlined,
  DeliveredProcedureOutlined,
  UserAddOutlined,
  RocketOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { theme as appTheme } from "../../styles/theme";
import Logo from "../../assets/logo-green.png";
import { DropdownMenu } from "./DropdownMenu";
import "./styles/Sidebar.css";
import { useTokenRoutes } from "./routes/useTokenRoutes";

const { Sider } = Layout;

export const Sidebar = ({ collapsed }: { collapsed: boolean }) => {
  const IconSize = 17;
  const location = useLocation();
  const currentPath = location.pathname.substring(1) || "settings"; // Remove leading slash
  const isTokenRoute = location.pathname.includes('token');
  const selectedKey = isTokenRoute ? 'dropdown-token' : currentPath;


  const { tokenRoutes } = useTokenRoutes();

  const menuItems = [
    {
      key: "fund-contract",
      icon: <DeliveredProcedureOutlined style={{ fontSize: IconSize }} />,
      label: <Link to="/fund-contract">Fund Contract</Link>,
    },
    {
      key: "dropdown-token",
      icon: <DollarOutlined style={{ fontSize: IconSize }} />,
      label: <DropdownMenu items={tokenRoutes} />,
    },
    {
      key: "authority-configs",
      icon: <UserAddOutlined style={{ fontSize: IconSize }} />,
      label: <Link to="/authority-configs">Authority Configurations</Link>,
    },
    {
      key: "update-admin",
      icon: <UserAddOutlined style={{ fontSize: IconSize }} />,
      label: <Link to="/update-admin">Update Admin</Link>,
    },
    {
      key: "initialize-contract",
      icon: <RocketOutlined style={{ fontSize: IconSize }} />,
      label: <Link to="/initialize-contract">Initialize Contract</Link>,
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
        borderRight: `1px solid ${appTheme.palette.wayru.outline}`,
      }}
    >
      <div className="logo">
        <img style={{ width: "65%", height: "60%" }} src={Logo} alt="Logo" />
      </div>
      <Menu
        theme="dark"
        mode="vertical"
        selectedKeys={[selectedKey]}
        style={{
          backgroundColor: appTheme.palette.wayru.scrim,
          fontWeight: "500",
        }}
        className="custom-sidebar-menu"
        items={menuItems}
      />
    </Sider>
  );
};
