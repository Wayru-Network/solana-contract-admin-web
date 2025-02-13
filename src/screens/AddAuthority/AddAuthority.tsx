import React from "react";
import {
  Card,
  Input,
  Form,
  Typography,
  Divider,
  message,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { usePhantom } from "../../hooks/usePhantom";
import { PublicKey } from "@solana/web3.js";
import { theme as appTheme } from "../../styles/theme";
import { useSettings } from "../../hooks/useSettings";
import { useTransition } from "react";
import Button from "../../components/UI/Button";
import { AddMintAuthority } from "../../services/reward-system/add-authority";
import { getRewardSystemProgram } from "../../services/reward-system/program";
const { Title } = Typography;

interface AddAuthorityFormValues {
  authorityAddress: string;
}

const AddAuthority: React.FC = () => {
  const [form] = Form.useForm();
  const { provider } = usePhantom();
  const [isPending, startTransition] = useTransition();
  const { settings } = useSettings();

  const handleSubmit = async (values: AddAuthorityFormValues) => {
    startTransition(async () => {
      try {
        console.log("Starting submission with values:", values);
        console.log("Provider state:", {
          isConnected: provider?.isConnected,
          publicKey: provider?.publicKey?.toString(),
        });
        console.log("Settings state:", {
          contractId: settings?.contractId,
          network: settings?.network,
        });

        const program = await getRewardSystemProgram(
          settings?.contractId as string,
          provider.publicKey as PublicKey
        );
        console.log("Program initialized successfully");

        const txStatus = await AddMintAuthority({
          program: program,
          newMintAuthority: new PublicKey(values.authorityAddress),
          provider: provider,
          network: settings?.network,
        });
        
        console.log("Transaction completed:", txStatus);
        message.success('Authority added successfully');
      } catch (error) {
        console.error("Detailed error in handleSubmit:", error);
      }
    });
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px" }}>
      <Card>
        <Title
          style={{
            color: appTheme.palette.text.color,
          }}
          level={2}
        >
          Add Authority
        </Title>

        {settings?.contractDetails?.mintAuthorities && (
          <>
            <Title level={5} style={{ color: appTheme.palette.text.color }}>
              Current Mint Authorities:
            </Title>
            <div style={{ marginBottom: 24 }}>
              {settings.contractDetails.mintAuthorities.map((authority, index) => (
                <Typography.Text
                  key={index}
                  style={{
                    display: 'block',
                    color: appTheme.palette.text.color,
                    marginBottom: 8
                  }}
                >
                 {index + 1}: {authority}
                </Typography.Text>
              ))}
            </div>
            <Divider />
          </>
        )}

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="New Authority Address:"
            name="authorityAddress"
            rules={[
              { required: true, message: "Please enter the authority address" },
              {
                validator: async (_, value) => {
                  if (value) {
                    try {
                     const isOnCurve = PublicKey.isOnCurve(value);
                     if (!isOnCurve) {
                      throw new Error('Invalid Solana address');
                     }
                    } catch (error) {
                      console.log("error", error);
                      throw new Error('Invalid Solana address');
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

          <Form.Item label="Contract address:" name="contractAddress">
            <Typography.Text disabled style={{ color: appTheme.palette.text.color }}>
              {settings?.contractId}
            </Typography.Text>
          </Form.Item>

          <Divider />
          
          <Form.Item style={{ marginTop: "24px" }}>
            <Button 
              disabled={isPending 
                || !settings?.isSettingsCompleted
                || !settings?.contractId 
                || !provider.publicKey
              } 
              htmlType="submit" 
              block 
              loading={isPending}
            >
              {isPending ? "Adding Authority..." : "Confirm"}
            </Button>
          </Form.Item>
        </Form>
        {
          !settings?.isSettingsCompleted && (
            <Typography.Text style={{ color: appTheme.palette.error.main, textAlign: "center" }}>
              Please complete the settings first
            </Typography.Text>
          )
          ||
          !provider.publicKey && (
            <Typography.Text style={{ color: appTheme.palette.error.main, textAlign: "center", width: "100%" }}>
              Please connect your wallet
            </Typography.Text>
          )
        }
      </Card>
    </div>
  );
};

export default AddAuthority;
