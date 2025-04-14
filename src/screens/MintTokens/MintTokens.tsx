import { Form, Typography } from "antd";
import { FormCard } from "../../components/FormCard/FormCard";
import { FormScreenWrapper } from "../../components/Wrappers/FormScreenWrapper";
import { useGlobalProgress } from "../../hooks/useGlobalProgress";
import { mintTokens } from "../../services/solana/mint-tokens";
import { CONSTANTS } from "../../constants";
import { useSettings } from "../../hooks/useSettings";
import { usePhantom } from "../../hooks/usePhantom";
import { theme as appTheme } from "../../styles/theme";
import { PublicKey } from "@solana/web3.js";
import { useState, useEffect, useTransition, useCallback } from "react";
import {
  getWalletFromUnit8Array,
  checkMintKeyStatus,
  MintKeyStatus,
} from "../../services/solana";
import { FormValues, MintTokensForm } from "./Components/MintTokensForm";
import { Provider } from "../../interfaces/phantom/phantom";


const MintTokens = () => {
  const [form] = Form.useForm();
  const { setProgressState } = useGlobalProgress();
  const { settings, refreshSettingsState } = useSettings();
  const { provider } = usePhantom();
  const [mintKeypairAddress, setMintKeypairAddress] = useState<string | null>(null);
  const [mintKeyStatus, setMintKeyStatus] = useState<MintKeyStatus | null>(null);
  const [isCheckingMintKeyStatus, startCheckingMintKeyStatus] = useTransition();

  // Check if the keypair is valid
  const checkKeyStatus = useCallback(async (keypairValue: string) => {
    if (!keypairValue) {
      setMintKeypairAddress(null);
      setMintKeyStatus(null);
      return;
    }

    try {
      const parsedArray = JSON.parse(keypairValue);
      if (Array.isArray(parsedArray) && parsedArray.length === 64) {
        try {
          const wallet = getWalletFromUnit8Array(parsedArray);
          setMintKeypairAddress(wallet.publicKey.toString());

          const network = settings?.network as keyof typeof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"];
          const status = await checkMintKeyStatus(parsedArray, network);
          setMintKeyStatus(status);
        } catch (error) {
          console.error("Error checking mint key status:", error);
          setMintKeypairAddress(null);
          setMintKeyStatus(null);
        }
      }
    } catch (error) {
      console.error("Error checking mint key status:", error);
      setMintKeypairAddress(null);
      setMintKeyStatus(null);
    }
  }, [settings?.network]);

  // Handle keypair change
  const handleKeypairChange = (value: string) => {
    startCheckingMintKeyStatus(async () => await checkKeyStatus(value));
  };

  // Check keypair when loading or changing the network
  useEffect(() => {
    const keypairValue = form.getFieldValue("customMintKeypair");
    if (keypairValue) {
      startCheckingMintKeyStatus(async () => await checkKeyStatus(keypairValue));
    }
  }, [checkKeyStatus, form]);

  // Handle form submission
  const handleSubmit = async (values: FormValues) => {
    if (!provider) return;
    
    setProgressState({ percent: 50 });
    let customMintKeypair;
    
    if (values.customMintKeypair) {
      try {
        customMintKeypair = getWalletFromUnit8Array(JSON.parse(values.customMintKeypair));
      } catch (error) {
        console.error("Error parsing keypair:", error);
      }
    }

    const { txStatus } = await mintTokens({
      network: settings?.network as keyof typeof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"],
      provider,
      name: values.name,
      symbol: values.symbol,
      uri: values.metadataUrl,
      decimals: values.decimals,
      amount: values.totalSupply.replace(/,/g, ""),
      recipientAddress: values.recipientAddress ? new PublicKey(values.recipientAddress) : undefined,
      customMintKeypair,
    });
    
    setProgressState({ percent: 75 });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (txStatus.status === "confirmed") {
      setProgressState({ percent: 100, status: "success" });
      refreshSettingsState();
      form.resetFields();
      setMintKeypairAddress(null);
      setMintKeyStatus(null);
    } else {
      setProgressState({ percent: 100, status: "exception" });
    }
  };

  return (
    <FormScreenWrapper>
      <FormCard
        minWidth={500}
        title="Mint Tokens"
        formBody={
          <MintTokensForm 
            form={form}
            onSubmit={handleSubmit}
            handleKeypairChange={handleKeypairChange}
            isCheckingMintKeyStatus={isCheckingMintKeyStatus}
            mintKeyStatus={mintKeyStatus as MintKeyStatus}
            mintKeypairAddress={mintKeypairAddress as string}
            provider={provider as Provider}
          />
        } 
        bottomComponent={
          !provider?.publicKey && (
            <Typography.Text
              style={{
                color: appTheme.palette.error.main,
                display: "block",
                textAlign: "center",
                marginTop: "16px",
              }}
            >
              Please connect your wallet to mint tokens
            </Typography.Text>
          )
        }
      />
    </FormScreenWrapper>
  );
};

export default MintTokens;
