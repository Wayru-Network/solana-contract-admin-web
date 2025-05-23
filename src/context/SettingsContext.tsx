/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useTransition,
} from "react";
import { CONSTANTS } from "../constants";
import { getTokenDetails } from "../services/solana";
import { TokenDetails } from "../interfaces/solana";
import { getContractDetails } from "../services/reward-system/program";
import { usePhantom } from "../hooks/usePhantom";
import { PublicKey } from "@solana/web3.js";
import { ContractDetails } from "../interfaces/reward-system/program";

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
  isGettingSettings: boolean;
  deleteSettings: () => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(null);
  const [isGettingSettings, startTransition] = useTransition();
  const { provider } = usePhantom();

  const getSettings = useCallback(async () => {
    const programId = localStorage.getItem("programId");
    const tokenId = localStorage.getItem("tokenId");
    const network = (localStorage.getItem("network") as keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"]) || "mainnet";
    if (programId && tokenId && network) {
      startTransition(async () => {
        const tokenDetails = await getTokenDetails(
          tokenId,
          network,
          programId
        );
        const contractDetails = await getContractDetails({
          programId,
          publicKey: provider?.publicKey as PublicKey,
          network: network,
          tokenId: tokenId,
        });
        setSettings({
          contractId: programId,
          tokenId: tokenId,
          network: network,
          isSettingsCompleted: true,
          tokenDetails: tokenDetails,
          contractDetails: contractDetails,
        });
      });
    } else {
      setSettings({
        isSettingsCompleted: false,
        contractId: "",
        tokenId: "",
        network
      });
    }
  }, [provider?.publicKey]);

  // use effect to get the programId from the local storage
  useEffect(() => {
    getSettings();
  }, [getSettings]);

  const refreshSettingsState = useCallback(async () => {
    await getSettings();
  }, [getSettings]);

  const deleteSettings = useCallback(async () => {
    localStorage.removeItem("programId");
    localStorage.removeItem("tokenId");
    setSettings({
      isSettingsCompleted: false,
      contractId: "",
      tokenId: "",
      network: settings?.network ?? "devnet",
    });
  }, [settings?.network]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSettings,
        refreshSettingsState,
        isGettingSettings,
        deleteSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
