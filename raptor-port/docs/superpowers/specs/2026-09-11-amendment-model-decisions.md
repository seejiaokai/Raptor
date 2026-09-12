# Amendment model — decisions, open questions & findings (as of 11 Sep 2026)

Consolidated record of the amendment/publish redesign discussion. Design-first;
no code written yet. Companion to the Codex/Astra review brief
(`2026-09-11-amendment-model-design-brief.md`) and the original read-only review
(`2026-09-11-amendment-model-review.md`).

## 1. The core model — SETTLED

- **Unit = the day.** Each day is published, amended and numbered on its own.
- **Per-day isolated numbering, never week-wide (FIXED, owner 11 Sep 26).** Mon
  ORIG→AL1→AL2, Tue independently ORIG→AL1→AL2. An AL number = how many times
  THAT day has been published. A change touching two days = two separate
  amendments, one per day. The multi-day single-AL feature is dropped.
- **Each day is a stack:** frozen issued versions at the bottom (Original, AL1,
  AL2…), one live **working copy** on top.
- **Viewers always see the top issued version.** The working copy is private
  until published.
- **Published = immutable (FIXED, owner 11 Sep 26).** A published version cannot
  be undone or edited. Every change is a **new AL**, re-signed and republished.
- **No in-place correction** — even a typo becomes a new AL (owner chose full
  transparency over convenience).
- **No retract / unpublish** — you never pull a published AL back; you
  **supersede** it with a new AL. A scrubbed day = a new AL that says cancelled.
- **Undo is scoped to the working copy** before publishing; it **cannot cross a
  publish**. Undo history resets at each release (publish).

## 2. Under-the-hood requirement from the numbering choice

- Per-day AL numbers **cannot** be the key the engine looks records up by. With
  Monday AL1 and Tuesday AL1, lookups collide (Astra AM-01). Each issued version
  needs a **unique ID qualified by its date/day**; the per-day AL number is only
  the display label.

## 3. Plans / contingencies — OPEN (decision #1)

- **Before publish:** build Plan A / B / C (full alternate content for the day);
  a decision picks the winner; publish it as the Original.
- **After publish — the fork:**
  - **(a) Plans disappear at publish.** Simplest, safest. If weather turns later,
    edit the working copy and publish an AL (rebuild the wet-weather plan then).
  - **(b) Contingencies survive** as named standby plans. Activating one loads it
    into the working copy, shows its diff against the **current** issued version,
    re-validates and re-signs, then publishes as the next AL — it **never**
    auto-issues (Astra forks A/C).
- **Recommendation:** start with **(a)** unless the squadron genuinely relies on
  standby contingencies; **(b)** is doable but adds the silent-data bugs in §7.

## 4. Owner's calls — ALL RESOLVED (12 Sep 2026)

- **#1 Plans → SURVIVE as backups** (option b), with the §7 safeguards designed in
  (never auto-issues, re-validate on activation, stale-backup trap caught). Owner
  confirmed the riskier option because the squadron keeps ready-made contingencies.
- **#3 Signatures → ALL FOUR re-sign every amendment** (CUR/SKED/PLAN/APPR), bound to
  content; the sign-off UI is the app's existing `.signoff`, unchanged.
- **Crew visibility → option (a):** crew SEE the live draft (renamed from "working
  copy"), badged "not yet issued", on all three surfaces (view-only schedule,
  scheduler view, edit board) — the current issued version stays the authority.
- **SETTLED earlier:** #2 corrections → none (every change is a new AL). Withdrawal →
  none (supersede only). Per-day numbering → fixed.
- The build-ready brief is **`2026-09-12-amendment-model-design-brief.md`** —
  Rev 3 reviewed by BOTH providers (Astra/Codex R-01…R-13+N-01…N-03, Fable/Claude
  F-01…F-12), both converged; **Rev 4 (12 Sep) adds owner refinements, NOT yet
  re-reviewed:** OIL simplified to "the latest published record (EOD, else latest
  AL/Original) is the sole truth" — negative OIL allowed, no date cutoff, keep the
  read-failure protection; **EOD** (End-of-Day actuals record) added and flagged for a
  short design pass before the EOD-touching build; plan **names** are scheduler-typed
  free labels (auto A/B letter kept).
- **Cross-feature — OIL on worked days (leaning, 11 Sep 26):** an amendment that
  removes a person re-derives Leave War auto-OIL from the current published
  version and sweeps it away — right for a future day, wrong for a day already
  worked. Decision: **lock earned OIL on an already-worked (past) day**;
  amendments only affect OIL for days not yet flown. Verified against
  `leavewar/sync.ts` `runOilPass`/`desiredOilCells` + `engine/oil.ts`. Tracked
  for execution (after the amendment rebuild) in `/OUTSTANDING.md`.

## 5. The two original bugs

- **Bug 1 — unpublishing an older AL leaves a contradiction.** DISSOLVED by the
  model: there is no unpublish, and published versions are immutable.
- **Bug 2 — reopen button acts on the live day during preview.** Astra says it
  may **not** reproduce as described — the preview screens already withhold the
  controls (EditWeek renders previews with `ed=false`; SchedBoard passes
  `pv=true` so `boardSignHTML` emits no controls). TO VERIFY before relying on
  it; keep the handler-side preview guards as defence regardless.

## 6. Astra (Codex/GPT-6) review findings — status under the new model

