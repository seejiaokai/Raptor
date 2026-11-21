// @vitest-environment jsdom
/* A-v — EVERY UNDO STEP CARRIES ITS SQUADRON (the reshape plan docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md
   §3.2 A-v and its tests, §3.4; §16–§18: Fable F2, Fable 5, Astra 3, Fable 4, Opus 5, Opus 6; §10: Opus 7's case through an
   Admin → Users door). Each squadron has a Leave War and a Tracker of its own, but their record ids name no squadron, so a
   142 war step and a 149 war step were one record to Undo: an Undo in 142 wrote 149's step into 142's war, a background
   change in 149 barred a 142 step for good, and after a move a step left in the old squadron's war blocked or wrote into the
   new one. The midnight swap itself (state/store.ts enterSquadron) is helper "session"'s and switched on in phase 3: these
   tests make the same move by hand — the schedule picked and the war loaded for the new squadron (`enter`). */
import { describe, it, expect, afterEach } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT, on, moveMan, pastMidnight, worlds } from '../test-support/msq-world'
import { switchUnit } from './store'
import { setSession, setMe, SESSION } from './auth'
import { signIn, sessionFor } from './accounts'
import { setGrant, homeOn } from './units'
import { setTrkUnitProbe, lwUnitNow } from './perms'
import { deletePerson } from './person-delete'
import { swapWarWorld, archivePerson } from '../leavewar/sync'
import {
  getState, setShowSans, setRole, setCell, recordsAt, ackReplacement, grantOil, setPostOut, clearRecordById, canBidOn,
} from '../leavewar/state/store'
import { setMemberTodayForTests } from '../leavewar/engine'
import { commitProjection, revisionOf } from '../command'
import type { EnlistableStore, RecordEntry } from '../command'
import { globalUndo, globalRedo, _timelineEntries, _undoConflict, _barrier } from '../undo/timeline'
import { commitNewInput, commitInputEdit, draftOf } from '../ui/inputedit'
import { INPUTS } from '../engine/inputs'

useMsqWorld()
afterEach(() => { setTrkUnitProbe(null); setMemberTodayForTests('2000-01-01') })

/* the schedule picked and the war loaded for `unit`, the war's role set as a sign-in sets it (state/store.ts resetSession) —
   what helper "session"'s enterSquadron does at a pick or at midnight */
function enter(unit: string, role: 'admin' | 'member' = 'admin'): void {
  switchUnit(unit); swapWarWorld(unit); setRole(role)
  expect(lwUnitNow(), `${unit}'s war is the one loaded`).toBe(unit)
}
const lastEntry = () => { const es = _timelineEntries(); return es[es.length - 1]! }
/* the app's own pass changing the war loaded (an orphan projection — out of every step's line: a barrier on what it wrote) */
const appFlipsSans = () => commitProjection({ type: 'lw.edit', scope: { module: 'lw' } as any, apply: () => { setShowSans(!getState().showSans) } })
const leave = (person: string, start: string, end: string) => commitNewInput({ person, type: 'LL', allday: true, half: '', start, end, sTime: '', eTime: '', remarks: '', sans: null, docIds: [] })
const inputOf = (iid: string): any => INPUTS.find((r: any) => r.iid === iid)
const inputIdOf = (e: { forward: { collection: string; id: string }[] }) => e.forward.find(c => c.collection === 'inputs')!.id
const requestsAt = (pid: string, d: string) => recordsAt(pid, d).filter((r: any) => r.kind === 'request')

