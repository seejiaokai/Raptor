// swd-w14d — walker w14d's settings, loaded BEFORE the shared helpers read them (walk-scripts §6: ||= only).
// w14d, "the calendar's doors, the merged bell, the plain-user round" (B5, B6, A3, A4, A6, A8, A9, D1–D3, E; probes P9,
// P10), chat 174, the night of 24–25 Nov 26. Plan: docs/superpowers/briefs/2026-11-25-sans-words-w14-plan.md. Bulk pictures to D:.
import { mkdirSync } from 'node:fs'
import path from 'node:path'
process.env.W2_URL ||= 'http://localhost:4814/'
process.env.W2_OUT ||= 'D:/raptor-work/c174-walk/w14d/' + (process.env.W14D_RUN || 'run1')
process.env.W1_URL ||= process.env.W2_URL
process.env.W1_OUT ||= process.env.W2_OUT
mkdirSync(path.join(process.env.W2_OUT, 'taps'), { recursive: true })
