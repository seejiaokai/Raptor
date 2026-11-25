// sah-r1 — re-walker r1's settings, loaded BEFORE any shared helper reads them (walk-scripts §6: ||= only).
// The re-walk of three fixes (W8-1, W8-2, W10-1) on the build of commit bde8ef0a0, 23 Nov 26, chat 152.
// Brief: docs/superpowers/briefs/2026-11-23-sans-ahead-full-walk-brief.md. The bulk of the pictures go to D: (the brief);
// the deciding ones are copied into docs/img/handpass/2026-11-23-sans-ahead/r1/ by sah-r1-keep.mjs.
process.env.W2_URL ||= 'http://localhost:4401/'
process.env.W2_OUT ||= 'D:/raptor-work/c152-walk/r1/' + (process.env.R1_RUN || 'run1')
process.env.W1_URL ||= process.env.W2_URL
process.env.W1_OUT ||= process.env.W2_OUT
