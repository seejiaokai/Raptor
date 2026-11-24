/* THE SANS WORDS AND RULES OF 23-24 NOV 26 (his D2388, D2390, D2391, D2394, D2421; the drawings
   docs/mock/2026-11-24-sans-words/). Each case failed before the build. The fixture is sans-ahead.test.ts's: the demo week
   of Mon 13 Jul 26, today Wed 15 Jul; `rocky` is Hex, a WSO (sign-in "hex"); Saber the admin ("ad"). */
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
import { sansBackOwed, sansTakeBack } from './sansunfiled'
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

describe('D2388 — a run that starts too early saves from his date, and says why', () => {
  it('Hex files Thu 16 - Sat 18 himself: Fri 17 - Sat 18 saved as one filing, in his own words', () => {
    posted(); signInAs('hex')
    expect(commitNewInput(draft(THU, SAT))).toBe(true)
    expect(mine().length).toBe(1)
    expect((mine()[0] as any).date).toBe('Jul 17')
    expect((mine()[0] as any).endDate).toBe('Jul 18')
    expect(toasts).toEqual(['Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you\'re SANS from Fri 17 Jul.'])
  })
  it('Saber files it for him: the same days, naming him', () => {
    posted()
    expect(commitNewInput(draft(THU, SAT))).toBe(true)
    expect((mine()[0] as any).date).toBe('Jul 17')
    expect(toasts).toEqual(['Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Hex is SANS from Fri 17 Jul.'])
  })
  it('two days left out are said as one run, and "were" (D2441)', () => {
    posted()
    expect(commitNewInput(draft(WED, SAT))).toBe(true)
    expect(toasts).toEqual(['Saved Fri 17 – Sat 18 Jul. Wed 15 – Thu 16 Jul were left out because Hex is SANS from Fri 17 Jul.'])
  })
  it('four days left out, in his own words: one run (D2441)', () => {
    posted(); signInAs('hex')
    expect(commitNewInput(draft('2026-07-13', SAT))).toBe(true)
    expect(toasts).toEqual(['Saved Fri 17 – Sat 18 Jul. Mon 13 – Thu 16 Jul were left out because you\'re SANS from Fri 17 Jul.'])
  })
  it('a run left out across a month end names both months (D2441)', () => {
    posted('2026-08-02')
    expect(commitNewInput(draft('2026-07-30', '2026-08-03'))).toBe(true)
    expect(toasts).toEqual(['Saved Sun 2 – Mon 3 Aug. Thu 30 Jul – Sat 1 Aug were left out because Hex is SANS from Sun 2 Aug.'])
  })
  it('the days left out are always one unbroken run, up to the day before his date', () => {
    posted()
    expect(sansRunTrim('rocky', '2026-07-13', SAT)).toEqual({ from: FRI, left: ['2026-07-13', '2026-07-14', WED, THU] })
  })
  it('one day left after the cut is said as one day', () => {
    posted()
    expect(commitNewInput(draft(THU, FRI))).toBe(true)
    expect((mine()[0] as any).endDate).toBeUndefined()
    expect(toasts).toEqual(['Saved Fri 17 Jul. Thu 16 Jul was left out because Hex is SANS from Fri 17 Jul.'])
  })
  it('the window\'s several-people path, with one man picked, saves the same', () => {
    posted()
    expect(commitInput(null, draft(THU, SAT), ['rocky'])).toBe(true)
    expect((mine()[0] as any).date).toBe('Jul 17')
    expect(toasts).toEqual(['Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Hex is SANS from Fri 17 Jul.'])
  })
  it('an edit in the window stretched back before his date saves from his date', () => {
    posted()
    expect(commitNewInput(draft(FRI, SAT))).toBe(true); toasts.length = 0
    const rec: any = mine()[0]
    expect(commitInputEdit(rec, { ...draftOf(rec), start: THU, end: SAT })).toBe(true)
    expect(rec.date).toBe('Jul 17')
    expect(toasts).toEqual(['Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Hex is SANS from Fri 17 Jul.'])
  })
  it('the drag door opens the window for him on the run he picked, either way round', () => {
    posted(); signInAs('hex')
    expect(openSansAdd(THU, SAT)).toBe(true)
    expect(INPEDIT?.person).toBe('rocky')
    setInpEdit(null)
    expect(openSansAdd(SAT, THU)).toBe(true)
    expect(INPEDIT?.person).toBe('rocky')
  })
  it('the window\'s people list offers him for a run that reaches his date, and not for one that does not', () => {
    posted()
    const offers = (d: any) => offersFor(null, d, [], false)
    expect(pickRoster(true, undefined, THU, offers(draft(THU, SAT)))).toContain('rocky')
    expect(pickRoster(true, undefined, WED, offers(draft(WED, THU)))).not.toContain('rocky')
  })
  it('the app\'s note stands alone: the window\'s "Input added" is not joined to it', () => {
    posted(); HOOKS.toast = toast
    toastBatch(() => { expect(commitNewInput(draft(THU, SAT))).toBe(true); HOOKS.toast('Input added', 'ok') })
    expect(document.getElementById('toastEl')?.textContent).toBe('Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Hex is SANS from Fri 17 Jul.')
  })
  it('stays: a run with no SANS day is refused, nothing saved', () => {
    posted()
    expect(commitNewInput(draft(WED, THU))).toBe(false)
    expect(mine()).toEqual([])
    expect(toasts).toEqual(['Hex is SANS from Fri 17 Jul: file SANS availability for days from then'])
  })
  it('stays: a run with a non-SANS day in its middle is refused, never split', () => {
    const hex: any = (PEOPLE as any).rocky
    hex.san = true; hex.sanFrom = MON20; hex.sanWas = [[THU, SAT]]
    expect(commitNewInput(draft(WED, MON20))).toBe(false)
    expect(mine()).toEqual([])
  })
})

