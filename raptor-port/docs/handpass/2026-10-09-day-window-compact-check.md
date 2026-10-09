# Bug check — the day window's two jobs: the shorter input card, and the note that carries its own pucks

**Branch `claude/day-window-compact`** (cut from `claude/inputs-sans-calendar`; not merged). Built and checked the night
of 9 Oct 26 while he slept (D708; unattended — D596, D667). Host and builder: Opus 5.5. Scenario design: Astra. Code
reads: Astra and Sol 6.1, each blind (D590).

## 0. Questions waiting for him

1. **A deleted man and the notes he was on.** Deleting a person takes him off every note from the delete's date on
   (and drops a note left with nothing on it). The list the delete shows of what it took away has no line for those
   notes — it never had one for the old rows of pucks either. *Should it? Recommended: yes, one line a note
   ("taken off the note 'Brief the new guys' on 14 Oct"), as its own small job.* Filed: `OUTSTANDING.md`
   `[DELETE-LIST-CAL-NOTES]`. Nothing waits on it.
2. **A note of words alone gets a third small button, "+"** (add people), beside its pencil and cross — the drawing
   showed a note that already had people. *Recommended: keep it; it is the only way to give a written note its
   people.* Nothing waits on it.

## 1. The tier, and what it meant

**Tier: FULL** — question 3 of the checking guide (saved data: what a note record is, and how an older one is read)
is YES for the note; the shorter card alone would be WALK (one card drawn by two days). One check for the batch (D485).
**So:** the rules sweep; Astra designs the scenarios; the roll-call; the door check; a walk sized below; the gates;
Astra's and Sol's reads of the code with this sheet; fixes; a re-walk of what the fixes touched; this sheet; his look.

## 2. The rulings that apply, each checked against the running build

