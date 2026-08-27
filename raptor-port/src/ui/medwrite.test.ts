/* The medical write path (owner, 27 Aug 26): the refusals every editor
   shares, and the trims a commit applies in the same undo step. Runs the
   REAL commitNewInput/commitInputEdit over the real store, the
   boardaddinput/sync harness idiom. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS, dateOrd } from '../engine/inputs'
import { HIST, initStore, setSession, writeInputsBatch } from '../state/store'
import { HOOKS } from '../engine/hooks'
import { commitNewInput, commitInputEdit, draftOf, medOverlapRefusal, upchitRefusal, applyMedPlan } from './inputedit'
import { upchitTrimPlan } from '../engine/medical'
import { docAdd } from '../state/docs'

/* a fresh stored document per draft — a medical input does not go in bare */
const freshDoc = () => docAdd(new Blob(['x'], { type: 'image/png' }) as any).id

const ISNAP = JSON.stringify(INPUTS)
let TOASTS: string[] = []

beforeAll(() => { initStore(); setSession({ user: 'a', role: 'admin' }) })
beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  initStore()
  TOASTS = []
  HOOKS.toast = (m: any) => { TOASTS.push(String(m)) }
})

const plant = (r: any) => { writeInputsBatch(() => { INPUTS.unshift({ allday: true, remarks: '', mod: 'now', yr: 2026, ...r }) }); return INPUTS[0] }
const newDraft = (over: any) => ({ person: 'bane', type: 'ATT C', allday: true, half: '', start: '2026-07-10', end: '2026-07-13', sTime: '', eTime: '', remarks: '', sans: null, docId: freshDoc(), ...over })
const mine = () => INPUTS.filter((r: any) => r.person === 'bane' && r.type !== 'Upchit' && /ATT|OML|HL/.test(r.type))

describe('the refusals', () => {
  it('same-type overlap is refused with the edit-instead message', () => {
    plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 13' })
    expect(medOverlapRefusal('bane', 'ATT C', 'Jul 12', 'Jul 15', null)).toContain('edit that entry')
    expect(commitNewInput(newDraft({ start: '2026-07-12', end: '2026-07-15' }))).toBe(false)
    expect(TOASTS.join(' ')).toContain('already filed over these days')
  })
  it('a different type is NOT refused (it trims instead)', () => {
    plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 13' })
    expect(medOverlapRefusal('bane', 'ATT B', 'Jul 12', 'Jul 15', null)).toBe('')
  })
  it('an upchit must be a single date, and must have something to close', () => {
    expect(upchitRefusal('bane', 'Jul 12', 'Jul 15', null)).toContain('single date')
    expect(upchitRefusal('bane', 'Jul 12', undefined, null)).toContain('no medical-down entry')
    plant({ person: 'bane', type: 'OML', date: 'Jul 10', endDate: 'Jul 13' })
    expect(upchitRefusal('bane', 'Jul 12', undefined, null)).toBe('')
  })
  it('a second upchit on the same day is refused', () => {
    plant({ person: 'bane', type: 'OML', date: 'Jul 10', endDate: 'Jul 13' })
    plant({ person: 'bane', type: 'Upchit', date: 'Jul 12' })
    expect(upchitRefusal('bane', 'Jul 12', undefined, null)).toContain('already filed for that day')
  })
})

describe('an upchit trims what it closes — the owner\'s worked example', () => {
  it('ATT C 10–13 + upchit 12 → the C reads 10–12, 13 Jul is gone', () => {
    const med = plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 13', remarks: 'Medically down till 13 Jul' })
    expect(commitNewInput(newDraft({ type: 'Upchit', start: '2026-07-12', end: '' }))).toBe(true)
    expect(med.endDate).toBe('Jul 12')
    expect(med.remarks, 'the till-token follows the new end').toContain('till 12 Jul')
    expect(med.remarks).toContain('Medically down')
  })
  it('an upchit on the start day cuts the span to that one day', () => {
    const med = plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 13' })
    expect(commitNewInput(newDraft({ type: 'Upchit', start: '2026-07-10', end: '' }))).toBe(true)
    expect(med.endDate, 'end == start collapses to the single-day form').toBeUndefined()
    expect(INPUTS.indexOf(med) >= 0).toBe(true)
  })
  it('the add and its trim are ONE undo step', () => {
    plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 13' })
    const depth = HIST.stack.length
    expect(commitNewInput(newDraft({ type: 'Upchit', start: '2026-07-12', end: '' }))).toBe(true)
    expect(HIST.stack.length).toBe(depth + 1)
  })
})

