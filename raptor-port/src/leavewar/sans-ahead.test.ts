/* SANS AVAILABILITY FILED AHEAD, AND HIDDEN ON A DAY THAT STOPS BEING SANS (owner D2340, D2341, D2342 — 23 Nov 26).
   D2340: "a SANS man may file SANS availability ahead, as soon as his SANS posting is saved, for days from its date (narrows
   D2327: filing goes by the day filed)"; the crew-list note before the date: "SANS from Fri 17 Jul: no availability filed.
   File it on the Inputs page's SANS tab."; his bell line comes when the posting is saved: "You're SANS from Fri 17 Jul.
   You're planned on Sat 18, Mon 20 Jul with nothing filed. Tap to file." (D2342: the old wording was not clear).
   D2341: "show like it's deleted … But counts again if it's undone" — SANS availability shows and counts only on a day he is
   SANS; on a day that stops being SANS it is hidden everywhere, and comes back by itself once the day is SANS again; the
   posting's take-back tells him "Your SANS availability for Sat 18 Jul is hidden while you're not SANS that day."
   Each case failed before the build. The fixture is sans-unfiled.test.ts's: the demo week of Mon 13 Jul 26, today
   Wed 15 Jul; `rocky` is Hex, a WSO (sign-in "hex"); Saber the admin ("ad"). */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { HOOKS, storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS, sansAvailOn, inputsOn } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { afterSchedMutate } from '../state/view'
import { sansAvailHTML } from '../ui/palette-html'
import { NOTICES, noticesFor, noticeWords, noticeSansBack, type Notice } from '../state/notices'
import { commit as cmdCommit } from '../command'
import { schedStore, resyncBeforeEnlist, schedApplyEnd } from '../state/sched-commit'
import { peopleStore, settingsStore, finishPeopleWrite } from '../state/people-settings-commit'
import { validate } from '../engine/validate'
import { markAllNoticesRead, unreadFor } from '../state/noticeseen'
import { me } from '../state/perms'
import { commitNewInput, sansRefusal } from '../ui/inputedit'
import { pickRoster } from '../ui/peoplepick-model'
import { maySansAdd } from '../ui/sansadd'
import { sansDayGroups } from '../ui/sanscal-model'
import { initStore as lwInitStore, setPeople, setPostOut, lwStore } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, runPoOutcomes, undoPostOut, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const P = (id: string): any => (PEOPLE as any)[id]
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const FRI = 4, SAT = 5, FRI_ISO = '2026-07-17', SAT_ISO = '2026-07-18'
const at = (y: number, m: number, d: number) => vi.setSystemTime(new Date(y, m - 1, d, 9, 0, 0))
const LOOK = 'SANS from Fri 17 Jul: no availability filed. File it on the Inputs page\'s SANS tab.'
const whyIn = (di: number, id: string): string | null => {
  const html = sansAvailHTML(di, '', new Set(), new Set(), new Map(), null)
  const m = new RegExp(`<span class="rpuck[^"]*"[^>]*data-person="${id}"([^>]*)>`).exec(html)
  if (!m) return null
  const w = /data-why="([^"]*)"/.exec(m[1]!)
  return w ? w[1]!.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&') : ''
}
const plan = (di: number, id: string) => { (DAYS[di] as any).ground.push({ prog: 'BRIEFING', str: '1600', end: '1700', who: id }); afterSchedMutate() }
const dt = (di: number): string => String((DAYS[di] as any).dt)
/* his SANS availability filed through the app's one save path — the door every editor's commit passes (sansRefusal) */
const toasts: string[] = []
const fileVia = (person: string, start: string, end?: string): boolean =>
  commitNewInput({ _new: true, person, type: 'SANS Availability', start, ...(end ? { end } : {}), allday: true, s: 360, e: 1080, sans: { f: true } })
const dueLines = (pid: string): Notice[] => noticesFor(pid).filter(n => (n.what || [])[0]?.k === 'sansdue')
const backLines = (pid: string): Notice[] => noticesFor(pid).filter(n => String((n.what || [])[0]?.k) === 'sansback')
const hexReads = () => { signInAs('hex'); expect(markAllNoticesRead()).toBe(true); signInAs('ad', 'a') }
const realToast = HOOKS.toast

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
  toasts.length = 0
  HOOKS.toast = (m: any) => { toasts.push(String(m)) }
})
afterEach(() => { HOOKS.toast = realToast; resetSession(null); vi.restoreAllMocks() })

