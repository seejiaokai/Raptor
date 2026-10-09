# The bug check of the design vet's changes to the Inputs calendar and list — 10 Oct 26

**The job:** `OUTSTANDING.md` `[INPUTS-VET]` — owner D726 ("not too wordy"), D727 ("A"), D728 ("1 now, 2 later"), D729
("Yes to all"). **The plan:** `docs/superpowers/plans/2026-10-10-inputs-vet-plan.md`. **The drawings he approved:**
`docs/mock/inputs-vet.html`, `docs/mock/card-questions.html`. **Branch:** `claude/day-window-compact`. **Run unattended
(D596, D667): no merge, nothing on `main`.** Pictures: `docs/img/handpass/2026-10-10-inputs-vet-check/`.

## 0. Questions waiting for him

*(filled at the close — §0 is written last, and read first)*

## 1. The tier, and what it meant

The eight questions of the checking guide (§5), against this batch:

| # | Question | Answer | Why |
|---|---|---|---|
| 1 | Earned leave (OIL) | **YES** | the List's own add form was one of the doors that ASKS the OIL question for a weekend duty; it is gone, and the question must still be asked through the door that replaced it |
| 2 | The published record | **YES** | an input filed on a published day lands as a pending change; the form wrote its record by hand, the window writes through the editor's own command — the door changed |
| 3 | Saved data | no | nothing new is stored and no stored shape changed; the window's save existed and was walked three times this week |
| 4 | A shared drawer | **YES** | the card's model now also draws the desktop row's names and "By"; the month's bar text and its lighter look are drawn for every bar |
| 5 | A new control | **YES** | "+ Input" on the List; the "?" card moved into the window |
| 6 | A new surface | no | no new screen, window or kind of row |
| 7 | Roles | **YES** | who may file what for whom now goes through one door for an admin and a member alike; an admin's posted-out people are offered for a new input |
| 8 | The warning list | no | no warning's words or rule changed |

**Tier: FULL** — one check for the batch (D485). What that meant: the rules sweep (§2); the roll-call and the door
list (§3, §3a); the walk sized in writing (§4); Astra designed the scenarios; the host walked by script and the
walkers walked Astra's list (§5); break tests (§5.5); Astra and Sol each read the code, blind (§6); the gates (§7);
his look (§8).

## 2. The rulings that apply, each checked against the running build

| Ruling | What it says here | Checked by | Result |
|---|---|---|---|
| D729 V1 | the List's own form goes; one "+ Input" beside the dates button opens the window the calendar opens | walk A1, A2, C1; `ui/inputs.test.tsx` | *(§5)* |
| D729 V2 | the desktop row's small print is "By Saber", only where someone else filed it or it is shared, on the remark's line | walk A5, A8, A16, B2, B3; `placedshown.test.tsx` | |
| D729 V3 | the window's paragraph of instructions goes, a new input's too; a shared input keeps "Date changes apply to all N." | walk A2, A21, B4; `groupeditor.test.tsx` | |
| D729 V4 | a shared bar reads its count first; a timed bar is lighter with a solid edge | walk A20, C5; e2e "the month: a timed bar is painted lighter…" | |
| D729 V5 | the gear's lines, the fold's four lines, the empty list, no filter labels, "Changed", "duty" | walk A1, A17, A20, A24, C2 | |
| D729 reading 2 | ONLY what the page showed: LATE's tooltip, "Default window", "Add", the title's month-first date, the schedule's dialogs, the SANS window — untouched | walk A22, A23; the diff | |
| D727 | the desktop list names everyone, A to Z, wrapping; the kind keeps its pill there | walk A8, A16; `sharedline.test.tsx`; e2e "the desktop list…" | |
| D728 step 1 | the CARD leaves the automatic "till <date>" out of its remark; the record, the desktop Remarks column and the window keep it | walk A18, A19, C4, C6; `inputcard-model.test.ts`, `inputsvet.test.tsx` | |
| D726 | fewer words, the same information; nothing a man needs is removed | the door list §3a: the "?" card and every question kept | |
| D724, D723, D720 | "By Saber" for several people always, for one only where someone else filed it; no day, no time | one model for the row and both cards (`cardOf`) | |
| D721 | every name of a shared input, never "+N" | walk A8, A16, C6 | |
| D718 | the row opens the input's window; no pencil, no cross | unchanged — `inputslist.test.tsx` | |
| D715–D717 | an input's own title; the kind in sight | walk A5, A16 (titled rows keep the title over the pill) | |
| D700–D714 | ALL AVAIL / ALL: six kinds, one day, never a group | walk A9; `placeholderlist.test.tsx` | |
| D654–D660, D682 | a group input is one shared input; the filer answers OIL for all | walk A8, A16, A21 | |
| D655, D658 | a member files for another man only a duty or commitment | walk B1, B3 | |
| D681 | a saved input's dates change in its window | walk A19, A21 | |
| D672 | Undo and Redo move the view only when the change is out of view | walk A7 | |
| D641 | the window does not block the page behind it | walk A15 (the button behind it is pressed while it is open) | |
| D629 | who placed an input and when, in small print — NARROWED for the desktop row by D729 V2; whole in the window | walk A21 ("Placed by …" in the window) | |
| D620 | SANS availability is on no list of the Inputs tab | walk A22; `inputstabs.test.tsx` | |
| D487 | no button's size changes without his word | "+ Input" is a NEW button, drawn at the size of its neighbours in the row (measured, C1) | |
| D25 | OIL is earned leave, said that way | the sheet | |
| D56 | harm that lives only in stored demo data is not a finding | every brief | |

