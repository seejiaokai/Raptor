# Security read — SANS filed ahead and hidden (D2340, D2341, D2342, D2346), chat 152, 23 Nov 26

Reader: a fresh, blind security reader (D1411), looking only for holes. Read the change (`FIX-DIFF.patch`) and the code
after it in `D:\raptor-work\c152-read\security`; no other reader's or walker's report seen. Nothing in the app was changed.
One new test file was written for the host to copy and run:
`D:\raptor-work\c152-read\security\raptor-port\src\leavewar\sans-ahead-security152.test.ts` (its full text is at the end).
Each claim below is expected to fail there on the code as it stands; none was run here (no packages in the copy).

Demo world used throughout: the week of Mon 13 Jul 26, today Wed 15 Jul; Hex (`rocky`, a WSO, a member, sign-in `hex`)
posted out as SANS from Fri 17 Jul; Saber the admin (`ad`); "the other man" = a man of the admin's squadron SANS all week
(the W10-1 test's own pick).

## Findings

### S1 — MEDIUM — an admin can file a man for a day before his SANS date by editing someone else's offer
- **State.** Hex's SANS posting from Fri 17 is saved. The other man has a SANS offer for Thu 16. Saber opens that offer's
  window. On Thu 16 the people list does not offer Hex (he is not SANS that day), so Saber moves the start to Fri 17, picks
  Hex (now offered), moves the start back to Thu 16 — a picked man always stays (`offersFor`) — and presses Save.
- **What happens.** The save goes through. Hex is now in an offer for Thu 16, a day before his SANS date. The same happens
  through any door that changes an existing record's people while handing that record in as "the entry being changed":
  the window's save (`commitInput` → `normalizeInputDraft({ ...draft, person: p }, rec)` for each man), the one-man swap
  on a shared record (`reassignInput` → `normalizeInputDraft({ ...draftOf(r), person: personId }, r)`), the one-person
  move to another man (`commitInputEdit`), and a record of another kind retyped into SANS availability by a hand-made call
  (the windows do not offer that retype, but the save boundary is the one that must hold).
- **The rule.** D2340: filing goes by the day filed, "for days from its date". The new exemption in the code comment is
  narrower than the code: "a record one of whose days was hidden by a later change of his posting still saves as it
  stands" — i.e. a day *his own* SANS filing already held.
- **Cause.** `ui/inputedit.tsx sansRefusal`: `if (sansOnP(p, d) || (except && inputCoversDate(except, fmt(d)))) continue`
  — any record covering the day exempts it, whoever it held and whatever its kind.
- **Consequence.** A record that breaks D2340 is saved. On Thu 16 it shows (the other man is SANS), and Hex's card is
  drawn with it on the schedule's SANS panel (S2). It does not count for Hex (`sansGate` asks the day), so the harm is a
  filing the rule forbids and a card shown on a day he is not SANS — not a wrong count.
- **Fix, step by step.**
  1. In `sansRefusal`, before the loop: `const held = !!except && isSansAvail(except.type) && holds(except, person)`
     (`isSansAvail`, `holds` from `engine/inputs`).
  2. Change the exemption to `(held && inputCoversDate(except, fmt(d)))`.
  3. Leave the rest: a man added to, or moved into, a record is then asked every day of it, as a new filing is; Hex's own
     record whose day was hidden by a later posting change still saves as it stands.
  4. Tests: S1's three cases below (the boundary, the window's save, a record of another kind).

### S2 — LOW-MEDIUM — a shared offer's hidden man is still drawn on the schedule's SANS panels
- **State.** One offer for the other man and Hex on Sat 18 (allowed: Hex's posting from Fri 17). Saber then moves Hex's
  posting to Fri 24, so Sat 18 is no longer a SANS day of Hex's.
- **What happens.** The record still shows on Sat 18 — correctly, the other man is SANS (`engine/inputs.ts sansShownOn`
  shows a record while ONE of its men is SANS). But the board's SANS panel (`ui/board-html.ts sbSansPanel`) and the week's
  SANS section (`ui/html.ts sansSectionHTML`) split the record into one card per man with `facesOf` and draw Hex's card,
  his puck and his letters, on a day he is hidden. Likewise `engine/inputs.ts sansAvailOn('rocky', Sat 18)` answers the
  shared record ("Hex has availability that day"); its present callers ask `sansOnP` first, so no count is wrong today,
  but the reader itself says yes for a hidden man.
- **The rule.** D2341: SANS availability shows and counts only on a day he is SANS, hidden "on every screen … as if
  deleted". The patch fixed the same leak in one place only — the SANS day's placed line (`sanscal-model.ts shownOn`,
  W10-1).
