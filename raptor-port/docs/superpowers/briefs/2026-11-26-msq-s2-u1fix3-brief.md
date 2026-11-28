# S2 step U1's third fix round — what the four reads of 7338bf1fc found (chat 205's brief, 26 Nov 26)

For one Fable builder (D2233). The orchestrator reviews your diff, runs your tests and commits; **you do not commit,
stage, push, build or take the checks lock.** Work only in
`C:/Users/User/projects/Raptor/.claude/worktrees/fable-read-faults-4104f0` (branch `claude/msq-s2-users-685735`).

## Read first

- `.claude/rules/raptor-executor.md`; `.claude/rules/decisions/people-accounts.md` (with the Read tool).
- The rule the code must keep: `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s2-u1-read-brief-3.md` (its rule
  paragraphs are the contract), and the second round's brief and report beside it (`…-u1fix2-brief.md`,
  `…-u1fix2-report.md` — its last section, "For the next builder in these tests", matters).
- The four readers' reports and proofs (outside the repo; every proof re-run by the orchestrator, failing as claimed):
  `C:/Users/User/AppData/Roaming/Claude/side-session-notes/local_eeb07289-ed8b-483b-8502-00962970c7d1/s2-chat205/fixread/`
  — `opus/report.md` (`zz-opus-proof-1`), `security/report.md` (`zz-security-proof-1`, probes `-probe-b`),
  `fable/` (`zz-fable-proof-0..3`, `trial-fixes.diff` — the reader's own trial of fixes 1–3, not typechecked;
  **no report file there: its findings are restated below**), `astra/report.md` (no finding).

## The verdict of the reads

All four: no route lets one squadron's admin see or change what the rule forbids; every write asks again. Astra: no
finding. What is left is four small faults, all in round 2's new behaviour. None is a wrong write to a man the admin
has no right over.

## What to build — four items, in `ui/UsersPanel.tsx` (and `ui/usersfilter-model.ts` only if item 4 needs it)

**1. The note when the app itself takes the Admin page away** (Opus 1 = Fable 1, medium; each proof mounts the whole
`<App />`). Hunter (142's admin, Plan of 149) has a row open on 149's Admin → Users with a rename typed; another admin
LOWERS his Plan of 149 to View; the same notify that moves his own pages to 142 lands him on View-only Sched
(`state/store.ts` — the core's, not yours), `ui/Shell.tsx` unmounts the Admin page, the row and the typing go, and
nothing is said. "Plan taken" already notes; "lowered" does not. Build: the page keeps the open row in a ref and, at
the moment it is unmounted, judges once — the row changed and he did not pick → the existing note, once. **It must
stay silent for every way HE leaves** (settled with the core's chat 204): the Admin tab left by his own press; Logout;
the switch to the member view; his own pick; a row already closed. The Fable reader's trial does it with
`rowChanged && !closedByHisPick && isAdmin() && not deleted` — check each of those leavings with a test, do not trust
the reading. Strict mode: once. **Do not edit `state/store.ts`, `state/perms.ts`, `state/typing-hold.ts`,
`state/pick.ts`, `ui/Shell.tsx`.** Not built, the owner's to rule later: the signed-in admin made a member by another
admin while his row is open (the Admin page goes, nothing is said) — pin it as built today.

**2. A pick put back by hand is let go** (security 1). On the short row, pressing View and then the line the man
holds again leaves `picked` set; when another admin then changes his line, the row turns into a pending change back
and its Save undoes the other admin's act — at worst gives back a Plan lowered on purpose. Fix as the security report
gives it: pressing the line he holds at that moment lets the pick go (`setPicked(v === lineNow ? null : v)`); both
proof cases as lasting tests.

**3. No note about a row that is not on the page** (Fable 2). An open row hidden by his own search, a filter tick or
the shut Archived fold keeps `editing` set (older than this step — leave that); when it then changes under him the
page says the note about a row he put away, perhaps hours later. Build: the row still closes; the note is raised only
if the row was drawn at the last draw. The reader's trial reads a ref during the draw — use whatever form the code
check accepts (a state value if need be), and say which.

**4. A Plan holder's open short row that leaves the list is closed with the note — never left held, never back open
with no press** (Fable 3). A man listed on a squadron's page only because he plans it drops off the list when that
Plan goes (another admin's change, or the signed-in admin's own Undo of giving it); today the open row is simply not
drawn while the page goes on holding it, the admin's pick is lost without a word, and a later search draws his row
open with no press. **The orchestrator's call: the reader's fix B, not A** (A keeps him listed while his row is open —
a change to what the list shows, not ours to make): where the open row was drawn at the last draw and is not drawn
now, and the page's own search, ticks and folds are what they were at the last draw (so it was not the admin who put
it away), the row closes with the note. Where the admin himself put it away (he changed the search, a tick or a
fold), today's behaviour stays — the row is held, no note (item 3). Both of proof 3's cases become lasting tests,
re-pointed to this: the row closes, the note once, and a later search shows his row closed. The rule's sentence "the
row follows the line and stays open" is narrowed to "while he stays on the page's list".

**Kept exactly:** everything round 2 built; a row's own writes raise no note; a View-only pick leaves the row open;
no loop; one note; a deleted man: no note; no new words anywhere (if you need any, stop and say so).

## Tests first — each proof seen failing on today's code before the app changes

Lasting tests of: Opus 1 with Fable 1 (one case, both named; whole-app, and under StrictMode), and one test for each
leaving that must stay silent (his own tab press, Logout, the member view, his own pick) plus the "made a member" pin;
security 1's two cases; Fable 2's two cases and its control; Fable 3's two cases re-pointed; Fable's proof 0 (15
soundness tests) where the step's tests do not already hold the same thing. Home: `src/ui/msq-s2-rejudge2.test.tsx`,
or a third file `src/ui/msq-s2-rejudge3.test.tsx` for the whole-app tests (they need `<App />` — see how
`src/ui/msq-guard-open.test.tsx` mounts it). `asOther` for another admin's write. Plain-word names; no `zz-` names in
the repo; never weaken a test; a round-2 test the narrowed rule changes is re-pointed by name and listed. **Round 2's
three §10 tests of "the squadron in view held again" cover a state the app cannot reach today (a View-only pick takes
the Admin page away): keep them, and say so in the file's header.**

## Checks you run (no lock — one file at a time; never the full suite, never `npm run build`)

From `raptor-port/`: `npx vitest run <file>` for the three or four `msq-s2-rej*` files, `msq-s2-row`, `msq-s2-asis`,
`msq-users-row`, `msq-s2-lists`, `msq-users-filter`, `msq-guard-open`, `msq-guard-g`, `onedoor-users`, `accounts-ui`,
and every other file that draws `UsersPanel` or `<App />` with the Admin page. `npx tsc -p tsconfig.app.json --noEmit`
(supporting only).

## Report

Your file tool may decline a report file: do not go round that — put the whole report in your final reply. It says:
what changed, item by item; each reader's case — failed before (on which line), passes after; tests added, merged or
re-pointed, by name; files run with counts; item 3's form; anything a person would SEE differently; anything unclear
and what you chose. End with a ten-line summary.