describe('A-v — a war step is its own squadron’s, wherever Undo is pressed', () => {
  it('the master admin changes 142’s war, then 149’s, returns to 142 and presses Undo: 142’s step is taken, 149’s waits there', () => {
    signInAs('saber')
    const s142 = getState().showSans
    expect(setShowSans(!s142)).toBe(true)
    const a = lastEntry()
    enter('u149')
    const s149 = getState().showSans
    expect(setShowSans(!s149)).toBe(true)
    const b = lastEntry()
    expect(b.seq).toBeGreaterThan(a.seq)
    enter('u142')
    const u = globalUndo()
    expect({ ok: u.ok, seq: u.entry?.seq }, JSON.stringify(u.reason)).toEqual({ ok: true, seq: a.seq })
    expect(getState().showSans, '142’s war back as it was').toBe(s142)
    enter('u149')
    expect(getState().showSans, '149’s war untouched by the Undo in 142').toBe(!s149)
    const u2 = globalUndo()
    expect({ ok: u2.ok, seq: u2.entry?.seq }, JSON.stringify(u2.reason)).toEqual({ ok: true, seq: b.seq })
    expect(getState().showSans).toBe(s149)
  })

  it('a background change in 149’s war does not bar a 142 step', () => {
    signInAs('saber')
    const s142 = getState().showSans
    expect(setShowSans(!s142)).toBe(true)
    enter('u149')
    expect((appFlipsSans() as any).ok).not.toBe(false)
    enter('u142')
    const u = globalUndo()
    expect(u.ok, JSON.stringify(u.reason)).toBe(true)
    expect(getState().showSans).toBe(s142)
  })

  it('(control) a later background change in 142’s war still does', () => {
    signInAs('saber')
    expect(setShowSans(!getState().showSans)).toBe(true)
    expect((appFlipsSans() as any).ok).not.toBe(false)
    const u = globalUndo()
    expect(u.ok).toBe(false)
    expect(u.reason).toMatch(/^The app changed this after your action — it can’t be undone now\./)
  })

  it('the revision of one war record is counted apart for each squadron', () => {
    signInAs('saber')
    expect(setShowSans(!getState().showSans)).toBe(true)
    expect(lastEntry().stamp).toEqual({ lw: 'u142' })
    enter('u149')
    const r142 = revisionOf('lw.config', 'u142@all'), r149 = revisionOf('lw.config', 'u149@all')
    expect(r142).toBeGreaterThan(0)
    expect(setShowSans(!getState().showSans)).toBe(true)
    expect(setShowSans(!getState().showSans)).toBe(true)
    expect([revisionOf('lw.config', 'u142@all'), revisionOf('lw.config', 'u149@all')], '149’s two changes count on 149’s record alone').toEqual([r142, r149 + 2])
    expect(lastEntry().stamp).toEqual({ lw: 'u149' })
  })
})

describe('A-v — a Tracker record of the same name in two squadrons is two records to Undo', () => {
  /* a Tracker store of each squadron's, holding one mark under the same id — the Tracker's own store is its own app
     (its steps are the Tracker's own Undo), so its records are written here as its door writes them */
  const ID = 'v3:c1:sb2026:m:e1'
  const trkStore = (key: string): EnlistableStore & { set(v: number): void } => {
    let v: number | null = null
    return {
      key, capture: () => v, restore: (s: unknown) => { v = s as number | null },
      records: () => new Map(v == null ? [] : [[`trk.marks/${ID}`, { collection: 'trk.marks' as const, id: ID, value: v }]]),
      write: (es: RecordEntry[]) => { for (const e of es) v = e.op === 'delete' ? null : (e.value as number) },
      set(n: number) { v = n },
    }
  }
  it('142’s and 149’s marks of one id: each its own revision and its own barrier', () => {
    signInAs('saber')
    const t142 = trkStore('trk.test.142'), t149 = trkStore('trk.test.149')
    let bound = 'u142'
    setTrkUnitProbe(() => bound)
    commitProjection({ type: 'trk.mark', scope: { module: 'trk' } as any, apply: (txn: any) => { txn.enlist(t142); t142.set(1) } })
    bound = 'u149'
    commitProjection({ type: 'trk.mark', scope: { module: 'trk' } as any, apply: (txn: any) => { txn.enlist(t149); t149.set(1) } })
    commitProjection({ type: 'trk.mark', scope: { module: 'trk' } as any, apply: (txn: any) => { txn.enlist(t149); t149.set(2) } })
    expect([revisionOf('trk.marks', `u142@${ID}`), revisionOf('trk.marks', `u149@${ID}`)]).toEqual([1, 2])
    expect([..._barrier().keys()].filter(k => k.startsWith('trk.marks/')).sort()).toEqual([`trk.marks/u142@${ID}`, `trk.marks/u149@${ID}`])
  })
})