- **Cause.** `sansShownOn` is a record-level answer; the readers that draw a record man by man (`facesOf`) never ask it
  again per man.
- **Fix, step by step.**
  1. In `engine/inputs.ts`, add `sansFaceShown(face, at)`: true unless the face is SANS availability, the day is not a
     frozen (published) face (`!inputsFrozenOn(at)` — a published face keeps what it published, D44), and
     `!sansOnP(PEOPLE[face.person], inputAtIso(at))`.
  2. `sbSansPanel` and `sansSectionHTML`: `.flatMap(r => facesOf(r)).filter(f => sansFaceShown(f, d.dt))`.
  3. `sansAvailOn(id, dt)`: also require, on a live day, `sansOnP(PEOPLE[id], inputAtIso(dt))`.
  4. Tests: S2's three cases below.
  (The record's own window, opened from the shown man's row, still names both men — the W10-1 test records that as the
  agent's reading, told to him, so it is not filed here.)

### S3 — MEDIUM (the fields came with D2313; this change makes them decide filing and hiding) — the man himself can make any day a SANS day
- **State.** Hex, signed in as a member, with his SANS posting from Fri 17.
- **What happens.** A member may change every field of his own row except the few the commit gate lists
  (`state/perms.ts OWN_ROW_ADMIN_ONLY`: callsign, Management, Scheduler and where it was given, archive, who archived,
  delete mark, placeholder mark). His SANS stretches — `sanFrom` (the day his tick counts from) and `sanWas` (his ended
  stretches) — are not among them. A hand-made own-row command (`commitPeopleEdit(fn, { owner: 'rocky' })`, the same
  command the Quals page sends) setting `sanWas = [['2026-07-01', '2026-07-17']]`, or `sanFrom = '2026-01-01'`, passes the
  gate. From then `sansOnP` reads him SANS on those days, and since this change that one answer decides:
  - D2340 — he can file SANS availability for Thu 16 and any earlier day, before his SANS date;
  - D2341 — his own hidden availability shows and counts again on days that are not his SANS days;
  - and, as before this change, the ALL AVAIL crowd and the SANS counts of any day back in time, which other people read
    (D2313, D2329), and a published day turning pending.
- **The rule.** D2313: "a tick by hand counts from the day it is made"; the Quals door writes only today
  (`state/quals-write.ts`: `sansStart(p, todayIso())` / `sansStop(p, todayIso())`). D2340, D2341 as above. D200: the
  permissions check is the one place that answers who may write what.
- **Cause.** `state/perms.ts` — the member's `case 'people'` in the ownership gate compares only `OWN_ROW_ADMIN_ONLY`.
- **Fix, step by step.**
  1. In that `case 'people'`, after the loop, compute the only SANS-stretch change a member's own row may carry: clone
     the before image, and if the after image's `san` differs from the before's, apply `sansStart(clone, today)` (ticked
     on) or `sansStop(clone, today)` (ticked off) from `engine/people`.
  2. Refuse — "his SANS days (people/<id>)" — where `JSON.stringify([n.san, n.sanFrom ?? null, n.sanWas ?? null])`
     differs from the clone's, unless the change is the verified replay of his own step (`REPLAY(env)` — his Undo / Redo
     of a tick).
  3. Leave `sanQ` as it is (D149 — his own counts are his).
  4. Tests: S3's two cases below.

