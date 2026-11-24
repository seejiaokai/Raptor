# chat 165: the re-walk of what the fixes touched, on the build already made (walk4). From raptor-port/.
O=$PWD/docs/img/handpass/2026-11-24-timing-readout
export TW_OUT=$O/walk4
TW_MAIN=C:/t164m/dist-main ONLY=W1,W2,W5 node scripts/handpass/timing-walk.mjs > $O/walk4-part1.txt 2>&1; echo "exit $?" >> $O/walk4-part1.txt
ONLY=W4,W7,W8,W9,W14,W22,W24 node scripts/handpass/timing-walk-2.mjs > $O/walk4-part2.txt 2>&1; echo "exit $?" >> $O/walk4-part2.txt
ONLY=W19,W19-without,W20-desk,W20-phone,W23-admin,W26 node scripts/handpass/timing-walk-3.mjs > $O/walk4-part3c.txt 2>&1; echo "exit $?" >> $O/walk4-part3c.txt
node scripts/handpass/timing-walk-4.mjs > $O/walk4-part4c.txt 2>&1; echo "exit $?" >> $O/walk4-part4c.txt
echo REWALK-DONE
