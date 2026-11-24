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

/* (as his own "Mark all read" writes it: what he had read before is kept — state/noticeseen.ts keepReminders) */
const readElsewhere = (pid = 'rocky') => {
  const was = JSON.parse(mem[`sqn142_noticeseen:${pid}`] ?? 'null') as { ids?: string[] } | null
  mem[`sqn142_noticeseen:${pid}`] = JSON.stringify({ upto: 0, ids: [...new Set([...(was?.ids ?? []), ...noticesFor(pid).map(n => n.id)])] }); noticeSeenLoad()
}
const dueDays = () => (due()[0]!.what[0] as any).days as string[]
const ticked = () => {
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
  expect(setShowSans(true)).toBe(true); raptorNotify()
}
/* (every hidden planning mark the store holds — none is written since his D2560: sans-reads-r3.test.tsx) */
const plans = (pid = 'rocky') => store.keys(`sansplan:${pid}:`).filter(k => store.get(k, null) != null).sort()

/* 1. WHICH DAYS LIGHT HIS REMINDER AGAIN. These pinned the hidden "planned at" stamp of the four reads of 0eaacc411 (Fable
   F1 with its Q-b, Astra #4; the security read's SEC156-1, SEC156-2; the Opus read's F4; Astra #1; Fable F6). HIS D2560
   (24 Nov 26) took the stamp away, with its permission checks, and narrowed D2394 2a: once read, the reminder lights
   again only for a day not in it when he read it — a day he saw, taken off and put back, does not. Each case is kept and
   now pins that rule; the rule's own cases, and round 3's, are in sans-reads-r3.test.tsx. */
