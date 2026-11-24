/* SECURITY READ, chat 147 (D2338's saved `sansback` line and the worked-out `sansdue` line) — each `it` here is a HOLE:
   it states what the permissions check SHOULD do, and fails today. The fixture is sans-unfiled.test.ts's: the demo week
   of Mon 13 Jul 26, today Wed 15 Jul; `rocky` is Hex, a WSO; Saber ('ad') is the squadron's admin. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputsBatch } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { validate } from '../engine/validate'
import { NOTICES, noticesFor, noticeWords, noticeSansBack, type Notice } from '../state/notices'
import { me } from '../state/perms'
import { commit as cmdCommit } from '../command'
import { schedStore, resyncBeforeEnlist, schedApplyEnd } from '../state/sched-commit'
import { peopleStore, settingsStore, finishPeopleWrite } from '../state/people-settings-commit'
import { clearSansDayAsk } from '../state/view'
import { initStore as lwInitStore, setPeople, setPostOut, lwStore, getState } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const FRI_ISO = '2026-07-17'
const at = (y: number, m: number, d: number) => vi.setSystemTime(new Date(y, m - 1, d, 9, 0, 0))
const kindOf = (n: Notice) => String((n.what || [])[0]?.k)

/* An admin's own posting command, shaped as the app's (leavewar/sync.ts takeBack: type `lw.postout`, the same stores
   enlisted) — but its body is the forger's: it sets a posting, then calls the plain exported writer noticeSansBack.
   Answers whether the command LANDED (the gate let it through). */
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

describe('SEC-147-1 — a "taken back" SANS-days line that no take-back wrote', () => {
  it('Saber MAKES a first SANS posting for Hex (nothing ran, no line ever on his bell, nothing read) and, in the same command, writes "taken back" naming made-up days: refused', () => {
    expect(getState().postOuts.rocky?.to ?? null, 'Hex has no posting yet').toBeNull()
    const landed = postingCommandWith('rocky', FRI_ISO, 'sans', () => {
      expect(noticeSansBack('rocky', me(), ['2099-01-05', '2099-01-06', '2099-01-07', '2099-01-08', '2099-01-09'], FRI_ISO)).toBe(true)
    })
    const forged = NOTICES.filter(n => n.to === 'rocky' && kindOf(n) === 'sansback')
    /* what it lets through today, for the report: */
    if (landed) console.log('SEC-147-1 LANDED:', JSON.stringify(forged.map(n => noticeWords(n))))
    expect(landed, 'a "taken back" with no line ever taken back must not pass').toBe(false)
    expect(forged).toEqual([])
  })

  it('the same command may write it any number of times (one take-back owes one line): refused', () => {
    const landed = postingCommandWith('rocky', FRI_ISO, 'sans', () => {
      for (let i = 0; i < 25; i++) noticeSansBack('rocky', me(), ['2026-07-18'], FRI_ISO)
    })
    const n = NOTICES.filter(x => x.to === 'rocky' && kindOf(x) === 'sansback').length
    if (landed) console.log('SEC-147-1b LANDED copies:', n)
    expect(landed).toBe(false)
  })

  it('days that are not dates pass the gate and then break his bell\'s words (he cannot remove the line): refused', () => {
    const landed = postingCommandWith('rocky', FRI_ISO, 'sans', () => {
      noticeSansBack('rocky', me(), [5, 6] as any, FRI_ISO)
    })
    const line = NOTICES.find(x => x.to === 'rocky' && kindOf(x) === 'sansback')
    if (landed && line) {
      let err = ''
      try { noticeWords(line) } catch (e) { err = String(e) }
      console.log('SEC-147-1c LANDED; noticeWords on his bell:', err || 'no error')
      let err2 = ''
      try { signInAs('hex'); noticesFor('rocky').forEach(n => noticeWords(n)) } catch (e) { err2 = String(e) } finally { signInAs('ad', 'a') }
      console.log('SEC-147-1c his bell list:', err2 || 'no error')
    }
    expect(landed).toBe(false)
  })
})

describe('SEC-147-2 — the worked-out "SANS days" line, STORED by a command riding an input change', () => {
  it('Saber files an input for Hex and puts a stored "Your SANS availability · Planned, no availability filed" line on his bell, which reads as the app\'s own (no name) and never goes: refused', () => {
    const IID = 'sec147-in-1'
    const ok = writeInputsBatch(() => {
      INPUTS.push({ person: 'rocky', date: 'Jul 25', yr: 2026, allday: true, type: 'Training', remarks: 'x', by: me(), at: Date.now(), iid: IID, ord: 99981 } as any)
      NOTICES.push({ id: 'sec147-sd-1', to: 'rocky', by: me(), at: Date.now(), iid: IID, name: 'Your SANS availability', day: '2026-07-25', what: [{ k: 'sansdue', days: ['2026-07-25', '2026-07-26'] }] } as any)
    })
    const line = NOTICES.find(n => n.id === 'sec147-sd-1')
    if (ok && line) console.log('SEC-147-2 LANDED; Hex reads:', JSON.stringify(noticeWords(line)))
    expect(ok, 'a stored line of the worked-out kind must not pass').toBe(false)
  })

  it('a MEMBER (Hex), changing his own leave that Saber filed for him, puts the same stored line on Saber\'s bell (he is told as its filer): refused', () => {
    const admin = me()!
    const IID = 'sec147-in-2'
    expect(writeInputsBatch(() => {
      INPUTS.push({ person: 'rocky', date: 'Jul 25', yr: 2026, allday: true, type: 'LL', remarks: 'x', by: admin, at: Date.now(), iid: IID, ord: 99982 } as any)
    })).toBe(true)
    signInAs('hex')
    const self = me()!
    /* (the filer's mark the notice pass writes on a line to him — copied from the honest line Hex's own edit writes) */
    expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = 'y' })).toBe(true)
    const fu = (NOTICES.find(n => n.to === admin && n.iid === IID) as any)?.fu
    const ok = writeInputsBatch(() => {
      (INPUTS.find((x: any) => x.iid === IID) as any).remarks = 'z'
      NOTICES.push({ id: 'sec147-sd-2', to: admin, by: self, at: Date.now(), iid: IID, fu, name: 'Your SANS availability', day: '2026-07-25', what: [{ k: 'sansdue', days: ['2026-07-25'] }] } as any)
    })
    const line = NOTICES.find(n => n.id === 'sec147-sd-2')
    if (ok && line) console.log('SEC-147-2b LANDED; Saber reads:', JSON.stringify(noticeWords(line)))
    expect(ok).toBe(false)
  })
})
