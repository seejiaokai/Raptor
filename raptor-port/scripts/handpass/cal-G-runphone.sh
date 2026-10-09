#!/bin/sh
cd C:/Users/User/projects/Raptor/raptor-port
S="C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/8bd22da8-eddf-41f4-a0b3-4f89d1b5d57c/scratchpad"
for n in x04 x05 x06 x06b x07 x08 x09; do
  G_PHONE=1 G_SCRATCH="$S" timeout 420 node scripts/handpass/cal-G-$n.mjs > "$S/${n}ph.txt" 2>&1
  echo "$n exit $?" >> "$S/phone-progress.txt"
done
echo done >> "$S/phone-progress.txt"