## 3. The roll-call — every place an input is drawn, and every door that makes one

**The thing:** an input — who it is for, its kind, its remark, who filed it — and the door a new one comes in by.

| # | Where it is drawn | Shared bar says its count first | "till" once | every name / "By" | Seen and operated |
|---|---|---|---|---|---|
| 1 | the Inputs month's bar, desktop | HAS IT | must not (a bar has no remark) | must not (the opened day names everyone) | A20 |
| 2 | the Inputs month's bar, phone | HAS IT — and its word, where a one-man bar a day wide says the name alone | must not | must not | C5 |
| 3 | a bar's tooltip | must not — it names EVERYONE, as before | must not | has every name (unchanged) | A20 |
| 4 | the picked-up copy of a bar while it is dragged | has it (a copy of the bar, its classes with it) | — | — | *(§5)* |
| 5 | the opened day's card (Inputs calendar), desktop | — | HAS IT | has every name and "By" (as before) | A18, A19 |
| 6 | the opened day's card, phone | — | HAS IT | as before | C6 |
| 7 | the Inputs list's card, phone | — | HAS IT | as before | C4 |
| 8 | the Inputs list's row, desktop | — | MUST NOT — the Remarks column keeps the whole remark (D728 reading 1) | HAS IT — every name; "By" on the remark's line; the pill kept | A5, A8, A16, A18 |
| 9 | the input's window — its title | must not ("Drifter +3 · 23 Jul" — not on the page he approved; told to him) | — | — | A21 |
| 10 | the input's window — its Remarks box | — | MUST NOT (the record's own words) | — | A18 |
| 11 | the SANS day's card | must not — pucks with the CAT (D647, D649) | must not | must not | A22 |
| 12 | the Medical tab's cards | must not | must not | must not | *(§5)* |
| 13 | the schedule's row for an input (week and board), and its own dialog | must not | MUST NOT (D728 reading 1) | must not | A23 |
| 14 | the changes window, the bell, the Leave War's grid, the edit history, the export | must not | must not | must not | not drawn by any changed code — *(§5.4)* |

**The words that must NOT have changed** (the same sentences live on other screens, and D729 named only the Inputs
screens): the Leave War's ⚙ "Calendar…" line ("Day flying, night flying or no fly for each date…"); the Logic page's
row "Members may file duties and commitments for other people"; the SANS calendar's "How this works". Each is pinned
by its own test, untouched and green (`leavewar/ui/daysline.test.tsx`, `ui/logicdoors.test.tsx`, `ui/sanscal.test.tsx`).

### 3a. The doors — every thing the List's own add form did, and where it is now

