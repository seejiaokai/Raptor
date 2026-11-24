/* THE FOUR BLIND READS OF 0eaacc411 (chat 156, 24 Nov 26 — Astra, a fresh Opus, a fresh Fable and the security reader;
   their reports D:/raptor-work/c156-read-*): each reader's failing case brought onto the branch in the app's own test
   style, seen to fail, then fixed. The fixture is sans-words-156.test.tsx's: the demo week of Mon 13 Jul 26, today Wed 15
   Jul; `rocky` is Hex, a WSO (sign-in "hex"); Saber the admin ("ad"). Hex reads "on his own device": his read record
   written as his own "Mark all read" writes it, so Saber's Undo list stands (a sign-in would end it, D148). */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { HOOKS, storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, loadWeek, notify as raptorNotify, resetSession, writeInputsBatch } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS, idsOf, sansAvailOn } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { afterSchedMutate } from '../state/view'
import { NOTICES, noticeSansBack, noticesFor, noticeWords, type Notice } from '../state/notices'
import { isUnread, markAllNoticesRead, markNoticeRead, noticeSeenLoad, unreadFor } from '../state/noticeseen'
import { me } from '../state/perms'
import { updatePersonField } from '../state/quals-write'
import { commitInput, commitNewInput, draftOf, commitInputEdit, offersFor, removeInput, sansRunTrim } from '../ui/inputedit'
import { pickRoster } from '../ui/peoplepick-model'
import { INPEDIT, setInpEdit } from '../ui/pops'
import { openSansAdd } from '../ui/sansadd'
import { SansDay } from '../ui/SansDay'
import { toast, toastBatch } from '../ui/toast'
import { _resetFloatWins } from '../ui/winorder'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { globalRedo, globalUndo } from '../undo'
import { commit as cmdCommit } from '../command'
import { schedStore, resyncBeforeEnlist, schedApplyEnd } from '../state/sched-commit'
import { peopleStore, settingsStore, finishPeopleWrite } from '../state/people-settings-commit'
import { validate } from '../engine/validate'
import { sansBackOwed, sansTakeBack, sansUnfiledLines } from './sansunfiled'
import { initStore as lwInitStore, lwStore, setPeople, setPostOut, setShowSans } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, runPoOutcomes, undoPostOut, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const WED = '2026-07-15', THU = '2026-07-16', FRI = '2026-07-17', SAT = '2026-07-18', SUN = '2026-07-19', MON20 = '2026-07-20', FRI24 = '2026-07-24'
const SATI = 5, SUNI = 6
const at = (y: number, m: number, d: number) => vi.setSystemTime(new Date(y, m - 1, d, 9, 0, 0))
const plan = (di: number, id = 'rocky') => { (DAYS[di] as any).ground.push({ prog: 'BRIEFING', str: '1600', end: '1700', who: id }); afterSchedMutate() }
const draft = (start: string, end?: string, person = 'rocky') => ({ _new: true, person, type: 'SANS Availability', start, ...(end ? { end } : {}), allday: true, s: 360, e: 1080, sans: { f: true } })
const mine = () => INPUTS.filter((r: any) => r.type === 'SANS Availability' && idsOf(r).map(String).includes('rocky'))
const toasts: string[] = []
const kind = (n: Notice) => String((n.what || [])[0]?.k)
const due = (pid = 'rocky') => noticesFor(pid).filter(n => kind(n) === 'sansdue')
const backs = (pid = 'rocky') => noticesFor(pid).filter(n => kind(n) === 'sansback')
const hexReads = () => { signInAs('hex'); expect(markAllNoticesRead()).toBe(true); signInAs('ad', 'a') }
/* (whether the REMINDER is unread — a filing Saber makes for him brings a line of its own, which is not what is asked) */
const dueUnread = () => due().filter(n => isUnread(n, 'rocky')).length
const realToast = HOOKS.toast

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  PEOPLE0 = JSON.stringify(PEOPLE); DAYS0 = JSON.stringify(DAYS); INPUTS0 = JSON.stringify(INPUTS)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  at(2026, 7, 15)
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v }, keys: () => Object.keys(mem) }
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
  toasts.length = 0
  HOOKS.toast = (m: any) => { toasts.push(String(m)) }
})
afterEach(() => { cleanup(); _resetFloatWins(); setInpEdit(null); HOOKS.toast = realToast; resetSession(null); vi.restoreAllMocks() })

