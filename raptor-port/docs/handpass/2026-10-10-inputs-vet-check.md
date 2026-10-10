# The bug check of the design vet's changes to the Inputs calendar and list — 10 Oct 26

**The job:** `OUTSTANDING.md` `[INPUTS-VET]` — owner D726 ("not too wordy"), D727 ("A"), D728 ("1 now, 2 later"), D729
("Yes to all"). **The plan:** `docs/superpowers/plans/2026-10-10-inputs-vet-plan.md`. **The drawings he approved:**
`docs/mock/inputs-vet.html`, `docs/mock/card-questions.html`. **Branch:** `claude/day-window-compact`. **Run unattended
(D596, D667): no merge, nothing on `main`.** Pictures: `docs/img/handpass/2026-10-10-inputs-vet-check/`.

## 0. Questions waiting for him

**None. Nothing was left unbuilt, and nothing needs an answer before he looks.** Twelve readings to tell him — each is
the agent's reading of what he approved; he says so if one is wrong.

1. **"+ Input" starts clean every time.** The old form kept its dates, its kind, its people and its hours for the next
   input; the window opens with no date and nothing carried over. Filing five inputs in a row is five times "pick a
   date" — say if he wants the last dates remembered.
2. **It opens on "Training"** (the first kind the calendar's "+ Input" offers), where the old form opened on LL.
3. **A row or card is lit for six seconds** when it is added, changed, or put back by Undo or Redo. The old form lit
   only what it added. The light goes out by itself; pressing a heading does not put it out.
4. **"Input added" is said together with anything the save itself reported** — one note, for example "Ammo's LL
   replaces the LL bid on 11 Feb · Input added".
5. **The "?" beside TYPE** stands in the window for a new input and a saved one — and is not drawn for someone reading
   an input he may not change (it could not be pressed there).
6. **An admin's "+ Input" offers the posted-out people**, as the old form did — on a day opened on the calendar too.
7. **The window's title still reads "Drifter +3 · 23 Jul"** — it was not on the page he approved.
8. **"Yes to all" was taken to include the lighter bar** for an input with hours, which the page had left to his
   taste. A half-day leave is lighter too. His to judge on the preview.
9. **The Name column on the desktop list is 250 points wide**, the drawing's own: a group of nine takes two lines.
10. **An input for ALL or ALL AVAIL says "By Saber"** on the desktop list, as its card does.
11. **Two older faults were fixed because this build made their road the main one:** a shared input just added was
    lit but not scrolled to; a shared input shown on an opened day through a filter was listed as one man's, and its
    Delete took only him.
12. **The IT flow guide still pictures the old form**, and its picture-taking scripts press that form's buttons. By
    his rule the guide is re-shot only on his word (D403) — nothing was changed there.

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
| D729 V1 | the List's own form goes; one "+ Input" beside the dates button opens the window the calendar opens | walk A1, A2, C1; `ui/inputs.test.tsx` | PASS |
| D729 V2 | the desktop row's small print is "By Saber", only where someone else filed it or it is shared, on the remark's line | walk A5, A8, A16, B2, B3; `placedshown.test.tsx` | PASS |
| D729 V3 | the window's paragraph of instructions goes, a new input's too; a shared input keeps "Date changes apply to all N." | walk A2, A21, B4; `groupeditor.test.tsx` | PASS |
| D729 V4 | a shared bar reads its count first; a timed bar is lighter with a solid edge | walk A20, C5; e2e "the month: a timed bar is painted lighter…" | PASS |
| D729 V5 | the gear's lines, the fold's four lines, the empty list, no filter labels, "Changed", "duty" | walk A1, A17, A20, A24, C2 | PASS |
| D729 reading 2 | ONLY what the page showed: LATE's tooltip, "Default window", "Add", the title's month-first date, the schedule's dialogs, the SANS window — untouched | walk A22, A23; the diff | PASS |
| D727 | the desktop list names everyone, A to Z, wrapping; the kind keeps its pill there | walk A8, A16; `sharedline.test.tsx`; e2e "the desktop list…" | PASS |
| D728 step 1 | the CARD leaves the automatic "till <date>" out of its remark; the record, the desktop Remarks column and the window keep it | walk A18, A19, C4, C6; `inputcard-model.test.ts`, `inputsvet.test.tsx` | PASS |
| D726 | fewer words, the same information; nothing a man needs is removed | the door list §3a: the "?" card and every question kept | PASS |
| D724, D723, D720 | "By Saber" for several people always, for one only where someone else filed it; no day, no time | one model for the row and both cards (`cardOf`) | PASS |
| D721 | every name of a shared input, never "+N" | walk A8, A16, C6 | PASS |
| D718 | the row opens the input's window; no pencil, no cross | unchanged — `inputslist.test.tsx` | PASS |
| D715–D717 | an input's own title; the kind in sight | walk A5, A16 (titled rows keep the title over the pill) | PASS |
| D700–D714 | ALL AVAIL / ALL: six kinds, one day, never a group | walk A9; `placeholderlist.test.tsx` | PASS |
| D654–D660, D682 | a group input is one shared input; the filer answers OIL for all | walk A8, A16, A21 | PASS |
| D655, D658 | a member files for another man only a duty or commitment | walk B1, B3 | PASS |
| D681 | a saved input's dates change in its window | walk A19, A21 | PASS |
| D672 | Undo and Redo move the view only when the change is out of view | walk A7 | PASS |
| D641 | the window does not block the page behind it | walk A15 (the button behind it is pressed while it is open) | PASS |
| D629 | who placed an input and when, in small print — NARROWED for the desktop row by D729 V2; whole in the window | walk A21 ("Placed by …" in the window) | PASS |
| D620 | SANS availability is on no list of the Inputs tab | walk A22; `inputstabs.test.tsx` | PASS |
| D487 | no button's size changes without his word | "+ Input" is a NEW button, drawn at the size of its neighbours in the row (measured, C1) | PASS |
| D25 | OIL is earned leave, said that way | the sheet | PASS |
| D56 | harm that lives only in stored demo data is not a finding | every brief | PASS |

## 3. The roll-call — every place an input is drawn, and every door that makes one

**The thing:** an input — who it is for, its kind, its remark, who filed it — and the door a new one comes in by.

| # | Where it is drawn | Shared bar says its count first | "till" once | every name / "By" | Seen and operated |
|---|---|---|---|---|---|
| 1 | the Inputs month's bar, desktop | HAS IT | must not (a bar has no remark) | must not (the opened day names everyone) | A20 |
| 2 | the Inputs month's bar, phone | HAS IT — and its word, where a one-man bar a day wide says the name alone | must not | must not | C5 |
| 3 | a bar's tooltip | must not — it names EVERYONE, as before | must not | has every name (unchanged) | A20 |
| 4 | the picked-up copy of a bar while it is dragged | has it (a copy of the bar, its classes with it) | — | — | PASS |
| 5 | the opened day's card (Inputs calendar), desktop | — | HAS IT | has every name and "By" (as before) | A18, A19 |
| 6 | the opened day's card, phone | — | HAS IT | as before | C6 |
| 7 | the Inputs list's card, phone | — | HAS IT | as before | C4 |
| 8 | the Inputs list's row, desktop | — | MUST NOT — the Remarks column keeps the whole remark (D728 reading 1) | HAS IT — every name; "By" on the remark's line; the pill kept | A5, A8, A16, A18 |
| 9 | the input's window — its title | must not ("Drifter +3 · 23 Jul" — not on the page he approved; told to him) | — | — | A21 |
| 10 | the input's window — its Remarks box | — | MUST NOT (the record's own words) | — | A18 |
| 11 | the SANS day's card | must not — pucks with the CAT (D647, D649) | must not | must not | A22 |
| 12 | the Medical tab's cards | must not | must not | must not | PASS |
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
| 15 | A document attached | the window's document field | has it | PASS |
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

