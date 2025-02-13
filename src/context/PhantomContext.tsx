/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, ReactNode } from 'react';
import { getProvider } from '../services/phantom/connection';
import { Provider } from '@interfaces/phantom/phantom';
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
      // Listen for connect events
      provider.on("connect", (publicKey: PublicKey) => {
        console.log('connect publicKey',publicKey);
        setPublicKey(publicKey.toString());
      });

      // Listen for disconnect events
      provider.on("disconnect", () => {
        console.log('disconnect');
        setPublicKey(null);
      });
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