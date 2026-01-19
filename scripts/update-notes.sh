#!/bin/bash

# Script to update notes.json in data/ folder (public/data/ will auto-sync)
# Usage: ./scripts/update-notes.sh <path-to-downloaded-notes.json>

if [ -z "$1" ]; then
    echo "Usage: ./scripts/update-notes.sh <path-to-downloaded-notes.json>"
    echo "Example: ./scripts/update-notes.sh ~/Downloads/notes.json"
    exit 1
fi

SOURCE_FILE="$1"

if [ ! -f "$SOURCE_FILE" ]; then
    echo "Error: File not found: $SOURCE_FILE"
    exit 1
fi

# Copy to data folder (main source)
cp "$SOURCE_FILE" data/notes.json

# Also copy to public for immediate dev server access
cp "$SOURCE_FILE" public/data/notes.json 2>/dev/null || mkdir -p public/data && cp "$SOURCE_FILE" public/data/notes.json

echo "✅ Successfully updated notes.json"
echo "   - data/notes.json (main source, committed to git)"
echo "   - public/data/notes.json (auto-synced for dev server)"
echo ""
echo "💡 Note: public/data/notes.json is auto-synced from data/notes.json on dev server start"
echo "💡 Next step: git add data/notes.json && git commit -m 'Update notes' && git push"

