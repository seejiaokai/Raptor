// swd-w14b — walker w14b's settings, loaded BEFORE the shared helpers read them (walk-scripts §6: ||= only).
// w14b, "the change lines and the read rule through ticks and postings" (B1, B2, B3, B4, B7, B9; probe P6), chat 174,
// the night of 24–25 Nov 26. Plan: docs/superpowers/briefs/2026-11-25-sans-words-w14-plan.md. Bulk pictures to D:.
process.env.W2_URL ||= 'http://localhost:4812/'
process.env.W2_OUT ||= 'D:/raptor-work/c174-walk/w14b/' + (process.env.W14B_RUN || 'run1')
process.env.W1_URL ||= process.env.W2_URL
process.env.W1_OUT ||= process.env.W2_OUT
