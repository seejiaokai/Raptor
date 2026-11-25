/* ROUND 3 OF THE BLIND READS (chat 157's reads of 330ded7df, 24 Nov 26 — Astra, a fresh Opus and the security reader;
   their reports docs/superpowers/briefs/2026-11-24-sans-words-reread3-*.md), and his D2560 of the same day, which takes
   away what three rounds kept finding faults in: the hidden "planned at" mark on each day, with its permission checks.

   THE RULE NOW (D2560, narrowing D2394 2a): once he has read his SANS reminder, it lights his bell again ONLY for a day
   not in it when he read it. A day he already saw, taken off and put back, does not relight it — the line still lists
   the day until he files. What he read is in his own read record (the reminder's id names its days); nothing else is
   stored, and nothing anyone else writes can light it.

   Fixture: sans-reads-156.test.tsx's — the demo week of Mon 13 Jul 26, today Wed 15 Jul; `rocky` is Hex, a WSO (sign-in
   "hex"); Saber the admin ("ad"); Ranger the member ("us", person `bane`). */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { HOOKS, store, storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, loadWeek, notify as raptorNotify, resetSession, switchUnit } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS, idsOf, sansAvailOn } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear, stashDays, stashGet, stashKeys } from '../engine/weekstash'
import { afterSchedMutate } from '../state/view'
import { NOTICES, noticesFor, noticeWords, type Notice } from '../state/notices'
import { isUnread, markAllNoticesRead, noticeSeenLoad } from '../state/noticeseen'
import { me } from '../state/perms'
import { updatePersonField } from '../state/quals-write'
import { commitNewInput, removeInput } from '../ui/inputedit'
import { setInpEdit } from '../ui/pops'
import { _resetFloatWins } from '../ui/winorder'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { globalRedo, globalUndo } from '../undo'
import { commandStream, commitProjection, activeEnvelope } from '../command'
import { commitAs } from '../command/commit'
import { systemActor } from '../command/actor'
import { commitSettingsIntent, settingsStore } from '../state/people-settings-commit'
import { setHome, setUnitSeeds, unitsLoad, homeOn } from '../state/units'
import { dayEngaged, daySansSeats } from '../engine/avail'
import { dayIso } from '../engine/verid'
import { requestsSig, deletedSig, loadedSrcSig } from '../engine/overlay'
import { sansUnfiledDays, sansUnfiledLines } from './sansunfiled'
import { initStore as lwInitStore, setPeople, setShowSans } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const WED = '2026-07-15', THU = '2026-07-16', FRI = '2026-07-17', SAT = '2026-07-18', SUN = '2026-07-19'
const THUI = 3, SATI = 5, SUNI = 6
const at = (y: number, m: number, d: number) => vi.setSystemTime(new Date(y, m - 1, d, 9, 0, 0))
/* (planned = in a flying seat or a sim, his D2564 of 24 Nov 26: this helper put him on a ground briefing, which the first
   build counted and his rule does not — an OFT's rear seat now; a ground row naming no day: sans-planned-r5.test.ts) */
const plan = (di: number, id = 'rocky') => { const d: any = DAYS[di]; d.sims = d.sims || {}; (d.sims.oft = d.sims.oft || []).push({ label: 'SIM', str: '1600', end: '1700', p: '', w: id }); afterSchedMutate() }
const unplan = (di: number, id = 'rocky') => {
  const g: any[] = (DAYS[di] as any).sims.oft
  const i = g.findIndex(r => r && r.label === 'SIM' && r.w === id)
  expect(i).toBeGreaterThanOrEqual(0)
  g.splice(i, 1); afterSchedMutate()
}
const draft = (start: string, end?: string, person = 'rocky') => ({ _new: true, person, type: 'SANS Availability', start, ...(end ? { end } : {}), allday: true, s: 360, e: 1080, sans: { f: true } })
const mine = () => INPUTS.filter((r: any) => r.type === 'SANS Availability' && idsOf(r).map(String).includes('rocky'))
const kind = (n: Notice) => String((n.what || [])[0]?.k)
const due = (pid = 'rocky') => noticesFor(pid).filter(n => kind(n) === 'sansdue')
const backs = (pid = 'rocky') => noticesFor(pid).filter(n => kind(n) === 'sansback')
const dueUnread = (pid = 'rocky') => due(pid).filter(n => isUnread(n, pid)).length
const dueDays = (pid = 'rocky') => (due(pid)[0]!.what[0] as any).days as string[]
const realToast = HOOKS.toast

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  PEOPLE0 = JSON.stringify(PEOPLE); DAYS0 = JSON.stringify(DAYS); INPUTS0 = JSON.stringify(INPUTS)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  at(2026, 7, 15)
  Object.keys(mem).forEach(k => delete mem[k])
  /* (as the app's own settings door does — storage/adapters.ts settingsAdapter: a setting saved as nothing is removed) */
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v }, keys: () => Object.keys(mem) }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  DAYS.length = 0; JSON.parse(DAYS0).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(INPUTS0).forEach((i: any) => INPUTS.push(i))
  NOTICES.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  stashClear()
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); installGlobalUndo()
  signInAs('ad', 'a')
  setInpEdit(null)
  HOOKS.toast = () => {}
})
afterEach(() => { _resetFloatWins(); setInpEdit(null); HOOKS.toast = realToast; resetSession(null); vi.restoreAllMocks() })

