import { Col } from "antd";
import { Row } from "antd";
import { Form, FormInstance, Input } from "antd";
import { PublicKey } from "@solana/web3.js";
import { MintKeyStatus } from "../../../../services/solana";
import { KeypairField } from "./KeypairField";
import Button from "../../../../components/UI/Button";
import { Provider } from "../../../../interfaces/phantom/phantom";

export interface FormValues {
  totalSupply: string;
  name: string;
  symbol: string;
  decimals: number;
  metadataUrl: string;
  recipientAddress: string;
  customMintKeypair: string;
}

interface MintTokensFormProps {
  form: FormInstance<FormValues>;
  provider: Provider;
  onSubmit: (values: FormValues) => void;
  mintKeyStatus: MintKeyStatus;
  handleKeypairChange: (value: string) => void;
  mintKeypairAddress: string;
  isCheckingMintKeyStatus: boolean;
}
export const MintTokensForm = ({
  form,
  provider,
  onSubmit,
  mintKeyStatus,
  handleKeypairChange,
  mintKeypairAddress,
  isCheckingMintKeyStatus,
}: MintTokensFormProps) => {
  const formatNumber = (value: string) => {
    const cleanValue = value.replace(/[^\d]/g, "");
    const number = parseInt(cleanValue);
    if (isNaN(number)) return "";
    return number.toLocaleString("en-US");
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatNumber(e.target.value);
    form.setFieldValue("totalSupply", formattedValue);
  };

  return (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <Row gutter={[16, 0]}>
        <Col span={12}>
          <Form.Item
            label="Total to supply"
            name="totalSupply"
            rules={[
              { required: true, message: "Please enter the total supply" },
            ]}
          >
            <Input placeholder="0.00" onChange={handleNumberChange} />
          </Form.Item>

          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter the name" }]}
          >
            <Input placeholder="WAYRU TOKEN" />
          </Form.Item>

          <Form.Item
            label="Symbol"
            name="symbol"
            rules={[{ required: true, message: "Please enter the symbol" }]}
          >
            <Input placeholder="WAYRU" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Decimals"
            name="decimals"
            rules={[{ required: true, message: "Please enter the decimals" }]}
          >
            <Input type="number" placeholder="6" />
          </Form.Item>

          <Form.Item
            label="Token metadata url"
            name="metadataUrl"
            rules={[
              { required: true, message: "Please enter the metadata url" },
              { min: 20, message: "URL must be at least 10 characters long" },
            ]}
          >
            <Input placeholder="https://ipfs.algonode.xyz/ipfs/..." />
          </Form.Item>

          <Form.Item
            label="Token Recipient"
            name="recipientAddress"
            tooltip="Address of the wallet that will receive the tokens (defaults to your connected wallet if empty)"
            rules={[
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  try {
                    new PublicKey(value);
                    return Promise.resolve();
                  } catch (error) {
                    console.error("Error parsing recipient address:", error);
                    return Promise.reject(
                      new Error("Please enter a valid Solana address")
                    );
                  }
                },
              },
            ]}
          >
            <Input placeholder="0x..." />
          </Form.Item>
        </Col>
      </Row>

      {/* Custom Mint Keypair */}
      <KeypairField
        handleKeypairChange={handleKeypairChange}
        mintKeyStatus={mintKeyStatus}
        mintKeypairAddress={mintKeypairAddress}
        isCheckingMintKeyStatus={isCheckingMintKeyStatus}
      />

      <Button
        disabled={
          !provider?.publicKey ||
          (mintKeyStatus?.exists && mintKeyStatus?.isToken) ||
          (mintKeyStatus?.exists && !mintKeyStatus?.isToken)
        }
        htmlType="submit"
        block
      >
        {mintKeyStatus?.exists && mintKeyStatus?.isToken
          ? "Token Already Exists"
          : "Mint"}
      </Button>
    </Form>
  );
};
