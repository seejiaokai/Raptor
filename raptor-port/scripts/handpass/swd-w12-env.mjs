// swd-w12 — walker w12's settings, loaded BEFORE the shared helpers read them (walk-scripts §6: ||= only).
// The SANS words walk, the reminder (S2, S7, S14, S15, S16, S17, S22, S23), 24 Nov 26, chat 156.
// Brief: docs/superpowers/briefs/2026-11-24-sans-words-walk-brief.md. Bulk pictures to D:.
process.env.W2_URL ||= 'http://localhost:4802/'
process.env.W2_OUT ||= 'D:/raptor-work/c156-walk/w12/' + (process.env.W12_RUN || 'run1')
process.env.W1_URL ||= process.env.W2_URL
process.env.W1_OUT ||= process.env.W2_OUT
