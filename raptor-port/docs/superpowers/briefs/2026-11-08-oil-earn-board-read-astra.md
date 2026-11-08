# Astra's blind code read — OIL Earn on the Scheduler Board (8 Nov 26, on e4677d032)

Copied whole from the reader's output; the brief: `2026-11-08-oil-earn-board-code-read.md`. Nothing below is edited.

**One medium-severity completion gap remains:** a person’s puck in **SANS Avail** still bypasses the new explanation and reaches ordinary person selection while OIL Earn is on.

This is a source-based finding requiring the host’s reproduction below. I found no additional change to earned-leave calculations, saved OIL answers or publication behaviour.

I reviewed the specified change against its named base. I changed no files. I did not open the prohibited reports or pictures. The required handoff did contain summaries of the walk, which I saw; this read therefore was not completely blind to those summaries.

**1. Medium — SANS availability cards miss the new inert-puck behaviour**

**Consequence:** tapping a SANS availability puck can select the person blue and provide no explanation, while equivalent non-earning pucks elsewhere now explain and select nobody.

**Provenance:** the selection route already exists on the named base. This branch leaves that route outside the completed D1783 change; it is an omission, not a newly introduced calculation fault.

**Cause:** the new handling covers Personal Inputs and Unavailable, but SANS availability uses a separate card renderer. Both input panels explicitly exclude SANS availability.

The [SANS panel](C:/Users/User/projects/Raptor/.claude/worktrees/pr-oil-earn-ffbf07/raptor-port/src/ui/board-html.ts:871) calls the [shared card renderer](C:/Users/User/projects/Raptor/.claude/worktrees/pr-oil-earn-ffbf07/raptor-port/src/ui/html.ts:951), which draws an ordinary puck. In OIL Earn, the card loses its input-editing button, but its puck gains neither the inert wrapper nor an explanation. The [board’s handler](C:/Users/User/projects/Raptor/.claude/worktrees/pr-oil-earn-ffbf07/raptor-port/src/ui/board.ts:1490) consequently misses it and returns without stopping the click. The [ordinary selection handler](C:/Users/User/projects/Raptor/.claude/worktrees/pr-oil-earn-ffbf07/raptor-port/src/ui/interactions.ts:1890) then selects the person.

D1783 carries the “selects nothing and says why” behaviour to non-earning board pucks. The brief’s third host reading also names SANS availability, but places it in panels through which it does not pass.

**Exact reproduction for the host:**

1. Use fresh demo data as a scheduler on **Saturday 18 July 2026**.
2. File **SANS Availability** for **Kraken**, **08:00–18:00**, offering **F/O/A**.
3. Open that day’s Scheduler Board. Clear any existing person selection.
4. Enter **OIL Earn** and scroll to **SANS Avail**.
5. Tap Kraken’s puck inside his availability card.
6. Repeat with **No OIL earned** switched on.
7. Run both cases at **402 × 874 with touch** and **1536 × 864 with a mouse**.

**Expected:** neither tap selects Kraken, changes OIL, arms a seat or opens an editor. It gives a plain explanation that SANS availability earns no OIL. The precise new sentence remains the host’s reading, not separately ruled wording.

**Observation that disproves correctness:** Kraken becomes newly selected, or the tap gives no explanation. The source predicts both. Check the actual selected puck and passing note; an unchanged OIL amount alone does not prove the gesture correct.

**Exact fix steps:**

1. Add a failing interaction test using a real SANS availability input and its actual board card. Assert no person selection, no armed seat, the explanation, and no new OIL decision or Undo step.
2. Add an optional puck-decoration callback to the shared SANS card renderer, defaulting to returning the existing puck unchanged.
3. Have the board’s SANS panel supply that callback only while OIL Earn is on. Wrap each named puck using the existing inert-puck helper and the existing non-earning input-reason helper.
4. Leave the existing board click handler to consume that wrapper; do not add another document-wide selection exception.
5. Pin the ordinary SANS card’s editing behaviour outside OIL Earn and the shared week renderer’s existing behaviour.
6. Re-run the two reproduction cases, including a tap on any warning mark inside the puck.

**Coverage: where the sign and gesture belong**

These are source-read results, not browser passes.

| Object or surface | Required sign and working gesture | Result |
|---|---|---|
| SANS availability card | Non-earning puck explains and selects nobody | **Missing — finding 1** |
| ALL AVAIL window, both tabs | No selection in OIL Earn; earning changes only from its earning tab | Separate handler found; inert explanation remains in its footer |
| Personal Inputs and Unavailable | Each non-earning person explains; eligible inputs retain their individual earning control | New wrapper covers non-asking kinds; eligible inputs retain the existing route |
| Overseas Duty and earning inputs under Unavailable | Individual earning remains reachable despite having no ordinary programme seat | Existing input-specific route retained |
| Shared-input people and their programme copies | Each named person changes only their own decision for the same input | Common input address retained |
| Cockpit seats: flying, SC MAIN/SPARE, AVALON and BB | Eligible people remain switchable; incapable seats explain | Shared OIL seat renderer found |
| Duty desks and extras | Same behaviour for primary and additional people | Both reach the OIL seat renderer |
| AMT/OFT seats, passengers and extras | Every displayed person receives the appropriate earning or refusal gesture | Mode-specific people list reaches the shared renderer |
| Common Programme | Named people explain or switch; event control remains separate | Its separate renderer calls the OIL seat renderer |
| Ground Programme, including accepted requests | Named people explain or switch using their own row/input identity | Covered by the ordinary and shared-input drawing routes |
| ALL / ALL AVAIL bodies and counts | Body selects nothing; count opens its own window | Count is handled before the new body refusal |
| Phone day bar | Templates and OIL Earn icons; switch and OIL done inside the mode | Markup and styles present; dimensions require browser measurement |
| Desktop toolbar and OIL day bar | Existing entry control; new switch inside the mode | Both routes present |
| Crew palette and ordinary week pucks | Planning/selection behaviour outside event earning controls | Kept separate; no new earning control inferred |
| Issued versions, saved-plan previews and read-only roles | Reading remains possible; working OIL writes withheld | Existing rendering and click guards retained |

