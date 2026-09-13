# Amendment Phase 2 — the legacy-book QUARANTINE, redesign brief

**Why this doc exists.** The Phase-2 coupled record rewrite is built and its two
Codex fix-cycles are done and committed (round-1 `4f39c35`, round-2 `169e85a`, on
`claude/amendment-engine-core`). All local gates are green at `169e85a`:
unit **4575/4575**, parity **728/0**, build clean. BUT a **third** fresh Codex
inspection (round 3, `--base d125fd5`) still returned **REVISE — 8 findings**, and
the pattern across all three rounds is unmistakable: the "an unsupported/legacy
book is READ-ONLY (quarantine)" rule was enforced by adding a guard at each write
site as it was discovered, and every fresh inspection finds another writer the
spot-guards missed. **This does not converge.** The next step is a proper
redesign — ONE choke-point — not a fourth patch round. (Owner chose this
direction, 12 Sep 26.)

Everything the crew-facing amendment ENGINE does (the per-day verId record, the
canonical diff, publish eligibility, marks, OIL credit, byte-preservation of the
old blob) is in place and passing. The remaining work is almost entirely the
**enforcement surface** of the read-only quarantine, plus two filing-state
knock-ons and one legacy no-op.

---

## The core insight (read this first)

The quarantine invariant is: **while an unsupported / wrong-week / unreadable
book is the evidence for a date, NOTHING may mutate that date's schedule, inputs,
filing, drafts, publication, or persisted bytes.** That invariant must hold at
EVERY writer. It cannot be enforced by guarding writers one at a time — there is
always another (a page that writes `INPUTS` directly, a medical cascade, the
Leave-War sync, a draft switch, a recovery load, a publish, a whole-day replace,
a persist writeback). Three inspection rounds each found the next one.

**The fix is a single enforcement point (or a very small number of them):**

1. **ONE date/week protection predicate** — already partly built as
   `state/store.ts:protectedDates()` (loaded week if `protectedWeek()`, plus every
   stashed week classified `unsupported`, plus unreadable stashes). Promote this to
   the authority: `isProtectedDate(iso)` / `isProtectedWeek(key)`.
2. **ONE input-write preflight** every input mutator passes through — the
   Inputs-page Add, `commitNewInput`, `commitInputEdit`, `removeInput`,
   `reassignInput`, the medical create/trim cascades, `setInpField`, filing
   (`acceptInput`/`unacceptInput`), and the Leave-War outbound sync. If a writer
   bypasses the funnel today (P2-REV2-04), route it through the preflight.
3. **Schedule-mutation boundaries** each check `protectedWeek()`: draft switch
   (`engine/drafts.ts:draftSelect` / `ui/interactions.ts:802`), recovery
   (`loadVersionToWorkingCopy` / `interactions.ts:827`), whole-day template replace
   (`board.ts:pickDayTpl` — already guarded), and publication
   (`publishALDay`/`alIssue`/`setDayApproved`).
4. **Load/persist quarantine state** is explicit and survives: distinguish
   *missing* storage from *unreadable/invalid* storage; preserve the original blob
   for BOTH unsupported and unreadable; never write seed over an unreadable saved
   week; OIL protects those dates in both reconciliation directions.
5. **Authoritative rendering** (`dayIssuedHTML`) classifies via the week key
   (`amFormatOf`/`protectedWeek`), NOT by whether verIds happen to resolve — an
   `amV=999` book with resolvable ids is still unsupported.

When every writer passes one gate, a future inspection has nothing left to find.

---

## The 8 round-3 findings (P2-REV2-01..08), for the redesign to subsume

Artifact (round 3): `C:\Users\User\AppData\Local\Temp\claudex-ap961hcf\reply.txt`
(the runner marked `result.json` status `failed` on `"Invalid limitations list."`
— a schema post-validation quirk; the review itself is valid: verdict **REVISE**).

