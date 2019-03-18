# Smart Contract Docker Execution

A service that orchestrates the creation of Docker containers from x86 bytecode execution.

## Considerations

A mocked release rust binary, encoded as base64, is ~6M. We will need to determine the size of the Haskell executables to see if our loading approach of expecting the base64 executable over HTTP as an argument is sensible or not.

Currently ubuntu:18.04 is the base image for the execution containers. This will need to be

## TODOs
- Add resource constraints to each container
- Write-up issue regarding Alpine compatible build target
- Port assignment (generify logic from `smart-contract-backend`)