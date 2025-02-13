import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { Header } from "antd/es/layout/layout";
import { theme as appTheme } from "../../styles/theme";
import { usePhantom } from "../../hooks/usePhantom";

export const HeaderComponent = ({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}) => {
  const { connect, publicKey, disconnect } = usePhantom();

  return (
    <Header
      style={{
        padding: 0,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "transparent",
      }}
    >
      { <Button
        type="text"
        icon={
          collapsed ? (
            // Show "unfold" icon when sidebar is collapsed | Mostrar ícono "desplegar" cuando la barra lateral está colapsada
            <MenuUnfoldOutlined
              style={{
                fontSize: appTheme.iconSize.medium,
              }}
            />
          ) : (
            // Show "fold" icon when sidebar is expanded | Mostrar ícono "plegar" cuando la barra lateral está expandida
            <MenuFoldOutlined
              style={{
                fontSize: appTheme.iconSize.medium,
              }}
            />
          )
        }
        onClick={() => setCollapsed(!collapsed)}
        style={{
          fontSize: "16px",
          width: 64,
          height: 64,
        }}
      />}
      <div
        style={{
          marginRight: "24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {publicKey && (
          <span style={{ color: appTheme.palette.wayru.onSurface }}>
            Wallet: {publicKey.toString().slice(0, 4)}...
            {publicKey.toString().slice(-4)}
          </span>
        )}
        <Button
          type="default"
          onClick={() => (publicKey ? disconnect() : connect())}
          style={{
            background: appTheme.palette.wayru.primary,
          }}
        >
          {publicKey ? "Desconectar" : "Conectar Wallet"}
        </Button>
      </div>
    </Header>
  );
};
