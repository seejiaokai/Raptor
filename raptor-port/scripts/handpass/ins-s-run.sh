#!/bin/bash
# walker S runner: bash ins-s-run.sh <script-name-without-.mjs>   (HP_PHONE=1 in the environment for the phone width)
cd /c/Users/User/projects/Raptor/raptor-port || exit 1
export HP_URL="${HP_URL:-http://localhost:4212}"
export HP_SHOTS=C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-01-insights/s
export HP_OUT=C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/ins-s.json
node "scripts/handpass/$1.mjs"