| ID | Finding | Status under hard-freeze model |
|----|---------|-------------------------------|
| AM-01 | Per-day AL numbers collide as record keys | **Still required** — unique date-qualified IDs, per-day number is display only |
| AM-02 | Saved-week migration undefined; Leave War reads saved weeks directly and bypasses migration | **Still required** — versioned, idempotent migration; preserve issue order, effective version, signatures, snapshots, IDs |
| AM-03 | Correct-in-place contradicts frozen contract | **Resolved** — in-place correction removed |
| AM-04 | "Frozen" version still reads availability from live INPUTS, so an issued day can silently change | **Still open** — must define exactly what a published version captures |
| AM-05 | Reopen shows viewers live edits; can claw back Leave War credits | **Resolved** — reopen-in-place and viewer working-copy peek removed |
| AM-06 | Signatures not bound to the content issued (sign Plan A, switch to B, publish) | **Still open** — bind approval to content; clear on plan switch/edit |
| AM-07 | Undo firebreak only at publish is insufficient | **Resolved** — history resets at each release transition |
| AM-08 | Callsign HTML injection in the AL panel tooltip (unescaped) | **Separate security fix** — queued as its own task |

Process note: the review's formal "approved" binding was voided because the plan
file was edited mid-round; the findings still stand. Re-run on a frozen file.

## 7. Foreseeable bugs in the plan flow

**Either way (even pre-publish-only plans):**
- Publishing the **wrong plan** if the selected-plan indicator isn't prominent.
- **Signatures not bound to content** (AM-06) — sign A, switch to B, publish.
- **Undo across a plan switch** restoring the wrong plan or stale marks.
- **Frozen-input leak** (AM-04) — plans differing only in availability.

**Only if contingencies survive publishing (option b):**
- **Stale contingency silently reverts a later amendment** (built pre-AL1,
  activated after — undoes AL1). The main risk.
- **Activating a now-invalid contingency** (crew since on leave / out of
  currency) — must re-validate against today's world.
- **Hidden row-ID drift** between a long-parked contingency and the evolved
  issued version, confusing the "what changed" engine.

## 8. Industry practice (why the model is sound)

Two camps: **shift apps** (Deputy / When I Work / crew rosters) edit a published
schedule but force a change notification + audit log; **regulated document /
tasking control** (aviation ops manuals, ATO MODs, revision control) freeze the
published version and issue a new **numbered revision**, supersede rather than
delete, and keep an immutable audit trail. An "Amendment List" for a flying
programme belongs in the second camp — so hard-freeze + new-AL + supersede
matches the norm for this class of artefact.

## 9. Next steps — DESIGN COMPLETE (12 Sep 2026)

1. ~~Owner decides #1 (plans) and #3 (signatures).~~ DONE (§4) — plus crew-visibility.
2. ~~Rewrite the design brief.~~ DONE — Rev 3 `2026-09-12-amendment-model-design-brief.md`.
3. ~~Re-run the review on the frozen brief.~~ DONE — TWO independent cross-provider
   reviews (Astra/Codex + Fable/Claude), both converged, all design-level findings
   folded into Rev 3; the residual is test-pinned build work (brief §12).
4. **NEXT — build** (HEAVY, saved-data, test-first, on Opus, cross-provider code
   inspection), but it sits BEHIND the two Tracker fixes in `/OUTSTANDING.md` priority
   order, and nothing merges without the owner's "merge live". The AM-08 security fix
   is done (PR #393, live 11 Sep 26).

## 10. Context & rationale (from the design chat, 11 Sep 2026)

Kept here so a future session resumes with the *thinking*, not just the decisions.

**Interactive mockups built to settle the model (still openable):**
- Week-wide vs per-day numbering comparison — https://claude.ai/code/artifact/85fa335b-882c-4702-ad4e-e07ab5fd8865
- Single-day life-cycle simulator (build → publish → amend → reopen → preview → undo) — https://claude.ai/code/artifact/c6a23b5d-5d44-432c-a783-e44bca2cd3d5
- This decisions record, rendered — https://claude.ai/code/artifact/84d10b30-8044-493c-abbc-e9da28b3f639

**Why published is immutable + every change a new AL (industry-anchored).** Two
camps exist: hourly shift apps (Deputy / When I Work / WhenToWork) edit a published
schedule but force a change-notification + audit log; regulated document / tasking
control (aviation ops manuals, military ATO MODs, document revision control) freeze
the published version, issue a new *numbered* revision, and **supersede rather than
delete**. A flying-programme "Amendment List" belongs to the second camp, so
hard-freeze + new-AL + supersede is the norm for this class of artefact, not an
unusual choice.

**Reopen / correct / withdraw / undo — the reasoning:**
- The old "reopen the same day and re-issue under the same number" is **removed** —
  it silently rewrote what was already out. To change a published day you **Amend**
  (a new AL).
- **No in-place correction, even for a typo** — owner chose full transparency (every
  change visible as its own AL) over convenience.
- **Undo never crosses a publish** (publishing is a firebreak; history resets at each
  release). Undoing a publish is a silent retraction — it contradicts immutability —
  and Astra (AM-07) showed undo+unpublish+redo can resurrect a withdrawn issue.
- **No withdrawal / unpublish** — you supersede with a new AL (a scrubbed day = a
  "cancelled" AL), mirroring how an ATO MOD supersedes rather than deletes.
- **Safe recovery path:** to return to an earlier version's content, **load it into
  the working copy and republish as the NEXT AL** (from AL3, load the Original →
  publish AL4). Old versions stay frozen; viewers keep seeing AL3 until AL4 publishes.

**Plans / contingencies (decision #1, open):** the foreseeable-bug surface (§7) is
mostly created by letting contingencies survive publishing; pre-publish-only is the
safe default.
