#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
ZIP_PATH="$DIST_DIR/share-box-page.zip"

FILES=(
    "manifest.json"
    "content.js"
    "lib/l18n/l18n.json"
)

if ! command -v zip >/dev/null 2>&1; then
    echo "Error: zip command is required to build the extension package." >&2
    exit 1
fi

cd "$ROOT_DIR"
mkdir -p "$DIST_DIR"
rm -f "$ZIP_PATH"

for file in "${FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo "Error: required extension file is missing: $file" >&2
        exit 1
    fi
done

zip -X -q "$ZIP_PATH" "${FILES[@]}"

echo "Built $ZIP_PATH"
echo "Included files:"
printf '  %s\n' "${FILES[@]}"
