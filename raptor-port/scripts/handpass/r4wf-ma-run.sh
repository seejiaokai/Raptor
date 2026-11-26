#!/usr/bin/env bash
# r4wf-ma-run — run one walker-A script on one build into its own picture folder.
#   bash scripts/handpass/r4wf-ma-run.sh <script> <scenario-folder-name> <merged|main> <phone|desk> <webkit|chromium> [ENV=VAL ...]
cd C:/Users/User/projects/Raptor-r4/raptor-port || exit 1
S=$1; N=$2; B=$3; SZ=$4; ENG=$5; shift 5
if [ "$B" = merged ]; then NEW=D:/rw4/r183/build-merged-0ff30dbdf; BUN=index-B9okpSpf.js; else NEW=D:/rw4/r183/build-main-1993bed86; BUN=index-DCU_WN_H.js; fi
OUT=docs/img/handpass/2026-11-25-r4-walk-faults/merge/r4wf-ma/$N-$B-$SZ-$ENG
mkdir -p "$OUT" .tmp/r4wf-ma/logs
env WR4_OUT=$OUT WR4_NEW=$NEW SHR_BUNDLE=$BUN SZ=$SZ ENG=$ENG "$@" node scripts/handpass/$S > .tmp/r4wf-ma/logs/$N-$B-$SZ-$ENG.log 2>&1
grep -E "^(RESULT|PAGE ERRORS|r4wf-ma|Error)" .tmp/r4wf-ma/logs/$N-$B-$SZ-$ENG.log | cut -c1-6000
