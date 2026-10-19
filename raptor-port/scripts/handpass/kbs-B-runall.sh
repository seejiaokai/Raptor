#!/bin/bash
# runs every Walker B script for one size; usage: kbs-B-runall.sh desktop|phone
cd "$(dirname "$0")/../.." || exit 1
S=$1
for job in "kbs-B-duty.mjs" "kbs-B-lw.mjs" "kbs-B-inputs.mjs" "kbs-B-logic.mjs" "kbs-B-board.mjs" "kbs-B-break.mjs"; do
  echo "=== $job $S" 
  node scripts/handpass/$job $S 2>&1 | grep -v "picture"
done
echo "ALL DONE $S"
