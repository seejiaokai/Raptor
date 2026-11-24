# chat 167: the re-walk of what chat 165's last fix (the window never in the app's window order) and chat 167's fix
# (OPEN 7, a small file told "unchanged") touched, with the repaired script steps, on the build already made (walk5).
# From raptor-port/, the checks lock held.
O=$PWD/docs/img/handpass/2026-11-24-timing-readout
export TW_OUT=$O/walk5
TW_MAIN=C:/t164m/dist-main ONLY=W1,W5 node scripts/handpass/timing-walk.mjs > $O/walk5-part1.txt 2>&1; echo "exit $?" >> $O/walk5-part1.txt
ONLY=W7,W14 node scripts/handpass/timing-walk-2.mjs > $O/walk5-part2.txt 2>&1; echo "exit $?" >> $O/walk5-part2.txt
node scripts/handpass/timing-walk-w24.mjs > $O/walk5-w24.txt 2>&1; echo "exit $?" >> $O/walk5-w24.txt
ONLY=W19,W20-desk,W20-phone,W26 node scripts/handpass/timing-walk-3.mjs > $O/walk5-part3.txt 2>&1; echo "exit $?" >> $O/walk5-part3.txt
node scripts/handpass/timing-walk-4.mjs > $O/walk5-part4.txt 2>&1; echo "exit $?" >> $O/walk5-part4.txt
echo REWALK-DONE