const posted = (day = FRI) => { expect(postOut('rocky', day, 'sans')).toBe(true); raptorNotify() }
/* he reads "on his own device": his read record written as his own "Mark all read" writes it — what he had read before
   is kept — so Saber's Undo list stands (a sign-in would end it, D148) */
const readElsewhere = (pid = 'rocky') => {
  const was = JSON.parse(mem[`sqn142_noticeseen:${pid}`] ?? 'null') as { ids?: string[] } | null
  mem[`sqn142_noticeseen:${pid}`] = JSON.stringify({ upto: 0, ids: [...new Set([...(was?.ids ?? []), ...noticesFor(pid).map(n => n.id)])] }); noticeSeenLoad()
}
const tick = (pid = 'rocky') => { expect(updatePersonField(pid, { tick: 'san' })).toBeNull(); raptorNotify() }
const ticked = () => { tick(); expect(setShowSans(true)).toBe(true); raptorNotify() }
const liveTitles = () => backs().map(n => noticeWords(n)).filter(w => !w.nameStruck).map(w => w.name)
/* every hidden planning mark the store holds, whoever's */
const marks = () => store.keys('sansplan:').filter(k => store.get(k, null) != null)

/* ==== 1. HIS D2560 — the reminder relights only for a day he has not seen ==== */
describe('D2560 — once read, the reminder lights again only for a day not in it when he read it', () => {
  it('a day he saw, taken off and put back (its planning undone, then planned afresh): stays read, and lists the day', () => {
    plan(SATI); posted(); plan(SUNI); readElsewhere()
    expect(dueUnread()).toBe(0)
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(dueDays()).toEqual([SAT])
    expect(dueUnread()).toBe(0)
    plan(SUNI)
    expect(dueDays()).toEqual([SAT, SUN])
    expect(dueUnread()).toBe(0)
  })
  it('his only day taken off (the reminder goes) and put back: it comes back read', () => {
    posted(); plan(SATI); readElsewhere()
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(due()).toEqual([])
    plan(SATI)
    expect(dueDays()).toEqual([SAT])
    expect(dueUnread()).toBe(0)
  })
  it('…taken off and put back by hand, no Undo: the same', () => {
    posted(); plan(SATI); plan(SUNI); readElsewhere()
    unplan(SUNI); raptorNotify()
    expect(dueDays()).toEqual([SAT])
    plan(SUNI)
    expect(dueDays()).toEqual([SAT, SUN])
    expect(dueUnread()).toBe(0)
  })
  it('a genuinely new day lights it: read with Sat 18 in it, then put on Sun 19', () => {
    plan(SATI); posted(); readElsewhere()
    expect(dueUnread()).toBe(0)
    plan(SUNI)
    expect(dueDays()).toEqual([SAT, SUN])
    expect(dueUnread()).toBe(1)
  })
  it('…and once he has read that too, neither day lights it again, in any order', () => {
    plan(SATI); posted(); readElsewhere()
    plan(SUNI); readElsewhere()
    unplan(SATI); raptorNotify(); expect(dueUnread()).toBe(0)
    unplan(SUNI); raptorNotify(); expect(due()).toEqual([])
    plan(SUNI); expect(dueUnread()).toBe(0)
    plan(SATI); expect(dueUnread()).toBe(0)
    expect(dueDays()).toEqual([SAT, SUN])
  })
  it('his date moved, no day new to him: stays read', () => {
    plan(SATI); plan(SUNI); posted(FRI); readElsewhere()
    expect(postOut('rocky', SAT, 'sans')).toBe(true); raptorNotify()
    expect(dueDays()).toEqual([SAT, SUN])
    expect(dueUnread()).toBe(0)
  })
  it('his date moved earlier over a day he is planned on and never saw: that day is new to him — lit', () => {
    plan(THUI); plan(SATI); posted(FRI); readElsewhere()
    expect(dueDays()).toEqual([SAT])
    expect(postOut('rocky', THU, 'sans')).toBe(true); raptorNotify()
    expect(dueDays()).toEqual([THU, SAT])
    expect(dueUnread()).toBe(1)
  })
  it('a filing of his deleted brings back a day he saw: stays read', () => {
    plan(SATI); posted(); readElsewhere()
    expect(commitNewInput(draft(SAT))).toBe(true); raptorNotify()
    expect(due()).toEqual([])
    removeInput(mine()[0]); raptorNotify()
    expect(dueDays()).toEqual([SAT])
    expect(dueUnread()).toBe(0)
  })
  it('while unread there is one line, its days following the plan', () => {
    plan(SATI); posted()
    expect(due().length).toBe(1); expect(dueUnread()).toBe(1)
    plan(SUNI)
    expect(due().length).toBe(1); expect(dueDays()).toEqual([SAT, SUN]); expect(dueUnread()).toBe(1)
    unplan(SATI); raptorNotify()
    expect(due().length).toBe(1); expect(dueDays()).toEqual([SUN]); expect(dueUnread()).toBe(1)
  })
  it('read through his own "Mark all read", twice over: his record keeps every day he saw', () => {
    plan(SATI); posted()
    signInAs('hex'); expect(markAllNoticesRead()).toBe(true)
    signInAs('ad', 'a'); plan(SUNI)
    signInAs('hex'); expect(dueUnread()).toBe(1); expect(markAllNoticesRead()).toBe(true)
    signInAs('ad', 'a'); unplan(SATI); raptorNotify(); plan(SATI)
    signInAs('hex')
    expect(dueDays()).toEqual([SAT, SUN])
    expect(dueUnread()).toBe(0)
  })
})