describe('A-v — across his move (the swap made by hand, as enterSquadron makes it at midnight)', () => {
  it('his 142 war step after his move to 149: passed over, blocking nothing in 149', () => {
    moveMan(PID.hunter, 'u149')
    signInAs('hunter')
    on(15, 23, 0)
    const s142 = getState().showSans
    expect(setShowSans(!s142)).toBe(true)                                            // his 142 war step
    pastMidnight()
    expect(homeOn(PID.hunter)).toBe('u149')
    enter('u149')
    const s149 = getState().showSans
    expect(setShowSans(!s149)).toBe(true)                                            // his 149 war step
    const u1 = globalUndo()
    expect(u1.ok, JSON.stringify(u1.reason)).toBe(true)
    expect(getState().showSans).toBe(s149)
    const u2 = globalUndo()
    expect(u2.ok, '142’s step waits in 142 — never written into 149’s war').toBe(false)
    expect(getState().showSans).toBe(s149)
  })

  it('his own leave filed at 23:50 is undone after midnight (an input is no squadron’s world)', () => {
    moveMan(PID.ranger, 'u149')
    signInAs('ranger')
    on(15, 23, 50)
    expect(leave(PID.ranger, '2026-08-20', '2026-08-21')).toBe(true)
    const iid = inputIdOf(lastEntry())
    pastMidnight()
    enter('u149', 'member')
    const u = globalUndo()
    expect(u.ok, JSON.stringify(u.reason)).toBe(true)
    expect(inputOf(iid)).toBeUndefined()
  })

  /* Fable 4 of round 3: a war door writes an input and a war record in one step — here his edit of a leave on the Inputs
     page that now runs over Ranger's bid in 142's war, which the bid gives way to (a notice) — and the input keeps an
     unstamped key. His filing (23:30) and that edit (23:50); his move to 149 counts at midnight. */
  function fable4(who: 'hunter' | 'saber'): { own: string; filed: string; iid: string } {
    if (who === 'hunter') moveMan(PID.hunter, 'u149')
    signInAs(who)
    on(15, 22, 0)
    expect(leave(PID[who], '2026-08-03', '2026-08-03')).toBe(true)                  // an older step of his own
    const own = inputIdOf(lastEntry())
    on(15, 22, 10)
    expect(setCell(PID.ranger, '2026-08-12', 'LL')).toBe(true)                       // Ranger's bid, in 142's war
    on(15, 23, 30)
    expect(leave(PID.ranger, '2026-08-10', '2026-08-11')).toBe(true)                // the filing
    const iid = inputIdOf(lastEntry())
    on(15, 23, 50)
    const r = inputOf(iid)
    expect(commitInputEdit(r, { ...draftOf(r), end: '2026-08-12' })).toBe(true)    // the edit: over the bid
    const edit = lastEntry()
    expect(edit.forward.some(c => c.collection === 'lw.cell'), 'the edit wrote 142’s war too').toBe(true)
    expect(edit.stamp).toEqual({ lw: 'u142' })
    return { own, filed: iid, iid }
  }

  it('Fable 4: in 149 the filing’s Undo is blocked for good, said once, and the next press takes the step before it', () => {
    const { own, iid } = fable4('hunter')
    pastMidnight()
    enter('u149')
    const u1 = globalUndo()
    expect(u1.ok).toBe(false)
    expect(u1.reason).toMatch(/^A later change touches the same thing and can’t be undone\. Press Undo again for: /)
    expect(inputOf(iid)?.endDate, 'the leave as he left it').toBe('Aug 12')
    const u2 = globalUndo()
    expect(u2.ok, JSON.stringify(u2.reason)).toBe(true)
    expect(inputOf(own), 'the step before it: his own leave undone').toBeUndefined()
    expect(inputOf(iid)?.endDate).toBe('Aug 12')
  })

  it('Fable 4 for a master admin who can go back to 142: "undo that first", every press', () => {
    const { iid } = fable4('saber')
    enter('u149')
    for (let i = 0; i < 2; i++) {
      const u = globalUndo()
      expect({ ok: u.ok, reason: u.reason }).toEqual({ ok: false, reason: 'A later change touches the same thing — undo that first.' })
    }
    expect(inputOf(iid)?.endDate).toBe('Aug 12')
  })

  it('Fable 4 for an admin with Plan of 142 after his move: "undo that first"', () => {
    const { iid } = fable4('hunter')
    pastMidnight()
    /* the master admin gives him Plan of 142 — on another sign-in, which leaves his Undo list as it stands */
    const his = SESSION
    setSession(sessionFor(signIn('ad', 'a'))); setMe(PID.saber)
    expect(setGrant(ACCT.hunter, 'u142', 'admin', PID.hunter)).toMatchObject({ ok: true })
    setSession(his); setMe(PID.hunter)
    expect(lastEntry().actor.personId, 'the grant is the master admin’s step, not his').toBe(PID.saber)
    enter('u149')
    const u = globalUndo()
    expect({ ok: u.ok, reason: u.reason }).toEqual({ ok: false, reason: 'A later change touches the same thing — undo that first.' })
    expect(inputOf(iid)?.endDate).toBe('Aug 12')
  })
})

