# Original Astra rally-time draft — archival copy

Author: Astra planning/coordinating agent.
Status: exact prior draft response copied from retained turn history; unapproved structured-editor proposal, subsequently followed by the simpler D498 proposal. The response below is preserved verbatim, including its original closing lines.

---

Draft plan only. D497’s short and full rows agree on the three arrangements and rally’s fallback role; the full row correctly leaves enforcement, equality, midnight, missing steps and exceptions undecided. No implementation approval is implied.

**Recommended direction**

Keep the timing information in the existing compact wave block, but enter new timings through explicit controls rather than extracting meaning from unrestricted notes.

The present reader treats **the first valid clock anywhere in a line** as an in-time. It scopes that clock by any matching formation callsign anywhere in the text. Consequently, typing `08:00 Rally (Reaper + Saber)` into the current box would already affect reporting calculations—even though the reader understands neither “Rally” nor whether those names are explanatory notes. Adding more keywords without separating timing from notes would preserve this ambiguity.

Proposed mock-up:

- A compact `+ Timing` control in the existing wave header.
- Entry row: **Type | Time | Applies to | Notes**.
- Three demonstrated arrangements:
  - **Rally only:** `Rally 08:00 · Whole wave · WX + NOTAMs`.
  - **In-time, then rally immediately:** `In-time 08:00 · Rally immediately after`—one clock, no invented duration or hidden second clock.
  - **Separate times:** `In-time 07:45` and `Rally 08:00`.
- Collapsed display remains a short readable line; editing expands the controls in place.
- Phone layout stacks the same fields, preserving their meaning and existing button sizes.
- Brief, take-off and landing remain on the flying line. A preview can show their sequence without creating competing editable copies.
- Mock invalid chronology as an inline explanation and a proposed publication refusal, clearly labelled as a proposal.
- Provide a separate overnight example with explicit day labels; do not silently make a late clock mean yesterday.

“Reaper + Saber” needs clarification before treating it as a target. The mock should distinguish **Applies to: selected formations** from **Notes: Reaper + Saber**. Names typed only in Notes should not alter calculations in the proposed structured mode.

**Impact map**

Paths below are relative to `raptor-port/`; anchors were read in the shared checkout.

| Location | Current responsibility | Required design treatment and consequence |
|---|---|---|
| `src/engine/events.ts:208`, `:227`, `:247` | Clock detection, formatting and formation matching | Introduce explicit timing meaning without making numbers or names in notes change report time. Preserve existing input grammar for legacy lines. |
| `src/engine/events.ts:275` | Shared seat-specific instructed in-time, including SC precedence and midnight handling | Resolve the effective report source once: in-time where present, otherwise rally. Both event calculation and availability must consume the same result. Preserve source information so explanations can say “rally,” not incorrectly “in-time.” |
| `src/engine/events.ts:309`, `:365`, `:382`, `:415` | Builds events, brief/step/dekit and report values | Carry separate in-time/rally/brief meanings; do not overwrite nominal reporting or step time. Validate chronology per affected formation, including different take-off times within one wave. |
| `src/engine/events.ts:580`, `:590`; `src/engine/avail.ts:87` | Earliest wave time and wave availability bands | Rally-only needs a deliberate start for wave bands. Otherwise personal report times would move while the wave’s available-crew figures retained a different boundary. Mixed formation-specific timings need the same resolution rules. |
| `src/ui/board.ts:148`, `:169` | Header currently prints “in-time” from `waveInTime` | A rally-only wave must not be labelled as having an in-time. Show the actual timing type, while retaining the compact header. |
| `src/engine/validate.ts:139`, `:959`; `src/engine/insights.ts:14`, `:39` | Shared work-hours span and long-day warning | Rally-only changes the report start for these readers. Bad draft chronology must not produce negative totals, but the handling of invalid/incomplete hours needs an explicit policy—not an unexplained clamp to zero. |
| `src/engine/validate.ts:460`, `:477`, `:542`, `:592` | Nominal versus instructed reporting, crew-rest breaches and late-show presentation | Rally fallback must reach instructed reporting. Do not replace nominal report or automatically excuse a crew-rest breach. Preserve existing late-show semantics pending an explicit new ruling. |
| `src/engine/weekctx.ts:204`, `:256` | Previous-Sunday and next-Monday event reads | New timing resolution must work through these shared builders, including a rally on the previous evening. Otherwise cross-week warnings would disagree with the loaded day. |
| `src/engine/avail.ts:264`; `src/engine/validate.ts:1243` | SANS window from the earlier of instructed report and occupied-seat start | Feed rally fallback to both sides. Keep ordinary absence/busy windows distinct; their scope was not moved to in-time by the existing rule. |
| `src/engine/oil.ts:219` | Flying earned-leave window uses nominal report lead through landing plus debrief | **Not a current in-time consumer.** Rally must not silently change earned leave simply because both calculations use the word “report.” Existing OIL rules remain. |
| `src/ui/html.ts:1193`, `:1668`, `:1674`; `src/ui/board.ts:172` | Week and board timing display/editing | Cover desktop and phone, editable and issued/read-only views, version previews and existing amendment marks. One shared timing formatter should feed these surfaces. |
| `src/ui/interactions.ts:725`; `src/ui/textedit.ts:120` | Adds, edits and deletes the existing timing lines | New controls must use the existing command route. Remove/mode-switch operations must not leave an invisible active clock. |
| `src/engine/schema.ts:333`; `src/state/weekrows.ts:124` | Wave timing currently stored as strings; day-row persistence | Structured timing is a saved-data change. Define its schema, loading and precedence before building; update the data schema/table documents. Avoid two competing editable sources. |
| `src/engine/restore.ts:68`; `src/engine/publish.ts:459` | Explicit enumeration of timing content for comparison | New fields must join canonical change detection. Whole-day JSON storage alone does not prove that a timing edit clears signatures, appears pending or can be restored correctly. |
| `src/engine/publish.ts:303`, `:326`, `:365`, `:1097` | First publication, signing and issuance | A proposed publication block needs a shared check at actual issuance entry points, not just a disabled visible button. The same explanation must reach every publishing door. |
| `src/engine/drafts.ts:37`; `src/engine/editlog.ts:404`; `src/undo/describe.ts:127`; `src/ui/histbubble.ts:198` | Saved plans, history, Undo descriptions and cell targeting | Preserve timing choices through copy, save, restore, Undo/Redo and history. Wording must distinguish rally from in-time. |
| `src/ui/export.ts:57`, `:77`; `src/ui/printpdf.ts:118` | Signed CSV/print output | Current flattened rows omit the wave’s in-time lines; print uses those rows too. Adding rally only to the on-screen block would leave it out of both. The design should show proposed report columns or a compact timing line; final export scope needs inclusion in the approved design. |

