Review result: **not ready for approval**. I found four forward-looking defects. Two can silently change an issued schedule without a pending item, directly breaking D179. These affect newly published data, so D56 does not exclude them.

## Findings

### 1. Critical — the next-day crew-rest or seven-day trace can change on an issued day with zero pending

**Setup:** Publish Monday while Tuesday remains a draft. Monday contains someone whose dotted crew-rest or `7` trace depends on Tuesday.

**Action:** Change Tuesday’s schedule or inputs so that its crew-rest/RUN warning appears or disappears.

**Expected:** Monday keeps its issued dotted mark. Monday reads one pending change, its four sign-offs fall, and reverting Tuesday restores zero pending.

**What the code would show:** Monday’s dotted mark changes immediately, with no Monday pending item and its sign-offs intact. [`warnSliceOf`](C:/Users/User/projects/Raptor/raptor-port/src/engine/validate.ts:1387) deliberately stores `trace: null`; [`warnSliceKey`](C:/Users/User/projects/Raptor/raptor-port/src/engine/publish.ts:564) omits trace; and [`faceWarn`](C:/Users/User/projects/Raptor/raptor-port/src/engine/validate.ts:1355) retains the live `OFFICIAL.trace`. This contradicts the schema and D179. It is especially serious because the changing mark represents crew-rest or consecutive-days safety information.

**Exact fix:**

1. In `src/engine/validate.ts`, make `warnSliceOf` copy the selected day’s `trace` map.
2. In `src/engine/publish.ts`, include `trace` in `warnSliceKey`.
3. In `faceWarn`, replace `trace[di]` from each stored slice just as it replaces `sev`, `chip`, and `dash`.
4. Ensure `traceIx` and `dayTraceHTML` can display a frozen trace even when its target warning does not exist in the current draft. A non-jumping frozen explanation is safer than silently dropping it.
5. Add add/remove/revert tests for crew-rest and RUN traces in both directions, including Sunday–Monday week boundaries. Assert the issued markup, count, pending list, and four sign-offs together.

### 2. High — roster details and the default brief time still change on issued faces, previews, and exports

**Setup A:** Publish a day containing a named pilot and a flying line whose B field is blank.

**Action:** Change that person’s CAT, seat, personnel/SANS/SXO status, or change the default brief-lead rule.

**Expected:** The issued week, issued board preview, CSV/print document, and input-row pucks retain the issued appearance. One pending item appears and the sign-offs fall.

**What the code would show:** The warning layer stays frozen, but the document itself changes:

- [`puck`](C:/Users/User/projects/Raptor/raptor-port/src/ui/html.ts:410) reads live `PEOPLE`.
- The week’s blank brief reads live `VCONF.briefLead` at [`html.ts:1593`](C:/Users/User/projects/Raptor/raptor-port/src/ui/html.ts:1593).
- The board does the same at [`board.ts:197`](C:/Users/User/projects/Raptor/raptor-port/src/ui/board.ts:197).
- CSV and print rows read live qualifications and `briefLead` at [`export.ts:62`](C:/Users/User/projects/Raptor/raptor-port/src/ui/export.ts:62).

The snapshot records these values but expressly uses them only for comparison at [`publish.ts:533`](C:/Users/User/projects/Raptor/raptor-port/src/engine/publish.ts:533). This is the open gap already admitted in the handpass at [line 35](C:/Users/User/projects/Raptor/raptor-port/docs/handpass/2026-09-26-late-pub.md:35), but D179’s later ruling is unambiguous: everything that moves the published face freezes.

There is a worse variant. If a person appears only in the frozen Unavailable/input block and nowhere in `snap.d`, `dayPeopleAttrs(snap.d)` never records them. Their puck can therefore change live with **zero pending** and all four sign-offs intact.

**Exact fix:**

1. Replace `dayPeopleAttrs`’ recursive string scan with a shared enumerator of actual rendered person positions.
2. Include people shown only by `snap.inp`, not merely people stored in `snap.d`.
3. Add a synchronous frozen-face context, restored in `finally`, beside `withFrozenInputs`. Resolve issued `q`, `seat`, `pers`, `san`, and `sxo` from `snap.pa`, while retaining the live callsign as the allowed label.
4. Resolve the printed blank brief from `snap.rv.briefLead`.
5. Use those resolvers in `puck`, the week’s blank-B calculation, the board, and published CSV/print generation. Do not mutate global `PEOPLE` or `VCONF`.
6. Add tests for a scheduled person, an input-only unavailable person, a blank B, an issued board preview, CSV, print, revert-to-issued, and publication of the next AL.

### 3. Medium — a callsign rename can make the pending list invent warning changes

**Setup:** Publish a day with an existing warning whose message names a person.

**Action:** Rename that callsign, which is correctly treated as a live label, then make a separate real warning change.

**Expected:** The pending list describes only the real warning change, using the current callsign.

