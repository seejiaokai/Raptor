/* SECURITY RE-READ, chat 147, round 2 (the fixes 53ffa626e, 7611d8647) — each `it` is an opening that remains: it states
   what the permissions check SHOULD do, and fails today. The fixture is sans-unfiled.test.ts's: the demo week of Mon 13
   Jul 26; `rocky` is Hex, a WSO; Saber ('ad') the squadron's admin. Hex's SANS posting from Fri 17 Jul runs on Fri; he is
   planned on Sat 18 Jul, so his live line names Sat 18 Jul. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { validate } from '../engine/validate'
import { afterSchedMutate } from '../state/view'
import { NOTICES, noticesFor, noticeWords, noticeSansBack, type Notice } from '../state/notices'
import { hasRead, noticeSeenLoad, unreadFor } from '../state/noticeseen'
import { me } from '../state/perms'
import { commit as cmdCommit } from '../command'
import { schedStore, resyncBeforeEnlist, schedApplyEnd } from '../state/sched-commit'
import { peopleStore, settingsStore, finishPeopleWrite } from '../state/people-settings-commit'
import { store } from '../engine/hooks'
import { initStore as lwInitStore, setPeople, setPostOut, lwStore } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, runPoOutcomes, wireLeaveWarSync } from './sync'
import { markAllNoticesRead } from '../state/noticeseen'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const SAT = 5, FRI_ISO = '2026-07-17'
const at = (y: number, m: number, d: number) => vi.setSystemTime(new Date(y, m - 1, d, 9, 0, 0))
const kindOf = (n: Notice) => String((n.what || [])[0]?.k)
const struck = () => NOTICES.filter(n => n.to === 'rocky' && kindOf(n) === 'sansback')
const live = () => noticesFor('rocky').filter(n => kindOf(n) === 'sansdue')
const plan = (di: number, id: string) => { (DAYS[di] as any).ground.push({ prog: 'BRIEFING', str: '1600', end: '1700', who: id }); afterSchedMutate() }
/* the posting ran on Fri 17 Jul: his live line names Sat 18 Jul */
const ran = () => {
  plan(SAT, 'rocky')
  expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
  at(2026, 7, 17); runPoOutcomes(); raptorNotify()
  expect(live().length).toBe(1)
}
const hexReads = () => { signInAs('hex'); expect(markAllNoticesRead()).toBe(true); signInAs('ad', 'a') }

/* Saber's posting command, shaped as the app's own (leavewar/sync.ts takeBack: `lw.postout`, the same stores) — a forger's
   body. Answers whether the command LANDED. */
function postingCommandWith(id: string, from: string, outcome: 'sans' | 'none' | 'overseas', extra: () => void): boolean {
  let ok = false
  let r: any
  try {
    r = cmdCommit({
      type: 'lw.postout', scope: { module: 'people' }, meta: null,
      apply: (txn: any) => {
        resyncBeforeEnlist(); txn.enlist(schedStore)
        txn.enlist(peopleStore); txn.enlist(settingsStore); txn.enlist(lwStore)
        ok = setPostOut(id, from, outcome)
        if (!ok) return
        extra()
        validate(); finishPeopleWrite(); schedApplyEnd()
      },
    } as any)
  } catch { return false }
  return ok && !(r && 'ok' in r && r.ok === false)
}

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  PEOPLE0 = JSON.stringify(PEOPLE); DAYS0 = JSON.stringify(DAYS); INPUTS0 = JSON.stringify(INPUTS)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  at(2026, 7, 15)
  Object.keys(mem).forEach(k => delete mem[k])
  /* (a backend that can list its rows, so the read records load as the app loads them) */
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v }, keys: () => Object.keys(mem) } as any
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
  noticeSeenLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  signInAs('ad', 'a')
})
afterEach(() => { resetSession(null); vi.restoreAllMocks() })

describe('SEC2-1 — a REAL take-back still carries struck days his line never said', () => {
  it('Hex read "Sat 18 Jul"; Saber moves the posting later (a real take-back) in a command that strikes made-up days instead: refused', () => {
    ran(); hexReads()
    const landed = postingCommandWith('rocky', '2026-07-24', 'sans', () => {
      expect(noticeSansBack('rocky', me(), ['2026-07-18', '2026-08-01', '2027-03-03', '2099-12-31'], FRI_ISO)).toBe(true)
    })
    if (landed) console.log('SEC2-1 LANDED:', JSON.stringify(struck().map(n => noticeWords(n))))
    expect(landed, 'the struck days must be the days his line said (Sat 18 Jul)').toBe(false)
  })
  it('…or five hundred days: refused', () => {
    ran(); hexReads()
    const days: string[] = []
    for (let i = 0; i < 500; i++) { const d = new Date(Date.UTC(2026, 6, 18 + i)); days.push(d.toISOString().slice(0, 10)) }
    const landed = postingCommandWith('rocky', '2026-07-24', 'sans', () => { noticeSansBack('rocky', me(), days, FRI_ISO) })
    if (landed) console.log('SEC2-1b LANDED:', JSON.stringify(struck().map(n => noticeWords(n))))
    expect(landed).toBe(false)
  })
})

describe('SEC2-2 — the read-record check reads the admin\'s device\'s copy of HIS read record, not the saved one', () => {
  it('Hex never read his line; Saber\'s device holds a read record for Hex that says he did (written outside every command); the app\'s own "move later" then strikes it: no struck line', () => {
    ran()
    const liveId = live()[0]!.id
    const saved = mem['sqn142_noticeseen:rocky'] ?? null
    /* the forger's bare write on his own device, then the loader every settings rollback runs.
       (Builder, chat 147's fix round: that bare write was SAVED as it stood — the settings store writes a key outside
       every command straight to the saved copy — so reading the saved record alone could not tell it from Hex's own. The
       door is shut where it opened: a read record is written only by its own command, and the bare write is refused —
       state/people-settings-commit.ts. The reader's precondition, "his device now believes Hex read it", is therefore
       asked the other way round; the claim below it, no struck line, is kept as written.) */
    expect(() => store.set('noticeseen:rocky', { upto: 0, ids: [liveId] })).toThrow(/read record/)
    noticeSeenLoad()
    expect(hasRead('rocky', live()[0]!), 'the bare write was refused: nothing says Hex read it').toBe(false)
    expect(mem['sqn142_noticeseen:rocky'] ?? null, 'his saved read record is as it was').toBe(saved)
    expect(postOut('rocky', '2026-07-24', 'sans')).toBe(true); raptorNotify()
    const n = struck().length
    if (n) console.log('SEC2-2 LANDED: struck lines on Hex\'s bell:', n, '— his saved read record before:', saved)
    expect(n, 'he never read it: D1710 — an unread line simply goes').toBe(0)
  })

  it('…the same, inside the forger\'s own posting command: he writes Hex\'s read record himself — refused', () => {
    ran()
    const liveId = live()[0]!.id
    const landed = postingCommandWith('rocky', '2026-07-24', 'sans', () => {
      store.set('noticeseen:rocky', { upto: 0, ids: [liveId] })
      noticeSeenLoad()
      noticeSansBack('rocky', me(), ['2026-07-18'], FRI_ISO)
    })
    if (landed) console.log('SEC2-2b LANDED: Hex\'s read record written by Saber, struck lines:', struck().length, 'unread', unreadFor('rocky'))
    expect(landed, 'an admin may only READ another person\'s read record (§11 NoticeSeen)').toBe(false)
  })
})
