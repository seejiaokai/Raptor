**Sol 6.1 — REVISE: one residual finding in RF5.**

Read-only review of `a8355d98`, its tests and relevant callers, compared with its parent. Conclusions below are traced through code; no build, tests or browser walk ran.

**P3 — RF5 still loses the malformed-clock advisory when the wave becomes empty.**

1. On Scheduler Board, add an ordinary flying wave.
2. Enter `8h00 IN TIME` in its In-time / Rally box, leaving take-off blank. The new advisory appears.
3. Remove every aircraft line, leaving the wave and its reporting text.

Expected: “no recognised clock” remains until the reporting text is corrected. W19 concerns an unreadable reporting instruction; deleting its last flying line does not correct that instruction.

Actual: the advisory disappears from both editing feedback and the warning list. [reporting.ts:93](C:/Users/User/projects/Raptor/raptor-port/src/engine/reporting.ts:93) creates every issue inside the formations loop. With no formations, it creates none. [board.ts:861](C:/Users/User/projects/Raptor/raptor-port/src/ui/board.ts:861) permits that state, retaining the wave and its reporting text.

**Provenance:** RF5 partly unfixed, not a new regression. My first report explicitly requested the empty-wave case. The new RF5 test always supplies a formation, so it misses it.

**Fix, step by step:**

1. Handle malformed reporting lines on an empty ordinary wave independently of the formations loop.
2. Anchor those advisories to the existing In-time / Rally box; keep them nonblocking.
3. Preserve standalone and cancelled-formation exclusions and avoid duplicate advisories when a formation is added.
4. Add regression tests for removing the last formation and adding one back, checking both editing feedback and the day’s warning list.

**RF1–RF5 assessment and explicit negatives**

- **RF1 — fixed for the reported failure; directly pinned.** The new mixed-event tests would fail against the parent: an unfinished flight with a valid reporting clock no longer supplies one endpoint to timed Ground work. Complete flights and negative overnight reports remain counted. I found no legitimately null or undefined endpoint newly discarded incorrectly: ordinary commitments receive complete windows from the shared window reader; SC’s nullable brief is not a work-span endpoint. No demonstrated regression.
- **RF2 — the reported keyboard escapes are repaired in code; coverage is incomplete.** The new confirmation test pins forward/reverse boundary wrapping, recovery from focus behind the sheet, ordinary internal Tab and release after closing. The Board test pins Monday’s Sort all and resumption of the schedule route. Neither directly pins cancellation-dialog containment, stacked sheets, no enabled controls or Escape.
- **RF3 — fixed; directly pinned.** Stored and visible wording now use the same whitespace comparison. Its test would fail against the parent and checks that Red is recorded without rewriting the double-spaced Mission or adding a text-change command. Substantive failed saves still refuse the answer. No demonstrated regression.
- **RF4 — fixed; directly pinned.** Moving between aircraft Remarks rebuilds the button with the current field and click handler. Its test would fail against the parent and checks both the saved answer and return to the second Remarks box. Another formation’s open question does not change that rebinding logic. No wrong-formation answer or additional question introduced.
- **RF5 — fixed when an applicable, noncancelled formation remains; directly pinned there, incomplete as above.** Readable clocks, genuinely clockless notes and clockless immediate Rally remain quiet before take-off. Chronology still waits for take-off. Standalone and cancelled cases retain their exclusions. No additional false advisory established.

**RF2’s special cases**

By inspection, no enabled control means Tab remains on the sheet’s container. Only the last registered sheet handles Tab; removing either sheet removes its own registration, and removing the last removes the document listener. Closing a top sheet can restore focus to the remaining sheet without taking focus from an already focused surviving sheet.

The handler ignores Escape, so the four confirmation sheets’ existing Escape cancellation remains reachable. The Board’s cancellation-reason input retains Escape; its other controls and Sort all have reachable Close/Cancel buttons. Sort all has no Escape handler—an existing limitation, not a newly inescapable window.

I found no reachable competing-focus regression with Leave War or Tracker: Leave War’s retained listener stands down when its page is hidden; Tracker’s containment handles keys within its own dialog; the bell’s OIL route switches to Inputs before opening the question.

I did not read the other second-round report or concurrent walker results, as instructed. Native keyboard traversal and the unpinned lifecycle cases remain unverified.

Confidence: moderate that no serious new regression remains in these five fixes. A real-browser failure in those keyboard sequences would change that assessment.

Walk: NOT DONE — source review only, as instructed.  
Rulings: none this session.

