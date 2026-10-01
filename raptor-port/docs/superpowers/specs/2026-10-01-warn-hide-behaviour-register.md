# Behaviour register — `[WARN-HIDE-KEPT]` hidden warnings (1 Oct 26)

One line per rule the build obeys, in the app's words, with its ruling and the test that names it. `npm run rulecheck`
fails when a line here has no test naming its id (`raptor-port/scripts/rulecheck.mjs`). Plan:
`docs/superpowers/plans/2026-10-01-warn-hide-kept-plan.md`; the approved picture `docs/mock/warn-hide.html` (D475); the
screen contract `docs/ui-contracts.md` §Muting a check, and resizing the checks panel ("Hide a specific warning").

| Id | The rule | Ruling | Named by |
|---|---|---|---|
| WH1 | A hidden warning is kept with its day: a reload reads it back for the week the app opens on, and the next edit of that day does not erase it from storage | D469 | `state/warnhide-kept.test.ts` |
| WH2 | It is hidden for everyone: a sign-out and a sign-in, the same scheduler or a member after him, do not bring it back | D469 | `state/warnhide-kept.test.ts`, `state/view-reset.test.ts` |
| WH3 | While it is hidden the pucks carry no flag for that item — no ring, chip, dashed ring, dotted next-day mark, nor the amber time box of a nought-minute line; a man with two warnings keeps the flag of the one still showing; a warning naming several men drops every chip it raised | D469, D475 | `engine/warnhide.test.ts`, `ui/fltnolen-mark.test.tsx` |
| WH4 | Its line stays where it is in the day's list — Edit Schedule and the board, one set of hides for both — struck out and darker, its ✕ become ↺; no "N hidden" fold | D469, D475, 29 Aug 26 | `ui/warnmute-week.test.ts` |
| WH5 | It is not counted: the day's "N issues", its "N warning" and the bar's colour read what is shown, and the count line says nothing about a hidden one; the ⓘ popup and Insights count the same way | D472 | `ui/warnmute-week.test.ts` |
| WH6 | With every issue of a day hidden the bar stays, quiet, reading "✓ No issues", and opens the list; the board's heading reads "No conflicts flagged" with the struck lines under it | D475 | `ui/warnmute-week.test.ts` |
| WH7 | View-only Sched and a look at a version draw the hidden line struck, with no button; a look shows the hides the VERSION went out with, never the working copy's | D475, D187, D471 | `ui/warnmute-week.test.ts`, `ui/latepub.test.tsx`, `state/warnhide-published.test.ts` |
| WH8 | On a day already published a hide waits for the next amendment: it is ONE pending change on every count (the comparison, the day's count, the To go out list, the publish button, the amendment's own item count, the load's confirm), the four sign-offs fall, and a flag-again returns all of it to nothing; it is never also "warnings on this day changed"; a hide of a warning the working copy no longer raises pends nothing | D471, D45, D103, D98 | `state/warnhide-published.test.ts` |
| WH9 | The published face keeps the flag until that amendment is out, then strikes the line and drops the flag; each version keeps the hides it went out with; with nothing published, and for a draft day beside a published one, View-only Sched follows the working copy's hides | D471, D469 | `state/warnhide-published.test.ts`, `ui/availwin.test.tsx` |
| WH10 | A hide is tied to that exact warning: it comes back by itself when the day, the rule, the men or the words change — and a rename of a man it names is not such a change | Aug 26, 14 Sep 26 | `engine/warnhide.test.ts`, `state/warnmute.test.ts` |
| WH11 | Only a scheduler hides and flags again; a hide is an Undo step ("hiding a warning" / "flagging a warning again"); the change history says who hid what, under the day | Aug 26, D148, D469 | `state/warnmute.test.ts`, `state/warnhide-kept.test.ts`, `state/warnhide-published.test.ts` |
| WH12 | A mark that crosses the week's edge (Sunday's "Breaks Monday", and the 7-day run's forward dotted mark on every day of the run) and the next-week preview's amber time box follow next Monday's own hide — its working hides while that Monday is a draft, its issued ones once it is published — and nothing else's | D475, D471 | `state/warnhide-published.test.ts` |
| WH13 | Every ring, chip, dash and next-day mark the rules write belongs to a warning of its own day and rule that names that man — checked after every validate of the whole suite | plan §3.2 (Fable F5) | `engine/warnhide.test.ts`, `src/testing/marks-guard.ts` |

**No clash with an earlier ruling.** Narrowed by this build, the later ruling winning (D90): the Aug 26 hide rule's
"cleared on login/logout", "the muted ones gather under an N hidden line" and "the day's header keeps its true count and
colour" (D469, D472); D187's "every warning shown" on a look now reads "every warning of the version, its hidden ones
struck" (D469).
