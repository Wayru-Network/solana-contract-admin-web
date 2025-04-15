import { clusterApiUrl, Connection, Keypair, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getMint } from '@solana/spl-token';
import { CONSTANTS } from '../../constants';
import { TokenBalanceInfo, TransactionStatus } from '../../interfaces/solana';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

export const getTokenDetails = async (
    tokenAddress: string, 
    network: keyof  CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"],
    programId: string
) => {
    const networkConnection = network === "mainnet" ? "mainnet-beta" : 'devnet';
    const connection = new Connection(clusterApiUrl(networkConnection), "confirmed");

    try {
        const tokenPublicKey = new PublicKey(tokenAddress);
        const programPublicKey = new PublicKey(programId);

        // get balance of the token in the contract
        const tokenBalance = await getTokenBalance(programPublicKey, tokenPublicKey, network);
        
        // get token info using getMint
        const tokenInfo = await getMint(
            connection,
            tokenPublicKey,
            'confirmed',
            TOKEN_PROGRAM_ID
        );
        
        return {
            address: tokenAddress,
            decimals: tokenInfo.decimals,
            supply: (Number(tokenInfo.supply) / Math.pow(10, tokenInfo.decimals)).toLocaleString(),
            isInitialized: !tokenInfo.isInitialized,
            freezeAuthority: tokenInfo.freezeAuthority?.toBase58(),
            mintAuthority: tokenInfo.mintAuthority?.toBase58(),
            contractTokenBalance: Number(tokenBalance.uiAmount).toLocaleString() ?? 0
        };
    } catch (error) {
        console.error('error getting token details:', error);
        return undefined;
    }
}

export const getTxStatus = async (
    signature: string,
    network: keyof  CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"],
    maxRetries: number = 30
): Promise<TransactionStatus> => {
    const networkConnection = network === "mainnet" ? "mainnet-beta" : 'devnet';
    const connection = new Connection(clusterApiUrl(networkConnection), "confirmed");
    let status = await connection.getSignatureStatus(signature);
    let retries = maxRetries;

    while (retries > 0 && status.value?.confirmationStatus !== 'confirmed') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        status = await connection.getSignatureStatus(signature);
        
        if (status.value?.err) {
            throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
        }
        
        retries--;
        if (retries === 0) {
            throw new Error('Transaction confirmation timeout');
        }
    }

    return {
        signature,
        status: status.value?.confirmationStatus
    };
};

export const getTokenBalance = async (
    programId: PublicKey,
    mint: PublicKey,
    network: keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"]
): Promise<TokenBalanceInfo> => {
    try {
        const networkConnection = network === "mainnet" ? "mainnet-beta" : 'devnet';
        const connection = new Connection(clusterApiUrl(networkConnection), "confirmed");

        // Get token storage PDA - Ensure seeds are exactly the same
        const [tokenStorageAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from("token_storage")],
            new PublicKey(programId)
        );

        // Get storage account
        const storageAccount = await getAssociatedTokenAddress(
            mint,
            tokenStorageAuthority,
            true
        );
 
        // check if the storage account exists
        const accountInfo = await connection.getAccountInfo(storageAccount);
        
        if (!accountInfo) {
            return {
                uiAmount: 0,
                decimals: 0,
                exists: false,
                address: storageAccount.toString()
            };
        }

        const balance = await connection.getTokenAccountBalance(storageAccount);
        
        return {
            uiAmount: balance.value.uiAmount,
            decimals: balance.value.decimals,
            exists: true,
            address: storageAccount.toString()
        };
    } catch (error) {
        console.error("Error in getTokenBalance:", error);
        throw error;
    }
};

export const getWalletFromUnit8Array = (unit: number[]) => {
    return Keypair.fromSecretKey(
        Uint8Array.from(unit)
    );
}

export interface MintKeyStatus {
  exists: boolean;
  isToken: boolean;
  tokenDetails?: {
    address: string;
    decimals: number;
    supply: string;
    mintAuthority?: string;
    freezeAuthority?: string;
    hasMetadata: boolean;
    name?: string;
    symbol?: string;
    uri?: string;
  };
  message: string;
}

/**
 * Checks if a keypair already has an associated token
 * @param keypair The keypair to check
 * @param network The network to use (devnet or mainnet)
 */
export const checkMintKeyStatus = async (
  keypair: Keypair | number[],
  network: keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"]
): Promise<MintKeyStatus> => {
  try {
    const networkConnection = network === "mainnet" ? "mainnet-beta" : 'devnet';
    const connection = new Connection(clusterApiUrl(networkConnection), "confirmed");
    
    // Convert array to keypair if necessary
    const mintKeypair = Array.isArray(keypair) 
      ? Keypair.fromSecretKey(Uint8Array.from(keypair))
      : keypair;
    
    // Check if the account exists
    const accountInfo = await connection.getAccountInfo(mintKeypair.publicKey);
    
    if (!accountInfo) {
      return {
        exists: false,
        isToken: false,
        message: ""
      };
    }
    
    // Check if it's a token account
    if (accountInfo.owner.equals(TOKEN_PROGRAM_ID)) {
      try {
        // Try to get token information
        const tokenInfo = await getMint(
          connection,
          mintKeypair.publicKey,
          'confirmed',
          TOKEN_PROGRAM_ID
        );
        
        // Check if it has metadata
        const [metadataAddress] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("metadata"),
            new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
            mintKeypair.publicKey.toBuffer(),
          ],
          new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
        );
        
        const metadataInfo = await connection.getAccountInfo(metadataAddress);
        let tokenName = "";
        let tokenSymbol = "";
        let tokenUri = "";
        
        // Deserialize metadata if it exists
        if (metadataInfo) {
          try {
            // Deserialize the metadata account data
            const metadata = Metadata.deserialize(metadataInfo.data)[0];
            tokenName = metadata.data.name.replace(/\0/g, ''); // Remove null terminators
            tokenSymbol = metadata.data.symbol.replace(/\0/g, '');
            tokenUri = metadata.data.uri.replace(/\0/g, '');
          } catch (metadataError) {
            console.error("Error deserializing metadata:", metadataError);
          }
        }
        
        return {
          exists: true,
          isToken: true,
          tokenDetails: {
            address: mintKeypair.publicKey.toString(),
            decimals: tokenInfo.decimals,
            supply: (Number(tokenInfo.supply) / Math.pow(10, tokenInfo.decimals)).toLocaleString(),
            mintAuthority: tokenInfo.mintAuthority?.toBase58(),
            freezeAuthority: tokenInfo.freezeAuthority?.toBase58(),
            hasMetadata: metadataInfo !== null,
            name: tokenName || undefined,
            symbol: tokenSymbol || undefined,
            uri: tokenUri || undefined
          },
          message: metadataInfo !== null 
            ? `` 
            : "This keypair already has a token without metadata"
        };
      } catch (error) {
        console.error("Error checking mint key status:", error);
        return {
          exists: true,
          isToken: false,
          message: "This keypair has an account but it's not a valid token"
        };
      }
    }
    
    return {
      exists: true,
      isToken: false,
      message: "This keypair has an account but it's not a token"
    };
  } catch (error) {
    console.error("Error checking mint key status:", error);
    return {
      exists: false,
      isToken: false,
      message: `Error checking keypair: ${error instanceof Error ? error.message : 'An unknown error occurred'}`
    };
  }
};