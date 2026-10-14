# Narrow read of the fixes — the small OIL job (commit 8fc7d5dac, against 6a37554d3)

Reader: a fresh Opus reader who wrote neither the code nor the fix. Read-only; nothing was run. Source read only at
the commit (`git show 8fc7d5dac:<path>`, `git diff 6a37554d3 8fc7d5dac -- raptor-port/src`). Rulings read in full:
D818, D816, D814, D782, D781, D783. Not opened: the plan, the hand-pass sheet, the other briefs and reports of this job
(the first reader's report in the scratch folder included).

## Verdict

**No finding that makes the count wrong, opens the list for the wrong days, or leaves an unanswered input with no sign.**
The four fixes do what the brief says they do. Two LOW findings, both about the one sentence at the list's foot
("What is left goes to the schedulers' bells") — words only, nothing saved wrongly. Three notes that are not defects.

---

## Findings (most serious first)

### L1 (low — words only; sure by reading, about 85%) — the foot's sentence is still promised when the only inputs left unpicked are ones no scheduler's bell carries

- **Setup.** Friday is made a public holiday while an input stands on it (so the schedulers got their one bell line for
  Friday). Input X runs Fri–Sat, no OIL answer for either day. Input Y is on the Saturday only, no answer (a plain
  Saturday — no bell line covers it). X is taken off after Friday is published; Friday's published version is loaded
  back. The list opens for Fri–Sat holding X and Y.
- **Press.** Pick "Yes" on X; leave Y unpicked.
- **What the app shows.** The foot still reads "What is left goes to the schedulers' bells". What is left is Y alone,
  and no scheduler's bell has a line for a plain Saturday — after Save the Friday line counts nothing and goes.
- **What it should show.** Nothing, as the fix's own comment says ("said only where it is true").
- **The same by the holiday's own save (less sure, about 65% — read, not run):** a holiday entered Fri–Sun opens the
  list for Fri–Sun (`leavewar/sync.ts tellHoliday` widens the run to the holiday's own line), but the bell's line
  counts its WEEKDAYS only (`sync.ts:902 holidaySpan`, which skips a weekend at either end). An input open on the
  Saturday only is in the list and never on the bell.
- **Cause.** `raptor-port/src/ui/OilDayList.tsx:61` — `belled` is asked of EVERY row in the list, not of the rows still
  unpicked; line 97 then prints the sentence whenever any row is unpicked.
- **Fix, step by step.**
  1. `OilDayList.tsx:61` — change to
     `const belled = rows.some(x => !picks[x.o.iid] && x.o.days.some(d => !!holidayLineOn(me(), d)))`.
  2. Line 97 can stay as it is (`done < rows.length` is then implied, harmless).
  3. Pin it in `leavewar/holnotice.test.tsx`: a list holding one input on a told holiday and one on a plain Saturday;
     pick the holiday's; expect `odl-left` to be `''`. Un-pick it; expect the sentence back.
- **Is it a regression?** No. Before the fix the sentence was printed for every unpicked row, so this case was already
  wrong. The fix narrows the fault; this is what is left of it.

### L2 (low — words only; sure by reading, about 80%) — `belled` asks the READER'S OWN bell, so the sentence is hidden from a scheduler who has no line of his own although the other schedulers' bells carry one

This is the brief's question "does `belled` hide the sentence anywhere it was TRUE before" — yes, here, and only here.

- **Setup.** Admin B's sign-in is switched off. Friday is made a holiday with an input on it; the list is left for
  "Later". Notices go to every admin whose sign-in is ON at that moment (`sync.ts:914 schedulerIds`, `a.on`;
  `state/notices.ts:192 noticeHoliday`), so B gets none — and never will, the notice is stored, not worked out. B is
  switched on again (the same holds for an admin account added afterwards). The input is taken off; B loads Friday's
  published version back.
- **What the app shows.** The list, with the input, and an empty foot.
- **What it should show.** "What is left goes to the schedulers' bells" — it does: every other scheduler's bell has
  the Friday line again, counting this input. Before the fix B was shown the sentence (always printed), and it was true.
- **Cause.** `OilDayList.tsx:61` — `holidayLineOn(me(), d)` (`state/notices.ts:249`) matches only notices addressed to
  the signed-in person.
- **Fix, step by step.**
  1. `state/notices.ts`, beside `holidayLineOn`: add
     `export function holidayLineAny(iso: string): boolean { for (const n of NOTICES) { const s = noticeSpan(n); if (s && s.a <= iso && iso <= s.b && noticeLive(n)) return true } return false }`
     (`noticeLive` already compares a notice only with newer ones of the SAME addressee, so it is right per notice).
  2. `OilDayList.tsx:61` — use `holidayLineAny(d)` in place of `!!holidayLineOn(me(), d)`; drop the `me` import and
     `holidayLineOn` from the import if nothing else there uses them.
  3. Pin it: the test "an admin whose sign-in is switched off is not told" has the world; switch him on, sign in as
     him, open the list for the holiday, expect the sentence.
- **Worth doing?** Host's call. The harm is a missing reassurance for a rare reader; nothing is lost and nobody goes
  untold. L1 and L2 are one line together if both are taken:
  `rows.some(x => !picks[x.o.iid] && x.o.days.some(d => holidayLineAny(d)))`.
- **Not confirmed (about 40%):** the same would hold for an admin whose own person is archived
  (`notices.ts:195` skips an archived addressee) — I did not establish that such an admin can still be signed in as a
  scheduler, so I do not claim it.

---

## Notes — not defects

**N1 — the list can be wider than the count; only wide, not harmful.** The list is the DAY'S list (D782, D818): it
shows every open input on `from`..`to`, and the note counts only the ones the load put back. That was already so on one
day (an input that stood all along and was unanswered is listed but not counted). The fix can stretch the run: an
input Fri 17 – Mon 27 put back with both weekends unanswered opens the list for Sat 18 – Sun 26, holding every open
input of both weekends, under a note that says "1 input needs an OIL answer". I checked what a Save then writes
(`ui/oilday.ts`): only picked rows, only their unanswered days inside the run, each on its own card with its own
dates. Nothing is written for an input nobody picked. "Yes to all" picks every row SHOWN. No fix proposed.

**N2 — a reading told to the owner has shifted; tell him.** D818's reading (2) says the list is "opened for the day
that was loaded". After this fix it opens for the days that need the answer — a Friday load can open "OIL — Sat 18
Jul" under a note that begins "Friday: … loaded". That is the right behaviour for the fault it fixes, and the ruling's
own bold line ("how many of the inputs it put back still need an OIL answer") is kept. But the reading as told to him
no longer matches; it should be said to him on the build.

**N3 — where a several-day input makes the run mixed, the holiday line goes.** Fri (holiday) + Sat (plain) → `plain`,
no "Public holiday · …" line, though the loaded day is the holiday. That is exactly what the brief says the fix is
meant to do; noted only so nobody reports it later as a fault.

**N4 — style only.** `reqdoor.ts:442` names its new local `placeOf`, the same name as the module's own
`placeOf(key)` at line 90 (used at the top of `rowMark`). It is block-scoped inside the `if (g && g.kind === 'ask')`
block, so the outer call resolves correctly and there is no use-before-declaration. A different name (`btnPlace`)
would save the next reader a double-take. No behaviour change.

---

## Explicit negatives — what I checked and found nothing wrong with

**The load's door (`ui/interactions.ts:1257–1323`)**

- **The load changes filings only.** I read `engine/drafts.ts loadVersionToWorkingCopy`, `engine/publish.ts
  filingRestorePlan` and `engine/slots.ts reconcileDayFiling`: the load sets or clears `acc`; it never creates an
  input, never changes an input's dates, its OIL answers or its cancel / information-only marks. So `lo`..`hi`, worked
  out BEFORE the load from the inputs covering the loaded day, is still right AFTER it — every input in `back` covers
  the loaded day, so its whole span is inside `lo`..`hi`, and `open.get(...)` returns all its unanswered days.
- **Can the wider run count an input the load did not put back? No.** `lo`..`hi` only widens what is READ; `stood` and
  `back` are both filtered by "stands on the loaded day". An input that stood before and was open on any of its days is
  in `stood` and left out. An input that stood before and was answered cannot become open by a load. A long leave or
  medical input covering the day widens `lo`..`hi` and changes nothing else.
- **Can it miss one that was put back? No.** Put back = did not stand before (`acc` neither `g` nor `u`), stands now.
  It is not in `stood`; it is in `open` if any day of its span is unanswered. Compared with the old code, case by case:
  one-day input — identical result; several-day input — counted where the old code missed it, never the reverse.
- **Can `days` be empty while `need` is not? No.** `back` requires `open.has(id)`, and `oilOpenOn` only returns an
  input with at least one day (`sync.ts`, `if (!days.length) continue`). `inpId(x)` is `x.iid`, the key `oilOpenOn`
  uses. The `|| iso` fallbacks are never reached.
- **One day.** Same list, same note as before, except the heading now reads the holiday's own name (F2).
- **Several days / the week's edge.** A Sun–Mon input with its row on the loaded Sunday: the plan puts it back
  (it covers no OTHER loaded day); its Monday, if a holiday and unanswered, is in `days`; the list opens across the
  week's edge. `oilOpenOn` and the Save read the inputs by date, not by loaded week; a locked week's day is never
  listed (`isoProt`). An input whose row stands in the OTHER week is left out by the load and stays as filed — not
  counted, correctly.
- **Under Unavailable (no row).** Stands as `u`; counted when the load files it there and it is open (D818 reading 5,
  D804). An input that also covers another loaded day is left as filed by the load and not counted — correct.
- **Cancelled or information-only.** Never in `oilOpenOn` (`oilSilent`), so never counted, never listed (D814). The
  load does not take a mark off.
- **Deleted since.** The load does not re-create it; its row comes back as a kept row with no input behind it;
  nothing to ask.
- **Moved since / left as filed.** Stays off the programme → does not stand → not counted; the existing "left as
  filed" words still say so.
- **A new input filed since the version** (lands again by itself after the load): it stood before, so it is in
  `stood` if it was open — not counted as put back. Correct.
- **Order.** `back` is read after `afterSchedMutate()`, so it sees the filings as the load and the working-out leave them.
- **Heading (F2).** `holidayOwnName` is the reader the holiday's own save and the bell use; a holiday saved under the
  preset's word gives `name: ''`, `plain` false → "Public holiday" alone. Two holidays of different names in one run →
  "Public holiday" alone. Any non-holiday day in `days` → `plain`.
- **Types and imports.** `unfmt`, `inputCoversDate`, `holidayOwnName` are imported; `unfmt` and the list's own date
  reader (`labelToISO`) resolve a label's year the same way (label's year, then the row's, then the base year).

**The list's foot (`ui/OilDayList.tsx`)**

- **The holiday's own save still shows the sentence.** The notices are written inside the holiday's command and the
  list is opened after it; the declaring admin is among the addressees; the line is live while anything on the
  holiday's weekdays is open. The older test at `holnotice.test.tsx:580` still expects it and by my reading still holds.
- **The bell's line tapped still shows it.** The list opens for the line's own span; every row has a day inside it;
  that same line is live for the reader. Marking the line read does not make it not live.
- **The stale-count worry.** The "how many are left" figure is kept until the store's version, the war's facts or the
  list's length moves; the load's handler ends in `notify()` before anything is drawn, so the first draw reads fresh.
- **A plain weekend, and a holiday that told nobody:** blank foot, as intended (pinned at `holnotice.test.tsx:358`).
- **Other tests that read the foot:** I searched every `odl-left` and "What is left goes" under `src`, `e2e` and
  `scripts/handpass`; none expects the sentence in a case where `belled` is now false. (Not run — read only.)

**The flash after "not answered" (`ui/reqdoor.ts:442–454`, `ui/oilwait.ts:124`)**

- **Position is the right address.** The board draws the button as `data-grcx` / `data-grinfo` = `<day>.<index in the
  day's ground list>` (`board-html.ts:406`, read back at `board.ts:1122, 1139`); the new `placeOf` uses the same raw
  index, through `standsOn` — the input's standing row, never a dead kept one.
- **A row on a day other than the board's.** The selector then names a day the board is not drawing → matches
  nothing → nothing flashes; the bar still says "Not un-cancelled — OIL not answered". No WRONG row can flash.
- **No row at all** (taken off while the bar was up): `places` is `[]` → nothing flashes; the bar still says it.
- **First press.** The place is now read AFTER the tried-and-thrown-away save, from the day as it stands — better than
  the old place, taken before it.
- **Between the question and "Don't un-cancel"** the question's sheet covers the page (a press outside it IS "not
  answered"), so the place cannot go stale in that gap.
- **"Answer OIL" no longer carries the old place** for `uncx` / `uninfo` only. No caller adds a second place to
  these two kinds (`oilWaitAlso` is the drag's; `rowMark` is reached only from the board's three buttons —
  `board.ts:1124, 1131, 1143`), so nothing they needed is lost.
- **Other kinds of waiting change.** `swap`, `add`, `move` (row-id keys), `back` and `file`
  (`[data-acck="<input id>"]`), the calendar's drag and the Unavailable row's (`[data-iid]`, `[data-inpseat]`) all
  keep the carry-over exactly as before; none of them is addressed by position.
- **The shadowed name** (N4) is not a runtime fault.

**`leavewar/sync.ts`** — `holidayOwnName` is only made public; its body is unchanged.

## How sure

- The four fixes do what the brief says: about 90% (read closely; nothing run).
- L1: about 85% on the load's road, about 65% on the Fri–Sun holiday road.
- L2: about 80%.
- No count, wrong-day or no-sign fault in the changed lines: about 85%.