describe('D2390, D2394 2b — the reminder', () => {
  it('a posted man: his date, then the days, ending "Tap to file for availability."', () => {
    plan(SATI); posted()
    expect(noticeWords(due()[0]!)).toEqual({ name: 'You\'re SANS from Fri 17 Jul.', day: '', what: 'You\'re planned on Sat 18 Jul with nothing filed. Tap to file for availability.', who: '' })
  })
  it('a man ticked SANS on Quals, with no posting, gets it too, under "Your SANS availability is needed."', () => {
    plan(SATI)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    const l = due()
    expect(l.length).toBe(1)
    /* (Hex is on the demo's Wed 15 and Thu 16 too; a tick counts from the day it is made) */
    expect(noticeWords(l[0]!)).toEqual({ name: 'Your SANS availability is needed.', day: '', what: 'You\'re planned on Wed 15, Thu 16, Sat 18 Jul with nothing filed. Tap to file for availability.', who: '' })
  })
  it('stays: a man not SANS, planned, gets none', () => {
    plan(SATI)
    expect(due()).toEqual([])
  })
})

describe('D2394 2a — a newly planned day lights his bell again', () => {
  it('read, then a new day planned: unread, the same one line naming both days', () => {
    plan(SATI); posted(); hexReads()
    expect(unreadFor('rocky')).toBe(0)
    plan(SUNI)
    expect(due().length).toBe(1)
    expect(noticeWords(due()[0]!).what).toContain('Sat 18, Sun 19 Jul')
    expect(unreadFor('rocky')).toBe(1)
  })
  it('read, then a day drops off: the bell stays dark', () => {
    plan(SATI); plan(SUNI); posted(); hexReads()
    expect(commitNewInput(draft(SAT))).toBe(true); raptorNotify()
    expect(noticeWords(due()[0]!).what).toContain('Sun 19 Jul')
    expect(dueUnread()).toBe(0)
  })
  it('read, a day drops off and a new one comes: lit again', () => {
    plan(SATI); posted(); hexReads()
    expect(commitNewInput(draft(SAT))).toBe(true); raptorNotify()
    plan(SUNI)
    expect(dueUnread()).toBe(1)
  })
})

