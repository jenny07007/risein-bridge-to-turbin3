import {
  address,
  createSolanaRpc,
  createKeyPairSignerFromBytes,
  createSolanaRpcSubscriptions,
  pipe,
  createTransactionMessage,
  appendTransactionMessageInstructions,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  getSignatureFromTransaction,
  signTransactionMessageWithSigners,
  sendAndConfirmTransactionFactory,
  getBase64EncodedWireTransaction,
} from "@solana/web3.js";
import wallet from "./dev-wallet.json";
import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenInstruction,
  getMintToCheckedInstruction,
  TOKEN_2022_PROGRAM_ADDRESS,
} from "@solana-program/token-2022";

const mint_address = address("BJvFRYeAKdu66Lck5zpLft3jr8ZoWX3T4MccW5JLiDGd");

(async () => {
  const keypair = await createKeyPairSignerFromBytes(new Uint8Array(wallet));
  const rpc = createSolanaRpc("http://localhost:8899");
  const rpcSubscriptions = createSolanaRpcSubscriptions("ws://localhost:8900");

  try {
    const [ata] = await findAssociatedTokenPda({
      mint: mint_address,
      owner: keypair.address,
      tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
    });
    console.log("Associated Token Account: ", ata);

    const instructions = [
      getCreateAssociatedTokenInstruction({
        mint: mint_address,
        ata,
        owner: keypair.address,
        payer: keypair,
        tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
      }),
      getMintToCheckedInstruction({
        mint: mint_address,
        mintAuthority: keypair, // Mint authority
        amount: 100 * 10 ** 6, // Mint 100 tokens with 6 decimals
        decimals: 6,
        token: ata,
      }),
    ];

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
    const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions,
    });

    const txMsg = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => appendTransactionMessageInstructions(instructions, tx),
      (tx) => setTransactionMessageFeePayerSigner(keypair, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    );

    const signedTx = await signTransactionMessageWithSigners(txMsg);

    // Debugging simulation
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
