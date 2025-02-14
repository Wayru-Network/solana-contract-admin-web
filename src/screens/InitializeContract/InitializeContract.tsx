import React from "react";
import { Input, Form, Typography, message } from "antd";
import { WalletOutlined } from "@ant-design/icons";
import { usePhantom } from "../../hooks/usePhantom";
import { PublicKey } from "@solana/web3.js";
import { theme as appTheme } from "../../styles/theme";
import { useTransition } from "react";
import Button from "../../components/UI/Button";
import { useGlobalProgress } from "../../hooks/useGlobalProgress";
import { initializeContract } from "../../services/reward-system/initialize-contract";
import { getRewardSystemProgram } from "../../services/reward-system/program";
import { useSettings } from "../../hooks/useSettings";

const { Title } = Typography;

interface InitializeContractFormValues {
  mintAuthority: string;
  tokenMint: string;
}

const InitializeContract: React.FC = () => {
  const [form] = Form.useForm();
  const { provider } = usePhantom();
  const [isInitializing, startTransitionInitializing] = useTransition();
  const { showProgress, setProgressStatus } = useGlobalProgress();
  const { settings } = useSettings();

  const handleSubmit = async (values: InitializeContractFormValues) => {
    startTransitionInitializing(async () => {
      try {
        showProgress(10);
        const program = await getRewardSystemProgram(
          settings?.contractId as string,
          provider.publicKey as PublicKey
        );
        // await 1/2 second
        await new Promise((resolve) => setTimeout(resolve, 500));
        showProgress(20);
        const { status, signature } = await initializeContract({
          program,
          provider,
          tokenMint: new PublicKey(values.tokenMint),
          mintAuthority: new PublicKey(values.mintAuthority),
          network: settings?.network,
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
        showProgress(50);
        await new Promise((resolve) => setTimeout(resolve, 500));
        showProgress(100);
        if (status === "confirmed") {
          setProgressStatus("success");
          return;
        }
        console.log("status", status);
        console.log("signature", signature);
        setProgressStatus("exception");
      } catch (error) {
        console.error("Error initializing contract:", error);
        showProgress(100);
        setProgressStatus("exception");
        message.error("Failed to initialize contract");
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
        Initialize Contract
      </Title>

      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Mint Authority Address:"
            name="mintAuthority"
            rules={[
              {
                required: true,
                message: "Please enter the mint authority address",
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
                      console.error(
                        "Error validating mint authority address:",
                        error
                      );
                      throw new Error("Invalid Solana address");
                    }
                  }
                },
              },
            ]}
          >
            <Input
              prefix={<WalletOutlined />}
              placeholder="Enter Solana address"
            />
          </Form.Item>

          <Form.Item
            label="Token Mint Address:"
            name="tokenMint"
            rules={[
              {
                required: true,
                message: "Please enter the token mint address",
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
                      console.error(
                        "Error validating token mint address:",
                        error
                      );
                      throw new Error("Invalid Solana address");
                    }
                  }
                },
              },
            ]}
          >
            <Input
              prefix={<WalletOutlined />}
              placeholder="Enter token mint address"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              disabled={
                isInitializing ||
                !provider.publicKey ||
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

        {
          Number(settings?.contractDetails?.mintAuthorities?.length) > 0 && (
            <Typography.Text
              style={{
                color: appTheme.palette.error.main,
                display: "block",
                textAlign: "center",
                marginTop: "16px",
              }}
            >
              Contract already initialized
            </Typography.Text>
          )
        }

        {!provider.publicKey && (
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
        )}
      </div>
    </div>
  );
};

export default InitializeContract;