describe('1 — once read, his reminder lights again only for a day he has not seen (D2560)', () => {
  it('Fable F1\'s case: a day planned, read, its planning undone, then planned again — a day he saw: stays read', () => {
    plan(SATI); posted(); plan(SUNI); readElsewhere()
    expect(dueUnread()).toBe(0)
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(dueDays()).toEqual([SAT])
    plan(SUNI)
    expect(dueDays()).toEqual([SAT, SUN])
    expect(dueUnread()).toBe(0)
  })
  it('Astra #4\'s case: posted, planned on Sat 18, read; Undo; planned on Sat 18 afresh — a day he saw: stays read', () => {
    posted(); plan(SATI); readElsewhere()
    expect(dueUnread()).toBe(0)
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(due()).toEqual([])
    plan(SATI)
    expect(dueDays()).toEqual([SAT])
    expect(dueUnread()).toBe(0)
  })
  it('…and a Redo of the planning, after its Undo, is no news: it stays read', () => {
    plan(SATI); posted(); plan(SUNI); readElsewhere()
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(globalRedo().ok).toBe(true); raptorNotify()
    expect(dueDays()).toEqual([SAT, SUN])
    expect(dueUnread()).toBe(0)
  })
  it('a day new to him still lights it: read with Sat 18, then planned on Sun 19', () => {
    plan(SATI); posted(); readElsewhere()
    plan(SUNI)
    expect(dueUnread()).toBe(1)
  })
  it('Astra #1\'s case: a settings command writing the old mark\'s row lights nothing', () => {
    plan(SATI); posted(); readElsewhere()
    try { commitSettingsIntent('settings.rules', null, () => { store.set(`sansplan:rocky:${SAT}`, 200) }) } catch { /* refused: as good */ }
    raptorNotify()
    expect(dueUnread()).toBe(0)
  })
  it('the Opus read\'s F4 (its control): a hand-built command of the old projection\'s type lights nothing', () => {
    plan(SATI); posted(); readElsewhere()
    try {
      cmdCommit({ type: 'sans.planned', scope: { module: 'settings' }, meta: null,
        apply: (txn: any) => { txn.enlist(settingsStore); store.set(`sansplan:rocky:${SAT}`, 99) } } as any)
    } catch { /* refused: as good */ }
    raptorNotify()
    expect(dueUnread()).toBe(0)
  })
  it('the Opus read\'s F4: a bare write of the old mark\'s row, an admin\'s or his own, lights nothing', () => {
    plan(SATI); posted(); readElsewhere()
    try { store.set(`sansplan:rocky:${SAT}`, 99) } catch { /* refused: as good */ }
    signInAs('hex')
    try { store.set(`sansplan:rocky:${SAT}`, 99) } catch { /* refused: as good */ }
    raptorNotify()
    expect(dueUnread()).toBe(0)
  })
  it('Fable F6\'s cases: no mark is written, so none is left for a day gone by or a man deleted', () => {
    posted(); plan(SATI)
    expect(plans()).toEqual([])
    at(2026, 7, 19)
    plan(SUNI)
    expect(plans()).toEqual([])
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

/* ==== ROUND 2 OF THE BLIND READS OF f73602f9f (chat 156, 24 Nov 26 — Astra, a fresh Opus, a fresh Fable and the security
   reader; their reports D:/raptor-work/c156-reread-*): each reader's failing case brought onto the branch, seen to fail,
   then fixed. ==== */
import { stashDays, stashGet } from '../engine/weekstash'
import { dayEngaged } from '../engine/avail'
import { dayIso } from '../engine/verid'
import { sansUnfiledDays, sansPostedFrom as sansPostedFromR2 } from './sansunfiled'
import { commitProjection } from '../command'

const liveTitles = () => backs().map(n => noticeWords(n)).filter(w => !w.nameStruck).map(w => w.name)
const struck = () => backs().filter(n => noticeWords(n).nameStruck)
/* a reload as the app does it: the bell's rows read back in their saved order (state/persist.ts — by time, then id), his
   read record from the store, the Undo list empty (session-only) */
const reboot = () => {
  const kept = structuredClone(NOTICES) as Notice[]
  kept.sort((x, y) => x.at - y.at || (String(x.id) < String(y.id) ? -1 : 1))
  NOTICES.length = 0; kept.forEach(n => NOTICES.push(n))
  _resetTimeline(); installGlobalUndo(); noticeSeenLoad(); raptorNotify()
}

/* R2-1 (Astra F1 = the Opus read's R2 = Fable's RE-READ 2): the line Saber's Undo of a SANS tick writes is retracted by his
   Redo — gone where Hex had not read it, struck "taken back" where he had */
describe('R2-1 — Saber ticks Hex SANS, Hex reads, Saber Undoes (the line written), then Redoes', () => {
  it('unread: the Redo takes the line away — Hex SANS again, no line standing, his reminder still read', () => {
    plan(SATI)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    readElsewhere(); expect(dueUnread()).toBe(0)
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(liveTitles()).toEqual(["You're no longer SANS."])
    expect(globalRedo().ok).toBe(true); raptorNotify()
    expect(!!(PEOPLE as any).rocky.san).toBe(true)
    expect(backs()).toEqual([])
    expect(due().length).toBe(1)
    expect(dueUnread()).toBe(0)
  })
  it('read: the Redo strikes it "taken back", unread; nothing else stands and his reminder stays read', () => {
    plan(SATI)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    readElsewhere()
    expect(globalUndo().ok).toBe(true); raptorNotify(); readElsewhere()
    expect(globalRedo().ok).toBe(true); raptorNotify()
    expect(liveTitles()).toEqual([])
    expect(struck().length).toBe(1)
    expect(noticeWords(struck()[0]!)).toMatchObject({ name: "You're no longer SANS.", nameStruck: true, what: 'taken back' })
    expect(isUnread(struck()[0]!, 'rocky')).toBe(true)
    expect(due().length).toBe(1)
    expect(dueUnread()).toBe(0)
  })
  it('the Opus read\'s R2: Undo, Redo, Undo again, each read — one current line, not two', () => {
    plan(SATI)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    readElsewhere()
    expect(globalUndo().ok).toBe(true); raptorNotify(); readElsewhere()
    expect(globalRedo().ok).toBe(true); raptorNotify(); readElsewhere()
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(!!(PEOPLE as any).rocky.san).toBe(false)
    expect(liveTitles()).toEqual(["You're no longer SANS."])
  })
  it('repeated, never read: Undo, Redo, Undo, Redo — nothing left standing', () => {
    plan(SATI)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    readElsewhere()
    for (let i = 0; i < 2; i++) {
      expect(globalUndo().ok).toBe(true); raptorNotify()
      expect(globalRedo().ok).toBe(true); raptorNotify()
    }
    expect(backs()).toEqual([])
    expect(dueUnread()).toBe(0)
  })
  it('after a reload the Redo\'s result holds: nothing standing', () => {
    plan(SATI)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    readElsewhere()
    expect(globalUndo().ok).toBe(true); raptorNotify(); readElsewhere()
    expect(globalRedo().ok).toBe(true); raptorNotify()
    reboot()
    expect(liveTitles()).toEqual([])
    expect(dueUnread()).toBe(0)
  })
  it('the gate: Saber\'s ordinary command cannot take that line away', () => {
    plan(SATI)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    readElsewhere()
    expect(globalUndo().ok).toBe(true); raptorNotify()
    const line = backs()[0]!
    let r: any
    try {
      r = cmdCommit({ type: 'lw.postout', scope: { module: 'people' }, meta: null,
        apply: (txn: any) => {
          resyncBeforeEnlist(); txn.enlist(schedStore); txn.enlist(peopleStore); txn.enlist(settingsStore); txn.enlist(lwStore)
          const ix = NOTICES.findIndex(x => x.id === line.id); if (ix >= 0) NOTICES.splice(ix, 1)
          validate(); finishPeopleWrite(); schedApplyEnd()
        } } as any)
    } catch { r = { ok: false } }
    raptorNotify()
    expect(r.ok).toBe(false)
  })
})

/* R2-6 (the Opus read's R3 — not a fault): the top bar's Undo never takes a posting back (D321, D350 — "Undo post out" on the
   posting sheet does, and tells him: test 2 above). Its case pressed Undo after posting him and took back the PLANNING made
   before the posting: his day left the reminder, which is no take-back (D2391) — so no line is owed */
describe('R2-6 — Saber posts Hex SANS, Hex reads, Saber presses Undo on the top bar', () => {
  it('the posting is no step of the Undo: refused in its own words, Hex still posted, nothing told', () => {
    plan(SATI); posted(); readElsewhere()
    const r: any = globalUndo()
    expect(r.ok).toBe(true)                    // (the step it takes is the planning before the posting)
    raptorNotify()
    expect(sansPostedFromR2('rocky')).toBe(FRI)
    expect(due()).toEqual([])
    expect(backs()).toEqual([])
    const r2: any = globalUndo()
    expect(r2.ok).toBe(false)
    expect(String(r2.reason)).toMatch(/a posting, aren.t undone here/)
    expect(sansPostedFromR2('rocky')).toBe(FRI)
  })
})

/* R2-2 (Astra F3 = the Opus read's R1 = Fable's RE-READ 1): a held week ahead is worked out with the requests as they stand
   now (engine/overlay.ts viewOfWeek), so what it names must follow them, not only its saved copy */
describe('R2-2 — the held weeks ahead follow the requests landed on them', () => {
  const heldNow = (pid = 'rocky'): string[] => {
    const out: string[] = []
    for (const wk of stashKeys()) (stashDays(wk)?.days || []).forEach((d: any, i: number) => { if (d && (dayEngaged(d) as Set<string>).has(pid) && !sansAvailOn(pid, d.dt)) out.push(dayIso(wk, i)) })
    return out.sort()
  }
  const meeting = (iso: string) => commitNewInput({ person: 'rocky', type: 'Meeting', start: iso, allday: false, sTime: '09:00', eTime: '10:00', remarks: 'RE-READ' } as any)
  afterEach(() => { loadWeek('13/07/2026'); raptorNotify() })
  it('Astra F3: a Meeting deleted from Inputs while another week is loaded leaves his reminder; Undo and Redo follow', () => {
    ticked()
    loadWeek('27/07/2026'); raptorNotify()
    expect(commitNewInput({ ...draft('2026-07-28'), type: 'Meeting', allday: false, sTime: '16:00', eTime: '17:00', sans: null, remarks: 'R2 meeting', docIds: [] } as any, true)).toBe(true)
    raptorNotify()
    const rec: any = INPUTS.find((r: any) => r.type === 'Meeting' && idsOf(r).map(String).includes('rocky') && r.date.includes('28'))
    expect(rec).toBeTruthy()
    plan(0, 'bane')
    loadWeek('13/07/2026'); raptorNotify()
    expect(sansUnfiledDays('rocky')).toContain('2026-07-28')
    const blob = stashGet('27/07/2026')
    removeInput(rec); raptorNotify()
    expect(stashGet('27/07/2026')).toBe(blob)
    expect((dayEngaged(stashDays('27/07/2026')!.days[1]) as Set<string>).has('rocky')).toBe(false)
    expect(sansUnfiledDays('rocky')).not.toContain('2026-07-28')
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(sansUnfiledDays('rocky')).toContain('2026-07-28')
    expect(globalRedo().ok).toBe(true); raptorNotify()
    expect(sansUnfiledDays('rocky')).not.toContain('2026-07-28')
  })
  it('the Opus read\'s R1: a Meeting on Wed 29 Jul (a saved week ahead) deleted — his reminder no longer lists Wed 29', () => {
    loadWeek('27/07/2026'); plan(0); loadWeek('13/07/2026'); raptorNotify()
    expect(commitNewInput({ _new: true, person: 'rocky', type: 'Meeting', start: '2026-07-29', allday: true, s: 360, e: 1080 } as any)).toBe(true); raptorNotify()
    const meet = INPUTS.find((r: any) => r.type === 'Meeting' && idsOf(r).map(String).includes('rocky'))
    expect(meet).toBeTruthy()
    expect((dayEngaged(stashDays('27/07/2026')!.days[2]) as Set<string>).has('rocky')).toBe(true)
    ticked()
    expect(sansUnfiledDays('rocky')).toContain('2026-07-29')
    removeInput(meet); raptorNotify()
    expect((dayEngaged(stashDays('27/07/2026')!.days[2]) as Set<string>).has('rocky')).toBe(false)
    expect(sansUnfiledDays('rocky')).not.toContain('2026-07-29')
  })
  it('Fable 1a: a meeting filed for Hex on Thu 23 Jul, in the held week of Mon 20 Jul — his reminder names Thu 23', () => {
    loadWeek('13/07/2026'); expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    loadWeek('20/07/2026'); plan(1, 'bane'); loadWeek('13/07/2026'); raptorNotify()
    expect(sansUnfiledDays('rocky')).not.toContain('2026-07-23')
    expect(meeting('2026-07-23')).toBe(true); raptorNotify()
    expect(heldNow()).toContain('2026-07-23')
    expect(sansUnfiledDays('rocky')).toContain('2026-07-23')
  })
  it('Fable 1b: …and that meeting deleted — his reminder no longer names it', () => {
    loadWeek('13/07/2026'); expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    loadWeek('20/07/2026'); plan(1, 'bane'); loadWeek('13/07/2026'); raptorNotify()
    expect(meeting('2026-07-24')).toBe(true); raptorNotify()
    loadWeek('20/07/2026'); plan(2, 'bane'); loadWeek('13/07/2026'); raptorNotify()
    expect(sansUnfiledDays('rocky')).toContain('2026-07-24')
    removeInput(INPUTS.find((r: any) => r.type === 'Meeting' && r.remarks === 'RE-READ')); raptorNotify()
    expect(heldNow()).not.toContain('2026-07-24')
    expect(sansUnfiledDays('rocky')).not.toContain('2026-07-24')
  })
  it('Fable 1c: across the New Year — Tue 12 Jan 27 filed while a December week is on screen leaves his reminder', () => {
    at(2026, 12, 22)
    loadWeek('13/07/2026'); expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    loadWeek('11/01/2027'); plan(1); raptorNotify()
    loadWeek('04/01/2027'); raptorNotify()
    expect(sansUnfiledDays('rocky')).toContain('2027-01-12')
    loadWeek('21/12/2026'); raptorNotify()
    expect(commitNewInput(draft('2027-01-12'))).toBe(true); raptorNotify()
    expect(heldNow()).not.toContain('2027-01-12')
    expect(sansUnfiledDays('rocky')).not.toContain('2027-01-12')
  })
})

/* R2-3 (the security read's RR-SEC-1 = the Opus read's R4): the app's own projection door, called from outside any planning.
   It could once write the hidden planning mark; the mark is gone (his D2560), so whatever it writes there lights nothing
   and puts nothing out */
describe('R2-3 — commitProjection("sans.planned") from outside any planning', () => {
  const asTheApp = (fn: () => void) => {
    let r: any
    try { r = commitProjection({ type: 'sans.planned', scope: { module: 'settings' } as any, meta: null, apply: (txn: any) => { txn.enlist(settingsStore); fn() } } as any) } catch { r = { ok: false } }
    raptorNotify()
    return r
  }
  it('cannot light his read reminder with nothing new to him', () => {
    plan(SATI); posted(); readElsewhere()
    expect(dueUnread()).toBe(0)
    asTheApp(() => { store.set(`sansplan:rocky:${SAT}`, 9e12) })
    expect(dueUnread()).toBe(0)
  })
  it('…nor put out a day new to him since he read', () => {
    plan(SATI); posted(); readElsewhere()
    plan(SUNI)
    expect(dueUnread()).toBe(1)
    asTheApp(() => { store.set(`sansplan:rocky:${SUN}`, null) })
    expect(dueUnread()).toBe(1)
  })
})

/* R2-4 (Astra F2, the security read's Q2): a second Undo / Redo left a hidden filing explained by no line — the restore put
   the original back after its unread "again" copy, and the copy lost its days to the line it stands for */
describe('R2-4 — the hidden sentence through repeated Undo / Redo', () => {
  const hiding = () => backs().filter(n => noticeWords(n).what.includes('is hidden'))
  const setUp = () => {
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(commitNewInput(draft(FRI, SAT))).toBe(true); raptorNotify()
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    readElsewhere()
  }
  it('Astra F2: an unread Redo copy keeps the explanation, cycle after cycle', () => {
    setUp()
    for (let cycle = 0; cycle < 2; cycle++) {
      expect(globalUndo().ok).toBe(true)
      expect(globalRedo().ok).toBe(true); raptorNotify()
      expect(hiding()).toHaveLength(1)
    }
    reboot()
    expect(hiding()).toHaveLength(1)
  })
  it('…and its counterpart, each copy read', () => {
    setUp()
    for (let cycle = 0; cycle < 2; cycle++) {
      expect(globalUndo().ok).toBe(true)
      expect(globalRedo().ok).toBe(true); raptorNotify()
      expect(hiding()).toHaveLength(1)
      readElsewhere()
    }
    reboot()
    expect(hiding()).toHaveLength(1)
  })
})

/* R2-5 (Astra F4 = the Opus read's R5; Fable's RE-READ 3): a man deleted by his posting's run kept his planning marks, and a
   row taken away stayed in the store holding nothing. No mark is written any more (his D2560), so none is left in either
   case — the cases kept, pinning that */
describe('R2-5 — no planning mark is left for a man deleted by his posting, or for days gone by', () => {
  it('Astra F4\'s case: posted SANS, planned Sat 18, then posted out with Delete from Fri 17 — on Fri 17 the pass runs', () => {
    posted(); plan(SATI)
    expect(postOut('rocky', FRI, 'delete')).toBe(true); raptorNotify()
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    expect(!!(PEOPLE as any).rocky.deleted).toBe(true)
    expect(store.keys('sansplan:rocky:')).toEqual([])
    expect(due()).toEqual([])
  })
  it('Fable RE-READ 3\'s case: planned Sat 18, then on Sun 19 planned Sun 19 — his reminder names Sun 19 alone', () => {
    posted(); plan(SATI)
    at(2026, 7, 19)
    plan(SUNI)
    expect(store.keys('sansplan:rocky:')).toEqual([])
    expect(dueDays()).toEqual([SUN])
  })
  it('…and a man deleted by hand: no reminder, no row', () => {
    posted(); plan(SATI)
    expect(deletePerson('rocky')).toBeNull(); raptorNotify()
    expect(store.keys('sansplan:rocky:')).toEqual([])
    expect(due()).toEqual([])
  })
})