Made BEFORE the form was removed (the plan's §2), from the form's own code; each is then seen and operated in the
walk. "Carried by a test" is said where the walk did not press it, with the test and what it proves (§5.4).

| # | The form did | Where it is now | Verdict | Walk |
|---|---|---|---|---|
| 1 | Person — an admin picks anyone | the window's people picker (the same component) | has it | A5 |
| 2 | …a member is himself; another man for a duty or commitment only | the same picker, the same rule | has it | B1, B3 |
| 3 | …an admin's "Posted out / archived" group | **was MISSING from a new input's window — added** | fixed before the form went (`windowdoors.test.tsx`, red first) | A10 |
| 4 | Several people → one shared input | the same switch, the same save | has it | A8, A16 |
| 5 | ALL AVAIL / ALL: one day, the kinds that may carry one | the same picker and the same refusal | has it | A9 |
| 6 | The date calendar: two taps; nothing dated until a day is picked | the same calendar; opened from the List it has NO date | has it — **and a save with no date is refused first, before any question (added, red first)** | A2, A3, A14 |
| 7 | All day / AM / PM / Custom, and the hours | the window's own | has it (the hours are put away under All day, where the form dimmed them) | A14 |
| 8 | The kind — without SANS availability | the window's list for the Inputs tab | has it | A3, A22 |
| 9 | The "?" beside Type — what each kind means | **was NOWHERE else — moved into the window** | fixed before the form went (`inputs.test.tsx`, red first) | A4, C3 |
| 10 | The title, for a duty or commitment | the same box | has it | A5, A16 |
| 11 | Remarks, and "till <date>" written as dates are picked | the same | has it | A14, C4 |
| 12 | The OIL question on a weekend or holiday | the window's own gate and sheet | has it | A11 |
| 13 | The document question for a medical entry | the window's own | has it | A12 |
| 14 | An upchit's summary; a clash between medical entries | the window's own two sheets | has it | A12, A13 |
| 15 | A document attached | the window's document field | has it | *(§5)* |
| 16 | A locked week refused | the window's save | has it | carried by a test (§5.4) |
| 17 | The just-saved input kept in view when the filters or the dates hide it | the window reveals it; the List pins it | has it | A6, C4 |
| 18 | …and LIT | **only the form lit it — added: the List lights the row it has just been shown** | fixed (`inputsvet.test.tsx`, red first) | A5, A6, A7, C4 |
| 19 | The dates and the kind stay on the form for the next add | — | **GOES — a reading to tell him (§0)** | A15 |
| 20 | Opens on LL | the window opens on the calendar's first kind, a duty | **changes — a reading to tell him (§0)** | A2 |

## 4. Sizing the walk (D607 — the order's §7.0)

Written by the host (Opus) after the roll-call and before any walker started.

1. **The type of change** (`docs/walk-ledger.md`): **C** — a control replaced (the List's form by "+ Input"), and a
   control moved (the "?" card into the window); **D** — things drawn in several places, some by their own code (who
   an input is for and who filed it: the desktop row and two cards; the "till" on two cards and NOT on the row; a
   bar's words on a desktop, a phone and its dragged copy); **E** — look (the lighter bar, the Name column, the card
   laid in the window); **F** — words (the settings, the fold, the empty list); **H** at the edges (an admin's and a
   member's "+ Input"; the posted-out people).
2. **What only a walk could find here:** whether every thing the form did can be DONE through "+ Input" on the real
   screen at both sizes — a door, a question, a refusal that the window had for an input started from a day and may
   not have for one started with no date; whether the card laid in the window can be read and still leaves its buttons
   in reach on a short phone; whether the lighter bar is painted and can be told from the solid one; whether names
   wrap and "By" keeps its line; whether a just-saved input is seen. **What the tests and the reads already cover:**
   the window's own saves (the medical cascades, the OIL sums, a group's one command) were walked three times this
   week from the calendar's "+ Input" and from a saved row — the same code, the same sheets; the pure rule of "till
   said once" and of a bar's words; the words themselves.
3. **What the ledger says:** walks of leading type C found a real fault in 8 of 15; type D in 10 of 10 — every one a
   place that draws the thing by its own code. Yesterday's two checks on these same screens (the title; the card and
   the pencil's removal) each used the host's run and three walkers and each found eight to ten faults, most of them
   a door lost with a removed control or a look only a browser shows.
4. **The walk chosen — MEDIUM-WIDE.** (a) **The host's own scripted run**, `scripts/handpass/ivet-walk.mjs`, on the
   production build: 40 steps — a desktop 1440 × 900 as the admin (24: the door list row by row, the row, the empty
   list, "till", the month, the window's words, the two surfaces that must not change, the gear) and as a member
   (4), a phone by touch at 390 × 844 and at 390 × 568, the short screen (6 each). (b) **Three Sonnet 5.5 walkers** on
   a frozen copy of the build, each in its own world, for 60 of Astra's 69 scenarios, one size and one role a
   scenario: A — the filing door (1–19); B — the questions after Add, what is kept in view, the month and the
   settings (20, 21, 23, 25, 28–31, 53–63, 67–69); C — the desktop list, the cards and "till", the windows (32–49,
   51). **Not walked by them, and why:** 22, 24, 26 (two documents; an upchit over later entries; medical refusals —
   the window's own sheets, unchanged by this build, walked in the input card's check of 10 Oct, and carried by the
   tests named in §5.4); 27 (a locked week cannot be reached through the app's controls); 50, 52 (Delete from the
   window; a member taking himself out — walked on 10 Oct, the code unchanged); 64, 65, 66 (the host's A22, A23, A24).
   No size beyond the phone, the desktop and the short phone: nothing here is a viewport-tall column but the window,
   which the short phone covers.
5. **Its row** is added to `docs/walk-ledger.md` at the close.