describe('D2391 — the take-back lines say plainly what changed', () => {
  const filed = (from = FRI, to = SAT) => { posted(); expect(commitNewInput(draft(from, to))).toBe(true); toasts.length = 0 }
  it('A, his date moved later', () => {
    filed(FRI, FRI)
    expect(postOut('rocky', SAT, 'sans')).toBe(true); raptorNotify()
    expect(backs().length).toBe(1)
    expect(noticeWords(backs()[0]!)).toEqual({ name: 'Your SANS date moved to Sat 18 Jul.', day: '· Saber', who: '',
      what: 'You\'re active until then, so the SANS availability you filed for Fri 17 Jul is hidden. It comes back if you\'re SANS that day again.' })
  })
  it('B, the posting undone', () => {
    filed()
    expect(undoPostOut('rocky')).toBe(true); raptorNotify()
    expect(noticeWords(backs()[0]!)).toEqual({ name: 'You\'re no longer posted out as SANS.', day: '· Saber', who: '',
      what: 'You\'re active again, so the SANS availability you filed for Fri 17, Sat 18 Jul is hidden. It comes back if you\'re SANS those days again.' })
  })
  it('C, Saber unticks SANS on Quals (a new line)', () => {
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(commitNewInput(draft(FRI, SAT))).toBe(true); toasts.length = 0
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(backs().length).toBe(1)
    expect(noticeWords(backs()[0]!)).toEqual({ name: 'You\'re no longer SANS.', day: '· Saber', who: '',
      what: 'You\'re active again, so the SANS availability you filed for Fri 17, Sat 18 Jul is hidden. It comes back if you\'re SANS those days again.' })
    expect(backs(me()!), 'the admin who pressed gets nothing').toEqual([])
  })
  it('C: his own untick tells him nothing', () => {
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(commitNewInput(draft(FRI, SAT))).toBe(true)
    signInAs('hex')
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(backs()).toEqual([])
  })
  it('C: Saber\'s Undo takes the line back: unread, it simply goes', () => {
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(commitNewInput(draft(FRI, SAT))).toBe(true)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(backs().length).toBe(1)
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(backs()).toEqual([])
  })
  it('C: Saber\'s Undo of a line Hex has read: struck through, "taken back · Saber", unread', () => {
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(commitNewInput(draft(FRI, SAT))).toBe(true)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    /* (Hex reads it on his own device: a sign-in here would end Saber's Undo list, D148) */
    mem['sqn142_noticeseen:rocky'] = JSON.stringify({ upto: 0, ids: backs().map(n => n.id) }); noticeSeenLoad()
    expect(globalUndo().ok).toBe(true); raptorNotify()
    const b = backs()
    expect(b.length).toBe(1)
    expect(noticeWords(b[0]!)).toEqual({ name: 'You\'re no longer SANS.', nameStruck: true, day: '', what: 'taken back', who: 'Saber' })
    /* (this line itself: Saber's filing and untick brought Hex lines of their own, which he has not read here) */
    expect(isUnread(b[0]!, 'rocky')).toBe(true)
  })
  it('D, his date moved earlier, the reminder read: the title alone, and the live reminder stays', () => {
    plan(SATI); posted(); hexReads()
    expect(postOut('rocky', THU, 'sans')).toBe(true); raptorNotify()
    expect(noticeWords(backs()[0]!)).toEqual({ name: 'Your SANS date moved to Thu 16 Jul.', day: '· Saber', what: '', who: '' })
    expect(due().length).toBe(1)
    expect(noticeWords(due()[0]!).name).toBe('You\'re SANS from Thu 16 Jul.')
  })
  it('E, another outcome', () => {
    filed()
    expect(postOut('rocky', FRI, 'none')).toBe(true); raptorNotify()
    expect(noticeWords(backs()[0]!)).toEqual({ name: 'You\'re no longer posted out as SANS.', day: '· Saber', who: '',
      what: 'The SANS availability you filed for Fri 17, Sat 18 Jul is hidden while you\'re not SANS those days.' })
  })
  it('read the reminder, nothing filed, the posting undone: the title alone, not "taken back"', () => {
    plan(SATI); posted(); hexReads()
    expect(undoPostOut('rocky')).toBe(true); raptorNotify()
    const w = noticeWords(backs()[0]!)
    expect(w).toEqual({ name: 'You\'re no longer posted out as SANS.', day: '· Saber', what: '', who: '' })
    expect(w.nameStruck).toBeUndefined()
  })
  it('read, a day planned since, another line tapped, his date moved: he is still told', () => {
    plan(SATI); posted(); hexReads()
    expect(commitNewInput(draft(MON20))).toBe(true); plan(SUNI)
    signInAs('hex')
    const other = noticesFor('rocky').find(n => kind(n) !== 'sansdue' && isUnread(n, 'rocky'))!
    expect(markNoticeRead(other.id)).toBe(true)
    signInAs('ad', 'a')
    expect(postOut('rocky', MON20, 'sans')).toBe(true); raptorNotify()
    expect(noticeWords(backs()[0]!)).toEqual({ name: 'Your SANS date moved to Mon 20 Jul.', day: '· Saber', what: '', who: '' })
  })
  it('nothing filed and nothing read: no line', () => {
    plan(SATI); posted()
    expect(undoPostOut('rocky')).toBe(true); raptorNotify()
    expect(backs()).toEqual([])
  })
})