const posted = (day = FRI) => { expect(postOut('rocky', day, 'sans')).toBe(true); raptorNotify() }
import { store } from '../engine/hooks'
import { seenOf } from '../state/noticeseen'
import { commitSettingsIntent } from '../state/people-settings-commit'
import { saveBatchX } from '../ui/inputedit'
import { stashKeys } from '../engine/weekstash'
import { deletePerson } from '../state/person-delete'

const readElsewhere = (pid = 'rocky') => { mem[`sqn142_noticeseen:${pid}`] = JSON.stringify({ upto: 0, ids: noticesFor(pid).map(n => n.id) }); noticeSeenLoad() }
const dueDays = () => (due()[0]!.what[0] as any).days as string[]
const ticked = () => {
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
  expect(setShowSans(true)).toBe(true); raptorNotify()
}
/* (a row taken away is written as nothing by the settings store — engine/hooks.ts store.set) */
const plans = (pid = 'rocky') => store.keys(`sansplan:${pid}:`).filter(k => store.get(k, null) != null).sort()

/* 1. THE COUNT ROW: a stamp that only grows (Fable F1 with its Q-b, Astra #4), written by the app alone (the security
   read's SEC156-1, SEC156-2, the Opus read's F4, Astra #1), past days and a deleted man's rows pruned (Fable F6) */
describe('1 — a day newly planned is marked by a stamp only the app writes', () => {
  it('Fable F1: a day planned, read, its planning undone, then planned again: lit', () => {
    plan(SATI); posted(); plan(SUNI); readElsewhere()
    expect(dueUnread()).toBe(0)
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(dueDays()).toEqual([SAT])
    plan(SUNI)
    expect(dueDays()).toEqual([SAT, SUN])
    expect(dueUnread()).toBe(1)
  })
  it('Astra #4: posted, planned on Sat 18, read; Undo; planned on Sat 18 afresh: lit', () => {
    posted(); plan(SATI); readElsewhere()
    expect(dueUnread()).toBe(0)
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(due()).toEqual([])
    plan(SATI)
    expect(dueUnread()).toBe(1)
  })
  it('…and a Redo of the planning, after its Undo, is no news: it stays read', () => {
    plan(SATI); posted(); plan(SUNI); readElsewhere()
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(globalRedo().ok).toBe(true); raptorNotify()
    expect(dueDays()).toEqual([SAT, SUN])
    expect(dueUnread()).toBe(0)
  })
  it('Astra #1: an unrelated settings command cannot write it', () => {
    plan(SATI); posted(); readElsewhere()
    const r: any = commitSettingsIntent('settings.rules', null, () => { store.set(`sansplan:rocky:${SAT}`, 200) })
    expect(r.ok).toBe(false)
    expect(dueUnread()).toBe(0)
  })
  it('the Opus read\'s F4 (its control): a hand-built command of the app\'s own type is refused', () => {
    plan(SATI); posted(); readElsewhere()
    let r: any
    try {
      r = cmdCommit({ type: 'sans.planned', scope: { module: 'settings' }, meta: null,
        apply: (txn: any) => { txn.enlist(settingsStore); store.set(`sansplan:rocky:${SAT}`, 99) } } as any)
    } catch { r = { ok: false } }
    raptorNotify()
    expect(r.ok).toBe(false)
    expect(dueUnread()).toBe(0)
  })
  it('the Opus read\'s F4: a bare write outside every command is refused, an admin\'s or his own', () => {
    plan(SATI); posted(); readElsewhere()
    expect(() => store.set(`sansplan:rocky:${SAT}`, 99)).toThrow(/written only by the app/)
    signInAs('hex')
    expect(() => store.set(`sansplan:rocky:${SAT}`, 99)).toThrow(/written only by the app/)
    expect(dueUnread()).toBe(0)
  })
  it('Fable F6: his rows for days gone by leave when the app next marks a day for him', () => {
    posted(); plan(SATI)
    expect(plans()).toEqual([`sansplan:rocky:${SAT}`])
    at(2026, 7, 19)
    plan(SUNI)
    expect(plans()).toEqual([`sansplan:rocky:${SUN}`])
  })
  it('Fable F6: a deleted man\'s rows go with him', () => {
    posted(); plan(SATI)
    expect(plans().length).toBe(1)
    expect(deletePerson('rocky')).toBeNull(); raptorNotify()
    expect(plans()).toEqual([])
  })
})

