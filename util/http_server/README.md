# Rust HTTP Server

This Rust project compiles to a mocked HTTP server that should provide the same HTTP interface as a Plutus contract.

At the moment, this interface is unknown, so the current interface is a best guess.

## Development

The x86 binary should be parsed to base64 (whenever the HTTP interface changes). This will allow the integrations tests to test the expected interface.

1. rustup target add x86_64-unknown-linux-gnu 
1. Compile binary: `cargo build --release --target x86_64-unknown-linux-gnu`
2. Generate the base64 output: `base64 target/release/http_server > http_server_base64.txt`