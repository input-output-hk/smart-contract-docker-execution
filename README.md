# Smart Contract Docker Execution

A service that orchestrates the creation of Docker containers from x86 smart contract bytecode, and the proxying of HTTP requests to these containers.

## Usage

This service exposes an API that provides access to the following behaviour:

### loadContainer
Create a Docker container running a smart contract executable. The executable must be a base64-encoded x86 binary that exposes the Plutus smart contract HTTP interface.

### unloadContainer
Kill a running Docker container, by contract address.

### execute
Call a specified smart contract container with method and arguments. If the container does not exist, an error is thrown that prompts the caller to first load the container.

## Development

### Testing
A running Docker daemon is required for the tests to run