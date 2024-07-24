<!-- markdownlint-disable-->

# Homework-1

## Airdrop

Request an airdrop for a wallet for development purposes.

[🚀 See transaction here](https://explorer.solana.com/tx/5gLdE81DmcjsZwzQ8CJxsgqrcaNd2WvVsyE9ft5kuurmLX6jRZdhToygPpD7zqTn5ae8YcRpSdYwFHkYjvhToKGA?cluster=devnet)

## Transfer

Transfer some SOL from one wallet to another.

🚀 [See transaction here](https://explorer.solana.com/tx/4GQy9i7ZNJ9snACkMvyLYG1bhg4L7kQ7Av9HUMxtgvY9PUg5QPDkNo6q97AdP5Cw4T3T2GB6H3RPEwFkWDjVC6U3?cluster=devnet)

## Empty Wallet

Empty the SOL in a wallet (balance - fees).

[🚀 See transaction here](https://explorer.solana.com/tx/4f7WJyQBtfFo1WZPk6donr2KSJZ2JknYv7sqsFhDAf7mvveXCtD7cm2thMRdcVSxqUCrgLFT48HX2MpKNGNH4ULH?cluster=devnet)

# Homework-2

## SPL Token Program

### Transfer Tokens

Transfer tokens using the SPL Token Program.

[Transfer tokens](H2-spl-token-program/spl_transfer.ts)

### Restaurant Review App

Explore the Restaurant Review Program & Frontend.

[Restaurant Review Program & Frontend](restaurant-review/README.md)

# Final Project

## Enroll on WBA Program

The project covers creating a Program Derived Address (PDA) and interacting with the WBA program using the IDL (Interface Definition Language).

[🚀 See transaction here](https://explorer.solana.com/tx/41bc586YMi1Aw29UW5C6a8bk6KUnPBU8veqzJmQn5mrAatrBt7VRRY6DaiP5qHvvqciTSLVXRStb5NWg8FhgR3j5?cluster=devnet)

### Program Files

- **`programs/wba_prereq.ts`**: Defines the TypeScript type and object for the WBA IDL.
- **`enroll.ts`**: Contains the main logic for interacting with the WBA program on Solana Devnet.

Explore the [WBA Program](https://explorer.solana.com/address/WBA52hW35HZU5R2swG57oehbN2fTr7nNhNDgfjnqUoZ/anchor-program?cluster=devnet) on devnet.

### How to Run

#### Prerequisites

- Node.js and Yarn installed
- A Solana wallet keypair (stored in `./dev-wallet.json`)

#### Setups

1. Install Dependencies:

```bash
npm install
```

2. Change Github handle

```js
const GITHUB_HANDLE = "";
```

3. Run the script

```bash
npm run enroll
```