describe('A-v — the second store’s rows are the war’s own records (Opus 5, Opus 7 of round 3)', () => {
  it('a 149 posting, then the man archived through an Admin → Users door: the posting’s step meets it as a later change', () => {
    signInAs('saber')
    enter('u149')
    expect(setPostOut(PID.osprey, '2026-09-01')).toBe(true)
    const set = lastEntry()
    expect(set.forward.some(c => c.collection === 'lw.postouts')).toBe(true)
    enter('u142')
    expect(archivePerson(PID.osprey).bad).toBeNull()
    expect(lastEntry().forward.some(c => c.collection === 'lwx.profile'), 'written through the second store').toBe(true)
    expect(_undoConflict(set)).toBe('A later change to a person (added, archived, restored or posted) touches the same thing, so this can’t be undone — change it back by hand.')
  })

  it('Opus 5: an award given in 149, the man deleted from Admin → Users, then Undo in 149 — refused as a later change', () => {
    signInAs('saber')
    enter('u149')
    expect(grantOil([PID.osprey], 1, '2026-08-03', 'future')).toBeNull()
    const gave = lastEntry()
    expect(gave.forward.some(c => c.collection === 'lw.ledger')).toBe(true)
    enter('u142')
    expect(deletePerson(PID.osprey)).toBeNull()
    expect(lastEntry().forward.some(c => c.collection === 'lwx.ledger')).toBe(true)
    expect(_undoConflict(gave)).toMatch(/^A later change to a person .* touches the same thing/)
    enter('u149')
    const before = JSON.stringify(worlds.u149!.keys().sort().map(k => [k, worlds.u149!.read(k)]))
    expect(globalUndo().ok).toBe(false)
    expect(JSON.stringify(worlds.u149!.keys().sort().map(k => [k, worlds.u149!.read(k)])), '149’s stored war untouched').toBe(before)
  })

  it('a cell row through the second store: a 149 bid, the man deleted, the bid’s step meets the delete', () => {
    signInAs('saber')
    enter('u149')
    expect(setCell(PID.osprey, '2026-08-10', 'LL')).toBe(true)
    const bid = lastEntry()
    enter('u142')
    expect(deletePerson(PID.osprey)).toBeNull()
    expect(lastEntry().forward.some(c => c.collection === 'lwx.rec')).toBe(true)
    expect(_undoConflict(bid)).toMatch(/^A later change to a person .* touches the same thing/)
  })
})

describe('A-v — the closed day and the seen mark in the two-squadron world (Opus 6 of round 3)', () => {
  it('D1263 / B-F1: Osprey deletes his own pending bid on a day closed since, in 149’s war; his Undo puts it back', () => {
    signInAs('osprey')
    expect(lwUnitNow()).toBe('u149')
    const day = '2026-02-10'
    setMemberTodayForTests('2026-02-01')
    expect(canBidOn(PID.osprey, day)).toBe(true)
    expect(setCell(PID.osprey, day, 'LL')).toBe(true)
    setMemberTodayForTests('2026-02-15')
    expect(canBidOn(PID.osprey, day)).toBe(false)
    const own = requestsAt(PID.osprey, day)
    expect(own).toHaveLength(1)
    expect(clearRecordById(PID.osprey, day, own[0]!.id)).toBe(true)
    expect(lastEntry().closedAt).toEqual([expect.stringMatching(/^lw\.cell\/u149@/)])
    const u = globalUndo()
    expect(u.ok, JSON.stringify(u.reason)).toBe(true)
    expect(requestsAt(PID.osprey, day).map((r: any) => [r.code, r.state])).toEqual([['LL', 'pending']])
    expect(globalRedo().ok).toBe(true)
    expect(requestsAt(PID.osprey, day)).toHaveLength(0)
  })

  it('a seen mark carried into an older step’s images: “OK, seen”, then Undo of the filing brings no notice back', () => {
    signInAs('saber')
    expect(setCell(PID.ranger, '2026-08-12', 'LL')).toBe(true)
    expect(leave(PID.ranger, '2026-08-12', '2026-08-12')).toBe(true)
    const notice = recordsAt(PID.ranger, '2026-08-12').find((r: any) => r.kind === 'notice') as any
    expect(notice).toBeTruthy()
    expect(ackReplacement(PID.ranger, notice.id)).toBe(1)
    expect(globalUndo().ok).toBe(true)
    const list = recordsAt(PID.ranger, '2026-08-12')
    expect(list.filter((r: any) => r.kind === 'request')).toHaveLength(1)
    expect(list.some((r: any) => r.kind === 'notice'), 'the notice seen stays seen').toBe(false)
  })
})
