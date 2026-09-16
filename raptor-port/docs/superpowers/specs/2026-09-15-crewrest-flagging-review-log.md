# Plan review log — live flagging on the published schedule

Append-only transcript of the cross-provider red-team of
`2026-09-15-crewrest-on-published-flagging-plan.md`.

- **Host / planner:** Claude (Opus 4.8). **Reviewers:** Codex (GPT-6 Astra, high) + Fable 5.1 (high, independent subagent).
- **Scope authorized:** plan review only (no build). Round cap 5.
- **Plan SHA256 (round 1):** d1f214bd4630ffd4be1b577eeca9dfc9cf844eea20367e940d14abecd4a2fef0

---

## Round 1 — Codex (GPT-6 Astra, high) — verdict: REVISE
Result: `C:\Users\User\AppData\Local\Temp\claudex-eu37hffu` · session 01a0a396-87cf-7a10-b7a3-edd2c39afd5c · repo HEAD 9ba253c

Summary: two-world approach viable, but material gaps in cross-week truth, input filing, validation state, caching, and warning interactions.

| id | sev | one-line |
|---|---|---|
| CRP-001 | high | Cross-week seeds (prevSundaySeed/seedRunIn/nextMondaySeed/nextMondayWorked) read the working stash, ignoring publication state — a published-world Monday would still be judged against an unpublished Sunday amendment. Need ONE world-aware, date-addressed resolver covering every boundary dependency. |
| CRP-002 | high | `validate()` is NOT a pure day-set function (my §7 claim is wrong): no input, overwrites REST/EVD/RUNLEN/WARN/XD_CACHE/DOM counters, helpers read live DAYS (scSeatHits→standaloneHits). Needs a real refactor to parameterize helpers + return a result bundle without globals; keep the working picker/probe state on the working result; define which result feeds counters/Insights + evaluation order. |
| CRP-003 | high | INPUTS are global and not frozen by the day snapshot; `daySnap` keeps a separate filing fingerprint `fil`, `withDaySnap` swaps only DAYS+marks. A published conflict from an input filing can be silently cleared by later removing the filing. Define input truth separately, resolve filing state per date from `snapshot.fil`; decide which input values are frozen. |
| CRP-004 | high | WARN_pub cache-gating too narrow: VCONF (LogicPage), qualifications (QualsPage) and global input writes must re-flag published days even with unchanged day content (e.g. crew rest 12→14h must re-flag a 13h gap). Cache deps must include rules, people/quals, effective inputs, week/date context, boundary data, selected versions; invalidate on all mutation/hydration/undo/week-load. |
| CRP-005 | med | Warning-map diff can't drive the standing marker/reminder: a within-threshold content edit changes content but not warnings (marker missed); amending Sunday changes a draft Monday's warning (reminder mis-targets Monday). SCHED.pending insufficient (eligibility is canonical `dayDelta`, not marks). Keep TWO concepts: (a) published dates with canonical amendments → markers/reminders; (b) warning diffs → provisional tags, linked to source dates. |
| CRP-006 | med | "Every view-only day = WARN_pub" ignores display modes: ViewWeek VWORK (published day's working copy) and DPREV (saved draft), SchedBoard working/DPREV previews, next-week peek (stashed working). Warning must follow the ACTUAL displayed version per day/mode, not the surface. |
| CRP-007 | med | Click/focus/trace (jumpToWarn/focusWarn/traceIx, WFOCUS) resolve against the single global WARN by (day,index) — two worlds break this (wrong/no focus on a published-only warning). Carry the world + a stable warning identity through markup, trace nav, focus, detail panels, highlight; resolve against the displayed snapshot. |

Host disposition: PENDING (arbitrate after Fable is in).

## Round 1 — Fable 5.1 (high, independent) — verdict: REVISE
Model sound, decoupling correct; §7 mechanism not buildable as written. Verified facts of value:
- Leave War / OIL / Tracker do NOT read `WARN` (17 reader files, none in those) → two-map blast radius is scheduler-only.
- OIL already reads publish state via `daySnapIn(stash.sc, di, dayCurVerIn(...))` (sync.ts:875) → the exact world-aware selector to reuse.
- The "frozen face" is not stored HTML: `dayIssuedHTML` swaps `DAYS[di]` for the snapshot and calls `dayHTML` with `PV=true`, which nulls sev/traceHit/chip/dsh and skips `dayWarnHTML`. Overlay = stop nulling those under a "show-warnings" mode, content stays frozen.

| id | sev | one-line |
|---|---|---|
| F-1 | high | validate() publishes SIX+ globals besides WARN (REST/EVD/RUNLEN/RUNSEED/NEXTON/PREVSUN/NEXTMON/CREWREST_BODY/XD_CACHE); a 2nd published run clobbers them → the edit picker greys against issued while editing working. Fix: return two world BUNDLES; assign globals from the WORKING run only (or snapshot/restore around the published run, as withDaySnap does for DAYS). |
| F-2 | high | Cross-week seeds read the neighbour week's WORKING copy (weekctx.ts:57, weekstash.ts:97) — worlds only coherent within one week; §3's "differ only for published-and-amended" is FALSE across weeks (official cross-week bust goes silent). Fix: `bundle(v, world)` selecting per day `daySnapIn`/`dayCurVerIn` for pub, working else; thread through seedRunIn/prevSundaySeed/nextMondaySeed/nextMondayWorked. |
| F-3 | high | All click/selection (focusWarn view.ts:459, interactions.ts, traceOf, openWarns, highlights.ts:205 memo) index ONE WARN by (di,ix) → a view-page tap resolves into the wrong map. Fix: ONE WARN accessor resolving to the current surface's world (by CURPAGE/PV — the predicate withDaySnap already sets); 17 readers unchanged. |
| F-4 | high | Per-day snapshot swap can't build the published world (Tue-issued judged vs Mon-working). Fix: `withIssuedWeek(fn)` installs every approved day's dayCurVer snapshot at once + world-aware seeds, validate once. |
| F-5 | med | Perf gate unsound (INPUTS live in buildDay; LW inbound/Quals/Logic/loadWeek/undo-past-publish all change WARN_pub). Fix: gate on "some approved day has dayDelta/filing delta ≠ ∅"; else alias `pub = work` (zero cost, drift-proof by construction). |
| F-6 | med | 15 direct validate() call sites bypass afterSchedMutate → compute-both must live INSIDE validate(), not the funnel. |
| F-7 | med | VWORK (published day shown as working), DPREV/edit-page issued previews not addressed. Rule: "each DAY flags the version it shows, within its surface's world"; VWORK'd day → working; explicit previews keep no-overlay. Owner Q: is VWORK per-day or week-wide? |
| F-8 | med | "Cleared pending publish" marker keys on the flag day, but the fix is on the CAUSE day. Fix: mark both (WARN.trace carries prevDi/di); show a ghost struck-through row in the warning list on both; put the tally on the publish button ("Publish AL2 · clears 1, adds 0") — no new surface, minimal words. |
| F-9 | low | PV strips data-slot from seats; ring by `data-person` on the issued face; world-scope key-addressed highlights (WFOCUS). |
| F-10 | low | Insights/nHard counter shows last-run world; falls out of F-3. |
| F-11 | low | Verify what CONTENT the view-page SchedBoard shows for a published day (issued vs working) — if working, WARN_pub over it is F-7. |

Decoupling: confirmed correct by both. Note: the "session-end nudge" has no clock hook — "session end" = logout/resetSession/loadWeek only; state it so nobody reaches for a timer.

---

## Consolidated arbitration (host: Claude) — ACCEPT ALL

Two independent reviewers converged. No finding rejected. The two-world MODEL and the decoupling stand; the §7 MECHANISM is rebuilt. Must-fix before test-first (the 4 HIGH, merged):

1. **validate() returns two world bundles** `{WARN,REST,EVD,RUNLEN,trace,…}`, not two WARN maps. Module globals + DOM counters + picker/probe state come from the WORKING run only; the published run writes no globals (snapshot/restore or pure-return). [CRP-002 + F-1]
2. **World-aware, date-addressed seed resolver** reusing OIL's `daySnapIn(stash.sc, di, dayCurVerIn(...))`, threaded through seedRunIn / prevSundaySeed / nextMondaySeed / nextMondayWorked so the worlds are coherent ACROSS weeks. [CRP-001 + F-2]
3. **`withIssuedWeek`** — install every approved day's issued snapshot simultaneously, validate once (not per-day). [F-4 + CRP-006]
4. **One surface-resolved WARN accessor** (by CURPAGE/PV); all readers + click/focus/trace keep their name and can't pick the wrong world; ring by `data-person` on the frozen face. [CRP-007 + F-3 + F-9]

Design tightenings folded in: input filing truth resolved per date from `snapshot.fil`, separate from day truth [CRP-003 + F-5]; compute-both lives INSIDE validate(), gated on "any approved day has a delta" else `pub=work` alias [CRP-004 + F-5/F-6]; markers/reminders driven by canonical amendment (dayDelta/filing), provisional "cleared" as a ghost row on flag+cause day + a publish-button tally [CRP-005 + F-8]; per-display-mode rule for VWORK/DPREV/board/peek [CRP-006 + F-7]; session-end = logout/resetSession/loadWeek, no timer.

New test-first cases added: cross-week official bust both directions (F-2); two adjacent published days, one amended (F-4); view-page tap on a pub-only warning opens THAT warning (F-3); edit-page picker greys correctly after a published compute (F-1); undo past a publish updates the published world (F-5).

Owner question surfaced by review: is VWORK (view a published day's working copy) per-day or week-wide? (affects F-7).

Next: revise plan → v2, then a confirmation review of v2 before any build.

---

# Architecture (workflow) review — round 1

Question doc: `2026-09-15-flagging-architecture-workflow-question.md` (SHA 78d52dcd…).

## Codex (GPT-6 Astra, high) — verdict: REVISE
Result: `C:\Users\User\AppData\Local\Temp\claudex-c7hhw3zb` · session 01a0a3bb-ce48-7430-a816-5d3dbd8e8583.
Summary: two versions sound, but the incumbent CONFLATES publication status, displayed content, and warning dependencies. Recommends explicit version selection + dependency provenance; shared issued-snapshot RESOLVER for OIL (policy stays separate); published safety flags visible to ALL, personally filtered for members.

| id | sev | one-line |
|---|---|---|
| FW-001 | high | "Published world includes draft days" → a draft-caused warning appears on the official view with no draft marker (diff is empty). Drive provisional/official from the PUBLICATION STATUS of each contributing commitment, not a warning-map diff; keep draft-caused warnings but label the draft cause. |
| FW-002 | high | Version alone ≠ warning truth, and discard is incomplete: input filing (acc 'u'/'r') survives an issued-day load (reconcileDayFiling), snapshots freeze filing CODES not full input values, deleting an input loses values. → THREE truth kinds: issued assignments, input-filing decisions, and CURRENT facts (medical/quals) that must always be live. Don't promise "load issued day discards." |
| FW-003 | med | Worlds differ across the whole dependency WINDOW (amending Mon clears Tue; cross-week runs), not just the amended day; link provisional results to the date needing action. |
| FW-004 | med | OIL ≠ published-view truth: it excludes unpublished days AND credits acknowledged inputs without publication. SHARE the date/version-aware resolver; keep OIL's eligibility POLICY separate. |
| FW-005 | med | A member-facing BOARD may not exist (SchedBoard opens only on editsched; non-admins have no Edit nav). Either it's a NEW workflow or drop it from the inventory. |
| FW-006 | med | Inventory MISSES exported programmes (PDF/CSV read live DAYS, no version identity) and the next-week preview (working stash, no publish/validation status) — both leak working copy to consumers. Add them; give exports a version identity; label working output. |

## Fable 5.1 (high) — recommendation: "Two documents, many windows"
- **(a) Two truths = DOCUMENTS, not surfaces.** OFFICIAL (each published day at its signed version; an unpublished day at its live copy — hybrid) and WORKING (the desk copy). Flags belong to the document.
- **(b) Rule: each DAY takes the flags of the version it displays** (its "stamp"), NOT by surface or user role. Published→Official flags; VWORK/edit→Working flags; explicit preview (old AL / parked draft)→NO flags (a past version is read, not checked — keep that rule).
- **(c) OIL: share the RESOLVER (definition of "which version is official"), not the flags.** Per-consumer fallback for a non-published day (flags treat it as live; OIL credits nothing, never reads the warning map). Adopt OIL's "unresolvable issued → protect, never fall back to draft."
- **(d) Audience: published flags shown IDENTICALLY to everyone** (the flagged person is the subject + 2nd line of defence; a signed programme should carry ~0 flags — many = a real problem everyone should see; the "member nagged by a flag I fixed in draft" is a FEATURE — pressure to publish). Divergence chrome (pending marker, publish-button tally, the one ghost row) is scheduler-only.
- **Overbuilt in the incumbent (DROP):** the edit-page "added" provisional tags (every edit-page flag is provisional by definition) and the wrap-up align-reminder (a per-browser app has no meaningful session end — nagging without a trigger). Keep only: pending marker on published-and-amended dates + publish-button tally ("clears 1 · adds 0") + a ghost row for the one dangerous absence (an official bust the draft clears).
- **Missed surfaces (leaks):** the VIEW-PAGE BOARD shows the WORKING copy of a published day with live flags today (contradicts the brief) → a member sees a different programme on board vs week. Fix: board mirrors its page's week (edit→Working, view→Official, preview→none). VWORK is open to ANY viewer → a member can flip a published day to its draft (content-layer leak; scheduler-only or explicit owner call). The DAY-OF READER (ops/duty executing) needs the signed version + flags, never a draft.
- **Rejected framings:** "one truth with per-flag provisional/official state" (a flag is a fact about a version; provisional is a fact about the RELATION between two versions — don't collapse); "audience-scoped truth" (audience decides decoration, never truth).

---

## Consolidated architecture recommendation (host: Claude) — both converged

**Adopt Fable's "two documents, many windows" framing** (it subsumes the incumbent's "two worlds" but fixes the by-surface error and trims the guardrails). Convergence of BOTH reviewers:
1. **Two flagged truths, defined as document VERSIONS, not screens.** OFFICIAL (signed where published, live where not) + WORKING (desk copy).
2. **Each day flags the version it displays** (Codex: "displayed dependency set", FW-003; Fable: the day's stamp). Replaces "by surface." Previews/archived ALs are unflagged.
3. **OIL shares the resolver, not the policy/flags** (Codex FW-004; Fable c). One definition of "official"; OIL keeps its own eligibility + never reads flags.
4. **Published flags to everyone; divergence chrome scheduler-only** (Codex: visible to all + personal filter for members; Fable: identical face for all). ← the one DIVERGENCE: per-member personal filter (Codex) vs one identical official face (Fable).
5. **Provisional/official is driven by the PUBLICATION STATUS of each contributing commitment, not a warning-map diff** (Codex FW-001; consistent with Fable's document/stamp model). Fixes the "draft-caused warning on the official view with no draft marker" case.
6. **A third state exists beyond the two plan-versions:** CURRENT SAFETY FACTS — medical fitness, qualifications — are NOT versioned; they flag on the Official programme immediately, no publish needed (Codex FW-002). Input-filing decisions need their own resolution; "load issued day" does NOT fully discard them (Codex FW-002; Fable "discard incomplete").
7. **Consumption leaks my inventory missed:** exports (PDF/CSV read live DAYS, no version identity — Codex FW-006), the next-week preview (working stash, unlabelled — FW-006), and the phone board (Fable). Bring under "each window shows its document"; give exports a version identity + label working output.

Net effect on build: the round-1 engine refactor (two result bundles, world-aware seeds, one surface-resolved accessor, withIssuedWeek) STANDS; the UI guardrail work SHRINKS (reminder + edit-page tags dropped); the clock-adjacent reminder is gone entirely.

**Owner decisions surfaced (product, not mechanism):**
- D1: members on the official programme — one identical official face for all (Fable) vs filtered to each member's own person (Codex)?
- D2: VWORK (viewing a published day's unsent working draft) — keep for all viewers, or scheduler-only? (currently leaks the draft to members)
- D3: the working-copy leaks (board / exports / next-week preview) — fix as part of this, or split out? (they're arguably pre-existing bugs)

---

# Confirmation review (round 2) — of plan-v2

## Fable 5.1 (high) — verdict: SOUND-WITH-FIXES
Mechanism (§5) holds and integrates all round-1 HIGHs. Residual/new:
- **HIGH 1 — §8/D3 board is MOOT: there is no view-page board.** `SchedBoard` opens only on `editsched`; ViewWeek has no board; view page already defaults to the issued face. So D3 "fix the board now" = zero work; the board is edit-only (working flags); the view week (phone+desktop) is the issued face + official flags — the ONLY change there is flags appear. Delete §8's owner question; rewrite §8; test #11 → "edit board→working, view week→official". *(Codex FW-005 had this right; my round-1 board line was wrong.)*
- **HIGH 2 — alias gate must span the cross-week seed window.** "Alias OFFICIAL=WORKING when no approved day has a delta" read as loaded-week only silences a prev-week published-Sunday amendment (test #2's case). Gate = any approved day in {loaded week ∪ seed window: prev week back to maxRun, prev Sunday, next Monday} whose issued snapshot ≠ resolved working. `dayDeltaIn`/`dayFilingFingerprint` read live `DAYS[di]` → add a days-parameterised delta reading `stashDays(v)` for non-loaded weeks. Add test.
- **HIGH 3 — filing truth (CRP-003) accepted in §4 but no mechanism in §5.** `withDaySnap`/`withIssuedWeek` swap DAYS only, not INPUTS → OFFICIAL run reads live `INPUTS.acc`; marking an input 'r' clears an OFFICIAL warning with no publish. `withIssuedWeek` must install per-date `snapshot.fil` as an override honoured by buildDay/inpShow/workedSet in the OFFICIAL run; multi-day input uses each date's own `fil`. Add test.
- **MED 4** — §5.3 "protect" vs §7 "fallback" contradiction on unresolvable issued: for flags, restate as an invariant — a supported book resolves every approved day, else whole week = protected/no-flags (matches dayIssuedHTML). 
- **MED 5** — in-list markings ARE a keyed diff (identity = code+who+flag day+cause day, exclude `msg` so a within-threshold edit doesn't spuriously mark). Marker itself stays publication-status-driven.
- **MED 6** — §11 missing cases: undo-past-publish, filing-after-publish, DPREV/old-AL shows no flags, cross-week gate, marker-computed-pre-swap.
- **LOW 7–10** — §3 D1 "scheduler-only chrome" contradicts "Not Yet Signed everyone" (delete); marker computed on live day BEFORE the swap; VWORK'd-day→official-neighbour click must be a no-op not throw; add ghost-row count to the "N issues" header + cache the gate cost.
- **Q2 direction check: clean** — all four seeds route through `bundle()`; no direction missed once HIGH 2 & 3 fixed.

## Codex (GPT-6 Astra, high) — verdict: PENDING (running)

## Codex (GPT-6 Astra, high) — verdict: REVISE
(Runner marked the turn "failed" on a trailing empty string in the limitations list — a wrapper-format reject, not a content failure; the review itself is valid. Artifact: claudex-ad94f0jk/reply.txt. Plan SHA 3a8c6fcb…)
- **V2-001 (high)** — alias gate doesn't establish equality across the dependency window (loaded-week deltas empty while a prev published Sunday's amendment still differs) AND an empty delta from an unresolvable snapshot ≠ "official evidence available". Compute both worlds + propagate unavailable deps explicitly until a window-wide resolved-input predicate exists. **= Fable HIGH 2 / V2-005.**
- **V2-002 (med)** — `workedSet` counts every non-dormant personal-activity input regardless of publication/programme-row, so the OFFICIAL 7-day count can breach on an unaccepted Meeting a loaded Monday wouldn't. Carry publication+resolved-filing context into `workedSet`; derive a signed day's work set from the selected document's actual events.
- **V2-003 (med)** — cross-week `buildDay` uses `xweek=true`, which BYPASSES accepted-row dedup (`inpShow`), so a signed row + its original input double-count → wrong crew rest (9h vs 14h); resolving `snapshot.fil` doesn't help because xweek skips the check. Replace the blanket bypass with dedup against the selected date's own rows + resolved filing, shared by loaded days and seeds.
- **V2-004 (med)** — resolving every WARN lookup by the destination day's displayed stamp breaks cross-day TRACES (Monday OFFICIAL trace, Tuesday shown via VWORK→WORKING → `traceIx` looks up the wrong list, trace dropped/mislinked). Traces + warning refs need explicit world+date identity; resolve a trace in its originating bundle. **Sharpens Fable LOW 9.**
- **V2-005 (med)** — `dayDeltaIn` is not a stashed-day comparator (diffs snapshot vs global `DAYS[di]`; filing reads the loaded day) → a stashed Sunday gets a false/ missed "Not Yet Signed". Make it take the working day + explicit date/input context. **= Fable HIGH 2.**

## Consolidated confirmation arbitration (host: Claude) — ACCEPT ALL; DESIGN CONFIRMED, mechanism spec tightened
Both confirm the two-picture DESIGN + the §5 core are sound. No design change. Remaining = implementation-mechanics precision, folded into plan §14 (build hard-spots) and treated as test-first cases + post-build code-inspection targets, NOT another plan-review round (diminishing returns; correctness of workedSet/xweek/dayDeltaIn is verifiable only in code):
1. **Board is MOOT** (Fable HIGH1 + rd-1 Codex FW-005): no view-page board exists; the view week is the only change; delete the owner board question. §8 rewritten.
2. **Cross-week alias gate + `dayDeltaIn`**: gate over the whole dependency window (loaded ∪ prev week to maxRun ∪ prev Sun ∪ next Mon); distinguish "unavailable evidence" from equality (unresolvable snapshot → treat week as protected/no-flags, don't alias); add a days-parameterised delta reading `stashDays(v)`. [Fable HIGH2 + Codex V2-001/005]
3. **Filing truth is deeper than "install snapshot.fil"**: also carry publication+filing into `workedSet` (V2-002) and replace the `xweek=true` dedup bypass with per-date dedup against the selected day's rows+filing (V2-003), shared by loaded days and seeds. [Fable HIGH3 + Codex V2-002/003]
4. **Trace world-identity**: cross-day traces/warning refs carry world+date; resolve in the originating bundle; a click on a day currently showing another version is a defined no-op/present-that-world, never a throw. [Codex V2-004 + Fable LOW9]
5. Doc: unresolvable-issued as an invariant not a fallback; the in-list markings are a keyed diff (code+who+flagDay+causeDay, exclude msg); marker computed on the LIVE day before the swap; delete §3 D1 "chrome scheduler-only"; add §11 tests (undo-past-publish, filing-after-publish, cross-week gate, workedSet/xweek dedup, trace-through-VWORK, DPREV no flags).

Verification shifts to the post-build CODE inspection (both providers, fresh) per the build reference — these mechanics are only truly checkable in code.
