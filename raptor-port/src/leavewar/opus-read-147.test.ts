/* OPUS-READ-147 — the fresh, blind Opus reader's probes of D2338 and the F1 fix (23 Nov 26). A NEW file; each `it` is a
   claim, written to FAIL on the code read where it is a fault. Fixture: sans-unfiled.test.ts's — the demo week of
   Mon 13 Jul 26, today Wed 15 Jul; `rocky` is Hex, a WSO; `ad` is Saber. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputsBatch } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { afterSchedMutate } from '../state/view'
import { NOTICES, noticesFor, noticeWords, noticeAboutHim, noticeSansBack, type Notice } from '../state/notices'
import { markAllNoticesRead, unreadFor } from '../state/noticeseen'
import { me } from '../state/perms'
import { updatePersonField } from '../state/quals-write'
import { commit as cmdCommit, type Txn } from '../command'
import { peopleStore, settingsStore } from '../state/people-settings-commit'
import { schedStore, resyncBeforeEnlist, schedApplyEnd } from '../state/sched-commit'
import { finishPeopleWrite } from '../state/people-settings-commit'
import { validate } from '../engine/validate'
import { initStore as lwInitStore, setPeople, setPostIn, setShowSans, getState, lwStore, setPostOut } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { archivePerson, availableFor, postOut, runPoOutcomes, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const P = (id: string): any => (PEOPLE as any)[id]
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const MON = 0, TUE = 1, FRI = 4, SAT = 5
const MON_ISO = '2026-07-13', TUE_ISO = '2026-07-14', FRI_ISO = '2026-07-17'
const WIN: [number, number] = [600, 660]
const at = (y: number, m: number, d: number) => vi.setSystemTime(new Date(y, m - 1, d, 9, 0, 0))
const plan = (di: number, id: string) => { (DAYS[di] as any).ground.push({ prog: 'BRIEFING', str: '1600', end: '1700', who: id }); afterSchedMutate() }
const onlyTheEvent = (di: number) => { const d: any = DAYS[di]; d.waves = []; d.sims = {}; d.dutywaves = []; d.ground = []; d.notes = []; d.allhands = [{ prog: 'SQN EVENT', str: '0800', end: '1500', who: 'ALL AVAIL' }]; afterSchedMutate() }
const kindOf = (n: Notice) => String((n.what || [])[0]?.k)

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  PEOPLE0 = JSON.stringify(PEOPLE); DAYS0 = JSON.stringify(DAYS); INPUTS0 = JSON.stringify(INPUTS)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  at(2026, 7, 15)
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } }
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
  signInAs('ad', 'a')
})
afterEach(() => { resetSession(null); vi.restoreAllMocks() })

/* ---- F1 ---- */
describe('OPUS-147 F1 — an archived man with no war row, read by his archive date', () => {
  it('a man posted IN for Fri, archived Wed before he arrived: never in the crowd of Tue (he was never here)', () => {
    onlyTheEvent(TUE)
    expect(setPostIn('rocky', FRI_ISO)).toBe(true); raptorNotify()
    expect(availableFor(TUE_ISO, WIN, DAYS[TUE] as any), 'before the archive: not yet arrived — out').not.toContain('rocky')
    expect(archivePerson('rocky').bad).toBeNull(); raptorNotify()
    console.log('PROBE F1-postin: row?', getState().people.some(p => p.id === 'rocky'), 'record', JSON.stringify(getState().postOuts.rocky), 'archivedOn', P('rocky').archivedOn)
    expect(availableFor(TUE_ISO, WIN, DAYS[TUE] as any), 'archived before his post-in: still out on Tue').not.toContain('rocky')
  })
  it('F1\'s own man (hand-ticked SANS, "+ SANS" off, archived Fri): Mon, a SANS day he was NOT named on, stays out', () => {
    at(2026, 7, 13)
    onlyTheEvent(MON); onlyTheEvent(TUE); plan(TUE, 'rocky')
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    at(2026, 7, 17)
    expect(setShowSans(false)).toBe(true); raptorNotify()
    expect(archivePerson('rocky').bad).toBeNull(); raptorNotify()
    expect(availableFor(MON_ISO, WIN, DAYS[MON] as any)).not.toContain('rocky')
    expect(availableFor(TUE_ISO, WIN, DAYS[TUE] as any)).toContain('rocky')
  })
})

