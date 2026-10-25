/* THE M3 BUILD'S FULL CHECK — THE FRESH CODE READ'S FINDINGS (parts/lw-m3-build/read-opus.md F1–F4, F6–F8; F5 is in
   ui/bidbubble.test.tsx). Each written red before its fix. */
import { act } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { INPUTS, inpId, inpDetailKey } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { ELOG, elogClear } from '../engine/editlog'
import { initStore as raptorInitStore, notify } from '../state/store'
import { setMe, setSession } from '../state/auth'
import { NOTICES } from '../state/notices'
import { commitInput, commitInputEdit, commitNewInput, draftOf } from '../ui/inputedit'
import { describeEntry } from '../undo/describe'
import { projectPeople } from './state/raptorRoster'
import { closeDates, fileStraight, getState, initStore, setCell, setPeople, setRole } from './state/store'
import { memoryBackend } from './state/storage'
import { wireLeaveWarSync } from './sync'
import { warCounts } from './absences'

const ISNAP = JSON.stringify(INPUTS)
const lines = () => ELOG.rows.map((r: any) => String(r.lbl))
const onGround = (row: any) => (DAYS as any[]).some(d => ((d && d.ground) || []).some((g: any) => g && g.src === inpId(row)))
const draft = (over: Record<string, unknown>) => ({ person: 'bane', type: 'Other', allday: true, half: '', start: '2026-07-13', end: '', sTime: '06:00', eTime: '18:00', remarks: 'r', sans: null, goes: 'g', title: null, ...over })
const byRmk = (rmk: string) => INPUTS.find((i: any) => i.remarks === rmk) as any

beforeEach(() => {
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  setSession({ user: 'ad', role: 'admin' }); setMe('stiff')
  raptorInitStore()
  initStore(memoryBackend()); setPeople(projectPeople()); wireLeaveWarSync(); setRole('admin')
  elogClear()
})

describe('F1 — the Scheduler Board\u2019s Ground "+ Inputs": the filing wins over the panel', () => {
  it('one man, an Other with Goes to Unavailable: under Unavailable, counted out — as for two men', () => {
    expect(commitNewInput(draft({ remarks: 'f1-oth', goes: 'u' }), true)).toBe(true)
    const r = byRmk('f1-oth')
    expect(r.acc).toBe('u')
    expect(onGround(r)).toBe(false)
    expect(warCounts(r)).toBe(true)
  })
  it('one man, an Attach: under Unavailable by itself (D1374)', () => {
    expect(commitNewInput(draft({ remarks: 'f1-atch', type: 'Attach', to: '145 Sqn', start: '2026-07-15' }), true)).toBe(true)
    const r = byRmk('f1-atch')
    expect(r.acc).toBe('u')
    expect(onGround(r)).toBe(false)
  })
  it('an Other with Goes to Ground Programme still lands on the programme there', () => {
    expect(commitNewInput(draft({ remarks: 'f1-g', start: '2026-07-14' }), true)).toBe(true)
    expect(byRmk('f1-g').acc).toBe('g')
  })
})

describe('F2 — a cancelled or information-only commitment under Unavailable counts nobody out', () => {
  it('as everywhere else it is silent', () => {
    expect(warCounts({ type: 'Training', acc: 'u', cx: true, cxr: 'WX', person: 'bane', date: 'Jul 15', yr: 2026, allday: true })).toBe(false)
    expect(warCounts({ type: 'Other', acc: 'u', info: true, person: 'bane', date: 'Jul 15', yr: 2026, allday: true })).toBe(false)
    expect(warCounts({ type: 'Other', acc: 'u', person: 'bane', date: 'Jul 15', yr: 2026, allday: true })).toBe(true)
  })
})

describe('F3 — an Attach\u2019s To is what the input says', () => {
  it('a To changed changes the issued key, as a title does', () => {
    const a = { people: [{ p: 'bane' }], type: 'Attach', allday: true, date: 'Jul 15', yr: 2026, remarks: 'x', to: '145 Sqn' }
    expect(inpDetailKey(a)).not.toBe(inpDetailKey({ ...a, to: '149 Sqn' }))
    const t = { people: [{ p: 'bane' }], type: 'Training', allday: true, date: 'Jul 15', yr: 2026, remarks: 'x' }
    expect(inpDetailKey(t), 'every other kind\u2019s key unchanged by the field').toBe(inpDetailKey({ ...t }))
  })
  it('the change history writes a line for it', () => {
    expect(commitNewInput(draft({ remarks: 'f3', type: 'Attach', to: '145 Sqn', start: '2026-07-15' }))).toBe(true)
    const r = byRmk('f3')
    elogClear()
    expect(commitInputEdit(r, { ...draftOf(r), to: '149 Sqn' })).toBe(true)
    expect(lines().some(l => /· to$/.test(l)), JSON.stringify(lines())).toBe(true)
  })
})

describe('F4 — an Other or an Attach filed from the war is added, never approved', () => {
  for (const code of ['OTH', 'ATCH']) {
    it(code, () => {
      const pid = getState().people[0]!.id
      act(() => { setCell(pid, '2026-02-02', 'LL'); const p = getState().period; closeDates(p.start, p.end) })
      elogClear()
      expect(fileStraight([{ personId: pid, date: '2026-02-11' }], code).done).toBe(1)
      expect(lines().some(l => / added · /.test(l)), JSON.stringify(lines())).toBe(true)
      expect(lines().some(l => /approved on the Leave War/.test(l)), JSON.stringify(lines())).toBe(false)
    })
  }
})

describe('F6 — his bell says when his Other leaves Unavailable through Goes to', () => {
  it('Ground → Unavailable says so; Unavailable → Ground says it was taken out', () => {
    expect(commitNewInput(draft({ remarks: 'f6', start: '2026-07-16' }))).toBe(true)
    const r = byRmk('f6')
    const bell = () => NOTICES.filter((n: any) => n.to === 'bane').map((n: any) => JSON.stringify(n.what))
    const n0 = bell().length
    expect(commitInput(r, { ...draftOf(r), goes: 'u' }, ['bane'])).toBe(true)
    expect(bell().slice(n0).join(' ')).toContain('"unav"')
    const n1 = bell().length
    expect(commitInput(r, { ...draftOf(r), goes: 'g' }, ['bane'])).toBe(true)
    expect(bell().slice(n1).join(' ')).toContain('"unavoff"')
  })
})

describe('F7 — Undo names an Attach filed from the war', () => {
  it('the phrase names it', () => {
    expect(describeEntry({ type: 'lw.file', forward: [] } as any)).toMatch(/Attach/)
  })
})

describe('F8 — the change history says a new input went under Unavailable', () => {
  it('a course filed on the Inputs page', () => {
    expect(commitNewInput(draft({ remarks: 'f8', type: 'CSE', goes: undefined, start: '2026-07-14' }))).toBe(true)
    expect(lines().some(l => / added · .*\(under Unavailable\)/.test(l)), JSON.stringify(lines())).toBe(true)
  })
})
