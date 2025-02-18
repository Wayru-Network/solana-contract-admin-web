/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
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
  refreshSettingsState: () => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(null);
  const { provider } = usePhantom();

  const getSettings = useCallback(async () => {
    const programId = localStorage.getItem("programId");
    const tokenId = localStorage.getItem("tokenId");
    const network = localStorage.getItem("network");
    if (programId && tokenId && network) {
      const tokenDetails = await getTokenDetails(tokenId, network as keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"], programId);
      const adminAccountState = await getContractDetails({
        programId,
        publicKey: provider.publicKey as PublicKey,
        network: network as keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"],
        tokenId: tokenId,
      });
      setSettings({
        contractId: programId,
        tokenId: tokenId,
        network: network as keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"],
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
  }, [provider.publicKey]);

  // use effect to get the programId from the local storage
  useEffect(() => {
    getSettings();
  }, [getSettings]);

  const refreshSettingsState = useCallback(async () => {
    await getSettings();
  }, [getSettings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings, refreshSettingsState }}>
      {children}
    </SettingsContext.Provider>
  );
}
