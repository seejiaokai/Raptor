# Behaviour register — `[INSIGHTS-WHICH-COPY]` which schedule the Insights window counts (1 Oct 26)

One line per rule the build obeys, in the app's words, with its ruling and the test that names it. `npm run rulecheck`
fails when a line here has no test naming its id (`raptor-port/scripts/rulecheck.mjs`). The screen contract:
`docs/ui-contracts.md` §Week Insights; the backlog item: `OUTSTANDING.md` `[INSIGHTS-WHICH-COPY]`.

| Id | The rule | Ruling | Named by |
|---|---|---|---|
| IN1 | The Insights window counts each day's latest PUBLISHED version — the Original, or the latest amendment — and the working copy only for a day not yet published: a change waiting on a published day (a seat, a cancelled formation, a leave, a hidden warning) moves no figure of the window, on any page, until its amendment is out, then every figure moves together; a hidden warning is not counted, by the hides that version went out with; "Not on the flying programme" lists the roster those days went out with, so a man added or archived since does not move it on a week already published | D477, D478 (D472) | `ui/insights-published.test.tsx` |

**No clash with an earlier ruling.** D478 set aside two readings told to him beside D477 the same evening ("Edit Schedule
and the board count the working copy"; "a day View-only Sched shows as its working draft is counted as that") — the later
ruling wins (D90), and D477's full row carries the mark.