## 5. The walk

### 5.1 The host's own walk — `scripts/handpass/ivet-walk.mjs`, the built bundle, the app's own controls

Forty steps; every fixture made through the app's own controls (a man is posted out on Admin → Users; inputs are filed
through "+ Input"). **First run, on the frozen build: 36 of 40.** The four FAILs were read against the screen and were
the script's own (it counted two rows that were rightly still lit; it looked for an Archive button by a guess; it
measured a row made taller by its OIL chip; it opened a SANS commitment where it meant an ordinary input) — corrected,
**40 of 40**, no page error, no failed request. **Re-walk on the final build (§5.6): 41 of 41 — the forty and one step added for the readers' finds.**
Pictures: `docs/img/handpass/2026-10-10-inputs-vet-check/host/` (39) and `…/look/` (33, the first look at every changed
screen beside its drawing); the host opened fourteen — the desktop list as it opens, July's rows, a group of nine, the
month, the "?" card on a desktop and on both phones, the phone's list and its cards, a shared input's window, the
just-added card kept in view.

| Steps | What was driven | Result |
|---|---|---|
| A1–A4 | the List without its form; "+ Input"; no date → refused before any question (four kinds); the "?" card: inside the window, every kind named, closed three ways | PASS |
| A5–A7 | one person, saved as picked, lit, "By Saber"; saved while the search, the kind and the dates hide it — first and lit; Undo and Redo | PASS |
| A8–A10 | several people → one shared row, every name, the pill; ALL AVAIL (several days refused, one day saved); a man posted out on Admin → Users, then a leave filed for him | PASS |
| A11–A13 | a weekend duty: the OIL question, Cancel keeps the typing, Yes saves the answer; a medical entry: the document question both ways; an upchit's summary; a clash between two kinds of downchit | PASS |
| A14–A15 | two taps, a backwards tap, AM, Custom, equal hours refused, "till" written as dates are picked; "+ Input" over unsaved typing asks first | PASS |
| A16–A17 | nine names wrapping in 250px, "By" on the remark's line, the Person filter set to the last name, sorting by Name; the empty list's four wordings | PASS |
| A18–A19 | "till" once: the first, a middle and the LAST day of Grit's ATT C against the desktop row and the window; the dates changed in the window, the remark follows | PASS |
| A20–A21 | the month: counts first, no "+N", timed bars painted lighter (measured), the key, the fold, the tooltip; the window's words for a new, a one-person, a shared input (4, then 5) | PASS |
| A22–A24 | NOT CHANGED: the SANS calendar's "+ Commitment"; the schedule's own dialog; and the gear's lines and its Save | PASS |
| B1–B4 | a member: his own "+ Input", his leave, a duty for another man ("By Ranger"), a leave for another man refused; another man's input read only, with no "?" | PASS |
| C1–C6 × 2 | a phone at 390 × 844 and 390 × 568, by touch: the list under one button; the filters without words; the "?" card inside the window with Add in reach; a leave added while a search hides it — first, lit, "till" once; the month; an opened day | PASS |

