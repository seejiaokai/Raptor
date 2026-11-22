// @vitest-environment jsdom
/* THE ONE PLANNING RECORD, ROUTED — its stored half (the reshape plan, docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md
   §3.2 A-ii "The Inputs calendar", §6.2 B1 "The writer"; state/plan-foreign.ts, state/sched-commit.ts's `plan` case).
   A note of a squadron NOT loaded is the same record, `plan/u149@pp:<id>`, written through that squadron's stored
   calendar: loaded before it joins, so an edit is a change with the note as stored for its before-image; rolled back
   whole when the command is refused; the page's kept copy of that calendar brought up to date on the commit. The schedule
   store routes such a record to it only when it is joined. The world: test-support/msq-world.ts (142 loaded). */
import { afterEach, describe, expect, it } from 'vitest'
import { useMsqWorld, signInAs } from '../test-support/msq-world'
import { switchUnit, forgetUnitPlans } from './store'
import { PLANPUCKS, addPlanPuck, setDayRemark } from './plan'
import { storedPlan, storedCalendar, keptPlan, setPlanStoreDoor } from './plan-foreign'
import { schedStore, SCHED_TYPES, resyncBeforeEnlist } from './sched-commit'
import { persistWb } from './persist'
import { commit, onCommit, CmdRefused } from '../command'
import type { CommitEnvelope } from '../command/types'
import { UNIT, BOOT_UNIT } from '../engine/unitview'

useMsqWorld()
afterEach(() => { if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT); forgetUnitPlans(); PLANPUCKS.length = 0; setPlanStoreDoor(() => persistWb()) })

/* Saber (the master admin) puts a note and a day title on 149's calendar, then goes back to 142: 149's calendar is kept */
function a149Note(): string {
  signInAs('saber')
  switchUnit('u149')
  expect(addPlanPuck('2026-07-20', 'Range day', ['osp9', 'mer9'])).toBe(true)
  expect(setDayRemark('2026-07-21', 'Ops day')).toBe(true)
  const id = PLANPUCKS.find((p: any) => p.text === 'Range day')!.id
  switchUnit('u142')
  expect(UNIT).toBe('u142')
  return id
}
const run = (apply: (txn: any) => void) => {
  const got: CommitEnvelope[] = []
  const off = onCommit(e => { got.push(e) })
  const r = commit({ type: SCHED_TYPES.inputsWrite, scope: { module: 'inputs' }, meta: null, apply })
  off()
  return { r, env: got[got.length - 1] }
}

describe('a 149 note edited with 142 loaded — one record, its before-image the note as stored', () => {
  it('an edit is a change (never "created"), and switching to 149 shows it', () => {
    const id = a149Note()
    const s = storedPlan('u149')
    const { r, env } = run(txn => {
      s.join(txn, [`pp:${id}`])
      const n: any = s.get(`pp:${id}`)
      expect(n.text).toBe('Range day')
      s.put(`pp:${id}`, { ...n, text: 'Range day moved' })
    })
    expect((r as any).ok).toBe(true)
    const c = env.changes.find(x => x.collection === 'plan')!
    expect(c).toMatchObject({ op: 'put', id: `u149@pp:${id}` })
    expect((c.before as any).text, 'its before-image is the stored note').toBe('Range day')
    expect((c.after as any).text).toBe('Range day moved')
    expect(PLANPUCKS.some((p: any) => p.text === 'Range day moved'), "142's calendar never holds it").toBe(false)
    switchUnit('u149')
    expect(PLANPUCKS.find((p: any) => p.id === id)!.text, "149's calendar shows the change").toBe('Range day moved')
  })
  it('a day title too, and a delete', () => {
    const id = a149Note()
    const s = storedPlan('u149')
    const { env } = run(txn => { s.join(txn, ['dm:2026-07-21', `pp:${id}`]); s.put('dm:2026-07-21', 'Ops day 2'); s.drop(`pp:${id}`) })
    expect(env.changes.filter(c => c.collection === 'plan').map(c => [c.op, c.id]).sort()).toEqual([['delete', `u149@pp:${id}`], ['put', 'u149@dm:2026-07-21']])
    expect(keptPlan('u149')!.titles['2026-07-21']).toBe('Ops day 2')
    expect(keptPlan('u149')!.pucks.some((p: any) => p.id === id)).toBe(false)
  })
  it('a refused command leaves the stored calendar and the kept copy untouched', () => {
    const id = a149Note()
    const s = storedPlan('u149')
    const before = JSON.stringify(storedCalendar('u149'))
    const { r } = run(txn => { s.join(txn, [`pp:${id}`]); s.put(`pp:${id}`, { ...(s.get(`pp:${id}`) as any), text: 'Changed' }); throw new CmdRefused('no') })
    expect((r as any).ok).toBe(false)
    expect(JSON.stringify(storedCalendar('u149'))).toBe(before)
    expect(s.records().get(`plan/u149@pp:${id}`)!.value).toMatchObject({ text: 'Range day' })
  })
})

