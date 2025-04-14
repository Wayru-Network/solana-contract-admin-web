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
  
    // Si estamos verificando, mostrar spinner
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
  
    // Si tenemos una dirección pero no hay token (o no hemos verificado aún)
    if (mintKeypairAddress && (!mintKeyStatus || !mintKeyStatus.exists || !mintKeyStatus.isToken)) {
      return (
        <Typography.Text style={{
          fontSize: "12px",
          color: appTheme.palette.wayru.secondary,
          marginTop: "4px",
          display: "block",
        }}>
          Mint address: {formatWalletAddress(mintKeypairAddress, 13)}
        </Typography.Text>
      );
    }
  
    // Si tiene un token asociado
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
  
    // Otros estados
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
  