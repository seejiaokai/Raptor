/* THE GUARD RAIL'S STEP KR-1a — EACH ROW'S CLOSER, CALLED ALONE (chat A211, 28 Nov 26; the brief
   docs/superpowers/briefs/2026-11-28-msq-s1-kr1a-brief.md, the plan docs/superpowers/plans/2026-11-27-msq-s1-kr-no-blocks-plan.md
   §3, §11's KR-1 line: "each closer alone shuts its row, writes nothing it does not write today"). Read by
   ui/msq-guard-closers.test.tsx. A plain .ts file on purpose, as test-support/msq-guard-testkit.ts is: it exports helpers,
   never a component (the code check reads a .tsx file as a component file).

   No door calls a closer in KR-1a, so each test calls the row's own `close` from ui/guard.ts GUARD_ROWS — the very function a
   door's closing step will call (KR-2) — and reads what it left: the row shut, and every store the app writes, the
   scheduler's, each squadron's Leave War world and the Tracker's whiteboard, as it was (or changed only as the row's own way
   out changes it today, which the test names). */
import { expect } from 'vitest'
import { act } from '@testing-library/react'
import { mem, worlds } from './msq-world'
import { TRK_WB, row, settle } from './msq-guard-testkit'

/** every stored value the app writes, by a name that says where it lives */
export function everyStore(): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(mem)) out[`store ${k}`] = String(v)
  for (const [u, b] of Object.entries(worlds)) for (const k of b.keys()) out[`war ${u} ${k}`] = String(b.read(k) ?? '')
  for (const k of TRK_WB.keys('tracker' as any)) out[`tracker ${k}`] = String(TRK_WB.get('tracker' as any, k))
  return out
}
/** what changed in the stores since `before`: each key added, changed or removed, by name; [] when nothing */
export function storeChanges(before: Record<string, string>): string[] {
  const now = everyStore()
  const out: string[] = []
  for (const k of Object.keys(now)) if (!(k in before)) out.push(`added: ${k}`); else if (now[k] !== before[k]) out.push(`changed: ${k}`)
  for (const k of Object.keys(before)) if (!(k in now)) out.push(`removed: ${k}`)
  return out
}

/** the row's own close, called once (as a door's closing step will call it), the page settled after; what it changed in
 *  the stores is handed back */
export async function closeAlone(id: string): Promise<string[]> {
  const r = row(id)
  expect(typeof r.close, `the premise: ${id} carries its close`).toBe('function')
  const before = everyStore()
  await act(async () => { r.close!() })
  await settle()
  return storeChanges(before)
}
/** the row is open (the premise) */
export function isOpen(id: string) { expect(row(id).open(), `the premise: ${id} is open`).toBe(true) }
/** the row is shut */
export function isShut(id: string) { expect(row(id).open(), `${id} is shut`).toBe(false) }
