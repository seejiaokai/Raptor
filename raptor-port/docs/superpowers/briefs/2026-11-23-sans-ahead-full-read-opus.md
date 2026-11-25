# Fresh, blind Opus read — FULL check of claude/allavail-sans-postout-141's last round (D2340, D2341, D2342, D2346), chat 152, 23 Nov 26

Read only, in `D:\raptor-work\c152-read\opus`. No other reader's or walker's report looked for or seen. Nothing in the copy
was changed; the failing tests are given in full at the end (one new file, `raptor-port/src/leavewar/sans-ahead-opusread.test.ts`,
on sans-ahead.test.ts's own fixture). Tests could not be run here (no packages) — the host runs them.

Demo week Mon 13 Jul 26, today Wed 15 Jul; Hex = `rocky`; "Other" below = any man SANS today in a flying seat of the home
squadron with nothing filed on Thu 16 / Fri 17 (the walk test's own way of finding one).

## Findings

### F1 — MEDIUM — a shared SANS offer still draws the man who is NOT SANS that day, on Edit Schedule's week and on the board
- State: Saber files ONE offer on Fri 17 Jul for Other and Hex while Hex's posting is from Fri 17 (D658 allows one offer for
  several). Saber then moves Hex's posting to Fri 24 Jul (the walk's own W10-1 case). Fri 17 is no longer a SANS day of Hex's.
- What the app does: Edit Schedule's week, day Fri 17, "SANS Avail" group draws TWO cards — Other's and Hex's (Hex's puck,
  letters, times, a tap opening the record). The board's SANS Avail panel the same.
- The rule: D2341 — hidden on a day he is not SANS, "on every screen", as if deleted. The SANS calendar's opened day already
  hides him (sansDayGroups, and W10-1 cut him from the placed line), so the two scheduler surfaces now disagree with it.
