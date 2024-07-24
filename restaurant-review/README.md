<!-- markdownlint-disable -->

# Restaurant Review App

## Getting Started

### Review Program

- `lib.rs`: Serves as the primary entry point, initializing the Solana program and directing command execution.
- `instructions.rs`: Defines the set of instructions our Solana program understands, including the logic for adding and updating review entries.
- `state.rs`: Manages the program's internal state, outlining the structure of review accounts and defining custom error messages for better error handling.

### Build and Deploy

To build the Rust program:

```sh
cargo build-bpf
```

To deploy the program and get the program ID:

```sh
solana program deploy ./target/deploy/review_program.so
```

Example output:

```sh
Program Id: FbNLi3af47D2mmrsnYrBcZvdqGmh7Y82SougLkqoLUy4
```

🔗 For a detailed deployment guide: [Deploying Solana Programs](https://docs.solanalabs.com/cli/examples/deploy-a-program#how-to-deploy-a-program)

### Review Frontend

Explore the frontend setup [here](review-frontend/README.md)

### License

This project is licensed under [the MIT License](LICENSE).
