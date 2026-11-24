// The cases of the Undo-words walk (chat 162, 24 Nov 26) — see undo-lib.mjs. Hunter is `prowler` (sign-in ad2 / a2), an
// admin of 142 in the demo; Ranger is `bane` (us / us), a member. Saber (ad / a) is the demo's master admin.
import { setupSave, runCase } from './undo-lib.mjs'

const NEW = 'hunter.m@mail'
const plan149 = s => setupSave(s, 'prowler', { line149: 'plan' }, 'setup.plan149')
export const CASES = {
  c1: { id: 'c1', pid: 'prowler', setup: plan149, change: { role: 'main' }, bell: { before: ['ad2', 'a2'], after: ['ad2', 'a2'] } },
  c2: { id: 'c2', pid: 'prowler', setup: plan149, change: { role: 'main', name: NEW }, bell: { before: ['ad2', 'a2'], after: [NEW, 'a2'] } },
  c3: { id: 'c3', pid: 'prowler', change: { role: 'main', name: NEW }, bell: { before: ['ad2', 'a2'], after: [NEW, 'a2'] } },
  c4: { id: 'c4', pid: 'prowler', change: { name: NEW }, bell: { before: ['ad2', 'a2'], after: [NEW, 'a2'] } },
  c5: { id: 'c5', pid: 'bane', change: { role: 'admin' }, bell: { before: ['us', 'us'], after: ['us', 'us'] } },
  c6a: { id: 'c6a', pid: 'prowler', change: { line149: 'plan', name: NEW }, bell: { before: ['ad2', 'a2'], after: [NEW, 'a2'] } },
  c6b: { id: 'c6b', pid: 'prowler', change: { role: 'master' }, bell: { before: ['ad2', 'a2'], after: ['ad2', 'a2'] } },
  c6c: { id: 'c6c', pid: 'prowler', setup: s => setupSave(s, 'prowler', { role: 'master' }, 'setup.master'), change: { role: 'admin' }, bell: { before: ['ad2', 'a2'], after: ['ad2', 'a2'] } },
  c7: { id: 'c7', pid: 'prowler', setup: s => setupSave(s, 'prowler', { role: 'main' }, 'setup.member'), change: { role: 'admin' }, bell: { before: ['ad2', 'a2'], after: ['ad2', 'a2'] } },
}
/* `node undo-cN.mjs d|p` */
export async function main(ids) {
  const sz = process.argv[2]
  if (sz !== 'd' && sz !== 'p') { console.error('usage: node <script> d|p'); process.exit(2) }
  for (const id of ids(sz)) await runCase(CASES[id], sz)
}
