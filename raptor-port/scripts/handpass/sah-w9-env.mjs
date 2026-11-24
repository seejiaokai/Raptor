// walker w9 (the FULL check of claude/allavail-sans-postout-141 — D2340/D2341/D2342/D2346; 23 Nov 26, chat 152): sets the
// shared helpers' server and picture folder BEFORE they load (docs/walk-scripts.md §6 — a static import is hoisted, so
// every w9 script imports this module first). The bulk of the pictures go to D:; the deciding ones are copied into
// docs/img/handpass/2026-11-23-sans-ahead/w9/ by name afterwards.
process.env.W2_URL ||= 'http://localhost:4399/'
process.env.W2_OUT ||= 'D:/raptor-work/c152-walk/w9/' + (process.env.W9_RUN || 'run1')
process.env.W1_URL ||= process.env.W2_URL
process.env.W1_OUT ||= process.env.W2_OUT
