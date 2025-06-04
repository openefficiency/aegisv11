#!/usr/bin/env bash
# Simple environment setup script
# Copies .env.example to .env if it doesn't exist.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env.example ]; then
  echo "Missing .env.example" >&2
  exit 1
fi

if [ -f .env ]; then
  echo ".env already exists"
else
  cp .env.example .env
  echo "Created .env from .env.example. Edit the file to add real values."
fi
