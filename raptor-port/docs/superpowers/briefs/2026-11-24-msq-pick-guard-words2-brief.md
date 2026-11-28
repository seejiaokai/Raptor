# [MSQ-PICK-GUARD] the words still to settle before the build — a fresh Fable's review (D2441; chat 171, 24 Nov 26)

You review and adjust words a person will read in the RAPTOR app. Read-only: change no file in the repo. You are a
fresh reader: the drafts below are the builder's (ruled drafts R, and new drafts N the build needs); adjust each, or
say it stands, with one line of why. The owner is not technical; he reads every word on an iPhone and a desk screen.

**The repo:** `C:\Users\User\projects\Raptor-msq` (branch `claude/msq-b1-screens-135`) — read only from there, never
from `C:\Users\User\projects\Raptor`.

## Read first

- His rulings' full rows (the shell's grep; each row is one long line):
  `grep -h '^| D2590 |' .claude/decisions-full/*.md .claude/rules/decisions/*.md` — and D2403, D2405, D2591, D2592,
  D2593, D2594, D2595, D1622, D1667, D1668, D1669, D2389, D148, D350, D2402, D970.
- The first words review of this job, whose choices stand and set the style ("the open window", never naming it; no
  "first" where "then" gives the order): `raptor-port/docs/superpowers/briefs/2026-11-24-msq-pick-guard-words-fable.md`.
- The page he answered: `raptor-port/docs/mock/2026-11-24-msq-pick-guard/page.html` (questions 3 to 6), and the
  drawings `raptor-port/docs/mock/2026-11-24-msq-pick-guard/drawn/p1b-d-after-crop.png`, `p4b-d-after-crop.png`,
  `p3-p-after-crop.png`.
- The writing rules for app words: `raptor-port/docs/design-practices.md` — search it for its wording section (the
  three tests for text, and how a refusal, a question and a button are worded); and `.claude/rules/decisions/design.md`.
- The words the app has today, to match: the Input window's own question, `raptor-port/src/ui/InputWindow.tsx` —
  "This input has unsaved changes. Close it and lose them?" with "Discard and close" · "Keep editing"; the Tracker's,
  `raptor-port/src/tracker/app/core.js` — "You have unsaved chart edits on “2026”. Save them before logging out?" with
  "Save them" · "Discard them" · "Stay"; the failed-save band, `raptor-port/src/ui/SaveStatus.tsx` — "Not saved — keep
  this page open" with Retry; the Undo button's words, `raptor-port/src/ui/topstate.ts` (`undoTitle`, `redoTitle`) and
  `raptor-port/src/undo/describe.ts`.

## Rules that bind every draft

- A refusal of one change opens "Blocked:" in the grey note (D1667, D1668). "Not saved" is the failed-save band's alone
  and appears in no other note (D2594). Squadrons are bare numbers (142, 149).
- OIL is the app's word, never "earned leave". No word a programmer would use.
- The refusal note passes in a few seconds; a question stays until answered.

## The drafts

**R1 (D2593, the ruled draft) — the greyed Undo's reason**, shown where the Undo button says why it is greyed, when he
has made no change on the squadron in view but has on another: "Your 142 changes are on 142's Undo."
- N1a — the same for Redo, when steps he undid on 142 wait there: "Your undone 142 changes are on 142's Redo."
- N1b — when his steps are on two other squadrons (a master admin on 150 with steps on 142 and 149): "Your 142 and 149
  changes are on their own Undo."
- Say whether the lit Undo's words need the squadron at all now that Undo reaches only the squadron in view (the
  builder's reading: no — "Undo — Drifter's OL" stands as it is).

**R2 (D2594, the ruled draft) — Logout pressed while a change is not saved** (the "Not saved" band with Retry is up):
"This change isn't saved. Log out and lose it?"
- N2a — its buttons: "Log out and lose it" · "Stay". (The Tracker's question uses "Stay"; the Input window's "Keep
  editing".)
- N2b — more than one change waiting: "These changes aren't saved. Log out and lose them?"

**R3 (D2595, the ruled draft) — a pick with an opened Admin → Users row holding typing:** "Blocked: close the open row,
then pick 149."
- N3a — the view switch: "Blocked: close the open row, then switch to the member view." / "…then switch back to the
  admin view."
- N3b — a bell line to another squadron: "Blocked: close the open row, then press this line again."
- Say whether "close the open row" tells him how: the row closes by a tap on its name line, and has Save and Cancel
  where it has changes (open `raptor-port/src/ui/UsersPanel.tsx` to see what the row offers).

**N4 (D2594, new) — a pick, the view switch or a bell line while a change is not saved:** the ruling asks for "the grey
note asking for Retry first and never using the band's words "Not saved"".
- "Blocked: press Retry to save your change, then pick 149."
- "Blocked: press Retry to save your change, then switch to the member view." / "…then switch back to the admin view."
- "Blocked: press Retry to save your change, then press this line again."

**N5 (the builder's reading of D2592 with D2595, new) — Logout pressed with an opened Admin → Users row holding
typing:** a question in the look of R2, since Logout is never refused: "This row has unsaved changes. Log out and lose
them?" with R2's buttons.

**N6 (D2592) — Logout pressed with an Input window open that holds unsaved changes:** the ruling has Logout ask the
window's own question, "This input has unsaved changes. Close it and lose them?" ("Discard and close" · "Keep
editing"), then go on to log out. Say whether those words, unchanged, tell a man who pressed Logout what "Discard and
close" will now do; if not, give the least change that does (the ruling names the question, so a change of its words
at Logout is the owner's to approve — mark it so).

**N7 (D2403, T1's twin) — the Tracker's question at the switch back to the admin view:** "You have unsaved chart edits
on “2026”. Save them before switching back to the admin view?" — Stay · Discard them · Save them.

## Give back

For each of R1–R3 and N1a–N7: the words as you would ship them, and one line of why if changed. Then: any other words
this job puts on screen that the list misses (search the rulings above for a note, a question or a button with no words
yet); and any draft that breaks a ruling, with the ruling's number.

**Write your whole report to this file** (create it early, append as you go):
`C:\Users\User\AppData\Local\Temp\claude\37df10f156419f1e\bec345f1-587c-4cb1-9ff7-cd39018a3987\scratchpad\words\words2-fable.md`
Your final message: the file's path and three lines on what you changed.
