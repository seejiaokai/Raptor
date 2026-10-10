# The input card, on the opened day and the Inputs list — the plan ([INPUT-LIST-AS-DAY-CARD]; D718–D724 — 10 Oct 26)

**Status: version 1, written by the builder (Opus 5.5) on 10 Oct 26 at his word "Build it with a short plan, tests
first, and its own check with a walk of the running app. No merge." Branch `claude/day-window-compact`. The design is
his, approved as pictured (D723): `docs/mock/img/input-card-final/day-final.png`, `list-final.png`. This plan settles
the technical how, and names two doors the pictures do not show (§3).**

## 1. What he ruled

- **D718** — the Inputs list's card takes the opened day's layout; its pencil and cross go; a tap opens the input to edit
  or delete it; one look for an input's kind.
- **D719** — the card stays short; a long title or remark is never cut by what stands at its right — it wraps and the
  card grows downward.
- **D720** — the small print says "By Saber", never "for Ranger".
- **D721** — a shared input's people are ALL named on its card, the names wrapping; never "+N".
- **D722** — the title always starts at the left on a row of its own.
- **D724** — on the card of an input filed for several people, who filed it is always said, even where the filer is one
  of them (said as the build began; it narrows D723's "only where someone else placed it").
- **D723** — approved as pictured: the kind in small grey capitals (not a pill); "By Saber" only where someone other
  than the input's own person placed it, with no day or time on the card (it NARROWS D629 for the card); on the phone's
  list a heading a day; the desktop list keeps its columns and sorting and loses its pencil and cross; the SANS day's
  card is NOT in the job (D647, D649).

Rulings that bound it: **D681** (a shared input's dates are changed in its window — its reading (7), "an ordinary
one-man input keeps the ways it already has (its row in the List)", is what D718 takes away: §3.1), **D629** (who placed
it and when stays in the input's window and the change history), **D646** (LATE says the cut-off it missed when
pressed), **D660, D682** (a shared input's OIL answer), **D655** (who may change a shared input), **D364** (another
person's input opens read only), **D178, D103** (any input change on a published day is a pending change), **D620**
(SANS availability is on no list), **D56** (stored demo data is not a finding), **D200** (permissions: one module).

## 2. The design

### 2.1 One card, one body
- `src/ui/inputcard-model.ts` (pure): `cardOf(rows, people)` → `{ names, kind, title, remark, by, tone }` for an
  entry's records (one for an ordinary input; a shared input's, A to Z).
  - `names` — every callsign, A to Z, joined ", " (D721). A placeholder reads its own name (ALL AVAIL, ALL).
  - `kind` — the kind's own name, ALWAYS (the top line's small grey capitals). A SANS record never reaches a card.
  - `title` — the input's own title where it has one that is not its kind's name (`inpKindTag` is non-empty) — else ''.
  - `remark` — its remarks, as stored.
  - `by` — the filer's callsign (`grpBy`, else `by`): for an input of ONE person, only where the filer is not that
    person (D723); for an input of SEVERAL people, ALWAYS — even where the filer is one of them (**D724**, 10 Oct 26:
    "Seems like multiple inputs it's better to put who made that input yeah"). '' for a record that never recorded a
    filer (D56).
  - `lateNoteOf(rows, lateWord)` — '' where nobody is late; the one sentence where every man is late alike; else
    "Blade: … · Cinch: …" naming who (the List's rule today — the per-man tags went with the pucks, D721).
- `src/ui/InputCard.tsx`: the card. Top line: square · names · kind · LATE (a button — a press says why, D646) · hours.
  Words row: the title, then the remark in grey after " · " (the remark alone where there is no title); "By Saber" at
  the row's right end, dropping under when there is no room. A card with no title, remark or "By" is ONE line. A
  shared input's names wrap round the LATE-and-hours corner (the corner floats right — the mock-up's own means). The
  card's button is its names and kind (what a keyboard and a screen reader meet); a press anywhere else opens it too.
- Styles: new `.icard…` rules in `src/ui/scheduler/25-inputs-calendar.css`. **The SANS day keeps `.sd-*` untouched.**