/* 2. ONLY A LINE THAT ENDED HIS SANS STARTS A NEW REMINDER (the Opus read's F1) */
describe('2 — the "ended" mark', () => {
  it('ticked and posted ahead, read, "Undo post out": still SANS by the tick, nothing newly planned — stays read', () => {
    ticked(); plan(SATI); posted(); hexReads()
    expect(dueUnread()).toBe(0)
    expect(undoPostOut('rocky')).toBe(true); raptorNotify()
    expect(due().length).toBe(1)
    expect(dueUnread()).toBe(0)
  })
  it('ticked and posted ahead, a tick-only day filed, read, Saber unticks: the posting stands — stays read', () => {
    ticked(); plan(SATI); posted()
    expect(commitNewInput(draft(THU))).toBe(true); raptorNotify()
    hexReads()
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(backs().length).toBe(1)
    expect(due().length).toBe(1)
    expect(dueUnread()).toBe(0)
  })
  it('stays: a posting undone that leaves him no SANS day at all marks its line ended, and the same posting made again is news', () => {
    plan(SATI); posted(); hexReads()
    expect(undoPostOut('rocky')).toBe(true); raptorNotify()
    expect((backs()[0]!.what[0] as any).ended).toBe(true)
    posted()
    expect(dueUnread()).toBe(1)
  })
  it('the gate: a change line whose "ended" mark is not what the change did is refused', () => {
    ticked(); plan(SATI); posted(); hexReads()
    const days = dueDays()
    const r = cmdCommit({ type: 'lw.postout', scope: { module: 'people' }, meta: null,
      apply: (txn: any) => {
        resyncBeforeEnlist(); txn.enlist(schedStore); txn.enlist(peopleStore); txn.enlist(settingsStore); txn.enlist(lwStore)
        setPostOut('rocky', '2026-07-23', 'sans')
        noticeSansBack('rocky', me(), days, FRI, Date.now(), [], { how: 'later', to: FRI24, ended: true } as any)
        validate(); finishPeopleWrite(); schedApplyEnd()
      } } as any)
    expect((r as any).ok).toBe(false)
  })
})

/* 3. HIS READ OF THE REMINDER IS NEVER DROPPED (Fable F4, the Opus read's F2, Astra's older note) */
describe('3 — reading another line, or "Mark all read", while the reminder is gone keeps his read of it', () => {
  it('read; Sat filed for him; he taps another line; the filing deleted: dark', () => {
    plan(SATI); posted(); hexReads()
    expect(commitNewInput(draft(SAT))).toBe(true); raptorNotify()
    expect(due()).toEqual([])
    signInAs('hex')
    const other = noticesFor('rocky').find(n => isUnread(n, 'rocky'))
    expect(other).toBeTruthy()
    expect(markNoticeRead(other!.id)).toBe(true)
    signInAs('ad', 'a')
    removeInput(mine()[0]); raptorNotify()
    expect(dueDays()).toEqual([SAT])
    expect(dueUnread()).toBe(0)
  })
  it('the same with "Mark all read" pressed while the reminder is gone', () => {
    plan(SATI); posted(); hexReads()
    expect(commitNewInput(draft(SAT))).toBe(true); raptorNotify()
    hexReads()
    removeInput(mine()[0]); raptorNotify()
    expect(due().length).toBe(1)
    expect(dueUnread()).toBe(0)
  })
})

