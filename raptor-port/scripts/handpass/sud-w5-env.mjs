// sud-w5 — walker w5's settings, loaded before the shared asp-w2 helpers read them (walk-scripts §6: ||= only).
// D2338 walk, 23 Nov 26, chat 147. Brief: docs/superpowers/briefs/2026-11-23-d2338-walk-brief.md
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
process.env.W2_URL ||= 'http://localhost:4395/'
process.env.W2_OUT ||= path.join(HERE, '../../docs/img/handpass/2026-11-23-sans-unfiled/w5', process.env.RUN || 'run1')
/* sfd-w1-lib (its crew-panel steps) makes its own folder at import: point it at ours, never another walk's */
process.env.W1_OUT ||= process.env.W2_OUT
