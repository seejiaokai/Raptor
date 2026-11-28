# Fix brief — a held input window comes back live after an Undo (RAPTOR), 23 Nov 26

**Why you (Fable):** his D2233 — a fault that repeats one an earlier fix was meant to close is fixed by Fable. This is the
third time an input window held at a pick has come back live (the earlier Fable 1, then the View holder's case fixed in
`e9791020e`); judged a repeat by the host when it reproduced it. His D2385 gives Fable's last allowance to this check.

**The copy:** `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135` (head as you find it). Work there. Do
not open `HANDOFF.md`, `raptor-port/docs/handpass/` or the walk's reports. You may read
`raptor-port/docs/superpowers/briefs/2026-11-23-msq-view-only-fix5-brief.md` (your last brief), the second round's read
brief `-fixread2-brief.md` and its reports `-fixread2-astra.md`; the fresh Opus reader's report is summarised below.

**The fault (the fresh Opus reader of `e9791020e`; reproduced by the host):** `ui/InputWindow.tsx` InputEditor takes its
"opened on" note afresh whenever the window's record becomes a new object (`openedOn.r !== r`). An Undo, or a refused
command, puts the record back as a new object and the record-follow step swaps it in; the fresh note reads the squadron in
view now and whether the page is offered now — so both the squadron hold and `e9791020e`'s "page not offered" hold are
forgotten.
- Steps: Hunter, 142's admin with Plan of 149, on his Inputs changes an input's remarks, saves, opens it again; picks 149
  (Full access) from the top bar or ☰ → the window is held ("This is 142's. You picked 149 — close this to go on.",
  greyed; the page stays Inputs, which 149 offers him, so the top bar's Undo shows); presses Undo → the band goes, Save and
  the rest live again over 149's Inputs. Should: held until Close or ✕, or 142 picked again (D2323).
- The View holder's form (Hunter with View of 149, the window held over View-only Sched): the record put back as a new
  object (`INPUTS[0] = { ...INPUTS[0] }; notify()`) loses the hold too — no button reaches it there (View-only Sched has no
  Undo), but the same cause.
- The reader's suggested fix: keep the note as long as the window shows the same input, judged by its id (`iid`), not by
  object; take it afresh only when a different input is opened or the window closes.
- Failing tests (the session scratchpad, `...\scratchpad\rt\o3-undo-held.scratch.test.tsx` and
  `o3b-view-held.scratch.test.tsx`, run from `raptor-port` with
  `npx vitest run --config <scratchpad>/rt/vitest.scratch.config.ts <scratchpad>/rt/<file>`; the scratchpad is
  `C:\Users\User\AppData\Local\Temp\claude\37df10f156419f1e\82e0189b-7f91-416c-9c63-775ed6224773\scratchpad`).

**How:** red first — move both tests into `src/ui/msq-pick-windows.test.tsx`, see them fail, fix where the fault comes
from. Twins to check: the same follow-a-new-object path in the Leave War windows (`leavewar/ui/Sheet.tsx` and the windows
it frames) and the other windows that keep an "opened on" note; a Redo as well as an Undo; a different input opened in
the same window must still take a fresh note. Keep every existing test of the files you change passing. Run only the test
files you touch and the existing tests of the files you change, one file per `npx vitest run <file>` call — never the whole
suite, never a build or a browser test. Then `npx tsc -b` in `raptor-port`. Commit on the branch with a plain message ending
`Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>`; do not push.

**Your reply:** the cause you found, what you changed (file and function), the tests (red first, then green), any twin you
found and fixed, anything you were unsure of. Plain and short.
