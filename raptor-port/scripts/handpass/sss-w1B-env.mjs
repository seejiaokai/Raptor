// sss-w1B — walker B's settings for the standby / untimed-sim walk (his D2584 Q4/Q5, D2585, D2586, D2587), chat 182,
// 25 Nov 26. Loaded BEFORE every shared helper (walk-scripts §6: ||= only). Brief:
// docs/superpowers/briefs/2026-11-25-sans-standby-sim-walk-brief.md. Build D:/raptor-work/c182-build on port 4892.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
process.env.W2_URL ||= 'http://localhost:4892/'
process.env.W2_OUT ||= path.join(HERE, '../../docs/img/handpass/2026-11-25-sans-standby-sim/B', process.env.SSSB_RUN || 'run1')
process.env.W1_URL ||= process.env.W2_URL
process.env.W1_OUT ||= process.env.W2_OUT
