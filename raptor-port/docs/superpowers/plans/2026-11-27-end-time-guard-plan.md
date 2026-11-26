# [END-TIME-GUARD] — the build plan, REVISED by the builder (27 Nov 26, overnight, chat 202's night)

Revision 1, by the overnight builder (Opus), on the two blind red-team reads of the first plan — Astra's
(`briefs/2026-11-27-end-time-redteam-astra.md`, "not build-ready") and a fresh Opus's
(`briefs/2026-11-27-end-time-redteam-opus.md`, "revise before building") — and Fable's cold read of the words
(`briefs/2026-11-27-endtime-words-fable.md`, no changes, three build notes). Every finding below was checked against
the code on `origin/main` (2eaab2769) before it was taken in; the ones that could not be checked say why.

**This revision takes precedence over the first plan, kept whole below it (§§0–9), wherever the two differ.** The
first plan's sections are referred to by their own numbers (e.g. "§1 row 16", "§3 step 6").

**His D2611 governs the build:** a builder's reading is never built on. So the build makes ONLY what the rulings settle;
every case a ruling does not settle is in "QUESTIONS FOR HIM" (§R5) with what the app does today and a recommended
answer — and, until he answers, the app keeps doing what it does today for that case, pinned by a skipped test
(`it.todo('… — waits on his answer Qn')`).

---

## R1. Each review finding — taken in, or not, and why

| Finding | Checked in the code | What changes in the plan |
|---|---|---|
| Astra 1 — the board's flight and standby time boxes are built inline, bypassing `sbTxt`/`boxHTML` | **Confirmed**: `ui/board.ts` draws `<input class="tm…" data-bfld="ff:….to">` and `.ld` inline in the aircraft row | §1 row 8 gains the board's inline take-off/landing (flight and standby) inputs as a third builder; the outline step must mark them, start and end, grey and red, on every formation row |
| Astra 2 — typing "TBD" is refused by the time writer | **Confirmed**: `engine/slots.ts txtSet` refuses any non-time ("TBD is not a time. Try 0900 or 09:00.") and keeps the old value | The reader counts a STORED "TBD" (any case) as empty (D2855, ruled); the writer is left exactly as it is (typing TBD stays refused) — whether it should accept or blank a typed "TBD" is question **Q14**. S3 becomes a reader test on a stored value only |
| Astra 3 — Undo / Redo is a separate route to a published state | **Partly confirmed**: Undo and Redo replay saved images (`state/sched-commit.ts schedPostRestore`); they never call the publish commands, so the new guard does not run there. Not proved by a test tonight | Nothing built on Undo / Redo. Undo of an Unpublish (or Redo of a publish) while the working copy has a gap is question **Q15**; the first plan's "any new edit clears Redo" is withdrawn (Astra: only overlapping records are dropped) |
| Astra 4 — the red state keyed by day alone mixes saved plans | **Confirmed** by reading: each saved plan owns its own content and signatures (`engine/drafts.ts`) | Folded into **R3/R4** as worked examples (plan A refused, switch to plan B, back to A); the red state, when built, is keyed by squadron, date AND plan |
| Astra 5 — the AMT label test and sim free text are readings | **Confirmed**: `events.ts` uses `/^\s*BRIEF/i` and `/DEBRIEF/i`; sim `who` is a free-text label (`avail.ts`, `events.ts`) shown only when the row has no seats, never typed by a scheduler in a people box (`ui/html.ts` sim rows: `itxt` span, not editable) | The build leaves out the AMT block's BRIEF / DEBRIEF rows with nobody on them by the engine's own label test — the wider test, so a label the ruling may not mean ("BOX — DEBRIEF PRACTICE") stays as it is today (never refused) until **Q16**; sim `who` is not "someone" until **R8** |
| Astra 6 / Opus 3b — the planned parity test with `dayEngaged` has the wrong oracle | **Confirmed**: `dayEngaged` leaves out SC SPARE, special people (ALL, ALL AVAIL) and sim `who` on purpose | The parity test is dropped. The rule is tested against the ruling's own cases only (SC SPARE alone: counted; ALL / ALL AVAIL: counted; a typed callsign not on the roster: counted; sim `who` text: waits on R8) |
| Astra 7 — S20 is the opposite of what the app does | **Confirmed**: `ui/reqrow.ts` (owner D739, D740) — a time CLEARED on an input's row makes the input all day | S20 rewritten: clearing a time on a timed input's row makes the input all day, so the row is left out (D2852); Undo makes it timed again. Whether he wants a gap there instead is **Q17** |
| Astra 8 — S17 and S26 cannot be done through the controls | **S26 confirmed** (the writer refuses "ASAP"); **S17 not checked tonight** (the board's BRIEF / DEBRIEF people cell — `ui/board-html.ts` — was not walked) | Reader tests (stored values) are kept apart from walk scenarios; S26 is a reader test only; S17 is walked by whatever reachable sequence exists, or marked unreachable |
| Astra 9 — the OIL list's newer rulings (D2800, D2801) and the neighbouring job | **Not checked tonight** (outside the build's files beyond `ui/oilsign.ts`) | The time refusal runs before the OIL question (D2855, ruled) and `writeSign` refuses as the backstop for the list's Save and Later. The order against the neighbouring OIL sign-off job is for the coordinator; a held Later after a gap appears gets a test |
| Astra 10 — "assumed times only while drafting" needs the exceptions | Agreed (no code to check) | Step 7's document words keep the AMT header exception and D605's whole-day absence warning |
| Astra 11 / Opus 2b, 2c — F4, iPhone form arrows, VoiceOver open the sign list; the Amendments panel loses its preview lock | **2c confirmed**: `ui/ALPanel.tsx` button is `disabled={!signed \|\| previewing}`. 2b: the select is stretched over the pill and stays in the tab order (`signoffHTML`) | Screen step: while a day has a gap the sign box draws no focusable select (or `disabled tabindex=-1`), the label a `role=button aria-disabled` that refuses on click / Enter / Space; the panel's button `disabled = previewing \|\| (!signed && !gap)`. The `change` refusal stays as the backstop |
| Astra 12 / Opus 5 — the code readers | Not a code matter | Three blind code reads (Astra, a fresh Opus, and a fresh Opus in Fable's seat this week, listed as owed) — the coordinator's to arrange |
| Opus 1a — D2819 (Opus builds this week) was given for work Fable planned | Not a code matter | **Q18**. Tonight's build is Opus by the coordinator's instruction; the Fable-seat reads are owed |
| Opus 1b — the board's count line would become tappable, never ruled or drawn | **Confirmed** (D2734 rules the board's words only; `board.mjs` draws a plain span) | The board's count line is plain text; the board's tap is **Q19**. Edit Schedule's tap (D2854, ruled) is a later step, not tonight |
| Opus 1c — D360 (4)'s built "?" chip on a Common Programme placeholder with no start | Not walked tonight | Roll-call row added: HAS IT — stays (D2852 replaces only D361's unbuilt job); two marks on one gap is **Q20** |
| Opus 1d — D605 is drafting-only now | Agreed | Step 7's marks add D605 (a pointer only) |
| Opus 1e — sim free text "EXT SQN" | See Astra 5 | **R8** |
| Opus 2a — no route publishes past the guard | **Confirmed**: the only callers of the publish commands are `ui/interactions.ts` (`data-beak`, `data-alpub`) and `ui/ALPanel.tsx`; the only caller of `setSign` is `ui/oilsign.ts writeSign`, reached from `ui/Shell.tsx` → `signPick` and from the list's Save / Later | None |
| Opus 2d — guard only where the engine would act | **Confirmed** in `engine/publish.ts`: `setDayApproved` does nothing on a published day; `publishALDay` answers "…is still a draft" and "No changes to publish" first | Publish day is guarded only when `on && !dayApproved(di) && !protectedWeek()`; Publish AL only when `!protectedWeek() && dayApproved(di) && (dayHasChanges(di) \|\| correcting)`. The time refusal comes BEFORE the signature check (D2855 E1) |
| Opus 3a — a template desk with START and no END and nobody on it is counted | Agreed — the ruling says so ("a row with a start needs its end even with nobody on it") | §1 row 21 and S50 corrected: a template with no times stays plain; one with a start only is counted at once |
| Opus 3c — blank entries left by the delete | **Confirmed**: `engine/overlay.ts stripPersonFromDay` blanks seats and list entries to `''` in place | "Someone on it" tests trimmed, non-empty entries only; tests for `''`, `[]`, `['']`, `'  '`, `['','x']` |
| Opus 3d — a formation with no aircraft | Agreed | A test: a take-off typed, no aircraft — counted by the start rule; an empty aircraft list is never "every aircraft cancelled" |
| Opus 4a, 4c — steps in the wrong order; measure the fallout first | Agreed | New order (§R3): rule → refusals → demo remake → ONE full run, counted by kind → the screens |
| Opus 4b — the demo patch must go where every reader sees it | **Confirmed**: `engine/data.ts` takes `WEEK1_DAYS_SNAP` from `DAYS` at load; tests that never boot read `DAYS` raw | The remake edits `engine/data.ts`'s seed itself (the port's seed is the source of truth), and `testing/refwin.ts` gives the original app's copy the same ends, as it already copies the port's labels by position |
| Opus 4d — the locked look is tied to `disabled` | **Confirmed**: `04-pucks-sections.css` styles `.dbeak[disabled]` | Screen step: the same look on `[aria-disabled="true"]`, and on the panel's `.abtn.primary.locked` |
| Opus 4e — roll-call rows missing (the "N pending" list, the "?" chip, the stale-appointment words) | Agreed (not walked) | Rows added (§R4); the stale-appointment words beside the count are **Q21** |
| Opus 4f — measure the worst case at 402 wide | Agreed | Screen step: "12 items missing a time · 4 to sign" measured |
| Opus 4g — keep the command layer free of the screens | **Confirmed**: `state/sched-commit.ts` reaches the screens only through hooks (`publishGate`, `HOOKS.toast`) | The rule is a pure function in `engine/`; the refusal in `state/` says the note through `HOOKS.toast(…, 'blocked')` and tells the screens through a hook the screens set, as `publishGate` is set |

