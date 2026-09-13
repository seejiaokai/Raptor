# 1A stable-ids — plan review log (append-only)

Roles: host=Claude, planner=Claude, reviewer=Codex/Astra, builder=Claude, inspector=fresh Codex.
Plan: `2026-09-13-stable-ids-step1a-spec.md`. Reviewer model requested: `gpt-6-astra` effort=high.
Rounds cap 5. Authorization: plan + build (owner), NO merge without "merge live."

## Round 1 — Astra (gpt-6-astra, high), codex-cli 0.154.0 — verdict REVISE
Plan SHA256 `1deab4c181c591832dae6f62234c006a0aad12625a5d4e73eec064ade47e04cc`.
Result: `scratchpad/astra-review-1a/claudex-cos3vp2w/result.json` (241s, session 01a0990c-…).

6 findings, all **ACCEPTED** and folded into the spec (2026-09-13):
- SID-01 (high) accept/undo/edit action addresses (`data-acck`, `data-inpedit`, SANS label,
  interactions.ts:479/656) still use inpKey → convert all action routing to inpId/inpById.
- SID-02 (high) week stash `unacceptedKeys()`/restore + `reconcileLandedAcc`(store.ts:408) +
  `reconcileDayFiling`(slots.ts:475) store/lookup by inpKey → store input IDs, look up by inpId.
- SID-03 (medium) day-template `sanitiseBlob`/`DayTplBlob`/`mintBlob` keep only string notes →
  update template note representation + capture/save/sanitise/apply; verify notes survive reload.
- SID-04 (medium) template apply deep-copies note ids (stripRowIds/ensureRowIds skip notes) →
  mint FRESH note ids on every template apply (before snapshots); preserve ids for undo/drafts.
- SID-05 (high) loader installs pre-1A weeks/snapshots/drafts unchecked → explicit coordinated
  storage-format reset BEFORE hydration, across inputs + all saved weeks + nested snapshots/drafts
  + incompatible templates; retained acc must not suppress fresh landings.
- SID-06 (medium) parity adapter `refwin.ts:reday` copies raw notes + `parity.test.ts` deep-equals
  raw DAYS → add reference adapter projecting note.t, exclude note identity, keep text-render pins.

Extra conversion sites Astra surfaced (coverage): renderers `board-html.ts:179`, `peek.ts:130`,
`board.ts:824`; `srcInput`/late indicators + board ground deletion resolver; `persist.test.ts:73`
expects literal `i59`. CSV export does NOT emit day notes (no export change needed).

Dispositions: no rejections. Astra endorsed the staged positional note-addressing boundary.
Next: revised plan → Round 2 (resume, same model/effort) for approval before build.

## Round 2 — Astra (gpt-6-astra, high) — verdict REVISE
Result: `scratchpad/astra-review-1a/round2/claudex-tinkcczj/result.json`. SID-01..06 addressed at
plan level. ONE new finding, ACCEPTED:
- SID-07 (medium) storage reset (Work item 3) commits the format stamp without guaranteeing durable
  deletion first; Postman.flush sends concurrently and swallows send failures for retry, so a
  week-deletion can fail while the stamp succeeds → reload skips the reset and hydrates the
  incompatible week. Fix: restart-safe ordering — awaited/verified backend cleanup BEFORE attaching
  Postman; stamp committed LAST, only after cleanup verified; on failure leave stamp unset and don't
  hydrate incompatible records. + a forced-deletion-failure reboot regression. (Same family as
  [TRK-DISK].) Folded into §Work item 3.
Disposition: accepted, no rejections. Next: Round 3 (resume) for approval.