describe('D2394 Q6 — a "hidden" sentence goes once it is untrue', () => {
  it('put back: the line goes whole, and no longer counts as unread', () => {
    posted(); expect(commitNewInput(draft(SAT))).toBe(true)
    hexReads()
    expect(postOut('rocky', FRI24, 'sans')).toBe(true); raptorNotify()
    expect(backs().length).toBe(1)
    expect(unreadFor('rocky')).toBe(1)
    expect(postOut('rocky', FRI, 'sans')).toBe(true); raptorNotify()
    expect(backs()).toEqual([])
    expect(unreadFor('rocky')).toBe(0)
  })
  it('one of two hidden days is SANS again: the sentence names only the other', () => {
    posted(); expect(commitNewInput(draft(FRI, SAT))).toBe(true)
    expect(postOut('rocky', FRI24, 'sans')).toBe(true); raptorNotify()
    expect(noticeWords(backs()[0]!).what).toContain('Fri 17, Sat 18 Jul')
    expect(postOut('rocky', SAT, 'sans')).toBe(true); raptorNotify()
    /* (one line, the latest change's title: the coordinator's reading 3) */
    expect(backs().length).toBe(1)
    expect(noticeWords(backs()[0]!).name).toBe('Your SANS date moved to Sat 18 Jul.')
    expect(noticeWords(backs()[0]!).what).toBe('You\'re active until then, so the SANS availability you filed for Fri 17 Jul is hidden. It comes back if you\'re SANS that day again.')
  })
})

describe('D2394 Q10 — a shared offer\'s refusal says what to do', () => {
  it('a day one man of a shared offer is not SANS on is refused in the new words', () => {
    posted(FRI24); expect(postOut('bane', FRI, 'sans')).toBe(true); raptorNotify()
    const rid = 'bane'
    expect(commitNewInput(draft(SAT, undefined, rid))).toBe(true)
    const rec: any = INPUTS.find((r: any) => r.type === 'SANS Availability' && idsOf(r).map(String).includes(rid))
    rec.people.push({ p: 'rocky' })
    toasts.length = 0
    expect(commitInput(rec, { ...draftOf(rec), end: SUN }, [rid, 'rocky'])).toBe(false)
    expect(toasts).toEqual(['Hex is SANS from Fri 24 Jul. Take him out of this offer to add earlier days.'])
  })
  it('a new shared offer is never trimmed: refused whole, in the same words', () => {
    posted(FRI24); expect(postOut('bane', FRI, 'sans')).toBe(true); raptorNotify()
    expect(commitInput(null, draft(SAT, FRI24), ['bane', 'rocky'])).toBe(false)
    expect(toasts).toEqual(['Hex is SANS from Fri 24 Jul. Take him out of this offer to add earlier days.'])
  })
  it('stays: a one-man filing of one early day keeps today\'s words', () => {
    posted(FRI24)
    expect(commitNewInput(draft(SAT))).toBe(false)
    expect(toasts).toEqual(['Hex is SANS from Fri 24 Jul: file SANS availability for days from then'])
  })
})

describe('D2394 Q4, D2421 — the greyed "+ Commitment" words', () => {
  it('his own day before his SANS date: "You\'re SANS from Fri 17 Jul."', () => {
    posted(); signInAs('hex')
    render(<SansDay iso={THU} hi={null} onClose={() => {}} />)
    expect(screen.getByTestId('sd-addwhy').textContent).toBe('You\'re SANS from Fri 17 Jul.')
  })
  it('stays: a member who is not SANS keeps the words', () => {
    signInAs('hex')
    render(<SansDay iso={THU} hi={null} onClose={() => {}} />)
    expect(screen.getByTestId('sd-addwhy').textContent).toBe('SANS aircrew add their availability here.')
  })
  it('stays: an admin\'s button is never grey, so no words', () => {
    posted()
    render(<SansDay iso={THU} hi={null} onClose={() => {}} />)
    expect(screen.queryByTestId('sd-addwhy')).toBeNull()
  })
})

/* THE COORDINATOR'S FIVE READINGS OF WHAT THE RULINGS LEAVE OPEN (24 Nov 26), to be put to him; and what the independent
   scenario design asks to hold */
/* READING 1 IS REPLACED BY HIS OWN RULING (D2560, 24 Nov 26 — later, so it wins, D90): the reading was "newly planned: he
   was put on the programme that day", kept by a hidden mark on each day; his ruling takes the mark away and says the
   reminder, once read, lights again only for A DAY NOT IN IT WHEN HE READ IT. So what is asked of a day is no longer how
   it came into the line but whether he has seen it there. Each case below is kept; four change their answer, each saying
   which way and why. */
