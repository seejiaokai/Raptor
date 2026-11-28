// swl-w1B — walker B's settings for the warning list's SANS lines walk (his D2579, D2584 Q3 / 2a / 3b, D2583), chat 203,
// 26 Nov 26. Loaded BEFORE every shared helper (walk-scripts §6: ||= only). Brief:
// docs/superpowers/briefs/2026-11-26-sans-warnlines-walk-brief.md. Build D:/raptor-work/c203-build on port 4896.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
process.env.W2_URL ||= 'http://localhost:4896/'
process.env.W2_OUT ||= path.join(HERE, '../../docs/img/handpass/2026-11-26-sans-warnlines/B', process.env.SWLB_RUN || 'run1')
process.env.W1_URL ||= process.env.W2_URL
process.env.W1_OUT ||= process.env.W2_OUT
