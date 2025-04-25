import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';
import { useLocation } from "react-router-dom";

interface Props {
  items: MenuProps['items'];
}

export const DropdownMenu = ({ items }: Props) => {
  const location = useLocation();
  const currentPath = location.pathname.substring(1);
  
  const menuItems = items?.map(item => ({
    ...item,
    className: currentPath === item?.key ? 'ant-dropdown-menu-item-active' : ''
  })) as MenuProps['items'];

  return (
    <Dropdown
      menu={{ items: menuItems }}
    >
      <a onClick={(e) => e.preventDefault()}>
        <Space>
          Tokens
          <DownOutlined />
        </Space>
      </a>
    </Dropdown>
  );
};