# The Inputs calendar and the SANS availability calendar — the build plan (D617–D641) — 7 Oct 26

Written by the builder (Opus 5.5) before any app code changes, for one round of challenge by Astra and by Sol 6.1,
each blind to the other (D353, D590). **Nothing in it is built.** *Both have read it (7 Oct 26): §10 says what each found
and what changed; the sections below are the plan as it now stands.* The job: `OUTSTANDING.md` `[SANS-COMMITMENT-CALENDAR]`,
on the branch `claude/inputs-sans-calendar` (Codex's build of 5 Oct 26 with `main` merged in). The design he approved,
picture by picture, and every answer he gave: `../specs/2026-10-07-inputs-sans-redesign.md` — read it first. The
rulings, full rows: `grep -h '^| D6[1-4][0-9] |' .claude/decisions-full/scheduler.md` (D617–D641; D623–D625 are in
`how-we-work.md`), and the earlier ones that still stand: D569–D572, D577, D581 (same grep, `D5[67][0-9]`, `D58[01]`).
**Tier: FULL** — saved data, who may do what, and a count of who is present (the bug-check order's questions 1, 3, 7; also
4, 5 and 6).

## 1. What he ruled (the short form — the design note and the full rows are the authority)

- **A SANS date shows** pilots / WSOs still needed to fly, and the SANS committed to F, O and A, as pairs (D617). Still
  needed = the Leave War's required figure − those the Leave War shows available − the SANS committed to fly, for each
  seat, never below zero. The requirement is two figures, pilots and WSOs (D622). Three colours — yellow, amber, red —
  by the two needs added together, from 1 / 3 / 5, set by an admin behind a settings gear (D618, D626, D635). A
  Highlight picker rings one SANS person's days in cyan and underlines his letters (D619).
- **A day is day flying, night flying or no fly** — exactly one (D627, D638); day by default (D631); an NF day needs
  nobody, reads 0 and says "NF". Public holidays (green) and Off days (grey) show on both calendars from the Leave
  War's own record; sun and moon on the SANS calendar only (D627).
- **"Days"** — reached from the gear on the SANS calendar, the Inputs calendar and the Leave War — has two parts:
  **Month** (a desktop date carries three buttons D / N / NF, a phone date ONE button that steps day → night → no fly;
  a weekday's heading sets every such day from a date onward, no end) and **Holidays** (the year's list of public
  holidays and Off days) (D631, D633, D638). A public holiday and an Off day each have two doors onto ONE record — the
  Leave War's Event row, whose sheet is NOT changed (D634), and the Holidays list; No Leave is on the Leave War only.
- **On the Leave War**, four rows directly under the Event rows: Required P and Required W, typed straight into their
  cells; Available P and Available W, worked out (D633, D636, D637). Several cells are picked by a drag and given one
  number. A figure can run "from a date on", skipping weekends, public holidays, Off days and no-fly days. No "SANS
  needed" row. The two Available rows are ordinary count rows an admin can rename and re-define — leaving out OCU, say
  (D640); "available" never counts a SANS man (D626).
- **The layout:** three slim tabs — Inputs, SANS, Medical (D620, D626); inputs drawn as bars (D626), compact on a
  desktop with no switch (D632, D639); the Inputs List behind one switch; no list for SANS, and SANS availability
  leaves the Inputs List (D620); hold-and-drag (a mouse drag on a desktop) picks several days; an Instructions fold;
  the keyboard set (D621, D626).
- **The late cut-off** is a number of days, or a weekday of a number of weeks before; each calendar has its own, behind
  its own gear; the Logic page lists both; a cut-off is the end of its day; "How this works" states it as set (D628,
  D639).
- **Who placed an entry and when**, in small print, wherever an entry is listed or opened — never on the month (D629).
- **Every pop-up window of this job can be dragged and the page behind it still works**; a click outside does not close
  it (D641 — it sets aside, for these windows, the 4 Sep 26 rule that a pop-up closes on a click outside).
- **In the bug check**, each approved mock-up sits beside a picture of the built screen at the same size (D624).

## 2. What the app has today (read 7 Oct 26 on this branch; the load-bearing lines checked first-hand)

**Codex's calendar (World 1 — the scheduler's store).**
- `src/state/sans-calendar.ts`: one settings ROW per authored date, `sansday:<iso>` = `{required, flying:
  'unset'|'day'|'night'|'both'}`, and one key `sanscalendar` = `{amberFrom, redFrom}`; written by typed admin commands
  (`sans.day.set`, `settings.sanscalendar`) through `commitSettingsIntent` (`state/people-settings-commit.ts:249`), with
  a write-hook that refuses a raw write, a read-back check, and `COMMAND_OPS['sans.day.set'] = op(T.setting,'U')`
  (`state/perms.ts`). Undo lands on the SANS month (`state/undo-wire.ts landingOf`); wording in `undo/describe.ts`.
  **None of this ever reached `main`**, so no browser but this PC's holds a `sansday:` row.
- `src/ui/InputsCal.tsx` (1,098 lines, all React): Member cells are chips (`.ic-chip[data-iid]`, dragged by
  `caldrag.ts`), SANS cells a summary (`F n / required`, O, A); a day opens in `.ic-pop` — a 360 px side panel with no
  scrim on a desktop, a bottom sheet WITH a scrim on a phone; ranges by a mouse drag on empty cells, or a "Select
  dates" button on a phone. `src/ui/InputsPage.tsx` (1,169 lines): `INPVIEW` ('table'|'cal'|'med') and `INPMODE`
  ('member'|'sans') in `state/view.ts`; per-mode filters; the saved-row reveal (`INPREVEAL`) Astra's first read asked for.
- `src/ui/SansCalendarControls.tsx`: the day panel's "Flying SANS required" box and flying-period select; a "Colour
  settings" dropdown (two cut-offs).
- Astra's two reads of that build (`../../handpass/2026-10-05-inputs-sans-astra-final-r{1,2}.md`): one P2 each — the
  saved input not revealed in its mode; the colour popup ignoring an outside click — **both since corrected in the
  code** (`view.ts:91-106`, `SansCalendarControls.tsx:46-58`). No third read was made; Opus's own read is owed (§4, step 0).
- **An input** (`engine/schema.ts:172-219`): `iid, person, date, endDate?, yr, allday, s?, e?, half?, type, remarks?,
  mod, …, sans?: {f?,o?,a?}`. It carries `mod` — a DATE, overwritten on every edit — and **no person and no time**. The
  change history has both (`engine/editlog.ts ELogRow: t, who, iid`) but keeps only 2,000 lines, has no lookup by input,
  and writes NO line when only the F / O / A ticks change (`state/changelines.ts inputLines` never compares `sans`).
- **The late rule** (`engine/inputs.ts:755-818`): due = the Monday of the input's own first day's week −
  `VCONF.inputLead` days (14); late when `mod` is AFTER the due day; downchits and upchits exempt. One figure, on the
  Logic page (`ui/logic-html.ts:205`). The late mark is drawn on the board, the week and the List — nowhere on the calendar.
- **The input editor** (`ui/inputedit.tsx InputEditor`, `ui/pops.ts INPEDIT`): one shared dialog, a full-screen scrim
  (`.airpop`, z 460), closed by a click on the scrim; opened from the board, the week and the Inputs page alike.

