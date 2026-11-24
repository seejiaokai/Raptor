// swd-w11 — walker w11's settings, loaded BEFORE the shared helpers read them (walk-scripts §6: ||= only).
// The SANS words and rules walk (D2388, D2390, D2391, D2394, D2420, D2421), 24 Nov 26, chat 156.
// Brief: docs/superpowers/briefs/2026-11-24-sans-words-walk-brief.md. Bulk pictures to D:.
process.env.W2_URL ||= 'http://localhost:4801/'
process.env.W2_OUT ||= 'D:/raptor-work/c156-walk/w11/' + (process.env.W11_RUN || 'run1')
process.env.W1_URL ||= process.env.W2_URL
process.env.W1_OUT ||= process.env.W2_OUT
