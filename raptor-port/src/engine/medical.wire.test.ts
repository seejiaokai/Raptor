/* BREAK TESTS — the Medical tab's lists (engine/medical.ts), a wire the one-rule job's break tests found NO test on
   (docs/superpowers/briefs/2026-10-12-one-rule-break-tests-brief.md, group 1, wire 16; the checking guide §8.4): each
   case here was RED with its wire broken on purpose and is green with the build as it stands.

   WHOSE CARD IS IT? Since the one-rule build an input is ONE record with the list of its people — a medical input
   holds exactly one person, on that list, and carries no `person` field (owner D756; the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.1). The Medical tab's three lists name the man through
   `leadOf(r)`. With `medDownAsOf` or `pendingUpchits` reading the old `r.person` instead, every test of the suite
   stayed green: each of them PLANTS its medical records in the old shape (`person: 'bane'`), where the two reads agree.
   A downchit a person files today would have been listed under nobody.

   So these file the record through its REAL door (ui/inputedit.tsx commitNewInput), the idiom of ui/medwrite.test.ts,
   and ask the lists the Medical tab draws (ui/MedicalView.tsx). */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS, dateOrd, holds, idsOf } from './inputs'
import { HOOKS } from './hooks'
import { medDownAsOf, pendingUpchits, upchitsWithin } from './medical'
import { initStore, setSession } from '../state/store'
import { commitNewInput } from '../ui/inputedit'
import { docAdd } from '../state/docs'

/* a fresh stored document per draft — a medical input does not go in bare */
const freshDoc = () => docAdd(new Blob(['x'], { type: 'image/png' }) as any).id

const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast

beforeAll(() => { initStore(); setSession({ user: 'a', role: 'admin' }) })
beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  initStore()
  HOOKS.toast = () => {}
  return () => { HOOKS.toast = toast }
})

/* bane has no medical row of his own in the seed (ui/medwrite.test.ts files for him for the same reason) */
const newDraft = (over: any) => ({ person: 'bane', type: 'ATT C', allday: true, half: '', start: '2026-07-10', end: '2026-07-13', sTime: '', eTime: '', remarks: '', sans: null, docId: freshDoc(), ...over })
const filed = (type: string) => { const l = INPUTS.filter((r: any) => holds(r, 'bane') && r.type === type) as any[]; expect(l, `one ${type} of his`).toHaveLength(1); return l[0] }
const ord = (d: string) => dateOrd(d, 2026) as number

describe('wire 16 — the Medical tab names the man off the record’s own list of people (D756; the roll-call’s row 22)', () => {
  it('a downchit filed through the input’s own door is a record with its ONE person on its list — and "medically down" names him', () => {
    expect(commitNewInput(newDraft({ start: '2026-07-10', end: '2026-07-13' }))).toBe(true)
    const rec = filed('ATT C')
    expect(rec.person, 'the new shape: no `person` field — he is on the record’s list').toBeUndefined()
    expect(idsOf(rec)).toEqual(['bane'])
    const his = medDownAsOf(ord('Jul 12')).filter((e: any) => e.row === rec)
    expect(his, 'listed once, as of a day it covers').toHaveLength(1)
    expect(his[0].person, 'under HIS name').toBe('bane')
  })
  it('once it has expired unanswered, "pending upchit" names him too', () => {
    expect(commitNewInput(newDraft({ type: 'OML', start: '2026-07-01', end: '2026-07-05' }))).toBe(true)
    const rec = filed('OML')
    expect(idsOf(rec)).toEqual(['bane'])
    const his = pendingUpchits(ord('Jul 12')).filter((e: any) => e.row === rec)
    expect(his, 'owed, as of a week after it ended').toHaveLength(1)
    expect(his[0].person, 'under HIS name').toBe('bane')
  })
  it('and the upchit that answers it is listed under his name, and ends the nag', () => {
    expect(commitNewInput(newDraft({ type: 'OML', start: '2026-07-01', end: '2026-07-05' }))).toBe(true)
    expect(commitNewInput(newDraft({ type: 'Upchit', start: '2026-07-06', end: '' }))).toBe(true)
    const up = filed('Upchit')
    expect(idsOf(up)).toEqual(['bane'])
    const his = upchitsWithin(ord('Jul 12')).filter((e: any) => e.row === up)
    expect(his).toHaveLength(1)
    expect(his[0].person).toBe('bane')
    expect(pendingUpchits(ord('Jul 12')).filter((e: any) => e.person === 'bane' || holds(e.row, 'bane')), 'nothing owed any more').toEqual([])
  })
})