| Ruling | What it says | Checked how | Result |
|---|---|---|---|
| D684 | a note carries its own pucks; "+ Pucks" goes | walk 1 (bar has "+ Note" only; the note's own "+") | PASS |
| D688 | compact — the inputs not pushed far down | walk 1: a note of words and five people 77 tall on a small phone; 4 of 4 inputs whole under it | PASS |
| D689 | a person is taken off as before — dragged off, or onto another to swap | walk 1, a real finger and a mouse; a right-click on a desktop | PASS |
| D690 | its own job, not inside the calendar job | its own branch; nothing merged (D708 starts it before that merge) | HELD |
| D692 | drawing A; the words line no taller than the typing box | walk 1: the words line 16 of letters in a 28 line | PASS |
| D694 | four pucks with even room either side | walk 1 and the browser test: 9 left, 8.5 right | PASS |
| D695 | a note may hold people and no words; the pencil adds words later | walk 1; `ui/inputsday.test.tsx` | PASS |
| D696, D699, D701 | the shorter card, drawing B, on both days | walk 1 and 2; browser tests | PASS |
| D629 | every input shows who placed it and when | the short form keeps the name, date and time; the full line is its title; the List, the editor, a Medical card and the viewer keep the full line (`placedshown.test.tsx`) | PASS |
| D648, D683, D707 | the day windows open tall on a phone | walk 2 (the SANS day) | PASS |
| D672 | Undo moves the screen only when the change is out of view | walk 2: Undo and Redo from another month — FAILED FIRST (Astra 2.5), fixed | PASS after fix |
| D148, D350 | Undo is the signed-in person's own | not changed by this work; the note's Undo and Redo walked | PASS |
| D56 | a problem only in stored demo data is not a finding | an old row of pucks loads as a note of people (`plan.test.ts`); an old EMPTY row draws nothing and is left | applied |
| D287, D297, D299 | a deleted man leaves days to come, keeps days he flew | `person-delete.test.ts`: a note's people, either saved shape; a note left with nothing is not kept | PASS |
| D337 | a delete lists what it took | NOT changed here — see question 1 | parked |
| 22–24 Aug 26 (his asks) | a removed puck leaves a gap; a swap; a batch from the picker | walk 1 and 2 | PASS |

## 3. The roll-call — every place a note or its people are drawn, moved, saved or told

| Place | Shows the new note | Its gestures work | Painted over / notes |
|---|---|---|---|
| The opened day (admin) | YES | YES — "+", pencil, cross, drag, right-click, handle | walked, phone and desktop |
| The opened day (member) | YES — words and pucks | NO, because members only read notes | walked: no button, no handle |
| The month's cell | YES — words chip and tiny pucks | YES — either drags the whole note | walked (2.10) |
| Guest | NO, because a guest has no Inputs calendar | — | not this change |
| The Medical tab's calendar | NO, because it draws no planning notes | — | Astra 1.5 |
| The Inputs List | NO, because it lists inputs, not notes | — | Astra 1.6 |
| Counts, search, filters | NO, because their scope is inputs | — | Astra 1.7 (a day of notes alone still says "no inputs") |
| Undo and Redo — the record | YES — the whole note is restored | — | walked (2.11, 2.5) |
| Undo and Redo — where the screen goes | was MISSING the month; FIXED | — | Astra 2.5; `undo-wire.test.ts` |
| The Undo label and the change history's words | YES — "a note on the calendar" | — | `describe.ts` |
| The changes window's readable lines | NO line for a note — as before this work | — | Astra 1.8; not widened here |
| Saved and reloaded | YES | — | walked: a reload, both walks |
| A saved week / a loaded version | NO, because notes are not part of a week | — | Astra 1.10 |
| Deleting a person | YES — taken off notes of either saved shape | — | `person-delete.test.ts`; its LIST has no line (question 1) |
| Archive, restore, post out, rename | NO change needed: a note holds the person's id | — | the id is stable; `puck()` draws an archived man |
| The Leave War, the bell, print, export | NO, because none reads a planning note | — | Astra 1.13–1.15 |
| Admin → "Clear" a period | YES — counts and clears whole notes | — | Astra 1.18; no `kind` is read |

**The small print and the card:** the Inputs day — CHANGED; the SANS day — CHANGED; a shared input's card — CHANGED
(its pucks come after the line; `sharedline.test.tsx`); the List, the editor's foot, a Medical card, the document
viewer — must NOT change, because D629's full line stays there: `placedshown.test.tsx` passes unchanged.

**The door check — the new gesture in both orders:** words then people (walk 1); people then words (the pencil on a
note of people — `inputsday.test.tsx`, walk 1 step 5 in reverse); by pointer and by keyboard (walk 2, 2.1).

## 4. Sizing the walk (D607)

- **The type of change:** a display-and-gesture change to one window (a note, a card), with a change to one saved
  record's meaning.
- **What only a walk could find here:** a control that is drawn but cannot be reached or pressed; a puck that lands
  in the wrong slot under a finger; a note that is not there after a reload; words printed over each other.
- **What the ledger says about walks of this type:** window-and-gesture changes have paid for a driven walk each time
  (the calendar job's own look found faults no test had); fan-out earned little on a single window.
- **The walk chosen:** the HOST's, by script, in two parts — 41 steps (a phone, a desktop, a member) and 25 steps
  (Astra's scenarios) — real controls, a real finger by touch events on the phone, pictures opened by the host. No
  helpers: one window, one builder's eyes are enough, and two reviewers read after.
- **Carried by a test, not walked:** the saved record's rules (`plan.test.ts` — calls the writers directly); the
  small print's every form (`placedline.test.ts` — a calculation); a deleted man (`person-delete.test.ts` — drives
  the delete command, not its screen: the delete's screen is unchanged).

## 5. The walk

**Part 1 — `scripts/handpass/note-pucks-walk.mjs`: 41 of 41** (after one fault of the walk's own: it began from the
memory-only boot, so its reload step could see nothing saved; it starts from saved storage now). Pictures
`docs/img/handpass/2026-10-09-note-pucks/`.
**Part 2 — `scripts/handpass/note-pucks-walk2.mjs`: 25 of 25.** Pictures `…/part2/`.

**What the walks and Astra's scenarios FOUND, each reproduced as a failing test before its fix:**

| # | Found by | What a person would have seen | Fix |
|---|---|---|---|
| F1 | Astra 2.1 | Typing a note's words and pressing Tab to reach "+ people" saved the words as a note and took the button away | the box and its button are one thing being made; `inputsday.test.tsx`, walk 2 |
| F2 | Astra 2.2 | With the people picker up for a new note, opening another note for its words made the new note take THAT note's words | the picker takes the new note's words when it opens, and shows them; `inputsday.test.tsx` |
| F3 | Astra 2.2 | Escape closed the picker without finishing the note; Cancel finished it | one ending for Escape, the cross and Cancel; walk 2 |
| F4 | Astra 2.5 | Undo of a note while another month showed: nothing visibly happened | the calendar turns to the note's month (D672); `undo-wire.test.ts`, walk 2 |
| F5 | the gates | an older test still expected "Placed by" on a shared input's card | the test now reads the short form and its title |
| F6 | the host's look at a picture (walk 2) | a long custom name on an "Other" input printed over the hours on its card | fixed on the CALENDAR branch (its fault; that sheet's §24) and merged in here |
| F7 | the host's look at a picture (walk 1) | the box a note is typed in was the browser's bare box | it wears the day title's look; 16 on a phone so an iPhone does not zoom |
| F8 | Sol's read, S1 | with the picker up for a new note, pressing another note's "+" (the keyboard could reach it) gave that note the people and lost the new note's words | one guarded opener; the keyboard stays in the picker; `inputsday.test.tsx`, walk 2 |
| F9 | Sol's read, S2 | closing the day with the picker up left the picker standing; its Cancel or OK then wrote a note onto a day no longer open | every day change settles the picker first, as Cancel does; `inputsday.test.tsx` |
| F10 | Sol's read, S3 | Undo of a note while ANOTHER day's window was open: the note came back behind that window | the window goes to the note's day (D672); `inputsday.test.tsx`, `undo-wire.test.ts`, walk 2 |
| F11 | Astra's read | a note from before a man was deleted, dragged to a later day, carried him onto a day after his delete (D299) | the move is refused, saying who and to take him off first; no writer adds a deleted man on or after his delete; `caldrag.test.tsx`, `plan.test.ts` |

**Astra's scenarios not turned into fixes, and why:** 2.3 / 4.1 the delete's list — question 1; 2.4 a shared card's
per-man LATE tag cannot be opened by a finger — the calendar job's, filed (`[CAL-CHECK-SEEN]`); 2.12 rename, archive,
post out — the note holds the stable id (roll-call); 2.13 two tabs of one browser — the standing limit of a store
with no server (`HANDOFF.md` §Standing constraints), the database step's lock (D355); 2.14 weeks, versions, Admin
clear — read: no path reads a note's old kind; 2.15 signing out with the picker up — the page is unmounted with its
picker; 4.3, 4.4 — the two mock-up pages now say what he decided.

## 6. The two reads of the code (each blind; their reports are kept beside the briefs)

- **Sol 6.1** (`docs/superpowers/briefs/2026-10-09-reads/day-window-code-sol.md`): three findings, all Medium, all
  reproduced as failing tests and fixed — F8, F9, F10 above. Nothing found in the saved-record writers, the old
  shapes, the short small print, or the card's layout rules.
- **Astra** (`…/day-window-code-astra.md`; her first run stopped — the model was at capacity — and was run again): one
  finding, Medium, reproduced and fixed — F11. She confirmed by her own check that deleting the last man of a note of
  people removes its SAVED row. Nothing found in the picker as fixed, Undo's landing, the small print, the layout.
- Neither read the other's report. The host reproduced every finding before changing anything (D588's rule for
  helpers, applied to readers).

## 7. The gates

*(the final run's counts)*

## 8. His look — sixty seconds on his iPhone, on this branch's preview link

1. Inputs calendar → tap a day → **"+ Note"**: type a few words, tap **"+ people"**, tick five, **Add**. One note: the
   words on one slim line, the five pucks four across under them, a dashed "+" last. *Is it as tight as you wanted?*
2. Drag one puck off the note — he goes, his place stays empty. Drag one onto another — they swap.
3. Tap the pencil, clear the words, Done — the note is its people alone. Tap the pencil again to give it words back.
4. Look at the inputs under it: a short remark and "Grit · 12 Jul, 14:42" share one line; the same on a SANS day.
5. **Seen and for you to judge:** a note of words alone has a small third button, "+", to add people (question 2 at
   the top); the pencil and cross are drawn small (28) on your word that the line be slim; under a long remark the
   small print wraps onto two lines when it also says who changed it.
