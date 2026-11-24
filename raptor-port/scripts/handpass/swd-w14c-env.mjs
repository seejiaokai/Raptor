// swd-w14c — walker w14c's settings, loaded BEFORE the shared helpers read them (walk-scripts §6: ||= only).
// w14c, "the reminder over dates and days" (B8 (a)–(e), B10, A1, A2, A5, A7, A10; probes P11, P12), chat 174,
// the night of 24–25 Nov 26. Plan: docs/superpowers/briefs/2026-11-25-sans-words-w14-plan.md. Bulk pictures to D:.
process.env.W2_URL ||= 'http://localhost:4813/'
process.env.W2_OUT ||= 'D:/raptor-work/c174-walk/w14c/' + (process.env.W14C_RUN || 'run1')
process.env.W1_URL ||= process.env.W2_URL
process.env.W1_OUT ||= process.env.W2_OUT
