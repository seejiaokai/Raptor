#!/bin/bash
# WALKER F — the phone pass (390 x 844): runs each walk script on a phone, one after another, one log each.
cd "C:/Users/User/projects/Raptor/raptor-port" || exit 1
export HP_PHONE=1
for s in p603 p604 p605 p607 p608 p609 p610 p602 h07 p606 p611 p612; do
  echo "=== $s start $(date +%T)"
  if [ "$s" = "h07" ]; then f=cal-F-h07.mjs; else f=cal-F-$s.mjs; fi
  node scripts/handpass/$f > /tmp/f-ph-$s.txt 2>&1
  echo "=== $s end $(date +%T) exit $?"
done
echo ALLDONE