## R2. The rule function as it is built (supersedes §2.1)

`raptor-port/src/engine/timegaps.ts` (new, port-only). One item per thing that owns a start and an end:

| Item | Its two boxes | "Someone on it" (trimmed, non-empty entries only) | Left out |
|---|---|---|---|
| a flying or standby line, one formation | `ff:<di>.<gi>.<li>.to` / `.ld` | `a.p`, `a.w`, `a.more[]` on an aircraft not cancelled | the formation cancelled; a line with aircraft, every one cancelled (R7 — today: never refused) |
| a duty desk | `dr:<di>.<wi>.<ri>.str` / `.end` | `r.id`, `r.more[]` — the role alone never | `r.cx`, `r.info` |
| a sim row, AMT and OFT | `sr:<di>.<kind>.<ri>.str` / `.end` | `p`, `w`, `pax[]`, `more[]`; NOT the free-text `who` (R8) | `cx`, `info`; an AMT row the engine reads as the block's BRIEF or DEBRIEF while nobody is on it |
| a ground programme row | `gr:<di>.<ri>.str` / `.end` | `who`, `more[]` | `cx`, `info`; a row standing for an input with All day ticked |
| a Common Programme row | `ap:<di>.<ri>.str` / `.end` | `who` (one or a list; ALL and ALL AVAIL count), `more[]` | `cx`, `info`; a row standing for an input with All day ticked |

A box is **empty** when it holds nothing or "TBD" (any case — D2855); a **clock time** when the engine's reader reads one;
anything else is **a word** (R2 — today it is never refused). An item **counts** when someone is on it and a box is
empty, or when its start holds a clock time and its end is empty. An item with only its end typed and nobody on it is
not counted (R1 — today it is never refused). `items` counts items; `boxes` names the empty boxes.

## R3. The steps, in the new order (supersedes §3's order)

1. The rule function and its tests (§R2). 2. The refusals: sign-off (`ui/oilsign.ts signPick` — before the OIL question
— and `writeSign` as the backstop), Publish day and Publish AL (`state/sched-commit.ts`, guarded only where the engine
would act — Opus 2d), the words of D2854 in one place, the note through `HOOKS.toast(…,'blocked')`, a hook for the
screens' red state. 3. The demo week remade (`engine/data.ts` + `testing/refwin.ts`; week 2 and week 149 scanned and
filled the same way). 4. ONE full unit run under the lock, sorted by kind and counted. 5. The screens: the outline (grey;
red once refused; never on View-only Sched or a preview), Edit Schedule's count line words, the board's count line words
(plain text, D2734), the greyed Publish buttons that take a press (D2855 E1), the sign box that refuses a press without
opening its list (try-out), the caret-held repaint, the drawing check. 6. Documents and records (§3 step 7). 7. Later:
Edit Schedule's count-line tap (D2854), the Legend line (D2803, drawn first).

## R4. Roll-call rows added (to §1)

- 8b. The board's inline take-off / landing inputs, flight and standby lines (`ui/board.ts`) — MISSING → HAS IT.
- 38. The day's "N pending" list window (`data-pendlist`) — MUST NOT change: an emptied time on a published day shows
  there as any change does; no ruling adds the count there.
- 39. D360 (4)'s "?" chip on a placeholder row with no start — HAS IT, stays (D2852 replaces only D361); Q20.
- 40. The stale-appointment words ("SKED CK needs an appointed scheduler") on the sign-off line — stays as built
  beside the count until Q21.
- Row 16 (Undo / Redo) — not "unchanged code, pinned": Undo and Redo restore saved states without the guard (Q15).
- Row 21 (templates) — a template's desk with a start and no end is counted at once, nobody on it too.

## R5. QUESTIONS FOR HIM

Each: when it happens, what the app does today, and the recommended answer. Until he answers, the build keeps today's
behaviour for the case and a skipped test names the question.

- **R1 — a row with only its end typed and nobody on it.** A scheduler types "— 17:00" on a Common Programme row and
  leaves it. Today: nothing stops publishing. Recommended: counted, its start outlined — one rule, any time typed asks
  for the other (as the try-out drew it).
- **R2 — a word other than "TBD" in a time box** ("ASAP", "LATE"), from an older saved week (the writer refuses typing
  one). Today: nothing stops publishing. Recommended: every word counts as empty.
- **R3 — a box emptied after a refused press.** Today: no red at all. Recommended: red while the day still has any red
  box; once every time is typed the day is grey again until the next refused press. With saved plans: plan A refused,
  switch to complete plan B, back to A — A is still red (its gap was never typed); two plans never share a colour.
- **R4 — how long red lasts.** Recommended: in this browser while he stays signed in; not shown to another scheduler on
  another device; whether a reload keeps it, said on the build.
- **R5 — read-only places on Edit Schedule** (a past version's preview, a parked plan's preview, the next-week peek, OIL
  Earn mode if its boxes cannot be typed). Recommended: no outline where the box cannot be typed in.
- **R6 — the desktop Amendments panel's "Publish AL".** Today: greyed until signed. Recommended: the same as the day's
  Publish AL — greyed but pressable while a time is missing, refused with the same note; still locked while a past
  version is previewed. (The refusal itself holds on every route already: it is in the command.)
- **R7 — a flying line whose every aircraft is cancelled but the line is not, with a take-off and no landing.** Today:
  nothing stops publishing. Recommended: never counted (a cancelled flight has no landing to type).
- **R8 — words in a sim's people cell** (the demo's "EXT SQN" OFT row: a label, not a person; it shows only when the
  row has no crew, and a scheduler cannot type it). Today: nothing stops publishing. Recommended: counted — anything in
  the people cell is someone. (A row with a start typed is counted anyway, by the start rule.)
- **R9 — a kept All-day row** (added by the overnight fixer, 27 Nov 26, from the two Opus code reads' F1). A member files
  an All day Training for Tuesday; it lands on Tuesday's Ground Programme with his name and no times, and Tuesday is
  published. He then moves the Training to Thursday (or deletes it). The scheduler loads Tuesday's published version back
  onto the working copy, or switches to a saved plan that still holds the row: the row comes back "kept" — left behind
  by an input that no longer stands on Tuesday. Is it still the All-day input's row (left out), or now the scheduler's own
  typed row, so both its boxes count as missing and every sign-off and Publish is refused until made-up hours are typed?
  Today: never refused — the build keeps that (left out while its input is All day, or gone and so unreadable). Recommended:
  left out — the row still stands for an all-day activity; a scheduler who wants hours on it types them, and one who does
  not want it deletes it.
- **Q-W1 — the count line with one item:** "1 item missing a time · 4 to sign" (Fable's build note, the coordinator's
  brief). Recommended: as written. Built tonight only if the screens are reached.
- **Q-W2 — one item on Publish:** "Blocked: 1 item is missing a time, outlined in red. Thursday was not published." and
  "… AL1 was not published." — the ruled one-item lead joined to the ruled ends. Built so tonight (the refusal must say
  something, and this is the ruling's own "…"); recommended: as written.
- **Q-W3 — all four names still showing (an older saved week) and a time missing:** the line reads "N items missing a
  time" alone. Recommended: as written.
- **Q-W4 — the count line's hover words** ("Go to the next missing time", the try-out's). Recommended: keep.
- **Q-W5 — the Logic page's "Rows with no end time" group and the OIL lines** — true now only while a day is drafted.
  New words drafted by Opus, adjusted by Fable, put to him. Nothing changed until he answers.
- **Q-W6 — the Publish button's hover words while a time is missing.** Today: "Sign off CUR CK, … before publishing
  Thursday". Recommended: keep (no new words).
- **Q14 — typing "TBD" in a time box.** Today: refused ("TBD is not a time. Try 0900 or 09:00."), the old time kept.
  Recommended: leave it (an empty box already shows the to-do; "TBD" reaches a box only from an older saved week, where
  it counts as empty, D2855).
- **Q15 — Undo of an Unpublish (or Redo of a publish) after a time was emptied on the working copy.** Undo puts back the
  published day as it was — it publishes nothing new. Today: allowed. Recommended: leave it allowed (the issued day
  had all its times when it was published; the gap is on the working copy and blocks its next publish).
- **Q16 — which AMT rows are "the block's BRIEF and DEBRIEF".** The engine treats any AMT row whose label starts with
  BRIEF, or holds DEBRIEF anywhere, as the block's header ("BOX — DEBRIEF PRACTICE" too). Today: none refused.
  Recommended: only rows labelled exactly BRIEF or DEBRIEF are left out; any other AMT row follows the ordinary rule.
- **Q17 — clearing a time on a timed input's row on the Ground Programme.** Today (his D739, D740): it makes the input
  all day, so the row is left out of the rule. Recommended: leave it — the box he cleared is the input's own.
- **Q18 — who builds this job** (Opus 1a): D2819 moved builds to Opus this week for work Fable planned; this plan was
  Opus's. Tonight's build is Opus by the coordinator's instruction, with the Fable-seat reads owed. Recommended: keep
  Opus's build, Fable to read the finished code after the weekly reset.
- **Q19 — a tap on the Scheduler Board's count line.** Ruled for Edit Schedule only (D2854); the board's try-out draws
  plain words. Recommended: the same tap on the board, drawn first.
- **Q20 — two marks on one gap**: a Common Programme ALL AVAIL row with no start shows the built "?" chip (D360) and
  will also show the outlined start box. Recommended: keep both for now; show him the picture.
- **Q21 — the stale-appointment words beside the count** ("SKED CK needs an appointed scheduler" while a time is
  missing). Recommended: keep them after the count.

## R6. What tonight's build leaves out, and why

- The outline, the count-line words, the greyed buttons that take a press and the sign box that refuses without opening
  its list — the screen step (5); built only if time remains after the full run, each checked against the try-out.
- The count line's tap (Edit Schedule: ruled but a later step; the board: Q19), the Legend line (D2803 — drawn first),
  the document and Logic-page words (Q-W5, after his answers), every QUESTIONS FOR HIM case.

---

# The first plan, kept whole (the revision above wins where they differ)

## [END-TIME-GUARD] — the build plan (overnight planner, 27 Nov 26)

Planned by a fresh Opus, read only. Nothing in any checkout was changed. App code was read from `origin/main`
(eea24a984 era, 132 commits past `claude/readings-lapse-fix-fdbb3c`); the rulings from that branch. Every rule below is
checked against the full rows D2852, D2853, D2854, D2855, D2612, D2613, D2616, D2734, D2790, D2803, D2046, D2053, D2055,
D2072, D2073, D2080, D1990, D360, D361, D605, D1625, D2441, and against round 3's page (questions H, I, L, J, G, D, C,
K, E, answered "all as recommended") and the end-time try-out (`docs/mock/2026-11-25-endtime-tryout/`).