/* ---- the stored lines' door ---- */
describe('OPUS-147 door — a "sansdue" line is never stored by the app, yet the gate lets one be stored', () => {
  const IID = 'opus147-in'
  it('an admin\'s input command stores a made-up "Your SANS availability · Planned, no availability filed" line on Hex\'s bell — refused?', () => {
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'rocky', date: 'Jul 20', yr: 2026, allday: true, type: 'LL', remarks: 'x', by: me(), at: Date.now(), iid: IID, ord: 99971 } as any) })).toBe(true)
    const n: any = { id: 'opus147-forge', to: 'rocky', by: me(), at: Date.now(), iid: IID, name: 'Your SANS availability', day: '2026-12-25', what: [{ k: 'sansdue', days: ['2026-12-25'] }] }
    const ok = writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = 'y'; NOTICES.push(n) })
    const saved = ok && NOTICES.some(x => x.id === n.id)
    const shown = noticesFor('rocky').find(x => x.id === n.id)
    console.log('PROBE door-forge: saved', saved, 'words', shown ? JSON.stringify(noticeWords(shown)) : '-')
    expect(saved, 'a stored sansdue line is a forgery — the app only works it out').toBe(false)
  })
  it('…and one whose days are not a list breaks his bell\'s words (noticeWords throws) — the gate lets it through', () => {
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'rocky', date: 'Jul 20', yr: 2026, allday: true, type: 'LL', remarks: 'x', by: me(), at: Date.now(), iid: IID, ord: 99971 } as any) })).toBe(true)
    const n: any = { id: 'opus147-crash', to: 'rocky', by: me(), at: Date.now(), iid: IID, name: 'x', day: '2026-07-20', what: [{ k: 'sansdue', days: 'Sat' }] }
    const ok = writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = 'z'; NOTICES.push(n) })
    const saved = ok && NOTICES.some(x => x.id === n.id)
    let threw: string | null = null
    if (saved) { try { noticesFor('rocky').forEach(x => noticeWords(x)) } catch (e) { threw = String(e) } }
    console.log('PROBE door-crash: saved', saved, 'threw', threw)
    expect({ saved, threw }).toEqual({ saved: false, threw: null })
  })
  it('a "taken back" line written by a command that CREATES a SANS posting for Fri 24 (no posting before, no line ever shown) — refused?', () => {
    expect(getState().postOuts.rocky, 'no posting before').toBeUndefined()
    let id = ''
    const r: any = cmdCommit({
      type: 'lw.postout', scope: { module: 'people' }, meta: null,
      apply: (txn: Txn) => {
        resyncBeforeEnlist(); txn.enlist(schedStore); txn.enlist(peopleStore); txn.enlist(settingsStore); txn.enlist(lwStore)
        setPostOut('rocky', '2026-07-24', 'sans')
        noticeSansBack('rocky', me(), ['2026-12-25', '2026-12-26'], FRI_ISO)
        id = NOTICES[NOTICES.length - 1]!.id
        /* (the builder's change, chat 147's fix round: the command ENDED as the app's posting command ends it — without the
           scheduler store's end the line never entered the command at all, so the gate was never asked and nothing was
           saved; the line stood only in this device's memory. Ended so, the forged line is in the command, and the claim
           is the security read's SEC-147-1: red before the fix, as that test shows) */
        validate(); finishPeopleWrite(); schedApplyEnd()
      },
    })
    const saved = !(r && r.ok === false) && NOTICES.some(x => x.id === id && kindOf(x) === 'sansback')
    console.log('PROBE door-sansback: result', JSON.stringify(r && r.ok === false ? r : 'ok'), 'saved', saved)
    expect(saved, 'a struck line no take-back of a READ line made').toBe(false)
  })
})

/* ---- a move of squadron (D2218) ---- */
describe('OPUS-147 D2218 — is a line about his own SANS availability "about himself"?', () => {
  it('the struck line to Hex about his own SANS days reads as NOT about him, so it leaves his bell on a move', () => {
    const n: any = { id: 'x', to: 'rocky', by: 'ad', at: Date.now(), iid: '', name: 'Your SANS availability', day: FRI_ISO, what: [{ k: 'sansback', days: ['2026-07-18'] }] }
    expect(noticeAboutHim(n)).toBe(true)
  })
})

/* ---- the read record across a filed-then-deleted day ---- */
describe('OPUS-147 (observation) — once read, a later planned day adds to the same read line', () => {
  /* (LEFT AS BUILT — the coordinator's word, chat 147's fix round: a product question for him, not a fault; the build's
     reading keeps the id steady, so this states what it would take, and is expected to fail) */
  it.fails('read Fri (Sat named); Sun planned unfiled after: the bell stays dark', () => {
    plan(SAT, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    signInAs('hex'); expect(markAllNoticesRead()).toBe(true); signInAs('ad', 'a')
    plan(6, 'rocky')
    const l = noticesFor('rocky').filter(n => kindOf(n) === 'sansdue')
    console.log('PROBE obs: days', l.map(n => noticeWords(n).day))
    signInAs('hex')
    console.log('PROBE obs: unread', unreadFor('rocky'))
    /* (a product question, not a code fault: the build's own reading keeps the id steady; this fails to SHOW the state) */
    expect(unreadFor('rocky'), 'Sunday, planned after he read, lights his bell').toBe(1)
  })
})

/* ---- the same door, from a MEMBER: Hex edits the input Saber filed for him and rides a line onto Saber's bell ---- */
describe('OPUS-147 door (member) — Hex puts a stored sansdue line on the bell of the admin who filed for him', () => {
  const IID = 'opus147-mem'
  it('a member\'s own input change carries a made-up sansdue line to its filer — refused?', () => {
    const saber = me()!
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'rocky', date: 'Jul 20', yr: 2026, allday: true, type: 'LL', remarks: 'x', by: saber, at: Date.now(), iid: IID, ord: 99972 } as any) })).toBe(true)
    signInAs('hex')
    const ok1 = writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = 'by hex' })
    const real = NOTICES.find(x => x.to === saber && x.iid === IID)
    console.log('PROBE member: first edit ok', ok1, 'pass line to Saber', JSON.stringify(real && { fu: real.fu, what: real.what }))
    const n: any = { id: 'opus147-mforge', to: saber, by: 'rocky', at: Date.now(), iid: IID, name: 'x', day: '2026-07-20', what: [{ k: 'sansdue', days: 'Sat' }], ...(real && real.fu ? { fu: real.fu } : {}) }
    const ok2 = writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = 'by hex again'; NOTICES.push(n) })
    const saved = ok2 && NOTICES.some(x => x.id === n.id)
    signInAs('ad', 'a')
    let threw: string | null = null
    try { noticesFor(saber).forEach(x => noticeWords(x)) } catch (e) { threw = String(e) }
    console.log('PROBE member: saved', saved, 'threw', threw)
    expect({ saved, threw }).toEqual({ saved: false, threw: null })
  })
})
