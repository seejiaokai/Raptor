/* A SANS POSTING NOT YET RUN, SEEN ON A DAY AFTER ITS DATE — THE CREW LIST'S NOTE AND THE MAN'S BELL LINE (owner D2338,
   22 Nov 26 — "in 15 Jul when the admin see the 18 Jul schedule. Should it say no availability filed, await for 17 Jul for
   SANs availability to be filed"; and "Should we tell the user too": yes; built without a drawing first on his D2339).
   Two parts, each failing before the build:
   (1) the crew list, and the reason an armed seat greys him with, say on a look-ahead day that nothing is filed and that it
       can be filed from the posting's date, on the SANS calendar — from that date the usual words, gone once filed;
   (2) on the posting's date his own bell lists the days he is planned with us with nothing filed; a tap opens the SANS
       calendar on the first of them. Nothing before the date, nothing on anyone else's bell, gone once all are filed.
   And what stays (the order's §8 point 7): the usual words for an ordinary SANS man, and ALL AVAIL's crowd as before.
   The fixture is sans-from-date.test.ts's: the demo week of Mon 13 Jul 26, today Wed 15 Jul; id `rocky` is Hex, a WSO. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns, sansOn } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { slotBar } from '../engine/avail'
import { afterSchedMutate, CALMONTH, INPMODE, SANSDAYASK, clearSansDayAsk } from '../state/view'
import { sansAvailHTML } from '../ui/palette-html'
import { NOTICES, noticesFor, noticeWords, noticeSansBack, type Notice } from '../state/notices'
import { commit as cmdCommit, commandStream } from '../command'
import { schedStore, resyncBeforeEnlist, schedApplyEnd } from '../state/sched-commit'
import { peopleStore, settingsStore, finishPeopleWrite } from '../state/people-settings-commit'
import { validate } from '../engine/validate'
import { CURWEEK } from '../engine/waves'
import { loadWeek } from '../state/store'
import { markAllNoticesRead, unreadFor } from '../state/noticeseen'
import { me, ownershipViolation } from '../state/perms'
import { deriveActor } from '../command/actor'
import { CURPAGE } from '../state/view'
import { openNotice } from '../ui/topstate'
import { initStore as lwInitStore, setPeople, setPostOut, lwStore } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { archivePerson, availableFor, postOut, restoreArchivedPerson, runPoOutcomes, undoPostOut, warLinesOwed, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const P = (id: string): any => (PEOPLE as any)[id]
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const FRI = 4, SAT = 5, FRI_ISO = '2026-07-17', SAT_ISO = '2026-07-18'
const at = (y: number, m: number, d: number) => vi.setSystemTime(new Date(y, m - 1, d, 9, 0, 0))
/* (the writing guide §1b: a colon, not a dash, joins the opening name and its fact; the place named as the screen names it —
   the Inputs page's tab reads "SANS"; the coordinator's correction of 23 Nov 26) */
/* (his D2340, 23 Nov 26: filing ahead is allowed, so the note names where to file it, no longer "from that day") */
const LOOK = 'SANS from Fri 17 Jul: no availability filed. File it on the Inputs page\'s SANS tab.'
const USUAL = 'SANS — no availability filed for today'
/* his line in a day's crew list, the SANS section, nothing armed — the reason he is struck with (the puck's data-why) */
const whyIn = (di: number, id: string): string | null => {
  const html = sansAvailHTML(di, '', new Set(), new Set(), new Map(), null)
  const m = new RegExp(`<span class="rpuck[^"]*"[^>]*data-person="${id}"([^>]*)>`).exec(html)
  if (!m) return null
  const w = /data-why="([^"]*)"/.exec(m[1]!)
  return w ? w[1]!.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&') : ''
}
/* the first WSO seat of a day's first flight, the place an armed seat asks the SANS gate about — the demo's Friday flies
   nothing, so it is given Thursday's first wave first */
