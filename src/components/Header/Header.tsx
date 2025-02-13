import { Header } from "antd/es/layout/layout";
import { theme as appTheme } from "../../styles/theme";
import { usePhantom } from "../../hooks/usePhantom";
import { WalletOutlined, LogoutOutlined } from "@ant-design/icons";
import { Select, Typography } from "antd";
import { useSettings } from "../../hooks/useSettings";
import Button from "../UI/Button";
import { Settings as SettingInterface } from "../../context/SettingsContext";
import { CONSTANTS } from "../../constants";


export const HeaderComponent = () => {
  const { connect, publicKey, disconnect } = usePhantom();
  const { settings, setSettings } = useSettings();

  const onclickWallet = () => {
    if (publicKey && settings?.network) {
      const url = CONSTANTS.NETWORK.EXPLORER_ACCOUNT_URL[settings?.network];
      // replace the replaceme with the public key
      const urlWithPublicKey = url.replace("replaceme", publicKey.toString());
      window.open(urlWithPublicKey, "_blank");
    }
  }

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
            <Typography.Text>Wallet:</Typography.Text>
            <Typography.Text
              onClick={onclickWallet}
              style={{
                color: appTheme.palette.wayru.primary,
                cursor: "pointer",
              }}
            >
              {publicKey.toString().slice(0, 6)}...
              {publicKey.toString().slice(-6)}
            </Typography.Text>
          </>
        )}
        <Button
          type="default"
          iconPosition="end"
          icon={publicKey ? <LogoutOutlined /> : <WalletOutlined />}
          onClick={() => (publicKey ? disconnect() : connect())}
          style={{
            background: appTheme.palette.wayru.secondaryContainer,
            fontSize: "14px",
            color: appTheme.palette.wayru.onSecondaryContainer,
          }}
        >
          {publicKey ? "Disconnect" : "Connect"}
        </Button>
        <Select
          value={settings?.network || "devnet"}
          optionFilterProp="label"
          showSearch
          onChange={(value) => {
            setSettings({
              ...settings,
              network: value as "devnet" | "mainnet",
            } as SettingInterface);
          }}
          options={[
            { value: "devnet", label: "Devnet" },
            { value: "mainnet", label: "Mainnet" },
          ]}
          defaultValue="devnet"
        />
      </div>
    </Header>
  );
};
