// swd-w14a — walker w14a's settings, loaded BEFORE the shared helpers read them (walk-scripts §6: ||= only).
// w14a, "what counts as planned" (C1–C11; D2564, D2565, D2568, D2560), chat 174, the night of 24–25 Nov 26.
// Plan: docs/superpowers/briefs/2026-11-25-sans-words-w14-plan.md. Bulk pictures to D:.
process.env.W2_URL ||= 'http://localhost:4811/'
process.env.W2_OUT ||= 'D:/raptor-work/c174-walk/w14a/' + (process.env.W14A_RUN || 'run1')
process.env.W1_URL ||= process.env.W2_URL
process.env.W1_OUT ||= process.env.W2_OUT
