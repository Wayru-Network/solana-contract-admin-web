import { Connection, PublicKey, Transaction, clusterApiUrl } from "@solana/web3.js";
import { CONSTANTS } from "../../constants";
import { createInitializeMintInstruction, getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createMintToInstruction, createSetAuthorityInstruction, AuthorityType } from "@solana/spl-token";
import { createCreateMetadataAccountV3Instruction, PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { Keypair, SystemProgram } from "@solana/web3.js";
import { getTxStatus } from ".";
import { CreateATAInstructionsParams, CreateMintToInstructionParams, CreateTokenWithMetadataParams, MintTokensProps } from "../../interfaces/solana/mint-tokens";


const createTokenWithMetadataInstructions = async ({ name, symbol, uri, decimals, connection, provider, customMintKeypair }: CreateTokenWithMetadataParams) => {
    // Create a new Keypair for the mint or use the custom one
    const mintKeypair = customMintKeypair ?? Keypair.generate();
    const instructions = [];

    // Get minimum balance for rent exemption
    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    // Create instruction for the new account
    const createAccountInstruction = SystemProgram.createAccount({
        fromPubkey: provider.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
    });

    // Initialize mint
    const initializeMintInstruction = createInitializeMintInstruction(
        mintKeypair.publicKey,
        decimals,
        provider.publicKey,
        provider.publicKey,
        TOKEN_PROGRAM_ID
    );

    instructions.push(createAccountInstruction);
    instructions.push(initializeMintInstruction);

    // Create metadata
    const [metadataAddress] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mintKeypair.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );

    const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
        {
            metadata: metadataAddress,
            mint: mintKeypair.publicKey,
            mintAuthority: provider.publicKey,
            payer: provider.publicKey,
            updateAuthority: provider.publicKey,
        },
        {
            createMetadataAccountArgsV3: {
                data: {
                    name: name,
                    symbol: symbol,
                    uri: uri,
                    sellerFeeBasisPoints: 0,
                    creators: null,
                    collection: null,
                    uses: null,
                },
                isMutable: true,
                collectionDetails: null,
            },
        }
    );

    instructions.push(createMetadataInstruction);

    return {
        instructions,
        mintKeypair
    };
}


const createMintToInstructions = ({ mint, destination, authority, amount, decimals }: CreateMintToInstructionParams) => {
    // clean the amount (remove commas)
    const cleanAmount = typeof amount === 'string' ?
        amount.replace(/,/g, '') :
        amount.toString();

    // Manual construction of the value with the decimals
    // Example: 50 with 6 decimals = 50000000 (50 followed by 6 zeros)
    const fullAmount = cleanAmount + '0'.repeat(decimals);

    console.log('Original amount:', cleanAmount);
    console.log('Decimals:', decimals);
    console.log('Full amount with decimals:', fullAmount);

    // Convert to BigInt after building the complete string
    const adjustedAmount = BigInt(fullAmount);

    const mintToInstruction = createMintToInstruction(
        mint,
        destination,
        authority,
        adjustedAmount
    );

    return { instructions: [mintToInstruction] };
}

/**
 * Mint tokens
 * @param network - The network to use
 * @param provider - The provider to use
 * @param name - The name of the token
 * @param symbol - The symbol of the token
 * @param uri - The uri of the token
 * @param decimals - The decimals of the token
 * @param amount - The amount of tokens to mint
 * @param recipientAddress - The address of the recipient
 * @param customMintKeypair - The custom mint keypair to use / make sure it's no already used
 */
export const mintTokens = async ({ network, provider, name, symbol, uri, decimals, amount, recipientAddress, customMintKeypair }: MintTokensProps) => {
    try {
        const networkConnection = network === "mainnet" ? "mainnet-beta" : 'devnet';
        const connectionEndpoint = network === "mainnet"
            ? import.meta.env.VITE_SOLANA_MAINNET_RPC_URL || ""
            : clusterApiUrl(networkConnection);
        const connection = new Connection(connectionEndpoint, "confirmed");

        // 1. Get instructions to create the token and metadata
        const { instructions: createTokenInstructions, mintKeypair } =
            await createTokenWithMetadataInstructions({
                name,
                symbol,
                uri,
                decimals,
                connection,
                provider,
                customMintKeypair
            });

        // 2. Get instructions to create associated account
        const { instructions: createdATAInstructions, associatedTokenAddress } =
            await createATAInstructions({
                connection,
                mint: mintKeypair.publicKey,
                owner: recipientAddress ?? provider.publicKey,
                payer: provider.publicKey
            });

        // 3. Get instructions to mint tokens
        const { instructions: mintToInstructions } = createMintToInstructions({
            mint: mintKeypair.publicKey,
            destination: associatedTokenAddress,
            authority: provider.publicKey,
            amount,
            decimals,
        });

        // 4. Create instruction to revoke the mint authority
        const revokeMintAuthorityInstruction = createSetAuthorityInstruction(
            mintKeypair.publicKey,
            provider.publicKey,
            AuthorityType.MintTokens,
            null,
            [],
            TOKEN_PROGRAM_ID
        );

        // 5. Create instruction to revoke the freeze authority
        const revokeFreezeAuthorityInstruction = createSetAuthorityInstruction(
            mintKeypair.publicKey,
            provider.publicKey,
            AuthorityType.FreezeAccount,
            null,
            [],
            TOKEN_PROGRAM_ID
        );

        // 6. Create a single transaction with all the instructions
        const transaction = new Transaction();

        // Add all the instructions
        createTokenInstructions.forEach(instruction => transaction.add(instruction));
        createdATAInstructions.forEach(instruction => transaction.add(instruction));
        mintToInstructions.forEach(instruction => transaction.add(instruction));
        transaction.add(revokeMintAuthorityInstruction);
        transaction.add(revokeFreezeAuthorityInstruction);

        // Configure the transaction
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = provider.publicKey;

        // Always sign with the mintKeypair
        transaction.partialSign(mintKeypair);

        // Then Phantom signs for the user
        try {
            const { signature } = await provider.signAndSendTransaction(transaction);

            const txStatus = await getTxStatus(signature, network as keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"]);
            return { txStatus };
        } catch (error) {
            console.error("Error in signature:", error);
            // More detailed error handling...
            return {
                txStatus: {
                    status: 'exception',
                    message: error instanceof Error ? error.message : 'An unknown error occurred'
                }
            };
        }
    } catch (error) {
        console.error("Transaction error:", error);
        if (error instanceof Error && 'logs' in error) {
            console.error("Transaction logs:", error.logs);
        }
        return {
            txStatus: {
                status: 'exception',
                message: error instanceof Error ? error.message : 'An unknown error occurred'
            }
        };
    }
}

const createATAInstructions = async ({ connection, mint, owner, payer }: CreateATAInstructionsParams) => {
    const associatedTokenAddress = await getAssociatedTokenAddress(
        mint,
        owner,
        false
    );

    // Check if the account already exists
    const accountInfo = await connection.getAccountInfo(associatedTokenAddress);

    const instructions = [];

    // Only create instruction if the account does not exist
    if (!accountInfo) {
        const createATAInstruction = createAssociatedTokenAccountInstruction(
            payer,
            associatedTokenAddress,
            owner,
            mint
        );
        instructions.push(createATAInstruction);
    }

    return { instructions, associatedTokenAddress };
}