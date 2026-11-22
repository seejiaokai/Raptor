// walker w6 (D2338 walk, 23 Nov 26, chat 147): sets the shared helpers' server and picture folder BEFORE they load
// (docs/walk-scripts.md §6 — a static import is hoisted, so every w6 script imports this module first).
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
process.env.W2_URL ||= 'http://localhost:4396/'
process.env.W2_OUT ||= path.resolve(HERE, '../../docs/img/handpass/2026-11-23-sans-unfiled/w6', process.env.W6_RUN || 'run1')
