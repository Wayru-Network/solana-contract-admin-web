import { Input, Form, Typography, Switch, Spin, message } from "antd";
import Button from "../../components/UI/Button";
import { useEffect, useState, useTransition } from "react";
import { theme as appTheme } from "../../styles/theme";
import { useSettings } from "../../hooks/useSettings";
import { getTokenDetails } from "../../services/solana";
import { viewWalletOnExplorer } from "../../helpers/wallet";
import { pauseUnpauseContract } from "../../services/reward-system/pause-unpause-contract";
import { useGlobalProgress } from "../../hooks/useGlobalProgress";
import { usePhantom } from "../../hooks/usePhantom";
import { PublicKey } from "@solana/web3.js";
import { getRewardSystemProgram } from "../../services/reward-system/program";
import { FormCard } from "../../components/FormCard/FormCard";
import { FormScreenWrapper } from "../../components/Wrappers/FormScreenWrapper";
const { Title } = Typography;

const FONT_SIZE_DETAILS = "14px";

const Settings = () => {
  const [isPending, startTransition] = useTransition();
  const {
    settings,
    setSettings,
    refreshSettingsState,
    isGettingSettings,
    deleteSettings,
  } = useSettings();
  const [isError, setIsError] = useState(false);
  const { setProgressState } = useGlobalProgress();
  const { provider } = usePhantom();
  const [messageApi, contextHolder] = message.useMessage();
  const [isSwitchOn, setIsSwitchOn] = useState(
    !settings?.contractDetails?.paused
  );

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
      refreshSettingsState();
    });
  };

  const handlePauseUnpause = async (pause: boolean) => {
    try {
      if (!provider) {
        messageApi.error("Please connect your wallet");
        return;
      } else if (
        settings?.contractDetails?.programDetails?.upgradeAuthority !==
        provider.publicKey?.toString()
      ) {
        messageApi.error(
          "Wallet connected is not the same as the upgrade authority"
        );
        return;
      }

      setIsSwitchOn(pause);
      setProgressState({ percent: 10 });
      const program = await getRewardSystemProgram(
        settings?.contractId as string,
        provider.publicKey as PublicKey
      );
      // await 1/2 second
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProgressState({ percent: 20 });
      const txStatus = await pauseUnpauseContract({
        program,
        provider,
        pause,
        network: settings?.network ?? "devnet",
      });
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (txStatus?.status === "confirmed") {
        await refreshSettingsState();
        setProgressState({ percent: 100, status: 'success' });
      } else {
        setProgressState({ percent: 100, status: 'exception' });
      }
      refreshSettingsState();
    } catch (error) {
      console.error(error);
      setProgressState({ percent: 100, status: 'exception' });
      refreshSettingsState();
    }
  };

  useEffect(() => {
    if (settings?.contractDetails?.paused) {
      setIsSwitchOn(false);
    } else {
      setIsSwitchOn(true);
    }
  }, [settings?.contractDetails?.paused]);

  if (isGettingSettings) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
        }}
      >
        <Spin size="large" tip="Loading settings..." />
      </div>
    );
  }

  const AddSettings = () => {
    return (
      <FormCard
        title="Settings"
        formBody={
          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="contractId"
              label="Contract Address"
              tooltip="Enter contract address"
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
              tooltip="Enter token address"
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
        }
        bottomComponent={
          isError && (
            <Typography.Text style={{ color: appTheme.palette.error.main }}>
              Error: Token not found
            </Typography.Text>
          )
        }
      />
    );
  };

  const Details = () => {
    return (
      <div>
        <Title
          style={{
            color: appTheme.palette.text.color,
            marginBottom: 28,
            textAlign: "center",
          }}
          level={2}
        >
          Contract & Token Details
        </Title>

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
                    fontSize: FONT_SIZE_DETAILS,
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
                  <Typography.Text style={{ fontSize: FONT_SIZE_DETAILS }}>
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
                  <Typography.Text style={{ fontSize: FONT_SIZE_DETAILS }}>
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
                  <Typography.Text style={{ fontSize: FONT_SIZE_DETAILS }}>
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
                  <Typography.Text style={{ fontSize: FONT_SIZE_DETAILS }}>
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
                    fontSize: FONT_SIZE_DETAILS,
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
                      fontSize: FONT_SIZE_DETAILS,
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
                  <Typography.Text>
                    Upgrade Authority Contract address:
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      color: appTheme.palette.wayru.primary,
                      fontSize: FONT_SIZE_DETAILS,
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      viewWalletOnExplorer(
                        settings?.contractDetails?.adminPubkey ?? "",
                        settings?.network as "devnet" | "mainnet"
                      )
                    }
                  >
                    {
                      settings?.contractDetails?.programDetails
                        ?.upgradeAuthority
                    }
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
                  <Typography.Text style={{ fontSize: FONT_SIZE_DETAILS }}>
                    {settings.tokenDetails?.contractTokenBalance}
                  </Typography.Text>
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
                      borderColor: appTheme.palette.wayru.outline,
                      borderWidth: 1,
                    }}
                    className="custom-switch"
                    checkedChildren="Active"
                    unCheckedChildren="Paused"
                    checked={isSwitchOn}
                    onChange={(checked) => {
                      handlePauseUnpause(!checked);
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        <Button onClick={() => deleteSettings()} style={{ marginTop: 16 }}>
          Change Settings
        </Button>
      </div>
    );
  };

  return (
    <FormScreenWrapper
      maxWidth={
        settings?.contractId && settings?.tokenId && "45% !important"
      }
    >
      {contextHolder}
      {settings?.contractId && settings?.tokenId ? (
        <Details />
      ) : (
        <AddSettings />
      )}
    </FormScreenWrapper>
  );
};

export default Settings;
