import React from "react";
import { Input, Form, Typography, message, Popconfirm } from "antd";
import { UserOutlined, DeleteOutlined } from "@ant-design/icons";
import { usePhantom } from "../../hooks/usePhantom";
import { PublicKey } from "@solana/web3.js";
import { theme as appTheme } from "../../styles/theme";
import { useSettings } from "../../hooks/useSettings";
import { useTransition } from "react";
import Button from "../../components/UI/Button";
import {
  AddMintAuthority,
  removeMintAuthority,
} from "../../services/reward-system/mint-authorities";
import { getRewardSystemProgram } from "../../services/reward-system/program";
import { formatWalletAddress, viewWalletOnExplorer } from "../../helpers/wallet";
import { useGlobalProgress } from '../../hooks/useGlobalProgress';
const { Title } = Typography;

interface AddAuthorityFormValues {
  authorityAddress: string;
}

const AuthorityConfigs: React.FC = () => {
  const [form] = Form.useForm();
  const { provider } = usePhantom();
  const [isAddingAuthority, startTransitionAddingAuthority] = useTransition();
  const [isRemovingAuthority, startTransitionRemovingAuthority] =
    useTransition();
  const { settings, refreshSettingsState } = useSettings();
  const { setProgressState } = useGlobalProgress();

  const handleSubmit = async (values: AddAuthorityFormValues) => {
    startTransitionAddingAuthority(async () => {
      try {
        if (!provider) {
          message.error("Please connect your wallet");
          return;
        }
        setProgressState({ percent: 8 });
        console.log("Starting submission with values:", values);
        console.log("Provider state:", {
          isConnected: provider?.isConnected,
          publicKey: provider?.publicKey?.toString(),
        });

        const program = await getRewardSystemProgram(
          settings?.contractId as string,
          provider.publicKey as PublicKey,
          "mainnet"
        );
        setProgressState({ percent: 25 });

        const txStatus = await AddMintAuthority({
          program: program,
          newMintAuthority: new PublicKey(values.authorityAddress),
          provider: provider,
          network: settings?.network,
        });
        setProgressState({ percent: 70 });

        console.log("Transaction completed:", txStatus);
        if (txStatus.status === "confirmed") {
          console.log("Refreshing settings state");
          await refreshSettingsState();
          form.resetFields();
          setProgressState({ percent: 100, status: 'success' });
        }
        message.success("Authority added successfully");
      } catch (error) {
        console.error("Detailed error in handleSubmit:", error);
        setProgressState({ percent: 100, status: 'exception' });
      }
    });
  };

  const handleRemoveAuthority = async (authority: string) => {
    startTransitionRemovingAuthority(async () => {
      try {
        if (!provider) {
          message.error("Please connect your wallet");
          return;
        }
        setProgressState({ percent: 10 });
        console.log("authority", authority);
        const program = await getRewardSystemProgram(
          settings?.contractId as string,
          provider?.publicKey as PublicKey,
          "mainnet"
        );
        setProgressState({ percent: 25 });
        const txStatus = await removeMintAuthority({
          program: program,
          mintAuthorityToRemove: new PublicKey(authority),
          provider: provider,
          network: settings?.network,
        });
        setProgressState({ percent: 70 });
        if (txStatus.status === "confirmed") {
          console.log("Refreshing settings state");
          await refreshSettingsState();
          setProgressState({ percent: 100, status: 'success' });
        }
        console.log("Transaction completed:", txStatus);
        message.success("Authority removed successfully");
      } catch (error) {
        console.error("Error removing authority:", error);
        setProgressState({ percent: 100, status: 'exception' });
      }
    });
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}>
      <Title
        style={{
          color: appTheme.palette.text.color,
          marginBottom: 32,
          textAlign: "center",
        }}
        level={2}
      >
        Authority Configurations
      </Title>

      <div style={{ display: "flex", gap: "24px" }}>
        {/* Left Column - Current Authorities */}
        <div style={{ flex: 1 }}>
          <Title
            level={4}
            style={{ color: appTheme.palette.text.color, marginTop: 0 }}
          >
            Current Mint Authorities
          </Title>

          <div
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              padding: "8px 0",
            }}
          >
            {settings?.contractDetails?.mintAuthorities ? (
              settings.contractDetails.mintAuthorities.map(
                (authority, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "8px",
                      marginBottom: "4px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "transparent",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Typography.Text
                        style={{
                          color: appTheme.palette.text.color,
                          marginRight: "4px",
                        }}
                      >
                        <strong>{index + 1}.</strong>
                      </Typography.Text>
                      <Typography.Text
                        style={{
                          color: appTheme.palette.wayru.primary,
                          flex: 1,
                          marginRight: "12px",
                          wordBreak: "break-all",
                          cursor: "pointer",
                        }}
                        onClick={() => viewWalletOnExplorer(authority, settings?.network as "devnet" | "mainnet")}
                      >
                        {formatWalletAddress(authority, 18)}
                      </Typography.Text>
                    </div>
                    <Popconfirm
                      title="Delete Authority"
                      description="Are you sure you want to delete this authority address?"
                      onConfirm={() => handleRemoveAuthority(authority)}
                      okText="Yes"
                      cancelText="No"
                      okButtonProps={{ danger: true }}
                    >
                      <DeleteOutlined
                        style={{
                          color: appTheme.palette.error.main,
                          fontSize: "15px",
                          cursor: "pointer",
                        }}
                      />
                    </Popconfirm>
                  </div>
                )
              )
            ) : (
              <Typography.Text type="secondary">
                No authorities found
              </Typography.Text>
            )}
          </div>

          <div style={{ marginTop: "24px" }}>
            <Title level={5} style={{ color: appTheme.palette.text.color }}>
              Contract Details
            </Title>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Typography.Text
                  style={{ color: appTheme.palette.text.color, marginRight: "4px" }}
                >
                  <strong>ID:</strong>
                </Typography.Text>
                <Typography.Text
                  copyable
                  style={{
                    color: appTheme.palette.wayru.primary,
                    cursor: "pointer",
                  }}
                  onClick={() => viewWalletOnExplorer(settings?.contractId ?? "", settings?.network as "devnet" | "mainnet")}
                >
                  {formatWalletAddress(settings?.contractId ?? "", 18)}
                </Typography.Text>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Typography.Text
                  style={{ color: appTheme.palette.text.color }}
                >
                  <strong>Upgrade Authority Address:</strong>
                </Typography.Text>
                <Typography.Text
                  copyable
                  style={{
                    color: appTheme.palette.wayru.primary,
                    cursor: "pointer",
                  }}
                  onClick={() => viewWalletOnExplorer(settings?.contractDetails?.adminPubkey ?? "", settings?.network as "devnet" | "mainnet")}
                >
                  {formatWalletAddress(settings?.contractDetails?.adminPubkey ?? "", 20)}
                </Typography.Text>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Add New Authority */}
        <div style={{ flex: 1 }}>
          <Title
            level={4}
            style={{ color: appTheme.palette.text.color, marginTop: 0 }}
          >
            Add New Authority
          </Title>

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="New Authority Address:"
              name="authorityAddress"
              rules={[
                {
                  required: true,
                  message: "Please enter the authority address",
                },
                {
                  validator: async (_, value) => {
                    if (value) {
                      try {
                        const isOnCurve = PublicKey.isOnCurve(value);
                        if (!isOnCurve) {
                          throw new Error("Invalid Solana address");
                        }
                      } catch (error) {
                        console.log("error", error);
                        throw new Error("Invalid Solana address");
                      }
                    }
                  },
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter Solana address"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                disabled={
                  isAddingAuthority ||
                  isRemovingAuthority ||
                  !settings?.isSettingsCompleted ||
                  !settings?.contractId ||
                  !provider?.publicKey
                }
                htmlType="submit"
                block
                loading={isAddingAuthority}
              >
                {isAddingAuthority
                  ? "Adding..."
                  : "Confirm"}
              </Button>
            </Form.Item>
          </Form>

          {(!settings?.isSettingsCompleted || !provider?.publicKey) && (
            <Typography.Text
              style={{
                color: appTheme.palette.error.main,
                display: "block",
                textAlign: "center",
                marginTop: "16px",
              }}
            >
              {!settings?.isSettingsCompleted
                ? "Please complete the settings first"
                : "Please connect your wallet"}
            </Typography.Text>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorityConfigs;