- **P2-REV2-01 · HIGH · state/store.ts:394 (applyWeekModel).** An UNREADABLE stash
  (malformed JSON, or parsed without a `d` array) is treated as *absent*: it loads
  seed, resets SCHED, clears preservation. Opening a damaged saved week therefore
  DESTROYS the protection the OIL reader gave it, and `persistAll` then serializes
  the seed replacement over it. **Fix:** distinguish missing from unreadable;
  preserve the original blob and hold an explicit quarantine state through load +
  persist + both OIL directions; never seed over an unreadable saved week.
- **P2-REV2-02 · HIGH · ui/interactions.ts:802 (+ engine/drafts.ts:165, interactions.ts:827).**
  A quarantined week still exposes its saved DRAFTS via the version selector and
  the preview's "Switch to this plan"; `draftSelect` replaces `DAYS` and reports
  live, but persistence keeps the original blob → the accepted switch vanishes on
  reload. Recovery (`loadVersionToWorkingCopy`) has the same missing guard.
  **Fix:** enforce quarantine at draft-activation, recovery and whole-day-replace
  boundaries; suppress those mutation buttons on protected weeks (keep read-only
  previews). Add a preview→switch→navigate→reload regression test.
- **P2-REV2-03 · HIGH · engine/publish.ts:565 (publication) + html.ts (dayIssuedHTML).**
  Unsupported ≠ unresolvable ids: an `amV=999` book with valid verIds + a changed
  draft can PUBLISH (dayDelta computes, `publishALDay` checks only approval/delta/
  signatures, `alIssue` proceeds even when `stampAmFormat` declines) — then
  `persistAll` preserves the original blob and the new issue is lost on reload.
  `dayIssuedHTML` also treats resolvable-but-unsupported records as authoritative.
  **Fix:** reject unsupported books at publication entry points + affordances using
  the week key; classify authoritative rendering by `amFormatOf`, not id resolution.
- **P2-REV2-04 · HIGH · ui/InputsPage.tsx:420 (+ medical, sync).** The Inputs-page
  Add path `unshift`s records directly inside `writeInputsBatch`, bypassing
  `commitNewInput`/`protectedInput`; the medical creation path and Leave-War
  outbound sync also write `INPUTS` directly. So quarantined dates are still
  editable. **Fix:** ONE shared preflight for every source/destination date before
  any input batch mutates; route ALL creation/cascade/filing/sync writers through it.
- **P2-REV2-05 · MEDIUM · state/store.ts:444 (navigation) + recovery.** Recovery
  removes a ground row but retains global filing 'g'; a later AL2 freezes `fil='g'`
  with no row; navigation clears 'g' (no row to reconstruct) → phantom amendment
  from navigation. **Fix:** persist the live ground-filing decision independently
  of ground-row reconstruction (or reconcile filing during replacement before the
  snapshot); navigation must never silently change it.
- **P2-REV2-06 · MEDIUM · ui/inputedit.tsx:859 (commitInputEdit).** Keeping `acc='u'`
  globally (the P2-IMPL-05 fix) exposed an off-week loss: editing only an input's
  REMARKS from another loaded week captures `wasAcc='u'`, unaccepts it, finds no
  covered day in the loaded `DATES`, reports "Moved outside the programmed week"
  and deletes the remaining 'r' — silently turning 'u' into fresh. **Fix:** preserve
  an unchanged 'u' without requiring a landing in the loaded week; separate the
  global filing decision from ground-row relinking; distinguish a real date/type
  move from an off-week remarks edit.
- **P2-REV2-07 · MEDIUM · ui/board.ts:559 (DAYTPL_ARM).** The template-apply arm is
  content-scoped (P2-IMPL-10) but NOT invalidated on navigation: arm on a week,
  leave and return without changing content, one pick applies immediately. **Fix:**
  invalidate the confirmation on navigation / page or session change / intervening
  edits or draft switches (an explicit confirmation lifecycle or a monotonic
  revision token), keeping the intended menu-close→reopen confirm flow.
- **P2-REV2-08 · LOW · engine/keys.ts:43 (shiftKeys/permuteKeys).** These assign
  `a.keys`/`a.adds`/`a.structAdds` even when absent, so a delete/reorder mutates
  already-ISSUED current-format records and re-adds three fields the Phase-2 record
  contract removed (on unrelated days too). `snap`/`diff` stay intact but the
  serialized issued record does not. **Fix:** don't remap issued-record keys for
  current-format live edits; keep any legacy conversion in an explicit migration.