describe('reading 1, as D2560 replaced it — lit only by a day not in the reminder when he read it', () => {
  const unplan = (di: number, id = 'rocky') => { (DAYS[di] as any).ground = (DAYS[di] as any).ground.filter((g: any) => g.who !== id); afterSchedMutate() }
  const dueDays = () => (due()[0]!.what[0] as any).days as string[]
  /* (was dark: the day had been planned before he read. He read a line that named Sun 19 alone — Sat 18 was filed — so
     Sat 18 is a day he has not seen in it: lit, by D2560's words. A filing deleted that brings back a day he DID see stays
     dark: sans-reads-156 test 3, sans-reads-r3) */
  it('a filing deleted brings into the line a day he never saw there: lit', () => {
    plan(SATI); plan(SUNI); posted()
    expect(commitNewInput(draft(SAT))).toBe(true); hexReads()
    removeInput(mine()[0]); raptorNotify()
    expect(dueDays()).toEqual([SAT, SUN])
    expect(dueUnread()).toBe(1)
  })
  /* (was dark, for want of a mark — he was planned while the day was filed. It is a day he has not seen: lit) */
  it('the same when he was planned on that day after reading, while it was filed: lit', () => {
    plan(SUNI); posted(); hexReads()
    expect(commitNewInput(draft(SAT))).toBe(true); plan(SATI)
    removeInput(mine()[0]); raptorNotify()
    expect(dueDays()).toEqual([SAT, SUN])
    expect(dueUnread()).toBe(1)
  })
  it('one day replaced by another at the same count: lit', () => {
    plan(SATI); posted(); hexReads()
    unplan(SATI); expect(due()).toEqual([])
    plan(SUNI)
    expect(dueDays()).toEqual([SUN])
    expect(dueUnread()).toBe(1)
  })
  it('a second engagement on a day already listed: dark', () => {
    plan(SATI); posted(); hexReads()
    plan(SATI)
    expect(dueUnread()).toBe(0)
  })
  /* (was lit: D2560's own case — "a day he already saw, taken off and put back, does not relight it") */
  it('a day that dropped off and is planned again: he saw it — stays read, and the line lists it', () => {
    plan(SATI); posted(); hexReads()
    unplan(SATI); plan(SATI)
    expect(dueDays()).toEqual([SAT])
    expect(dueUnread()).toBe(0)
  })
  /* (was dark both ways, by the mark. The line's days are those of the weeks the app holds — the week on screen and the
     saved weeks — so a week brought on screen brings its days into the line: days he has not seen light it while they are
     in it, and it is read again once they leave. Told to the host as found, not fixed: the days following the week on
     screen is older than this job) */
  it('loading another week that names him on days he never saw: lit while they are in the line, read again once they leave', () => {
    plan(SATI); posted(); hexReads()
    try {
      loadWeek('20/07/2026'); raptorNotify()
      expect(dueDays().some(d => d > SUN)).toBe(true)
      expect(dueUnread()).toBe(1)
    } finally { loadWeek('13/07/2026'); raptorNotify() }
    expect(dueDays()).toEqual([SAT])
    expect(dueUnread()).toBe(0)
  })
  it('his date moving, by itself, is no news: the reminder he read stays read', () => {
    plan(SATI); posted(); hexReads()
    expect(postOut('rocky', SAT, 'sans')).toBe(true); raptorNotify()
    expect(due().length).toBe(1)
    expect(dueDays()).toEqual([SAT])
    expect(dueUnread()).toBe(0)
  })
  /* (was dark: the move to Thu 16 was "not a newly planned day". Hex is on the demo's Thu 16, which the move brings into
     the line — a day he has not seen in it, so by D2560's words it lights) */
  it('…but a move earlier that brings in a day he is planned on and never saw: lit, by that day', () => {
    plan(SATI); posted(); hexReads()
    expect(postOut('rocky', THU, 'sans')).toBe(true); raptorNotify()
    expect(due().length).toBe(1)
    expect(dueDays()).toEqual([THU, SAT])
    expect(dueUnread()).toBe(1)
  })
})

describe('reading 2 — "the reminder had been read" means one standing now, and read', () => {
  const unplan = (di: number) => { (DAYS[di] as any).ground = (DAYS[di] as any).ground.filter((g: any) => g.who !== 'rocky'); afterSchedMutate() }
  it('a reminder that already went gives no title later', () => {
    plan(SATI); posted(); hexReads()
    unplan(SATI)
    expect(postOut('rocky', FRI24, 'sans')).toBe(true); raptorNotify()
    expect(backs()).toEqual([])
  })
  /* (was "no title": the day planned again made a reminder he had not read. By D2560 a day he saw, put back, is the
     reminder he read — so it stands, read, and his date moving past its day is told him, as for any reminder he read) */
  it('the same day planned again is the reminder he read (D2560): his date moved past it — told', () => {
    plan(SATI); posted(); hexReads()
    unplan(SATI); plan(SATI)
    expect(dueUnread()).toBe(0)
    expect(postOut('rocky', SUN, 'sans')).toBe(true); raptorNotify()
    expect(backs().length).toBe(1)
    expect(noticeWords(backs()[0]!).name).toBe('Your SANS date moved to Sun 19 Jul.')
  })
})