/* 4. SABER'S UNDO OF A SANS TICK TELLS HIM (Fable F2) */
describe('4 — the Undo of a tick put on writes "You\'re no longer SANS."', () => {
  it('Saber ticks Hex SANS, Hex reads his reminder, Saber Undoes the tick: Hex is told', () => {
    plan(SATI)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    readElsewhere(); expect(dueUnread()).toBe(0)
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(due()).toEqual([])
    expect(backs().length).toBe(1)
    /* (as an untick's line: the reminder he had read is gone, nothing he filed is hidden — the title alone) */
    expect(noticeWords(backs()[0]!)).toEqual({ name: 'You\'re no longer SANS.', day: '· Saber', what: '', who: '' })
    expect(isUnread(backs()[0]!, 'rocky')).toBe(true)
  })
  it('…and nothing read and nothing filed: nothing to tell', () => {
    plan(SATI)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(backs()).toEqual([])
  })
})

/* 5. THE WINDOW'S SAVE OF A FILING STRETCHED BACK SAYS THE CUT (Fable F3) */
describe('5 — a saved filing stretched back before his date, from the input\'s window', () => {
  it('says what it left out', () => {
    posted(); expect(commitNewInput(draft(FRI, SAT))).toBe(true); toasts.length = 0
    const rec: any = mine()[0]
    expect(commitInput(rec, { ...draftOf(rec), start: THU, end: SAT }, ['rocky'])).toBe(true)
    expect(toasts).toEqual(['Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Hex is SANS from Fri 17 Jul.'])
  })
})

/* 6. ONLY A VERIFIED REPLAY TAKES A SANS LINE AWAY (the security read's SEC156-3, the Opus read's F3) */
describe('6 — a posting command cannot take away a SANS change line', () => {
  it('Saber unticks Hex (line owed), then a hand-built posting command moves his posting and deletes the line: refused', () => {
    ticked(); posted()
    expect(commitNewInput(draft(THU))).toBe(true); raptorNotify()
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    const line = backs()[0]!
    expect(line).toBeTruthy()
    let r: any
    try {
      r = cmdCommit({ type: 'lw.postout', scope: { module: 'people' }, meta: null,
        apply: (txn: any) => {
          resyncBeforeEnlist(); txn.enlist(schedStore); txn.enlist(peopleStore); txn.enlist(settingsStore); txn.enlist(lwStore)
          setPostOut('rocky', SAT, 'sans')
          const ix = NOTICES.findIndex(x => x.id === line.id); if (ix >= 0) NOTICES.splice(ix, 1)
          validate(); finishPeopleWrite(); schedApplyEnd()
        } } as any)
    } catch { r = { ok: false } }
    raptorNotify()
    expect(r.ok).toBe(false)
  })
})

/* 7. THE GATE REQUIRES `how` (Astra #2, the Opus read's Q2, Fable's Q-a, the security read's Q3) */
describe('7 — a fresh change line must say what changed', () => {
  it('a posting moved with its change line written without `how`: refused', () => {
    plan(SATI); posted(); hexReads()
    const days = dueDays()
    const r = cmdCommit({ type: 'lw.postout', scope: { module: 'people' }, meta: null,
      apply: (txn: any) => {
        resyncBeforeEnlist(); txn.enlist(schedStore); txn.enlist(peopleStore); txn.enlist(settingsStore); txn.enlist(lwStore)
        setPostOut('rocky', '2026-07-23', 'sans')
        noticeSansBack('rocky', me(), days, FRI)
        validate(); finishPeopleWrite(); schedApplyEnd()
      } } as any)
    expect((r as any).ok).toBe(false)
  })
})

