// @vitest-environment jsdom
/* AN UNDO OR REDO NEVER REMOVES A MAN WHO IS STILL NAMED IN AN INPUT (state/roster-restore.ts — its third check, a belt:
   under owner D350, 28 Sep 26, no step the one Undo takes removes a person, so this guards a future lifting of it and
   fails closed).

   WHY THIS FILE EXISTS ([ALL-AVAIL-AS-MEMBER] step 1, 12 Oct 26 — the break test of docs/bug-check-order.md §8.4): "is he
   still named in an input" was moved onto the per-person view of the inputs (engine/inputs.ts inputLines), and with the
   view blanked on purpose NO test went red for it — it had none. It is asked of who is IN an input (owner D756: one
   record holding the list of its people), so a man filed with others still holds the restore back; an input for ALL
   AVAIL names nobody (D753) and holds nobody back. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { initStore, resetSession, notify } from './store'
import { accountsLoad, signIn, sessionFor } from './accounts'
import { rosterRestoreProblem } from './roster-restore'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const seed = JSON.stringify(INPUTS)
const REFUSAL = 'Newman is on the schedule, an input or the Leave War — take him off first.'
/* a restore that would take the man away again — the undo of the step that added him */
const removal = [{ collection: 'people', id: 'newman', op: 'delete', before: { cs: 'Newman' } }]
const row = (over: any) => ({ iid: 'rr' + Math.random().toString(36).slice(2, 8), type: 'Meeting', date: 'Jul 14', yr: 2026, allday: false, s: 600, e: 660, remarks: '', mod: '2026-06-01', ...over })

beforeEach(() => {
  if (!PEOPLE0) PEOPLE0 = JSON.stringify(PEOPLE)
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v }, keys: () => Object.keys(mem) }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0)
  /* a man on the roster who is on no day, no saved week, no note and no war: only an input can name him */
  ;(PEOPLE as any).newman = { cs: 'Newman', ini: 'NM', seat: 'FCP', cat: 'C', quals: {} }
  indexCallsigns()
  initStore(); accountsLoad()
  resetSession(sessionFor(signIn('ad', 'a'))); notify()
})
afterEach(() => {
  resetSession(null); storeBackend.impl = null
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, JSON.parse(PEOPLE0)); indexCallsigns()
})

describe('a restore that would remove a man is refused while an input still names him (D350’s belt)', () => {
  it('named nowhere, he may go', () => {
    expect(rosterRestoreProblem(removal, 'undo')).toBeNull()
  })
  it('an input of his own holds the restore back, with the sentence the app says', () => {
    INPUTS.push(row({ person: 'newman' }))
    expect(rosterRestoreProblem(removal, 'undo')).toBe(REFUSAL)
  })
  it('so does an input he is in with others (D756 — who is IN it, not whose record it is)', () => {
    INPUTS.push({ ...row({}), people: [{ p: 'bane' }, { p: 'newman' }] })
    expect(rosterRestoreProblem(removal, 'undo')).toBe(REFUSAL)
  })
  it('another man’s input, and one filed for ALL AVAIL (D753 — it names nobody), hold nobody back', () => {
    INPUTS.push(row({ person: 'bane' }), row({ person: 'allavail', type: 'Duty' }))
    expect(rosterRestoreProblem(removal, 'undo')).toBeNull()
  })
})
