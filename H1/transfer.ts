import {
  address,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  sendAndConfirmTransactionFactory,
  createTransactionMessage,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstruction,
  signTransactionMessageWithSigners,
  lamports,
  getSignatureFromTransaction,
} from "@solana/web3.js";
import { getTransferSolInstruction } from "@solana-program/system";

import wallet from "./dev-wallet.json";

const recipient = address("DsrE3jGUeo58Qx4pppQJ2bdiqAxmdxY9DoEDWxcDS481");

(async () => {
  const sender = await createKeyPairSignerFromBytes(new Uint8Array(wallet));

  try {
    const rpc = createSolanaRpc("http://localhost:8899");
    const rpcSubscriptions = createSolanaRpcSubscriptions(
      "ws://localhost:8900",
    );

    let balance = await rpc.getBalance(sender.address).send();
    console.log(`Sender Wallet Balance: ${balance.value / BigInt(1e9)} SOL`);

    // get the latest blockhash
    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

    // transaction sender
    const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions, // will resolve when the transaction is confirmed
    });

    // create transfer transaction. transfer sol.
    const txMsg = pipe(
      createTransactionMessage({ version: 0 }), // create transaction message
      (tx) => setTransactionMessageFeePayer(sender.address, tx), // set the fee payer
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx), // set the lifetime of the transaction using the latest blockhash
      (tx) =>
        // append the transfer instruction
        appendTransactionMessageInstruction(
          // we are transferring 1 SOL
          getTransferSolInstruction({
            amount: lamports(BigInt(1e9)),
            destination: recipient,
            source: sender,
          }),
          tx,
        ),
    );

    // Sign and send transaction
    const signedTransaction = await signTransactionMessageWithSigners(txMsg);
    await sendAndConfirmTransaction(signedTransaction, {
      commitment: "confirmed",
    });

    const txSignature = getSignatureFromTransaction(signedTransaction);

    console.log(
      `Success! Check out your TX here: https://explorer.solana.com/tx/${txSignature}?cluster=custom&customUrl=127.0.0.1:8899`,
    );

    balance = await rpc.getBalance(sender.address).send();
    console.log(`Sender Wallet Balance: ${balance.value / BigInt(1e9)} SOL`);
  } catch (err) {
    console.error(`Oops, something went wrong: ${err}`);
  }
})();