/* ==== 2. THE HIDDEN MARK IS GONE (D2560) ==== */
describe('D2560 — no hidden planning mark is written, and one left in a store from before is read by nothing', () => {
  it('planning a SANS man writes no mark', () => {
    posted(); plan(SATI); plan(SUNI)
    expect(marks()).toEqual([])
    expect(commandStream().some(e => e.type === 'sans.planned')).toBe(false)
  })
  it('a mark left stored from before: his read reminder stays read, an unread one stays one line', () => {
    plan(SATI); posted(); readElsewhere()
    mem[`sqn142_sansplan:rocky:${SAT}`] = '9000000000000'
    mem['sqn142_sansplan:rocky:2026-07-19'] = '1e+300'
    raptorNotify()
    expect(dueUnread()).toBe(0)
    plan(SUNI)
    expect(due().length).toBe(1)
    expect(dueUnread()).toBe(1)
  })
  it('a read record in the older shape (each day with its mark) still reads as those days', () => {
    plan(SATI); posted()
    mem['sqn142_noticeseen:rocky'] = JSON.stringify({ upto: 0, ids: [`sansdue:rocky~${SAT}.1763970000000`] }); noticeSeenLoad(); raptorNotify()
    expect(dueUnread()).toBe(0)
    plan(SUNI)
    expect(dueUnread()).toBe(1)
  })
})

