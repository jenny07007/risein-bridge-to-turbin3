import {
  address,
  createSolanaRpc,
  createKeyPairSignerFromBytes,
  createSolanaRpcSubscriptions,
  pipe,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  getSignatureFromTransaction,
  signTransactionMessageWithSigners,
  sendAndConfirmTransactionFactory,
  Rpc,
  SolanaRpcApi,
  Address,
  TransactionSigner,
  appendTransactionMessageInstruction,
} from "@solana/web3.js";
import wallet from "./dev-wallet.json";
import {
  findAssociatedTokenPda,
  TOKEN_2022_PROGRAM_ADDRESS,
  getCreateAssociatedTokenInstructionAsync,
  getTransferInstruction,
} from "@solana-program/token-2022";

const mint_address = address("BJvFRYeAKdu66Lck5zpLft3jr8ZoWX3T4MccW5JLiDGd");

const to_address = address("DsrE3jGUeo58Qx4pppQJ2bdiqAxmdxY9DoEDWxcDS481");

(async () => {
  const keypair = await createKeyPairSignerFromBytes(new Uint8Array(wallet));
  const rpc = createSolanaRpc("http://localhost:8899");
  const rpcSubscriptions = createSolanaRpcSubscriptions("ws://localhost:8900");

  try {
    let from_ata = await getOrCreateAssociatedTokenAccount(rpc, {
      mint: mint_address,
      owner: keypair.address,
      payer: keypair,
    });

    let to_ata = await getOrCreateAssociatedTokenAccount(rpc, {
      mint: mint_address,
      owner: to_address,
      payer: keypair,
    });

    console.log("From ATA: ", from_ata);
    console.log("To ATA: ", to_ata);

    const transfer = getTransferInstruction(
      {
        source: from_ata,
        destination: to_ata,
        authority: keypair.address,
        amount: 10e6,
      },
      {
        programAddress: TOKEN_2022_PROGRAM_ADDRESS,
      },
    );

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
    const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions,
    });

    const txMsg = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => appendTransactionMessageInstruction(transfer, tx),
      (tx) => setTransactionMessageFeePayerSigner(keypair, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    );

    const signedTx = await signTransactionMessageWithSigners(txMsg);

    const simulation = await rpc
      .simulateTransaction(getBase64EncodedWireTransaction(signedTx), {
        encoding: "base64",
      })
      .send();
    if (simulation.value.err) {
      console.error("Simulation Error Logs: ", simulation.value.logs);
      console.error("Simulation Error: ", simulation.value.err);
      return;
    }

    await sendAndConfirmTransaction(signedTx, {
      commitment: "confirmed",
    });

    const txSignature = getSignatureFromTransaction(signedTx);

    console.log("Transaction Signature: ", txSignature);
  } catch (err) {
    console.error(`Oops, something went wrong: ${err}`);
  }
})();

// Helper function to get or create an associated token account
export async function getOrCreateAssociatedTokenAccount(
  rpc: Rpc<SolanaRpcApi>,
  {
    mint,
    owner,
    payer,
  }: {
    mint: Address<string>;
    owner: Address<string>;
    payer: TransactionSigner<string>;
  },
): Promise<Address<string>> {
  const [ata] = await findAssociatedTokenPda({
    mint,
    owner,
    tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
  });

  console.log("Derived ATA:", ata.toString());

  // Check if the ATA exists
  try {
    const ataAccountInfo = await rpc
      .getAccountInfo(ata, { encoding: "base64" }) // SUPER IMPORTANT!
      .send();

    if (ataAccountInfo.value) {
      console.log("ATA already exists:", ata.toString());
      return ata;
    }

    console.log("Creating new ATA:", ata.toString());

    // Create the ATA
    const createAtaInstruction = await getCreateAssociatedTokenInstructionAsync(
      {
        mint,
        ata,
        owner,
        payer,
        tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
      },
    );

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
    const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions: createSolanaRpcSubscriptions("ws://localhost:8900"),
    });

    // Build the transaction
    const txMsg = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => appendTransactionMessageInstruction(createAtaInstruction, tx),
      (tx) => setTransactionMessageFeePayerSigner(payer, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    );

    // Sign the transaction
    const signedTx = await signTransactionMessageWithSigners(txMsg);

    const simulation = await rpc
      .simulateTransaction(getBase64EncodedWireTransaction(signedTx), {
        encoding: "base64",
      })
      .send();
    if (simulation.value.err) {
      console.error("Simulation Error Logs: ", simulation.value.logs);
      console.error("Simulation Error: ", simulation.value.err);
    }
    // Send the transaction
    await sendAndConfirmTransaction(signedTx, { commitment: "confirmed" });

    const txSignature = getSignatureFromTransaction(signedTx);
    console.log("Transaction Signature:", txSignature);
    console.log("ATA created successfully:", ata.toString());
  } catch (err) {
    console.error("Error fetching ATA info:", err);
  }
  return ata;
}
