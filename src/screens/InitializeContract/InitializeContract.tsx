import React from "react";
import { Form, Typography, message } from "antd";
import { usePhantom } from "../../hooks/usePhantom";
import { PublicKey } from "@solana/web3.js";
import { theme as appTheme } from "../../styles/theme";
import { useTransition } from "react";
import Button from "../../components/UI/Button";
import { useGlobalProgress } from "../../hooks/useGlobalProgress";
import { initializeContract } from "../../services/reward-system/initialize-contract";
import { getRewardSystemProgram } from "../../services/reward-system/program";
import { useSettings } from "../../hooks/useSettings";
import { FormCard } from "../../components/FormCard/FormCard";
import { FormScreenWrapper } from "../../components/Wrappers/FormScreenWrapper";

interface InitializeContractFormValues {
  mintAuthority: string;
  tokenMint: string;
}

const InitializeContract: React.FC = () => {
  const [form] = Form.useForm();
  const { provider } = usePhantom();
  const [isInitializing, startTransitionInitializing] = useTransition();
  const { setProgressState } = useGlobalProgress();
  const { settings, refreshSettingsState } = useSettings();

  const handleSubmit = async (values: InitializeContractFormValues) => {
    startTransitionInitializing(async () => {
      try {
        if (!provider) {
          message.error("Please connect your wallet");
          return;
        }
        setProgressState({ percent: 10 });
        const program = await getRewardSystemProgram(
          settings?.contractId as string,
          provider?.publicKey as PublicKey,
          "mainnet"
        );
        // await 1/2 second
        await new Promise((resolve) => setTimeout(resolve, 500));
        setProgressState({ percent: 20 });
        const { status } = await initializeContract({
          program,
          provider,
          tokenMint: new PublicKey(values.tokenMint),
          network: settings?.network,
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
        setProgressState({ percent: 50 });
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (status === "confirmed") {
          await refreshSettingsState();
          setProgressState({ percent: 100, status: 'success' });
          return;
        }
        setProgressState({ percent: 100, status: 'exception' });
      } catch (error) {
        console.error("Error initializing contract:", error);
        setProgressState({ percent: 100, status: 'exception' });
        message.error("Failed to initialize contract");
      }
    });
  };

  // Add useEffect to set initial form values
  React.useEffect(() => {
    if (settings?.tokenId) {
      form.setFieldsValue({
        tokenMint: settings.tokenId,
      });
    }
  }, [settings?.tokenId, form]);

  return (
    <FormScreenWrapper>
      <FormCard
        title="Initialize Contract"
        formBody={
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Upgrade Authority Contract Address:"
              name="mintAuthority"
              initialValue={
                settings?.contractDetails?.programDetails?.upgradeAuthority
              }
            >
              <Typography.Text
                style={{
                  display: "block",
                  padding: "4px 11px",
                  background: "rgba(255, 255, 255, 0.1)",
                  color: appTheme.palette.text.color,
                  borderRadius: "6px",
                }}
              >
                {settings?.contractDetails?.programDetails?.upgradeAuthority ||
                  "No upgrade authority address set"}
              </Typography.Text>
            </Form.Item>

            <Form.Item
              label="Token Mint Address:"
              name="tokenMint"
              initialValue={settings?.tokenId}
            >
              <Typography.Text
                style={{
                  display: "block",
                  padding: "4px 11px",
                  background: "rgba(255, 255, 255, 0.1)",
                  color: appTheme.palette.text.color,
                  borderRadius: "6px",
                }}
              >
                {settings?.tokenId || "No token mint address set"}
              </Typography.Text>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                disabled={
                  isInitializing ||
                  !provider?.publicKey ||
                  Number(settings?.contractDetails?.mintAuthorities?.length) > 0
                }
                htmlType="submit"
                block
                loading={isInitializing}
              >
                {isInitializing ? "Initializing..." : "Initialize Contract"}
              </Button>
            </Form.Item>
          </Form>
        }
        bottomComponent={
          <div>
            {Number(settings?.contractDetails?.mintAuthorities?.length) > 0 && (
              <Typography.Text
                style={{
                  color: appTheme.palette.wayru.secondary,
                  display: "block",
                  textAlign: "center",
                  marginTop: "16px",
                }}
              >
                Contract already initialized
              </Typography.Text>
            )}

            {!settings?.tokenId ? (
              <Typography.Text
                style={{
                  color: appTheme.palette.error.main,
                  display: "block",
                  textAlign: "center",
                  marginTop: "16px",
                }}
              >
                Please settings the token mint address first
              </Typography.Text>
            ) : !provider?.publicKey ? (
              <Typography.Text
                style={{
                  color: appTheme.palette.error.main,
                  display: "block",
                  textAlign: "center",
                  marginTop: "16px",
                }}
              >
                Please connect your wallet to initialize the contract
              </Typography.Text>
            ) : (
              settings?.contractDetails?.programDetails?.upgradeAuthority !==
                provider?.publicKey?.toString() &&
              Number(settings?.contractDetails?.mintAuthorities?.length) ===
                0 && (
                <Typography.Text
                  style={{
                    color: appTheme.palette.error.main,
                    display: "block",
                    textAlign: "center",
                    marginTop: "16px",
                  }}
                >
                  Connected wallet does not match the upgrade authority contract
                  address
                </Typography.Text>
              )
            )}
          </div>
        }
      />
    </FormScreenWrapper>
  );
};

export default InitializeContract;
