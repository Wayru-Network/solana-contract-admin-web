import { Header } from "antd/es/layout/layout";
import { theme as appTheme } from "../../styles/theme";
import { usePhantom } from "../../hooks/usePhantom";
import { LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import Button from "../UI/Button";

export const HeaderComponent = () => {
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
      {<div />}
      <div
        style={{
          marginRight: "24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {publicKey && (
          <>
            <span
              style={{
                color: appTheme.palette.wayru.surface,
                fontWeight: "400",
              }}
            >
              Wallet:
            </span>
            <span
              style={{
                color: appTheme.palette.wayru.onTertiaryFixed,
                fontWeight: "400",
              }}
            >
              {publicKey.toString().slice(0, 6)}...
              {publicKey.toString().slice(-6)}
            </span>
          </>
        )}
        <Button
          type="default"
          iconPosition="end"
          icon={publicKey ? <LogoutOutlined /> : <LoginOutlined />}
          onClick={() => (publicKey ? disconnect() : connect())}
          style={{
            background: appTheme.palette.wayru.secondaryContainer,
            fontSize: "14px",
            color: appTheme.palette.wayru.onSecondaryContainer,
          }}
        >
          {publicKey ? "Disconnect" : "Connect"}
        </Button>
      </div>
    </Header>
  );
};
