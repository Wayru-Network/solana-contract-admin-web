
export interface CONSTANTS {
    NETWORK: {
        EXPLORER_ACCOUNT_URL: {
            devnet: string;
            mainnet: string;
        };
    };
}


export const CONSTANTS: CONSTANTS = {
    NETWORK: {
        EXPLORER_ACCOUNT_URL: {
            devnet: "https://solscan.io/account/replaceme?cluster=devnet",
            mainnet: "https://solscan.io/account/replaceme",
        },
    },
    
}