/* ==== 3. ASTRA'S F1, RE-AIMED: a member cannot relight another man's reminder ==== */
describe('Astra F1 — Ranger, a member, cannot light Hex\'s read reminder again', () => {
  /* the planning command the old gate took as a mark's cause (its `causedBy`) */
  const planning = () => [...commandStream()].reverse().find(e => e.origin === 'user' && e.changes.some(c => c.collection === 'days'))!
  it('a hand-built projection naming a completed planning as its cause, the system actor named', () => {
    posted(); plan(SATI); readElsewhere()
    expect(dueUnread()).toBe(0)
    const cause = planning().seq
    signInAs('us', 'us'); expect(me()).toBe('bane')
    try {
      commitAs({ type: 'sans.planned', scope: { module: 'settings' } as any,
        apply: txn => { txn.enlist(settingsStore); store.set(`sansplan:rocky:${SAT}`, 9e12) },
      }, { actor: systemActor(), origin: 'projection', causedBy: cause })
    } catch { /* refused outright: as good */ }
    raptorNotify()
    expect(dueUnread()).toBe(0)
  })
  it('the public projection door, the cause written into its own envelope', () => {
    posted(); plan(SATI); readElsewhere()
    const cause = planning().seq
    signInAs('us', 'us'); expect(me()).toBe('bane')
    try {
      commitProjection({ type: 'sans.planned', scope: { module: 'settings' } as any,
        apply: txn => {
          activeEnvelope()!.causedBy = cause
          txn.enlist(settingsStore); store.set(`sansplan:rocky:${SAT}`, 9e12)
        },
      })
    } catch { /* refused outright: as good */ }
    raptorNotify()
    expect(dueUnread()).toBe(0)
  })
  it('Hex\'s read record is his alone: Ranger\'s own read command cannot empty it', () => {
    posted(); plan(SATI); readElsewhere()
    signInAs('us', 'us')
    const r: any = commitSettingsIntent('notices.seen', { owner: 'bane' }, () => { store.set('noticeseen:rocky', { upto: 0, ids: [] }) })
    expect(r.ok).toBe(false)
    noticeSeenLoad(); raptorNotify()
    expect(dueUnread()).toBe(0)
  })
})

/* ==== 4. THE SECURITY READ'S SEC-R3-1, RE-AIMED: nothing a man writes in his own read record reaches another man's ==== */
describe('SEC-R3-1 — Hex\'s own read record, whatever he writes in it, changes nobody else\'s reminder', () => {
  it('Hex saves a read record holding a day marked 1e300 and a line of Ranger\'s: Ranger is still told of a day new to him', () => {
    tick('rocky'); tick('bane')
    signInAs('hex')
    const res: any = commitSettingsIntent('notices.seen', { owner: 'rocky' }, () => {
      store.set('noticeseen:rocky', { upto: 0, ids: [`sansdue:rocky~${SAT}.1e300`, `sansdue:bane~${SAT},${SUN}`, `sansdue:bane~${SAT}.9007199254740991`] })
    })
    expect(res.ok).toBe(true)   // (his own row, by its own command: the gate lets it through, as it should)
    signInAs('ad', 'a')
    plan(SATI, 'rocky'); plan(SUNI, 'bane')
    expect(marks()).toEqual([])
    signInAs('us', 'us'); expect(dueUnread('bane')).toBe(1); expect(markAllNoticesRead()).toBe(true); expect(dueUnread('bane')).toBe(0)
    signInAs('ad', 'a')
    /* a day he saw, taken off and put back: no news (D2560) */
    unplan(SUNI, 'bane'); raptorNotify(); plan(SUNI, 'bane')
    expect(dueUnread('bane')).toBe(0)
    /* a day new to him: told, whatever Hex wrote */
    plan(SATI, 'bane')
    /* (the demo week already names Ranger on Thu 16) */
    expect(dueDays('bane')).toEqual([THU, SAT, SUN])
    expect(dueUnread('bane')).toBe(1)
    expect(marks()).toEqual([])
  })
})

/* ==== 5. THE OPUS READ'S O3-1: an untick's Undo then Redo must not stop the end of his SANS counting ==== */
describe('O3-1 — a "taken back" from an untick\'s Undo, the untick put back by its Redo', () => {
  it('control: Saber ticks Hex, Hex reads; Saber unticks him (Hex reads); Saber ticks him again — his reminder is news (lit)', () => {
    plan(SATI)
    tick(); readElsewhere(); expect(dueUnread()).toBe(0)
    tick()                                               // untick: "You're no longer SANS."
    expect(!!(PEOPLE as any).rocky.san).toBe(false)
    readElsewhere()
    tick()                                               // ticked again
    expect(dueUnread()).toBe(1)
  })
  it('the same, but Saber presses Undo and Redo on the untick between — the end of his SANS still counts: lit', () => {
    plan(SATI)
    tick(); readElsewhere(); expect(dueUnread()).toBe(0)
    tick()                                               // untick: line U
    readElsewhere()                                      // Hex reads U
    expect(globalUndo().ok).toBe(true); raptorNotify()   // U taken back (struck), he is SANS
    expect(!!(PEOPLE as any).rocky.san).toBe(true)
    /* (while the Undo stands his SANS never ended: the reminder he read is still read) */
    expect(dueUnread()).toBe(0)
    expect(globalRedo().ok).toBe(true); raptorNotify()   // the untick again: U back, told "again"
    expect(!!(PEOPLE as any).rocky.san).toBe(false)
    expect(liveTitles()).toEqual(["You're no longer SANS."])
    readElsewhere()
    tick()                                               // ticked again (a new step)
    expect(!!(PEOPLE as any).rocky.san).toBe(true)
    expect(dueUnread()).toBe(1)
  })
  it('…and twice round (Undo, Redo, Undo, Redo): it still counts, once', () => {
    plan(SATI)
    tick(); readElsewhere()
    tick(); readElsewhere()
    for (let i = 0; i < 2; i++) {
      expect(globalUndo().ok).toBe(true); raptorNotify(); readElsewhere()
      expect(globalRedo().ok).toBe(true); raptorNotify(); readElsewhere()
    }
    expect(liveTitles()).toEqual(["You're no longer SANS."])
    tick()
    expect(dueUnread()).toBe(1)
  })
})