**The Leave War (World 2 — its own store).**
- A day's events live ON ITS WAR: `Period.days[].events[line]` with an optional kind tag, plus `Period.bands`
  (`engine/period.ts:26-92`); the whole period is ONE stored row (`war:<id>`). The event TYPES are squadron-wide
  (`engine/eventdefs.ts`: PH → `off`, Off day → `free`, No Leave → `nolv`, SC → `work`). Two wars never share a date;
  `warHolding(wars, date)` finds a date's war (`engine/wars.ts:73`). **A date no war covers has no holiday record**
  (`sync.ts isNonWorkingISO` falls back to weekend-only; the schedule already says "no Leave War period covers this
  date" and offers `createOilPeriodFor(year)` — D19). `setDayEvent` and its siblings write ONLY the war on screen.
- **"Available"** is `haveOf` (`engine/availability.ts:275`): 1 less half a day for each half touched by a filed
  absence or by any bid not refused; ground crew skipped; `ruleHave` sums it over a count row's filter (`:217`). **A
  SANS man in the roster IS counted** — `matchesFilter` never reads `p.san`. Counts are worked out for the war on
  screen only (`ui/Matrix.tsx:719`); nothing works one out for an arbitrary date.
- **Count rows** are data (`engine/requirements.ts ManningRule {id, label, count, threshold}`), built and renamed in
  `ui/CounterForm.tsx` (seat, CAT with "everyone except" — OCU is on the ladder — and quals), stored whole under
  `manningdefs`. Any row can be deleted; "Reset counters" discards them all; no rule counts all pilots or all WSOs.
- **The grid** is one table: `tbody.counts` (unmounted when Manning is folded) → the month strip → `tbody.mxhead` →
  `tbody.events` (`ui/EventRows.tsx`) → the roster. Every row must carry the same cells, placeholders included
  (`docs/performance.md` §E). The pinned header copy shows the bracket and date rows only — Event rows scroll away.
- **The drag** (`ui/select.ts`): a mouse arms on a 4 px move — Shift is never read; a finger on a 180 ms hold. Two hit
  kinds: a roster cell (people × days) and an event cell (one line × days). A tap on a count cell does nothing.
- **Every Leave War window is `ui/Sheet.tsx`**: a transparent scrim; it drags by its title strip; **a click outside
  closes it and the grid behind is NOT usable** while it is up (`Sheet.tsx:354-357, 425`).
- **How the two apps meet today:** `src/ui` and `src/state` import a named function from `leavewar/sync.ts`, which
  reads the war holding a date (`oilAskPlan`, `oilPendingFor`, `createOilPeriodFor`, …); the engine is fed through
  `HOOKS.*`. A Leave War change repaints the scheduler only for OIL-relevant changes (`sync.ts raptorNotify`, guarded).

## 3. The design

### 3.1 Who owns what, and the two new reads

| The fact | Its one home | Who reads it |
|---|---|---|
| A public holiday, an Off day (and No Leave) | the Leave War — the war's own day events (unchanged) | the war; both calendars; Days |
| Who is available, per seat, on a date | the Leave War — worked out from two count rows | the war's new rows; the SANS calendar |
| A day's flying class; the weekday rules | **the scheduler's settings rows** (new: `flyday:`, `flyrule:`) | Days; the SANS calendar; the Inputs calendar (the NF tag); the war's Required rows (NF) |
| Required pilots and WSOs; running figures | **the scheduler's settings rows** (new: `flyday:`, `flyrun:`) | the war's Required rows; the SANS calendar |
| The three colours; the two late cut-offs | the scheduler's settings (`sanscalendar`; the Logic rules) | the calendars; the Logic page |
| A SANS commitment, an input | the Input record (unchanged home; four new fields) | everything that draws an input |

**Why the flying plan and the required figures are scheduler settings rows and not Leave War records.** (a) They
outlive a war: a figure that runs "from a date on" and "every Thursday from 5 Nov, no end" have no end date, while
everything the war stores per day lives inside one war's period. (b) Codex's settings-row path for exactly this kind
of record is built, reviewed and tested — typed admin commands, the write-hook, the read-back check, one row per
changed day, global Undo with a landing — whereas a new Leave War record must be threaded through seven places of a
4,700-line store that still carries its own older undo stack (`historySnap`). (c) The command layer is the one both
stores already share (`docs/undo-contract.md`); no new store pattern is added.

**The cost: two new reads across the boundary, both in `leavewar/sync.ts`, the file that already is the seam.**
1. **The calendars read the war:** `dayFacts(iso)` → `{ covered, kind: 'ph'|'off'|null, name, weekend, availP, availW }`,
   and for the Holidays list `holidaysIn(year)`; plus the three writes of that list (§3.4). Read-only for the calendars.
   **And they must HEAR the war change:** `sync.ts` exposes one small signal, `useWarFacts()` — a version that moves
   whenever anything `dayFacts` or `holidaysIn` reads has moved (a day's events, a band, a seeded `ph`, the event
   types, a period made or re-dated, the count rows' definitions, the roster and its postings, a bid filed, decided or
   moved, an Undo or Redo of any of them). Both calendars, Days, an opened day and the working box subscribe to it.
   It is NOT the OIL-only `raptorNotify` — that stays as narrow as it is, so the board is not repainted by leave bids.
2. **The war reads the flying plan:** its new rows import the plan's getters from `state/flyplan.ts` through one
   re-export in `sync.ts`, and repaint on the scheduler's own change signal.
Both are named in `.claude/rules/decisions/leave-war.md` §Architecture in the change that builds them, as riders on
the `sync.ts` seam (D617's reading 5 asks for exactly this). **This is the plan's main structural bet — attack it (§9).**

### 3.2 The flying plan — records and the one resolver

New pure module `src/state/flyplan-model.ts` (no DOM, no store; all date maths on ISO strings through UTC, never local
time) and `src/state/flyplan.ts` (the store reads and the typed commands), replacing the day half of `sans-calendar.ts`.

- `flyday:<iso>` → `{ cls?: 'day'|'night'|'nf'|'none', p?: int ≥ 0, w?: int ≥ 0 }` — what is set for ONE date. Any
  subset; the row is deleted when empty. `cls` is stored only where it differs from what the date would inherit.
- `flyrule:<id>` → `{ wd: 0–6 (Mon = 0), cls: 'day'|'night'|'nf'|'none', from: iso, until?: iso }` — "every Thursday
  from a date onward". A second rule for the same weekday and the same `from` replaces the first.
- `flyrun:<iso>` → `{ p?: int|null, w?: int|null }` — a figure that RUNS from that date, per seat; `null` ends the
  run for that seat; a seat not named is not spoken for. One row per start date.
- Unknown fields, a non-date, a negative or fractional figure are refused at the write and ignored at the read.

**The resolver** (`planFor(iso, facts)` — one function; every surface calls it, none re-derives):
```
kind    = facts.kind                      // 'ph' | 'off' | null — from the Leave War
weekend = Sat or Sun
cls     = kind ? null                                   // the tag shows instead
        : day.cls ?? ruleInForce(weekday, iso)?.cls ?? (weekend ? 'none' : 'day')   // 'none' reads as "not set"
          (ruleInForce = the rule for that weekday with from <= iso <= until, the latest `from` winning)
req(s)  = cls === 'nf'            → 0, shown "NF"       // a no-fly day needs nobody — whatever is typed under it
        : day[s] != null           → day[s]              // typed for this date
        : weekend or kind          → none                // a running figure skips these (D637)
        : latest run with start <= iso that names s → its value (null = none)
need(s) = req(s) is none ? none : max(0, ceil(req(s) − avail(s) − sansFly(s)))
tone    = need(p) + need(w):  >= red → red; >= amber → amber; >= yellow → yellow; else none
```
- `avail(s)` comes from `dayFacts`; where no war covers the date it is unknown, and so are the needs (shown "–").
- `sansFly(s)` = the SANS people of that seat with a commitment to fly covering the date — Codex's `activityPeopleOn`
  split by the person's seat; a person counts once a day (D572); filters never change it (D581).
- A half-day absence makes `avail` fractional: the need is rounded UP (15.5 available against 16 needs 1).
- `sanscalendar` becomes `{ yellowFrom: 1, amberFrom: 3, redFrom: 5 }`, whole numbers, `1 <= yellow < amber < red`.

**Commands** (admin only — `op(T.setting,'U')`, each added to `COMMAND_OPS` and the write-hook's guarded prefixes, in
step with `docs/data-model.md` §11 — D200): `fly.day.set` (one or MANY dates in one command — a picked block is one
Undo step), `fly.rule.set`, `fly.rule.remove`, `fly.run.set`, `settings.sanscalendar` (kept) and `settings.flynames` (the
Required rows' names — `flynames` joins `SETTINGS_KEYS`, the permission inventory and the guarded keys; an unlisted key
would be written raw, outside permission and Undo: `people-settings-commit.ts:322`). `sans.day.set` and
the `sansday:` rows go. Undo wording (`undo/describe.ts`): "the required pilots and WSOs for 12–16 Jan", "day or night
flying on Thu 15 Jan", "Thursdays as no-fly days from 5 Nov", "a required figure running from 12 Jan". Landing: a
required figure → the Leave War, on that date; a class or a rule → the page he is on if it shows it, else the SANS month.

### 3.3 The Leave War — four rows under the Event rows

A new component `leavewar/ui/FlyRows.tsx`, mounted in `tbody.events` after `EventRows`, following the row contract to
the letter (`who`, `bal`, the two placeholders, one cell per DRAWN day).

- **Cells.** `req-p-<iso>`, `req-w-<iso>`, `avail-p-<iso>`, `avail-w-<iso>` (never an `event-`, `cell-` or `count-`
  prefix — the drag code hit-tests those). A Required cell shows the resolver's figure, "NF", or "–"; the day a
  running figure starts wears a small corner mark, its title saying "18 from Mon 12 Jan onward". An Available cell
  under its Required is red; a tap on it (a click on a desktop) opens a small read-only box with the working —
  required, available, SANS committed to fly, still needed. A member sees all four rows, read-only.
- **Available = two count rows with fixed ids**, `availp` and `availw`: `{ kind: 'people', filter: { seats:
  ['pilot'] } }` / `['wso']`, thresholds 0 (their red comes from Required, never from a threshold). They are seeded;
  **where a stored set has none, the built-in definition is used** (an older store, or after "Reset counters"). They
  are drawn here, not in the Manning block (`CountRows` skips the two ids). Their name and who they count are changed
  with the form the war already has (D640); `deleteManningRule` refuses the two ids with a sentence ("The SANS calendar
  reads this row — rename it or change who it counts"); `saveManningRule` refuses a "teams" count for them, and
  both it and `setManningThreshold` hold their thresholds at 0. **The counter form gets a mode for the two ids:** no
  amber / red boxes; its live preview is summed the same SANS-less way (today's preview sums everyone —
  `CounterForm.tsx:243`); and one line says "SANS people are never counted here".
  **Whatever the filter, a SANS man is left out** (D626): the two rows are summed over `people` without `p.san`, on the
  grid and in `dayFacts` alike — one function, so the two never disagree.
- **Names.** The Required rows take a free-text name (a new settings key `flynames` = `{ p, w }`); while a name is
  still the default, a phone shows its short form (Req P, Req W, Avail P, Avail W).
- **Typing one cell (admin).** On a desktop a click puts ONE floating input over the cell — never an input per cell.
  Enter saves and moves to the next flying day; Tab to the other seat; Shift with either goes back; Esc leaves the cell
  as it was; an empty box and Enter clears the date's typed figure. A slim strip under the cell names the row and the
  day and carries the choice "This day | From <date> on". **On a touch screen the app shows its own small number pad**
  with that same strip above it (‹ › Done) — not the phone's keyboard: an 11 px input in a grid cell makes iOS zoom the
  page on focus, and a bar fixed above the phone's keyboard is unreliable there. A no-fly cell cannot be typed; its
  title says where to change it.
- **Picking several.** A third hit kind in `select.ts`: a drag that starts on a Required cell picks a rectangle over
  the two Required rows × days (the event rows' one-line rule is not reused — both seats in one pick is the point,
  D622). Arming is unchanged for every kind (4 px for a mouse — so Shift-drag and press-pause-drag both pick; a 180 ms
  hold for a finger). On release the Required panel opens — `Sheet.tsx` gains a `modal={false}` form (no scrim, no
  outside-click close, no focus trap) used by this panel only: the number box, "These days | From <date> on", Apply,
  Clear. **Which picked cells take the number is worked out at Apply, and differs by choice:** "From <date> on" is a
  running figure — it skips weekends, public holidays, Off days and no-fly days by the resolver, always. "These days"
  writes the picked dates themselves: a no-fly day is always left out; weekend, holiday and Off-day cells CAN take a
  typed figure (D637) — where the pick is only such days they are filled, and where it mixes them with ordinary days
  they are left out and the panel says so with one press to take them in ("2 weekend days left out — Include").
  Apply is ONE `fly.day.set` / `fly.run.set` command.
- **Repaint.** `FlyRows` subscribes itself to the scheduler's change signal and to the war's; `Matrix` and the memo
  firewall are not touched. Its cells are memoised per drawn month on a signature of EVERYTHING the resolver read for that
  month — not only the rows dated inside it: for each seat the run in force on the month's first day and every run
  starting within it; every weekday rule overlapping it; its date rows; its days' kinds and coverage; the two
  availability rows; the SANS commitments to fly. (Built as: the resolver returns its answers for the month, and the
  signature is those answers — an inherited change then moves it by construction.) A figure that widens a day column asks the grid to re-measure, as the Archive rows do.
- **The panel for a picked block of people's days comes into line (D642):** `SelectSheet` uses the same non-modal
  form — no scrim, no close on a click outside, the grid behind usable. While it is up, a new drag on the grid
  replaces what it is acting on (the panel follows the new pick); a plain click on a cell opens that cell's own sheet
  and closes the panel; its ✕ and Escape close it. Move mode is unchanged (an empty tap outside still cancels a MOVE —
  D262 — because that is the move, not the panel). The war's other windows keep today's behaviour
  (`[LW-WINDOWS-NONBLOCKING]`).
- **⚙ Settings** gains one line, "Days…", which closes the sheet and opens Days (§3.4). Nothing else in it changes.

### 3.4 Days — Month and Holidays

One window (`src/ui/DaysWindow.tsx`), mounted once in the shell like the input editor, opened by `pops.ts` state from
the gear of either calendar or from the Leave War's ⚙; admin only. Two parts side by side on a desktop, two tabs on a phone.

- **Month.** A 7-column month; ‹ › and Today. A date shows its number and either its tag (PH green, OFF grey — from
  `dayFacts`) or its class control: on a desktop three buttons D / N / NF, the chosen one lit (pressing the lit one on
  a Saturday or Sunday unsets it); on a phone ONE button that steps day → night → no fly (→ not set, on a weekend).
  Each press is one `fly.day.set` and one Undo step. A date that differs from its weekday's rule wears a small dot.
- **A weekday's heading** opens "Every <weekday>": the class, the date it starts (the next such day by default), and
  Until — no end, or a date; with the rules already made for that weekday listed beneath, each removable.
- **Holidays.** A year, ‹ ›. One line per public holiday or Off day — date or run of dates, its name, a PH or OFF tag —
  past ones dimmed; "+ Add" (kind, name, from, to, "Save and add another"); a line opens to change or delete.
  It is the war's own record seen as a list, through `sync.ts`: `holidaysIn(year)` reads every war's days and bands in
  that year (kind `off` → PH, `free` → Off day; a seeded `ph` flag with no event shows as "PH"); `holidayAdd`,
  `holidayChange`, `holidayRemove` write to the war HOLDING each date (a new `updateWarById`), on the first Event
  line free across the range, as a tagged day event or a band — one named command each (`lw.holiday.add` …, admin, in
  `COMMAND_OPS` and `lwRegisterCommands`), so Undo reads "a public holiday on 9 Aug", not "the war's dates or name".
  A range that crosses two periods is refused with a sentence. **A date no leave period covers:** where the WHOLE
  year has none, D19's line and its button — "No leave period covers 2027 yet — Create it" (`createOilPeriodFor`, which
  makes January to December and is refused if any part of the year is already held). Where the year is PARTLY covered
  (a January–March period, a holiday in August), no year button is offered: the line says which dates are not covered
  and opens the war's own "+ New" period sheet with the gap's dates filled in; the holiday being added is kept and
  saved once that period exists.

### 3.5 The SANS calendar

- **The date cell** (the second mock-ups' drawing, in the first set's colours — D626, D630): the day number with a sun
  or a moon, or the tag NF / PH / OFF; the still-needed pair, pilots left and WSOs right, in the day's colour over a
  soft wash; F, O and A each as a pair of the SANS committed, in the soft grey. A date with no requirement, or outside
  every leave period, shows "–" and no colour. A no-fly day reads 0 / 0 and "NF".
- **Highlight** — a picker of the SANS people ("No highlight" first); a cyan ring on each of his days, his letters
  underlined; session-only view state, in `VIEW_RESET`. **The SANS tab has no filters** (the Highlight does that job,
  and the counts ignore filters by ruling — D581).
- **A day opened:** the working (required, available, SANS committed to fly, still needed — both seats); the
  commitments, grouped WSOs and pilots, **each person drawn as his puck with his CAT chip (D647)** — the scheduler's own
  `puck()` markup for the callsign in his seat's colour, and the CAT from the roster in the Leave War's CAT colours, one
  small shared builder used here and in the Highlight list — then his letters, his hours (D572) and who placed it and
  when (§3.8); "+ Commitment" (a SANS member his own, an admin anyone's — the existing rules); for an admin, a button
  "Days", which opens Days on that month. A man with no CAT on the roster shows his puck alone.
- **The gear** (the app's own cog — D635): Days · Day colours (three numbers) · Late cut-off (§3.9). Admin only;
  everyone sees one line saying what the colours mean.
- **"How this works"** — a fold at the top: five short lines (D646; the text is in the design note). The cut-off line states
  the rule as set, from the setting — no worked example and no "later is marked LATE". A LATE tag on an entry, pressed,
  says the cut-off it missed ("after the cut-off, Wed 7 Oct").

### 3.6 The Inputs calendar

- **Three slim tabs** — Inputs · SANS · Medical — replace the mode pair and the view trio (`INPMODE` / `INPVIEW` stay as
  the state behind them). Under the Inputs tab one small switch, Calendar | List. The List shows no SANS availability
  and its add-form offers none (D620); filters stay with the Inputs tab, folded on a phone.
- **Bars** (D626): an input is one bar across the days it covers, cut at a week's end and carried on; lanes assigned
  per week by a pure function (`layoutBars(week, entries, maxLanes)`); a desktop shows seven lanes before "+N more"
  (D632, D639), a phone three; a bar carries the callsign and the type's short word. The planning layer's day titles
  and pucks stay above the bars as they are. **Drag-to-move is re-made for bars, not inherited:** today's handler takes the starting date from the chip's enclosing day cell
  (`caldrag.ts:242-244`) and a spanning bar has none. The handler resolves the date UNDER THE POINTER at the press —
  on a bar's first week or on a continuation — and at the drop, both from the day grid's geometry; the move is by that
  difference (a Monday-to-Friday input grabbed on its Wednesday and dropped on a Friday moves two days), the length
  kept; the landing flash finds the moved bar, not a chip in a cell. Permissions, the medical questions and the
  swallowed release-click stay as they are.
- **PH, Off and NF** show as on the SANS calendar — tint and tag, from `dayFacts` and the resolver; no sun or moon (D627).
- **Several days:** a mouse drag on a desktop; hold, then drag, on a phone (a quick slide still turns the month); the
  "Select dates" button goes. Release opens "+ Input" for the range, as today.
- **The keyboard** (D621): arrows move the focused date; Shift + arrows stretch a range; Enter opens the day or files
  for the range; Delete removes the focused input in an opened day (asking first); Esc closes the front window, then
  clears a range.
- **A day opened** lists its inputs with who placed each and when, the late tag where it applies, and "+ Input".
- **The gear:** Days · Late cut-off (Inputs' own). **Phone faults seen while drawing are fixed with this:** the page's
  missing side margin; four rows of buttons above the month (now the tabs and ONE tools row).

### 3.7 Windows that drag while the page behind works — D641

One shell, `src/ui/FloatWin.tsx`: a title bar it is dragged by (kept inside the screen; on a phone it starts at the
bottom), ✕, no scrim, no outside-click close, no focus trap (`role="dialog"`, `aria-modal="false"`, focus moved in on
opening and back to the opener on closing); a click brings a window to the front; Esc closes the front one.
- **It carries:** each calendar's settings; Days and "Every <weekday>"; a day opened on either calendar (the phone's
  scrim goes); **the input / commitment editor when it is opened on the Inputs page**. The Leave War's Required panel
  gets the same behaviour from `Sheet.tsx`'s non-modal form (§3.3).
- **It does not carry:** a question that must be answered before going on (the upchit, OIL, medical-clash, document and
  delete confirms) — those stay blocking, over their window; a small menu, picker or palette (they still close on a
  click outside); **the editor opened from the board or the week** (unchanged — outside this job's mock-ups); **the
  Leave War's existing windows** (not rebuilt — D634; see §8, question 3).
- **When the thing a window shows is changed from the page behind it:** the window re-reads on every change. A record
  that has gone closes its window with a line saying so. **An editor never saves a field its user did not change.** It keeps the record as it was when the window opened (by
  `iid`, with the command layer's revision). When the record changes behind it: fields the user has not touched take
  the live values silently; a field changed BOTH ways is listed — "Changed while this window was open: end date —
  theirs 14 Jan, yours 12 Jan" — with a choice per field. Save writes only the user's own changes over the live
  record, through the existing commit with every existing check re-run; the revision is checked again after any
  blocking question (an upchit, OIL or clash confirm). A record replaced by an Undo is treated the same way. One editor at a time: opening another input while
  one holds unsaved changes asks, in that window, before replacing it.

### 3.8 Who placed it, and when — D629

- The Input record gains `by` (the signed-in person's id when it was filed), `at` (that moment, ms), `modBy` and
  `modAt` (the last change). `mod` stays as it is — the late rule reads it. **Every door that makes or changes an input, by name** (the test in §5 is this table, one case a row):

  | The door | `by` / `at` | `modBy` / `modAt` |
  |---|---|---|
  | The editor — new (`inputedit.tsx commitNewInput`) | the filer, now | the same |
  | The List's Add form (`InputsPage.tsx rowBody`, `:459` — its own maker, not the editor's) | the filer, now | the same |
  | The editor — a change (`commitInputEdit`); the List's inline edit | kept | who, now |
  | An OIL answer alone (`InputsPage.tsx:662, :692`; the editor's OIL sheet) | kept | who, now |
  | A leave approved or extended on the Leave War (the absence door, `sync.ts`) | the approver, now | the same |
  | A leave moved on the war (`doorMoveApproved`, `sync.ts:542`) | kept — it is the same leave | who moved it, now |
  | A leave cut — part un-approved, removed, or cut by sick leave (`cutDates`, `sync.ts:434`) | each piece keeps the original's | who, now |
  | A medical entry split or trimmed (a clash, an upchit; `mintMedSegments`, `applyMedPlan`) | each piece keeps the original's | who, now |
  | A posting that trims a man's inputs | kept | who, now |
  | Undo / Redo of any of these | restored as recorded | restored as recorded — never stamped as a new change |

  `mod` is written exactly as today at every one of them, so mode 0 of the late rule cannot move.
- Shown in small print in an opened day, in the List, at the foot of the editor, **on a Medical card and in the
  document viewer for the input whose document is showing** (D629: wherever an entry is listed or opened): "Placed by Saber · 7 Oct 26,
  14:32 · changed by Ranger · 8 Oct 26, 09:10"; "Placed by Saber for Wisp" where the filer is not the subject. A
  desktop bar's tooltip carries it (D632). Never on the month's cells. A record with no `by` shows no line (D56); the
  demo seed is rewritten to carry them.
- Found on the way, fixed with it (a test that fails first): a change to the F / O / A ticks alone writes no
  change-history line.

### 3.9 The late cut-offs — D628, D639

- Logic rules, beside `inputLead` (`engine/rules.ts`, each with its `RULE_SPEC` range): `inputCutMode` (0 = days before
  the week's Monday — today's rule; 1 = a weekday of a number of weeks before), `inputCutWd`, `inputCutWeeks`; and the
  SANS calendar's own four: `sansLead`, `sansCutMode`, `sansCutWd`, `sansCutWeeks`. Inputs start exactly as today (mode
  0, 14 days). **The SANS cut-off starts as the Wednesday two weeks before** (his own example in D628) — the builder's
  pick, told to him.
- `engine/inputs.ts`: `dueOfWeekISO(weekStart, set)` — mode 1 is that week's Monday − weeks × 7 + weekday; `isLateInput`
  judges a SANS availability input by the SANS set and every other input by the Inputs set; the deadline day itself
  stays on time (late is strictly after — "the end of its day"); downchits and upchits stay exempt.
- Each calendar's gear opens its cut-off window, which edits its own set through the commit the Logic page already
  uses. **The Logic page lists both rows, and each row's button opens that SAME window** (D639: one setting, two ways
  in) — the four values are not typed on the Logic page itself. "How this works" states the rule from the set in force (D646: no worked date there); the late tag's note carries the date.

### 3.10 What goes, and what stays, of Codex's build

- **Goes:** `sansday:` rows and `sans.day.set`; the day panel's "Flying SANS required" box and flying-period select;
  the two-cut-off "Colour settings" dropdown; the single "F offered / required" line; the 'both' flying period; the
  mode pair and view trio as buttons; the SANS mode's filters; "Select dates"; SANS availability in the List.
- **Stays:** the settings-row machinery and its guards (re-pointed at the new rows); the per-person, filter-blind
  F / O / A counting; the shared editor with its date range and blank Remarks; the saved-row reveal; the Undo landing
  shape; the sun and moon icons.
- **Their tests:** `e2e/inputs-sans-calendar.spec.ts`, `ui/inputs-calendar-flow.test.tsx`, `ui/inputscal.test.tsx`,
  `state/sans-calendar.test.ts` and the three `scripts/handpass/inputs-sans-*` drivers assert the retired controls by
  id. Each assertion is either re-pointed at the control that now does that job, or removed WITH the control it tested,
  the commit naming the ruling that retired it. No assertion is weakened to pass; the saved-row reveal's tests stay whole.

### 3.11 What is stored (D473 — the table list kept true in the same change)

`docs/data-schema.md` and `docs/data-model.md`: the settings rows `flyday:<iso>`, `flyrule:<id>`, `flyrun:<iso>`; the
keys `sanscalendar` (three figures) and `flynames`; seven new Logic rule values; four new Input fields; the Leave
War's `manningdefs` may now hold `availp` / `availw`; no new Leave War key. For the IT side: the three row kinds are
per-date records and want tables of their own (`FlyingDay`, `FlyingRule`, `RequiredRun`), not Setting rows — said
there. No reset-version bump: every addition is optional, and the `sansday:` shape never left this branch.

### 3.12 The Event sheet, presets and short names — D643, D644, D645 (added 7 Oct 26, after the challenge)

He took it — "yes to all" — after both readers had finished the plan. **Both then read this section alone, one round
each (7 Oct 26): both CHANGES REQUIRED, five distinct findings, all taken and written in below — §10's second table.**
The pictures: the sixth mock-ups.

**What the app does today** (`leavewar/ui/EventSheet.tsx`, `ui/EventRows.tsx`, `engine/eventdefs.ts`): the sheet shows a
free-text box, a row of the saved words (`evquick` — a press fills the box and clears the tag), a "Tag" row of the four
kinds, "This day / A range", Save. An event is its text plus an optional kind tag on the day (`DayInfo.events[line]`,
`eventKinds[line]`) or on a band (`EventBand.text`, `kind`); a word with no tag takes its kind from the library by
match (`classifyEvent`). The grid prints the whole text and sets the cell's `min-width` to its length in characters
(`EventRows.tsx:141`). Measured on a phone in the running build: "No Leave" takes its day from about 20 px to 33 px and
"Off day" to 29 px, each making the Event row two lines tall; "PH", "OFF" and "NL" stay at 20 px on one line; "NO L"
keeps 20 px but wraps to two lines.

**Records.**
- A preset gains a short form: `EventDef { name, kind, short? }` (`eventdefs`, one settings key as today). The seeded
  four start as PH → `PH`, Off day → `OFF`, No Leave → `NL`, SC → `SC`. A stored library with no `short` reads as it
  stands; its presets take the derived short form below until one is typed.
- An event gains a short form of its own: `DayInfo.eventShorts?: (string | null)[]` beside `events` and `eventKinds`,
  and `EventBand.short?`. **Text, kind and short form travel together through EVERY writer that makes or re-makes an
  event** — each is extended, none left as it is: `setDayEvent`, `setDayEventRange`, `addEventBand`, `removeEventBand`,
  both paths of `moveEvent` (a band is re-made from its dates, text and kind today; a day's move copies text and kind),
  the band put back when a replacement is refused (`EventSheet.tsx apply`), a delete or a covering band (the short
  form goes with the text), and the Holidays list's three writers. A replacement is validated BEFORE the band it
  replaces is removed, and is one Undo step. **A preset's edit keeps what the edit did not name:** `updateEventDef`
  rebuilds `{ name, kind }` today and would drop `short` on a rename. **Both must be named in `readWar` (`store.ts:719-734` rebuilds a day from named fields and
  drops the rest) and in `buildDays` (`period.ts:261`), or they vanish on a reload.**
- **A short form is one to three letters or digits — A to Z, 0 to 9 — after it is put in capitals; no space, no
  other mark.** ONE function, `normShort`, does the capitals and the test, and every write and every read goes through
  it — an event's, a band's, a preset's and a derived one alike (capitals FIRST, then the length: a letter that grows
  when capitalised cannot slip past). Refused at the write with a sentence; a stored value that fails is ignored at
  the read (the derived form shows).
- **The one function that answers "what does the grid print":** `shortOf(defs, text, short)` = the event's own
  `short`; else the short of the preset whose NAME matches the text (the same fold `classifyEvent` uses); else derived
  from the text — taking only its letters and digits: the initials of its words where it has two or more (up to
  three: "National Day" → `ND`, "A B" → `AB`), else its first three ("Exercise" → `EXE`, "PH" → `PH`). A NEW event
  whose name yields nothing (punctuation only) must have "On grid" typed before it saves; an OLD one prints `•`, its
  name and kind untouched. So an event saved
  before this change shows short at once, with nothing converted (D56) — "No Leave" typed last month prints `NL`.

**The sheet's first view** (admin only, as today; `Sheet.tsx` unchanged for it — the Event sheet is one of the war's
other windows, `[LW-WINDOWS-NONBLOCKING]`):
- **Presets** — the library's chips in their colours, then "Other…". The picked one is lit. Picking a preset sets the
  kind and "On grid" from it; where Name is empty the event's text is the preset's own name. Under the row, one short
  read-out for the lit kind: "Public holiday · work on it earns OIL" / "Off day · no OIL" / "No leave · heads-up only"
  / "Working event".
- **Name** (optional) and **On grid.** A typed name becomes the event's text and suggests its own short form; the kind
  stays the picked preset's, saved as the event's own tag (today's `kind` argument) so the name need not match a
  library word. "On grid" can be typed over; once typed it is no longer re-suggested.
- **"Other…"** shows the **Kind** row — Public holiday, Off day, No leave, Work, Note — and needs a name. **"Note"
  is "no tag", and no tag does NOT mean no kind:** today an untagged word takes its kind from the library by its name
  (`classifyEvent`, `columnKindFor`), and that stays. So a name that matches a preset IS that preset — as it is typed
  the sheet lights that preset and leaves "Other…"; "Note" can be saved only for a name that matches none, and a save
  that would pair "Note" with a preset's name is refused with a sentence, the sheet left open.
- This day / A range, the merge choice, the calendar, Save, Move and Delete: unchanged.
- **Opening an event that exists never changes it.** The sheet loads its saved text, tag and short form as they are —
  it does not run the preset-picking action — and a Save with nothing changed writes the same three back. **A preset
  is lit only when its NAME matches the text AND its kind is the event's effective kind** (its own tag, else the
  library's match). Anything else — a name that matches no preset, a "PH" someone tagged Off day, an event whose
  preset was since renamed, re-kinded or deleted — opens on "Other…" with its real kind lit, so the read-out under
  the row can never state a kind the event does not have.
- The title bar's button reads **"Edit presets"**; its view gains a short-form box on each row and on the add row.
  Its type list, reset and Done are unchanged. The words "Tag" and "untagged" go from the first view.

**The grid.** A day cell prints `shortOf(…)` and sets its `min-width` from that — never more than three characters, so
no event widens a day. A merged band prints its full text where the bar is wide enough (about three characters a day
spanned), else its short form. **A tap on a filled cell** opens a small box under it — the full name, the kind with
its colour, the date or the band's dates — for everyone; an admin's box carries "Edit", which opens the sheet. An
EMPTY cell opens the sheet at once for an admin, as today; a drag along the line still opens the sheet for the span.
The box is a small menu, not a window: it closes on a press outside, on Escape and on a scroll (D641's reading 2).

**Everywhere else a holiday is named.** `dayFacts` returns the name and the short form; the calendars' date tag is the
short form in the kind's colour (so "PH", "OFF" or "ND" — the earlier drawings' fixed "PH" / "OFF" tags are this
rule's commonest case); an opened day and the Holidays list show the full name and the kind; the Holidays list's add
form has Name and "On grid", suggested the same way.

**Unchanged, and tested as unchanged:** which days are non-working and which earn OIL (`isNonWorkingDay`,
`columnKindFor` read the KIND, never the text or the short form); the column's colour; an existing event's text.

**Tests (red first):** `shortOf` — its own, a preset's, each derivation, a legacy event; the write's refusals (four
characters, a space, empty), a member; a reload keeps an event's and a band's short form (the `readWar` and
`buildDays` naming); a preset's short form through "Edit presets" — changed, reset, a stored library without one;
picking a preset fills kind and "On grid"; a typed name keeps the preset's kind and earns OIL exactly as "PH" does;
"Other…" needs a name; reopening lights the right preset; the grid's day columns equal in width with "National Day",
"No Leave" and "Off day" saved, and the Event row one line tall (the browser geometry gate, phone and desktop); the
tap box for a member and for an admin, Edit, an empty cell; a band wide and narrow; Undo and Redo of each save, with
words that say what was saved; the calendars' tag and the Holidays list reading the same name and short form. The
existing tests that press `event-quick-*`, `event-tag-*` and `event-edit-types` are re-pointed at the control that now
does that job — none removed without its control. **Added after the readers:** `normShort` — "A B", "1/2", punctuation
only, lower case, a capital that grows; a deliberately non-derived short form ("NAT" for National Day) carried through
a move of a day and of a band, a repeated range, a band replaced, a replacement refused and restored, then Undo, Redo
and a reload, on an added Event row too; a preset's short form kept through a name-only and a kind-only edit, a
neighbour's delete and "Reset to standard"; reopening — a "PH" tagged Off day, two presets of one kind, a preset
renamed, re-kinded and deleted since, a day and a band — and a no-change Save leaving all three values as they were;
"Note" with a preset's name refused, and that day still charging leave and earning OIL as a public holiday; a typed
"On grid" kept when the Name is then changed, and after a visit to "Edit presets"; the tap box closed by a press
outside, by Escape and by a scroll, the next tap and the next drag reaching the grid; a drag along the line opening
the range sheet with no box; a landing in either move mode opening neither a box nor a sheet.

**Its place in the order (§4):** with step 2, the Leave War — before the Holidays list (step 3) and the calendars
(steps 4 and 5) read the name and short form.

## 4. The order of the build

Each step is tests-first (§5), ends green on its own files, and — from step 2 — ends with a push and a preview link for
his look. `main` is merged in at the start of every step. The job's ONE bug check comes at the end (D485).

0. **Opus's own read of what Codex built and this plan keeps** (D615) — the calendar's two screens, the editor's
   changes, the view state, the Undo landing — its view formed before Astra's two reports are re-read; each find fixed
   with a test that fails first.
1. **The records and the reads, no screen:** the flying-plan model and store, its commands, permissions and Undo
   words; `dayFacts`, the two Available rows and the holiday functions in the Leave War; the late cut-offs in the
   engine; the four Input fields at every door.
2. **The Leave War:** the four rows, typing, picking, the Required panel, the working box, the "Days…" line.
3. **The windows shell, and Days** (Month, "Every <weekday>", Holidays).
4. **The SANS calendar.**
5. **The Inputs calendar** — tabs, bars, picking days, the keyboard, the List switch, the gears, the editor as a
   window, who-and-when shown, the Logic page's rows.
6. **The records made true** (`data-schema`, `data-model` §11, `engine-rules`, `ui-contracts`, `feature-impact`,
   `file-map`, `performance.md` §E, the Leave War's architecture note; the approved mock-ups redrawn with made-up
   figures into `docs/mock/`), **then the bug check** (§6), a pull request, and his word.

A fair size for this: six to eight working sessions before the check, the check itself one or two.

## 5. The tests (red first)

- **The resolver** (`flyplan-model.test.ts`, under the Leave War suite's hostile time zone as well): the default
  weekday and the unset weekend; a rule from a date, with and without an end; two rules for one weekday; a date set
  apart from its rule and stepped back to it (the row goes); a holiday and an Off day (no class, no running figure, a
  typed figure holds); NF over a typed figure and over a running one (reads 0; lifting NF brings the figure back); a
  run, a later run, a run ended with `null`, a one-day figure inside a run (the run carries on after it); pilots and
  WSOs running apart; a year's end; a leap day; the need rounded up from a half; the tone at each boundary of the three figures.
- **The store** (`flyplan.test.ts`): each command's refusals (a member; a bad date; a negative or fractional figure; an
  unknown field); a raw write refused; a block of ten cells is one command and one Undo step; Undo and Redo of each;
  the words Undo says; a reload reads back exactly what was written; a `sansday:` row left in storage breaks nothing.
- **The Leave War reads** (`leavewar/dayfacts.test.ts`): PH, Off day, No Leave (not a holiday), a band, a seeded `ph`;
  a date between two wars; a date no war covers; availability equal, date by date, to what the grid draws; a SANS man
  left out whatever the row's filter; a row renamed and re-defined to leave out OCU; the two rows absent from a stored
  set; "Reset counters"; delete refused; a "teams" count refused; `permsparity` extended to the new commands.
- **The holiday list:** add one day, add a run, change, remove — each in the war holding the date, one Undo step, the
  right words; a range across two periods refused; no free Event line refused; a year with no period.
- **The late rule** (`engine/lateinput.test.ts`, the robustness doctrine's five families): mode 0 unchanged, every
  existing assertion untouched; mode 1 across a month and a year boundary; the deadline day on time, the day after
  late; a SANS input judged by the SANS set and a leave by the Inputs set; exempt types; an unreadable date never accused.
- **Who and when:** §3.8's table, one case a row — and Undo / Redo of each restoring the recorded stamps; a record
  without them draws no line; the F / O / A change writes its history line; a Medical card and the document viewer
  show the stamp of the input on screen, changing with it as an episode's documents are paged.
- **Hearing the war** (mounted, no reload, no navigation, a week other than the calendar's month loaded): add a
  holiday with "Save and add another" on a date with no OIL question — the calendar under the window re-tags the
  day; change an Available row's filter — the SANS date's need moves; a bid decided — the same; Undo each.
- **A change before the drawn month:** with March drawn, change and then undo a run that starts in January, and a
  weekday rule that starts in February — March's Required cells and the SANS dates move both times.
- **The editor behind a window:** change the remarks in the window, change the end date from the List behind it, Save —
  the end date stays as the List set it; the same field changed both ways asks; a blocking confirm in between; the
  record replaced by Undo; the order of the Undo steps afterwards.
- **A bar moved:** grabbed on its middle day and on its continuation in the next week, by mouse and by touch; dropped
  back where it was (no change, no Undo step); its length kept; a member refused on another man's bar.
- **"These days" against "From here on"** on the same picked block holding a weekend, a holiday and a no-fly day.
- **The Required rows renamed:** by an admin; a member and a raw write refused; a reload; Undo and Redo.
- **A partly covered year:** a period for January to March, a holiday added in August — no year button; the gap's
  period is made, then the kept holiday saves.
- **Screens** (unit): the four rows' cells for each kind of day, for an admin and a member; the typed cell's keys; the
  pick's rectangle and its skipped days; the stepping button's cycle on a weekday and on a weekend; the bars' lanes
  (a span over a week's end, more inputs than lanes, a one-day input); a window that stays open on an outside click,
  closes on Esc, and reacts to its record changing or going.
- **Browser** (`e2e/`, phone and desktop): the four rows keep every day column in line with the header and the roster
  (the geometry gate) and do not move the grid's sideways scroll; a real drag over the Required rows, and the existing
  roster and Event drags still behaving; a typed figure reaching the SANS date's need; a window dragged, then the
  page behind it used; the gear beside a day-flying sun at phone size (D635); no sideways page scroll at 390 px.

## 6. The bug check — FULL, once, at the end

- **Roll-call seed** (every place that draws the thing, each to get "has it / must not, because… / MISSING"): a day's
  class and tag — the SANS month, the Inputs month, Days, the war's Required cells; a holiday — those, plus the war's
  Event rows and column tint, the OIL earning day, the schedule's "no period" warning; the required figure and the need
  — the war's rows and working box, the SANS date and opened day; who-and-when — the opened day on both calendars, the
  List, the editor, the bar's tooltip, a Medical card, the document viewer, and (must not) the month cells, the board,
  the week, exports; a count of who is available — the war's Available cells, the working box, the SANS date and opened
  day, AND the counter form's live preview; the late tag — the
  board, the week, the List, both opened days; an input as a bar — and the Medical view, the board's unavailable rows,
  the Leave War's cells, which must be unchanged.
- **The walk is sized first** (`docs/walk-ledger.md`): types B, C, D, G and H at the least; walked by Sonnet 5.5
  walkers in their own worlds, the host opening every picture (D16, D588); every new control pressed on screen, never
  stood in for by a test that changes the data directly (D608).
- **Two readers of the code**, each blind to the other — Astra and Sol 6.1 (permissions and saved data are in it).
- **The evidence sheet** carries, for every approved mock-up, the mock-up beside the built screen at the same width (D624).
- His look on the preview — on his iPhone for the number pad, the bars and the dragged windows — before "merge live".

## 7. Risks the builder sees

1. **Two stores for one day.** The class and the figures in one, the holiday and the availability in the other. The
   resolver is the only place they are joined; any surface that joins them itself is a defect.
2. **The Leave War grid's cost.** Four always-drawn rows over the drawn months, repainting on scheduler changes too.
   The plan's answer is a self-subscribed, memoised component and the row contract; the DOM ceiling
   (`probes/perf-port.cjs`) rises by an argued edit only.
3. **The drag.** A third hit kind in the code that guards the grid's sideways scroll — reported broken three times
   before. Arming is not touched; the existing drag tests are the guard.
4. **Windows that do not block.** Esc now has several possible owners (a window, the calendar, the editor's own
   sub-sheets); a draft can be overtaken from behind; a finger dragging a title bar must not scroll the page.
5. **Gestures on the Inputs month.** A bar's drag-to-move, an empty cell's drag-to-pick, a hold, and the swipe that
   turns the month all start with a finger on the same grid.
6. **The late rule is drawn on the board and the week too.** A second mode must leave mode 0 byte-for-byte as it is.
7. **Holidays written to a war that is not on screen**, and at any stage of that war.
8. **The size.** Many surfaces on one branch for many sessions; `main` is merged in at every step.

## 8. With him — what he has answered, and the readings he will be told

**Answered 7 Oct 26 (D642):** Saturday and Sunday start with no flying set; a no-fly day still shows, and takes, OFT
and AMT commitments; the war's panel for a picked block of people's days is brought into line with D641 in this job,
its other windows left for `[LW-WINDOWS-NONBLOCKING]`.

**Answered 7 Oct 26 (D643, D644, D645 — "yes to all"):** the Leave War's Event sheet is built as redrawn — a Presets
row, an optional Name, "On grid", the Kind row only under "Other…" — the grid shows short forms, and every preset
carries its own (PH, OFF, NL, SC). It is IN this job: §3.12, which goes to both readers as an add-on before it is built.

**Nothing is with him now.**

**The builder's readings, to tell him plainly (each a default he can change):** a phone types the figure on the app's
own number pad, not the phone's keyboard; a one-day figure does not end a running figure — the run carries on the next
day; a pick that mixes ordinary days with weekend or holiday days leaves those out unless he presses Include; a short
form is at most three letters with no space, and an event saved before this job shows its short form at once; a half-day absence rounds the need up; a public holiday or an Off day that is flown anyway can take a typed
required figure, but shows no sun or moon; a weekend set to fly still takes no running figure — it is typed; the
year's holidays need that year's leave period, and the list offers to create it; a date outside every leave period
shows a dash on the SANS calendar; the SANS cut-off starts as the Wednesday two weeks before; the SANS tab has no
filters; the "Select dates" button goes; there is no one-day sheet — "Day settings" opens Days; the editor is a
dragging window on the Inputs page only; each press of a day button is its own Undo step; an Available row can be
renamed and re-defined but not deleted.

## 9. For the challenger

Read the design note and the full rows first. Then, in this order of worth:
1. **§3.1's bet.** Is the scheduler's settings store the right home for the flying plan and the required figures, and
   are two riders on the `sync.ts` seam honest against "four seams, and only four"? Build the concrete failure if not —
   a sequence of edits, an Undo, a reload, a second war, a posting — in which the two stores disagree about one day.
2. **§3.2's resolver.** Find a date for which it gives an answer he did not rule, or two surfaces could differ.
3. **What is MISSING** — read for absence. A surface that draws a day, an input, a count or a late mark and is not in
   §6's seed; a door that makes or changes an input and is not in §3.8; a ruling of D569–D641 with nothing in this plan.
4. **§3.7.** A concrete order of presses in which a non-blocking window loses a change, saves over a newer one, or
   leaves Undo in the wrong order.
5. **§3.9.** A reading under which an input that is on time today becomes late, or the reverse, with mode 0 untouched.
6. **§4's order and §5's tests.** A step that cannot be shown to him by itself; a rule in §3 with no test in §5.
7. **(Astra only — D138.)** Read each short line against its full row: D585, D569, D571, D576, D577, D579, D580, D581,
   and D617 to D641 (`.claude/rules/decisions/scheduler.md`, `how-we-work.md`; full rows in `.claude/decisions-full/`).

**Not a finding:** taste; a claim with no concrete failure, cause and exact fix (D489); a problem that lives only in
data already stored (D56 — the `sansday:` rows never left this branch); anything §8 already puts to him, unless the
recommended answer is wrong — then say why.

## 10. After the challenge (7 Oct 26) — what changed, and why

Both read it alone; both said CHANGES REQUIRED, and both called §3.1's bet sound. Their reports, unchanged:
`../briefs/2026-10-07-inputs-sans-redesign-plan-challenge-astra.md` and `…-sol.md`. Each claim was checked against the
code before it was taken. All sixteen findings were taken — none refused; five were the same point from both.

| # | Found by | The gap | What the plan now says |
|---|---|---|---|
| 1 | Astra 3, Sol 3 | The calendars would not hear a Leave War change that is not about OIL: a holiday added in Days, a count row re-defined | §3.1 — `useWarFacts()`, a signal of its own; §5 "Hearing the war" |
| 2 | Astra 4, Sol 2 | A month's cached cells keyed only on rows dated inside it: a run or rule that starts earlier could change and the month not repaint | §3.3 — the signature is what the resolver answered for the month; §5 |
| 3 | Astra 1, Sol 4 | Keeping `data-iid` does not keep drag-to-move: the handler takes its start date from the chip's day cell, and a bar has none | §3.6 — the date under the pointer, press and drop; §5 "A bar moved" |
| 4 | Astra 5, Sol 6 | Doors that make or change an input and were not named: the List's Add form, OIL-only answers, a leave moved or cut on the war, splits and trims; Undo stamping a new time | §3.8 — the table, door by door; §5 |
| 5 | Astra 2, Sol 7 | `flynames` had no command: an unlisted settings key is written raw, outside permission and Undo | §3.2 — `settings.flynames`; §5 |
| 6 | Sol 1 | "Keep my changes" would write the whole old draft back over fields changed behind the window | §3.7 — only the user's own changes are saved; both-ways fields are asked |
| 7 | Sol 5 | "These days" skipped weekend, holiday and Off-day cells, though D637 lets a figure typed on such a day hold | §3.3 — worked out at Apply, by choice; a mixed pick leaves them out with one press to include (the builder's reading, told to him — §8) |
| 8 | Astra 6 | The counter form's preview counts SANS people and offers thresholds for the two linked rows | §3.3 — a form mode for the two ids; §6's roll-call |
| 9 | Astra 7 | "Create the year" fails when the year is partly covered | §3.4 — a whole-year button only for a year with no period; else the gap's period, the holiday kept |
| 10 | Astra 8 | Who-and-when missing from the Medical cards and the document viewer | §3.8, §5, §6 |
| 11 | Sol 8 | The Logic page listed both cut-offs but did not open the setting (D639: "opens the same setting") | §3.9 |

**Astra's D138 read: PASS** — the short lines D585, D569, D571, D576, D577, D579, D580, D581 and D617–D641 against
their full rows; none changes the meaning. (D642 and D643 were recorded after that read: owed with the first code read.)

**What neither could check, said by both:** how it runs — geometry, the grid's cost, the gestures on a real iPhone, the
pictures. Sol also said its read of the longest files was not whole. Both are what the walk and his look are for (§6).

**One round each, as planned (the cap on plan reviews stands).** The changes above are the readers' own fixes written
in; they are not sent back for a second read. The readers of the CODE get this section with the code.

### The add-on, §3.12 (the Event sheet, presets and short names) — read the same night

Both read it alone; both CHANGES REQUIRED; both called the split of full name, short form and kind sound. Reports:
`../briefs/2026-10-07-inputs-sans-redesign-plan-addon-astra.md` and `…-sol.md`. Ten findings, five distinct, all taken.

| # | Found by | The gap | What §3.12 now says |
|---|---|---|---|
| A | Astra 1, Sol 2 | Reopening lit a preset by its name alone: a "PH" tagged Off day would show as a public holiday that earns OIL, and a Save could make it one | a preset is lit only on name AND kind; else "Other…" with the real kind; opening changes nothing |
| B | Astra 2, Sol 1 | "Note (none)" is not none: an untagged "PH" is classed a public holiday by its name today | "Note" only for a name that matches no preset; a matching name lights its preset; the old fallback kept and tested |
| C | Astra 3, Sol 3 | A move, a range, a replaced or restored band would drop a chosen short form | text, kind and short form travel together through every writer, each named |
| D | Astra 4, Sol 3 | Renaming a preset would erase its short form | a preset's edit keeps what it did not name |
| E | Astra 5, Sol 4 | "Characters" let "1/2" or "!!!" through; a capital that grows could pass the length test | one `normShort`: capitals first, then one to three of A–Z and 0–9; a fallback for a name with none |
| — | Sol 5, Astra's closing note | Promises with no test: a typed short form surviving a change of name; the box's three ways to close; drag against tap; the move modes | the test list, "Added after the readers" |

**The one place the plan departs from a reader's exact fix:** E. Both asked for letters only, citing his "up to three
letters". The plan allows digits too ("EX2" for a second exercise is the obvious thing to want) — the builder's
reading, told to him. **Astra's D138 read of D642–D645: PASS.** D646 and D647 were recorded after it: owed with the
first code read.