**Who builds and reads this week (his D2819, 27 Nov 26, recorded on `claude/msq-b1-screens-135`, not yet on main):**
until the weekly reset (30 Nov 26, about 19:00 his time) Opus builds and walks; Fable only reviews the words people
read, given the words and the situation alone; every Fable seat in a read or a scenario design is taken by a fresh,
blind Opus and listed on the reads-owed list. After the reset the high-risk rule (published records → Fable builds,
D2258) applies again — if the build starts after 30 Nov 19:00, the builder is Fable.

---

## 0. The rule as ruled — what the build must do, word for word

1. **Before a sign-off box, Publish day or Publish AL is accepted**, every item with someone on it needs both its start
   and its end; a row with a start needs its end even with nobody on it; an empty start is outlined and refused as an
   empty end is (D2852, D2612).
2. **"Someone on it"** = a person, ALL or ALL AVAIL, or a callsign typed in its people box; a desk showing only its role
   (SDO, SXO, OPS O) does not count (D2852).
3. **Left out, never outlined, never counted:** a row from an input with All day ticked; a cancelled (CX) or
   information-only (ⓘ) item — counted again at once if the cancellation is taken back; the AMT block's own BRIEF and
   DEBRIEF rows while nobody is on them; a blank row with nobody on it (D2852, round 3 L, D, I1, I3).
4. **A typed row never gets all day** — both boxes empty with someone on it is two missing times (D2790, I4).
5. **A standby line (SC, AVALON, BB) with a man and no times gets the outline only, never a new warning line**; a
   standby line that flies keeps its advisory (D2852 I2, D2072).
6. **"TBD" counts as empty**: outlined and counted, with no words of its own (D2855).
7. **The outline**: a thin line inside the empty time box — grey while drafting; red once a sign-off box, Publish day or
   Publish AL is pressed and refused, staying red until the time is typed; the same on a draft and on a published day
   being amended; **never on View-only Sched** (D2853, K). The look: the try-out's `inset 0 0 0 1px var(--ink-3)` /
   `var(--hard)`, no glow (`tryout.css` lines 36–42; `board.mjs` PROPOSED_CSS).
8. **Edit Schedule's sign-off line** reads "N items missing a time" before "N to sign" while any time is missing; a tap
   on it goes to each empty box in turn (D2854, G).
9. **The Scheduler Board's sign-off line**, while any time is missing, reads only the count and "N to sign" — the names
   of the boxes still to sign come back once the last time is typed — one line on a phone (D2734).
10. **A refused press** leaves the box at "— name —" and shows the grey "Blocked:" note (D2854, C):
    - sign-off: "Blocked: 3 items are missing a time, each outlined in red. Type the missing times, then sign."
    - Publish day: "Blocked: 3 items are missing a time, each outlined in red. Thursday was not published."
    - Publish AL: "Blocked: 3 items are missing a time, each outlined in red. AL1 was not published."
    - one item: "Blocked: 1 item is missing a time, outlined in red. Type the missing time, then sign."
11. **A press on the greyed Publish day raises that note whenever a time is missing** (D2855 E1).
12. **A day with a missing time and an open OIL question refuses for the time first; the OIL list opens at the next
    press once the times are typed** (D2855 E2; the OIL list is `ui/oilsign.ts` + `ui/OilDayList.tsx`).
13. **Drafting stays free**: nothing is refused while typing; the assumed times (D2046 flight length, the sim length, the
    one-hour open end, the AMT debrief length) keep working for the warnings while drafting (D2612, D2613).
14. **Held from tonight's build:** the Legend line, an outlined empty box beside "Time missing, fill it" (D2803) — drawn
    for his look first (D1625), a later step (§3 step 8).
15. **The demo week is remade to fit the rule** (D2616).
16. **The outline replaces the "?" job** of 29 Sep — [ROW-NO-TIME-MARK] (D361) closes when this is built (D2852).

---

## 1. The roll-call — every place that publishes, signs off, shows a sign-off count, draws a time box, or reads "missing end time"

Each row: **HAS IT** (must carry the new behaviour), **MUST NOT, BECAUSE…**, or **MISSING** (does not exist today and
the rule needs it). Code places are from `origin/main`.

