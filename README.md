# Smart Contract Docker Execution

A Docker-based execution engine compatible with off-chain Plutus x86 bytecode. The engine uses containers for isolated execution and routes incoming requests via the contract's HTTP interface.

## API

For development, Swagger documentation is available at http://localhost:9000/docs

### loadSmartContract
Load a smart contract executable. Must be a base64-encoded x86 binary that exposes the Plutus smart contract HTTP interface.

### unloadSmartContract
Kill a running smart contract container, by contract address.

### execute
Call a loaded smart contract with method and arguments.

## Development

### Testing
A running Docker daemon is required for the tests to run