/* ==== 6. ASTRA'S F2: a held week's reading follows the home squadron its requests land by ==== */
/* RE-PINNED BY HIS D2564 (24 Nov 26, round 5): Astra's case was a Meeting on Tue 28 Jul naming a day in his reminder, the
   day staying after he moved squadron and the Meeting left 142's saved week. A Meeting lands on the ground programme,
   which no longer puts a day in the reminder, so Tue 28 is never named now — before the move, after it, undone or redone;
   each "names it" below reads "does not". Kept and still held: the saved week itself follows the move (the busy read,
   dayEngaged), and the reminder equals a fresh reading at every step — now with a real seat of his in that week (Wed 29
   Jul, an OFT), which a home change does not move. That no saved week is read again for a home change:
   sans-held-weeks-r5.test.tsx. */
describe('Astra F2 — a man moved squadron: the reminder equals a fresh reading at every step (his Meeting never in it: D2564)', () => {
  /* his days from a held week ahead, worked out afresh from the saved weeks (engine/weekstash.ts stashDays) */
  const heldFresh = (pid = 'rocky'): string[] => {
    const out: string[] = []
    for (const wk of stashKeys()) (stashDays(wk)?.days || []).forEach((d: any, i: number) => { if (d && (daySansSeats(d) as Set<string>).has(pid) && !sansAvailOn(pid, d.dt)) out.push(dayIso(wk, i)) })
    return out.filter(d => d >= '2026-07-20').sort()
  }
  const heldNow = (pid = 'rocky'): string[] => sansUnfiledDays(pid).filter(d => d >= '2026-07-20')
  const setUp = () => {
    ticked()
    loadWeek('27/07/2026'); plan(0, 'bane'); plan(2)
    loadWeek('13/07/2026'); raptorNotify()
    expect(commitNewInput({ person: 'rocky', type: 'Meeting', start: '2026-07-28', allday: false, sTime: '09:00', eTime: '10:00', remarks: 'R3 home change' } as any)).toBe(true)
    raptorNotify()
    expect((dayEngaged(stashDays('27/07/2026')!.days[1]) as Set<string>).has('rocky'), 'the Meeting stands on 142\'s saved Tue 28').toBe(true)
    expect(sansUnfiledDays('rocky')).not.toContain('2026-07-28')
    expect(heldNow()).toEqual(['2026-07-29'])
  }
  beforeEach(() => { setUnitSeeds(true); unitsLoad() })
  afterEach(() => { switchUnit('u142'); loadWeek('13/07/2026'); setUnitSeeds(true); unitsLoad(); raptorNotify() })
  it('Hex moved to 149 from tomorrow, 142 and this week on screen: his Meeting on Tue 28 Jul leaves 142\'s week; his reminder never named it, and keeps his seat on Wed 29', () => {
    setUp()
    const key = [stashGet('27/07/2026'), requestsSig(), deletedSig(), loadedSrcSig()]
    expect(setHome('rocky', 'u149')).toMatchObject({ ok: true }); raptorNotify()
    expect(homeOn('rocky', WED)).toBe('u142')
    expect(homeOn('rocky', '2026-07-28')).toBe('u149')
    /* (nothing else a held week's reading used has moved: the saved copy, the requests, the men deleted, the loaded rows) */
    expect([stashGet('27/07/2026'), requestsSig(), deletedSig(), loadedSrcSig()]).toEqual(key)
    expect((dayEngaged(stashDays('27/07/2026')!.days[1]) as Set<string>).has('rocky')).toBe(false)
    expect(sansUnfiledDays('rocky')).not.toContain('2026-07-28')
    expect(heldNow()).toEqual(heldFresh())
  })
  it('…the move undone and redone: the reminder follows each time', () => {
    setUp()
    expect(setHome('rocky', 'u149')).toMatchObject({ ok: true }); raptorNotify()
    expect(heldNow()).toEqual(heldFresh()); expect(heldNow()).not.toContain('2026-07-28')
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(homeOn('rocky', '2026-07-28')).toBe('u142')
    expect(heldNow()).toEqual(heldFresh()); expect(heldNow()).toEqual(['2026-07-29'])
    expect(globalRedo().ok).toBe(true); raptorNotify()
    expect(homeOn('rocky', '2026-07-28')).toBe('u149')
    expect(heldNow()).toEqual(heldFresh()); expect(heldNow()).not.toContain('2026-07-28')
  })
  it('…and in both squadrons\' views: 149\'s names no day for a man who is 142\'s today; back on 142\'s, fresh again', () => {
    setUp()
    expect(setHome('rocky', 'u149')).toMatchObject({ ok: true }); raptorNotify()
    switchUnit('u149'); raptorNotify()
    expect(sansUnfiledDays('rocky')).toEqual([])
    switchUnit('u142'); raptorNotify()
    expect(heldNow()).toEqual(heldFresh()); expect(heldNow()).not.toContain('2026-07-28')
    expect(globalUndo().ok).toBe(true); raptorNotify()
    switchUnit('u149'); raptorNotify()
    expect(sansUnfiledDays('rocky')).toEqual([])
    switchUnit('u142'); raptorNotify()
    expect(heldNow()).toEqual(heldFresh()); expect(heldNow()).toEqual(['2026-07-29'])
  })
})

