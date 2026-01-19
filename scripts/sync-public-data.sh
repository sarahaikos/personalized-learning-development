#!/bin/bash

# Script to sync data/ folder to public/data/ for dev server
# This is automatically run when you start the dev server, but you can run it manually too

mkdir -p public/data/files

# Sync notes.json
if [ -f "data/notes.json" ]; then
  cp data/notes.json public/data/notes.json
  echo "✅ Synced data/notes.json → public/data/notes.json"
fi

# Sync files directory structure (but not files themselves to avoid duplicates)
# Files in data/files/ are the source of truth
if [ -d "data/files" ]; then
  # Create symlinks or copy structure
  echo "ℹ️  Files in data/files/ are served directly"
fi

echo "✅ Sync complete! public/data/ is ready for dev server."

