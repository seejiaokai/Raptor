# Live flagging on the published schedule — PLAN v2 (build spec)

**Date:** 15 Sep 2026 · **Model:** Opus 4.8 build, test-first · **Status:** PLAN
(supersedes `2026-09-15-crewrest-on-published-flagging-plan.md`; history in
`…-crewrest-flagging-review-log.md`). Not built. Awaiting owner "go to build".

Hardened by two independent red-team rounds (Codex GPT-6 Astra high + Fable 5.1
high): a mechanism round and a workflow-architecture round. Owner decisions D1–D3
folded in. This is the artifact to confirm-review before code.

---

## 1. Goal

A **published** schedule day shows live warnings again — crew rest (incl.
cross-day / past-midnight), the 7-day max-consecutive-work rule, timing
conflicts, and everything a draft day shows — while its **content** stays the
byte-frozen signed record. Reverses the settled "a snapshot is never validated"
rule at the render+truth layer, clock-free and decoupled from EOD.

## 2. The model — "two documents, many windows"

Two things ever get checked; both are **document versions**, not screens:
- **OFFICIAL** — each day at its signed/issued version; a never-published day at
  its live copy (no other version exists). A HYBRID: "published where signed,
  live where not". Distinct from OIL's stricter "published only".
- **WORKING** — every day as it currently sits on the desk (latest edits, incl.
  unpublished amendments to published days).

**Flags belong to the document version, not the surface.** The rule:

> **Each DAY shows the flags of the version it is displaying (its "stamp").**
> Published day → OFFICIAL flags. A day shown as a working draft (the view
> week's VWORK opt-in) or on an edit surface → WORKING flags. A day under an
> explicit *preview* banner (an old AL, a parked draft) → **no flags** (a past
> version is read, not checked — the standing rule stays).

Not "by surface" (breaks on VWORK, the board, the next-week peek) and not "by
user role" (a scheduler on the view page deliberately chose the signed face).
The stamp is the user's contract; the flags must match the text under them.

**Visibility is universal (owner, 15 Sep).** Everyone can see the live working
copy for each day in real time — the OFFICIAL/WORKING split governs *which is the
signed record* and *which flags a displayed day shows*, NEVER who is allowed to
see what. The only scheduler-only thing is the *act of publishing* itself. A
**"Not Yet Signed"** marker (shown to everyone) tells any viewer when the version
in front of them differs from the signed one.

The two documents differ **only across their dependency window** for a
published-day whose working copy diverges (an unpublished amendment) — and that
difference can land on a *neighbouring* day (crew rest lands on the next day;
runs span days/weeks), so provisional state links to the date that needs action,
not merely the amended date.

## 3. Owner decisions (D1–D3, 15 Sep 26)

- **D1 — audience:** the OFFICIAL face renders **identically for admin and
  member**; published flags shown to everyone (the flagged person is the
  subject + the second line of defence). No role-dependent rendering on the
  official face. (The "Not Yet Signed" marker and in-list markings are shown to
  everyone; only the act of publishing is scheduler-gated.)
- **D2 — VWORK stays open to any viewer.** Consistent with §2: a VWORK'd day is
  stamped "Working draft" and therefore shows WORKING flags; the viewer knows it
  is not the signed version. No leak concern — it is an explicit, labelled opt-in.
- **D3 — scope:** the **scheduler board**'s flagging is fixed now (core
  surface). Showing the live working copy to everyone is **intended, not a leak**
  (owner, 15 Sep). The **PDF/CSV export is meant to export the PUBLISHED
  schedule** (owner, 15 Sep) — today it reads the live working copy, which is
  wrong for that intent; correcting exports to the signed version + a version
  stamp, and labelling the next-week peek, is a **follow-up** (OUTSTANDING
  `[FLAG-EXPORT]`).

## 4. A third kind of state — current safety facts are never versioned

Medical fitness and qualifications are **not** part of a schedule version — they
flag on the OFFICIAL programme **immediately**, no publish needed (you don't
"publish" someone going unfit or a qual lapsing). The OFFICIAL document = signed
*assignments* + *current* safety facts (live) + resolved *input filing*. Input
filing decisions (`acc` 'u'/'r') are a separate axis: `withDaySnap` swaps DAYS +
marks but NOT global INPUTS, snapshots freeze filing *codes* not full input
values, and `reconcileDayFiling` preserves 'u'/'r' across an issued-day load — so
"load the issued day" does **not** fully discard a warning-clearing filing
change. The plan resolves filing state per date from `snapshot.fil` and does not
promise issued-load as a discard.

