import { LoadingOutlined } from "@ant-design/icons";
import { MintKeyStatus } from "../../../services/solana";
import { theme as appTheme } from "../../../styles/theme";
import { Typography, Spin } from "antd";
import { formatWalletAddress } from "../../../helpers/wallet";

interface KeypairStatusProps {
    mintKeypairAddress: string;
    mintKeyStatus: MintKeyStatus;
    isCheckingMintKeyStatus: boolean;
}   

export const KeypairStatus = ({ 
    mintKeypairAddress, 
    mintKeyStatus, 
    isCheckingMintKeyStatus 
  }: KeypairStatusProps) => {
    const antIcon = (
      <LoadingOutlined
        style={{ fontSize: 16, color: appTheme.palette.wayru.primary }}
        spin
      />
    );
  
    // if we are checking the mint keypair status, show the spinner
    if (isCheckingMintKeyStatus) {
      return (
        <div style={{
          marginTop: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <Spin indicator={antIcon} />
          <Typography.Text style={{ fontSize: "12px", color: appTheme.palette.wayru.onSurface }}>
            Checking token status...
          </Typography.Text>
        </div>
      );
    }
  
    // to show the mint keypair address
    if (mintKeypairAddress && (!mintKeyStatus || !mintKeyStatus.exists)) {
      return (
        <Typography.Text style={{
          fontSize: "12px",
          color: appTheme.palette.wayru.secondary,
          marginTop: "4px",
          display: "block",
        }}>
          Mint address: {mintKeypairAddress}
        </Typography.Text>
      );
    }
  
    // for valid keypairs that exist but are not tokens
    if (mintKeypairAddress && mintKeyStatus?.exists && !mintKeyStatus.isToken) {
      return (
        <Typography.Text style={{
          fontSize: "12px",
          color: appTheme.palette.wayru.error,
          marginTop: "4px",
          display: "block",
        }}>
          <div>Address: {mintKeypairAddress}</div>
          <div>{mintKeyStatus.message}</div>
        </Typography.Text>
      );
    }
  
    // if the mint keypair address has a token associated
    if (mintKeyStatus?.exists && mintKeyStatus?.isToken) {
      return (
        <Typography.Text style={{
          fontSize: "12px",
          color: appTheme.palette.wayru.error,
          marginTop: "4px",
          display: "block",
        }}>
          Token already exists at address {mintKeyStatus.tokenDetails && (
            <div style={{ marginTop: "4px" }}>
              {mintKeyStatus.tokenDetails.address && (
                <div>Address: {formatWalletAddress(mintKeyStatus.tokenDetails.address)}</div>
              )}
              <div>Supply: {mintKeyStatus.tokenDetails.supply}</div>
              <div>Decimals: {mintKeyStatus.tokenDetails.decimals}</div>
              <div>Name: {mintKeyStatus.tokenDetails.name}</div>
            </div>
          )}
        </Typography.Text>
      );
    }
  
    // other states
    if (mintKeyStatus) {
      return (
        <Typography.Text style={{
          fontSize: "12px",
          color: appTheme.palette.wayru.secondary,
          marginTop: "4px",
          display: "block",
        }}>
          {mintKeyStatus.message}
        </Typography.Text>
      );
    }
  
    return null;
  };
  