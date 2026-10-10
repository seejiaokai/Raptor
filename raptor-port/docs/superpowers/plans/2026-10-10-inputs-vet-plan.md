# The design vet's changes to the Inputs calendar and list — the build plan (10 Oct 26)

**Authorised by:** D726 ("not too wordy"), D727 ("A"), D728 ("1 now, 2 later"), D729 ("Yes to all") — their full rows in
`.claude/decisions-full/`. **The job:** `OUTSTANDING.md` `[INPUTS-VET]`; `HANDOFF.md`, the block of
`claude/day-window-compact`. **The drawings of record:** `docs/mock/inputs-vet.html`, `docs/mock/card-questions.html`
(pictures `docs/mock/img/inputs-vet/`, `docs/mock/img/card-questions/`; drawn by `scripts/handpass/mk-inputs-vet.mjs`
and `mk-card-questions.mjs`, which hold the look to the pixel). **Built unattended (D596, D667), tests first, no merge.**
**Not read by Astra and Sol before the build** — it changes no saved data, no rule, no role and no published record, and
every piece was drawn and approved; the two blind reads of the CODE come at the end of the check (FULL, below).

## 1. What is built — seven pieces, exactly as the two pages showed

| # | Ruling | What changes | Where |
|---|---|---|---|
| 1 | D727 | The desktop list names EVERY person of a shared input, A to Z, wrapping in a wider Name column; never "Drifter +3". The kind KEEPS its pill there. | `ui/InputsPage.tsx` (the row's Name), `ui/scheduler/06-inputs.css` |
| 2 | D728 step 1 | The CARD (the opened day and the phone's list) leaves the automatic "till <date>" out of its remark where the card's corner says the same date; typed words stay; a remark that was nothing else shows no remark. The record is not changed. | `ui/inputcard-model.ts` (pure), its two callers |
| 3 | V1 | The list's own add form goes. One "+ Input" button, at the left of the dates button, opens the window the calendar opens. | `ui/InputsPage.tsx`, `ui/inputedit.tsx`, `06-inputs.css` |
| 4 | V2 | The desktop list's small print is "By Saber", on the remark's own line, only where someone else filed it or it is for several people (the card's rule — D723, D724). The full "who, date, time" stays in the input's window. | `ui/InputsPage.tsx`, `25-inputs-calendar.css` |
| 5 | V3 | On the Inputs page the window's paragraph of instructions goes — a new input's too. A shared input keeps one line: "Date changes apply to all N." | `ui/inputedit.tsx` |
| 6 | V4 | On the month a shared bar reads its count first ("4 · Meeting", "9 · Squadron photo"); a timed input's bar is a tint of its colour with a solid edge at its left, an all-day one stays solid. | `ui/inputscal-model.ts`, `ui/InputsCal.tsx`, `25-inputs-calendar.css` |
| 7 | V5 | The gear's three helper lines as drawn; "How this works" four shorter lines (the red / amber line goes); the empty list "No inputs 10–24 Oct. Try All dates."; the phone's filter labels gone; the table's last column "Changed"; the colour key "duty". | `ui/InputsSettings.tsx`, `ui/InputsCal.tsx`, `ui/InputsPage.tsx`, `25-inputs-calendar.css` |

**NOT built (D729 reading 2):** LATE's tooltip, "Default range", "Add", day-first dates in the window's title, the
schedule dialogs' leave and upchit hints; the three unchecked finds (hours as am / pm, a shared input's people picker,
the month shifting); `[TILL-FROM-DATES]` (D728 step 2). The SANS calendar's own window lines and the board's and the
week's dialogs keep their words — the vet was of the Inputs calendar and list.

## 2. V1 removes a door — everything the list's form does, found in the window first

The form (`InputsPage.tsx`, `.inbar`) and its own `add()` are a SECOND maker of an input, with its own copies of every
check. The window (`ui/inputedit.tsx InputEditor`, opened as a new input from the calendar) is the first. Each thing
the form does, and where the window does it:

| The form does | In the window | Verdict |
|---|---|---|
| Person — an admin picks anyone; a member is himself, or another man for a duty or commitment | the people picker (`PeoplePick`), the same component | has it |
| …and an admin's "Posted out / archived" group (clearing leave is filed for a man who has posted out) | offered on a SAVED input only — the window's own comment says "the List's Add form is where such leave is filed" | **MISSING — added: a new input on the Inputs page offers the group to an admin** |
| Several people → one shared input | the same switch, `commitGroup` | has it |
| ALL / ALL AVAIL, one day, six kinds | the same picker and `placeholderRefused` | has it |
| The date calendar, two taps; nothing dated until a day is picked ("pick a start date") | the same `RangeCal`; opened from the list it starts with NO date | has it — **and the save says "Pick a start date on the calendar first" before any question is asked (added)** |
| All day / AM / PM / Custom and the hours | `SpanPicker`, the all-day tick, the two time boxes | has it (the boxes are hidden while all day, where the form dimmed them) |
| The kind, without SANS availability | the list `TYPE_ALLOW.i` | has it |
| The "?" help beside Type — what each kind means | nowhere | **MISSING — moved: the "?" stands beside Type in the window on the Inputs page** |
| The title, for a duty or commitment | the same box | has it |
| Remarks, and the automatic "till <date>" written as dates are picked | the same | has it |
| The OIL question on a weekend or holiday | `oilGate` → the same sheet | has it |
| The medical questions — a document asked for, an upchit's summary, a clash between medical entries | the window's own three sheets | has it |
| A document attached | `DocField` | has it |
| A locked week refused | `commitNewInput` | has it |
| The just-saved input kept in view when the filters or the dates would hide it, and lit | the window calls `revealInput`; the list pins it — but only the form LIT it | **MISSING — added: the list lights the row it has just been shown** |
| The dates and the kind stay on the form for the next add | the window closes after Add and opens fresh | **goes — a reading to tell him** |

The form's own `add()` and its three sheets (upchit, medical clash, document) leave with it; the OIL sheet stays, for
the desktop row's OIL chips. The window opens on the calendar's first kind, as "+ Input" on a day does.

## 3. Tests first

Each piece: a failing test, then the change. The tests that drove the list's form (`ui/inputs.test.tsx`,
`inputtitle.test.tsx`, `sharedline.test.tsx`, `placeholderlist.test.tsx`, `docconfirm.test.tsx`, `inputstabs.test.tsx`,
`audit-e-window-sort.test.tsx`, `whoplaced.test.tsx`, `e2e/step4-leavewar.spec.ts`) are RESTATED for the window — the
claim kept, the door moved; never deleted. Old walk scripts under `scripts/handpass/` are evidence of past walks and
are left as they were.

## 4. The check — ONE for the batch (D485), tier FULL

FULL because V1 removes a door that carries the OIL question, the medical questions and who may file for whom
(questions 1, 7 of the checking guide's eight); the rest are a shared drawer (the card, the bar) and words. In order:
build → gates → roll-call and door check → the sizing step → Astra designs the scenarios → the walk (the host by
script; Sonnet walkers if the sizing step asks for them) → fix → gates → Astra and Sol read the code, blind → fix →
re-walk what the fixes touched → gates → the evidence sheet `docs/handpass/2026-10-10-inputs-vet-check.md` → his look.
