# The OIL award editor's click outside — the code read (chat 104, 17 Nov 26)

Sent word for word to Astra (`codex exec`, reasoning high, read-only) and to a fresh, blind Opus reader. Neither is given
the walk's results, the evidence sheet or the other's report (the bug-check order §4, D790).

## The brief, as sent

You are one of two independent readers of a small, finished change. Repo: `C:\Users\User\projects\Raptor-lw4`, branch
`claude/lw-four-items`. Read-only: change no file, run no build, no browser test, no commit, no branch switch. Do not
read `HANDOFF.md`, the evidence sheets under `raptor-port/docs/handpass/` or any other reader's report.

**The change:** `git show 30e4e1162 -- raptor-port/src raptor-port/e2e/leavewar.spec.ts` — in
`raptor-port/src/leavewar/ui/OilTracker.tsx` (the OIL tracker, an admin's list of each person's OIL credits; OIL is time
off banked, never pay). Tapping an award in a person's row opens an editing box in place (amount, AM / PM for a half
day, reason, given-by, Save / Cancel / Delete — Delete asks "Really delete?" on its first press); a correction (a
negative entry) opens a smaller editor with a date box that opens the app's floating calendar.

**What the owner ruled** (full rows: `grep -h '^| D2173 \|^| D2174 \|^| D2175 ' .claude/decisions-full/*.md`; the Leave War
page `.claude/rules/decisions/leave-war.md`):
- D2173: a click or tap outside the editor closes it, as Cancel does.
- D2174: with an unsaved change it stays open — nothing lost, nothing saved by a stray click; with nothing changed it
  closes. Save and Cancel still finish it.
- D2175: zoomed in on a phone, the editor's Delete is reached by sliding the list sideways — so a slide must not count
  as a click outside.
- The builder's own reading, not ruled by him: with an unsaved change, a tap on ANOTHER award does not swap the editor
  to that award (the change would be dropped); nothing happens.

**Answer, as findings:** what is MISSING or WRONG against those rulings — every way a person can end up with a change
lost, a change saved they did not mean, an editor that will not close, or one that closes when it should not. Think of:
the phone (a touch tap, a slide that starts outside the editor, a pinch) and the desktop (a mouse click, a drag that
starts inside an input and ends outside, a text selection, the wheel); the correction editor and its floating calendar;
the half-day AM / PM pick on an award made half a day (its shown default versus a stored half); an amount typed as
"2.0" or emptied; Delete armed; a refused save (its warning shown); the credit bar that a tap on a person's name opens
(it has its own close-on-outside-press rule); the tracker's own close button and its other controls; the keyboard
(Enter on an award, Tab); a member, who cannot edit; the Leave War leaving the screen and coming back with an editor
open. For each new browser test: does each check fail on the fault it names and pass on correct code, and can it pass or
fail by timing alone.

**What is NOT a finding:** a problem that lives only in data already stored (all of it is demo data, cleared before the
database step); style or naming; anything outside this change unless the change breaks it; anything for a scheduler who
is not an admin (a scheduler is always an admin).

Each finding: the concrete failure (the steps a person takes and what they see), its cause in the code, and the exact
fix. Rank by severity. If you find nothing, say so plainly. Under 600 words.
