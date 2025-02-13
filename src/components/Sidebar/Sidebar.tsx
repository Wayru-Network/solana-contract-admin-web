import { Layout, Menu } from "antd";
import {
  SettingOutlined,
  DeliveredProcedureOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useNavigation } from "../../hooks/useNavigationContext";
import { theme as appTheme } from "../../styles/theme";
import Logo from "../../assets/logo-green.png";

const { Sider } = Layout;

export const Sidebar = ({ collapsed }: { collapsed: boolean }) => {
  const IconSize = 15;
  const { setCurrentScreen } = useNavigation();

  const menuItems = [
    {
      key: "fund-contract",
      icon: <DeliveredProcedureOutlined style={{ fontSize: IconSize }} />,
      label: "Fund contract",
      onClick: () => setCurrentScreen("fund-contract"),
    },
    {
      key: "add-authority",
      icon: <UserAddOutlined style={{ fontSize: IconSize }} />,
      label: "Add Authority",
      onClick: () => setCurrentScreen("add-authority"),
    },
    {
      key: "settings",
      icon: <SettingOutlined style={{ fontSize: IconSize }} />,
      label: "Settings",
      onClick: () => setCurrentScreen("settings"),
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
        defaultSelectedKeys={['fund-contract']}
        style={{
          backgroundColor: appTheme.palette.wayru.scrim,
          fontWeight: "500",
        }}
        items={menuItems}
      />
    </Sider>
  );
};
