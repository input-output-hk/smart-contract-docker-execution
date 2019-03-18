# Smart Contract Docker Execution

A service that orchestrates the creation of Docker containers from x86 bytecode execution.

## Development

### Testing
A running Docker daemon is required for the tests to run

## Considerations

A mocked release rust binary, encoded as base64, is ~6M. We will need to determine the size of the Haskell executables to see if our loading approach of expecting the base64 executable over HTTP as an argument is sensible or not.

Currently ubuntu:18.04 is the base image for the execution containers. This will need to be