import { Form, FormInstance, Input } from "antd";
import Button from "../../../../components/UI/Button";
import { Provider } from "../../../../interfaces/phantom/phantom";
import { PublicKey } from "@solana/web3.js";
import { getTokenMetadata } from "../../../../services/solana";
import { CONSTANTS } from "../../../../constants";
import { useSettings } from "../../../../hooks/useSettings";
import { useState, useEffect } from "react";

export interface FormValues {
  mint: string;
  newUri: string;
}

interface UpdateTokenMetadataFormProps {
  form: FormInstance<FormValues>;
  provider: Provider;
  onSubmit: (values: FormValues) => void;
}

export const UpdateTokenMetadataForm = ({
  form,
  provider,
  onSubmit,
}: UpdateTokenMetadataFormProps) => {
  const { settings } = useSettings();
  const network =
    settings?.network as keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"];
  const [mintAddress, setMintAddress] = useState("");
  const [newUri, setNewUri] = useState("");
  const [currentMetadata, setCurrentMetadata] = useState<{
    uri: string;
    name: string;
    symbol: string;
  } | undefined>(undefined);

  // Function to validate the token
  const validateToken = async (mint: string) => {
    if (!mint) return;
    try {
      const { isToken, metadata } = await getTokenMetadata(
        new PublicKey(mint),
        network
      );
      if (!isToken) {
        throw new Error("Token mint address is not a token");
      }
      setCurrentMetadata(metadata);
      return metadata;
    } catch (error) {
      console.error("Error validating token:", error);
      throw error;
    }
  };

  // useEffect to validate the form
  useEffect(() => {
    const validateForm = async () => {
      if (mintAddress && newUri) {
        try {
          const metadata = await validateToken(mintAddress);
          
          console.log('Validation Check:', {
            currentMetadataUri: metadata?.uri?.trim(),
            newUri: newUri?.trim(),
            areEqual: metadata?.uri?.trim() === newUri?.trim()
          });

          if (metadata?.uri?.trim() === newUri?.trim()) {
            form.setFields([
              {
                name: 'newUri',
                errors: ['Token already has this metadata URI']
              }
            ]);
          }
        } catch (error) {
          console.error("Validation error:", error);
        }
      }
    };

    validateForm();
  }, [mintAddress, newUri]);

  const handleValuesChange = async (changedValues: Partial<FormValues>) => {
    if (changedValues.newUri !== undefined) {
      setNewUri(changedValues.newUri);
    }
    if (changedValues.mint !== undefined) {
      setMintAddress(changedValues.mint);
    }
  };

  return (
    <Form 
      onValuesChange={handleValuesChange} 
      form={form} 
      layout="vertical" 
      onFinish={onSubmit}
    >
      <Form.Item
        label="Token Mint Address"
        name="mint"
        rules={[
          {
            required: true,
            message: "Please enter the token mint address"
          },
          {
            validator: async (_, value) => {
              if (!value) return Promise.resolve();
              try {
                await validateToken(value);
                return Promise.resolve();
              } catch (error) {
                console.error("Validation error:", error);
                return Promise.reject(
                  new Error("Please enter a valid Solana token address")
                );
              }
            },
          },
        ]}
      >
        <Input placeholder="Token Mint Address" />
      </Form.Item>

      <Form.Item
        label="New IPFS Token Metadata URL"
        name="newUri"
        rules={[
          { required: true, message: "Please enter the new metadata URL" },
          { min: 20, message: "URL must be at least 20 characters long" },
          {
            validator: async (_, value) => {
              if (!value || !currentMetadata) return Promise.resolve();
              if (currentMetadata.uri?.trim() === value?.trim()) {
                return Promise.reject(
                  new Error("Token already has this metadata URI")
                );
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input placeholder="https://ipfs..." />
      </Form.Item>

      <Button
        disabled={!provider?.publicKey}
        htmlType="submit"
        block
      >
        Update Token Metadata
      </Button>
    </Form>
  );
};
