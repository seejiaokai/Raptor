// walker w8 (the FULL check of claude/allavail-sans-postout-141 — filing ahead, the fade, the reminder line; 23 Nov 26,
// chat 152): sets the shared helpers' server and picture folder BEFORE they load (docs/walk-scripts.md §6). The bulk of
// the pictures go to D:\raptor-work\c152-walk\w8\<run>; the deciding ones are copied into the repo folder afterwards.
process.env.W2_URL ||= 'http://localhost:4398/'
process.env.W2_OUT ||= 'D:/raptor-work/c152-walk/w8/' + (process.env.W8_RUN || 'run1')
