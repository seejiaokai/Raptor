# An input's own title — the plan ([INPUT-OWN-TITLE]; D715, D716, D717 — 9 Oct 26)

**Status: version 1 was read by Astra and by Sol, each blind — both `CLEAN WITH THESE EXACT CHANGES`; §8 says what each found and what was done. BUILT (commit `fa9463d0`); its FULL check is the evidence sheet `docs/handpass/2026-10-09-input-title-check.md`.** Branch `claude/day-window-compact` (it already
carries the ALL / ALL AVAIL and Event batch, unmerged — his word: no merge). Builder: Opus 5.5.

## 1. What he ruled

- **D715** — "select the type of input and it gives the user the option to change the name of the input. Not only to event
  input, most of the inputs title. So for e.g if event Is selected, event shows as the title which can be edited".
- **D716** ("As recommended") — (1) only the "Duty & other commitments" kinds take a title: Training, Course (`CSE`),
  Meeting, Fly with, Personal, Appointment, Duty, Event, OD, Other — never a leave or a medical kind; (2) the title shows
  wherever the kind's name stands as a NAME today, the kind small beside it where there is room; (3) "Other" takes the
  same Title box and its remarks go back to being plain remarks; (4) remarks stay as they are (only "till <date>" for
  several days; the title is not printed again in the remarks).
- **D717** ("Kind kept in sight. Yes build") — where the title differs from the kind's own name the kind stays in sight,
  small: under the title on the schedule's row (a phone), beside it on a desktop, and on the small-print line of the
  opened day's card. The drawing of record: `docs/mock/input-own-title.html`.

Rulings that bound it: **D713, D714** (Event's rules come from its KIND), **D711, D712, D702** (the placeholder input:
its kinds, one day, the filer's OIL answer), **D660, D655, D682** (a shared input is one thing for everyone in it),
**D178, D103** (any input change after a day is published is a pending change and the sign-offs fall), **D629, D701**
(the day card's small print), **D56, D401** (stored demo data is not converted; a record in the old shape must not break
a load), **D200** (permissions: one module), **D473** (the table list is kept true).

## 2. The rule, in one paragraph

An input of a titled kind may carry a `title`. Its NAME — everywhere the app prints an input's name — is the title where
it has one, and the kind's own name where it has none. The KIND goes on deciding every rule (OIL, clashes, crew rest,
what lands on the Ground Programme, who may file it) and is never read from the title's words. Where the name printed is
not the kind's own name, the kind is shown small beside or under it, wherever there is room.

## 3. The design

### 3.1 What is stored
One new optional field on the input record: `title?: string` (`engine/schema.ts`, `docs/data-schema.md`,
`docs/data-model.md` — the Input table gains one nullable text column). Stored ONLY when, after trimming and collapsing
inner runs of white space, it is non-empty AND differs from the kind's own name compared case-insensitively
(`titleOf(draft)` — the one normaliser, in `engine/inputs.ts`); otherwise the key is absent. So an input whose Title box
was left alone is byte-identical to today's record, and a later change of its kind is followed by its name with nothing
to keep in step. Maximum 40 characters (the box's `maxLength`, and the normaliser cuts — the schedule's name column is
narrow). A title on a record whose kind does not take one is ignored on read and dropped at the next save.

### 3.2 One body for the name
`engine/inputs.ts`:
- `titledKind(t)` — true for `grp:'act'` and `grp:'duty'` (the ten kinds of D716; SANS Availability, leave, medical and
  Upchit are not). One predicate, read by the editor, the list form, the save and `inpLabel`.