**Writers, readers and downstream effects**

The day switch still uses the existing OIL command. It changes only the day-wide choice and preserves the event and person choices underneath it. Successful person and event gestures retain their existing writers. The new inert branches return before those writers and before the successful-action history path.

Board amounts, earning rings and placeholder counts still read the shared OIL evidence. Publication still freezes that evidence onto a copied day. Issued displays and Leave War credit continue to read the published evidence. This change adds no new stored format or calculation rule.

Undo/Redo, pending amendments, signatures, reloads and week changes remain consequential consumers of the existing write path. Their end-to-end behaviour needs execution evidence; source continuity alone does not establish a pass.

**Ranked remaining execution checks**

These are verification scenarios, not additional findings. Start each independently with newly created data on **Saturday 18 July 2026**. Use both sizes above unless keyboard-only.

| Priority | Setup and action | Expected result | Observation disproving correctness |
|---|---|---|---|
| 1 | Run finding 1 on Kraken’s SANS card | Explanation, no selection or write | Blue selection or silence |
| 2 | Put Fable on an 08:00–18:00 SDO duty and publish. Turn the day switch on; inspect issued OIL and Leave War credit before and after publishing the amendment | Working answer changes immediately; issued credit changes only on publication | Credit changes before publication or fails to follow the amendment |
| 3 | On a ground row with two people, exclude one. Switch the event off/on, then the day off/on; attempt person taps while blocked | Individual choices survive; refusals create no changes | An exclusion disappears or blocked taps add history |
| 4 | After a successful day-switch change, tap a no-end puck, then Undo and Redo | Refused tap adds no step; successful change reverses once | Extra Undo step, lost Redo or wrong underlying choice |
| 5 | Desktop keyboard: Tab to the switch, Space twice; repeat Space immediately followed by Tab and Shift+Tab | One change per activation; focus survives redraw and subsequent navigation proceeds | Lost focus or delayed focus restoration pulls the keyboard back |
| 6 | From switch-off, press its words once, then its slider once in an independent case; try two quick completed activations | One change per activation; two return to the starting state | Double change from one press or a lost activation |
| 7 | Put ALL AVAIL on separate duty, sim, programme and shared-input rows. Press body, then count; repeat with day switch on | Body selects nothing; count still opens the correct crowd | Selection, swallowed count or wrong window |
| 8 | Create no-end, cancelled and information-only rows; test cockpit, desk extras, sim passengers, programme people and input copies | Every incapable named puck explains without changing earning | A specialised copy selects, stays silent or writes |
| 9 | Open ALL AVAIL and Changes windows; use exposed board controls and each window’s own controls | Correct target, readable note, no click through | Covered explanation or unintended underlying action |
| 10 | At 402 wide, press each phone icon and its words; enter and leave OIL Earn | One row, existing 23px button height, correct action from either target | Wrapping, changed height, overlap or an inert icon |

Also retain boundary checks for an ordinary working weekday, a public holiday, an Off day, member/view-only access, published-version previews, reload and Saturday → Sunday → Saturday navigation.

**Explicit negatives**

- I checked the day-switch writer and found nothing deleting the choices underneath it.
- I checked the new inert branches and found nothing writing OIL or adding a successful-action history entry.
- I checked eligible default-off seats and found nothing newly making them incapable of earning.
- I checked the count-before-body ordering and found nothing newly swallowing the placeholder count.
- I checked the existing scheduler, edit-mode and version guards and found no newly bypassed guard.
- I checked calculation and publication dependencies and found no changed calculation, evidence-freezing or credit rule.
- I checked the new message attributes and found their variable text escaped.
- I checked the icon references and found reuse of the existing Templates and ticket drawings.
- I checked the changed tests and found their wording changes consistent with D1782. Their assertions do not establish real phone geometry or keyboard focus after redraw.
- I checked the backlog and rulings before reporting the SANS omission and found no instruction preserving selection for this card inside OIL Earn.
- I excluded old-demo-only migration and compatibility concerns.

**The host’s five readings**

1. Placeholder-body handling is implemented separately from count handling. It remains a host reading, not independently approved wording.
2. Eligible people blocked by the day or event retain the ruled refusal messages.
3. Leave, medical and Personal input copies are covered. **SANS availability is not**, because it uses the separate card route.
4. The proposed switch passing notes remain in place; no new wording approval is implied.
5. Focus restoration is attempted after redraw. Its timing and rapid keyboard navigation remain execution checks.

**Tidiness note for the host to file; nothing changed**

- **Said twice:** inert-wrapper construction is repeated between the new helper and the existing OIL seat renderer. A later consolidation could keep their explanation attributes consistent.
- **Harder to follow:** the new nested conditional and immediately invoked function in the input-puck drawing path obscure the three cases: earning input, non-earning input in OIL Earn, ordinary input.
- **Unused:** I found no newly added unused helper, constant or style in the changed lines. No rules-engine tidying is proposed.

**Checks and limits:** source inspection and comparison only. An attempted in-memory execution probe stopped before loading the app because the installed TypeScript package did not expose the transpiler API; it provides no reproduction evidence. No tests, browser walk or geometry checks passed in this session.

**Next:** reproduce finding 1 through the production screen, add its failing test, then fix and re-walk that route before closing the change.

**Walk: NOT DONE — code-reader assignment.**  
**Rulings: none this session.**