describe('reading 3 — several changes before he reads: one line, the latest', () => {
  it('moved twice, then partly back: one line, its title the latest, naming only what is hidden now; all back: gone', () => {
    posted(); expect(commitNewInput(draft(FRI, SUN))).toBe(true)
    expect(postOut('rocky', SAT, 'sans')).toBe(true); raptorNotify()
    expect(postOut('rocky', MON20, 'sans')).toBe(true); raptorNotify()
    expect(backs().length).toBe(1)
    expect(noticeWords(backs()[0]!).name).toBe('Your SANS date moved to Mon 20 Jul.')
    expect(noticeWords(backs()[0]!).what).toContain('Fri 17, Sat 18, Sun 19 Jul')
    expect(postOut('rocky', SAT, 'sans')).toBe(true); raptorNotify()
    expect(backs().length).toBe(1)
    expect(noticeWords(backs()[0]!).name).toBe('Your SANS date moved to Sat 18 Jul.')
    expect(noticeWords(backs()[0]!).what).toContain('filed for Fri 17 Jul is hidden')
    expect(postOut('rocky', FRI, 'sans')).toBe(true); raptorNotify()
    expect(backs()).toEqual([])
  })
  it('nothing hidden any more, but he had read the reminder: the title stays, the sentence goes', () => {
    plan(SUNI); posted(); expect(commitNewInput(draft(FRI))).toBe(true); hexReads()
    expect(postOut('rocky', SAT, 'sans')).toBe(true); raptorNotify()
    expect(noticeWords(backs()[0]!).what).toContain('Fri 17 Jul')
    expect(postOut('rocky', FRI, 'sans')).toBe(true); raptorNotify()
    expect(backs().length).toBe(1)
    expect(noticeWords(backs()[0]!)).toEqual({ name: 'Your SANS date moved to Fri 17 Jul.', day: '· Saber', what: '', who: '' })
  })
})

describe('reading 5 — his date arrived: no date ahead', () => {
  it('the title becomes "Your SANS availability is needed.", and the change at midnight does not light the bell', () => {
    plan(SATI); posted(); hexReads()
    expect(noticeWords(due()[0]!).name).toBe('You\'re SANS from Fri 17 Jul.')
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    expect(noticeWords(due()[0]!).name).toBe('Your SANS availability is needed.')
    expect(dueUnread()).toBe(0)
  })
})

describe('what the scenarios ask to hold', () => {
  it('a man who stays SANS by his own tick: no "hidden", no "active again", his days still count', () => {
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(setShowSans(true)).toBe(true); raptorNotify()   // (a hidden SANS man has no row to post out from)
    plan(SUNI); posted(); expect(commitNewInput(draft(FRI, SAT))).toBe(true); hexReads()
    expect(postOut('rocky', FRI24, 'sans')).toBe(true); raptorNotify()
    expect(noticeWords(backs()[0]!).what).toBe('')
    expect(sansAvailOn('rocky', (DAYS[SATI] as any).dt)).toBeTruthy()
  })
  it('a clipped save is one filing and one Undo step, and Undo brings back no early day', () => {
    posted()
    expect(commitNewInput(draft(THU, SAT))).toBe(true)
    expect(mine().length).toBe(1)
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(mine()).toEqual([])
  })
  it('clipping never passes what the save refuses: no Fly / AMT / OFT choice', () => {
    posted()
    expect(commitNewInput({ ...draft(THU, SAT), sans: {} })).toBe(false)
    expect(mine()).toEqual([])
    expect(toasts.join(' ')).not.toContain('Saved')
  })
  it('clipping never passes what the save refuses: an offer already on a day it keeps', () => {
    posted(); expect(commitNewInput(draft(SAT))).toBe(true); toasts.length = 0
    expect(commitNewInput(draft(THU, SAT))).toBe(false)
    expect(mine().length).toBe(1)
    expect(toasts.join(' ')).not.toContain('Saved')
  })
  it('a direct save of a day before his date is still refused by the final check', () => {
    posted()
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'rocky', date: 'Jul 16', yr: 2026, allday: true, s: 360, e: 1080, type: 'SANS Availability', sans: { f: true }, remarks: '', by: me(), at: Date.now(), iid: 'c156-direct', ord: 99981 } as any) })).toBe(false)
    expect(mine()).toEqual([])
  })
})

