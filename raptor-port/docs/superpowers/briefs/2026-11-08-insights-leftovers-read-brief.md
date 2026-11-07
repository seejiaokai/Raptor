# Brief — the blind code read of job 6, Insights and the last small ones (8 Nov 26)

**You are one of two readers, each blind to the other (Astra, and a fresh Opus reader — D790, D1743).** Do not open,
search for or read any file named `*insights-leftovers-read-opus*` or `*insights-leftovers-read-astra*`, and do not read
the evidence sheet `raptor-port/docs/handpass/2026-11-08-insights-leftovers.md` (the walk's report). Read only; change
no file; commit nothing.

**What the job is** (the backlog item `[STACK-LEFTOVERS]` in `OUTSTANDING.md`, its points (1) and (2); the sized plan
`raptor-port/docs/superpowers/plans/2026-11-05-backlog-sizing.md` job 6). Nothing a person sees was meant to change.

1. **Two edges of the Insights Blue/Red question never tried** (the Opus interim read of 3 Oct 26,
   `raptor-port/docs/handpass/2026-10-03-insights-mission-mix-opus-interim.md`, "Unverified remainder"):
   (a) on a PUBLISHED day, "Choose mission role" pressed while typing in the Remarks box is still unsaved. The press saves
   the typing through the box's own door and keeps the caret in the box, and the week's ordinary repaint waits while a
   caret is in a box. Does the day's "N pending" chip (the way into the list of changes to go out) — and the board's
   "Not yet signed" mark — count the saved typing at once, or wait for the next action?
   (b) the week's Templates button while a saved plan is being looked at. If it could be pressed then, a template carrying
   Blue/Red answers would be refused whole and silently (`src/state/mission-roles.ts` `copyMissionRoles` refuses unless
   the face shown is the working copy).
   **What was done:** both were tried by tests (`src/ui/insights-leftovers.test.tsx`) and found not to be faults, so no
   app code changed for them: (a) the chip and the mark count it at once; (b) on Edit Schedule a saved plan is never
   looked at — the plans menu switches to it; what Edit Schedule looks at is a published day's issued version, drawn
   read-only with no Templates, and a template is refused on a published day anyway (D96); View-only Sched, where a saved
   plan can be looked at, draws no Templates, and the look is dropped on the way to Edit Schedule.
2. **One shared wording helper** (D489's tidiness note): the change history's line and Undo's words for a Blue/Red answer
   each worked out the line's name and the side's word by themselves. Now both read `roleAnswerName` and `roleSideWord`
   (`src/engine/mission-role.ts`), from `src/state/changelines.ts` and `src/undo/describe.ts`. The words must be exactly
   as before.
3. **React Doctor's three findings in these files** (D1534 — a finding is fixed, or kept with its reason in a disable
   comment on the line above): `src/engine/mission-role.ts` (an unchecked parse of a string the resolver had just built —
   fixed by reading the two parts before they are written as the string); `src/state/mission-roles.ts` (a JSON clone —
   kept, with its reason); `src/ui/mission-role-offer.ts` (a list look-up inside a loop — kept, with its reason).

**The change:** `git diff origin/main...HEAD -- raptor-port/src raptor-port/scripts/handpass/insights-leftovers-look.mjs`
on the branch `claude/insights-leftovers`. Rulings that bind it (one line each in `.claude/rules/decisions/scheduler.md`;
a full row: `grep -h '^| D529 |' .claude/decisions-full/*.md`, with the shell — a search tool may hide a long row):
D96, D489, D529, D530, D535, D598, D599, D1534; the saved context format is v1 (the head of `src/engine/mission-role.ts`).

**The questions — ask what is MISSING, not only whether what is there is right:**

- **The wording helper.** For every input either old body accepted — a detail string or none, a name with odd spaces,
  over 80 letters, not a string, a detail that is not JSON, a side that is `'blue'`, `'red'`, missing or something else —
  do the history line (`from`, `to`, the label) and Undo's words come out byte for byte as before? Is any other place
  still working out the same wording by itself (search the code, not this brief)? Does the new import into
  `src/undo/describe.ts` or `src/state/changelines.ts` make a loop of imports, or pull anything heavy into a chunk that
  did not have it?
- **The context refactor.** Is the string `missionContext` returns, and the `context` `resolveMissionRole` returns,
  byte for byte the same for every formation (saved format v1 — role ids are built from it)? Any path where the old
  parse-back gave a different mission or clause list than the parts now do?
- **The edges.** Do the tests prove what the brief says, through the routes a person uses (the real box, the real
  button), or could they pass while the app is wrong? Is there a route the tests miss — a phone week, the board's own
  Remarks box, the next-week peek, keyboard opening of the plans menu, a stale Templates button left on screen, an
  undo or redo while a look is open, a look kept on the board after the week drops it — where (a) would wait or (b)
  could be pressed? If you find one, give the steps.
- **The two kept findings.** Are the disable comments' reasons true of the code (is the list really one or two? would
  a structuredClone really differ from the saved copy)? Is either one better fixed than kept?
- **The walk script** (`raptor-port/scripts/handpass/insights-leftovers-look.mjs`): does any check pass while proving
  nothing (an absence judged before the slowest route to presence; a word read from a hidden copy)?

**Not a finding:** a problem that lives only in data already stored, when the code is already correct going forward
(D56 — the whole store is demo data, cleared before the database step); wording you would merely prefer; anything
outside these files that this change does not make worse. **A finding is a claim with a concrete failure** (what a
person would see go wrong, or what would break), **its cause and its fix** — exact code where you can (D489).

**Report:** the findings, each ranked high / medium / low, with file, line and the fix; then what you checked and found
nothing in. Plain prose, no preamble.
