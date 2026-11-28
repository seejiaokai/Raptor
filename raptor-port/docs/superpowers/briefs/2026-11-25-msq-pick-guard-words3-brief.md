# [MSQ-PICK-GUARD] the new words of the second questions page — a fresh Fable's review (D2441; chat 175, 25 Nov 26)

You are a fresh Fable helper reviewing and adjusting DRAFT words before the owner (not technical; he reads on an
iPhone) sees them on a questions page. Nothing is built from your answer until he approves it (his D2611: a note is
never worded on the agent's own reading — each goes to him with a worked example). READ ONLY: change no file in the
repo; commit nothing. Work in `C:\Users\User\projects\Raptor-msq` (branch `claude/msq-b1-screens-135`) by full path.

## Read first

- The writing guide: `raptor-port/docs/design-practices.md` §1, §1a, §1b (whole); `raptor-port/docs/word-list.md`;
  `.claude/rules/decisions/design.md` (§Menus, the keyboard and questions; §Saving; the passing note).
- The rulings' full rows (the shell): `grep -h '^| D2590 |' .claude/decisions-full/*.md` — likewise D2591–D2595,
  D2403, D2405, D1622, D1667, D1668, D1669, D2322, D148, D350.
- The second words review, whose words stand and are the family yours must match:
  `raptor-port/docs/superpowers/briefs/2026-11-24-msq-pick-guard-words2-fable.md` (R1, R3, N3a, N3b, N4, N5, N6).
- What today's app does in each case below — the pressers' reports of tonight, facts only:
  `…/briefs/2026-11-25-msq-pick-guard-q2-press-p1.md`, `-p2.md`, `-p3.md`, `-p4.md`, and the drawer's,
  `…-q2-draw-report.md` (its pictures: `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q2/drawn/` — open d3c, d4d,
  d1a, d6b).
- Today's words in code where a draft touches them: `raptor-port/src/ui/UsersPanel.tsx`, `ui/SquadronsPanel.tsx`
  (the forms' own button words), `ui/topstate.ts`, `ui/WelcomeBack.tsx`, `undo/timeline.ts`.

## The drafts (the host's, a Fable; each with its case)

- **W1 — a tap on the bell itself that is refused.** Saber on 142 has an Input window open; his bell is lit by "1
  waiting for access to 149"; he taps the bell. Today that tap enters 149 at once. After: refused, the note under the
  bell. Draft: "Blocked: close the open window, then press the bell again." (and with a row open or a change not
  saved: "Blocked: save or cancel the open row, then press the bell again." / "Blocked: press Retry to save your
  changes, then press the bell again.")
- **W2 — Admin → Users beyond an opened row with typing.** Tonight's facts (P2 §1): a row's changed Role is silently
  put back at a pick; "Give access" and "+ New squadron" keep their typing through a pick; "Add a person" keeps its
  typing and its Home squadron silently becomes 149; all are lost at the member-view switch; a row left open under
  another Admin section keeps its typing out of sight. The host recommends that all of these count for the guard.
  Two drafts — say which you would ship and why, or a third:
  (A) one sentence for every case on that page: "Blocked: save or cancel your changes on Users, then pick 149."
  (B) R3 as it stands for a row ("…save or cancel the open row…"; out of sight: "…the open row on Users…"), and a
  noun for each form: "Blocked: finish or cancel Add a person, then pick 149." / "…Give access…" / "…the new
  squadron…". Check each form's own buttons in the code before a verb is chosen.
- **W3 — a window left open on a page he is no longer looking at.** Saber opens My leave on the Leave War, presses
  the Inputs tab (the window is still open, out of sight), picks 149. Draft: "Blocked: close the open window on Leave
  War, then pick 149." (the Tracker: "…on the Tracker…").
- **W4 — a press that is not a bell line and would bring his own squadron back, while a change is not saved.**
  Ranger views 149; a save has failed; he presses "Check my quals" on the welcome-back card. Draft: "Blocked: press
  Retry to save your changes, then try again."
- **W5 — Logout over a window with typing and no question of its own** (words2's "what the list misses" 1). Case:
  Inputs settings → Calendar → Add a holiday with a name typed (three windows open, one holds the typing), Logout
  pressed. Draft: "This window has unsaved changes. Log out and lose them?" — "Discard and log out" · "Keep editing".
  The drawer's doubt: with three windows open, "This window" does not say which.
- **W6 — the refresh card read after the day of the move.** D2591's words: title "You are 149's from today"; body
  "Your move to 149 took effect at midnight. Refresh and sign in again to carry on. Anything you hadn't saved is
  lost." If the app was left open and he reads the card two days later, "from today" and "at midnight" are untrue.
  Draft for every day: title "You are 149's now"; body "Your move to 149 took effect on Thu 16 Jul. Refresh and sign
  in again to carry on. Anything you hadn't saved is lost." — or keep D2591's words on the day itself and these
  after it. Say which.
- **W7 — the greyed Undo's reason on a phone.** A greyed button has no hover on an iPhone (the drawer's d6b; P4
  §1d: a tap and a long press show nothing). The host recommends: a tap on the greyed Undo or Redo on a phone shows
  its reason as a passing note at the foot. Draft: the same sentence, "Pick 142 to undo your changes there." — with
  or without "Blocked:"? (D1667, D1668: the grey "Blocked:" note is for a refusal of one change.)
- **W8 — the button of the Logout question where nothing is lost** (words2's R2, first answer): "Your last changes
  aren't saved yet. Log out anyway?" — "Log out" · "Stay". The drawer drew "Log out" as a plain button, not red.
  Right?

## Your answer

For each of W1–W8: **Ship:** the exact words (a real number in every slot); why, in two lines, by the guide's tests;
any ruling a draft would break; any fact you doubt (it goes back to the host, not reworded around). Then: anything
these cases put on screen that has no words yet. Under 900 words. Write it to
`C:\Users\User\AppData\Local\Temp\claude\e2bface01731fdd2\3f35f52f-80e8-41e0-a951-e8a0fa3cf3ab\scratchpad\n175\words3.md`
AND give the same text as your final message.
