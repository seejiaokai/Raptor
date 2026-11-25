#!/bin/bash
# sns-w1A-batch — runs walker A's scenarios one after another: each arg is SCENARIO:SIZE[:RUNNAME]. Logs to D:.
cd "C:/Users/User/projects/Raptor/raptor-port" || exit 1
for x in "$@"; do
  IFS=: read -r s z r <<< "$x"
  r=${r:-$s-$z}
  SNSA_RUN=$r ONLY=$s SZ=$z node scripts/handpass/sns-w1A.mjs > "D:/raptor-work/c179-walk/A/$r.log" 2>&1
  echo "== $x exit $?"
  grep "^DONE\|^FAIL\|^NOT WALKED" "D:/raptor-work/c179-walk/A/$r.log" | cut -c1-500
done
echo BATCH-END
