// sa208-wB — walker B's settings for the SANS answers walk (his D2753–D2759), chat 208, 27 Nov 26. Loaded BEFORE every
// shared helper reads them (walk-scripts §6: ||= in the helpers, so these win). Brief:
// docs/superpowers/briefs/2026-11-27-sans-answers-walk-brief.md. Frozen build D:/raptor-work/c208-build
// (index-CjChD3bM.js) served by sa208-wB-serve.mjs on port 4962.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
process.env.W2_URL ||= 'http://localhost:4962/'
process.env.W2_OUT ||= path.join(HERE, '../../docs/img/handpass/2026-11-27-sans-answers/B', process.env.SA208B_RUN || 'run1')
process.env.W1_URL ||= process.env.W2_URL
process.env.W1_OUT ||= process.env.W2_OUT
