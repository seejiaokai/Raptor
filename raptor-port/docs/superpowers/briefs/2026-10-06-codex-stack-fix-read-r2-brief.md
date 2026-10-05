# The fix round, second read — one commit — 6 Oct 26

*(The same brief goes to Astra and to Sol 6.1, apart. Do not open the other reviewer's report: any file named
`2026-10-06-codex-stack-fix-read-r2-*.md` other than this brief. You may read your own first report and the other
reviewer's first report now — both are finished: `2026-10-06-codex-stack-fix-read-astra.md`, `-sol.md`.)*

**You did not write this code. Opus 5.5 did.** Work READ-ONLY: change nothing, run no build and no test suite. Your
final message is your report (at most about 900 words).

## What to read

Commit `a8355d98` on `claude/codex-stack-review` — `git show a8355d98`, code and tests. It answers the findings of the
two first reads of the fix round:

| Its name | The first reads' finding | What the commit did |
|---|---|---|
| RF1 | an unfinished flying line could still lend its wave's reporting clock to the span of other work | `engine/validate.ts workSpan`: an event counts only when both its ends are real numbers |
| RF2 | a question sheet took the keyboard once and let it go; the board's cancel-reason and Sort all dialogs were not counted as windows | `ui/sheetfocus.ts`: Tab and Shift+Tab stay inside the topmost sheet; `ui/pops.ts windowOverSchedule` asks the page for the two board dialogs; both dialogs use the hook (`ui/SchedBoard.tsx`) |
| RF3 | the Blue/Red answer path took words stored with a doubled space for a failed save | `ui/mission-role-offer.ts saveVisibleText` folds the stored words as the writer does |
| RF4 | the Choose / Change button vanished when he moved between two aircraft's Remarks of one formation | `ui/mission-role-offer.ts show`: the button is rebuilt on the box he is in |
| RF5 | a clock the app cannot read was told so only once a take-off existed | `engine/reporting.ts reportingIssuesForWave`: malformed-clock advisories without a take-off; order checks still wait for one |

## What to answer

1. For each of RF1–RF5: is the finding fixed, whole? Is it pinned by a test that would fail without the fix? Did the
   fix break anything the commit before it (`git show a8355d98^:<path>`) had right?
2. RF2 especially: can the keyboard still leave a sheet (a sheet with no enabled control; two sheets one over another;
   a sheet closed while another stays; the hook's listener left on the document after the last sheet has gone); can a
   sheet now TRAP someone (no way to close it by keyboard — Escape is each sheet's own, check it still reaches it); does
   pulling a Tab back into the sheet break any page behind it that has a focus trap of its own (the Leave War's sheets,
   the Tracker's dialogs)?
3. RF1: is there any event kind whose ends are legitimately not numbers (null, undefined) that the new line now drops
   or keeps wrongly? RF5: any line now told "no recognised clock" on a wave with no take-off that should stay quiet?
4. Anything in the first reads' findings that this commit did NOT address and should have.

The standing rules of the first brief hold: a claim is a finding only with a concrete failure a person can meet, its
cause (file and line) and its fix, step by step; explicit negatives for what you checked and found sound; do not
report harm that exists only in data already stored when the code is right going forward (the app's stored world is
demo data, cleared before the database step).