describe('a change that leaves him posted out as SANS on the same date tells him nothing', () => {
  const RAN = { to: THU, poOutcome: 'sans', poDone: FRI }
  it('the permissions check: a run posting whose run mark alone changed owes no line', () => {
    expect(sansBackOwed({ collection: 'lw.postouts', op: 'put', before: RAN, after: { to: THU, poOutcome: 'sans' } })).toBeNull()
    expect(sansBackOwed({ collection: 'lw.postouts', op: 'put', before: RAN, after: { ...RAN, label: 'x' } })).toBeNull()
  })
  it('stays: his date moved, or another outcome, still owes its line', () => {
    expect(sansBackOwed({ collection: 'lw.postouts', op: 'put', before: RAN, after: { to: FRI, poOutcome: 'sans' } })).toEqual({ day: FRI, how: 'later', to: SAT })
    expect(sansBackOwed({ collection: 'lw.postouts', op: 'put', before: RAN, after: { to: THU, poOutcome: 'none' } })).toEqual({ day: FRI, how: 'other' })
  })
  it('the same posting saved again, before and after it runs: no line', () => {
    plan(SATI); posted(); hexReads()
    posted(); expect(backs()).toEqual([])
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    posted(); expect(backs()).toEqual([])
  })
  const tickedAndPosted = () => {
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(setShowSans(true)).toBe(true); raptorNotify()
    posted()
  }
  it('his hand tick taken off with the posting still ahead, nothing hidden: no "no longer SANS", the reminder stays', () => {
    plan(SATI); tickedAndPosted(); hexReads()
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(backs()).toEqual([])
    expect(due().length).toBe(1)
  })
  it('the same with a day only the tick covered, filed: the line names that day alone', () => {
    tickedAndPosted()
    expect(commitNewInput(draft(THU, FRI))).toBe(true)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(backs().length).toBe(1)
    expect(noticeWords(backs()[0]!).what).toContain('filed for Thu 16 Jul is hidden')
  })
  it('stays: the tick taken off after the posting has run, the reminder read: he is told', () => {
    plan(SATI); posted()
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    hexReads()
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(noticeWords(backs()[0]!).name).toBe('You\'re no longer SANS.')
  })
})