---

## What is already DONE and committed (do NOT redo)

Round-1 (`4f39c35`) fixed P2-IMPL-01..12; round-2 (`169e85a`) fixed
P2-REREVIEW-01..12. Highlights the redesign builds ON, not over:
- The verId record model, canonical diff (incl. surviving-row additions),
  `dayHasChanges`=`dayDelta` only, `dayCurVerIn` descending-valid fallback,
  `dayDiscardCount` (content-only), `isValidVerId`, `amFormatOf(sc, weekKey)`
  (wrong-week detection), the preserved-blob registry (`engine/weekstash.ts`),
  `protectedDates()` (`state/store.ts`), folding cxr/standalone/noconf/shift/sa/src
  into the dayKeys row composites (mark system now sees them; wx/fx/bx/bxr/gx
  synthetics retired), the OIL protectedDates pass, SchedBoard `verSeq` fix.
- ~31 new tests pin these. The redesign must keep them green and not regress them.

The round-3 findings are the ENFORCEMENT gaps around this working engine.

---

## Plan for the fresh session

1. **Design the choke-point(s)** per "The core insight" above. Prefer promoting
   `protectedDates()` into a shared `isProtectedDate(iso)` and one input preflight.
2. **Test-first, one finding-cluster at a time**, keep the full gate set green,
   never weaken an assertion. Suggested order: the input choke-point (04, 06), the
   schedule-mutation guards (02, 03), load/persist quarantine state (01), filing
   persistence (05), template-arm lifecycle (07), keys.ts legacy no-op (08).
3. **Full gate set once** when green: `npm test`, `node reference/tfin.js` (728/0),
   `npm run build`. (e2e/smoke unaffected by engine/state changes — Linux CI is the
   geometry arbiter.)
4. **Cross-provider bug-check (owner wants BOTH — this is important/robust):**
   - **Codex/Astra** — the inspect runner:
     `C:\Users\User\.claude\plugins\cache\claudex-loop\claudex-loop\2.1.0\skills\claudex-loop\scripts\runner.py`
     `inspect --host claude --builder claude --repo C:\Users\User\projects\Raptor
     --plan raptor-port/docs/superpowers/specs/2026-09-12-amendment-phase2-implementation-plan.md
     --base d125fd5 --model gpt-6-astra --effort high --timeout 1800`, with
     `PYTHONUTF8=1 PYTHONIOENCODING=utf-8`. A `charmap` crash OR a
     `status:"failed"` on `"Invalid limitations list."` is display/validation only
     — read `reply.txt` (the raw verdict+findings), not just `result.json` status.
   - **Fable 5.1, high** — an independent adversarial bug-check (a different model
     from the one that built it). Spend the scarce Fable allowance here.
5. **Do NOT merge** until the owner says "merge live" AND Codex is clean.
   PR #395 and the EOD feature stay untouched. No-auto-merge stands.

---

## Fresh-session opening prompt (ready to paste)

> Resume [AMEND] Phase 2 — the legacy-book QUARANTINE redesign, on branch
> `claude/amendment-engine-core`. Opus 4.8, high. I'm the non-technical owner.
> First invoke the task-observer skill, then read
> `raptor-port/docs/superpowers/specs/2026-09-12-amendment-phase2-quarantine-redesign.md`
> (this brief — the 8 round-3 Codex findings + the one-checkpoint design) and
> `raptor-port/docs/session-state.md` (the handoff). The Phase-2 engine is built
> and gate-green (unit 4575/4575, parity 728/0, build clean) at commit 169e85a;
> rounds 1–2 of Codex fixes are done. Round 3 = REVISE (8 findings) because the
> read-only quarantine was spot-guarded and keeps leaking. Build the ONE
> choke-point design in the brief, test-first, keep every gate green, never weaken
> an assertion. When green, bug-check across BOTH Codex/Astra (the inspect runner,
> PYTHONUTF8=1, read reply.txt) AND Fable 5.1 high. Do NOT merge until I say
> "merge live" AND Codex is clean. Leave PR #395 and the EOD feature alone.