**What the code would show:** The count remains one, but the list can claim that the unchanged warning was cleared and another was created. The comparison correctly normalises callsigns through `warnMsgKey`; [`warnWords`](C:/Users/User/projects/Raptor/raptor-port/src/ui/pendlist.ts:163) instead compares raw `code|message` text.

**Exact fix:**

1. Move the canonical warning identity into one shared exported helper.
2. Use that helper in both `warnSliceKey` and `warnWords`, supplying stored callsigns for the issued side and current callsigns for the live side.
3. Match warnings canonically first; use current callsigns only when rendering their prose.
4. Add a test containing an existing warning, a rename, and a separate warning addition/removal. Assert that no false cleared/new rows appear.

### 4. Medium — roster/rule-only changes are described as warning changes

**Setup:** Publish a blank-B line or a puck, then change only `briefLead` or a rendered roster attribute without changing the warning list.

**Expected:** One pending item names the actual difference, such as “Default brief lead: 140 → 90” or “Ranger · CAT changed.”

**What the code would show:** The count and sign-off invalidation occur, but the pending list says “a ring or mark changed,” and the Amendments panel says “warnings changed.” `warnDelta` hashes warnings, `pa`, and `rv` into one opaque entry, while `warnWords` can inspect only the warning arrays.

**Exact fix:**

1. Keep this as one pending item when one underlying roster/rule act affects both appearance and warnings.
2. Preserve structured sub-differences for warning rows, person display fields, and printed rule values instead of only combined hashes.
3. Make `pendlist.ts` render those structured differences.
4. Change `ALPanel.tsx` to say “published face changed,” or “published face and warnings changed,” as applicable.
5. Add text assertions as well as count assertions for roster-only, rule-only, and combined changes.

## Coverage reviewed

I traced these production objects and paths:

- Member inputs: unavailable/leave/OD/course, medical down- and up-chits, SANS availability, and activity requests; including person, type, dates, all-day/times, remarks, filing state, acceptance/take-off, deletion, and re-dating.
- Warning presentation: warning rows, severity rings, short chips, sanctioned dashed rings, crew-rest/RUN traces, and the deliberate live `OIL_NO_PERIOD` advisory.
- Roster and rule presentation: CAT, seat colour, personnel, SANS, SXO, callsign labels, and blank-brief lead.
- Existing issued evidence: ALL/ALL AVAIL membership and OIL evidence.
- Readers: issued View-only week, its information panel, ALL AVAIL window, old-version week preview, board preview, working week/board, pending list, all count surfaces, the official validator, CSV, and print/PDF.
- Writers and action order: Inputs page/calendar changes, board inline editing, accepting/taking off requests, Leave War approval/move/unapprove/remove, Quals, Logic rules, neighbouring-day edits, load/plan switch, Undo/Redo, Publish AL/EOD, Unpublish, reload, and week switching.
- Roles and overlays: members can file their own inputs and read the issued face; admins additionally see pending, the four sign-offs, the Amendments panel, working copy, and publication doors. `PV`, `OFW`, frozen-input, whole-issued-week, neighbour-stash, draft-preview, and `VWORK` paths were all considered.

## Explicit negatives

I found these parts sound by inspection:

- `inputsOn` and `withFrozenInputs` provide one date-scoped input reader, support nesting, and restore state in `finally`.
- The issued week and stashed cross-week neighbours install their frozen inputs for the official validator.
- The old medical-live exception has been removed from `inpShow`.
- Filing/detail matching handles filed-then-deleted and taken-off-then-absent round trips under D98, D174, and D176.
- Input detail, filing, re-landed row, and input-caused OIL changes are folded into one pending act rather than double-counted.
- The four sign-offs bind to the same `dayDelta` used by pending eligibility.
- Week, board, information panels, Amendments panel, and pending-list totals share `dayPendingItems`.
- Callsign rename by itself is correctly excluded from pending.
- Issued OIL evidence and latest-published-version behaviour were not displaced.
- The intentional live exceptions remain scoped to Working draft, the reader’s hidden LATE choice, and `OIL_NO_PERIOD`.
- Old snapshots lacking the new fields are demo-data compatibility only; I did not report them under D56.
- `git diff --check 5f4496a3..HEAD -- raptor-port/src` passed.

## Verification status

The focused Vitest set was **not run**. PowerShell first blocked `npx.ps1`; `npx.cmd` then reached Vitest but the read-only environment denied its temporary `ssr` and `client` directories with `EPERM`. No tests executed, so I am not treating the handpass’s existing green counts as my independent verification.

The evidence sheet’s break tests, gates, fixes/re-walk, and owner look-card sections remain unfilled. During my review, `HANDOFF.md` was modified by another process; I did not make that change or edit any file.

I used prior memory only to orient myself to the repository layout and testing safeguards. Every finding above was verified against this checkout.

