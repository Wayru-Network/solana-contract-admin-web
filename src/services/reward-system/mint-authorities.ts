import { RewardSystem } from "../../interfaces/reward-system/reward_system";
import { Program } from "@coral-xyz/anchor";
import { Provider } from "../../interfaces/phantom/phantom";
import {
    PublicKey,
    Connection,
    clusterApiUrl,
    Transaction,
    SystemProgram,
} from "@solana/web3.js";
import { CONSTANTS } from "src/constants";
import { getTxStatus } from "../solana";

interface AddMintAuthorityProps {
    program: Program<RewardSystem>;
    newMintAuthority: PublicKey;
    provider: Provider;
    network?: keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"];
}

export const AddMintAuthority = async ({
    program,
    newMintAuthority,
    provider,
    network,
}: AddMintAuthorityProps) => {
    try {
        if (!provider || !provider.publicKey) {
            throw new Error("Provider or provider.publicKey is undefined");
        }

        // get the admin account pda
        const [adminAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );

        // verify that the admin account exists
        try {
            const adminAccount = await program.account.adminAccount.fetch(adminAccountPDA);
            console.log("Admin account exists:", {
                adminPDA: adminAccountPDA.toString(),
                currentAuthorities: adminAccount.mintAuthorities?.map(a => a.toString())
            });
        } catch (e) {
            console.error("Error fetching admin account:", e);
            throw new Error("Admin account not found or not initialized");
        }

        const accounts = {
            user: provider.publicKey,
            adminAccount: adminAccountPDA,
            systemProgram: SystemProgram.programId,
        };

        console.log("Building transaction with accounts:", accounts);

        try {
            // build the instruction
            const ix = await program.methods
                .addMintAuthority(newMintAuthority)
                .accounts(accounts)
                .instruction();

            // create and configure the transaction
            const transaction = new Transaction();
            transaction.add(ix);

            const networkConnection = network === "mainnet" ? "mainnet-beta" : 'devnet';
            const connection = new Connection(clusterApiUrl(networkConnection), "confirmed");
            
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = provider.publicKey;
 
            console.log("Attempting to sign and send transaction...");
            const { signature } = await provider.signAndSendTransaction(transaction);
            console.log("Transaction sent with signature:", signature);

            return await getTxStatus(signature, network as keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"]);
        } catch (txError) {
            console.error("Transaction error:",);
            throw txError;
        }
    } catch (error) {
        console.error("AddMintAuthority error:", error);
        throw error;
    }
};

interface RemoveMintAuthorityProps {
    program: Program<RewardSystem>;
    mintAuthorityToRemove: PublicKey;
    provider: Provider;
    network?: keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"];
}

export const removeMintAuthority = async ({
    program,
    mintAuthorityToRemove,
    provider,
    network,
}: RemoveMintAuthorityProps) => {
    try {
        if (!provider || !provider.publicKey) {
            throw new Error("Provider or provider.publicKey is undefined");
        }

        // get the admin account pda
        const [adminAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );

        // verify that the admin account exists
        try {
            const adminAccount = await program.account.adminAccount.fetch(adminAccountPDA);
            console.log("Admin account exists:", {
                adminPDA: adminAccountPDA.toString(),
                currentAuthorities: adminAccount.mintAuthorities?.map(a => a.toString())
            });
        } catch (e) {
            console.error("Error fetching admin account:", e);
            throw new Error("Admin account not found or not initialized");
        }

        const accounts = {
            user: provider.publicKey,
            adminAccount: adminAccountPDA,
            systemProgram: SystemProgram.programId,
        };

        console.log("Building transaction with accounts:", accounts);

        try {
            // build the instruction
            const ix = await program.methods
                .removeMintAuthority(mintAuthorityToRemove)
                .accounts(accounts)
                .instruction();

            // create and configure the transaction
            const transaction = new Transaction();
            transaction.add(ix);

            const networkConnection = network === "mainnet" ? "mainnet-beta" : 'devnet';
            const connection = new Connection(clusterApiUrl(networkConnection), "confirmed");
            
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = provider.publicKey;
 
            console.log("Attempting to sign and send transaction...");
            const { signature } = await provider.signAndSendTransaction(transaction);
            console.log("Transaction sent with signature:", signature);

            return await getTxStatus(signature, network as keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"]);
        } catch (txError) {
            console.error("Transaction error:",);
            throw txError;
        }
    } catch (error) {
        console.error("RemoveMintAuthority error:", error);
        throw error;
    }
};
