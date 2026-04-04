#!/bin/bash
cd "$(git rev-parse --show-toplevel)" || exit 0
COUNT=$(($(git rev-list --count HEAD) + 1))
VERSION_FILE="src/version.ts"
echo "export const APP_VERSION = '1.0.${COUNT}';" > "$VERSION_FILE"
git add "$VERSION_FILE"
