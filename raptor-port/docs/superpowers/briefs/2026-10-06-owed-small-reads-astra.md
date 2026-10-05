**Verdict: CHANGES REQUIRED — wording corrections and a remaining Retry-test weakness.**

Reviewed the specified commits and their current source. No files changed; no builds, tests or browser sessions run. No other reviewer’s report dated 6 October was opened.

**Part 1 — short rulings against full rows**

- **D591 — exception missing; conflicts with D592 when read alone.** [oil.md:46](/C:/Users/User/projects/Raptor/.claude/rules/decisions/oil.md:46) says “not from the nominal report time” without preserving the fallback when no time is entered. Replace that clause with: **“from the earliest applicable entered in-time / Rally, using nominal report time where none is entered; D592 supplies the confirmed details.”** Add **“changed by D592”** and retain “not yet built.”
- **D592 — pending-change requirement missing.** [oil.md:45](/C:/Users/User/projects/Raptor/.claude/rules/decisions/oil.md:45) correctly freezes published OIL, but omits what happens meanwhile. After the publication clause, add: **“a later entered-time or Logic-value change reads as pending.”** Otherwise an implementation could preserve the amount while silently failing to flag the change.
- **D593 — faithful base request.** [scheduler.md:50](/C:/Users/User/projects/Raptor/.claude/rules/decisions/scheduler.md:50) preserves dragging within a wave, Auto sort, and “not yet built”; its D594 pointer correctly identifies the subsequent conditions.
- **D594 — sorting exceptions missing.** [scheduler.md:49](/C:/Users/User/projects/Raptor/.claude/rules/decisions/scheduler.md:49) needs **“previous-evening times before same-day times; lines without a clock last”** after “earliest first.” Add **“Edit Schedule displays the order left on the board.”** Plain clock sorting could otherwise put an evening-before report after the next morning.
- **D596 — core instruction faithful, operational conditions missing.** [how-we-work.md:15](/C:/Users/User/projects/Raptor/.claude/rules/decisions/how-we-work.md:15) should add: **“Search rulings/backlog first; decide technical questions yourself; list each remaining owner question in app words with its recommendation and exact waiting step.”** Preserve the full row’s distinction that applying this to *every* unattended run is the agent’s reading.

**Part 2 — changed working guide**

**Correction needed:** [doc-structure.md:69](/C:/Users/User/projects/Raptor/.claude/rules/doc-structure.md:69) omits the specified location of the questions list. Add: **“In a bug check, put ‘Questions waiting for him’ at the head of the evidence sheet’s look-card section.”** Also identify the general application to unattended runs as the agent’s reading. Technical decisions remaining with the agent are already covered by the always-loaded plain-language rule.

**Standing-rule conflict:** [shipping.md:22](/C:/Users/User/projects/Raptor/.claude/rules/shipping.md:22) requires an immediate preview message, while [shipping.md:60](/C:/Users/User/projects/Raptor/.claude/rules/shipping.md:60) permits returning early for a genuine question. Neither states D596’s exception. Add: **“During unattended runs, D596 governs: collect questions and preview links for the closing report; return early only when no authorized work can continue.”**

**Sound:** The bullet preserves continuing independent work, parking only the affected piece, recommending an answer, one closing/blockage notification, and no merge or main changes.

**Sound:** The other checked rules’ requirements to resolve ambiguity before building the *affected work* remain compatible with continuing unrelated work.

**Part 3 — save-warning fixes**

**R2-3 remains incompletely fixed — P3, test weakness.** [save-note.spec.ts:52](/C:/Users/User/projects/Raptor/raptor-port/e2e/save-note.spec.ts:52) samples the write counter with `setTimeout(..., 0)`. That runs in a later task; it does **not** precede every automatic-retry timer.

Concrete failure: suppress the application’s Retry handler and press near an automatic-retry deadline. The already-due retry can execute before the sampling callback, produce a positive count, and satisfy the assertion despite an ineffective button. Recovery is also vulnerable because capture has already restored storage.

Correction:

1. Keep the counter and refusal flag.
2. Record the starting count during click capture.
3. Sample synchronously during document bubbling, after React’s button handler, rather than in another timer task.
4. Require that sample to exist and show a write.
5. Repeat the disabled-handler check with an automatic retry due at the click boundary.

The existing 20ms unit test still independently pins the shared Retry handler.

**R2-2 — repair supported; coverage incomplete.** [floatwin.ts:75](/C:/Users/User/projects/Raptor/raptor-port/src/ui/floatwin.ts:75) and [17-save-status.css:60](/C:/Users/User/projects/Raptor/raptor-port/src/ui/scheduler/17-save-status.css:60) exclude remembered desktop boxes from the additional cap. The [regression at line 360](/C:/Users/User/projects/Raptor/raptor-port/e2e/save-note.spec.ts:360) pins moved Changes windows, but does not cover native resizing, an operated ALL AVAIL window, or the preview-bar combinations requested in R2. Add those fail/recover cases; do not describe them as already pinned.

**R2-1 — sound and meaningfully pinned.** The marked resize preserves Tools while retaining canvas refitting; ordinary resize behavior remains. The [test at line 311](/C:/Users/User/projects/Raptor/raptor-port/e2e/save-note.spec.ts:311) covers failure and automatic recovery with Tools open.

**Later stylesheet change — no concrete interference found.** [Line 81](/C:/Users/User/projects/Raptor/raptor-port/src/ui/scheduler/17-save-status.css:81) targets only the phone board’s Desktop-layout band. It does not alter floating-window caps, Tracker events or warning ownership. Its test checks three horizontal positions.

**Earlier repairs:** No additional concrete production regression found in the reviewed changes.

**Walk: NOT DONE — read-only brief. Rulings: none this session.**