- `inpLabel(inp)` — `titledKind(type) && title ? title : type`. **The "Other reads by its remarks" branch goes** (D716 (3)).
  Every one of its callers therefore prints the title with no edit of its own: the schedule's row (`overlay.ts
  requestRowFields` → `prog`), the month's bar and tip and the day's card (`inputscal-model.ts` `word`), the Personal
  Inputs and Unavailable cards on the week and the board (`html.ts`, `board-html.ts`), the changes window
  (`pendlist.ts`, `drafts.ts`), the warning sentences (`validate.ts` "…and also down for <name>", `avail.ts` "already on
  <name>"), the OIL window's heading (`oilmode.ts`).
- `inpKindTag(inp)` — the kind's own name when `inpLabel(inp)` differs from it (case-insensitively), else `''`. The one
  answer to "is the kind drawn beside the name here".

### 3.3 "Other"
An Other with a title is named by it; an Other without one is named "Other", and its remarks are remarks — printed in the
remarks cell and on the day card's remark line like any kind's. The stored demo Others that were named by their remarks
are NOT converted (D56, D401): they read "Other" with their remark beside them; nothing is lost. The demo seed
(`state/demoseed.ts`, the seed weeks' inputs) is rewritten so a seeded Other that was named by its remarks carries that
name as its `title`. **A ripple the builder accepts and reports to him:** a demo day already published in a browser's
store with such an Other on it re-makes that row ("DENTIST RUN" → "OTHER") and reads one pending change until
republished — harm that lives only in stored demo data and is correct going forward (D56, D54's precedent).
`ui/InputsCal.tsx`'s "hide the remark when it is the name" test stays (it now never fires for an Other; it is harmless).

### 3.4 The four doors that write a title
1. **The input's window** (`ui/inputedit.tsx` — the month's "+ Input", a card's edit, the board's dialog): a `Title` row
   straight under `Type`, drawn only while `titledKind(draft.type)` and only where Type is a control (not in the
   read-only view, where the title is shown as a value when it has one). `draftOf` seeds `title: r.title || ''`; the box
   SHOWS `draft.title || draft.type`; typing sets `draft.title`. Changing the kind: a draft with no title of its own
   simply shows the new kind's name; a typed title is kept when the new kind takes one and cleared when it does not.
   The new record and `commitInputEdit` write `titleOf(draft)`; the unchanged test, the "what changed" list
   (`WIN_FIELDS` gains `title`) and the change behind an open window weigh it as a field of its own.
2. **The List's form** (`ui/InputsPage.tsx` `add()`): the same Title box beside Type, the same rule.
3. **The List's pencil editor** (`saveEdit`): a Title cell under the Type select in the same cell.
4. **A shared input** (`commitGroup`, the group save, the split and trim rewrites): the title is a SHARED field — set for
   everyone in it, as remarks are; every record minted from another (a split, a re-date, a group member added) carries it.
The schedule's own name cell on a landed row stays the scheduler's cell, as today: retyping it changes the ROW, not the
input (`srcv` leaves a hand-edited row alone until the request itself changes) — no new door.

### 3.5 Where the kind is kept in sight (D717)
- **The schedule's row** (`html.ts` week ground row, `board-html.ts` board ground row; edit and view, a published face
  too): a `<span class="nm-kind">` after the name when the ROW came from an input (`row.src`, `row.srcType`) and its
  `prog` is not the kind's own name upper-cased. Read off the ROW, so an issued face draws what was issued and a row the
  scheduler renamed by hand shows its kind too. CSS (`scheduler.css`): small, `--ink-3`, upper-case; UNDER the name where
  the row's times stack (the phone layout), BESIDE it otherwise; never editable, never part of the `data-txt` cell.
  **Parity:** the view week is byte-compared with the reference — the span is emitted only for a row whose name differs
  from its kind's, which no reference fixture has (to be proven by `tfin` 728/0 and the refwin compare staying green).
- **The opened day's card** (`InputsCal.tsx`): `inpKindTag` at the left of the small-print line (`.sd-foot`), the
  placed-by print at its right as now; on a desktop the same place. No new line.
- **The Inputs list**: the Type cell keeps the kind (it already prints it); the title is printed as a second, bold line in
  that cell when the input has one. Search (`fSearch`, the month's search) matches the title as well as the remarks.
- **The month's bar**: the name only (no room — D717's row); its tip reads "<who> · <title> · <kind> · <dates>".
- **The Personal Inputs / Unavailable cards** (week and board): the name is the title; the card's `title=` tip already
  carries the kind (`board-html.ts` 143) — the week's card gains the same tip.
- **The changes window and the history line**: "<who> · <title>" as the label; a title-only edit reads
  "title: “Event” → “Sports day”".

### 3.6 What must NOT move
- **Rules by kind.** `events.ts shiftHardGround` already grades an input's row by the input's type when `row.src` is set
  (and by `row.srcType` when the input is gone) — with a title `prog === e.label` still holds (both are the row's `prog`).
  The build SWEEPS every other reader of a ground row's or an input's `label` / `prog` words in `engine/` (the
  `shiftHardLabel` keywords, any brief / info / standby word test, `oilev.ts`, `avail.ts`) and proves with tests that a
  title carrying a rule word ("SC", "BRIEF", "MEETING", "EVENT", "OFF") switches nothing a kind does not, on a row that
  came from an input.
- **OIL.** Asked, defaulted and counted by kind and hours; `oilEvidenceKey` does not name the title. A title-only edit
  on a weekend asks nothing again.
- **The placeholder rules** (`placeholderProblem`), the late mark (measured on the last change — a title edit IS a change,
  as a remarks edit is), the Leave War sync (reads leave kinds; a titled kind is never one), SANS.
- **A published day**: a title change re-makes the row (`srcvOf` hashes `prog`), so the day reads one pending change and
  the sign-offs fall (D178, D103); the issued face keeps the issued name. Nothing new is built for it — tests pin it.
- **Permissions**: whoever may edit the input may edit its title; no new right (`perms.ts` untouched; `perms-scan` green).
- **Escaping**: the title is user text — every builder that prints it goes through `esc` (they already do, via
  `inpLabel`'s callers); a test feeds `<b>` and `"` through each surface.