**Important distinctions the design must preserve**

- Production work-hours currently receive `report = intime ?? step`. Therefore “use the normal three-hour reporting lead when in-time is absent” would **change current behaviour**, not preserve it. My earlier negative-hours recommendation suggesting that fallback should not be reused as a settled requirement.
- D478: Insights uses each day’s latest issued version, and the working copy only when no issued version exists. A pending rally edit must follow that rule.
- D482: changing a Logic setting recalculates published-day hours. That differs from editing the day’s rally time.
- D186: the published face’s suggested brief value remains frozen. New timing displays must not accidentally read live working values into an issued face.
- D49 already permits equal take-off/landing times to earn OIL, with a warning rather than refusal. A blanket strictly-increasing validator would contradict it.
- SC’s B field is an in-time, not a brief; its typed value has precedence. SC SPARE and AVALON/BB exclusions must not be absorbed into a generic flight sequence.
- The executable late-show handling retains the breach and changes its presentation when the crew can still make step. Do not derive a new exemption from the looser explanatory comment in the event parser.
- Existing midnight handling is limited: it rolls certain preflight clocks back only when the configured lead crosses midnight. A general “clock goes backwards, therefore next/previous day” rule would hide ordinary daytime errors.

**Proposed calculation and validation design—not yet approved**

Use one resolved timing result per formation, retaining the entered type, scope, clock/day and source. Resolve scope before ordering the stages. A whole-wave default and a formation override must never depend on row order.

Allow temporary invalid drafts while somebody adjusts several connected clocks. Show exactly which relationship is wrong. If the owner chooses a publication block, block only through the shared publication check and retain the unsaved-to-publication work intact.

Keep three cases separate:

1. A valid entered timing.
2. A missing step with an existing documented fallback.
3. An invalid entered timing.

Do not silently turn case 3 into case 2. In particular, replacing an impossible in-time with rally would violate “rally when in-time is absent.” Whether invalid draft hours show unavailable/partial information is a remaining design detail; neither zero hours nor a guessed report start is approved.

**Compatibility and new-data risks**

Retain a legacy read path for existing `intimes` strings. Do not reinterpret every existing mention of “rally” on load. A deliberate conversion should display the extracted time/scope for confirmation and preserve unrecognised text.

New structured entries should identify target formations independently of their displayed callsign. A rename, duplicate name or deleted target must not silently broaden a formation-specific rally to the whole wave. Copying a wave must remap those references alongside its row identities.

There is no justification for a large migration of disposable demo data. However, continuing to accept ambiguous new free text would create the same risk in newly authored data, so D56 would not excuse it.

**First four product questions**

1. **“Should a timing mistake remain editable, with a clear warning, but stop the day being published?”**  
   Recommended: yes. This lets the scheduler correct several clocks without being trapped mid-edit.

2. **“For ‘in-time → rally → brief,’ does ‘never backwards’ allow two stages at the same minute, or must separately timed stages have a gap?”**  
   Recommended: allow the same minute; immediate rally retains its explicit one-clock mode. Do not re-ask the already-settled equal take-off/landing rule.

3. **“For overnight timings, should the clock show which day it belongs to?”**  
   Recommended: explicit Previous day / Schedule day / Next day, with a visible preview. Never silently turn an ordinary backwards clock into an overnight sequence.

4. **“In ‘Rally (Reaper + Saber),’ are those flight formations that the rally applies to, or simply words you want printed?”**  
   Recommended: use selected formations when they define who must attend; otherwise keep them as notes with no calculation effect.

After those answers, a second short round can settle absent brief/time handling and any extension to SC or late-show cases. The mock can demonstrate those states as **unresolved**, without inventing policy.

**Plan sequence**

1. Resolve the first questions and revise the design note.
2. Have Sol challenge the proposed meaning, especially mixed scopes, midnight, publication and OIL separation.
3. Build only the interactive mock-up, with the three arrangements and clearly labelled proposed/error states.
4. Obtain the owner’s product decisions; finish the remaining questions and the approved implementation plan.
5. Only then implement with focused regression scenarios and the required independent checks. Keep the negative-hours fix’s place and scope explicit; rally is not an automatic replacement for it.

No source edits, tests, screenshots, external research or Claude calls were performed. This is an independently authored draft impact/design plan, not an approved implementation specification.

Rulings: none added; assessed existing D497.
