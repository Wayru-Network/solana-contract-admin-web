import React from "react";
import {
  Card,
  Input,
  Form,
  Typography,
  Divider,
  message,
} from "antd";
import {
  DollarOutlined,
} from "@ant-design/icons";
import { getRewardSystemProgram } from "../../services/reward-system/program";
import { usePhantom } from "../../hooks/usePhantom";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { FundContractToken } from "../../services/reward-system/found-contract";
import { convertToTokenAmount } from "../../helpers/reward-system/reward-system";
import { theme as appTheme } from "../../styles/theme";
import { useSettings } from "../../hooks/useSettings";
import { useTransition } from "react";
import Button from "../../components/UI/Button";
import { useGlobalProgress } from '../../hooks/useGlobalProgress';
const { Title } = Typography;

interface FundContractFormValues {
  amount: string;
}

const FundContract: React.FC = () => {
  const [form] = Form.useForm();
  const { provider } = usePhantom();
  const [isPending, startTransition] = useTransition();
  const { settings } = useSettings();
  const { showProgress, setProgressStatus } = useGlobalProgress();

  const handleSubmit = async (values: FundContractFormValues) => {
    startTransition(async () => {
      try {
        form.resetFields();
        showProgress(10);
        const program = await getRewardSystemProgram(
          settings?.contractId as string,
          provider.publicKey as PublicKey
        );
        showProgress(20);
        const { status, signature } = await FundContractToken({
          program,
          userPublicKey: provider.publicKey as PublicKey,
          mint: new PublicKey(settings?.tokenId as string),
          amount: new BN(convertToTokenAmount(Number(values.amount))),
          provider: provider,
          network: settings?.network
        });
        showProgress(50);
        if (status === "confirmed") {
          showProgress(100);
          setProgressStatus("success");
        } else {
          showProgress(100);
          setProgressStatus("exception");
        }

        console.log("status", status);
        console.log("signature", signature);
      } catch (error) {
        message.error('FundContract failed');
        console.log("handleSubmit error", error);
        showProgress(100);
        setProgressStatus("exception");
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
        level={2}>
           Fund contract
        </Title>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Amount to FundContract:"
            name="amount"
            rules={[{ required: true, message: "Please enter the amount" }]}
          >
            <Input
              prefix={<DollarOutlined />}
              placeholder="0.00"
              type="number"
            />
          </Form.Item>

          <Form.Item label="Contract address:" name="contractAddress">
            <Typography.Text disabled style={{ color: appTheme.palette.text.color }}>{settings?.contractId}</Typography.Text>
          </Form.Item>

          <Form.Item label="Token address:" name="tokenAddress">
            <Typography.Text disabled style={{ color: appTheme.palette.text.color }}>{settings?.tokenId}</Typography.Text>
          </Form.Item>
          <Divider />
          <Form.Item style={{ marginTop: "24px" }}>
            <Button 
              disabled={isPending 
                ||
                !settings?.isSettingsCompleted
                ||
                !settings?.contractId 
                ||
                !settings?.tokenId
                || !provider.publicKey
              } 
              htmlType="submit" 
              block 
              loading={isPending}
            >
              {isPending ? (
                "Funding..."
              ) : (
                "Confirm"
              )}
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

export default FundContract;