### 2.2 The opened day (`ui/InputsCal.tsx`)
The day's list draws `InputCard`. Gone from the card: the row of pucks and its per-man LATE tags, the kind tag on the
small-print line (it is the top line's kind now), the date and time of the small print. Kept: the Delete key's question
under the card, the order of the day, the count heading, the note and its pucks above (not part of this job).

### 2.3 The Inputs list (`ui/InputsPage.tsx`)
- **A phone (the stylesheet's own width, `max-width:820px`, followed live — `ui/usephone.ts`):** the list is cards
  under a heading a day — "SAT 18 JUL · 6 inputs" — in date order, each day's cards all-day first, then by start. An
  input of several days stands under its FIRST day and its hours read "till 20 Jul". A just-saved input the filters
  would hide (the list's pins) stands first, under its own day's heading. No table is drawn there.
- **A desktop:** the table, its columns and its sorting as they are. The pencil and the cross go; the Name is a button
  that opens the input, and a click anywhere on the row does too. The paperclip and the OIL / OIL? chips stay in the
  last column. "Saber +3" and the Type pill are left as they are — put to him (§6).
- **The edit in place is removed** — `startEdit`, `saveEdit`, the `ined` row and its styles. Every question it asked
  (document, upchit, medical clash, OIL) is asked by the window's own save, the one body they already shared.

## 3. Two doors the pictures do not show — the builder's call, told to him

### 3.1 A one-person input's dates (D201: what D718 leaves behind of D681's reading 7)
The pencil was the only form that changed a saved one-person input's dates; the window drew its calendar for a new
input and for a saved SHARED one only. So `datesHere` (`ui/inputedit.tsx`) loses its `rows.length > 1`: on the Inputs
page, for a reader who may change the input, a saved input's window carries the two-tap calendar. Not for a SANS
commitment of one man (unchanged: deleted and added again on the SANS calendar), not for the upchit-filing context.
Nothing new is written: the one-person save (`commitInputEdit`) always took the dates from the draft and already asks
every question. The hint under it is reworded for one person.

### 3.2 The OIL question nobody answered
The List's "OIL?" chip (22 Sep 26) is what shows a scheduler that a weekend request's question was never answered. The
phone's card has no chips, so the window's OIL line is drawn for that case too: "Not answered yet" with "Answer…",
the same forced question the chip opened (`oilGate(…, true)`), for a reader who may change the input.

## 4. The roll-call — every place an input's card or row is drawn

| # | Surface | The new card | What else is on it |
|---|---|---|---|
| 1 | Inputs calendar → an opened day (phone, desktop) | YES | the Delete question; the note and pucks above |
| 2 | Inputs list on a phone | YES, under day headings | the just-saved flash |
| 3 | Inputs list on a desktop | NO — the table stays (D723 reading 2); pencil and cross go | paperclip, OIL chips |
| 4 | SANS calendar → an opened day | MUST NOT (D723 reading 3; D647, D649) | — |
| 5 | The month's bars and their tips | MUST NOT — no card; the tip keeps the full "Placed by … for …" (D720 reading 1) | — |
| 6 | The input's window | MUST NOT — the full small print stays (D629) | gains §3.1, §3.2 |
| 7 | The schedule's Personal Inputs / Unavailable rows, the board | MUST NOT — not a card of this kind | — |
| 8 | Medical view's cards | MUST NOT — its own card (documents) | — |

**The doors (every action the list offered, and where it is now):** change the fields → the window; change the dates →
the window (§3.1); delete → the window's Delete (a shared input asks first); the paperclip → desktop row, and the
window's Document line; revise an OIL answer → desktop chip, and the window's "Change…"; answer an unanswered OIL
question → desktop chip, the bell, and the window (§3.2); open a shared input → a tap, as any other.

## 5. Tests first
- New: `inputcard-model.test.ts` (each field, each kind of entry), `inputcard.test.tsx` (the card on BOTH surfaces,
  looped over the kinds: plain, titled, remark only, placed by another, shared, ALL AVAIL, an absence, late, some
  late), `inputslist-phone.test.tsx` (headings, counts, order, a tap opens the window, no pencil, no cross),
  `windowdates-one.test.tsx` (§3.1: the door, both orders, who may, the questions asked), an unanswered-OIL test (§3.2).
- Restated for the window, never deleted: the pencil and cross cases of `inputs.test.tsx`, `inputtitle.test.tsx`,
  `placeholderlist.test.tsx`, `sharedline.test.tsx`, `savesaysok.test.tsx`, `audit-e-halfday-surfaces.test.tsx`,
  `audit-e-window-sort.test.tsx`, `whoplaced.test.tsx`, `inputstabs.test.tsx`, `accounts-ui.test.tsx`,
  `onedoor-users.test.tsx`; the day card's cases of `inputsday.test.tsx`, `placedshown.test.tsx`.
- Browser: `e2e/geometry.spec.ts`, `e2e/inputs-calendar.spec.ts`, `e2e/inputs-sans-calendar.spec.ts` where they read
  the old card or the pencil; the adapted probe `probes/adapted/audit-async.cjs`.

## 6. Put to him, not decided here
1. On the DESKTOP list a shared input still reads "Saber +3" (the names on hover) and the kind is still a pill — the
   ruling speaks of the card. Recommended: name everyone there too, and leave the pill (a table column reads well as a
   pill). His to say.

## 7. The check
FULL (`docs/bug-check-order.md` §5): it removes a door through which inputs — leave and OIL answers among them — are
changed, and moves the OIL controls. Astra designs the scenarios; the host walks (sized in the evidence sheet); Astra
and Sol 6.1 read the code blind; the sheet: `docs/handpass/2026-10-10-input-card-check.md`.