/* 8. Astra #3 and #5 */
describe('8 — a forged read in memory, and repeated Redo', () => {
  it('Astra #3: a read mark forged in this device\'s memory does not let Undo tell him "taken back"', () => {
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    plan(SATI); readElsewhere()
    expect(commitNewInput(draft(FRI, SAT))).toBe(true)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    const line = backs()[0]!
    expect(isUnread(line, 'rocky')).toBe(true)
    const saved = mem['sqn142_noticeseen:rocky']
    try { (seenOf('rocky').ids as string[]).push(line.id) } catch { /* a frozen copy */ }
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(mem['sqn142_noticeseen:rocky']).toBe(saved)
    expect(backs()).toEqual([])
  })
  it('Astra #5: Undo and Redo twice leave one current line', () => {
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    plan(SATI)
    expect(commitNewInput(draft(FRI, SAT))).toBe(true)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    readElsewhere()
    for (let i = 0; i < 2; i++) {
      expect(globalUndo().ok).toBe(true)
      expect(globalRedo().ok).toBe(true)
      raptorNotify()
      readElsewhere()
    }
    expect(backs().filter(n => !noticeWords(n).nameStruck)).toHaveLength(1)
  })
})

/* 9. SPEED (Fable F5, the Opus read's Q3): a held week that ended before today is never read; the held weeks are read
   again only once one changes; and only a command that may change a posting or a tick takes the start-of-command note */
describe('9 — the held weeks are not re-read on every change', () => {
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
  it('weeks before today: never parsed for his reminder', () => {
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    hold(6, new Date(2026, 4, 25))
    expect(stashKeys().length).toBeGreaterThanOrEqual(6)
    expect(weekReads(() => { raptorNotify(); sansUnfiledLines('rocky') })).toBe(0)
  })
  it('weeks ahead: parsed once, not again on a change that leaves them as they are', () => {
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    hold(6, new Date(2026, 6, 27))
    sansUnfiledLines('rocky')
    expect(weekReads(() => { raptorNotify(); sansUnfiledLines('rocky') })).toBe(0)
  })
})

/* 10. A FAILED SAVE LEAVES NO CUT NOTE BEHIND (Fable's Q-c) */
describe('10 — the cut note is cleared whatever the save did', () => {
  it('a save that throws after a cut, then an unrelated save: no stale "left out" note', () => {
    posted(); toasts.length = 0
    try { saveBatchX(() => { commitNewInput(draft(THU, SAT)); throw new Error('boom') }) } catch { /* the throw */ }
    toasts.length = 0
    saveBatchX(() => true)
    expect(toasts.join(' ')).not.toContain('left out')
  })
})

/* W12-1 (the second walk, 24 Nov 26, both sizes — S22a, S22b): a change made, read, undone by a change the other way, then
   made again left two lines of the same words, the old read one with its hidden sentence back. One line carries the
   hidden sentence: the latest; an older one keeps its title alone, or goes */
describe('W12-1 — the same change made again: the hidden sentence on the latest line alone', () => {
  const hiding = () => backs().filter(n => noticeWords(n).what.includes('is hidden'))
  it('his SANS date moved to Sat 18, read; back to Fri 17; to Sat 18 again: one line says Fri 17 is hidden', () => {
    plan(SATI); posted()
    expect(commitNewInput(draft(FRI))).toBe(true); raptorNotify()
    expect(postOut('rocky', SAT, 'sans')).toBe(true); raptorNotify()
    expect(hiding().length).toBe(1)
    readElsewhere()
    expect(postOut('rocky', FRI, 'sans')).toBe(true); raptorNotify()
    expect(hiding()).toEqual([])
    expect(postOut('rocky', SAT, 'sans')).toBe(true); raptorNotify()
    expect(hiding().length).toBe(1)
    expect(isUnread(hiding()[0]!, 'rocky')).toBe(true)
  })
  it('the Quals tick: untick, read, tick, untick again — one line says his filing is hidden', () => {
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(commitNewInput(draft(FRI, SAT))).toBe(true)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(hiding().length).toBe(1)
    readElsewhere()
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(hiding()).toEqual([])
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(hiding().length).toBe(1)
    expect(isUnread(hiding()[0]!, 'rocky')).toBe(true)
  })
})