describe('loaded before it joins — never written blind', () => {
  it('a write of an id it did not load is refused, whole', () => {
    const id = a149Note()
    const s = storedPlan('u149')
    const before = JSON.stringify(storedCalendar('u149'))
    const { r } = run(txn => { s.join(txn, ['dm:2026-07-21']); s.put(`pp:${id}`, { id, date: '2026-07-20', text: 'Blind' }) })
    expect((r as any).ok).toBe(false)
    expect(JSON.stringify(storedCalendar('u149'))).toBe(before)
  })
  it('once joined, nothing more is loaded into it for that command', () => {
    a149Note()
    const s = storedPlan('u149')
    const { r } = run(txn => { s.join(txn, ['dm:2026-07-21']); s.load() })
    expect((r as any).ok).toBe(false)
  })
  it('the squadron loaded is the schedule store\'s — its stored half refuses it', () => {
    signInAs('saber')
    expect(() => storedPlan('u142').load()).toThrow(/is loaded/)
  })
  it('a whole load holds every note: a second join in the same command finds them', () => {
    const id = a149Note()
    const s = storedPlan('u149')
    const { r } = run(txn => { s.join(txn); s.join(txn, [`pp:${id}`]); s.drop(`pp:${id}`) })
    expect((r as any).ok).toBe(true)
  })
})

describe("the schedule store's `plan` case routes another squadron's record", () => {
  it('to its stored half when it is joined', () => {
    const id = a149Note()
    const s = storedPlan('u149')
    const stored: any = storedCalendar('u149').pucks.find((p: any) => p.id === id)
    const { r, env } = run(txn => {
      resyncBeforeEnlist(); txn.enlist(schedStore)
      s.join(txn, [`pp:${id}`])
      schedStore.write!([{ collection: 'plan', id: `u149@pp:${id}`, op: 'put', value: { ...stored, text: 'Routed' } } as any])
    })
    expect((r as any).ok).toBe(true)
    expect(env.changes.find(c => c.collection === 'plan')).toMatchObject({ op: 'put', id: `u149@pp:${id}` })
    expect(keptPlan('u149')!.pucks.find((p: any) => p.id === id).text).toBe('Routed')
    expect(PLANPUCKS.some((p: any) => p.text === 'Routed'), "never onto 142's calendar").toBe(false)
  })
  it('refused, as before, when it is not', () => {
    const id = a149Note()
    const before = JSON.stringify(storedCalendar('u149'))
    const { r } = run(txn => {
      resyncBeforeEnlist(); txn.enlist(schedStore)
      schedStore.write!([{ collection: 'plan', id: `u149@pp:${id}`, op: 'put', value: { id, date: '2026-07-20', text: 'X' } } as any])
    })
    expect((r as any).ok).toBe(false)
    expect(JSON.stringify(storedCalendar('u149'))).toBe(before)
  })
})

describe('a calendar never kept this session is read from its stored rows', () => {
  it('rows on the whiteboard, its own unit only, in their places', () => {
    const rows: Record<string, string> = {
      'u149@pp:a': JSON.stringify({ id: 'a', date: '2026-07-20', text: 'Second', ord: 2000 }),
      'u149@pp:b': JSON.stringify({ id: 'b', date: '2026-07-20', text: 'First', ord: 1000 }),
      'u149@dm:2026-07-22': JSON.stringify('Title'),
      'u142@pp:c': JSON.stringify({ id: 'c', date: '2026-07-20', text: '142s' }),
    }
    setPlanStoreDoor(() => ({ keys: (c: string) => (c === 'plan' ? Object.keys(rows) : []), get: (_c: string, k: string) => rows[k] ?? null }) as any)
    const cal = storedCalendar('u149')
    expect(cal.pucks.map((p: any) => p.text)).toEqual(['First', 'Second'])
    expect(cal.titles).toEqual({ '2026-07-22': 'Title' })
  })
})
