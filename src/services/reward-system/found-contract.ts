import { RewardSystem } from "../../interfaces/reward-system/reward_system";
import { Program } from "@coral-xyz/anchor/dist/cjs/program";

import { Provider } from "../../interfaces/phantom/phantom";

import { BN } from "@coral-xyz/anchor";
import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    getAccount
} from "@solana/spl-token";
import {
    PublicKey,
    TransactionInstruction,
    SystemProgram,
    Connection,
    clusterApiUrl,
} from "@solana/web3.js";
import { CONSTANTS } from "../../constants";
import { getTxStatus } from "../solana";

interface FundTokenStorageProps {
    program: Program<RewardSystem>;
    userPublicKey: PublicKey;
    mint: PublicKey;
    amount: BN;
    provider: Provider;
    network?: keyof  CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"]
}

export const fundContractToken = async ({
    program,
    userPublicKey,
    mint,
    amount,
    provider,
    network
}: FundTokenStorageProps) => {
    try {
        const networkConnection = network === "mainnet" ? "mainnet-beta" : 'devnet';
        const connection = new Connection(clusterApiUrl(networkConnection), "confirmed");

        // Get token storage PDA
        const [tokenStorageAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from("token_storage")],
            program.programId
        );

        // Get user's ATA
        const userATA = await getAssociatedTokenAddress(
            mint,
            userPublicKey,
            false,
            TOKEN_PROGRAM_ID
        );

        // Get storage account
        const storageAccount = await getAssociatedTokenAddress(
            mint,
            tokenStorageAuthority,
            true,
            TOKEN_PROGRAM_ID
        );

        // Check if the storage account exists
        const storageAccountInfo = await program.provider.connection.getAccountInfo(storageAccount);

        // Prepare pre instructions if needed
        const preInstructions: TransactionInstruction[] = [];

        // If the storage account does not exist, create the instruction to create it
        console.log("storageAccountInfo", storageAccountInfo);
        if (!storageAccountInfo) {
            preInstructions.push(
                createAssociatedTokenAccountInstruction(
                    userPublicKey,           // payer
                    storageAccount,          // ata
                    tokenStorageAuthority,   // owner
                    mint,                    // mint
                    TOKEN_PROGRAM_ID
                )
            );
        }

        // Check userATA
        try {
            await getAccount(
                program.provider.connection,
                userATA,
                'confirmed',
                TOKEN_PROGRAM_ID
            );
        } catch (error) {
            console.log('error', error);
            preInstructions.push(
                createAssociatedTokenAccountInstruction(
                    userPublicKey,
                    userATA,
                    userPublicKey,
                    mint,
                    TOKEN_PROGRAM_ID
                )
            );
        }

        const accounts = {
            user: userPublicKey,
            tokenMint: mint,
            tokenStorageAuthority,
            tokenStorageAccount: storageAccount,
            userTokenAccount: userATA,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        } as const;

        // Create the transaction without sending it
        const transaction = await program.methods
            .fundTokenStorage(amount)
            .accounts(accounts)
            .preInstructions(preInstructions)
            .transaction();


        // last block
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.feePayer = userPublicKey;

        const { signature } = await provider.signAndSendTransaction(transaction);
        
        // Wait for finalized confirmation
        console.log("Waiting for transaction finalization...");

        const txStatus = await getTxStatus(signature, network as keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"]);
        
        return txStatus;
    } catch (error) {
        console.error("\nError preparing fund token storage transaction:", error);
        throw error;
    }
};