const wsoSeat = (di: number): string => {
  const d: any = DAYS[di]
  if (!(d.waves || []).length) { d.waves = [structuredClone((DAYS[3] as any).waves[0])]; afterSchedMutate() }
  return `${di}.0.0.0.w`
}
/* a briefing on a day naming him — "planned with us" (D2329) */
const plan = (di: number, id: string) => { (DAYS[di] as any).ground.push({ prog: 'BRIEFING', str: '1600', end: '1700', who: id }); afterSchedMutate() }
/* his SANS availability, filed for a day */
const file = (dt: string, id: string) => { INPUTS.push({ iid: `sa-${id}-${dt}`, person: id, date: dt, allday: true, type: 'SANS Availability', sans: { f: true }, mod: 'now' } as any); raptorNotify() }
const sansLines = (pid: string): Notice[] => noticesFor(pid).filter(n => (n.what || [])[0]?.k === 'sansdue')

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  PEOPLE0 = JSON.stringify(PEOPLE); DAYS0 = JSON.stringify(DAYS); INPUTS0 = JSON.stringify(INPUTS)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  at(2026, 7, 15)                                                        // Wed 15 Jul 26, the demo week
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
  clearSansDayAsk()
})
afterEach(() => { resetSession(null); vi.restoreAllMocks() })

describe('D2338 (1) — the crew list on a look-ahead day says when SANS availability can be filed', () => {
  it('his example: on Wed 15 Jul, Sat 18 Jul, Hex posted out as SANS from Fri 17 Jul — struck, with the date and where', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(!!P('rocky').san, 'his posting has not run: he is not SANS today').toBe(false)
    expect(sansOn('rocky', SAT_ISO), 'Saturday is a SANS day already (D2329)').toBe(true)
    expect(whyIn(SAT, 'rocky')).toBe(LOOK)
  })

  it('an armed flying seat greys him with the same words (the picker reads the same note)', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(slotBar('rocky', wsoSeat(FRI))).toBe(LOOK)
  })

  it('from the posting\'s date the note is the usual one, and goes once availability is filed', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    expect(!!P('rocky').san, 'his posting ran on Friday').toBe(true)
    expect(whyIn(SAT, 'rocky')).toBe(USUAL)
    expect(slotBar('rocky', wsoSeat(FRI))).toBe(USUAL)
    file((DAYS[SAT] as any).dt, 'rocky')
    expect(whyIn(SAT, 'rocky'), 'filed: no note').toBe('')
  })

  it('stays: an ordinary SANS man with nothing filed reads the usual words', () => {
    expect(P('krait').san).toBe(true)
    expect(whyIn(SAT, 'krait')).toBe(USUAL)
  })

  it('stays: ALL AVAIL counts him on Saturday exactly as before — in when planned with us, out when not (D2329)', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    const win: [number, number] = [600, 660]
    expect(availableFor(SAT_ISO, win, DAYS[SAT] as any), 'not planned: another squadron\'s man that day').not.toContain('rocky')
    plan(SAT, 'rocky')
    expect(availableFor(SAT_ISO, win, DAYS[SAT] as any), 'planned with us, free over the window').toContain('rocky')
  })
})