| # | Place | What it is today | Verdict |
|---|---|---|---|
| 1 | Edit Schedule week, desktop — every editable time box (`ui/html.ts ted()`; flight `ff:<di>.<gi>.<li>.to/.ld` at line ~2023, rows via `plRow()` line 796: duties `dr:`, sims `sr:`, ground `gr:`, Common Programme `ap:`) | no mark on an empty box | **MISSING → HAS IT**: grey outline on each box the rule names; red after a refused press |
| 2 | Edit Schedule week, phone (same builder, the phone's stacked TIME column `t-s`/`t-e`) | as 1 | **MISSING → HAS IT**, measured at 402 wide in WebKit |
| 3 | Edit Schedule's sign-off strip (`signoffHTML(di,false)`, html.ts 2517; `.signoff.day-sign`) | "N to sign" | **MISSING → HAS IT**: "N items missing a time · N to sign", pressable, goes to each empty box in turn |
| 4 | The four sign-off boxes, week and board (one delegated `change` listener, `ui/Shell.tsx` ~line 203 → `ui/oilsign.ts signPick` → `writeSign` → `engine/publish.ts setSign`) | a name picked is written (or held for the OIL list) | **MISSING → HAS IT**: refused while a time is missing — on mouse, touch and keyboard; the native list must not open (try-out: `pointer-events:none` on the select, the press caught on the label) |
| 5 | Publish day (`dayStatHTML`, html.ts ~1713, `button[data-beak]`, `disabled` until signed; handler `ui/interactions.ts` 1510 → `commitSetDayApproved`) | a disabled button does nothing | **MISSING → HAS IT**: while a time is missing it stays greyed but pressable (no `disabled`, `aria-disabled="true"`) and a press is refused with the note |
| 6 | Publish AL on the day head (`button[data-alpub]`, html.ts ~1729 → `commitPublishALDay`) | as 5 | **MISSING → HAS IT** (same) |
| 7 | Publish AL in the desktop Amendments panel (`ui/ALPanel.tsx` line 62, its own `disabled={!signed}` button) | a third door to `commitPublishALDay` | **MISSING → HAS IT**: same refusal and words; the reading that this panel's button counts as "Publish AL" is listed in §6 (R6) |
| 8 | Scheduler Board, desktop — time inputs (`ui/board-html.ts sbTxt()`/`boxHTML()` line 367, and the two Common Programme inputs at lines 259–260 built inline) | no mark | **MISSING → HAS IT** (both builders — the Common Programme inputs bypass `sbTxt`, the classic "never wired up") |
| 9 | Scheduler Board, phone (same builders) | as 8 | **MISSING → HAS IT**; the box a phone zooms to while typing must keep its outline in view |
| 10 | Scheduler Board's sign-off line (`ui/board.ts boardSignBody` line 477 → `signoffHTML(di,true)`, `#sbSignBar`, `full` names the boxes) | "N to sign · CUR CK, SKED CK…" | **MISSING → HAS IT**: while a time is missing "N items missing a time · N to sign" with NO box names, one line at 402; names back once the last time is typed (D2734) |
| 11 | The board's Publish day / Publish AL (`dayStatHTML(di, ed)` shared, board.ts 478) | as 5–6 | **HAS IT** through the shared builder — walked separately (D: a second home) |
| 12 | View-only Sched (`ViewWeek.tsx`; `ted()`'s read-only branch; the "Working draft" peek of a published day, `VWORK`) | read-only boxes | **MUST NOT, BECAUSE** D2853/K: the outline is the scheduler's to-do and a member cannot type the time. Falls out of `ted()`'s `!ed` branch — pinned by a test, both for an admin and a member, draft day and Working-draft peek |
| 13 | A frozen preview — an issued version (`DPREV`), a parked plan's preview, the next-week peek (`ui/peek.ts`), a stored draft (`pvDraft`) | read-only | **MUST NOT, BECAUSE** a preview cannot be typed in and is not the working copy (agent's reading — R5 in §6) |
| 14 | OIL Earn mode on Edit Schedule (`ui/oilmode.ts`) | the boxes' editability there to be checked on the build | **MUST NOT if its boxes cannot be typed**, BECAUSE the outline is a to-do on a box he can fill (R5) — the builder reads which branch of `ted()` OIL Earn mode draws, and the walk pictures it |
| 15 | The OIL list's held sign-off (`ui/oilsign.ts signPick` → `signAsks` → `setOilList`; `holdSave`/`holdLater` → `writeSign`) | opens at the first press on a weekend/holiday with an unanswered OIL question | **MISSING → HAS IT**: the time check runs BEFORE `signAsks`, so the list does not open (D2855 E2); `writeSign` refuses as a backstop if a time went missing while the list was up |
| 16 | Undo / Redo of a sign-off and of a publish (`undo/timeline.ts`, `state/sched-commit.ts` boundaries) | a sign is a `sched.sign` command; a publish a boundary | **HAS IT, unchanged code**: a refused press makes no command, so Undo steps back over the edit before it; a redo replays a sign made when every time was in; any new edit clears the redo stack. Pinned by tests (§3 step 3) |
| 17 | The signature binding (`engine/publish.ts setSign`/`currentBind`/`signShown`) — a change clears the four | a changed time clears the shown names | **HAS IT, unchanged**: a test per row kind proves emptying a time after signing drops the names (if a kind's time is outside the binding, that is a real finding) |
| 18 | Saved plans (`engine/drafts.ts`; each plan owns its signatures, AM12; Switch to this plan, `data-draftgo`) | a plan carries its own signs | **HAS IT** through the live day: the outline and the count follow the plan that is live; a preview of a parked plan shows none (row 13); a plan stowed with names and a missing time (old data) can still not publish |
| 19 | Unpublish then republish (a correction, `SCHED.correcting`, `publishALDay`) | reissues the same label | **HAS IT** through `commitPublishALDay` |
| 20 | Load a version onto the working copy (`loadVersionToWorkingCopy`, `data-restore`) | brings issued times back | **HAS IT** (reads the day afresh; no new door) |
| 21 | Day templates / duty templates / wave templates (`engine/daytpl.ts`, `dutytpl.ts`, `wavetpl.ts`) | may lay blank rows | **HAS IT** by reading the day: blank rows with nobody stay plain (I3); seated ones are outlined |
| 22 | Multi-squadron: another squadron's day signed by a Plan holder (`state/plan-foreign.ts`, `state/sign-more.ts`), a View holder of 149 | the same `signoffHTML` and the same listener | **HAS IT** through the one door — one walk scenario each (Plan of 149 signs 149's day; a View holder sees View-only only) |
| 23 | Detachment days' sign-off | no separate sign-off code on `main` (searched `sign-more.ts`, `publish.ts`, `html.ts`) | **HAS IT** through the same boxes; if the multi-squadron build adds its own boxes later they must read this rule's one function — filed note for that build |
| 24 | The week's "Not yet signed" / "Not yet published" mark (`nysMarkHTML`), "N pending", the day chip | counts signatures and changes | **MUST NOT change, BECAUSE** no ruling touches them; the missing-time count lives only in the sign-off line |
| 25 | The day's ⓘ window (`dayInfoHTML`) | approval, versions, advisories; read-only, also on View-only | **MUST NOT, BECAUSE** no ruling puts the count there and anything new he sees is drawn first (D1625) |
| 26 | The warning list (Edit Schedule's and the board's, `boardWarnHTML`; `engine/validate.ts`) | standby-that-flies advisory; `OIL_NO_TIMES` on weekends; assumed-time words | **MUST NOT gain a line, BECAUSE** D2852 I2 ("outline only, never a new warning line") and D2612 ("the assumed times keep working for the warnings"). Pinned: the warning count of a day before and after the build is identical |
| 27 | The Changes window / Edit history (`ChangesWindow.tsx`, `logAction` inside `writeSign`) | a line per sign | **MUST NOT get a line for a refused press, BECAUSE** nothing was done (the line is inside the command, which never runs) |
| 28 | The publish note half for a weekend that earns nobody (`leavewar/sync.ts publishFlagsBids`, `publishGate`) | says "no usable times" at publish | **HAS IT unchanged** for what can still be published (a row typed with start = end); a refused publish runs no gate, no OIL credit, no bid flag, no bell line |
| 29 | The ALL AVAIL window's "no end time, an hour assumed" and "No OIL worked out — this row has no end time" (`ui/oilmode.ts` 960–1012, D360, D361) | for a row with a start and no end | **MUST NOT change, BECAUSE** round 3's small point 1 "leave as built" (D2857): it now arises only while a day is drafted |
| 30 | The Logic page's "Rows with no end time" group and the OIL "how it works" lines (`ui/logic-html.ts` lines 58–62, 202–204) | say what the app assumes, OIL included | **MISSING → HAS IT**: words corrected to say the assumption holds only while a day is being drafted — new words are his call (§7 Q-W5); the backlog line asks for it (D2612's "their pages fixed with the build") |
| 31 | The Help page (`ui/HelpPage.tsx`) | searched on main: no text about sign-off, publishing or end times | **MUST NOT, BECAUSE** it says nothing on the subject — checked again on the build |
| 32 | The Legend (`html.ts legendHTML()` line 432) | no line for the outline | **MISSING → later step**: D2803's line is held until drawn and shown (§3 step 8) |
| 33 | Exports and print (`ui/export.ts`, `ui/printpdf.ts`, `ui/pagedownload.ts`) | the export work is on hold (D1644) | **MUST NOT, BECAUSE** a printout is not a to-do; the outline is a class on an editable box only |
| 34 | The Unavailable list and the Personal Inputs lines on the day (inputs, not schedule items) | leave, ATTACH, a course | **MUST NOT, BECAUSE** round 3 I1: "the rule does not look there" |
| 35 | The demo week (`engine/data.ts` week 1 — a verbatim seed the reference parity reads; `engine/week2.ts`, `engine/week149.ts`; bundled by `engine/weeks-data.ts`, booted by `state/seeds.ts`) | week 1 has 7 items the rule refuses (Mon 3, Tue 2, Wed 1, Fri 1 — counted from the seed by a read-only scan); week 2 has 3 empty ends to check | **MISSING → HAS IT**: remade to fit the rule (D2616), without breaking the reference parity (§3 step 6) |
| 36 | The probe bridge and walk scripts that call the engine's publish directly (`src/probe-bridge.ts`) | bypass the screen | **MUST NOT be the walk's proof, BECAUSE** §7.0: only a pressed control proves a route |
| 37 | The rules engine's assumed-time readers (`engine/events.ts`, `validate.ts`, `oil.ts`, `avail.ts`, `insights.ts`) | the drafting assumptions | **MUST NOT change, BECAUSE** D2612 keeps them for drafting; `src/engine/` bodies are verbatim ports and the parity tests pin them |

---

## 2. The one place the rule is decided

### 2.1 The function (new file, not a port): `raptor-port/src/engine/timegaps.ts`

```
export type TimeGaps = { items: number; boxes: string[] }   // boxes = the time-box keys, as the week and board name them
export function dayTimeGaps(d: any): TimeGaps               // pure: reads one day object (+ INPUTS for an input's All day)
export function timeGapsOf(di: number): TimeGaps            // DAYS[di], memoised per read pass (publish.ts passMemo /
                                                            // publishReadPass), so a repaint computes it once a day
```

It walks the day exactly as `engine/avail.ts personBusy`/`dayEngaged` do (the app's own list of what a day holds), one
**item** per thing that owns a start and an end:

| Item | Its two boxes (keys) | "Someone on it" | Left out |
|---|---|---|---|
| a flying line or standby line (SC, AVALON, BB) — one formation | `ff:<di>.<gi>.<li>.to` / `.ld` | any `a.p`, `a.w`, `a.more[]` on an aircraft not CX — a person, ALL/ALL AVAIL, or typed text | the formation CX; a line whose every aircraft is CX — **R7, §6** |
| a duty desk (standby template desks included) | `dr:<di>.<wi>.<ri>.str` / `.end` | `r.id` (person or typed text) or `r.more[]`; `r.role` alone never | `r.cx` |
| a sim row, AMT and OFT | `sr:<di>.<kind>.<ri>.str` / `.end` | `p`, `w`, `pax[]`, `more[]`, or the free-text `who` (e.g. "EXT SQN") typed in its people box | `cx`; an AMT row whose label is BRIEF or DEBRIEF while nobody is on it — the same test `events.ts` uses (`/^\s*BRIEF/i`, `/DEBRIEF/i`), pinned by a test that the two agree |
| a ground programme row | `gr:<di>.<ri>.str` / `.end` | `who`, `more[]` | `cx`, `info`; a row whose `src` input (`engine/inputs.ts inputOnAny`) has All day ticked |
| a Common Programme row | `ap:<di>.<ri>.str` / `.end` | `who` (array or one), `more[]` | `cx`, `info`; a row from an All day input (same `src` test) |

**A box is filled only when it holds a clock time** — the engine's own `parseHM` reading. So "TBD" is empty (ruled,
D2855), and so is any other word in a time box (the engine already treats one as no time, D2046 — **R2, §6**).

**An item counts** when someone is on it, **or** when it has its start typed (H). An item with its end typed, no start
and nobody on it: **R1, §6** (the try-out counts it). A counted item contributes each of its empty boxes; `items` counts
items, not boxes (the SXO desk with both empty is one).

Nothing else decides it. Every screen and every refusal reads `timeGapsOf(di)`; no screen counts by itself.

### 2.2 The refusal (one module, the words in one place): `raptor-port/src/ui/timeguard.ts`

```
export type TimeDoor = 'sign' | 'publish' | 'publishAL'
export function timeRefusal(di: number, door: TimeDoor): string | null   // null = no gap; else the exact ruled words
export function refuseForTime(di: number, door: TimeDoor): boolean       // says the note (toast 'blocked'), marks the day red, true if refused
export function timeRed(di: number): boolean                              // the red state for the day in view
```

The red state is a view flag beside `OILSIGN_LATER` in `ui/pops.ts` (a `Set` keyed `unit|iso`, added to the reset list
there so a sign-out clears it). Set by a refused press; cleared when the day has no gap left (**R3, §6**); not saved, not
shared with another scheduler (**R4, §6**).

### 2.3 Where every door and screen reads it

