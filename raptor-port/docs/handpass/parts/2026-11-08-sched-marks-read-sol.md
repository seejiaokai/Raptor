# Sol 6.1's final code read — chat 13, 8 Nov 26

*(Saved verbatim from his final message — `codex exec -m gpt-6.1-sol`, reasoning high, read-only; brief `docs/superpowers/briefs/2026-11-08-sched-marks-code-read.md`, commit `19551d882`. Blind to Astra's and the fresh Opus reader's reads. Dispositioned in the evidence sheet §13.)*

**Three P2 findings:** one new regression and two existing paths left uncovered by the promised repair.

I reviewed the named snapshot, `19551d882`, directly through Git because the checkout is elsewhere. No files changed, no commits or pushes, and no tests or app driving. The outcomes below follow from the code; the numbered steps are for the host to reproduce.

**1. P2 — A SANS change gains a tap that cannot reach its card**

Cause: [pendlist.ts:218](raptor-port/src/ui/pendlist.ts:218) gives every input covering the day an `iu:` destination. SANS cards carry only `data-inpedit`, not the address the jump searches for: [html.ts:987](raptor-port/src/ui/html.ts:987), [histbubble.ts:163](raptor-port/src/ui/histbubble.ts:163).

Host reproduction:

1. Publish a day.
2. File new SANS availability for an active SANS person on that day.
3. Open the day’s **To go out** list.
4. Tap its SANS filing line, first on Edit Schedule, then on the Scheduler Board.

Expected: a line offered as a button reaches its visible card. Since this repair supplies destinations for Unavailable and Personal Inputs, SANS should retain its previous non-button line until it has a supported destination.

Code produces instead: a button whose destination matches no card. The jump reports **“That input is not shown on this day”**, although the SANS card is present. On a phone the changes window also shrinks before this failure.

**Baseline:** `f9267b2fe` leaves this line still. The broken button is introduced here.

Exact fix:

1. Import `listedUnavail` and `listedPersonal` into the pending-list module.
2. Require `listedUnavail(now) || listedPersonal(now)` before creating this new fallback destination.
3. Add a regression case that publishes a day, files SANS availability through its normal writer, renders the pending list, and verifies that the SANS line has no unsupported jump.
4. Reproduce at phone and desktop widths on both schedule surfaces.

**2. P2 — Filing changes still lose the destination this repair calculates**

Cause: [pendlist.ts:392](raptor-port/src/ui/pendlist.ts:392) discards the result of `inputWords` when filing wording takes precedence. Other filing returns explicitly set `jump: false`: [pendlist.ts:451](raptor-port/src/ui/pendlist.ts:451) and [pendlist.ts:482](raptor-port/src/ui/pendlist.ts:482).

Host reproduction:

1. Publish Wednesday.
2. File a new course on Wednesday, which goes under **Unavailable**.
3. Open **N pending → To go out**.
4. Try its filing line on the week and board.
5. Repeat with an existing request: publish it on Ground Programme, reject it, then file it **→ Unavail**.

Expected: the line reaches the input’s current Unavailable row.

Code produces instead: a still line. For the new course, `inputWords` calculates the destination, but the filing branch throws that result away. For the Ground-to-Unavailable case, the paired removal branch expressly disables the jump.

**Baseline:** both cases also fail on `f9267b2fe`. They remain failures of the repair explicitly included in this brief.

Exact fix:

1. Separate destination selection from the choice of displayed wording. Keep the existing wording body intact.
2. After obtaining that wording, preserve any working destination it already supplies.
3. Otherwise resolve the live input using `inputIdOf`, preferring `it.now` for a replacement record.
4. If it still covers this day and is listed under Unavailable or Personal Inputs, attach the input-row destination. Retain the existing person-first and split-record-first ordering.
5. Leave deleted and moved-off inputs without a new destination.
6. Add cases for a new course, a rejected request put back under Unavailable, and a Ground request moved there. Assert both the button and the destination found in each real builder.

This also avoids repeating the repair separately in each wording return.

**3. P2 — Reject can bypass the unreadable week’s grey refusal**

Cause: the filing primitives refuse before changing anything: [slots.ts:496](raptor-port/src/engine/slots.ts:496) and [slots.ts:678](raptor-port/src/engine/slots.ts:678). Consequently the changed store backstop has nothing to detect. The click handler then supplies its old amber message: [interactions.ts:1042](raptor-port/src/ui/interactions.ts:1042), [interactions.ts:1146](raptor-port/src/ui/interactions.ts:1146).

Host reproduction:

