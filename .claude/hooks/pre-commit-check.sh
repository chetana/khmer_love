#!/bin/bash
# Pre-commit TypeScript check for khmer_love
# Blocks git commit if TypeScript errors are found

INPUT=$(cat)

# Extract command using node (always available in this project)
CMD=$(echo "$INPUT" | node -e "let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{ try{ console.log(JSON.parse(d)?.tool_input?.command||'') }catch(e){} })" 2>/dev/null)

# Only run on git commit commands
if ! echo "$CMD" | grep -qE '^git commit'; then
  exit 0
fi

cd /c/Users/cheta/repositories/khmer_love

OUTPUT=$(npm run lint 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  MSG=$(echo "$OUTPUT" | node -e "let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>console.log(JSON.stringify({continue:false,stopReason:'TypeScript errors — corrige avant de committer :\n'+d})))")
  echo "$MSG"
  exit 1
fi

exit 0
