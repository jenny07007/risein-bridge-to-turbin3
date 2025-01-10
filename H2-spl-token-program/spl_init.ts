import {
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  generateKeyPairSigner,
  sendAndConfirmTransactionFactory,
  appendTransactionMessageInstructions,
  setTransactionMessageFeePayerSigner,
  pipe,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  getSignatureFromTransaction,
} from "@solana/web3.js";
import wallet from "./dev-wallet.json";
import {
  getInitializeMintInstruction,
  getMintSize,
} from "@solana-program/token";
import { TOKEN_2022_PROGRAM_ADDRESS } from "@solana-program/token-2022";
import { getCreateAccountInstruction } from "@solana-program/system";

(async () => {
  const keypair = await createKeyPairSignerFromBytes(new Uint8Array(wallet));
  const rpc = createSolanaRpc("http://localhost:8899");
  const rpcSubscriptions = createSolanaRpcSubscriptions("ws://localhost:8900");

  console.log(keypair.address);

  try {
    const mint = await generateKeyPairSigner();
    const space = BigInt(getMintSize());
    const rent = await rpc.getMinimumBalanceForRentExemption(space).send();

    const instructions = [
      getCreateAccountInstruction({
        payer: keypair,
        newAccount: mint,
        lamports: rent,
        space,
        programAddress: TOKEN_2022_PROGRAM_ADDRESS,
      }),
      getInitializeMintInstruction(
        {
          mint: mint.address,
          decimals: 6,
          mintAuthority: keypair.address,
        },
        {
          programAddress: TOKEN_2022_PROGRAM_ADDRESS,
        },
      ),
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
    await sendAndConfirmTransaction(signedTx, {
      commitment: "confirmed",
    });

    const txSignature = getSignatureFromTransaction(signedTx);

    console.log(
      `Success! Check out your TX here: https://explorer.solana.com/tx/${txSignature}?cluster=custom&customUrl=127.0.0.1:8899`,
    );
    console.log("Mint Address: ", mint.address);
  } catch (err) {
    console.error(`Oops, something went wrong: ${err}`);
  }
})();