## 5. Mechanism (the round-1 fixes, binding)

The engine change is the heavy, load-bearing part; the render is thin.

1. **`validate()` returns two result BUNDLES** `{WARN, REST, EVD, RUNLEN,
   RUNSEED, NEXTON, PREVSUN, NEXTMON, CREWREST_BODY, trace, counters}` — one for
   WORKING, one for OFFICIAL — instead of writing module globals inline. The
   module globals + DOM counters + the crew-picker/probe state (`avail.ts`,
   `restIfPlaced`/`runIfPlaced`, `dropflag.ts`, `insights.ts`) are assigned from
   the **WORKING** bundle only; the OFFICIAL run writes **no** globals
   (snapshot/restore around it, exactly as `withDaySnap` does for DAYS, or pure
   return). This is the refactor that makes "check it twice" possible without the
   edit-page picker greying against the issued version. [CRP-002, F-1]
2. **`withIssuedWeek(fn)`** installs **every** approved day's `dayCurVer`
   snapshot at once (not per-day) and runs the OFFICIAL validation once, so a
   Tuesday-issued day is judged against a Monday-issued day, not Monday-working.
   [F-4, CRP-006]
3. **World-aware, date-addressed seed resolver.** `weekctx.ts:bundle(v, world)`
   selects, per day, the issued snapshot (`daySnapIn(stash.sc, di,
   dayCurVerIn(stash.sc, di, v))` — the exact resolver OIL already uses) for the
   OFFICIAL world, else the working day; threaded through `seedRunIn`,
   `prevSundaySeed`, `nextMondaySeed`, `nextMondayWorked` so the two documents
   are coherent **across weeks** (an unpublished Sunday amendment cannot silence
   next Monday's official bust). A pure-seed week (no SCHED) falls back to
   working. Adopt OIL's "unresolvable issued → protect, never fall back to
   draft". [CRP-001, F-2]
4. **One surface-resolved WARN accessor.** All ~17 readers + every
   click/focus/trace path (`focusWarn`, `interactions.ts`, `traceOf`,
   `openWarns`, `highlights.ts` memo, `WFOCUS`) keep the name `WARN`/`EVD` and go
   through ONE accessor that resolves to the **displayed day's version** (by the
   day's stamp — published/VWORK/preview — not a positional guess). Ring by
   `data-person` on the frozen face (PV strips `data-slot`). [CRP-007, F-3, F-9]
5. **Compute-both lives INSIDE `validate()`** (not the mutation funnel), so the
   15 direct `validate()` call sites can't leave the OFFICIAL bundle stale.
   Gated: compute the OFFICIAL bundle only when **some approved day has a
   `dayDelta`/filing delta ≠ ∅**; otherwise **alias OFFICIAL = WORKING** (zero
   cost, and equality is by construction so the "no divergence" case cannot
   drift). Invalidation covers rules (VCONF), people/quals, effective INPUTS,
   week/date context, boundary data, selected versions — all mutation /
   hydration / undo-redo / week-load paths. [CRP-004, F-5, F-6]

Verified enabling facts: only the scheduler reads `WARN` (17 files; none in
`leavewar/`, `oil.ts`, `tracker/`) → blast radius is scheduler-only. The frozen
face is not stored HTML — `dayIssuedHTML` swaps DAYS for the snapshot and calls
`dayHTML` with `PV=true`, which nulls sev/traceHit/chip/dsh and skips
`dayWarnHTML`; the overlay = stop nulling those under a "show-warnings" mode,
content stays byte-frozen.

## 6. Divergence surfacing (minimal — trimmed per red-team)

Provisional/official is driven by the **publication status of each contributing
commitment**, not a warning-map diff (a draft-caused warning on the official view
is real but must show its draft cause; a within-threshold content edit changes
content but not warnings). Two affordances, no more:
- **"Not Yet Signed" marker — shown to EVERYONE** — on any day whose live
  working copy differs from the signed version (from canonical `dayDelta` /
  filing delta, incl. stashed weeks — not `SCHED.pending` marks). Tells any
  viewer the version in front of them isn't the signed one.
- **Affected warnings marked IN THE LIST** — this is where the scheduler sees
  *which*, no decoding. On the working view, a warning the unpublished change
  will CLEAR shows struck-through with "goes away once signed"; one it will ADD
  shows marked "new once signed". On **both** the flag day and its cause day
  (`WARN.trace` carries `prevDi`/`di`).

**DROP** (owner + Fable, 15 Sep): the publish-button number/tally (a bare count
decodes to nothing on its own — the list shows which); and the wrap-up
align-reminder (a per-browser app has no meaningful session end — the only
"session end" hooks are logout / `resetSession` / `loadWeek`; no timer).

## 7. OIL / Leave War coupling — share the resolver, not the flags

The OFFICIAL document resolves a published day's version through the **same**
`daySnapIn`/`dayCurVerIn` resolver OIL uses — one definition of "which version is
official", so a member's programme and their OIL credit can't disagree. But OIL
keeps its **own eligibility policy** (issued work + acknowledged inputs, no draft
fallback, protects unresolvable dates) and **never reads the warning map**. Same
selector, per-consumer fallback. [FW-004]

## 8. Board & default view — the board fix is a NO-OP (confirmation round)

**There is no separate view-page board to change** (`SchedBoard` opens only on
the edit page; the view-only page — phone AND desktop — is the week view, which
already defaults to the signed face). So:
- **Edit-page board** → WORKING flags. True today; no change.
- **View-only week (phone + desktop)** → signed face + OFFICIAL flags. The ONLY
  change here is that flags now appear on the signed face.
- The live working copy stays viewable by everyone via the per-day "view as
  working" flip (VWORK, open to all — D2): that day shows WORKING flags under a
  "Working draft" stamp, and a differing day carries the "Not Yet Signed" marker.

So D3's "fix the board" is effectively **zero work** — the board already shows
working, and the view week is the surface the whole plan is about. No owner
board-default decision needed (the view page already defaults to signed).
[FW-005, Fable confirm HIGH1]

## 9. Out of scope / decoupled

- **No clock, no wall-clock cutoff** (`weeknav.ts TODAY` is a fixed literal).
- **No EOD coupling** — EOD stays its own parked, designed feature.
- **PDF/CSV export of the PUBLISHED schedule** (owner: exports the *published*
  version, not the working copy) + next-week peek labelling → follow-up
  `[FLAG-EXPORT]` (D3).
- **Content stays byte-frozen**; `tfin.js` parity must stay **728/0**.

## 10. Whole-ecosystem walk (CLAUDE.md standing order)

- **Drift seam (top risk):** WORKING and OFFICIAL bundles MUST come from ONE
  `validate` over two inputs; never a second code path. The alias (OFFICIAL =
  WORKING when no delta) makes the common case drift-proof by construction.
- **Repaint:** every mutation path (`afterSchedMutate`) refreshes both bundles;
  the view board reads the accessor without itself validating.
- **Amendment marks** (`data-alp/aln`) already render on published days — the
  overlay is additive; check no visual collision.
- **Parity:** issued **content** unchanged → `tfin.js` 728/0. `pubsweep.test.tsx`
  changes deliberately (from "no warnings" to "warnings shown, content frozen").
- **Leave War / OIL / Tracker:** don't read `WARN`; OIL shares only the resolver.

## 11. Test-first plan (write before code)

1. Published day (view page) shows crew-rest/run/conflict warnings computed
   against the OFFICIAL version; issued **content** still byte-frozen.
2. Cross-week official bust, both directions: an unpublished Sunday amendment does
   NOT silence next Monday's official bust; a published Sunday's official late
   finish DOES flag next Monday. [F-2/CRP-001]
3. Two adjacent published days, one amended: OFFICIAL vs WORKING differ correctly
   across the dependency window. [F-4/FW-003]
4. Fresh draft busts a published day → shows on both worlds (owner's case).
5. Hidden-fix: WORKING clears a bust, OFFICIAL still shows it until publish → the
   cleared warning shows struck-through ("goes away once signed") on the flag day
   and its cause day; reconciles on publish.
6. Edit-page crew picker greys against the WORKING bundle after an OFFICIAL
   compute (no cross-contamination). [F-1]
7. VCONF change (12→14h) / qual change re-flags published days with unchanged
   content. [CRP-004]
8. Medical unfit / qual lapse flags the OFFICIAL programme immediately (unversioned). [FW-002]
9. A view-page tap on a published-only warning opens THAT warning (world-correct
   focus). [F-3/CRP-007]
10. VWORK'd day shows WORKING flags under its "Working draft" stamp. [D2]
11. Board mirrors its page's week (view→official flags, edit→working). [D3/§8]
12. `tfin.js` 728/0 unchanged; full unit + e2e green.

## 12. Verification (proof commands)

`npm test` · `npm run build` · `node reference/tfin.js` (728/0) ·
`npm run test:e2e` · `npm run smoke:tracker` · then the live-view drive
(`npm run build && vite preview`) — publish a day, confirm the official face now
shows flags with content frozen, on desktop + phone.

## 13. Acceptance criteria

- A published day shows all flags a draft shows, computed against the OFFICIAL
  version; content byte-frozen; parity 728/0.
- The edit surface is unaffected (working flags, picker correct).
- OFFICIAL and WORKING coherent across week boundaries.
- The "Not Yet Signed" marker (everyone) and the in-list "goes away / new once
  signed" markings work; no publish-button number, no wrap-up reminder.
- The view week's signed face flags; the board is unchanged (edit-only, working).
- No clock, no EOD dependency introduced.

## 14. Build hard-spots (confirmation round — handle test-first, verify in code inspection)

The two-picture DESIGN is confirmed by both reviewers. These are the tricky
IMPLEMENTATION spots to get right during the build; each gets a failing test
first, and all are re-checked by the fresh cross-provider CODE inspection after
build (their correctness is only truly provable in code, not the plan).

1. **Cross-week alias gate.** The "alias OFFICIAL = WORKING when nothing diverges"
   short-circuit must be evaluated over the WHOLE dependency window (loaded week
   ∪ previous week back to `maxRun` days ∪ previous Sunday ∪ next Monday), not the
   loaded week alone — else a prior published Sunday's unpublished amendment is
   silenced (test #2's case). And an **unresolvable** issued snapshot must be
   treated as "evidence unavailable" (→ that week protected / no flags, matching
   `dayIssuedHTML`), never as "no delta → alias". [Fable HIGH2, Codex V2-001]
2. **A stashed-day delta comparator.** `dayDeltaIn`/`dayFilingFingerprint` read
   the LIVE `DAYS[di]`, so they can't diff a non-loaded week — add a
   days-parameterised delta that reads `stashDays(v)`; the "Not Yet Signed"
   marker and the gate both use it. [Fable HIGH2, Codex V2-005]
3. **Filing truth is deeper than swapping days.** `withIssuedWeek` must also
   install each approved date's `snapshot.fil` as an override honoured by
   `buildDay`/`inpShow`/`workedSet` during the OFFICIAL run (marking an input 'r'
   must NOT clear an official warning without publishing). Two specific traps:
   (a) `workedSet` counts every non-dormant activity input regardless of
   publication/programme-row → the OFFICIAL 7-day count must derive a signed
   day's work set from the selected document's actual events [Codex V2-002];
   (b) cross-week `buildDay` uses `xweek=true`, which BYPASSES accepted-row
   dedup — replace that blanket bypass with per-date dedup against the selected
   day's own rows + resolved filing, shared by loaded days and boundary seeds
   [Codex V2-003]. [Fable HIGH3]
4. **Trace world-identity.** Cross-day traces and warning references carry an
   explicit world + date and resolve within their originating bundle; clicking a
   trace whose target day currently shows another version is a defined no-op (or
   presents that world), never a throw. Covers the Monday-OFFICIAL-trace /
   Tuesday-shown-via-VWORK case. [Codex V2-004, Fable LOW9]
5. **Marker computed on the LIVE day, BEFORE the snapshot swap** (inside the swap
   a day diffs against itself and reads empty). In-list "goes away / new once
   signed" markings are a keyed diff (key = code + who + flag-day + cause-day,
   excluding the message text so a within-threshold edit doesn't mark spuriously).
   [Fable MED5/LOW8]

Extra test-first cases (added to §11): undo past a publish updates the official
world; file-an-input-'r'-after-publish keeps the official warning; the cross-week
gate (delta-free loaded week + amended stashed Sunday → official bust shows);
`workedSet`/`xweek` dedup correctness; a trace clicked through a VWORK'd day;
DPREV / old-AL preview shows no flags.