### S4 — LOW — the permissions table (`docs/data-model.md` §11) no longer says what `state/perms.ts` does
- The `Notice` row's sixth writer still says the `sansback` line is owed only by a take-back of a SANS posting that has
  RUN ("a new or unrun posting … owes none") and only "where the SANS man himself had read" his line. The code now owes
  it for a posting saved but not yet run, and writes it with `hid` (the days the change hid) with no read needed when
  nothing is struck (`sansBackOwed`, `sansBackCovered`). The same stale words are at the posting paragraph (§ the Notice
  table's lead, "A SANS man's own line taken back"). `notifications-register.md` B13 is up to date.
- The `Input` row says nothing of SANS availability: who may be filed for, and on which days, is held only at the doors
  (`sansRefusal`), never at the commit gate (`engine/inputs.ts shapeProblem`'s note says so). The IT side reading §11 for
  the server rules would not learn that rule exists.
- The `Person` row: once S3 is fixed, add that a member's own SANS days change only as the tick writes them, today.
- **Rule:** D200, D1411 — §11 mirrors `state/perms.ts`. **Fix:** rewrite those three passages; no code.

## Checked and found closed
- **A member filing or changing another man's SANS availability:** refused at the commit gate — `mayFileInputFor` /
  `memberFilesForOthers` exclude SANS availability, and `mayChangeInput` gives a member only an input whose only person
  is he. Unchanged by this change.
- **The days before his SANS date through the SANS calendar** (drag, Shift+arrows and Enter, "+ Commitment"), the
  window's dates changed after opening, the people pickers, a posting changed while a window is open: every one ends at
  `normalizeInputDraft`, which asks `sansRefusal` with the draft's own dates at the moment of Save. Only the `except`
  exemption (S1) gets past it.
- **Forging, erasing or altering a bell line:** `sansdue` is never stored (refused if put, `NEVER_STORED`). A `sansback`
  line passes only when a war writer minted it in this command (`warMade`), signed by the actor (`warSignedBy`), owed by
  this command's own change of that man's SANS posting (`warLinesOwed` → `sansBackOwed`), to that man on that posting's
  date, its struck days exactly his live line's at the command's start and only where he had read it as saved, its
  hidden days exactly those the change hid (`sansBackCovered` against `BEFORE` / `hiddenNow`), well-formed (`lineMalformed`
  now covers `hid`), once a man and date a command (`sansBacks`). A member can write no posting record (`lw.postouts` is an
  admin's record), so a member can neither write nor be the cause of one. An admin of another squadron cannot put one on
  a man not at home in his squadron (`ownsLine`), nor change that squadron's postings (the posting-pass squadron check).
- **The bell line reaching anyone else:** the worked-out line is built for the signed-in man only (`allNoticesFor(pid)`,
  `topbits.tsx` with `me()`); `sansFiledShown` reads the man's own records, and its days go only into his own line.
- **The fade (D2343, D2346):** `sansBeforeMine` reads the viewer's own posting only and is off for an admin; it reveals
  nothing of anyone else.
- **Counts:** `sansGate` and `sansCommittedOn` ask `sansOnP` per man per day, so a hidden man counts nowhere (S2 is about
  what is drawn, not counted).

## A question for the host to put to him (not filed as a finding)
D149 lets a member tick his own SANS on the Quals page. Ticked, he is SANS from today (D2313), so Hex — posted SANS from
Fri 17 — can tick himself on Wed 15 and file Thu 16 through the ordinary doors. D2340 reads as if his posting date is the
first day he can be filed for; with D149 it is not, for the man himself. Whether that is meant is his call, not a code
fault.

## Tests missing (beyond the file below)
- No test holds the `except` exemption to the man's own SANS record (S1).
- No test draws the board's or the week's SANS cards for a shared offer with one man hidden (S2) — the walk's W10-1 test
  covers the SANS day only.
- No gate test of a member's own-row write of `sanFrom` / `sanWas` (S3).

## The failing tests — `raptor-port/src/leavewar/sans-ahead-security152.test.ts`

```ts
/* THE SECURITY READ OF THE SANS-AHEAD ROUND (chat 152, 23 Nov 26 — D2340, D2341; D1411's reader looking only for holes).
   Each case is written to FAIL on the code as it stands; the host runs it before believing it.
   S1: the save boundary's "a day the entry being changed already held" (ui/inputedit.tsx sansRefusal `except`) is not tied
       to the man or to SANS availability — an admin puts Hex (posted out as SANS from Fri 17 Jul) into another man's
       offer on Thu 16 Jul, a day before his SANS date (D2340: "for days from its date").
   S2: a shared offer whose second man is not SANS that day is still drawn with his card on the schedule's SANS panels
       (the board, the week) — the hidden man shown (D2341: "hidden on every screen … as if deleted").
   S3: a member's own-row command may write his SANS stretches (sanFrom / sanWas) as he likes — the commit gate holds none
       of them — so the man himself makes a day before his SANS date a SANS day, and files it.
   The fixture is sans-ahead.test.ts's: the demo week of Mon 13 Jul 26, today Wed 15 Jul; `rocky` is Hex, a WSO (sign-in
   "hex", a member); Saber the admin ("ad"). */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { HOOKS, storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns, sansOnP } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS, holds, isSansAvail, inputsOn, sansAvailOn } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { NOTICES } from '../state/notices'
import { commitNewInput, commitInput, draftOf, fmt, sansRefusal } from '../ui/inputedit'
import { sbSansPanel } from '../ui/board-html'
import { sansSectionHTML } from '../ui/html'
import { commitPeopleEdit } from '../state/people-settings-commit'
import { initStore as lwInitStore, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const P = (id: string): any => (PEOPLE as any)[id]
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const THU = 3, SAT = 5
const THU_ISO = '2026-07-16', FRI_ISO = '2026-07-17', SAT_ISO = '2026-07-18'
const at = (y: number, m: number, d: number) => vi.setSystemTime(new Date(y, m - 1, d, 9, 0, 0))
const dt = (di: number): string => String((DAYS[di] as any).dt)
const toasts: string[] = []
const realToast = HOOKS.toast
const fileVia = (person: string, start: string, end?: string): boolean =>
  commitNewInput({ _new: true, person, type: 'SANS Availability', start, ...(end ? { end } : {}), allday: true, s: 360, e: 1080, sans: { f: true } })
/* a man SANS on every day of the week, of the admin's squadron (the W10-1 test's own pick) */
const otherSans = (): string => {
  const id = Object.keys(PEOPLE).find(k => { const p = P(k); return p.san && !p.sanFrom && !p.archived && !p.deleted && !p.special && !p.pers
    && (p.seat === 'FCP' || p.seat === 'RCP') && k !== 'rocky' })!
  expect(id, 'premise: a man SANS all week').toBeTruthy()
  expect(sansOnP(P(id), THU_ISO) && sansOnP(P(id), SAT_ISO), 'premise: SANS on Thu 16 and Sat 18').toBe(true)
  return id
}
const sansRecOf = (pid: string, iso: string): any =>
  INPUTS.find((r: any) => r && isSansAvail(r.type) && holds(r, pid) && r.date === fmt(iso))

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

const REFUSED = 'Hex is SANS from Fri 17 Jul: file SANS availability for days from then'

describe('S1 — a day before his SANS date, through an edit of someone else\'s offer', () => {
  it('the save boundary: Hex for Thu 16, handed another man\'s Thu 16 offer as "the entry being changed" — refused', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    const other = otherSans()
    expect(fileVia(other, THU_ISO), toasts.join(' | ')).toBe(true)
    const rec = sansRecOf(other, THU_ISO)
    expect(rec, 'premise: the other man\'s Thu 16 offer is saved').toBeTruthy()
    expect(holds(rec, 'rocky'), 'premise: Hex is not in it').toBe(false)
    expect(sansRefusal('rocky', { f: true }, THU_ISO, THU_ISO), 'premise: without `except`, refused').toBe(REFUSED)
    /* the bug: any record covering the day exempts it, whoever it held */
    expect(sansRefusal('rocky', { f: true }, THU_ISO, THU_ISO, rec)).toBe(REFUSED)
  })

  it('the window\'s save: the admin adds Hex to the other man\'s Thu 16 offer — refused, and Hex stays out of it', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    const other = otherSans()
    expect(fileVia(other, THU_ISO), toasts.join(' | ')).toBe(true)
    const rec = sansRecOf(other, THU_ISO)
    expect(rec).toBeTruthy()
    toasts.length = 0
    const ok = commitInput(rec, { ...draftOf(rec), sans: { f: true } }, [other, 'rocky'])
    expect(ok, 'Hex filed for Thu 16, a day before his SANS date: ' + toasts.join(' | ')).toBe(false)
    expect(holds(sansRecOf(other, THU_ISO), 'rocky')).toBe(false)
  })

  it('the save boundary: a record of another kind is no "entry being changed" for SANS availability', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    const personal = { type: 'Personal', date: fmt(THU_ISO), person: 'rocky', people: [{ p: 'rocky' }], allday: true }
    expect(sansRefusal('rocky', { f: true }, THU_ISO, THU_ISO, personal)).toBe(REFUSED)
  })
})

describe('S2 — a shared offer\'s hidden man is drawn on the schedule\'s SANS panels', () => {
  const sharedThenMoved = (): string => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    const other = otherSans()
    const ok = commitInput(null, { _new: true, person: other, type: 'SANS Availability', start: SAT_ISO, end: '', allday: true,
      sTime: '06:00', eTime: '18:00', remarks: '', sans: { f: true } }, [other, 'rocky'])
    expect(ok, 'premise: one offer for both men on Sat 18 (Hex filed ahead — D2340): ' + toasts.join(' | ')).toBe(true)
    /* his posting moved later: Sat 18 is no longer a SANS day of his (D2341 — his part hidden) */
    expect(postOut('rocky', '2026-07-24', 'sans')).toBe(true); raptorNotify()
    expect(sansOnP(P('rocky'), SAT_ISO), 'premise: Hex is not SANS on Sat 18').toBe(false)
    expect(inputsOn(dt(SAT)).some((r: any) => isSansAvail(r.type) && holds(r, 'rocky') && holds(r, other)), 'premise: the offer shows (the other man is SANS)').toBe(true)
    return other
  }

  it('the board\'s SANS panel on Sat 18 draws the other man and not Hex', () => {
    const other = sharedThenMoved()
    const html = sbSansPanel(DAYS[SAT], SAT)
    expect(html, 'premise: the other man\'s card').toContain(`data-person="${other}"`)
    expect(html).not.toContain('data-person="rocky"')
  })

  it('the week\'s SANS section on Sat 18 draws the other man and not Hex', () => {
    const other = sharedThenMoved()
    const html = sansSectionHTML(DAYS[SAT], SAT, true)
    expect(html, 'premise: the other man\'s card').toContain(`data-person="${other}"`)
    expect(html).not.toContain('data-person="rocky"')
  })

  it('"has Hex SANS availability on Sat 18?" answers no', () => {
    sharedThenMoved()
    expect(sansAvailOn('rocky', dt(SAT))).toBeNull()
  })
})

describe('S3 — the man himself makes a day before his SANS date a SANS day', () => {
  it('a member\'s own-row command writing his SANS stretches back in time — refused; Thu 16 stays unfileable', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    signInAs('hex')
    expect(sansOnP(P('rocky'), THU_ISO), 'premise: Thu 16 is not SANS for him').toBe(false)
    const r: any = commitPeopleEdit(() => { P('rocky').sanWas = [['2026-07-01', FRI_ISO]] }, { owner: 'rocky' })
    expect(!!r && r.ok === false, 'a member wrote his own SANS stretch').toBe(true)
    expect(sansOnP(P('rocky'), THU_ISO)).toBe(false)
    expect(fileVia('rocky', THU_ISO)).toBe(false)
  })
  it('the same with the day his tick counts from (sanFrom) set back', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    signInAs('hex')
    const r: any = commitPeopleEdit(() => { const p = P('rocky'); p.san = true; p.sanFrom = '2026-01-01' }, { owner: 'rocky' })
    /* (a tick by hand counts from the day it is made — D2313; the Quals door writes today, never a date of his choosing) */
    expect(!!r && r.ok === false, 'a member set his own SANS from 1 Jan').toBe(true)
  })
})
```

Notes for the host on running it: every case carries "premise" checks, so a failure for a reason other than the claim
says so in its own words. S1's window case and S2's set-up save through `commitInput` as the admin; if either premise
fails for a reason unrelated to SANS (a squadron rule, an OIL question), the boundary case of S1 and the drawing cases of
S2 still stand on their own.
