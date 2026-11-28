# Fix brief — three repeats from the fix rounds' read: a squadron he only views (RAPTOR), 23 Nov 26

**Why you (Fable):** his D2233 — in the multi-squadron build, a fault that repeats one an earlier fix was meant to close
(the same harm, narrowed or come back) is fixed by Fable. All three below are repeats, judged by the host when it
reproduced them. His D2385 gives Fable's last allowance to this check.

**The copy:** `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135` (head as you find it). Work there.
Do not open `HANDOFF.md`, `raptor-port/docs/handpass/` or the walk's reports. You may read the readers' reports
`raptor-port/docs/superpowers/briefs/2026-11-23-msq-view-only-fixread-astra.md` and `-fixread-opus.md`, and the earlier
`-read-opus.md`, `-read-fable.md` (what the fixes were meant to close).

**The rulings:** read the full rows first — `grep -h '^| D2381 \|^| D2323 \|^| D2243 \|^| D2384 |' .claude/decisions-full/*.md`
(run each number separately if that pattern finds nothing) — and `.claude/rules/decisions/people-accounts.md`.
- D2381: with a squadron he only views picked, its View-only Sched and Help alone are offered; the app lands him there.
- D2323: a Leave War or Input window left open when another squadron is picked reads "This is 142's. You picked 149 —
  close this to go on.", its controls greyed, Close and ✕ live.
- D2384: inside ☰ the squadron list opens under the mark; a first tap outside closes only the list.

**The three faults (each reproduced by the host; the failing tests are in the session scratchpad
`C:\Users\User\AppData\Local\Temp\claude\37df10f156419f1e\82e0189b-7f91-416c-9c63-775ed6224773\scratchpad\rt\`, run with
`npx vitest run --config <that folder>/vitest.scratch.config.ts <that folder>/<file>` from `raptor-port`):**

1. **The landing never runs when a View holder closes his Leave War window** (repeat of the earlier Opus F1, the landing
   against an open Leave War window). Hunter, 142's admin with View of 149, on his Leave War with a bid window open, picks
   149 → the page is held (right); he closes the window by its ✕ → he stays on the Leave War with 149 in view, only
   View-only Sched and Help offered. Should land on 149's View-only Sched at the close. The readers' cause: `state/store.ts`
   warHeld / landOnOfferedPage wait for the close to notify, but `state/typing-hold.ts` warWindowGone returns early unless a
   band is up, and for a View holder none is. Test: `f1-war-landing.scratch.test.tsx`; Astra gave the same with Ranger.
2. **A View holder's input window comes over View-only Sched live** (repeat of the earlier Fable 1, an input window left
   open through the landing came back editable — now for a View holder, and brought by that fix). Hunter, View of 149, a
   saved input's window open on his Inputs, picks 149 → the page lands on View-only Sched, the window with it, no band,
   nothing greyed, Save and Delete live. Before the Fable-1 fix it was held with the pick's band. Should: held (D2323), as
   the Plan holder's case in the member view is held now — keep that case passing. Test:
   `f2-input-window.scratch.test.tsx`.
3. **One slow press on the shade closes both the list and the ☰ menu** (repeat of the earlier Opus F2 / Astra 2). Open ☰,
   open its squadron list, press the shade and hold about a second before letting go → both close. Should: only the list.
   The cause: `ui/Drawer.tsx` listJustClosed allows 700 ms. Fix by the press itself, not a time allowance. Test:
   `a2-slow-press.scratch.test.tsx`.

**How:** red first — move each scratch test into the repo's own test files (`ui/msq-view-only-menu.test.tsx`,
`ui/msq-pick-windows.test.tsx`, or the Leave War window tests the readers name), see each fail on today's code, then fix
where the fault comes from, and look for each fix's twins (the top bar's list as well as ☰; a pick as well as the
member-view switch; a Plan holder as well as a View holder; the war window closed by each of its ways). Run only the test
files you touch and the existing tests of the files you change, one file per `npx vitest run <file>` call — never the
whole suite, never a build or a browser test (another chat holds the PC's checks lock). Then `npx tsc -b` in
`raptor-port` if the guard lets it run; if refused, say so. Commit on the branch with a plain message ending
`Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>`; do not push.

**Your reply:** for each fault, the cause you found, what you changed (file and function), the tests (red first, then
green), any twin you found and fixed, and anything you were unsure of. Plain and short.
