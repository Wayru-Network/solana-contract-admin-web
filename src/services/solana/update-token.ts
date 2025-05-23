import { PublicKey, Transaction } from "@solana/web3.js";
import { CONSTANTS } from "../../constants";
import { createUpdateMetadataAccountV2Instruction, PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { UpdateTokenURIProps } from "../../interfaces/solana/tokens";
import { getTokenMetadata, getTxStatus } from ".";
import { getSolanaConnection } from "./solana.connection";


export const updateTokenURI = async ({ 
    network, 
    provider, 
    mint, 
    newUri 
}: UpdateTokenURIProps) => {
    try {
        // Setup connection
        const connection = getSolanaConnection(network);

        const {isToken, metadata} = await getTokenMetadata(mint, network);
        if (!isToken || !metadata) {
            throw new Error("Mint key status is not a token");
        }

        console.log('Current metadata:', metadata);
        console.log('New URI:', newUri);

        // Derive metadata account PDA
        const [metadataAddress] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                mint.toBuffer(),
            ],
            TOKEN_METADATA_PROGRAM_ID
        );
        
        console.log('Metadata Address:', metadataAddress.toString());
        console.log('Update Authority:', provider.publicKey.toString());

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

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = provider.publicKey;
        transaction.lastValidBlockHeight = lastValidBlockHeight;

        // Sign and send transaction
        try {
            console.log('Sending transaction...');
            const { signature } = await provider.signAndSendTransaction(transaction);
            console.log('Transaction signature:', signature);
            
            // Esperar a que la transacción se confirme
            const confirmation = await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            });
            
            console.log('Transaction confirmation:', confirmation);
            
            const txStatus = await getTxStatus(signature, network as keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"]);
            return { txStatus };
        } catch (error) {
            console.error("Error in signature:", error);
            if (error instanceof Error) {
                console.error("Error details:", {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                });
            }
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
