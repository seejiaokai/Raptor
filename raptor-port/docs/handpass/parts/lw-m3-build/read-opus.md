# The M3 build's FULL check — the fresh, blind Opus code read (D790, D903)

Read 25 Oct 26 by a fresh Opus reader who did not write the change and has not seen the chat that did. Scope:
`git diff 08cc09eac HEAD -- raptor-port/src` on `claude/lw-m3-placing-leave` (78 files), read beside the evidence sheet,
the designer's part and both walkers' reports, with every reader of the changed rules searched across the whole of
`src`. Read only: no project file changed. Where a claim needed proof it was run as a scratch test OUTSIDE the repo
(the scratchpad's `vt/probe.test.ts` and `vt2/probe2–4.test.ts`, each run alone against the source); each finding says
which. Not a finding by D56: a "Fly with" or UNA record already stored, or a seeded course or Attach with no `acc`.

**8 findings, 11 questions.** Ranked by harm — who counts as away and what is published first, then roles, then the screens.

## Findings

### F1 — The Scheduler Board's Ground "+ Inputs" ignores an Other's "Goes to: Unavailable", and lands a one-man Attach on the Ground Programme — the opposite of what the same window does for two men

- **Steps.** Scheduler Board → a day's Ground Programme panel → "+ Inputs" → type Other, Ranger, whole day → Goes to
  **Unavailable** (the window offers it; its grey line reads "Counted as away on the Leave War") → Add. Toast: "Input
  added to the Ground Programme". The row is on the Ground Programme; the Leave War counts Ranger **in**.
  The same with an **Attach** (no Goes to): it lands on the Ground Programme and the war counts him in — D1374 says an
  Attach lands under Unavailable by itself and counts him out.
  The same window with **two people** picked goes the other way: the Other and the Attach both land under Unavailable.
- **Proved** (scratch `vt2/probe2.test.ts`): one man, Other, goes 'u' → `acc:'g'`, on the Ground Programme, `warCounts`
  false; two men, same draft → `acc:'u'`, no ground row, `warCounts` true; one man, Attach → `acc:'g'`, `warCounts` false.
- **Cause.** `src/ui/inputedit.tsx:1040` writes `acc:'u'` only when `!toGround`, and `:1079–1087` then lands the row on
  the programme; the one-person save passes `toGround = ctx === 'g'` (`:2661`), but the several-people save goes through
  `commitInput`, which calls `commitNewInput({...}, false, …)` (`:2080`), so the Ground panel's own rule is lost there.
  The Goes to row is drawn in `ctx 'g'` (`:3053` excludes only `'s'` and `'up'`).
- **Fix (recommended).** Let the filing win on the Ground panel too: at `:1040` drop the `!toGround &&`; at `:1079` land
  the row only `if (toGround && row.acc !== 'u')`; at `:2672` say "Input filed under Unavailable" when the saved row's
  `acc` is `'u'`. One man and several then agree, the window's Goes to does what it says, and an Attach keeps D1374.
  (A course from that panel would then go under Unavailable too — D1372's "so the schedule and the Leave War agree".)
  **The other way**, if the Ground panel must always mean "on the programme": add `ctx !== 'g'` to `:3053` so Goes to is
  not offered there, and pass `toGround` through `commitInput`'s new-input path so several people land on the programme
  too — but then an Attach from that panel stays off the war against D1374, which needs his word.

### F2 — A cancelled (CX) or information-only commitment under Unavailable still counts him out on the Leave War

- **Steps.** Edit Schedule: Ranger's Other (or Training) on the Ground Programme → CX its row ("WX") — the input itself
  is cancelled (D760). Then either open its window and pick Goes to **Unavailable** (an Other), or Reject → "→ Unavail"
  (any commitment). The cancel goes with the input (D760: "it goes with the input if it moves"). The Leave War now shows
  OTH / TRG on that day and Available P one lower; the SANS calendar's "still needed" one higher. Everywhere else the app
  treats that input as silent: no warning (`engine/inputs.ts inputFlags`), no OIL (`engine/oilev.ts landedStanding`
  reads `cx` before `'u'` for exactly this state — "found by the re-expressed tests, 12 Oct 26"), and the ALL AVAIL crowd
  frees him (`leavewar/sync.ts:1181`, "its people are free for whoever else needs them"). On the Unavailable list there is
  no row to take the CX off again. The same for the ⓘ "information only" mark.
- **Proved** (scratch `vt/probe.test.ts`): `warCounts({type:'Training', acc:'u', cx:true})` → true;
  `warCounts({type:'Other', acc:'u', info:true})` → true.
- **Cause.** `src/leavewar/absences.ts:127` — `return row.acc === 'u' && isPersonal(row.type)` never asks `inputSilent`.
- **Fix.** `return row.acc === 'u' && isPersonal(row.type) && !inputSilent(row)` (import `inputSilent` from
  `../engine/inputs`). `absenceSignature` already turns empty when `warCounts` is false, so the index rebuilds when the
  mark goes on or off. (A cancelled COURSE on the Ground Programme still counts by its kind — older; see Q1.)

### F3 — An Attach's "To" changed on a published day is no pending change: the issued schedule keeps the old "To" and the change can never go out; the change history writes no line for it

- **Steps.** A published day holding Hunter's "Attach · 145 Sqn" under Unavailable. Open it (Inputs page), change To to
  "149 Sqn", Save. The working copy's Unavailable row reads "Attach · 149 Sqn"; the day reads **0 pending**, no AL is
  offered, the four sign-offs stand; the issued face (View-only Sched, a member's view) keeps "Attach · 145 Sqn" — it
  draws the input's frozen copy (`engine/publish.ts dayInputsFrozen`, a full copy). The changes window has no line.
  A title changed the same way reads pending (D715/D178) — the "To" is drawn in the same name (`inpLabel`).
- **Proved** (scratch `vt2/probe4.test.ts`): `inpDetailKey` of the Attach before and after the To change → equal; of a
  Training before and after a title change → different.
- **Cause.** `src/engine/inputs.ts:210` puts `title` in `inpDetailKey` (what an input says on an issued day) but not
  `to`; `src/state/changelines.ts:162` compares only `titleOf(…)`, so a To change writes nothing (D263: every change to an
  input is a line). (The bell does tell him — `notices.ts` compares `inpLabel`.)
- **Fix.** `inputs.ts:210` add, beside the title, `...(isFly(inp.type)&&toOf(inp.to)?{to:toOf(inp.to)}:{})` (named only
  where present, so every other key stays byte for byte); `changelines.ts` after `:162` add
  `if (isFly(a.type) && toOf(b.to) !== toOf(a.to)) logAction(null, \`${who} · ${spanWords(sa)} · to\`, base({ from: toOf(b.to) || '—', to: toOf(a.to) || '—' }))`.

### F4 — An Other or an Attach filed from the Leave War is written in the change history as "approved on the Leave War"

- **Steps.** Admin, Leave War, a free day for Ranger → ⋯ → Other (or Attach). The changes window (and, on a published
  day, its "To go out" list) reads "Ranger · Other approved on the Leave War · 11 Feb" — nothing was approved; it was
  filed straight, as round 2's F1 fixed for a course and an overseas duty ("added").
- **Proved** (scratch `vt/probe.test.ts`, the set-up of `leavewar/changelines-lw.test.ts`): OD → `"Ranger · OD added ·
  11 Feb"`; OTH → `"Ranger · Other approved on the Leave War · 11 Feb"`; ATCH → `"Ranger · Attach approved on the Leave
  War · 11 Feb"`.
- **Cause.** `src/state/changelines.ts:105` — `FILED_ON_WAR = new Set(['CSE', 'OD'])`; `warsOwn` (`:106`) then treats an
  'Other' / 'Attach' input written by a Leave War command as a war decision (`warInputLines`, `:299`).
- **Fix.** `const warsOwn = (x: any): boolean => !!x && isLeave(x.type)` — only a leave is ever a war decision — or at
  least add 'Other' and 'Attach' to `FILED_ON_WAR`; and a test beside round 2's "a course or an overseas duty filed on
  the war is added, never approved" (`changelines-lw.test.ts:382`) for OTH and ATCH.

### F5 — On a desktop with the day panel open, the manning bubble is lifted to the top of the screen, not the foot (D1358)

- **Steps.** His PC (1536 × 864): Leave War → press a date's header (the day panel opens — on a desktop it is a floating
  window at the top right, `22-float-windows.css` `top:96px`) → place a bid that turns a row red. The bubble's bottom is
  set to about 864 − 96 + 12 = 780 px: it stands at the top of the screen, where the app's top bar is, instead of at the
  foot. Not walked: W1 9 had the panel on a phone, W1 10 had no panel.
- **Cause.** `src/leavewar/ui/Matrix.tsx:1476–1481 panelLift` lifts above any `win-lwday` whose top is on screen; only a
  phone's panel rests at the foot (`FloatWindow.tsx` `sheet = rests && phoneLayout()`). The unit test
  (`bidbubble.test.tsx:466`) places its fake panel at the foot only.
- **Fix.** In `panelLift`, `if (!phoneLayout()) return 0` (import `phoneLayout` from `../../ui/floatwin`) — or lift only
  when the panel reaches the foot (`r.bottom >= window.innerHeight - 2`). A test with the panel at `top: 96`, desktop.

### F6 — His bell says nothing when his Other leaves Unavailable through "Goes to"; the opposite move tells him

- **Steps.** Admin opens Ranger's Other (Ground Programme) → Goes to Unavailable → Save: Ranger's bell "Filed under
  Unavailable · Saber". Then Goes to Ground Programme → Save: **nothing** — though the war now counts him in again and
  the row is back on the programme.
- **Proved** (scratch `vt2/probe3.test.ts`, signed in as Saber): after the first save his new notices are
  `[{"k":"unav"}]`; after the second, `[]`.
- **Cause.** `src/state/notices.ts:103` — "Taken out of Unavailable" only when the input goes to `'r'`. D815's reading
  (2) rested on "no button does it"; the Goes to button (D1356) now does.
- **Fix.** `else if (b.acc === 'u' && a.acc !== 'u') out.push({ k: 'unavoff' })`; correct D815's reading (2) where it lives
  (`ui-contracts.md` §The bell's list of notices).

### F7 — After an Attach is filed from the Leave War, Undo's name leaves the Attach out

- **Steps.** War → ⋯ → Attach. The top bar's Undo reads "Undo — filing a course, an overseas duty or an Other".
- **Cause.** `src/undo/describe.ts:82` — the one phrase for `lw.file`.
- **Fix.** "filing a course, an overseas duty, an Other or an Attach" (or name the kind filed, from the input change).

### F8 — The change history's line for a new input filed under Unavailable does not say so; one landed on the programme does

- **Steps.** A course (or an Attach, or an Other with Goes to Unavailable) filed on the Inputs page — on a published day
  its "To go out" line reads "Ranger · CSE added · 14 Jul–15 Jul", while a Training reads "… added · 15 Jul (on the
  programme)". Where it went is in no line until it is moved again.
- **Cause.** `src/state/changelines.ts:126` names only `'g'`.
- **Fix.** `${accNow(a) === 'g' ? ' (on the programme)' : accNow(a) === 'u' ? ' (under Unavailable)' : ''}`.

## Questions (no failure shown — for the host to judge or put to him)

1. **A rejected course still counts him out.** `warVisible` counts a course by its kind whatever its `acc`, so a
   scheduler's Reject on a course — now a button on every course, since every course sits under Unavailable (D1372) —
   leaves the war's count unchanged, while the ALL AVAIL crowd treats a rejected input as silent everywhere
   (`sync.ts:1172`, "A REMOVED REQUEST IS SILENT EVERYWHERE"). D1357's two readings pull apart here: "a course … counts him
   out wherever it sits" and "one taken back out of Unavailable (Reject) counts him in again". (A cancelled course on the
   Ground Programme counts too — older.)
2. **The crew list now draws a man on a course as free.** On the Ground Programme a course's row faded him ("already
   tasked today"); under Unavailable (D1372) there is no row, and a course is not `isAway`, so with no seat armed he is in
   full colour; armed, only "already on CSE" advises. An overseas duty is struck, an Attach under Unavailable is struck
   (`isAway`). The same for any commitment moved "→ Unavail". The warning list still flags him if planned.
3. **The board's Unavailable "+ Add" offers only leave, medical and an overseas duty** (`TYPE_ALLOW.u`), not a course, an
   Attach or an Other, though those now land on that list.
4. **A member can undo a scheduler's filing of his Other.** G5 guards only a Reject, and only the Goes to buttons: a
   member's Goes to still overrides a scheduler's "→ Unavail" or "→ Ground"; and a member's retype of a rejected Other to an
   Attach revives it straight under Unavailable, counting him out (the older "a retype revives a dormant record" rule).
5. **A member may file an Attach for another man on the Inputs page** (D655's "duties and commitments") — it lands under
   Unavailable and counts that man out with no approval; D1379's "his own row only" is the war's rule alone.
6. **The drag window's one-entry prefill travels.** Over one entry the box opens with its remark (D1362); filing a course,
   an Other or an Attach, or placing leave over the same drag (free days included), carries that remark — a leave's
   "Wedding" onto a course.
7. **A war-filed Other beside one on the Ground Programme.** The duplicate check (`sync.ts doorFile`) reads only the war's
   boxes, so a day holding an Other on the programme gets a second Other input for that man and day.
8. **A joined commitment bar wears the join's 1px .85 edge**, not D1370's 1.5px .78 (`matrix.css` — the join's
   `:is(.c.s-a.jl, .c.s-a.jr)` rule outranks the outlined rule).
9. **Stale comments** the build left: `engine/inputs.ts:405–408` (UNA "is the LEAVE WAR's own record", "unagone.test.ts"),
   `leavewar/ui/Matrix.tsx:3589–3590` (a day holding a UNA). record-decisions says they are fixed with the change.
10. **`joinClasses` cost on the year grid** (D991): up to six days' boxes per cell, and a store read per bid, on every
    month a row draws — not measured.
11. **Two separate entries with the same remark** in the drag window: no grey line and an empty box — not ruled either way.

## What was read and found right (no action)

`warCounts` is read by every reader of the count — the absence index, Undo's restore check and landing (G1), the
signature (now with `acc`); no reader still asks `warVisible` where it should ask `warCounts` (the input gate's clash and
bid-replacement rules keep `warVisible` on purpose — G2). Goes to on new / filed / rejected, in both roles, and the
retype branches of `commitInputEdit` match the rulings as built (G3, G4, G5). A war-filed Other or Attach is filed with
`acc:'u'`, its half, its words, on the window's Duration; the OIL question follows it; a member is refused Other in the
store as well as on screen; a member's ⋯ holds Attach alone, on his own row only. The decided Approve / Refuse: one
lit at a time, the second tap back to waiting, nothing lit over a drag or on a member's own refused bid. The joined
bar never joins two input ids; a spill tail is in no window's list. A filing change on a published day reads as a
pending amendment (`publish.ts filingDelta`: absent → 'u' is a delta) and the issued face reads the frozen copies.
OIL: an input under Unavailable reads 'unlanded', which credits his own answer as a landed row does.
