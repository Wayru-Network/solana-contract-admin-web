import { Connection, PublicKey, Transaction, clusterApiUrl } from "@solana/web3.js";
import { CONSTANTS } from "../../constants";
import { createUpdateMetadataAccountV2Instruction, PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { UpdateTokenURIProps } from "../../interfaces/solana/tokens";
import { getTokenMetadata, getTxStatus } from ".";


export const updateTokenURI = async ({ 
    network, 
    provider, 
    mint, 
    newUri 
}: UpdateTokenURIProps) => {
    try {
        // Setup connection
        const networkConnection = network === "mainnet" ? "mainnet-beta" : 'devnet';
        const connectionEndpoint = network === "mainnet"
            ? import.meta.env.VITE_SOLANA_MAINNET_RPC_URL || ""
            : clusterApiUrl(networkConnection);
        console.log('connectionEndpoint', connectionEndpoint);
        console.log('network', network);
        const connection = new Connection(connectionEndpoint, "confirmed");

        const {isToken, metadata} = await getTokenMetadata(mint, network);
        if (!isToken || !metadata) {
            throw new Error("Mint key status is not a token");
        }

        // Derive metadata account PDA
        const [metadataAddress] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                mint.toBuffer(),
            ],
            TOKEN_METADATA_PROGRAM_ID
        );
        

        // Create update metadata instruction
        const updateMetadataInstruction = createUpdateMetadataAccountV2Instruction(
            {
                metadata: metadataAddress,
                updateAuthority: provider.publicKey,
            },
            {
                updateMetadataAccountArgsV2: {
                    data: {
                        name: metadata?.name,
                        symbol: metadata?.symbol,
                        uri: newUri,
                        sellerFeeBasisPoints: 0,
                        creators: null,
                        collection: null,
                        uses: null,
                    },
                    updateAuthority: provider.publicKey,
                    primarySaleHappened: null,
                    isMutable: true,
                },
            }
        );

        // Create and configure transaction
        const transaction = new Transaction();
        transaction.add(updateMetadataInstruction);

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = provider.publicKey;

        // Sign and send transaction
        try {
            const { signature } = await provider.signAndSendTransaction(transaction);
            const txStatus = await getTxStatus(signature, network as keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"]);
            return { txStatus };
        } catch (error) {
            console.error("Error in signature:", error);
            return {
                txStatus: {
                    status: 'exception',
                    message: error instanceof Error ? error.message : 'An unknown error occurred'
                }
            };
        }
    } catch (error) {
        console.error("Transaction error:", error);
        return {
            txStatus: {
                status: 'exception',
                message: error instanceof Error ? error.message : 'An unknown error occurred'
            }
        };
    }
}
