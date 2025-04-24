import { Form, Input } from "antd";
import { getWalletFromUnit8Array, MintKeyStatus } from "../../../../services/solana";
import { KeypairStatus } from "./KeypairStatus";

interface KeypairFieldProps {
    handleKeypairChange: (value: string) => void;
    mintKeyStatus: MintKeyStatus;
    mintKeypairAddress: string;
    isCheckingMintKeyStatus: boolean;
}
export const KeypairField = ({ handleKeypairChange, mintKeyStatus, mintKeypairAddress, isCheckingMintKeyStatus }: KeypairFieldProps) => {
    return (
      <Form.Item
        label="Custom Mint Keypair"
        name="customMintKeypair"
        tooltip="Enter a wallet keypair as an array of numbers to use as the mint keypair"
        rules={[
          {
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              try {
                // Validate JSON array
                const parsedArray = JSON.parse(value);
                if (
                  Array.isArray(parsedArray) &&
                  parsedArray.length === 64 &&
                  parsedArray.every((num) => typeof num === "number")
                ) {
                  // Validate keypair
                  try {
                    getWalletFromUnit8Array(parsedArray);
                    return Promise.resolve();
                  } catch (walletError) {
                    console.error("Error parsing keypair:", walletError);
                    return Promise.reject(new Error("Invalid keypair values"));
                  }
                }
                return Promise.reject(new Error("Keypair must be a valid array of 64 numbers"));
              } catch (error) {
                console.error("Error parsing keypair:", error);
                return Promise.reject(new Error("Please enter a valid JSON array"));
              }
            },
          },
        ]}
      >
        <div>
          <Input.TextArea
            placeholder="[1,2,3,...] (Optional)"
            autoSize={{ minRows: 3, maxRows: 3 }}
            onChange={(e) => handleKeypairChange(e.target.value)}
          />
          <KeypairStatus
            mintKeypairAddress={mintKeypairAddress}
            mintKeyStatus={mintKeyStatus}
            isCheckingMintKeyStatus={isCheckingMintKeyStatus}
          />
        </div>
      </Form.Item>
    );
  };