/* ==== 7. THE OPUS READ'S O3-2 (speed): a plain Ground Programme row leaves the held weeks' reading as it is ==== */
describe('O3-2 — a plain row added to or taken off the week on screen reads no held week again', () => {
  /* (a held week's saved copy read whole: the blobs the saved weeks keep — engine/weekstash.ts — start so) */
  const weekReads = (fn: () => void): number => {
    const real = JSON.parse
    let n = 0
    const spy = vi.spyOn(JSON, 'parse').mockImplementation(((s: string, r?: any) => { if (typeof s === 'string' && s.startsWith('{"d":[')) n++; return real(s, r) }) as any)
    try { fn() } finally { spy.mockRestore() }
    return n
  }
  const hold = (n: number, from: Date) => {
    for (let i = 0; i < n; i++) {
      const d = new Date(from.getTime() + i * 7 * 86400000)
      loadWeek(`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`); plan(1)
    }
    loadWeek('13/07/2026'); raptorNotify()
  }
  it('Saber adds a briefing row for Bane on Thu 16, then takes it off (no request, no saved week touched): none read again', () => {
    tick()
    hold(6, new Date(2026, 6, 27))
    sansUnfiledLines('rocky')
    /* (the control: a repaint with nothing changed reads none) */
    expect(weekReads(() => { raptorNotify(); sansUnfiledLines('rocky') })).toBe(0)
    plan(THUI, 'bane'); raptorNotify()
    expect(weekReads(() => { sansUnfiledLines('rocky') })).toBe(0)
    unplan(THUI, 'bane'); raptorNotify()
    expect(weekReads(() => { sansUnfiledLines('rocky') })).toBe(0)
  })
  /* RE-PINNED BY HIS D2564 (round 5): this case held that a request landing a row on the week on screen DID read the held
     weeks again ("the key reacts to what it must") — it had to while a ground row could put a day in the reminder. Only a
     flying seat or a sim does now, and a request lands on neither, so it reads none (sans-held-weeks-r5.test.tsx) */
  it('…and a request landing a row on the week on screen reads none either, since D2564 (it once had to)', () => {
    tick()
    hold(2, new Date(2026, 6, 27))
    sansUnfiledLines('rocky')
    expect(commitNewInput({ person: 'bane', type: 'Meeting', start: THU, allday: false, sTime: '09:00', eTime: '10:00', remarks: 'O3-2' } as any)).toBe(true); raptorNotify()
    expect(weekReads(() => { sansUnfiledLines('rocky') })).toBe(0)
  })
})
