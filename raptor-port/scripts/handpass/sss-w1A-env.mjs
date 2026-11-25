// sss-w1A — walker A's settings, loaded BEFORE the shared helpers read them (walk-scripts §6: ||= only).
// Standby lines never ask a SANS man; an untimed sim strikes him; struck at once where his filing misses; no "file it" on
// the crew list (his D2584 Q4/Q5, D2586, D2585, D2587), chat 182, 25 Nov 26.
// Brief: docs/superpowers/briefs/2026-11-25-sans-standby-sim-walk-brief.md. Frozen build D:/raptor-work/c182-build
// (index-CRvIUIHo.js), port 4891.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
process.env.W2_URL ||= 'http://localhost:4891/'
process.env.W2_OUT ||= path.join(HERE, '../../docs/img/handpass/2026-11-25-sans-standby-sim/A', process.env.SSSA_RUN || 'run1')
process.env.W1_URL ||= process.env.W2_URL
process.env.W1_OUT ||= process.env.W2_OUT