1. Create a new course spanning two weeks; keep it under Unavailable.
2. Save both weeks.
3. Damage a saved row of the second week using the host’s unreadable-week fixture, then reload.
4. Open the healthy first week.
5. Press **Reject** on that course’s Unavailable row.
6. Repeat on the Scheduler Board.

Expected: the grey **Blocked:** note explains that the saved copy could not be read, nothing was saved, and names **Help → Report a problem**.

Code produces instead: the amber **“<person>’s <input> can’t be changed here right now”**. The input stays unchanged, but neither the reason nor the remedy reaches the person.

**Baseline:** the same route fails on `f9267b2fe`. This is a missing refusal call site, not a migration issue: newly created inputs can encounter it.

Exact fix:

1. Import the existing `protectedInput` preflight into the click-handler module.
2. At the start of the common `run` body, call it and return `false` immediately on refusal, before the generic refusal can run.
3. In `press`, perform the same preflight before the OIL question or dry run. Keep the check inside `run` too, because an OIL answer may arrive later.
4. Keep the engine primitives’ silent guards for their non-interactive callers.
5. Add button-driven cases for Reject, Accept and → Unavail on a healthy week whose input spans an unreadable week. Require one correct grey note, unchanged input state and no added Undo step.

**The builder’s six readings**

| Reading | Verdict and deciding code |
|---|---|
| **(a) One list and per-pass memo** | **Supported for production rendering.** Both count and input marks read `dayPendingItems`; the memo is discarded after rendering and checks day-object identity. See `publish.ts:437`, `:459`, `:885–890`. Shared inputs mean marked-row count need not equal pending-item count. |
| **(b) The “never” places** | **Supported.** Published-day and version-look guards are in `html.ts:2384`; Personal Inputs passes no mark at `:2263`; board OIL Earn suppresses both name variants at `board-html.ts:742`. The issued face runs under the version-look guard. |
| **(c) Read-only board mark** | **Supported.** The read-only span receives the same attributes, and the outline rule covers spans and buttons: `board-html.ts:746`, `04-pucks-sections.css:660`. |
| **(d) Every refusing door distinguishes the reason** | **Contradicted by finding 3.** Input-window and store-backstop paths use the new shared note, but filing refusals can stop earlier. Leave War and person deletion retain their own true refusal wording, as the build brief allows. |
| **(e) Moved extractor unchanged** | **Supported.** The same three address sources, prefix test, decoding and precedence remain. Added null guards do not change a valid pending item’s answer. |
| **(f) New jumps reach drawn rows and never a look** | **Contradicted by findings 1 and 2.** Where valid keys survive, the jump leaves the preview first, and target lookup excludes version-look elements. |

**Explicit negatives — source checks**

- I checked Unavailable marks for fresh filings, detail edits, re-dating, → Unavail, Goes to, replacement records, shared-input splits and moves between inputs. I found no further mark-selection fault.
- I checked amendment numbering and clearing after publication. I found no additional fault in their derivation.
- I checked draft days, untouched inputs, Personal Inputs, SANS marks, issued faces, saved-plan/version looks and both OIL Earn name variants. I found no unwanted waiting mark.
- I checked editable and read-only board names, amendment colours, retained input tint, keyboard-focus exclusion and the name button’s existing title. I found nothing further in the changed markup or selectors; painted appearance remains for the host.
- I checked unreadable-week notices on Edit Schedule, View-only Sched, issued rendering and the board guard. I found the shared approved wording.
- I checked input creation, editing, deletion, re-dating, person changes and medical cascades. Their preflight paths use the correct grey note. The store rollback also does so when a write actually reaches it.
- I checked Leave War approval, send-back/change, deletion and movement checks, plus person deletion. Their independent refusal reasons remain; I found no newly introduced older-version blame there.
- I checked Publish’s protected-week guard. Its unreadable refusal is correct; the ordinary protected-week rendering exposes no Publish button.
- I checked the selector and both banners for issued versions and saved plans, plus the wave-template eye. They share the intended drawing.
- I checked both warning lists: hidden lines retain their position and struck styling, use the shared Reset arrow, and keep typed ✕ for hiding. Members and version looks receive no hide/reset control.
- I found no worsening of the two expressly excluded older behaviours: caret-held board redraws and damaged-week preview/print/export fallback.

**Tidiness:** no independent unused addition or unnecessary production duplication found. The changed pending-list comment overstates which lines now reach their rows; correct that claim with finding 2. Filed here only, not fixed.

For the host’s positive re-walk, also carry one marked input through **Undo → Redo → reload → another week and back → publish AL1 → edit again**. Its mark should follow the count, disappear after AL1 and return in AL2’s colour.

**Walk:** not performed; host reproduction required.  
**Rulings:** none this session.