- **Sign-off:** `ui/oilsign.ts signPick` — first line: `if (who && refuseForTime(di,'sign')) return 'refused'` (before
  `signAsks`, so the OIL list never opens first — D2855 E2). `writeSign` repeats the check as the backstop for the OIL
  list's Save/Later (a name is never written while a gap stands). `ui/Shell.tsx`'s listener treats `'refused'` like
  `'held'`: puts the select back to what is written. Taking a name OUT (`who === ''`) and Clear are never refused.
- **The press that must not open the list:** the sign box gets class `tg-block` while the day has a gap (in
  `signoffHTML`), CSS `pointer-events:none` on its select, and the press is caught: a click on `.sgn.tg-block` (routeClick
  in `ui/interactions.ts`), a `mousedown` on the select, and `keydown` Enter / Space / ArrowUp / ArrowDown / Home / End on
  a focused one — each calls `refuseForTime(di,'sign')`. (The try-out's three handlers, `tryout.js` §8.)
- **Publish day and Publish AL:** the command layer, `state/sched-commit.ts commitSetDayApproved` and
  `commitPublishALDay` — before `commitPublish` runs `fn`: `if (refuseForTime(di, …)) return refused` (no command, no
  boundary, no gate). After the quarantine (`protectedWeek`), which stays the first word (its comment in `setDayApproved`
  insists), and before the signature check. The three buttons (`data-beak`, `data-alpub`, ALPanel) stay `disabled` exactly
  as today **unless** the day has a gap, when they lose `disabled`, gain `aria-disabled="true"`, keep the locked look
  (try-out `.dbeak.et-lock`), and a press reaches the command, which refuses.
- **Why the command layer, not `engine/publish.ts`:** the engine bodies are verbatim ports and the reference-parity tests
  call `setDayApproved`/`publishALDay` directly against the original app; a guard inside them would break parity and
  make 94 engine test files' published-day cases unreachable. Every production route (week, board, ALPanel, the OIL
  list) reaches publishing and signing only through `commitSetDayApproved`, `commitPublishALDay` and `writeSign`
  (searched on main: no other caller of `setSign`, `setDayApproved` or `publishALDay` outside tests).
- **The outline:** `ted()` (week) adds `tg-miss` (+ `tg-red` when `timeRed(di)`) on its editable branch only, when its
  key is in `timeGapsOf(di).boxes`; `sbTxt()`/`boxHTML()` and the two inline Common Programme inputs (board) do the same
  when not `pv`/`ro`. View-only, previews, exports and OIL Earn's read-only boxes therefore never carry it (rows 12–14,
  33).
- **The caret-held block** (`ui/dayswap.ts swapDayAround`; `ui-contracts.md` "While the caret is in a text box"): the
  section holding the caret is not repainted until the caret leaves it, so a box just typed would keep its outline. A
  small in-place pass, shaped like `refreshWaveReports` (html.ts 1294 — attributes only, no new markup), sets or clears
  `tg-miss`/`tg-red` on every time box of the held block after each commit, and the board does the same on its held
  panel.
