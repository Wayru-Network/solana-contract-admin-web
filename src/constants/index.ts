import { PublicKey } from "@solana/web3.js";

export interface CONSTANTS {
    NETWORK: {
        EXPLORER_ACCOUNT_URL: {
            devnet: string;
            mainnet: string;
        };
    };
    BPF_UPGRADE_LOADER_ID: PublicKey;
}


export const CONSTANTS: CONSTANTS = {
    NETWORK: {
        EXPLORER_ACCOUNT_URL: {
            devnet: "https://solscan.io/account/replaceme?cluster=devnet",
            mainnet: "https://solscan.io/account/replaceme",
        },
    },
    BPF_UPGRADE_LOADER_ID: new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111"),
}