- Cause: `ui/html.ts sansSectionHTML` and `ui/board-html.ts sbSansPanel` take `inputsOn(d.dt)` (which keeps the whole record
  because ONE of its men is SANS — `engine/inputs.ts sansShownOn`'s "shown while one of them is SANS") and then
  `.flatMap(facesOf)` — a face for EVERY man in it, with no day question per face.
- Fix: 1. add to engine/inputs.ts `sansFacesOn(r, iso)` = `facesOf(r).filter(f => sansOnP(PEOPLE[f.person], iso))` (a face of
  a man no longer on the roster kept, as sansDayGroups keeps it). 2. Use it in both builders in place of `facesOf`, the iso
  being `dayIso(String(CURWEEK), di)`. 3. Nothing else reads a face list of SANS records by day (the crew list's SANS
  section and its count ask `sansOn` per man first; sansCommittedOn and the warning list judge per man).
- Test: written (F1 in the file below) — red today.

### F2 — MEDIUM — "a day the entry being changed already held" is not asked per man: an admin can put a man on an existing offer for a day before his SANS date
- State: Hex posted out as SANS from Fri 17 Jul (saved Wed 15). Other has an offer for Thu 16 Jul. Saber opens Other's offer,
  sets its date to Fri 17 (the picker now offers Hex), ticks Hex, sets the date back to Thu 16, Save. Or: the one-man swap
  (the schedule's reassign / the request door — `commitInputEdit(r, {...draftOf(r), person: 'rocky'})`).
- What the app does: saved. Hex is now on an offer for Thu 16 — a day before his SANS date — with no refusal. In the shared
  case, Thu 16 shows (Other is SANS), so F1 then draws Hex's card on the week and the board on a day he is a regular.
- The rule: D2340 — filed "for days from its date … by the day filed"; the build's own words on `sansRefusal`: "a filing
  never holds a day it would be hidden on, save a day the entry being changed already held" — meant for HIS own days.
- Cause: `ui/inputedit.tsx sansRefusal` — `if (sansOnP(p, d) || (except && inputCoversDate(except, fmt(d)))) continue` exempts
  every day the record covers, whoever it covered it for. `commitInput` asks it once per man with `rec` as `except`
  (`normalizeInputDraft({ ...draft, person: p }, rec)`), and `commitInputEdit`, the reassign (`reassignInput`, both branches)
  and `ui/reqdoor.ts` do the same with a new person. The people picker filters by the draft's FIRST day, but keeps a man
  ticked when the date is changed afterwards, so the save is the only guard.
- Fix: 1. In `sansRefusal`, exempt a day only where the entry already held it FOR HIM: `(except && holds(except, person) &&
  inputCoversDate(except, fmt(d)))` (`holds` from engine/inputs). 2. No other change — the swap, the window and the drag all
  go through it.
- Test: written (F2a, F2b, F2c) — red today.

### F3 — LOW (a ruling's record and the build disagree — his word or the row) — a run that starts before his SANS date
- D2340's row, "the agent's readings, told to him in the closing report": "a filing is accepted when he is SANS on at least
  one of its days, its other days hidden (D2341), and one with none is refused". The build refuses ANY day before his date
  (`sansRefusal` walks every day; `sans-ahead.test.ts` pins `fileVia('rocky', '2026-07-16', SAT_ISO)` → false; walk W8-1
  pins the drag Thu 16 → Sat 18 refused with "Hex is SANS from Fri 17 Jul: file SANS availability for days from then").
- The build's way is arguably better (D2340 says "for days from its date"), but he was told the other one. Either the row's
  reading is corrected and told to him, or the build follows the reading. No test written — the behaviour is pinned the
  build's way on purpose.

### F4 — LOW (a question for him) — the posting put back: his bell still says the day is hidden
- State: Hex's posting from Fri 17; he files Sat 18; Saber moves the posting to Fri 24 → Hex gets "Your SANS availability for
  Sat 18 Jul is hidden while you're not SANS that day."; Saber moves it back to Fri 17.
- What the app does: Sat 18 shows and counts again (right, D2341), but the hidden-line stays on his bell, unstruck, still
  saying Sat 18 is hidden. The second change hid nothing, so no new line; nothing takes the first back.
- The rule: D2341 ("back by itself"), D1693/D1699/D1710 (a line is taken back by what undoes it — a posting moved is such a
  change, D1710). No ruling says what happens to the hidden-line when the day comes back; a line that is now false sits there.
- Cause: `leavewar/sansunfiled.ts sansTakeBack` only ever writes; nothing looks at earlier `sansback` lines' `hid` days.
- Fix (if he wants it): in `sansTakeBack`, for each earlier stored `sansback` line of his whose `hid` days are now SANS again:
  unread → removed; read → struck, "taken back · <who>" (D1699's way) — and the gate (`sansBackCovered`/perms) taught that a
  removal or a struck copy is owed by the same change. Put to him first.
- Test: written (F4) — red today; it asserts only that no plain "is hidden" sentence about Sat 18 remains.

### F5 — LOW (a question for him) — struck words he never saw
- State: Hex files every day he is planned (so his live line never existed), or never opens it; Saber moves the posting to
  Fri 24.
- What the app does: his bell gets "~~You're SANS from Fri 17 Jul.~~ · taken back · Saber" then the hidden sentence
  (`state/notices.ts noticeWords` — `nameStruck: true` always for `sansback`; `sans-ahead.test.ts` pins it).
- The rule: D1699 — read keeps its words struck; UNREAD simply goes. He never saw "You're SANS from Fri 17 Jul." (the
  posting's own line goes to admins only), so it is a struck "taken back" of a line that, for him, never existed.
- Fix (if he agrees): `noticeWords` strikes the first sentence and prints "taken back" only when `days` is not empty; with
  `days` empty the line is the D2341 sentence alone (+ who). Test F5 written, but it reverses an expectation the build pins on
  purpose — his call first.

### F6 — LOW (docs, D200 mirror) — data-model.md §11 still describes the old `sansback`
- `raptor-port/docs/data-model.md` line 1716 (the Notice row): "owed only by a real take-back of his SANS posting that has
  RUN … a new or unrun posting … owes none", and only where he had READ his line. The code now owes one for a posting NOT
  yet run (`sansBackOwed`'s second branch) and writes/admits a line with nothing struck and only `hid` days, read or not
  (`sansBackCovered`: `if (!days.length) return true`). notifications-register B13 is up to date; §11 is not. Fix: rewrite
  that sentence of the row to B13's terms (run or not yet run; `days` only where read; `hid` exactly what the change hid; at
  least one of them).

### F7 — LOW (speed) — a scan of every input, for every man ever posted out as SANS, before every command in the app
- `leavewar/sansunfiled.ts wireSansBackBefore` runs on EVERY command's start (a drag of a puck, a remark, anything). For each
  man whose posting record is SANS — `sansPostedFrom` is true for a posting that ran long ago as well as one waiting — it now
  also runs `sansFiledShown`: a pass over ALL of INPUTS (`namedOf` each), then each of his SANS records day by day from today.
  It also recomputes `sansUnfiledDays` for each such man (the cache is keyed on the store's version, which every command
  moves) — the loaded week plus every saved week, `dayEngaged` and `sansAvailOn` per day. This is per command, not per draw;
  it grows with every SANS posting the war keeps.
- Fix: 1. Only the posting command needs BEFORE: memoise `men` on (raptorVersion, the war's state object, today) exactly as
  `CACHE` is, so a run of commands with no change in between costs one build. 2. In `sansFiledShown`, one pass over INPUTS
  building a map person → SANS records for all the men at once, not one pass per man. Not timed here (no packages).

### F8 — LOW (defence in depth; for the security read, D1411) — "by the day filed" lives only in the windows' save
- `state/perms.ts` holds who may file SANS availability for whom (a member only his own — `memberFilesForOthers` excludes
  it; unchanged, correct), but no check that the man is SANS on the days filed; `sansRefusal` is a screen-side check. A
  command built by hand (or another device's) can store a SANS offer for days before his date. Bounded by D2341 (it is
  hidden on those days), so no wrong count — but with F1 unfixed a shared record would draw it. Not new in kind (before this
  round the screen-side check was the only one too). Note for the security reader; fix only if he wants the gate to hold it.

## The five questions, answered

1. **Readers.** Counts are right everywhere: the warning list (`validate.ts` asks `sansOnP` before `sansGate`), the crew
   list's SANS section and its "free" count (per man, `sansOn` first), the SANS calendar's figures (`sansCommittedOn` per man),
   the opened day (`sansDayGroups`), the Inputs list's SANS tab (`sansShownAny`), the day readers `inputsOn` / `inputsOnDay` /
   `inputsFor`. Shown wrongly: **F1** (a shared offer's non-SANS man on the week and the board). A published face is its frozen
   copy and does not hide — consistent with D44/D45: the live side (`frozenInputMatch` reads `inputsFor`, which now hides)
   loses the record, so the published day reads pending, as a change to what it shows should (D178). The Leave War, Insights
   and the change history read no SANS availability by day; the inputs export is gone (D773). Wrongly hidden: none found —
   `sansShownOn` hides only where no named man is SANS that day; a run posting, a waiting one and an ended stretch all read
   through `sansOnP`.
2. **Who may file for whom.** A member cannot file or change another man's SANS offer (`memberFilesForOthers`, the commit
   gate — unchanged). Before-the-date doors: the SANS calendar's drag and keys (`openSansAdd` asks the first day; the save
   asks every day), the window with its dates changed after opening (refused at the save), a posting changed while a window is
   open (refused at the save, naming the new date), the people lists (by the draft's first day) — all hold, **except F2**: an
   existing offer's days are exempt for ANY man put on it (window add after a date change, the swap, the request door). The
   save boundary itself holds no day rule (F8). No paste door for inputs exists.
3. **Bell lines.** The reminder: worked out from the posting's save (`sansPostedFrom`), the cache keyed on the store's version,
   the war's state and the date, over the loaded week and the saved weeks — it appears at once after the save and after an
   edit of any held week. Dated the posting's midnight (future): no age, read by id — fine. The take-back: one line a man and
   posting (`sansBacks`), struck days exactly his live line's at the command's start and only where read (saved record), hid
   days exactly the filed days the change hid, today on; a forged or padded line is refused (the existing gate tests cover
   made-up and missing days). Open: **F4** (the line after the posting is put back), **F5** (struck words he never saw);
   docs **F6**.
4. **Speed.** The day readers add one cheap question per SANS record per day read (the posting lookup is precomputed per war
   change). `sansShownAny` stops at the first SANS day. The SANS calendar's fade asks one lookup per day. The one real cost is
   **F7** (per command, not per draw).
5. **Tests missing.** A shared offer on the week and the board (F1); a man put on an existing offer before his date, by the
   window and by the swap (F2); the posting put back after a hiding (F4); a struck line with nothing he saw (F5, after his
   word). Also untested, no fault found: an archive by hand of a man whose SANS posting is waiting (owes a line in the gate, none
   written — by design); a published Sat 18 reading pending after the posting moves (D178).

## The tests — new file `raptor-port/src/leavewar/sans-ahead-opusread.test.ts`

F1, F2a–c and F4 are expected RED today. F5 reverses `sans-ahead.test.ts`'s pinned `nameStruck: true` — run it only if he rules
for F5.

```ts
/* THE FRESH OPUS READ OF THE FULL CHECK (chat 152, 23 Nov 26) — each case red on the build as read.
   Fixture: sans-ahead.test.ts's own — the demo week of Mon 13 Jul 26, today Wed 15 Jul; `rocky` is Hex ("hex"); Saber ("ad"). */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { HOOKS, storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns, sansOn } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS, sansAvailOn, idsOf, inputCoversDate } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { NOTICES, noticesFor, noticeWords, type Notice } from '../state/notices'
import { commitNewInput, commitInput, commitInputEdit, draftOf, sansRefusal } from '../ui/inputedit'
import { sansSectionHTML } from '../ui/html'
import { sbSansPanel } from '../ui/board-html'
import { initStore as lwInitStore, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const FRI = 4, SAT = 5, THU_ISO = '2026-07-16', FRI_ISO = '2026-07-17', SAT_ISO = '2026-07-18'
const at = (y: number, m: number, d: number) => vi.setSystemTime(new Date(y, m - 1, d, 9, 0, 0))
const dt = (di: number): string => String((DAYS[di] as any).dt)
const toasts: string[] = []
const fileVia = (person: string, start: string, end?: string): boolean =>
  commitNewInput({ _new: true, person, type: 'SANS Availability', start, ...(end ? { end } : {}), allday: true, s: 360, e: 1080, sans: { f: true } })
const backLines = (pid: string): Notice[] => noticesFor(pid).filter(n => String((n.what || [])[0]?.k) === 'sansback')
/* a man SANS today, in a flying seat, with nothing filed on Thu 16 or Fri 17 — not Hex */
const sansToday = (): string => Object.keys(PEOPLE).find(id => {
  const p: any = (PEOPLE as any)[id]
  return id !== 'rocky' && p && sansOn(id, '2026-07-15') && !p.archived && !p.deleted && !p.special && !p.pers
    && (p.seat === 'FCP' || p.seat === 'RCP') && !sansAvailOn(id, 'Jul 16') && !sansAvailOn(id, 'Jul 17')
})!
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

describe('F1 — a shared offer draws only the men SANS that day (D2341), on the week and the board', () => {
  it('one offer for Other and Hex on Fri 17, Hex\'s posting moved to Fri 24: no card for Hex', () => {
    const other = sansToday()
    expect(other, 'premise: a man SANS today').toBeTruthy()
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(fileVia(other, FRI_ISO), toasts.join(' | ')).toBe(true)
    const rec: any = INPUTS.find((r: any) => r.type === 'SANS Availability' && idsOf(r).map(String).includes(other) && inputCoversDate(r, 'Jul 17'))
    expect(commitInput(rec, draftOf(rec), [other, 'rocky']), toasts.join(' | ')).toBe(true)   // D658: one offer for two
    expect(postOut('rocky', '2026-07-24', 'sans')).toBe(true); raptorNotify()
    expect(sansOn('rocky', FRI_ISO), 'premise: Fri 17 is no SANS day of Hex\'s').toBe(false)
    const week = sansSectionHTML(DAYS[FRI], FRI, true)
    expect(week, 'premise: Other\'s card is drawn').toContain(`data-person="${other}"`)
    expect(week, 'Edit Schedule\'s week').not.toContain('data-person="rocky"')
    expect(sbSansPanel(DAYS[FRI], FRI), 'the board').not.toContain('data-person="rocky"')
  })
})

describe('F2 — a man put on an existing offer is refused for a day before his SANS date', () => {
  const setUp = () => {
    const other = sansToday()
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(fileVia(other, THU_ISO), toasts.join(' | ')).toBe(true)
    const rec: any = INPUTS.find((r: any) => r.type === 'SANS Availability' && idsOf(r).map(String).includes(other) && inputCoversDate(r, 'Jul 16'))
    expect(rec, 'premise: Other\'s Thu 16 offer').toBeTruthy()
    expect(sansOn('rocky', THU_ISO), 'premise: Thu 16 is before Hex\'s date').toBe(false)
    return { other, rec }
  }
  it('F2a — the save\'s own question: Other\'s Thu 16 entry does not exempt Hex\'s Thu 16', () => {
    const { rec } = setUp()
    expect(sansRefusal('rocky', { f: true }, THU_ISO, THU_ISO, rec)).toBe('Hex is SANS from Fri 17 Jul: file SANS availability for days from then')
  })
  it('F2b — the window: Hex added to Other\'s Thu 16 offer is refused, the offer left as it was', () => {
    const { other, rec } = setUp()
    expect(commitInput(rec, draftOf(rec), [other, 'rocky'])).toBe(false)
    expect(idsOf(rec).map(String)).not.toContain('rocky')
  })
  it('F2c — the swap (reassign, the request door): Hex put in Other\'s place on Thu 16 is refused', () => {
    const { other, rec } = setUp()
    expect(commitInputEdit(rec, { ...draftOf(rec), person: 'rocky' })).toBe(false)
    expect(idsOf(rec).map(String)).toEqual([other])
  })
  it('left as it is: Hex\'s OWN entry keeps a day it already held when he changes its letters', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(fileVia('rocky', SAT_ISO), toasts.join(' | ')).toBe(true)
    const rec: any = INPUTS.find((r: any) => r.type === 'SANS Availability' && idsOf(r).map(String).includes('rocky') && inputCoversDate(r, 'Jul 18'))
    expect(postOut('rocky', '2026-07-24', 'sans')).toBe(true); raptorNotify()
    expect(sansRefusal('rocky', { o: true }, SAT_ISO, SAT_ISO, rec)).toBe('')
  })
})

describe('F4 — the posting put back: no line still says the day is hidden (a question for him)', () => {
  it('moved to Fri 24 then back to Fri 17: Sat 18 shows again, and the bell no longer says it is hidden', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(fileVia('rocky', SAT_ISO), toasts.join(' | ')).toBe(true)
    expect(postOut('rocky', '2026-07-24', 'sans')).toBe(true); raptorNotify()
    expect(backLines('rocky').some(n => (noticeWords(n).more || '').includes('Sat 18 Jul')), 'premise: told it is hidden').toBe(true)
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(sansAvailOn('rocky', dt(SAT)), 'premise: it shows and counts again').toBeTruthy()
    expect(backLines('rocky').filter(n => (noticeWords(n).more || '').includes('Sat 18 Jul'))).toEqual([])
  })
})

/* F5 reverses sans-ahead.test.ts's pinned `nameStruck: true` — run only once he rules on it */
describe.skip('F5 — no struck words he never saw (a question for him)', () => {
  it('every day filed, so never a live line: the take-back strikes nothing', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(fileVia('rocky', SAT_ISO), toasts.join(' | ')).toBe(true)
    expect(postOut('rocky', '2026-07-24', 'sans')).toBe(true); raptorNotify()
    const w = noticeWords(backLines('rocky')[0]!)
    expect(w.nameStruck).toBeFalsy()
    expect(w.what).not.toBe('taken back')
  })
})
```

Notes for the host running them: F1 and F2 depend on `sansToday()` finding a man (the walk test's same premise). F1's setup
files the shared offer through the window's save while Hex IS SANS on Fri 17, so it uses no hole — it is the W10-1 state.
`draftOf` returns `start` as yyyy-mm-dd (it is what `commitInput` compares), so `sansRefusal`'s day walk runs in F2b/F2c.
