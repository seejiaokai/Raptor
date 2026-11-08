# Sol 6.1's blind code read — OIL Earn on the Scheduler Board (8 Nov 26, on e4677d032)

Copied whole from the reader's output; the brief: `2026-11-08-oil-earn-board-code-read.md`. Nothing below is edited.

**Code read: one missed surface, P2.** The SANS availability cards still allow person selection inside OIL Earn. I found no additional defect in the changed OIL saving, calculation or publication paths.

Reviewed `e4677d032` against `549482bd5`. The checkout’s app source matched the requested revision.

**1. P2 — SANS availability pucks bypass the inert-tap handling**

A SANS availability offer earns no OIL, but its puck still reaches ordinary person selection while OIL Earn is on. The person can turn blue without the required “Nothing changed…” explanation. This leaves D1783’s board coverage incomplete.

**Cause:** [The SANS board panel](/C:/Users/User/projects/Raptor/.claude/worktrees/pr-oil-earn-ffbf07/raptor-port/src/ui/board-html.ts:871) uses [the shared card renderer](/C:/Users/User/projects/Raptor/.claude/worktrees/pr-oil-earn-ffbf07/raptor-port/src/ui/html.ts:951), which draws an ordinary puck. It never receives the new inert wrapper. Consequently, [the board’s inert handler](/C:/Users/User/projects/Raptor/.claude/worktrees/pr-oil-earn-ffbf07/raptor-port/src/ui/board.ts:1490) misses it, and [ordinary selection](/C:/Users/User/projects/Raptor/.claude/worktrees/pr-oil-earn-ffbf07/raptor-port/src/ui/interactions.ts:1898) handles the click.

**Provenance:** Already present on `main` at the specified base. This branch repairs the equivalent omission for Personal Inputs and Unavailable but leaves SANS Avail uncovered. It affects newly filed offers, so the stored-demo-data exclusion does not apply.

**Exact reproduction for the host:**

1. As a scheduler, file Vinci’s SANS availability for Saturday 18 July 2026, all day, offering flying.
2. Open that Saturday’s Scheduler Board with nobody selected.
3. Enter OIL Earn.
4. Under **SANS Avail**, tap Vinci’s puck.
5. Repeat with **No OIL earned** on.

Run on **402 × 874 touch** and **1536 × 864 mouse**.

**Expected:** Nobody becomes selected; no earning decision changes; the passing note names Vinci and explains that SANS availability earns no OIL.

**Disproving observation:** Vinci becomes selected blue, or the tap gives no explanation. The source establishes the fall-through; production reproduction remains required before accepting the finding.

**Exact fix:**

1. Add a failing gesture test using a fresh SANS availability record and the actual board card. Assert no selection, the explanation, and unchanged earning decisions and Undo position.
2. Give `sansCardsHTML` an optional puck-decoration callback, preserving its current output when omitted.
3. From `sbSansPanel`, supply that callback only while this day is in OIL Earn. Wrap the puck using `oilInertWrap` and `inputEarnsNoOilWhy`.
4. Let the existing board inert handler consume the tap.
5. Pin the ordinary card behaviour outside OIL Earn and the unchanged week rendering.
6. Re-walk the puck with the day switch off and on.

**Coverage traced**

These are source conclusions, not claims of a browser pass.

| Object or surface | Required visible sign and gesture | Result |
|---|---|---|
| SANS Avail cards | Non-earning puck explains without selection | Finding 1 |
| ALL AVAIL window, both tabs | Mode prevents selection; eligible people switch earning; inert people explain | Checked its independent handler; found no additional defect |
| Flying seats, including SC, AVALON and BB | Eligible seats switch earning; inert seats explain | Traced through `sbSlot`; found no missing changed route |
| Duty desks and extras | Same behaviour for each named puck | Traced through `sbSeat`; found no additional defect |
| Simulator seats, passengers and extras | Same behaviour in both simulator panels | Found no additional defect |
| Common Programme | Named pucks and event controls work independently | Checked its separate renderer; found no additional defect |
| Ground Programme and accepted input rows | Correct input/event address; individual decisions remain individual | Found no additional defect |
| Personal Inputs and Unavailable | Earning requests remain switchable; leave, medical and Personal explain | New wrapper covers these routes |
| ALL / ALL AVAIL bodies and counts | Body explains; count opens its window | Count handling precedes body handling; found no swallowed count |
| Phone day bar and desktop OIL strip | Entry/exit, switch, ruled wording and marks | Markup and styles match the stated contract; geometry unverified |
| Whole-event and individual writers | Masked/inert taps write nothing | Found no new write in those refusal branches |
| Working copy, issued versions and plans | Editing confined to working copy; issued figures remain frozen | Found no changed calculation or snapshot path |
| Members, guests and other non-editors | No effective earning controls | Existing role, page and preview guards remain before handling |
| Crew palette and ordinary week | Retain their planning/selection behaviour | Found no new handler extending into these surfaces |

The downstream readers traced were puck figures, placeholder counts, window lists, pending changes, history, Undo/Redo, publication evidence and earned-leave credit.

**Explicit negatives**

- I checked label activation versus checkbox activation and found no second earning write in the new handler.
- I checked masked named pucks, placeholder bodies and count precedence and found no additional selection fall-through.
- I checked the new reason text and escaping and found no introduced markup-injection issue.
- I checked the saving path: the switch still uses the existing OIL command; refusal branches do not invoke an earning writer.
- I checked the changed tests and found no weakened assertion concealing a behaviour change.
- I found no source evidence that this branch changes OIL amounts, saved input answers or issued credit merely by drawing or explaining an inert puck.

**Remaining production checks, ranked**

| Setup and action | Expected result | Observation disproving correctness |
|---|---|---|
| Published Saturday: Fable on an 08:00–18:00 duty. Switch the day off, inspect credit, publish, then restore and republish | Working figures change immediately; issued credit changes only on publication | Credit changes before publication, duplicates or fails to restore |
| Make one person decision, toggle the day switch, Undo/Redo; insert inert taps between changes | Underlying decisions survive; refused taps add no Undo step | Lost decision, extra Undo step or damaged Redo |
| Desktop keyboard: Tab to the switch, Space, wait for redraw, Space again | Each press changes the day once; focus remains on the replacement switch | Focus drops, second press does nothing or one press changes twice |
| Phone 402 × 874: inspect Templates/OIL Earn, enter the mode and toggle the switch | One control row; button height remains 23px; all controls reachable | Wrapping, clipping or increased button height |

**Tidiness notes — for the host to file, not fixed**

- **Repeated wording/assembly:** The new inert wrapper and `oilSeatHTML` separately assemble similar explanation attributes. `oilSeatHTML` also calls `inertWhy` twice for one puck. A shared small helper could prevent drift.
- **Clarity:** The new nested immediately invoked functions in the input-puck renderer are harder to follow than a named helper.
- **Unused additions:** I found no unused newly introduced export or branch.

**Verification limits**

The test attempts failed before any test executed. The final attempt reached suite startup, but the read-only sandbox denied the runner’s temporary-directory creation. No browser walk or visual verification was performed by this reader.

I did not open the prohibited walk reports, pictures or other final-reader reports. The mandatory handoff contained host summaries of walk outcomes; those were visible during the guidance read and were not used as verification. The explicitly permitted scenario-design report was read.

No files changed; no commit or push.

**Rulings:** none this session.