describe('a different-type overlap overwrites (trims) the older entry', () => {
  it('ATT B 12–15 over ATT C 10–13 → the C reads 10–11, the B stands whole', () => {
    const c = plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 13' })
    expect(commitNewInput(newDraft({ type: 'ATT B', start: '2026-07-12', end: '2026-07-15' }))).toBe(true)
    expect(c.endDate).toBe('Jul 11')
    const b = INPUTS.find((r: any) => r.person === 'bane' && r.type === 'ATT B')
    expect(b && b.date).toBe('Jul 12')
    expect(b.endDate).toBe('Jul 15')
  })
  it('full containment removes the old entry outright', () => {
    const c = plant({ person: 'bane', type: 'OML', date: 'Jul 12', endDate: 'Jul 13' })
    expect(commitNewInput(newDraft({ type: 'ATT B', start: '2026-07-10', end: '2026-07-15' }))).toBe(true)
    expect(INPUTS.indexOf(c)).toBe(-1)
  })
  it('an EDIT that moves a span runs the same knife, excluding itself', () => {
    const c = plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 13' })
    const b = plant({ person: 'bane', type: 'ATT B', date: 'Jul 20', endDate: 'Jul 22' })
    const d = draftOf(b); d.start = '2026-07-12'; d.end = '2026-07-15'
    expect(commitInputEdit(b, d)).toBe(true)
    expect(c.endDate).toBe('Jul 11')
    expect(b.date).toBe('Jul 12')
  })
})

describe('the mandatory document', () => {
  it('a new medical input without a document is refused; with one it lands', () => {
    expect(commitNewInput(newDraft({ docId: null }))).toBe(false)
    expect(TOASTS.join(' ')).toContain('Attach the medical document')
    expect(commitNewInput(newDraft({}))).toBe(true)
    const r = INPUTS.find((x: any) => x.person === 'bane' && x.type === 'ATT C')
    expect(r && typeof r.docId).toBe('string')
  })
  it('editing an already-medical row that has no document still saves (pre-feature rows)', () => {
    const r = plant({ person: 'bane', type: 'OML', date: 'Jul 10', endDate: 'Jul 13' })
    const d = draftOf(r); d.remarks = 'resting'
    expect(commitInputEdit(r, d)).toBe(true)
    expect(r.remarks).toBe('resting')
  })
  it('retyping INTO the medical group demands the document', () => {
    const r = plant({ person: 'bane', type: 'Meeting', date: 'Jul 10', allday: false, s: 540, e: 600 })
    const d = draftOf(r); d.type = 'ATT C'
    expect(commitInputEdit(r, d)).toBe(false)
    expect(TOASTS.join(' ')).toContain('Attach the medical document')
    d.docId = freshDoc()
    expect(commitInputEdit(r, d)).toBe(true)
  })
  it('history snapshots carry the id, never the file', () => {
    expect(commitNewInput(newDraft({}))).toBe(true)
    const snap = JSON.stringify(INPUTS)
    expect(snap).toContain('"docId":"doc')
    expect(snap.length, 'no blob payload rode into the snapshot').toBeLessThan(20000)
  })
})

describe('the plan applier fails closed', () => {
  it('an empty or malformed plan changes nothing', () => {
    const before = JSON.stringify(INPUTS)
    applyMedPlan([]); applyMedPlan(null as any)
    applyMedPlan(upchitTrimPlan('nobody', dateOrd('Jul 12') as any))
    expect(JSON.stringify(INPUTS)).toBe(before)
  })
})