describe('a "moved" line always carries its new date', () => {
  const moveWith = (extra: () => void, to: string = FRI24): boolean => {
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
  it('the permissions check refuses a "moved" line with no date, and one with another date', () => {
    plan(SATI); posted(); hexReads()
    const days = (due()[0]!.what[0] as any).days as string[]
    expect(moveWith(() => { noticeSansBack('rocky', me(), days, FRI, Date.now(), [], { how: 'later' }) })).toBe(false)
    expect(moveWith(() => { noticeSansBack('rocky', me(), days, FRI, Date.now(), [], { how: 'later', to: SAT }) })).toBe(false)
    expect(backs()).toEqual([])
  })
  it('the control: the same line with its true date passes', () => {
    plan(SATI); posted(); hexReads()
    const days = (due()[0]!.what[0] as any).days as string[]
    expect(moveWith(() => { noticeSansBack('rocky', me(), days, FRI, Date.now(), [], { how: 'later', to: FRI24 }) })).toBe(true)
  })
  it('a take-back asked for with his posting unchanged writes nothing, and the command stands', () => {
    plan(SATI); posted(); hexReads()
    expect(moveWith(() => { sansTakeBack('rocky', FRI, String(me()), Date.now()) }, FRI)).toBe(true)
    expect(backs()).toEqual([])
  })
  it('a posting date that is not a date owes no "moved" line', () => {
    let owed: unknown = 'threw'
    try { owed = sansBackOwed({ collection: 'lw.postouts', op: 'put', before: { to: THU, poOutcome: 'sans' }, after: { to: 'junk', poOutcome: 'sans' } }) } catch { /* refused */ }
    expect((owed as any)?.how === 'later' || (owed as any)?.how === 'earlier').toBe(false)
  })
})

/* THE WALK'S W11-1 (24 Nov 26, both sizes): a man ticked SANS today AND posted out as SANS from a date ahead is SANS now, by
   the tick: his reminder named only the days from the posting, under the posting's date */
describe('W11-1 — ticked SANS and posted out as SANS: every SANS day, and no date ahead in the title', () => {
  const ticked = () => {
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(setShowSans(true)).toBe(true); raptorNotify()
  }
  it('posted from Fri 17: Wed 15 and Thu 16 the tick covers are named, under "Your SANS availability is needed."', () => {
    ticked(); plan(SATI); posted()
    expect(due().length).toBe(1)
    /* (Hex is on the demo's Wed 15 and Thu 16) */
    expect(noticeWords(due()[0]!)).toEqual({ name: 'Your SANS availability is needed.', day: '', what: 'You\'re planned on Wed 15, Thu 16, Sat 18 Jul with nothing filed. Tap to file for availability.', who: '' })
  })
  it('posted from Sat 18: no "SANS from Sat 18 Jul." when the tick already covers Fri 17', () => {
    ticked(); plan(5 - 1); posted(SAT)
    expect(noticeWords(due()[0]!).name).toBe('Your SANS availability is needed.')
    expect((due()[0]!.what[0] as any).days).toEqual([WED, THU, FRI])
  })
  it('stays: posted only, not ticked: his date in the title, his days from it', () => {
    plan(SATI); posted()
    expect(noticeWords(due()[0]!).name).toBe('You\'re SANS from Fri 17 Jul.')
    expect((due()[0]!.what[0] as any).days).toEqual([SAT])
  })
  it('the other "SANS from" words already read his tick: the greyed button and the cut-run note', () => {
    ticked(); posted(SAT); signInAs('hex')
    render(<SansDay iso={THU} hi={null} onClose={() => {}} />)
    expect(screen.queryByTestId('sd-addwhy')).toBeNull()
    expect(sansRunTrim('rocky', WED, SAT)).toBeNull()
  })
})

/* WHAT A WALK CANNOT STAGE (a sign-out ends the admin's Undo list, D148): Hex reads on his own device, his read record
   written as his "Mark all read" writes it */
describe('a change line, then Saber\'s Undo and Redo', () => {
  const readAll = () => { mem['sqn142_noticeseen:rocky'] = JSON.stringify({ upto: 0, ids: noticesFor('rocky').map(n => n.id) }); noticeSeenLoad() }
  const unticked = () => {
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    plan(SATI)
    expect(commitNewInput(draft(FRI, SAT))).toBe(true)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(backs().length).toBe(1)
  }
  it('(a) the Quals untick\'s line, read, then Saber\'s Undo: struck, "taken back · Saber", unread', () => {
    unticked(); readAll()
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(backs().length).toBe(1)
    expect(noticeWords(backs()[0]!)).toEqual({ name: 'You\'re no longer SANS.', nameStruck: true, day: '', what: 'taken back', who: 'Saber' })
    expect(isUnread(backs()[0]!, 'rocky')).toBe(true)
  })
  it('(b) …then Saber\'s Redo: the line is told again, unread, and lights his bell', () => {
    unticked(); readAll()
    expect(globalUndo().ok).toBe(true); raptorNotify()
    readAll()
    expect(unreadFor('rocky')).toBe(0)
    expect(globalRedo().ok).toBe(true); raptorNotify()
    const told = backs().filter(n => !noticeWords(n).nameStruck)
    expect(told.length).toBe(1)
    expect(noticeWords(told[0]!).name).toBe('You\'re no longer SANS.')
    expect(noticeWords(told[0]!).what).toContain('Fri 17, Sat 18 Jul')
    expect(isUnread(told[0]!, 'rocky')).toBe(true)
    expect(unreadFor('rocky')).toBeGreaterThanOrEqual(1)
  })
  it('(b) …and with nothing read between the Undo and the Redo, the line told again is still unread', () => {
    unticked(); readAll()
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(globalRedo().ok).toBe(true); raptorNotify()
    const told = backs().filter(n => !noticeWords(n).nameStruck)
    expect(told.length).toBe(1)
    expect(noticeWords(told[0]!).name).toBe('You\'re no longer SANS.')
    expect(isUnread(told[0]!, 'rocky')).toBe(true)
  })
  it('(b) …and Undo once more takes that one back too', () => {
    unticked(); readAll()
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(globalRedo().ok).toBe(true); raptorNotify()
    readAll()
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(backs().filter(n => !noticeWords(n).nameStruck)).toEqual([])
  })
  it('(c) the reminder he read before the untick is not made unread by the Undo alone', () => {
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    plan(SATI); readAll()
    expect(dueUnread()).toBe(0)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(due()).toEqual([])
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(due().length).toBe(1)
    expect(dueUnread()).toBe(0)
  })
  it('"Undo post out" is no Undo step (D350): its line, read, is left as it was by Saber\'s Undo', () => {
    posted(); expect(commitNewInput(draft(FRI, SAT))).toBe(true)
    expect(undoPostOut('rocky')).toBe(true); raptorNotify()
    readAll()
    const before = noticeWords(backs()[0]!)
    expect(before.name).toBe('You\'re no longer posted out as SANS.')
    globalUndo(); raptorNotify()
    expect(backs().map(n => noticeWords(n).nameStruck)).not.toContain(true)
  })
  it('…and where that Undo took the filing away, the line no longer says it is hidden', () => {
    posted(); expect(commitNewInput(draft(FRI, SAT))).toBe(true)
    expect(undoPostOut('rocky')).toBe(true); raptorNotify()
    readAll()
    expect(globalUndo().ok).toBe(true); raptorNotify()
    expect(mine()).toEqual([])
    expect(backs().map(n => noticeWords(n).what).join(' ')).not.toContain('filed for')
  })
})
