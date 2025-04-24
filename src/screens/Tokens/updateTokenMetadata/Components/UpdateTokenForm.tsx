import { Form, FormInstance, Input } from "antd";
import { MintKeyStatus } from "../../../../services/solana";
import Button from "../../../../components/UI/Button";
import { Provider } from "../../../../interfaces/phantom/phantom";

export interface FormValues {
  metadataUrl: string;
  customMintKeypair: string;
}

interface UpdateTokenMetadataFormProps {
  form: FormInstance<FormValues>;
  provider: Provider;
  onSubmit: (values: FormValues) => void;
  mintKeyStatus: MintKeyStatus | null;
}

export const UpdateTokenMetadataForm = ({
  form,
  provider,
  onSubmit,
}: UpdateTokenMetadataFormProps) => {
  return (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <Form.Item
        label="New IPFS Token Metadata URL"
        name="metadataUrl"
        rules={[
          { required: true, message: "Please enter the new metadata URL" },
          { min: 20, message: "URL must be at least 20 characters long" },
        ]}
      >
        <Input placeholder="https://ipfs..." />
      </Form.Item>

      <Button
        disabled={
          !provider?.publicKey
        }
        htmlType="submit"
        block
      >
        Update Token Metadata
      </Button>
    </Form>
  );
};
