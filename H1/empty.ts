import {
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  generateKeyPairSigner,
  sendAndConfirmTransactionFactory,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstruction,
  compileTransactionMessage,
  lamports,
  getCompiledTransactionMessageEncoder,
  TransactionMessageBytesBase64,
  signTransactionMessageWithSigners,
  getSignatureFromTransaction,
} from "@solana/web3.js";

import wallet from "./dev-wallet.json";
import { getTransferSolInstruction } from "@solana-program/system";

(async () => {
  const sender = await createKeyPairSignerFromBytes(new Uint8Array(wallet));
  const recipient = await generateKeyPairSigner();
  const rpc = createSolanaRpc("http://localhost:8899");
  const rpcSubscriptions = createSolanaRpcSubscriptions("ws://localhost:8900");
  try {
    console.log(
      "We're going empty our wallet and send all the sol to this wallet: ",
      recipient.address,
    );

    // Get balance and fetch the recent blockhash
    const balance = await rpc.getBalance(sender.address).send();

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
    const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions, // will resolve when the transaction is confirmed
    });

    const txMsg = pipe(
      createTransactionMessage({ version: 0 }), // create transaction message
      (tx) => setTransactionMessageFeePayer(sender.address, tx), // set the fee payer
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx), // set the lifetime of the transaction using the latest blockhash
      (tx) =>
        // append the transfer instruction
        appendTransactionMessageInstruction(
          getTransferSolInstruction({
            amount: lamports(BigInt(balance.value)),
            destination: recipient.address,
            source: sender,
          }),
          tx,
        ),
    );

    // get the base64 encoded message
    const base64EncodedMessage = pipe(
      txMsg,
      compileTransactionMessage,
      (compiledMsg) =>
        getCompiledTransactionMessageEncoder().encode(compiledMsg),
      (encodedMsg) => Buffer.from(encodedMsg).toString("base64"),
    );

    const transactionMessageBytesBase64: TransactionMessageBytesBase64 =
      base64EncodedMessage as TransactionMessageBytesBase64;

    const { value: fee } = await rpc
      .getFeeForMessage(transactionMessageBytesBase64)
      .send();

    console.log("Fee: ", fee);

    // Sign and send transaction
    const signedTransaction = await signTransactionMessageWithSigners(
      pipe(
        createTransactionMessage({ version: 0 }),
        (tx) => setTransactionMessageFeePayer(sender.address, tx),
        (tx) =>
          setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
        (tx) =>
          // append the transfer instruction
          appendTransactionMessageInstruction(
            // we are transferring all SOL minus the fee from the sender to the recipient
            getTransferSolInstruction({
              amount: lamports(BigInt(balance.value) - BigInt(fee || 0)),
              destination: recipient.address,
              source: sender,
            }),
            tx,
          ),
      ),
    );

    await sendAndConfirmTransaction(signedTransaction, {
      commitment: "confirmed",
    });

    const txSignature = getSignatureFromTransaction(signedTransaction);

    console.log(
      `Success! Check out your TX here: https://explorer.solana.com/tx/${txSignature}?cluster=custom&customUrl=127.0.0.1:8899`,
    );
  } catch (err) {
    console.error(`Oops, something went wrong: ${err}`);
  }
})();
