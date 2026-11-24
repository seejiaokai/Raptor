// Case 8 (desktop): Hunter made a master admin in one Save, then a LATER Save picks Member.
//  c8  — the second Save: Role → Member, nothing else
//  c8b — the second Save: Role → Member AND the sign-in name changed
//  c8c — Hunter holding Plan of 149 made a master admin, then a later Save: Role → Member
// `node undo-c8.mjs` (desktop only). Pictures: checked/undo-c8*-desk-*.png
import { setupSave, runCase } from './undo-lib.mjs'

const NEW = 'hunter.m@mail'
const master = s => setupSave(s, 'prowler', { role: 'master' }, 'setup.master')
const CASES = [
  { id: 'c8', pid: 'prowler', setup: master, change: { role: 'main' }, bell: { before: ['ad2', 'a2'], after: ['ad2', 'a2'] } },
  { id: 'c8b', pid: 'prowler', setup: master, change: { role: 'main', name: NEW }, bell: { before: ['ad2', 'a2'], after: [NEW, 'a2'] } },
  { id: 'c8c', pid: 'prowler', setup: async s => { await setupSave(s, 'prowler', { line149: 'plan' }, 'setup.plan149'); await master(s) }, change: { role: 'main' }, bell: { before: ['ad2', 'a2'], after: ['ad2', 'a2'] } },
]
for (const c of CASES) await runCase(c, 'd')
