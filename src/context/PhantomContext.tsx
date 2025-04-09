/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getProvider } from '../services/phantom/connection';
import { Provider } from '../interfaces/phantom/phantom';
import { PublicKey } from '@solana/web3.js';

interface PhantomContextType {
  provider: Provider | null;
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export const PhantomContext = createContext<PhantomContextType | undefined>(undefined);

export function PhantomProvider({ children }: { children: ReactNode }) {
  const [provider] = useState(getProvider());
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const connect = useCallback(async () => {
    try {
      if (!provider) {
        window.open('https://phantom.app/', '_blank');
        return;
      }
      const resp = await provider?.connect();
      setPublicKey(resp?.publicKey.toString());
      localStorage.setItem("publicKey", resp?.publicKey.toString());
    } catch (error) {
      window.open('https://phantom.app/', '_blank');
      console.error("Error connecting:", error);
    }
  }, [provider]);


  useEffect(() => {
    if (provider) {
      const publicKey = localStorage.getItem("publicKey");
      if (publicKey) {
        connect();
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
          localStorage.setItem("publicKey", publicKey.toString());
        } else {
          setPublicKey(null);
          localStorage.removeItem("publicKey");
        }
      });

      // Cleanup function
      return () => {
        provider.removeAllListeners("connect");
        provider.removeAllListeners("disconnect");
        provider.removeAllListeners("accountChanged");
      };
    }
  }, [provider, connect]);


  const disconnect = useCallback(async () => {
    try {
      await provider?.disconnect();
      setPublicKey(null);
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  }, [provider]);

  return (
    <PhantomContext.Provider value={{ provider, publicKey, connect, disconnect }}>
      {children}
    </PhantomContext.Provider>
  );
}