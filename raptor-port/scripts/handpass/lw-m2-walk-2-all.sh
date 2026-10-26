#!/bin/sh
# runs every part of walker 2's walk in order (a full re-walk); run from raptor-port/
cd "$(dirname "$0")/../.."
node scripts/handpass/lw-m2-walk-2.mjs B
node scripts/handpass/lw-m2-walk-2-s20.mjs
node scripts/handpass/lw-m2-walk-2-c.mjs A
W2_SIZES=desk,phone node scripts/handpass/lw-m2-walk-2-c.mjs B
node scripts/handpass/lw-m2-walk-2-c2.mjs 27
W2_SIZES=desk,phone node scripts/handpass/lw-m2-walk-2-c2.mjs 28
node scripts/handpass/lw-m2-walk-2-c2.mjs 29
W2_SIZES=desk,phone node scripts/handpass/lw-m2-walk-2-c2.mjs 30
node scripts/handpass/lw-m2-walk-2-c2.mjs 21
node scripts/handpass/lw-m2-walk-2-c2.mjs 31
node scripts/handpass/lw-m2-walk-2-c2.mjs 32
echo ALLDONE
