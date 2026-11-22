// sfd-r1 — sets the re-walk's own port and picture folder BEFORE sfd-w1-lib.mjs loads (docs/walk-scripts.md §6).
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const HERE = path.dirname(fileURLToPath(import.meta.url))
process.env.W1_URL ||= 'http://localhost:4323/'
process.env.W1_OUT ||= path.join(HERE, '../../docs/img/handpass/2026-11-22-sans-from-date/r1', process.env.RUN || 'run1')
