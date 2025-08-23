#!/bin/bash

# Build the project using bun
bun build --compile --minify --sourcemap --target=bun-linux-x64 ./index.ts --outfile build/dpdf-linux-x64
bun build --compile --minify --sourcemap --target=bun-linux-arm64 ./index.ts --outfile build/dpdf-linux-arm64
bun build --compile --minify --sourcemap --target=bun-windows-x64 ./index.ts --outfile build/dpdf-windows-x64
bun build --compile --minify --sourcemap --target=bun-darwin-arm64 ./index.ts --outfile build/dpdf-darwin-arm64
bun build --compile --minify --sourcemap --target=bun-darwin-x64 ./index.ts --outfile build/dpdf-darwin-x64