- **The count line:** `signoffHTML` — while `items > 0`, the status span becomes
  `<button type="button" class="so-state no tg-count" data-timego="<di>">N items missing a time · M to sign</button>`;
  with `full` (the board) never the box names while a gap stands (D2734). A press goes to the next empty box in
  page order (the DOM's order, as the try-out sorts — `compareDocumentPosition`), wrapping round; a per-day index in view
  state; a box inside a folded section opens the section first; it scrolls the box to the centre (reduced motion:
  instantly) and focuses it, clear of the top bar.

---

## 3. The steps — small, safe, each with its tests written first (each must fail before its change)

Every step lands with its own tests green; the full suite runs under the checks lock (`gatelock.mjs take`) only where
said. Branch: `claude/end-time-guard-<id>` cut from `origin/main`. Open the pull request as soon as step 4 builds.

### Step 0 — before any code (about 0.5 h, his answers gate only what each names)
- Put §6's questions R1–R7 and §7's Q-W questions to him on one questions page with pictures (his rules D2439, D1222,
  D2164); the build may start on everything else.
- One cold read of the ruled words by a fresh Fable (D2854, D2441; D2819 allows Fable for words): the five ruled
  sentences plus the agent-composed forms in §5. A changed word goes back to him.
- Write the evidence sheet's empty headings and the roll-call table (§1) into `raptor-port/docs/handpass/<date>-end-time-guard.md`.

### Step 1 — the rule's function (about 2 h)
- **Tests first** (`src/engine/timegaps.test.ts`, red — the file does not exist): one case per row of §2.1's table and
  each exception, both sides of each — crew on a line with no take-off (counted, the `to` box); landing "TBD" (counted);
  `tbd` lower case; a line with crew and both times (not); a line with no crew and a take-off (counted, H); a line with
  no crew and no times (not); formation CX (not) then un-CX (counted); one aircraft CX, the other crewed (counted); an SC
  MAIN with START and no END (counted); an SC SPARE alone (counted, one item, two boxes); the SXO desk with a man and no
  times (one item, two boxes); a desk with its role only (not); a desk with typed text (counted); a sim with END only
  and a crew (start box); a sim with pax only; the OFT "EXT SQN" text row with a time blanked (counted); AMT BRIEF
  11:00 / DEBRIEF 12:30 with nobody (not); a man put on BRIEF (counted); AMT BOX with pax and no end (counted); a typed
  ground row with a man and both empty (two boxes); an All day input's row (not); a timed input's row with its END
  blanked (counted); an ⓘ row (not) then ⓘ removed (counted); Common Programme ALL AVAIL and ALL with a start (counted);
  DINNER WITH CMD with nobody (counted); a row with nobody and no times (not); the R1 case (the end only, nobody) —
  written both ways, one skipped until he answers; a time box holding "ASAP" (R2, both ways). `items` vs `boxes` counts.
- **A parity test** that `timegaps.ts`'s AMT BRIEF/DEBRIEF test and its "someone" readers agree with `events.ts` and
  `avail.ts` on the demo week's every row (so a later change to either is caught).
- Build `engine/timegaps.ts`; add it to `docs/file-map.md`.

### Step 2 — the words and the red state (about 1 h)
- **Tests first** (`src/ui/timeguard.test.ts`): `timeRefusal` returns exactly the §5 sentences for 1 and 3 items, each
  door, a draft day ("Thursday was not published.") and an amended one ("AL1 was not published.", "AL2 …" after one
  amendment — `nextSeq`); null with no gap. `refuseForTime` sets the red flag; the flag clears once the gap is gone;
  sign-out clears it.
- Build `ui/timeguard.ts`; the flag in `ui/pops.ts` and its reset entry.

### Step 3 — the refusals at every door (about 2.5 h)
- **Tests first**, through the real handlers in jsdom (`src/ui/timeguard-doors.test.tsx`, red):
  - a `change` on CUR CK with a gap: nothing written (`signShown` empty), the select back to "— name —", the note's
    exact words, no Edit history line, `histPush` not called; the same for SKED CK, PLANNED BY, APPROVED BY, on the week
    and on the board.
  - a click / mousedown on a blocked box and Enter, Space, ArrowDown on a focused one: refused, the note shown.
  - choosing "— name —" and pressing Clear with a gap: allowed.
  - Publish day with a gap: the button has no `disabled`, carries `aria-disabled`, a press refuses with "Thursday was
    not published.", no Original minted, no publish boundary, `publishGate` not called, no bell line.
  - Publish AL (day head, board, ALPanel) on an amended day with a gap: "AL1 was not published.", no AL minted.
  - with no gap and not signed: Publish stays `disabled` as today (board.test.tsx 2209, pubsweep.test.tsx 159 keep
    passing unchanged — they pin the left-as-it-is half, §8 point 7).
  - a weekend with an unanswered Duty input and a gap: first press refuses for the time, `OILLIST` not opened; times
    typed; next press opens the list holding the name (D2855 E2); its Save signs; its ✕ signs nothing.
  - the OIL list's Save while a gap has appeared: `writeSign` refuses, says the note.
  - the quarantine (wrong-week book) still answers first.
  - Undo after a refused press undoes the edit before it; Redo; sign all four, empty a time → names gone, Undo → names
    back and the outline gone (per row kind: flight, desk, sim, ground, Common Programme — proves the binding covers
    every time).
  - a Plan holder of 149 signing 149's day with a gap: refused the same.
- Build: `signPick`/`writeSign` checks; `Shell.tsx` `'refused'`; the routeClick, mousedown and keydown catches;
  `sched-commit.ts` checks in the two commits; `dayStatHTML` and `ALPanel` button attributes.

### Step 4 — the screens (about 4–5 h)
- **Tests first** (`src/ui/timeguard-screens.test.tsx`, red): the week's and the board's empty boxes carry `tg-miss`
  exactly for `timeGapsOf`'s keys (both Common Programme input sites on the board); `tg-red` only after a refused press;
  View-only Sched (admin and member, draft day, Working-draft peek), an issued-version preview, a parked plan's preview
  and the next-week peek carry none; the week's line reads "3 items missing a time · 4 to sign"; the board's reads the
  same with no box names, and the names come back at 0; one item reads "1 item missing a time"; the count button cycles
  boxes in page order and wraps; a box in a folded section opens it; the in-place pass clears a box's outline inside
  the caret's held block; the warning list's count is the same with the rule on and off (D2852 I2).
- Build: `ted()`, `sbTxt`/`boxHTML` + the two inline inputs, `signoffHTML`, the count-tap handler (routeClick), the
  held-block pass (`dayswap.ts` caller and the board's held panel in `SchedBoard.tsx`), CSS: the outline in
  `ui/scheduler/04-pucks-sections.css` (week) and `13-board-rows-responsive.css` / `10-board-history.css` (board), the
  count line and the blocked box beside the existing sign-off rules (04-pucks-sections.css ~523), the try-out's values.
- **The drawing check** (D1494, D1495): the try-out page and the board frames a, b, c (`board.mjs`) are the approved
  look; a part list under `scripts/drawcheck/specs/` for the outline, the count line and the note, at 402 (WebKit, 3x)
  and 1536 (Chromium, 2x); red until every difference over about 2 px is fixed or he keeps it.
- Measure the board's line on one line at 402 with an iPhone's letters (lesson 23b; memory: his iPhone's font differs
  from a Windows measure).
- Open the pull request into `main` here (its checks run during the walk).

### Step 5 — run the whole suite once and sort the fallout (about 2–3 h; NOT measured — the size is the unknown)
- Under the lock, the full unit suite and the browser tests. Expect failures in three kinds, each written down:
  1. **A demo day that now needs its times** — Monday (3 items), Tuesday (2), Wednesday (1), Friday (1) of week 1:
     every test that signs or publishes those days through the screen or `commitSetDayApproved` (47 test files use it,
     25 `commitPublishALDay`, 11 press `data-beak`, 7 `data-alpub`, 9 the sign selects). Fixed by step 6, not by edits
     to each test.
  2. **A test whose premise the rule now forbids** — it publishes a day with a seated row that has no times. Found by
     search: `leavewar/publishdoor.test.ts` (11 blank-time places), `engine/rulesfirst-8-oil-hours.test.ts` W86 ("Stiff
     on Sunday's SDO desk with no times … publishing says the day earned nobody"), `ui/fableoil-unanswered-publish.test.tsx`,
     `ui/oilwait.test.tsx`, `ui/oilclaimcrowd.test.tsx`, `ui/reqrow.test.tsx`, `leavewar/sans-from-date.test.ts`,
     `state/p6c-requestonread.test.ts`, `state/p6d-deleteonread.test.ts`, `ui/board.test.tsx` (one), `e2e/leavewar.spec.ts`,
     `e2e/oilworkstart.spec.ts`. Each is rewritten to prove the refusal through the door it used, AND the behaviour it
     pinned is kept where it can still happen (a zero-length row for the "no usable times" publish note; an engine-level
     call for an older saved published day) — never weakened, each change traced to D2612/D2852 in the test's comment.
  3. **A pin of the old line's words** — `ui/amendretest.test.tsx` 448–455 ("3 to sign" on Monday — Monday has 3 gaps),
     `ui/draftsui.test.tsx` 387 ("4 to sign"), `ui/board.test.tsx` ~2191–2220, `ui/pubsweep.test.tsx` 153–169,
     `ui/editweek.test.tsx` 136. With the remade demo they read as before; where a test builds its own gap, its
     expectation changes to the ruled words.
- No test file cites D2612, D2613 or D2852 today (searched) — nothing pins the rule's absence by its number.

### Step 6 — the demo week remade (D2616) (about 2 h)
- **First find how the reference parity reads week 1** (`engine/parity.test.ts`, `testing/refwin.ts`): `engine/data.ts`
  is the seed both sides compare. The remake must not edit `data.ts` blind. Two safe shapes, the builder picks the one
  parity allows: (a) a `remadeDemo(days)` step applied where the week is handed out (`engine/weeks-data.ts weekBundle`
  for `13/07/2026` and `state/seeds.ts` boot), with `refwin.ts` applying the same patch to the reference as its
  `reduty()` already does for row order; or (b) edit `data.ts` and patch the reference the same way. Week 2 and week 149
  are authored here, not ported — edit them directly.
- The seven week-1 items: Mon OPS SHARING + NAV SYS BRIEF 17:55 (Stiff), DINNER WITH CMD 18:30, CMD ENGAGEMENT @ CREW
  ROOM (ALL) 21:30; Tue OPS BRIEFER / EP SUP 05:00, FLY W EXT SQN 08:45; Wed NAV-SYS TRIAL PREP 14:00; Fri MASS DEBRIEF +
  BEER CALL 17:00. **Give each the end the app assumes today** (start + the Logic open-end length, 60 min), so every
  conflict, crew-rest and hours result on the demo week stays the same and only the "assumed" words go. (The AMT
  BRIEF/DEBRIEF rows stay as they are: left out with nobody on them.) Then re-run the read-only scan on week 2 and
  week 149 and fill what it finds the same way.
- **Second step of the remake:** tests that used a demo row because it had no end (the D360 ALL AVAIL "an hour assumed"
  tests — DINNER WITH CMD is the classic one; `engine/published-day-logic.test.ts` 121–163) now build their own
  open-ended row on a draft day, which is still the case they test. Weekday rows earn no OIL, so OIL figures on the demo
  week should not move — any OIL figure that does is a finding to explain before it is accepted.
- A fresh boot: every demo day signable and publishable, no outline anywhere except where a walk stages one.

### Step 7 — the documents and the records (about 1.5 h; the Logic words wait for his answer)
- **Rulings marked** (the full rows in `.claude/decisions-full/scheduler.md`, then `backlog-archive.mjs --rulings`):
  D2046, D2053, D1990, D2055, D2072, D2073, D2080 and D360 — "NARROWED BY D2612: holds while a day is drafted; a day is
  never signed or published with the time missing" (D2612's own instruction, the backlog line); D361 and
  [ROW-NO-TIME-MARK] — replaced by D2852's outline, the item archived (`backlog-archive.mjs ROW-NO-TIME-MARK --homes …`).
  D2613 already carries D2853's mark (checked).
- **The scheduler page's lines** citing them (lines 134, 136, 137, 151, 388–389, 431 on the readings branch) get
  "while drafting" pointers; lines 155–161 have "not built" removed and name what was built. A rewritten line is read
  for meaning by Astra and a fresh Opus (D1738).
- **Reference docs:** `docs/engine-rules.md` (the open-ended row: drafting only), `docs/ui-contracts.md` (a new
  `[END-TIME-GUARD]` contract: the one function, the three doors, the outline, the count line, the red state, the
  caret-held pass), `docs/feature-impact.md` Flow D (a sign-off or publish reads `timeGapsOf` first), `docs/file-map.md`
  (two new files), `docs/handover-dataverse.md` (the rule must also hold at the database's own publish, filed for the
  IT side's table design).
- **The Logic page** (`ui/logic-html.ts` 58–62, 202–204): his words from W5, after Fable's word review.
- `OUTSTANDING.md`: the priority line rewritten to what is left (the Legend line), and the overlaps named (§4).

### Step 8 — LATER, after his look: the Legend line (D2803) (about 1.5 h + a LOOK)
- Draw it first on the real Legend at 402 and 1536 — the grey box and the red box beside "Time missing, fill it" —
  and show him (D1625); a fresh Fable reads the words (D2803). Then build in `legendHTML()` (html.ts 432) with a test,
  and a LOOK. It touches the same lines as `claude/sans-warnlines-185` (a Legend line there) and round 3's F4 (the
  "overlap" words in the Legend, [READINGS-LAPSE-FIX]) — build after whichever of those merges first, `main` brought in.

---

## 4. Overlaps with other open branches

Checked with `git diff origin/main...origin/<branch>` (and `git log origin/main..origin/<branch>`) against every file
above.

| Branch | Ahead / behind main | Touches our files | Overlap |
|---|---|---|---|
| `claude/sans-warnlines-185` | 58 / 30 | `ui/html.ts` (one line: the Legend's advisory key, inside `legendHTML`), `ui/logic-html.ts` (the SANS_AVAIL line), `scheduler.md`, `OUTSTANDING.md`, `engine-rules.md` | **Legend and Logic page** — our step 8 and step 7's Logic words sit in the same functions, different lines. Tonight's steps 1–6 do not touch `legendHTML` or the SANS line. Message that chat before step 7/8 (shipping rule D302) |
| `claude/sans-leftovers-179` | 35 / 49 | `scheduler.md`, `OUTSTANDING.md`, `engine-rules.md` only | records only — the later merge brings `main` in and keeps both sides (add-only) |
| `claude/msq-s4-posting-3ba6fa` | 24 / 30 | `OUTSTANDING.md`, `ui-contracts.md` | records only — our new `ui-contracts.md` section is added, not an edit of theirs |
| `claude/msq-b1-screens-135` | 435 / 30 | `state/sched-commit.ts` (+3 lines: `HOOKS.bellEnlist`/`bellEnd` after `schedStore`, not our functions), `ui/Shell.tsx` (imports, the nav's `schedEdit`/`viewOnly`, not the sign `onChange`), `ui/toast.ts` (+156: `toastAt`, the guard note's place), `state/view.ts`, `ui/SchedBoard.tsx`, `ui/scheduler/10-board-history.css`, `scheduler.md`, `OUTSTANDING.md`, `feature-impact.md`, `ui-contracts.md` | **Real neighbours:** `sched-commit.ts` (we add checks inside `commitSetDayApproved`/`commitPublishALDay`), `Shell.tsx` (we add `'refused'` in `onChange`), `SchedBoard.tsx` and `10-board-history.css` (the held panel pass, the board's line). Different lines; a merge by text. **`toast.ts`:** we change nothing there and use the ordinary `toast(msg,'blocked')` at its ordinary place (the try-out drew the note at the foot) — once msq-b1 merges, whether the time note should stand by the pressed box through `toastAt` is a question for him, not a change by us. Also carries D2819 (models this week). Message that chat before step 3 |
| `claude/leave-points-notifications-7a2f04` | 24 / 32 | `scheduler.md`, `OUTSTANDING.md`, `engine-rules.md`, `feature-impact.md`, `ui-contracts.md` | records only |
| also found: `claude/msq-s1-guard-6ae5e1`, `claude/msq-s2-users-685735` | — | `state/sched-commit.ts`, `ui/Shell.tsx` (the same hunks as msq-b1, which merged them) | as msq-b1 |
| `claude/readings-lapse-fix-fdbb3c` | 0 / 132 | no file under `raptor-port/src` | holds the rulings; round 3's sentence fixes F1–F7 (D2856) are a separate build that will touch `logic-html.ts` (F6) and the Legend (F4) — the same files as our steps 7–8 |

---

## 5. The bug check — tier, the eight answers, the walk

### 5.1 The eight questions (§5 of the order)
1. **Money — YES.** It decides when a day can be published, and OIL is earned only at publish; the demo remake changes
   rows that could earn.
2. **The published record — YES.** It refuses publishing, signing and amendments.
3. **Saved data — YES.** The demo seed (the reset version) is remade; saved weeks with old gaps are read by the new rule.
4. **A shared drawer — YES.** The outline is drawn by `ted()` (every week box) and by two board builders; the sign-off
   line by one builder for two surfaces.
5. **A new gesture or mode — YES.** A pressable count line; a greyed button that now takes a press; sign boxes that
   refuse a press.
6. **A new surface — NO.** No new screen, window, panel or kind of row: a mark and a line inside existing surfaces.
7. **Roles — NO.** Who may sign or publish is unchanged (the refusal applies to every scheduler alike); View-only
   showing nothing follows the page, not a role. (A Plan holder of another squadron is walked all the same.)
8. **The warning list — YES.** It is a new reading of a rule ("every item"), and the warning list must stay exactly as
   it is (I2) — a reading that has to be proved.

**Tier: FULL** (YES to 1, 2, 3 and 8). No sign-in or permission change → no security read (D1411).

### 5.2 What FULL means here (the block to tell him)
The gates; the rules sweep (every ruling in §0 checked against the running build, pass or fail, with a picture); the
scenarios designed by Astra and, in Fable's seat this week, a fresh blind Opus (D2443, D2819 — listed as owed), each
blind to the other and to this list, the host combining them with this list; the roll-call (§1) seen and operated row by
row; the door check (every press × every day state); the walk below; break tests per surface; the demo fixture; two
blind reads of the finished code (Astra and a fresh Opus, the same brief, D790, D1770); fix, re-walk what the fixes
touched; the evidence sheet with its `Walk:` line; his look last.

### 5.3 The sizing lines (`docs/walk-ledger.md` §Before any walk)
1. **Type:** A (one shared calculation read by many places), C (new presses), D (a mark drawn by three builders, a line
   by one builder on two surfaces), G (publish, amendment, undo, reload), E (the outline's look against an approved
   drawing).
2. **What only a walk can find:** a builder never wired (the board's inline Common Programme inputs); the native select
   opening on an iPhone despite the catch; a box under the top bar after the count tap; the caret-held block keeping an
   outline; a greyed button that cannot be pressed on a touch screen; the line wrapping on his iPhone; the OIL list
   opening first. Tests cover the rule's cases and the words.
3. **The ledger:** type D walks find "never wired" faults in about every second walk; G walks find order faults around
   undo and reload (the 8 Oct and 10 Oct rows: the blind reads after the walk found what walkers missed).
4. **The walk chosen:** three Opus walkers (D787, D2256 — Opus walks until he says back to Sonnet), each in its own
   world on a frozen copy of the production build: **W1** Edit Schedule week (desktop 1536 Chromium, phone 402 WebKit
   3x), **W2** the Scheduler Board (both sizes), **W3** publish / amend / undo / plans / OIL list / multi-squadron /
   View-only (both sizes). About 70 scenarios (this list's 66 plus the two designers'), the rule's repeated row-kind
   cases carried by `timegaps.test.ts` (it calls the calculation directly — it proves the rule, not the screen; each
   row kind is still made and seen once on screen, lesson 25). Plus the host's drawing check. Host opens every deciding
   picture, cropped, and reproduces every finding.
5. **After the walk:** its row added to the ledger.

### 5.4 The lessons of §7.11 that apply (each covered by a scenario below, or why not)
1 (state table: day state × signed × gaps × colour — S29–S45), 3 (what says a press happened — every refusal), 5 and
24 (the box scrolled into sight against the top bar — S31), 10 (page left and back — S43), 12 and 19 (the OIL list
opened and closed each way — S45), 16 (after a refusal: tap away, tap again, type the figure — S34), 17 (the line that
appears and goes — S35), 21 and 30 (touch on WebKit, pictures within 100 ms — S33, S65), 22 (the outline asserted by
its computed style on each box, anti-pattern 21), 23b (side-by-side boxes one height with the outline — S63), 25 (each
kind of row made through the app's own controls — S1–S28), 27 (neighbours measured when the line changes length —
S35), 28 (what a press opens, proved on screen — S33), 32 (every open reading walked on both sides and marked for him —
R1–R7). Not applicable: 2, 7, 13, 20, 26 (no drag or pinch change), 11 (nothing depends on how much fits), 18 (no
print change), 29 (nothing reads today), 31 (no page fitted to the screen changes).

### 5.5 My scenario list (one designer's list — the owner's rule wants two more, blind)

**Each kind of row, made through the app's own controls** (both sizes; outline seen by computed style)
- S1 Flight line: crew seated, take-off left empty, landing 14:10 → the take-off box outlined grey; count 1.
- S2 Flight line: take-off 12:00, landing empty → landing outlined.
- S3 Landing typed "TBD", then "tbd" → outlined and counted, no words of its own.
- S4 Flight line with no crew, take-off typed, no landing → counted (a start needs its end).
- S5 A new flight line, nothing on it → plain.
- S6 Formation CX'd with a take-off and no landing → plain, not counted; the CX taken back → outlined at once.
- S7 Two aircraft, one CX'd, the other crewed, no landing → counted.
- S8 SC MAIN with a man, START typed, END empty → END outlined; the warning list's count unchanged (no new line).
- S9 SC SPARE alone with a man, no times → both boxes, one item.
- S10 AVALON line with a man, no times → outline only; type its B so it flies → its existing advisory shows, nothing new.
- S11 SXO desk with Anvil, no times → both outlined, one item; the SDO desk with its role only → plain.
- S12 A desk with a typed callsign that is not on the roster → counted.
- S13 An AVALON-template desk with a man, START and no END → outlined; crew rest unchanged.
- S14 OFT EP-4, crew, END 10:30, START empty → START outlined.
- S15 AMT BOX with eight pax and no end → outlined.
- S16 The OFT "EXT SQN" row, its END cleared → counted.
- S17 AMT BRIEF 11:00 and DEBRIEF 12:30, nobody → plain; a man put on BRIEF → its END outlined; taken off → plain.
- S18 A typed ground row SAFETY DAY with Diesel, both empty → both outlined; 07:30–17:00 typed → plain (I4).
- S19 An all-day Training input accepted onto the Ground Programme → plain, never counted.
- S20 A timed input's row, its END cleared by the scheduler → counted.
- S21 A ground row with a man, no end, marked ⓘ → plain; ⓘ off → outlined.
- S22 Common Programme SQN PT 15:00 with ALL AVAIL → END outlined; the same with ALL.
- S23 DINNER WITH CMD 18:30, nobody → END outlined.
- S24 A Common Programme row with nobody and no times → plain.
- S25 A row with only its END typed and nobody (R1) → both sides walked, marked for him.
- S26 A time box holding "ASAP" (R2) → both sides walked, marked for him.
- S27 Under Unavailable: an ATTACH and a leave → never outlined or counted.
- S28 A Standard duty block placed blank → plain; a man seated on one line → that line outlined at once, grey.

**The count line and the tap**
- S29 Draft Thursday with 3 gaps: the week (desktop, phone) reads "3 items missing a time · 4 to sign"; the board
  (desktop, phone) the same with no box names, on one line at 402.
- S30 One gap: "1 item missing a time · 4 to sign".
- S31 Tap the line: the first empty box comes into view clear of the top bar, focused; again → the next; past the last
  → the first; a box in a folded section → the section opens; reduced motion → no smooth scroll. Phone: the keyboard
  opens on the box (picture).
- S32 With CUR CK signed and SKED CK not, a gap appears: names drop (a change clears them), the line reads the count.

**The refused press**
- S33 Press CUR CK with a gap — by mouse (desktop), by touch (phone, WebKit), by keyboard (Tab to it, Enter, Space,
  ArrowDown): the native list never opens; the box stays "— name —"; the note reads exactly "Blocked: 3 items are
  missing a time, each outlined in red. Type the missing times, then sign."; every outlined box turns red; no Edit
  history line; the bell shows nothing.
- S34 After the refusal: tap away, tap the box again → refused again; type one missing time → its outline goes at once
  (the caret still in the section); the count drops to 2; the others stay red.
- S35 Type the last time: the line goes back to "4 to sign" (the board: its box names back); neighbouring controls
  measured before and after on both sizes (nothing jumps that he did not rule).
- S36 Each of the four boxes refused with the same words.
- S37 Press the greyed Publish day with a gap → "… Thursday was not published.", boxes red; with no gap and not signed
  → nothing happens, as today.
- S38 One item: "Blocked: 1 item is missing a time, outlined in red. Type the missing time, then sign." and the publish
  form.
- S39 All typed, four signed, Publish day → published as today; its note as today.

**A published day being amended**
- S40 Published Thursday: empty the SXO END → the names drop, "1 pending", the outline grey plus the dotted waiting mark
  on the same box (the board drawing's frame c); press a sign box → refused; press the greyed Publish AL1 → "… AL1 was
  not published."; type it → sign → Publish AL1 works.
- S41 After AL1, empty a time again → "AL2 was not published."
- S42 The desktop Amendments panel's Publish AL with a gap → refused, same words (R6).
- S43 Red state: after a refusal, empty another box → per R3 (both sides marked); page to View-only and back; reload;
  another week and back; open and close the board — what stays red (R4).
- S44 Unpublish (a correction), edit, leave a gap → republish refused.

**The OIL list**
- S45 Fri 17 Jul as a public holiday with an unanswered Duty input and a gap: first press on CUR CK → the time note,
  the OIL list does not open; type the time; press again → the list opens with Ace held; Save → Ace signed; the other
  boxes as today. Then the list's ✕, Escape and Later — each as today.

**Undo, plans, versions, templates**
- S46 Sign four, empty a time → names gone; Undo → time and names back, outline gone; Redo → empty again.
- S47 Undo right after a refused press → the edit before it is undone, not nothing.
- S48 Two plans: plan A with a gap, plan B complete; switch to B → no outline, signable; preview A → no outline
  (read-only); switch back to A → outline.
- S49 Load an issued version onto the working copy → its times back, the outline gone.
- S50 Apply a day template with blank rows → plain until someone is seated.
- S51 Clear and "— name —" with a gap → allowed.
- S52 A stale set of four names with a gap (a saved plan or week from before) → the line reads the count; Publish is
  pressable and refused (R7's words, §5).

**Other squadrons and other pages**
- S53 An admin of 142 with Plan of 149, 149 picked: the same outline, line and refusal on 149's Thursday.
- S54 A View holder of 149: only View-only Sched, no outline.
- S55 View-only Sched, a draft day with gaps, as a member and as an admin: no outline, no count; the Working-draft peek
  of a published day: none.
- S56 A look at an issued version, and the next-week peek: none.
- S57 OIL Earn mode on a day with gaps (R5) — pictured.
- S58 The export of the week (the button that exists today) → no outline in what it makes.
- S59 The warning list on the same staged day before and after the build: identical lines and count; the weekend "no
  usable times" line still shows while drafting; a row typed 10:00–10:00 still publishes with its publish note.
- S60 After a refused publish: the Leave War shows no new OIL, no bid flag, the bell no line.
- S61 A wrong-week (protected) book: its own refusal first.
- S62 Fresh boot of the demo: every demo day signable and publishable; no outline on the untouched demo week.

**Look and measure**
- S63 The drawing check against the try-out and the board frames a, b, c at 402 and 1536; a box with its outline beside
  its neighbour measured one height.
- S64 The note at the foot on the phone, one line at the foot on a desktop, not covering the sign boxes.
- S65 Every phone tap pictured within about 100 ms of the lift and settled.
- S66 The Logic page's corrected lines (after his words).

**The plain-user round (§7.0a)** — a scheduler's day start to finish on both sizes: open Edit Schedule, add a flight line
and seat its crew, type its times, add a duty desk, a sim, a ground row and a Common Programme item; open the board from
the day and close it by its ✕, by Escape and by its back way; open and close the OIL list (✕, Escape, Later, Save), the
changes window, the day's ⓘ, the plans menu, the version list, the Legend and the warning list's fold; Undo and Redo;
sign the four; publish; unpublish; then look at every other place the result shows — View-only Sched, the Inputs page,
the bell, a man's Leave War OIL card, the next week and back.

---

## 6. Questions for him before the step they gate (his rulings do not cover these — never built as settled)

Each with when it happens, an example and a picture on the questions page (D2439, D1222). The builder writes both
sides' tests; the build of each case waits on its answer.

- **R1 — a row with only its END typed and nobody on it.** His words cover "a start needs its end even with nobody on
  it" and "an empty start is outlined as an empty end is", but not an end with nobody. Example: a scheduler types
  "— 17:00" on a Common Programme row and leaves it. Recommended: counted (its start outlined), as the try-out drew it
  — one rule: any time typed asks for the other. Gates step 1's one case.
- **R2 — words other than "TBD" in a time box** ("ASAP", "LATE"). He ruled "TBD" counts as empty; the app already reads
  any word as no time for its warnings (D2046). Recommended: every word counts as empty. Gates step 1's one case.
- **R3 — a box emptied after a refused press.** Recommended: red while the day still has any red box (the try-out's
  behaviour); once every missing time on the day is typed, the day is grey again, so a box emptied after that is grey
  until the next refused press.
- **R4 — how long red lasts.** Recommended: in this browser while he stays signed in — it reacts to his own press — and
  not for another scheduler on another device; a reload keeps it only if cheap (to say which on the build).
- **R5 — read-only places on Edit Schedule** (a preview of a version or a parked plan, the next-week peek, OIL Earn mode
  if its boxes cannot be typed). Recommended: no outline wherever the box cannot be typed in, as on View-only Sched.
- **R6 — the desktop Amendments panel's "Publish AL" button.** Recommended: the same as the day's Publish AL — greyed
  but pressable while a time is missing, refused with the same note.
- **R7 — a flying line whose every aircraft is cancelled but the line itself is not, with a take-off and no landing.**
  Recommended: treated as cancelled (never counted), by question L's reason — a cancelled flight has no landing to type.

## 7. The words the build shows (D2441: Fable reviews, D2854: one cold read before they are built)

**Ruled, built exactly:**
- W1 "N items missing a time" before " · N to sign" on Edit Schedule (D2854) and on the Scheduler Board, with no box
  names while a time is missing (D2734). "N to sign" is today's.
- W2 "Blocked: 3 items are missing a time, each outlined in red. Type the missing times, then sign."
- W3 "Blocked: 3 items are missing a time, each outlined in red. Thursday was not published." (the day's own name)
- W4 "Blocked: 3 items are missing a time, each outlined in red. AL1 was not published." (the next amendment's label)
- W4a "Blocked: 1 item is missing a time, outlined in red. Type the missing time, then sign."
- Later (step 8): "Time missing, fill it" (D2803).

**Composed from the ruled words, not worded by him — QUESTIONS FOR HIM (after Fable's review):**
- Q-W1 The count line with one item: "1 item missing a time · 4 to sign" (the ruled one-item refusal's form).
- Q-W2 One item on Publish: "Blocked: 1 item is missing a time, outlined in red. Thursday was not published." and
  "… AL1 was not published." (the ruled sentences joined to the ruled one-item lead).
- Q-W3 All four names in (stale) and a time missing: the line reads "N items missing a time" alone (S52).
- Q-W4 The count line's hover words: the try-out carried "Go to the next missing time" — not ruled. Recommended: keep
  it (a pointer has no other hint), or none; his call.
- Q-W5 The Logic page: the group "Rows with no end time" and its three lines, and the OIL lines "With no landing typed,
  it lands at its assumed landing (A flight)" and "Any other row the scheduler adds with no times, or no end time, earns
  nothing…" — now true only while a day is drafted, since no day is signed or published with a time missing. New words
  drafted by Opus, adjusted by Fable, put to him; nothing changed until he answers.
- Q-W6 The Publish button's hover title while a time is missing: today's "Sign off CUR CK, … before publishing
  Thursday" stays (recommended: no new words), or a time-first title — his call.

## 8. Risks and knock-on effects

- **The reference parity** (first step): a guard or a seed edit inside `src/engine/` breaks the port-vs-original tests.
  Kept out: the guard in the command layer, the remake where parity allows it (step 6's first task).
- **The test fallout** (second step): about 47–94 test files publish days; the demo's four weekdays with gaps would turn
  many red until step 6. Order matters: steps 3–4 land with their own new tests green, the suite is sorted once at step
  5 with step 6 in hand. The size is not measured — the riskiest hours in the plan.
- **Tests losing what they proved** (third step): a test of "a published day with an open row" is about old saved data
  now, not dead code — kept at engine level, never deleted (D56 still says old demo data is not a finding).
- **The caret-held repaint**: without the in-place pass the box he just typed keeps its outline until he leaves the
  section — looks like a fault.
- **The iPhone select**: Safari may open the native list on a tap that a desktop catch stops; `pointer-events:none` on
  the select inside its label is the try-out's way and the comment in `signoffHTML` already says Safari will not open a
  select from its label — proved on WebKit and named for his phone look (lesson 21).
- **A greyed button that takes a press**: keyboard focus now reaches it (aria-disabled); a screen reader says
  "dimmed"; tests that assert `disabled` keep passing because the no-gap case is unchanged.
- **The board's one line at 402**: "4 items missing a time · 4 to sign" in his iPhone's font — measured, not assumed.
- **Speed** ([APP-SPEED]): the rule is walked once per day per paint (memoised); the outline is a class, no new layout.
- **The OIL list's order**: a time refused first means a scheduler on a weekend sees two stops in a row (the time, then
  the OIL list) — ruled (E2), said so in his look card.
- **Second step, OIL**: once a day cannot publish with a gap, no published day earns from an assumed landing; the
  Logic and OIL words saying otherwise mislead (Q-W5) — the only text that changes meaning.
- **Third step, the database**: the same check must hold where publishing is done at the database step — filed into
  `handover-dataverse.md`.
- **The red state across chats**: two schedulers on one day see different colours (R4) — the count line is the same
  for both.
- **Toast placement after msq-b1 merges** (`toastAt`): our note keeps the ordinary place; a follow-up question only.
- **Older saved weeks on his PC** (his browser keeps weeks): a published day from before with a gap can still be
  amended only after its times are typed — correct by the rule, a demo-only case today.

## 9. Rough hours

| Step | Hours |
|---|---|
| 0 Questions page, the words' cold read, the empty evidence sheet | 0.5–1 |
| 1 The rule's function and its tests | 2 |
| 2 The words and the red state | 1 |
| 3 The refusals at every door | 2.5 |
| 4 The screens, the drawing check, the pull request | 4–5 |
| 5 The suite once, the fallout sorted (not measured) | 2–3 |
| 6 The demo week remade | 2 |
| 7 Documents and records (Logic words after his answer) | 1.5 |
| The FULL check: scenario design (Astra + a fresh blind Opus), roll-call, door check, three walkers, two blind reads, fixes, re-walk, sheet | 7–9 |
| **Tonight's build and check** | **about 22–26** |
| 8 Later: the Legend line, drawn, shown, built, LOOK | 1.5 + 0.5 |
