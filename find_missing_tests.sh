#!/bin/sh

find src -name "*.tsx" -not -path "*/node_modules/*" -not -name "*.test.tsx" | while read file; do
  base_name=$(basename "$file" .tsx)
  dir_name=$(dirname "$file")
  if [ ! -f "${dir_name}/${base_name}.test.tsx" ] && [ ! -f "${dir_name}/_tests_/${base_name}.test.tsx" ]; then
    echo "Missing test for: $file"
  fi
done
