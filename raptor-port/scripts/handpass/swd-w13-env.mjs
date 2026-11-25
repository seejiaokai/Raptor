// swd-w13 — walker w13's settings, loaded BEFORE the shared helpers read them (walk-scripts §6: ||= only).
// The SANS words walk: the calendar's doors, the crew list, the plain-user round (S6, S8, S18, S19, S20, S21, S24),
// 24 Nov 26, chat 156. Brief: docs/superpowers/briefs/2026-11-24-sans-words-walk-brief.md. Bulk pictures to D:.
import { mkdirSync } from 'node:fs'
import path from 'node:path'
process.env.W2_URL ||= 'http://localhost:4803/'
process.env.W2_OUT ||= 'D:/raptor-work/c156-walk/w13/' + (process.env.W13_RUN || 'run1') + '-' + (process.env.SZ || 'd') + (process.env.ONLY ? '/only-' + process.env.ONLY.replace(/,/g, '+') : '')
process.env.W1_URL ||= process.env.W2_URL
process.env.W1_OUT ||= process.env.W2_OUT
mkdirSync(path.join(process.env.W2_OUT, 'taps'), { recursive: true })