### 3.7 Not in this job
The Leave War grid, the SANS calendar, the Tracker; a title for leave or medical kinds; a title on a row the scheduler
typed by hand (it already has a free name); printing the kind on the month's bar; renaming a kind itself.

## 4. Roll-call — every place an input's name is drawn

| # | Surface | Shows the title | Shows the kind small | Writes the title |
|---|---|---|---|---|
| 1 | The input's window (new, edit) | the Title box | the Type box | YES |
| 2 | The input's window, read only | as a value, when it has one | Type as a value | must not |
| 3 | The List's form | the Title box | Type | YES |
| 4 | The List's rows | second line of the Type cell | the Type cell | pencil editor: YES |
| 5 | The month's bar (desktop; a phone shows the person only) | YES | must not — no room; in its tip | no |
| 6 | The opened day's card | YES | small-print line, left | no (opens 1) |
| 7 | Edit Schedule week — Ground Programme row | YES (row name) | under (phone) / beside (desktop) | no (row cell is the scheduler's) |
| 8 | View-only Sched — the same row, issued face | the ISSUED name | as issued | no |
| 9 | Scheduler Board — the same row | YES | beside | no |
| 10 | Personal Inputs card (week, board) | YES | in its tip | no (opens 1) |
| 11 | Unavailable card (an OD) | YES | in its tip | no |
| 12 | Next-week peek | YES (same builder) | same | no |
| 13 | The changes window (To go out, history) | YES | — | no |
| 14 | Warning sentences, "already on …" | YES | must not — a sentence | no |
| 15 | The ALL AVAIL window's heading, OIL Earn's item cell | YES | — | no |
| 16 | The OIL question sheet | names the input by `inpLabel` | — | no |
| 17 | A shared input's window ("N people") | one title for all | Type | YES, for all |
| 18 | SANS calendar, Leave War, Medical tab | must not — these kinds take none | — | must not |

## 5. Tests, each written to fail first

`engine/inputtitle.test.ts` — `titledKind` over every kind of `INPUT_META` (the ten, and no other); `titleOf` (trim,
collapse, 40, equal-to-kind → absent, case); `inpLabel` / `inpKindTag` (title, none, Other with and without, a title on
a leave kind ignored); `requestRowFields` / `srcvOf` move with the title; a title carrying each rule word changes no
clash grade, no OIL figure and no crew-rest result against the same input untitled (the §3.6 sweep, one case per reader
found); a title-only edit leaves `oilEvidenceKey` alone and makes a published day read one pending change.
`ui/inputtitle.test.tsx` — the window: the box appears and goes with the kind, fills from the kind, keeps a typed title
across titled kinds, drops it for leave, saves `title` only when it differs; an edit of the title alone is a change and
writes one history line; read-only shows a value and no box; a shared input's title reaches every record; the List's
form and pencil editor; the list search finds a title; the day card's kind tag, the month bar's tip; the week and board
ground rows draw `.nm-kind` exactly when the name differs; escaping on every surface.
`state/demostamps.test.ts` / the seed test — the seeded Others carry titles; an old-shape Other (remarks, no title)
loads and reads "Other". `e2e/input-title.spec.ts` — file an Event titled "Sports day" through the window on a phone and
a desktop: the row's name, the kind's place (under / beside) and that the phone row is no taller than an untitled one;
reload keeps it. Existing tests that pin "Other reads by its remarks" are CHANGED to the new rule, each named in the
commit with D716 (3) as the requirement (never weakened to pass).

## 6. The check
FULL tier (saved data; a published record's pending count). Rules sweep → Astra designs the scenarios → roll-call (§4)
→ a SIZED walk (the doors and surfaces of §4 at a phone and a desktop, as admin and as a member; publication order:
publish, retitle, read pending, republish) → gates under the PC's lock → Astra and Sol each read the code blind → fixes,
failing test first → re-walk → evidence sheet → his look.

## 7. Decided by the builder (technical), to be told to him in plain words
1. An untouched Title box stores nothing, so nothing changes for inputs filed as today.
2. A title is at most 40 characters.
3. Legacy demo Others read "Other" with their remark beside them (§3.3) and may show one pending change on an already
   published demo day.
4. The kind tag on the schedule is read off the row, so a row the scheduler renamed by hand shows its kind too.

## 8. The two reads of the plan (9 Oct 26) — what each found, and what was done
Reports: `docs/superpowers/briefs/2026-10-09-reads/input-own-title-plan-astra.md`, `…-plan-sol.md`. Both verdicts:
CLEAN WITH THESE EXACT CHANGES. Neither reopened a product choice. Where this section and §§2–7 differ, THIS section is
what was built.

| # | Found by | The failure | What was done |
|---|---|---|---|
| 1 | Astra 1, Sol 1 | The engine drops a repeated "same man, same hours, same NAME" as one commitment; a request's row is named by its filer, so a Training titled "Meeting" beside a Meeting was swallowed and its hard clash against a standby shift lost | `events.ts buildDay push`: a row that came from a request merges only with ITSELF (its key). **The builder's narrowing of the readers' fix, with its reason:** both asked for "same row" for EVERY row; rows nobody filed keep the old name test, unchanged — that is the original's own rule (its suite asserts it), and widening it would newly flag hand-typed twin rows that are one event listed twice, a change of behaviour outside this job. The defect needs a request's row, and no request's row can now be merged with another. Two different ground rows of one name clash as "… is on two items called NAME at once" (`validate.ts`) |
| 2 | Astra 2, Sol 2 | A title-only edit could stay invisible on a published day: an OD has no row, a second covered day has none, and a change of capitals leaves the row's printed name as it was (§3.6's "nothing new is built" was wrong) | the title is in `inpDetailKey` (named only where there is one); `pendlist.ts inputWords` says "Event → Sports day". Pinned in `ui/latepub.test.tsx` |
| 3 | Astra 3, Sol 3, Sol 4 | §3.2's "every caller prints the title with no edit of its own" was wrong for the callers that copy the input first or name it by `type` directly | `events.ts mapInp` carries the title (and so `whole` and the midnight tails); every warning sentence that names a commitment uses `inpLabel` (classification stays on `type`); the OIL question (`oilGate`, the List's two question builders), `oilmode.ts oilRequestName`, the changes window's heading, the history bubble and the accept / unaccept toasts name it by its title; a request that is gone is named from its row (`goneRequestName`); the board's input card carries the visible kind label in its item cell |
| 4 | Astra 4, Sol 4 | The Inputs export had nowhere to put a title | `export.ts inputRows`: a `Title` column beside `Type` |
| 5 | Astra 5, Sol 6 | "Hide the remark when it is the name" would hide a remark a filer typed that repeats his title | removed (`InputsCal.tsx`): a remark is said whatever the input is called |
| 6 | Astra 6 | `draft.title \|\| draft.type` made an emptied box snap back to the kind's name | the draft's title is NULL until typed, a string after ('' = emptied; the placeholder says the kind) — in all three editors |
| 7 | Sol 5 | A bar found by its title opened a day that then hid it (`dayEntries` searched remarks and callsign only) | `dayEntries` matches `inpLabel` too |
| 8 | Sol 7, Astra (negatives) | The reference twin `refwin.ts _il` still named an Other by its remarks | `_il` mirrors `inpLabel`; the reference carries no title, so cross-engine cases are untitled and the titled ones are the port's own tests |

**Also built that the plan did not say:** the board's row carries its label INSIDE the name's own grid cell (`.sb-nmk`),
because that row's grid places its cells by their order; the title is one of a shared input's shared fields
(`state/inputgroup.ts SHARED_FIELDS`); the change history writes a "title" line (`state/changelines.ts`); the declared
record (`engine/schema.ts`) and its check carry the field; the demo's Event for ALL is titled "Sports afternoon".

