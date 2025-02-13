/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, ReactNode } from 'react';
import { getProvider } from '../services/phantom/connection';
import { Provider } from '../interfaces/phantom/phantom';
import { PublicKey } from '@solana/web3.js';

interface PhantomContextType {
  provider: Provider;
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export const PhantomContext = createContext<PhantomContextType | undefined>(undefined);

export function PhantomProvider({ children }: { children: ReactNode }) {
  const [provider] = useState(getProvider());
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    if (provider) {

      // if provider dose not have a publicKey, connect to the wallet
      if (!provider.publicKey) {
        provider.connect()
      }

      // Listen for connect events
      provider.on("connect", (publicKey: PublicKey) => {
        setPublicKey(publicKey.toString());
      });

      provider.on("disconnect", () => {
        setPublicKey(null);
      });

      provider.on("accountChanged", (publicKey: PublicKey | null) => {
        if (publicKey) {
          setPublicKey(publicKey.toString());
        } else {
          setPublicKey(null);
        }
      });

      // Cleanup function
      return () => {
        provider.removeAllListeners("connect");
        provider.removeAllListeners("disconnect");
        provider.removeAllListeners("accountChanged");
      };
    }
  }, [provider]);

  const connect = async () => {
    try {
      const resp = await provider.connect();
      setPublicKey(resp.publicKey.toString());
    } catch (error) {
      console.error("Error connecting:", error);
    }
  };

  const disconnect = async () => {
    try {
      await provider.disconnect();
      setPublicKey(null);
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  };

  return (
    <PhantomContext.Provider value={{ provider, publicKey, connect, disconnect }}>
      {children}
    </PhantomContext.Provider>
  );
}