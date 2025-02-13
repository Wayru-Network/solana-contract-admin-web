/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, ReactNode, useEffect } from "react";
import { CONSTANTS } from "../constants";
import { getTokenDetails } from "../services/solana";
import { TokenDetails } from "../interfaces/solana";
import { getContractDetails } from "../services/reward-system/program";
import { usePhantom } from "../hooks/usePhantom";
import { PublicKey } from "@solana/web3.js";
import { ContractDetails } from "src/interfaces/reward-system/program";

export type Settings = {
  contractId: string;
  tokenId: string;
  network: keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"];
  isSettingsCompleted: boolean;
  tokenDetails?: TokenDetails;
  contractDetails?: ContractDetails;
} | null;

interface SettingsContextType {
  settings: Settings;
  setSettings: (settings: Settings) => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(null);
  const { provider } = usePhantom();


  // use effect to get the programId from the local storage
  useEffect(() => {
    (async () => {
      const programId = localStorage.getItem("programId");
      const tokenId = localStorage.getItem("tokenId");
      if (programId && tokenId) {
        const tokenDetails = await getTokenDetails(tokenId, "devnet");
        const adminAccountState = await getContractDetails({ programId, publicKey: provider.publicKey as PublicKey });
        setSettings({
          contractId: programId,
          tokenId: tokenId,
          network: "devnet",
          isSettingsCompleted: true,
          tokenDetails: tokenDetails,
          contractDetails: adminAccountState,
        });
      } else {
        setSettings({
          isSettingsCompleted: false,
          contractId: "",
          tokenId: "",
          network: "devnet",
        });
      }
    })();
  }, [setSettings, provider.publicKey]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