### 5.2 The three walkers (Sonnet 5.5, each in its own world, the frozen build of `4b93aeba` + the fixes up to it)

| Walker | Share (Astra's numbers) | Result | Pictures |
|---|---|---|---|
| A — the filing door | 1–19 | **19 PASS** | 84 (22 opened) — `…/A/`, report `docs/handpass/parts/ivet-A.md` |
| B — after Add, the month, the settings | 20, 21, 23, 25, 28–31, 53–63, 67–69 | **23 PASS, 1 FAIL, 1 NOT RUN** (25 rows: three scenarios at both sizes) | 107 (16 opened) — `…/B/`, `ivet-B.md` |
| C — the desktop list, the cards, the windows | 32–49, 51 | **19 PASS** | 120 (22 opened) — `…/C/`, `ivet-C.md` |

No console error, page error or failed request in any walker's run. **The one FAIL (B, scenario 28's last step):** a
just-saved row stays lit after a column heading is pressed. **Not a fault — the brief's own wording was wrong.** What
lets go on a heading or a filter is the HOLD that keeps a hidden input in view (all five of that scenario's hidden
cases passed); the LIGHT goes out by itself after six seconds, as the old form's did. All three walkers remarked on
it. **The one NOT RUN (69):** the sign-in card offers no guest route.

### 5.3 What the walk and the build's own checks found, and each disposition

**Faults of this build — each fixed with a test that was red first:**