/* (his D2340, 23 Nov 26, narrowing D2338: the line comes when the posting is SAVED, not on its date; his D2342's words) */
const DUE_SAT = { name: 'You\'re SANS from Fri 17 Jul.', day: '', what: 'You\'re planned on Sat 18 Jul with nothing filed. Tap to file for availability.', who: '' }
describe('D2338 (2) — his bell lists the planned days with nothing filed (from the save, D2340)', () => {
  it('on Fri 17 Jul, Sat 18 planned and unfiled: one line to him, naming the day; his date has come, so no date in its title (D2394 over D2340, D90)', () => {
    plan(SAT, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    const ls = sansLines('rocky')
    expect(ls.length).toBe(1)
    expect(noticeWords(ls[0]!)).toEqual({ ...DUE_SAT, name: 'Your SANS availability is needed.' })
  })

  it('on Wed 15 Jul, before the date: the line is there from the save — he may file ahead (D2340, narrowing D2327)', () => {
    plan(SAT, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    const ls = sansLines('rocky')
    expect(ls.length).toBe(1)
    expect(noticeWords(ls[0]!)).toEqual(DUE_SAT)
  })

  it('nothing on an admin\'s own bell — the man himself only', () => {
    plan(SAT, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    const admin = me()!
    expect(admin).toBeTruthy()
    expect(sansLines(admin)).toEqual([])
  })

  it('the line goes once every planned day is filed', () => {
    plan(SAT, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    expect(sansLines('rocky').length).toBe(1)
    file((DAYS[SAT] as any).dt, 'rocky')
    expect(sansLines('rocky')).toEqual([])
  })

  it('a man not planned on any unfiled day gets no line', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    expect(!!P('rocky').san).toBe(true)
    expect(sansLines('rocky')).toEqual([])
  })

  it('several days: named in order, each month once', () => {
    plan(SAT, 'rocky'); plan(FRI, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    expect(noticeWords(sansLines('rocky')[0]!).what).toBe('You\'re planned on Fri 17, Sat 18 Jul with nothing filed. Tap to file for availability.')
  })

  it('a tap opens the SANS calendar at the first of the days, that day open', () => {
    plan(SAT, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    openNotice(sansLines('rocky')[0]!)
    expect(CURPAGE).toBe('inputs')
    expect(INPMODE).toBe('sans')
    expect(CALMONTH).toEqual({ y: 2026, m: 7 })
    expect(SANSDAYASK).toBe(SAT_ISO)
  })
})

/* TAKEN BACK WITH THE POSTING THAT MADE IT (his standing rule — D1693, D1699, D1710; the "off the manpower" line, also worked
   out, the same — D1696): an unread line simply goes. His D2391 narrows D1699 for this line alone: a read one is not struck
   through, it goes, and he gets one plain line saying what changed, unread; the presser is told nothing. Filing, or a day
   leaving, is no take-back: the line only shrinks or goes. */
describe('D2338 (2) — the bell line taken back with its posting', () => {
  /* Hex reads his bell ("Mark all read", his own command), then Saber is signed in again */
  const hexReads = () => { signInAs('hex'); expect(markAllNoticesRead()).toBe(true); signInAs('ad', 'a') }
  const ran = () => { plan(SAT, 'rocky'); expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify(); at(2026, 7, 17); runPoOutcomes(); raptorNotify(); expect(sansLines('rocky').length).toBe(1) }
  /* (a kind not built yet, so read as a plain string) */
  const backOf = (pid: string) => noticesFor(pid).filter(n => String((n.what || [])[0]?.k) === 'sansback').map(n => noticeWords(n))
  /* (his D2391's words; nothing filed, so nothing hidden: the title alone) */
  const TOLD = (name: string) => ({ name, day: '· Saber', what: '', who: '' })
  const UNDONE = TOLD('You\'re no longer posted out as SANS.')

  it('unread, then "Undo post out": the line simply goes', () => {
    ran()
    expect(undoPostOut('rocky')).toBe(true); raptorNotify()
    expect(sansLines('rocky')).toEqual([])
    expect(backOf('rocky')).toEqual([])
  })

  /* (a read line's "taken back" is a STORED line, written by the posting's own take-back — leavewar/sync.ts postingLinesOf,
     retractPostingLines — and passed by the gate as owed by the posting's change: warLinesOwed, state/perms.ts
     WAR_LINE_KINDS) */
  it('read, then "Undo post out": it goes, and one plain line says so, unread (D2391)', () => {
    ran(); hexReads()
    expect(undoPostOut('rocky')).toBe(true); raptorNotify()
    expect(sansLines('rocky')).toEqual([])
    expect(backOf('rocky')).toEqual([UNDONE])
    expect(unreadFor('rocky'), 'unread: his bell lights').toBe(1)
  })

  it('read, then the posting moved later: the line names his new date (D2391)', () => {
    ran(); hexReads()
    expect(postOut('rocky', '2026-07-24', 'sans')).toBe(true); raptorNotify()
    expect(sansLines('rocky')).toEqual([])
    expect(backOf('rocky')).toEqual([TOLD('Your SANS date moved to Fri 24 Jul.')])
  })

  it('read, then the posting given another outcome after it ran: one plain line; Saber, who changed it, told nothing', () => {
    ran(); hexReads()
    expect(postOut('rocky', FRI_ISO, 'none')).toBe(true); raptorNotify()
    expect(sansLines('rocky')).toEqual([])
    expect(backOf('rocky')).toEqual([UNDONE])
    expect(backOf(me()!), 'the admin who changed it gets nothing').toEqual([])
  })

  it('read, taken back, then the same SANS posting made again: the plain line and one new line, unread; a tap on the plain line opens the SANS calendar', () => {
    ran(); hexReads()
    const first = sansLines('rocky')[0]!.id
    expect(undoPostOut('rocky')).toBe(true); raptorNotify()
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify(); runPoOutcomes(); raptorNotify()
    expect(!!P('rocky').san, 'SANS again from Friday').toBe(true)
    expect(backOf('rocky')).toEqual([UNDONE])
    const again = sansLines('rocky')
    expect(again.length).toBe(1)
    expect(again[0]!.id, 'news again: not the id he read').not.toBe(first)
    expect(unreadFor('rocky'), 'the plain line and the new one, both unread').toBe(2)
    const struck = noticesFor('rocky').find(n => String((n.what || [])[0]?.k) === 'sansback')!
    openNotice(struck)
    expect(CURPAGE).toBe('inputs')
    expect(INPMODE).toBe('sans')
    expect(SANSDAYASK).toBe(SAT_ISO)
  })

  it('the permissions check: a struck line no posting take-back wrote is refused, even an admin\'s, even about his own man', () => {
    const n: any = { id: 'forged-sb', to: 'rocky', by: me(), at: Date.now(), iid: '', name: 'Your SANS availability', day: FRI_ISO, what: [{ k: 'sansback', days: [SAT_ISO] }] }
    const env: any = { type: 'inputs.batch', origin: 'user', actor: deriveActor(), changes: [{ collection: 'notices', id: n.id, op: 'put', before: null, after: n }] }
    expect(ownershipViolation(env) ?? 'allowed').toMatch(/a war line no war command wrote/)
  })

  it('read, then every day filed: the line goes, never struck', () => {
    ran(); hexReads()
    file((DAYS[SAT] as any).dt, 'rocky')
    expect(sansLines('rocky')).toEqual([])
    expect(backOf('rocky')).toEqual([])
  })

  /* THE GATE ON THE STRUCK LINE (chat 147's two code reads — the fresh Opus reader's 2, the security read's hole 1): owed only
     by a real take-back of his RUN SANS posting, to him, on its date, its days the live line's, once a man and posting a
     command, and only where he had read the live line. An admin's command shaped as the posting's own take-back (the
     posting taken away), carrying a struck line it was not owed. */
  const takeBackWith = (extra: () => void): boolean => {
    let r: any
    try {
      r = cmdCommit({
        type: 'lw.postout', scope: { module: 'people' }, meta: null,
        apply: (txn: any) => {
          resyncBeforeEnlist(); txn.enlist(schedStore)
          txn.enlist(peopleStore); txn.enlist(settingsStore); txn.enlist(lwStore)
          setPostOut('rocky', null)
          extra()
          validate(); finishPeopleWrite(); schedApplyEnd()
        },
      } as any)
    } catch { return false }
    return !(r && 'ok' in r && r.ok === false)
  }
  it('the gate: read, taken away, one struck line of his days — passes (the control)', () => {
    ran(); hexReads()
    expect(takeBackWith(() => { noticeSansBack('rocky', me(), [SAT_ISO], FRI_ISO) })).toBe(true)
  })
  it('the gate: NOT read, the same line — refused (an unread line simply goes)', () => {
    ran()
    expect(takeBackWith(() => { noticeSansBack('rocky', me(), [SAT_ISO], FRI_ISO) })).toBe(false)
    expect(backOf('rocky')).toEqual([])
  })
  it('the gate: read, a day before the posting\'s date — refused', () => {
    ran(); hexReads()
    expect(takeBackWith(() => { noticeSansBack('rocky', me(), ['2026-07-16'], FRI_ISO) })).toBe(false)
  })
  it('the gate: read, days out of order or repeated — refused', () => {
    ran(); hexReads()
    expect(takeBackWith(() => { noticeSansBack('rocky', me(), ['2026-07-19', SAT_ISO], FRI_ISO) })).toBe(false)
    expect(takeBackWith(() => { noticeSansBack('rocky', me(), [SAT_ISO, SAT_ISO], FRI_ISO) })).toBe(false)
  })
  it('the gate: read, two struck lines in one take-back — refused', () => {
    ran(); hexReads()
    expect(takeBackWith(() => { noticeSansBack('rocky', me(), [SAT_ISO], FRI_ISO); noticeSansBack('rocky', me(), [SAT_ISO], FRI_ISO) })).toBe(false)
  })
  it('the gate: a posting not yet run, read nothing, taken away with a struck line — refused (nothing was shown)', () => {
    plan(SAT, 'rocky'); expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(takeBackWith(() => { noticeSansBack('rocky', me(), [SAT_ISO], FRI_ISO) })).toBe(false)
  })
  /* a stored "Planned, no availability filed" line is never the app's (the security read's hole 2): refused even where the
     command takes the posting back for real */
  it('the gate: a STORED SANS-days line, even inside a real take-back — refused', () => {
    ran(); hexReads()
    expect(takeBackWith(() => {
      NOTICES.push({ id: 'stored-sd', to: 'rocky', by: null, at: Date.now(), iid: '', name: 'Your SANS availability', day: SAT_ISO, what: [{ k: 'sansdue', days: [SAT_ISO] }] } as any)
    })).toBe(false)
  })
})

/* THE OPUS READER'S MISSING TESTS (chat 147's fix round) */
describe('D2338 — the cases the fresh Opus reader found untested', () => {
  afterEach(() => { if (String(CURWEEK) !== '13/07/2026') loadWeek('13/07/2026') })

  it('a planned day in a SAVED week not loaded is named too (Mon 20 Jul, next week)', () => {
    plan(SAT, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    loadWeek('20/07/2026'); plan(0, 'rocky'); loadWeek('13/07/2026')
    expect(String(CURWEEK)).toBe('13/07/2026')
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    const l = sansLines('rocky')
    expect(l.length).toBe(1)
    const days = (l[0]!.what[0] as any).days as string[]
    expect(days[0]).toBe(SAT_ISO)
    expect(days, 'the day planned in the saved week, not loaded').toContain('2026-07-20')
  })

  it('archived by hand after the line showed: the line goes, never struck — and the archive owes no struck line', () => {
    plan(SAT, 'rocky'); expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    signInAs('hex'); expect(markAllNoticesRead()).toBe(true); signInAs('ad', 'a')
    expect(sansLines('rocky').length).toBe(1)
    const n0 = commandStream().length
    expect(archivePerson('rocky').bad).toBeNull(); raptorNotify()
    const archEnv: any = commandStream().slice(n0).find((e: any) => e.type === 'person.archive')
    expect(archEnv, 'the archive ran as one command').toBeTruthy()
    /* (the archive rewrites his posting record — its own outcome — but keeps its run mark: no take-back of the posting) */
    const po = archEnv.changes.find((c: any) => c.collection === 'lw.postouts' && c.id === 'rocky')
    expect(po && [po.before.poOutcome, po.after.poOutcome, po.after.poDone]).toEqual(['sans', 'overseas', FRI_ISO])
    expect(warLinesOwed(archEnv.changes).filter(o => o.k === 'sansback')).toEqual([])
    expect(sansLines('rocky')).toEqual([])
    expect(noticesFor('rocky').filter(n => String((n.what || [])[0]?.k) === 'sansback')).toEqual([])
    /* …and restored with a post-in date: no struck line owed by the restore either */
    const n1 = commandStream().length
    expect(restoreArchivedPerson('rocky', '2026-07-20')).toBe(true); raptorNotify()
    const resEnv: any = commandStream().slice(n1).find((e: any) => e.type === 'person.restore')
    expect(resEnv, 'the restore ran as one command').toBeTruthy()
    expect(warLinesOwed(resEnv.changes).filter(o => o.k === 'sansback')).toEqual([])
    expect(noticesFor('rocky').filter(n => String((n.what || [])[0]?.k) === 'sansback')).toEqual([])
  })

  it('the posting\'s date is today but its pass has not run yet: still the look-ahead words, the line from the save; once it runs, the usual words and the same line', () => {
    plan(SAT, 'rocky'); expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    at(2026, 7, 17)
    expect(!!P('rocky').san, 'not SANS until the pass runs').toBe(false)
    expect(whyIn(SAT, 'rocky')).toBe(LOOK)
    const before = sansLines('rocky')
    expect(before.length, 'the line from the save (D2340)').toBe(1)
    runPoOutcomes(); raptorNotify()
    expect(whyIn(SAT, 'rocky')).toBe(USUAL)
    const after = sansLines('rocky')
    expect(after.length).toBe(1)
    expect(after[0]!.id, 'the same line, not news again').toBe(before[0]!.id)
  })
})
