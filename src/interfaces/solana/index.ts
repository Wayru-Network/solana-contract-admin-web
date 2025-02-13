export interface TokenDetails {
    address: string;
    decimals: number;
    supply: string;
    isInitialized: boolean;
    freezeAuthority: string | undefined;
    mintAuthority: string | undefined;
}