| # | Found by | The fault | The fix |
|---|---|---|---|
| W1 | the phone's new browser test | The "?" card, laid in the window as an item of a flex row, was layered OVER the window's pinned Cancel / Add: neither could be seen or pressed while it was open | `14-input-editors.css` — the card takes no layer of its own there; `e2e/inputs-calendar.spec.ts` "a phone: the List opens on its cards…" |
| W2 | the first gate run (five browser tests of the Leave War's inputs door) | The window's "Input added" covered what the save itself had said — "…replaces the LL bid on 11 Feb", "…is cut for the ATT C". The old form said nothing after a one-person add, so that sentence used to be read | every save of the window is ONE note (`inputedit.tsx` `doSave` / `doMedSave` in `HOOKS.toastBatch`); `inputsvet.test.tsx`, `e2e/step4-leavewar.spec.ts` |
| W3 | Astra's scenario design | A "?" drawn inside a read-only form: seen, and dead | not drawn where the form cannot be used; `inputsvet.test.tsx` |
| W4 | the host, opening its own walk's picture (A16) — and Astra's first-ranked scenario | A shared input just added was usually NOT lit on the desktop list: the light followed one man's record, the row stands under the entry's first A to Z | the row is lit by any record of its entry; `inputsvet.test.tsx` |
| W5 | the door list (§3a rows 3, 6, 9, 18), before the form was removed | Three things only the form did, and a refusal the no-date window needed | added first, red first (§3a) |

**The readers' finds are §6.**

**Seen by the walkers outside their scenarios — each OLDER than this build or as built; none fixed here:**
- *The "?" card lists SANS availability, which this window cannot file, and several kinds carry a name and no words*
  (A) — the card is the form's own, moved whole; its words are the engine's table. As it was.
- *An AM leave turned into a duty keeps the AM hours as the duty's hours; a one-day duty's remark says "till 27 Jul"*
  (A) — the window's behaviour before this build; the one-day "till" is his rule of 18 Aug 26, and `[TILL-FROM-DATES]`
  retires it.
- *The OIL question for two people is headed "Ranger +1, Duty"* (A) — `[CAL-CHECK-SEEN]`.
- *A member's list and month open filtered to himself* (A, B, C) — as built (27 Aug 26).
- *A blue or teal block over a window just opened on a phone* (A, B, C) — the host opened A's picture: it is the List's
  filled "+ Input" (or a lit card) seen THROUGH the window while the window fades in — a picture taken mid-fade. Not a
  layer fault: nothing can be pressed through it and it is gone when the fade ends. On his look card.
- *The read-only medical window shows "You can file a medical entry only for yourself"* (C) — `[CARD-CHECK-SEEN]` 4.
- *The passing note lies over the window's Cancel on a phone* (B) — `[CARD-CHECK-SEEN]` 3.
- *After Redo of an upchit only the upchit's row is lit, not the downchit it shortened* (B) — the page is shown one
  input for each step; as built.
- *"The Medical tab did not list Saber's own ATT C"* (B) — NOT REPRODUCED: the host filed one for Saber and one for
  Ranger through "+ Input" in a clean world and both stood on the Medical tab (`scripts/handpass/ivet-probe-med.mjs`).
- *On a phone the window covers the List's "+ Input"* (B) — the window is the screen's width there; pressing "+ Input"
  over unsaved typing was driven on a desktop (A15) and by walker B on a phone after dragging the window down.

### 5.4 The cases carried by a test, each with its test and what it proves

| Case | The test | What it proves — and how |
|---|---|---|
| A locked week refuses the save (door 16; Astra 27) | `src/state/quarantine.test.ts`, `quarantine-funnel.test.ts`, `quarantine-filing-pile1.test.ts`, `src/ui/savesaysok.test.tsx` | the window's own save refuses a protected week and keeps the window — by calling the save; the state cannot be reached through the app's controls (it is an older build's published week) |
| Two documents, and replacing one (Astra 22); an upchit over later entries (24); the medical refusals (26) | `ui/docconfirm.test.tsx`, `ui/upchit.test.ts`, `ui/medclash.test.tsx`, `engine/medical.test.ts`, `ui/groupeditor.test.tsx` | the window's sheets and refusals, pressed through its real controls in jsdom; the same sheets were walked in the running app on 10 Oct (the input card's check, walker B) and this build changed none of their code |
| Delete from the window; a member taking himself out (Astra 50, 52) | `ui/inputs.test.tsx`, `ui/groupeditor.test.tsx` | pressed through the real controls; walked on 10 Oct, code unchanged |
| Rows 14 of the roll-call (the changes window, the bell, the Leave War's grid, the history, the export) | `ui/export.test.ts`, `ui/export-published.test.ts`, the unit suite | none is drawn or written by any changed code (the diff touches no file of theirs); the export still writes the whole remark |
| The dragged copy of a timed bar keeps its look (roll-call 4) | walker B, scenario 58 — WALKED, at both sizes, by real pointer and touch events | (walked, not carried) |

### 5.5 The break tests — `scripts/handpass/breaks.mjs scripts/handpass/breaks/ivet.json`

Thirty-seven breaks, one rule each — **37 of 37 CAUGHT** (a named test went red each time; the source was put back and
`git status` showed nothing of it changed). They cover: "+ Input" opening nothing, or dating the input for him; the
no-date refusal; the "?" missing, drawn in a read-only form, not taking Escape, staying open under a question; the
posted-out group missing for a new input, or offered on the SANS calendar; the row not lit, or lit by one record, or
looked for by one record; "Input added" said after the save's note; each of the window's three wordings; the row's
"+N", its "By" on a man's own input, its whole stamp; "Last modified"; the empty list's long line and its month said
twice; a word over a filter box; the card keeping its "till", not being told its corner (each card), taking out a
"till" for another day, eating a typed year, stripping the whole remark's ends; the desktop Remarks column losing its
"till"; the bar's "+N"; no bar or every bar marked timed; the fold's fifth line; "duty or commitment"; a long settings
line; the calendar's "+ Input" forgetting its day. **What a break in jsdom cannot prove** — that the lighter bar is
painted, that names wrap inside their column, that the card leaves Add in reach — is proved by the three browser tests
named D729 (`e2e/inputs-calendar.spec.ts`), the first of which caught W1 on its first run.

### 5.6 The re-walk

After the last fix the build was made again and frozen again, and the host's script run whole on it into its own
folder (`…/rewalk/`): **41 of 41**, no page error, no failed request. One step was added for what the readers found
and a jsdom test cannot show (A8b): a shared input picked "Ace, then Wisp" from the foot of a long list is lit AND
brought on screen (picture opened: `rewalk/A8b-desk-shared-lit-on-screen.png`), and a remark "-5°C cold-weather kit"
keeps its minus on the opened day's card while the desktop row and the record keep "… till 8 Jan". B4 now asserts
there is no "?" in a read-only window. The walkers' shares were not walked again: no fix touched what they walked
except the light on a shared row and the card's remark, both in A8b.

## 6. The two reads of the code

Astra and Sol 6.1, each blind, on one brief (`docs/superpowers/briefs/2026-10-10-inputs-vet-code-read.md`), with the
roll-call and the door list of this sheet in hand. **Said plainly: they were started while the three walkers were still
walking** (the host's own walk was done), to use the night — the checking guide puts the walk before the reads so the
readers read the walked code; here they read the code as walked by the host, and nothing the walkers found afterwards
changed a line. Their reports: `docs/superpowers/briefs/2026-10-10-vet-reads/`.

| # | Reader | The finding | Disposition |
|---|---|---|---|
| R1 | Astra | "till said once" stripped punctuation from both ends of the WHOLE remark: "-5°C cold-weather kit till 17 Jul" lost its minus sign on the card | CONFIRMED, of this build — fixed red first (`inputcard-model.ts remarkOnce`: only the join is tidied) |
| R2 | Sol | …and where the words OPEN the remark a sign attached to the next word was still eaten ("till 17 Jul -5°C kit") | CONFIRMED, of this build (R1's fix left it) — fixed red first: only a separator standing by itself is a join |
| R3 | Astra | A just-added shared input was pinned and lit but never scrolled to: the page looked for one man's record, the row answers to the entry's first A to Z | CONFIRMED, OLDER (the form revealed the same record) — and the List's one door now, so fixed red first (`InputsPage.tsx`, the reveal) |
| R4 | Astra | **The host's own slip:** restating `placeholderlist.test.tsx` cut eighteen unrelated tests off its end | CONFIRMED — restored word for word, green; every other restated file was counted against its old self, none lost a test |
| R5 | Astra | The "?" card, left open, took the first Escape from a question opened over the window by keyboard | CONFIRMED, of this build — fixed red first: the card gives way to a question, and takes Escape only as the front window's |
| R6 | Sol | A shared input listed on an opened day although a filter hides it was listed by ONE record: it read as one man's and its Delete took his record alone | CONFIRMED, OLDER — new data is hurt, so fixed red first (`InputsCal.tsx`: the entry's own rows) |
| R7 | Sol | The IT flow guide's capture scripts still drive the removed form | CONFIRMED — NOT filed and NOT fixed, by D403 (the guide is re-shot only on his word); told to him once (§0) |
| — | both | Explicit negatives: no path from the no-date window to a write; no other warning covered by the note; no other card caller missed; the export unchanged; no remaining caller of the form's ids in `src`, `e2e`, `probes` or the Help page | recorded |
| — | Astra | The form refused a locked week BEFORE opening a question; the window can open a question first and refuse at the save | noted, not a finding (a protected week is an older build's stored data — D56) |
| — | both | Tidiness (D489, filed not fixed): retired SANS helpers kept alive by `void` in `inputs.test.tsx`; (Sol's "corner worked out twice" was tidied with R6) | the first is left — older than this build |

## 7. The gates

The whole set under the PC's lock, on the final code (`d7f71e3c` — nothing under `src` changed after it):

| Gate | Result |
|---|---|
| unit | **9803 / 9803** |
| build | clean |
| the original app's own assertions (tfin) | **728 / 0** |
| browser tests (e2e) | first whole run **742 passed, 1 failed, 57 skipped**; run whole again straight after: **743 passed, 0 failed, 57 skipped** |
| the Tracker's smoke | **445 / 0** |
| rulecheck | OK |
| docsize | OK |

**The one failure of the first run, said plainly:** a Leave War test on a phone ("Undo and Redo leave the grid where it
is … the month button lands its month at the left edge") measured the grid before its scroll had landed. This build
changes no file of the Leave War and none of that test; run by itself straight after, it passed 4 of 4, and the whole
gate run again passed it. It is a test that waits on a fixed moment (D87) — said in the closing report; not chased
here. **The earlier run of this night** (before the walk) had ten browser-test failures, all of this build: five were
W2 (§5.3), five were tests still expecting the old words; fixed, and their four files green before the walk. **One
lapse of the host's, with no effect on any result above:** during that earlier run a build and four browser-test
files were started while its Tracker smoke was still going — the lock had refused and the refusal was not read. The
smoke passed, the four files passed, and the whole set was run again afterwards under the lock, alone.

The server question (D202): `src/state/perms.ts` is not touched; `perms.test.ts` and `perms-scan.test.ts` are green
in the unit run; no row of `docs/data-model.md` §11 is changed.

## 8. His look

Five steps on his iPhone, on the preview link, about five minutes. Each is what he should SEE.

1. **Inputs → List.** The list starts at once under one blue "+ Input" — no form above it.
2. **Tap "+ Input".** The window opens with no date picked ("pick a start date"). Tap the small "?" beside TYPE: the
   card opens inside the window and Cancel / Add stay in reach; tap "?" again to close it. *(A faint blue patch for a
   moment as the window appears is the button behind it showing through the fade — say if it bothers you.)*
3. **Pick two dates a few days apart, choose LL, tap Add.** The new card stands under its day, lit for a few seconds;
   its corner says "till <date>" and the card does not say it again.
4. **Calendar.** A shared input's bar reads "4 · Meeting"; bars with hours are lighter with a solid left edge; the key
   reads "absence" and "duty". Tap "How this works": four short lines.
5. **On a PC, the List:** a shared input names everyone; "By Saber" follows the remark only where someone else filed
   it; the last column reads "Changed".

---

`Walk: docs/handpass/2026-10-10-inputs-vet-check.md · 472 pictures (host 39 + 41 + 33, walkers 84 + 107 + 120; the host opened fifteen, the walkers sixty) · 14 surfaces · 41 host steps + 60 scenarios · MISSING: 4 fixed (the "?" card, the posted-out people, the lit row, the no-date refusal), 0 ruled, 0 filed`
