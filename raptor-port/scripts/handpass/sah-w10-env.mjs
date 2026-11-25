// sah-w10 — walker w10's settings, loaded BEFORE the shared helpers read them (walk-scripts §6: ||= only).
// The FULL check of claude/allavail-sans-postout-141 (D2340, D2341, D2342, D2346), 23 Nov 26, chat 152.
// Brief: docs/superpowers/briefs/2026-11-23-sans-ahead-full-walk-brief.md. The bulk of the pictures go to D: (the brief);
// the deciding ones are copied into docs/img/handpass/2026-11-23-sans-ahead/w10/ by hand at the end.
process.env.W2_URL ||= 'http://localhost:4400/'
process.env.W2_OUT ||= 'D:/raptor-work/c152-walk/w10/' + (process.env.W10_RUN || 'run1')
process.env.W1_URL ||= process.env.W2_URL
process.env.W1_OUT ||= process.env.W2_OUT
