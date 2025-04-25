import { CONSTANTS } from "../../constants";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Provider } from "../phantom/phantom";


export interface MintTokensProps {
    network: keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"];
    provider: Provider;
    name: string;
    symbol: string;
    uri: string;
    decimals: number;
    amount: string | number;
    recipientAddress?: PublicKey;
    customMintKeypair?: Keypair;
}

export interface CreateTokenWithMetadataParams {
    name: string;
    symbol: string;
    uri: string;
    decimals: number;
    connection: Connection;
    provider: Provider;
    customMintKeypair?: Keypair;
}


export interface CreateMintToInstructionParams {
    mint: PublicKey;
    destination: PublicKey;
    authority: PublicKey;
    amount: string | number;
    decimals: number;
}


export interface CreateATAInstructionsParams {
    connection: Connection;
    mint: PublicKey;
    owner: PublicKey;
    payer: PublicKey;
}

export interface UpdateTokenURIProps {
    network: keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"];
    provider: Provider; // Wallet provider (like Phantom)
    mint: PublicKey; // Mint address of the token
    newUri: string;  // New URI to update to
}