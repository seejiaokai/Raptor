// @vitest-environment jsdom
/* A TAP ON THE BELL GOES FIRST TO AN ACCESS REQUEST, THEN TO A BUG REPORT — AHEAD OF THE LIST OF NOTICES (the break tests
   of the one-rule job's full check, 12 Oct 26: docs/handpass/parts/or-wires-3.md, wire 17; owner D769: "a tap on the
   bell still goes straight to an OIL question, an access request or a bug report where one waits, opening the list only
   otherwise"; the plan docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.10).

   ui/bellnotices.test.tsx and ui/bellnotices-scenarios.test.tsx hold the OIL question and the view's own alert coming
   before the list. Nothing held the other two of D769's three: with the tap changed on purpose so that an unread notice
   opened the list AHEAD of a waiting access request or a new bug report, no test went red. An admin is the one person
   who can have all of them at once, and his bell must take him to the thing that waits on HIM first.

   The harness is ui/bellnotices.test.tsx's: the real whiteboard, the real commands, the bell's own tap. Saber (`stiff`)
   is the admin (`ad`), Ranger (`bane`) and Hex (`rocky`) are members. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend, HOOKS } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { initStore, weekStashSnap, weekDirty, loadWeek, notify, resetSession } from '../state/store'
import { setSession, setMe, DEFAULT_ME, SESSION, ME } from '../state/auth'
import { hydrate, wirePersist } from '../state/persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetDisclosure } from '../state/disclosure'
import { setPage, setBoardDay } from '../state/view'
import * as view from '../state/view'
import { me } from '../state/perms'
import { signIn, sessionFor, requestAccess, accessAlert, waitingCount } from '../state/accounts'
import { REPORTS, BUG_CATS, fileReport, bugAlert } from '../state/reports'
import { commitInput, draftOf } from './inputedit'
import * as pops from './pops'
import { NOTICES } from '../state/notices'
import { unreadFor } from '../state/noticeseen'
import { bellOn, bellTap, bellListOpen, closeBellList } from './topbits'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026'
const toast = HOOKS.toast
let SAID: string[] = []

function resetWorld() {
  if (CURWEEK !== W1) loadWeek(W1)
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
  Object.assign(PEOPLE, JSON.parse(PSNAP))
  for (const k of Object.keys(ID_BY_CS)) delete ID_BY_CS[k]
  indexCallsigns()
  PLANPUCKS.length = 0; for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
  NOTICES.length = 0; REPORTS.length = 0
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  view.WARNOFF.clear(); view.disarmSlot(); view.clearBell()
  pops.setInpEdit(null); pops.setOilAsk(null); closeBellList()
  stashClear()
}
const SABER = 'stiff', RANGER = 'bane', HEX = 'rocky'
/* the real sign-in, as the sign-in card does it: the account decides who he is */
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); notify() }
const saber = () => signInAs('ad', 'a')
/* another person's command while the signed-in person stays signed in (ui/bellnotices.test.tsx asOther) */
function asMember(pid: string, fn: () => void): void {
  const s = SESSION, m = ME
  setSession({ user: 'us', role: 'main', name: 'us' }); setMe(pid)
  try { fn() } finally { setSession(s); setMe(m) }
}
async function boot() {
  const be = new MemoryBackend()
  be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
  const p = bootStorage(be)
  await vi.advanceTimersByTimeAsync(be.latency)
  const { wb } = await p
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  initStore()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  _resetDisclosure()
  _resetTimeline(); installGlobalUndo()
}
const TITLE = 'Range brief'
const rec = () => { const l = INPUTS.filter((x: any) => x.title === TITLE) as any[]; expect(l, 'ONE record').toHaveLength(1); return l[0] }
/* a notice waiting for the ADMIN: he files an input for two members, and one of them takes himself out — the filer is told */
function noticeForSaber() {
  expect(commitInput(null, draftOf({ person: RANGER, type: 'Training', title: TITLE, date: 'Jul 15', yr: 2026, allday: false, s: 540, e: 600, remarks: 'Bring your kit' }), [RANGER, HEX]), `filed: ${SAID.join(' | ')}`).toBe(true)
  asMember(RANGER, () => expect(commitInput(rec(), draftOf(rec()), [HEX]), `Ranger takes himself out: ${SAID.join(' | ')}`).toBe(true))
  expect(unreadFor(SABER), 'Saber, who filed it, has one unread notice').toBe(1)
}

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 5, 1, 9, 0, 0)); resetWorld(); SAID = []; HOOKS.toast = (m: any) => { SAID.push(String(m)) } })
afterEach(() => {
  HOOKS.toast = toast
  _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); setMe(DEFAULT_ME); storeBackend.impl = null; document.body.innerHTML = ''
})

describe('D769 — what waits on him comes before the list', () => {
  it('an access request AND an unread notice: the tap goes straight to Admin → Users and opens no list; the notice stays unread', async () => {
    await boot()
    saber(); setPage('editsched'); setBoardDay(2)
    noticeForSaber()
    /* someone signs in who is on no list, and asks */
    signInAs('kite@mail')
    expect(requestAccess({ cs: 'Kite', ini: 'KT', seat: 'FCP', cat: 'C' }), 'his request').toBe(null)
    saber()
    expect(me()).toBe(SABER)
    expect(accessAlert(), 'a request he has not seen').toBe(true)
    expect(unreadFor(SABER), 'and his notice, still unread').toBe(1)
    expect(bellOn()).toBe(true)
    SAID = []
    bellTap()
    expect(bellListOpen(), 'no list').toBe(false)
    expect(SAID.join(' | ')).toContain(`${waitingCount()} waiting for access`)
    expect(view.CURPAGE, 'he is on Admin').toBe('admin')
    expect(unreadFor(SABER), 'the notice was not read by that tap').toBe(1)
  })
  it('a new bug report AND an unread notice: the tap goes straight to the reports and opens no list', async () => {
    await boot()
    saber(); setPage('editsched'); setBoardDay(2)
    noticeForSaber()
    asMember(RANGER, () => expect(fileReport(BUG_CATS[0]!, 'the board jumped'), 'a member files a report').toBeTruthy())
    expect(accessAlert(), 'nobody waits for access').toBe(false)
    expect(bugAlert(), 'a report he has not seen').toBe(true)
    SAID = []
    bellTap()
    expect(bellListOpen(), 'no list').toBe(false)
    expect(SAID.join(' | ')).toContain('1 new bug report')
    expect(view.CURPAGE, 'he is on Help, where the reports are').toBe('help')
    expect(unreadFor(SABER)).toBe(1)
  })
  it('…and with neither waiting, the same tap opens the list', async () => {
    await boot()
    saber(); setPage('editsched'); setBoardDay(2)
    noticeForSaber()
    expect(accessAlert() || bugAlert()).toBe(false)
    bellTap()
    expect(bellListOpen(), 'the list').toBe(true)
  })
})
