import React, { useState } from "react";
import {
  Card,
  Input,
  Button,
  Form,
  Typography,
  Divider,
  Spin,
  message,
} from "antd";
import {
  DollarOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { getRewardSystemProgram } from "../../services/reward-system/program";
import { usePhantom } from "../../hooks/usePhantom";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { depositToken } from "../../services/reward-system/deposit-token";
import { convertToTokenAmount } from "../../helpers/reward-system/reward-system";

const { Title } = Typography;

interface DepositFormValues {
  amount: string;
  contractAddress: string;
  tokenAddress: string;
}

const Deposit: React.FC = () => {
  const [form] = Form.useForm();
  const { provider } = usePhantom();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: DepositFormValues) => {
    try {
      // send alert
      setIsLoading(true);
      const program = await getRewardSystemProgram(
        values.contractAddress,
        provider.publicKey as PublicKey
      );
      // deposit token
      const { status, signature } = await depositToken({
        program,
        userPublicKey: provider.publicKey as PublicKey,
        mint: new PublicKey(values.tokenAddress),
        amount: new BN(convertToTokenAmount(Number(values.amount))),
        provider: provider,
      });

      if (status === "confirmed") {
        message.success('Deposit successful');
      } else {
        message.error('Deposit failed');
      }

      console.log("status", status);
      console.log("signature", signature);
    } catch (error) {
      message.error('Deposit failed');
      console.log("handleSubmit error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px" }}>
      <Card>
        <Title level={2}>
           Fund contract
        </Title>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Amount to deposit"
            name="amount"
            rules={[{ required: true, message: "Please enter the amount" }]}
          >
            <Input
              prefix={<DollarOutlined />}
              placeholder="0.00"
              type="number"
            />
          </Form.Item>

          <Form.Item label="Contract address" name="contractAddress">
            <Input placeholder="0x..." />
          </Form.Item>

          <Form.Item label="Token address" name="tokenAddress">
            <Input placeholder="Fx..." />
          </Form.Item>
          <Divider />
          <Form.Item style={{ marginTop: "24px" }}>
            <Button type="primary" htmlType="submit" block>
              {isLoading ? (
                <Spin indicator={<LoadingOutlined style={{ color: 'white' }} spin />} />
              ) : (
                "Confirm Deposit"
              )}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Deposit;