## Round 3 — Astra (gpt-6-astra, high) — verdict REVISE
Result: `scratchpad/astra-review-1a/round3/claudex-tinkcczj?`. SID-01..07 resolved at plan level
(SID-07 ordering "now correct"). ONE new finding, ACCEPTED:
- SID-08 (medium) the SID-07 fix named `HOOKS.storeBackend`, which does not exist: engine/hooks.ts
  `storeBackend` is a sync settings KV (getItem/setItem, initially null, no delete). Verified in
  source: the durable record store is the `Backend` instance passed to `bootStorage(backend)` with
  async `remove(collection,id)` (storage/backend.ts:15, browser.ts:57). Fix: await backend.remove +
  verify, await put(stamp), fill whiteboard from the verified snapshot, then attach Postman/hydrate.
  Folded into §Work item 3. (Note: CLAUDE.md's "HOOKS.storeBackend" phrasing is loose — real API is
  the Backend instance.)
Disposition: accepted, no rejections. Next: Round 4 (resume) for approval.

## Round 4 — Astra (gpt-6-astra, high) — verdict APPROVED
Result: `scratchpad/astra-review-1a/round4/…/result.json`. SID-01..08 all resolved at plan level;
0 findings. Approval bound to plan SHA256 `9023e824c71016be5a0508ab225bd35b84d5ca767c80db6c46fc208c71cb9cdb`.
Proceeding to build (Opus): Item 1 (input action-routing by id + iid) → Item 2/3 (notes + storage
reset + parity adapter). Full gates before any merge. HOLD for owner "merge live". Final code
inspection by a fresh Codex/Astra session after build (plan review ≠ code review).

## Post-build code inspection — Codex (gpt-6-astra) + Fable (independent), 13 Sep 26
Reviewed the built diff 156ee39..HEAD. Both read the real code; full unit suite green at review.
Dispositions:
- Codex SID-IR-02 / Fable #3 (reset failure swallowed → next boot wipes new work): FIXED — resetPreSchema now PROPAGATES failure so bootStorage rejects to the Retry screen; never a half-reset write-enabled app. Pin updated.
- Codex SID-IR-01 / Fable #5 (reload leaves auto-landed inputs accepted with no row — pre-existing, both reproduced; the spec's Work item 3 promised to cover reload): FIXED — the no-stash boot path now clears a hydrated 'g' before re-landing (mirrors applyWeekModel). New pin in persist.test.
- Fable #1 (edit/delete an accepted input whose row is on a NON-loaded week → silent stale link, a 1A regression from the stable id): FIXED per owner's "guard now" call — commitInputEdit/removeInput refuse with "Load the week of <date>…". New pin in loadweek.test.
- Fable #2 (an accepted 'Other' whose input is later deleted loses its hard-clash grade): DEFERRED to step 4 (one Absence record) — very narrow; noted in OUTSTANDING. (Owner call.)
- Codex SID-IR-03 (seed note ids minted at boot, not fixed in the literal): spec §2.3 reconciled — mirrors the rid convention; pristine-navigation id stability is a rid-system-wide step-2 concern.
- Codex SID-IR-04 / Fable #4 (missing regressions; weak note pins): ADDED — note-identity-through-template (SID-03/04), reload-landing pin, cross-week refusal pin; persist.test note pins use mkNote + noteText.
Both providers confirmed clean: no content-key action address left, every note reader via noteText, rid sharing safe on copy, reset stamp-last/verified, twins/idempotency, parity, deterministic elogGroups.

## Pushed + gate verdict (13 Sep 26)
Pushed 156ee39..79669d2 → PR #396, Vercel preview:
https://raptor-git-claude-amendment-engine-core-kai-e2f5.vercel.app
Gates: unit 4648/4648, build clean, parity 728/0. Browser gates: 2 e2e failures
(board brief-inline geometry; LW touch-sheet) + the Tracker addStudent smoke are
ALL PRE-EXISTING/flaky — proven identical on the pre-1A base commit (156ee39):
e2e fails the same 2 on base; smoke flakes on base too (run1 426/0, run2 260+timeout,
the documented slow-runner addStudent race). Reset ruled out (disabling it changed
nothing). None are caused by 1A. HELD for owner "merge live".
