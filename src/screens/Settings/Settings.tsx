import { Card, Input, Form, Typography, Layout, Switch } from "antd";
import Button from "../../components/UI/Button";
import { useState, useTransition } from "react";
import { theme as appTheme } from "../../styles/theme";
import { useSettings } from "../../hooks/useSettings";
import { getTokenDetails } from "../../services/solana";
import { viewWalletOnExplorer } from "../../helpers/wallet";
import { pauseUnpauseContract } from "../../services/reward-system/pause-unpause-contract";
import { useGlobalProgress } from "../../hooks/useGlobalProgress";
import { usePhantom } from "../../hooks/usePhantom";
import { PublicKey } from "@solana/web3.js";
import { getRewardSystemProgram } from "../../services/reward-system/program";
const { Title } = Typography;
const { Content } = Layout;

const Settings = () => {
  const [isPending, startTransition] = useTransition();
  const { settings, setSettings, refreshSettingsState } = useSettings();
  const [isError, setIsError] = useState(false);
  const { showProgress, setProgressStatus } = useGlobalProgress();
  const { provider } = usePhantom();

  const handleSubmit = (values: { contractId: string; token: string }) => {
    startTransition(async () => {
      setIsError(false);
      // Simulate a network request
      localStorage.setItem("programId", values.contractId);
      localStorage.setItem("tokenId", values.token);
      const tokenDetails = await getTokenDetails(
        values.token,
        "devnet",
        values.contractId
      );
      if (!tokenDetails) return setIsError(true);

      setSettings({
        contractId: values.contractId,
        tokenId: values.token,
        network: "devnet",
        isSettingsCompleted: true,
        tokenDetails: tokenDetails,
      });
    });
  };

  const handlePauseUnpause = async (pause: boolean) => {
    try {
      showProgress(10);
      const program = await getRewardSystemProgram(
        settings?.contractId as string,
        provider.publicKey as PublicKey
      );
      // await 1/2 second
      await new Promise((resolve) => setTimeout(resolve, 500));
      showProgress(20);
      const txStatus = await pauseUnpauseContract({
        program,
        provider,
        pause,
        network: settings?.network ?? "devnet",
      });
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (txStatus?.status === "confirmed") {
        showProgress(100);
        setProgressStatus("success");
      } else {
        showProgress(100);
        setProgressStatus("exception");
      }
      refreshSettingsState();
    } catch (error) {
      console.error(error);
      showProgress(100);
      setProgressStatus("exception");
      refreshSettingsState();
    }
  };

  const AddSettings = () => {
    return (
      <Card>
        <Title
          level={2}
          style={{
            color: appTheme.palette.text.color,
          }}
        >
          Settings
        </Title>

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="contractId"
            label="Contract Address"
            tooltip="Enter contract address for deposits"
            rules={[
              {
                required: true,
                message: "Please enter the contract address",
              },
            ]}
          >
            <Input
              placeholder="Enter contract address"
              value={settings?.contractId}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="token"
            label="Token Address"
            style={{ color: appTheme.palette.text.color }}
            tooltip="Enter token address for deposits"
            rules={[
              { required: true, message: "Please enter the token address" },
            ]}
          >
            <Input
              placeholder="Enter token address"
              style={{ width: "100%" }}
              value={settings?.tokenId}
            />
          </Form.Item>

          <Form.Item>
            <Button htmlType="submit" block loading={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </Form.Item>
        </Form>
        {isError && (
          <Typography.Text style={{ color: appTheme.palette.error.main }}>
            Error: Token not found
          </Typography.Text>
        )}
      </Card>
    );
  };

  const Details = () => {
    return (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Title style={{ color: appTheme.palette.text.color }} level={4}>
            Contract & Token Details
          </Title>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            width: "100%",
          }}
        >
          {/* Token Details Column */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <Typography.Text style={{ color: appTheme.palette.text.color }}>
                Token Address:
              </Typography.Text>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Typography.Text
                  style={{
                    color: appTheme.palette.wayru.primary,
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    viewWalletOnExplorer(
                      settings?.tokenId ?? "",
                      settings?.network as "devnet" | "mainnet"
                    )
                  }
                >
                  {settings?.tokenId}
                </Typography.Text>
              </div>
            </div>

            {settings?.tokenDetails && (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <Typography.Text>Token Decimals:</Typography.Text>
                  <Typography.Text style={{ fontSize: "16px" }}>
                    {settings.tokenDetails.decimals}
                  </Typography.Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <Typography.Text>Token Supply:</Typography.Text>
                  <Typography.Text style={{ fontSize: "16px" }}>
                    {settings.tokenDetails.supply}
                  </Typography.Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <Typography.Text>Token Freeze Authority:</Typography.Text>
                  <Typography.Text style={{ fontSize: "16px" }}>
                    {settings.tokenDetails.freezeAuthority || "None"}
                  </Typography.Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <Typography.Text>Token Mint Authority:</Typography.Text>
                  <Typography.Text style={{ fontSize: "16px" }}>
                    {settings.tokenDetails.mintAuthority || "None"}
                  </Typography.Text>
                </div>
              </>
            )}
          </div>
          {/* Contract Details Column */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <Typography.Text style={{ color: appTheme.palette.text.color }}>
                Contract Address:
              </Typography.Text>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Typography.Text
                  style={{
                    color: appTheme.palette.wayru.primary,
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    viewWalletOnExplorer(
                      settings?.contractId ?? "",
                      settings?.network as "devnet" | "mainnet"
                    )
                  }
                >
                  {settings?.contractId}
                </Typography.Text>
              </div>
            </div>

            {settings?.contractDetails && (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <Typography.Text>Authority contract Address:</Typography.Text>
                  <Typography.Text
                    style={{
                      color: appTheme.palette.wayru.primary,
                      fontSize: "16px",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      viewWalletOnExplorer(
                        settings?.contractDetails?.adminPubkey ?? "",
                        settings?.network as "devnet" | "mainnet"
                      )
                    }
                  >
                    {settings?.contractDetails?.adminPubkey}
                  </Typography.Text>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <Typography.Text>Contract Token Balance:</Typography.Text>
                  <Typography.Text style={{ fontSize: "16px" }}>
                    {settings.tokenDetails?.contractTokenBalance}
                  </Typography.Text>|
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <Typography.Text>Contract Status:</Typography.Text>
                  <Switch
                    style={{
                      width: 74,
                      borderColor: appTheme.palette.wayru.outline,
                      borderWidth: 1,
                    }}
                    className="custom-switch"
                    checkedChildren="Active"
                    unCheckedChildren="Paused"
                    defaultChecked={!settings.contractDetails.paused}
                    onChange={(checked) => {
                      console.log(
                        "Contract status changed to:",
                        checked ? "Paused" : "Active"
                      );
                      handlePauseUnpause(checked);
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <Button onClick={() => setSettings(null)} style={{ marginTop: 16 }}>
          Change Settings
        </Button>
      </>
    );
  };

  return (
    <Content style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div
        style={{
          display: "flex",
          gap: "24px",
          justifyContent: "center",
          padding: "24px",
          width: "100%",
        }}
      >
        <div style={{ width: "80%" }}>
          {settings?.contractId && settings?.tokenId ? (
            <Details />
          ) : (
            <AddSettings />
          )}
        </div>
      </div>
    </Content>
  );
};

export default Settings;