describe('D2340 — filed ahead, from the moment his SANS posting is saved', () => {
  it('the crew-list note before the date names where to file it, in his words', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(whyIn(SAT, 'rocky')).toBe(LOOK)
  })

  it('on Wed 15 Jul an admin files Hex\'s Sat 18 Jul — accepted, it counts, and the note goes', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(fileVia('rocky', SAT_ISO), toasts.join(' | ')).toBe(true)
    expect(sansAvailOn('rocky', dt(SAT))).toBeTruthy()
    expect(whyIn(SAT, 'rocky'), 'filed: no note').toBe('')
  })

  it('on Wed 15 Jul Hex files his own Sat 18 Jul — the SANS calendar\'s add is open to him', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    signInAs('hex')
    expect(maySansAdd(), 'his own add, before his date').toBe(true)
    expect(fileVia('rocky', SAT_ISO), toasts.join(' | ')).toBe(true)
  })

  it('a day before his date is refused, saying from when he can be filed for; a run reaching back saves from his date (D2388)', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(fileVia('rocky', '2026-07-16')).toBe(false)
    expect(toasts.pop()).toBe('Hex is SANS from Fri 17 Jul: file SANS availability for days from then')
    expect(sansRefusal('rocky', { f: true }, FRI_ISO, SAT_ISO), 'from his date on: fine').toBe('')
    expect(fileVia('rocky', '2026-07-16', SAT_ISO), toasts.join(' | ')).toBe(true)
    expect(toasts.pop()).toBe('Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Hex is SANS from Fri 17 Jul.')
  })

  it('stays: a man who is not SANS at all, and has no SANS posting, is refused as before', () => {
    expect(sansRefusal('ranger', { f: true }, SAT_ISO)).toBe('SANS Availability is for SANS aircrew only')
  })

  it('the people lists offer him on a day from his date, not before it', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(pickRoster(true, undefined, SAT_ISO)).toContain('rocky')
    expect(pickRoster(true, undefined, '2026-07-16')).not.toContain('rocky')
  })

  it('his bell line comes when the posting is saved — one plain sentence (D2342)', () => {
    plan(SAT, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    const l = dueLines('rocky')
    expect(l.length).toBe(1)
    expect(noticeWords(l[0]!)).toEqual({ name: 'You\'re SANS from Fri 17 Jul.', day: '', what: 'You\'re planned on Sat 18 Jul with nothing filed. Tap to file for availability.', who: '' })
    expect(unreadFor('rocky'), 'his bell lights').toBe(1)
  })

  it('several days: "Sat 18, Mon 20 Jul" — past three, "and 2 more"', () => {
    plan(FRI, 'rocky'); plan(SAT, 'rocky'); plan(6, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    const days = (dueLines('rocky')[0]!.what[0] as any).days as string[]
    expect(days).toEqual([FRI_ISO, SAT_ISO, '2026-07-19'])
    expect(noticeWords(dueLines('rocky')[0]!).what).toBe('You\'re planned on Fri 17, Sat 18, Sun 19 Jul with nothing filed. Tap to file for availability.')
    const five: Notice = { ...dueLines('rocky')[0]!, what: [{ k: 'sansdue', days: [FRI_ISO, SAT_ISO, '2026-07-19', '2026-07-20', '2026-07-21'], from: FRI_ISO }] }
    expect(noticeWords(five).what).toBe('You\'re planned on Fri 17, Sat 18, Sun 19 Jul and 2 more with nothing filed. Tap to file for availability.')
  })

  it('read, then filed ahead: it shrinks and goes; read stays read once the posting runs', () => {
    plan(SAT, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    hexReads()
    expect(unreadFor('rocky')).toBe(0)
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    expect(dueLines('rocky').length, 'the same line after the date').toBe(1)
    expect(unreadFor('rocky'), 'still read').toBe(0)
    expect(fileVia('rocky', SAT_ISO), toasts.join(' | ')).toBe(true)
    expect(dueLines('rocky')).toEqual([])
  })
})

describe('D2341 — hidden on a day that stops being SANS, back once it is SANS again', () => {
  const filedAhead = () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(fileVia('rocky', SAT_ISO), toasts.join(' | ')).toBe(true)
    expect(sansAvailOn('rocky', dt(SAT))).toBeTruthy()
  }

  it('the posting moved to Fri 24 Jul: Sat 18 is hidden — not deleted — and comes back when it moves back', () => {
    filedAhead()
    const n = INPUTS.length
    expect(postOut('rocky', '2026-07-24', 'sans')).toBe(true); raptorNotify()
    expect(INPUTS.length, 'nothing deleted').toBe(n)
    expect(sansAvailOn('rocky', dt(SAT)), 'it no longer counts').toBeNull()
    expect(inputsOn(dt(SAT)).some((r: any) => r.person === 'rocky' && r.type === 'SANS Availability'), 'the day does not show it').toBe(false)
    expect((g => [...g.out, ...g.p, ...g.w, ...g.other])(sansDayGroups(SAT_ISO)).some(e => e.id === 'rocky'), 'the SANS calendar does not list it').toBe(false)
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(sansAvailOn('rocky', dt(SAT)), 'back, counting, nothing re-filed').toBeTruthy()
  })

  it('the take-back tells him — even with no live line to strike (every day was filed)', () => {
    filedAhead()
    expect(postOut('rocky', '2026-07-24', 'sans')).toBe(true); raptorNotify()
    const b = backLines('rocky')
    expect(b.length).toBe(1)
    expect(noticeWords(b[0]!)).toEqual({ name: 'Your SANS date moved to Fri 24 Jul.', day: '· Saber', what: 'You\'re active until then, so the SANS availability you filed for Sat 18 Jul is hidden. It comes back if you\'re SANS that day again.', who: '' })
    expect(unreadFor('rocky')).toBeGreaterThanOrEqual(1)
  })

  it('"Undo post out" after it ran: hidden, and told; the same posting made again brings it back', () => {
    filedAhead()
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    expect(!!P('rocky').san).toBe(true)
    expect(undoPostOut('rocky')).toBe(true); raptorNotify()
    expect(sansAvailOn('rocky', dt(SAT))).toBeNull()
    expect(noticeWords(backLines('rocky')[0]!).what).toBe('You\'re active again, so the SANS availability you filed for Sat 18 Jul is hidden. It comes back if you\'re SANS that day again.')
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify(); runPoOutcomes(); raptorNotify()
    expect(sansAvailOn('rocky', dt(SAT))).toBeTruthy()
  })

  it('read his live line, then moved: ONE line — what changed, then what was hidden (D2391: nothing struck)', () => {
    plan(SAT, 'rocky'); plan(6, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(fileVia('rocky', '2026-07-19'), toasts.join(' | ')).toBe(true)                 // Sun 19 filed; Sat 18 still owed
    hexReads()
    expect(postOut('rocky', '2026-07-24', 'sans')).toBe(true); raptorNotify()
    const b = backLines('rocky')
    expect(b.length).toBe(1)
    expect(noticeWords(b[0]!)).toEqual({ name: 'Your SANS date moved to Fri 24 Jul.', day: '· Saber', who: '',
      what: 'You\'re active until then, so the SANS availability you filed for Sun 19 Jul is hidden. It comes back if you\'re SANS that day again.' })
  })

  it('moved EARLIER: nothing hidden, so an unread line simply goes and nothing is told', () => {
    filedAhead()
    expect(postOut('rocky', '2026-07-16', 'sans')).toBe(true); raptorNotify()
    expect(sansAvailOn('rocky', dt(SAT))).toBeTruthy()
    expect(backLines('rocky')).toEqual([])
  })

  /* THE GATE: the hidden days on a stored line are exactly the days this command hid, today on */
  const takeBackWith = (extra: () => void, to: string | null = null): boolean => {
    let r: any
    try {
      r = cmdCommit({
        type: 'lw.postout', scope: { module: 'people' }, meta: null,
        apply: (txn: any) => {
          resyncBeforeEnlist(); txn.enlist(schedStore)
          txn.enlist(peopleStore); txn.enlist(settingsStore); txn.enlist(lwStore)
          setPostOut('rocky', to, 'sans')
          extra()
          validate(); finishPeopleWrite(); schedApplyEnd()
        },
      } as any)
    } catch { return false }
    return !(r && 'ok' in r && r.ok === false)
  }
  it('the gate: a hidden-days line naming exactly the day hidden — passes (the control)', () => {
    filedAhead()
    expect(takeBackWith(() => { noticeSansBack('rocky', me(), [], FRI_ISO, Date.now(), [SAT_ISO]) }, '2026-07-23')).toBe(true)
  })
  it('the gate: a hidden-days line naming a day not hidden — refused', () => {
    filedAhead()
    expect(takeBackWith(() => { noticeSansBack('rocky', me(), [], FRI_ISO, Date.now(), ['2026-07-25']) }, '2026-07-23')).toBe(false)
  })
  it('the gate: a hidden-days line where the change hid nothing — refused', () => {
    filedAhead()
    expect(takeBackWith(() => { noticeSansBack('rocky', me(), [], FRI_ISO, Date.now(), [SAT_ISO]) }, '2026-07-15')).toBe(false)
  })
  it('the gate: an empty line, nothing struck and nothing hidden — refused', () => {
    filedAhead()
    expect(takeBackWith(() => { noticeSansBack('rocky', me(), [], FRI_ISO, Date.now(), []) }, '2026-07-23')).toBe(false)
  })
})
