# Session handoff — [AMEND] Phase 3 landed on the branch; Phase 4 simplified by owner

## Branch (select THIS in the new-chat picker)
`claude/amendment-engine-core` — in-flight, **NOT merged**, no "merge live" given.
Origin == local. Base is `main` @ ee78a69 (ARCH-STACK 1A). Do not start from `main`.

## Done this session (committed + pushed)
- **Phase 3 — signatures bound to content (AM-06). COMPLETE — commit `08243e2`.**
  A signature now records what it signed — canonical digest (§5.0) + schedule date +
  current issued base id + candidate (plan/draft) revision — in a new `SCHED.signBind`
  field. Validity is RECOMPUTED on every read (`signMissing`), never cleared by a hook
  (Rev-4 command-layer §2.1): an edit invalidates every signature with no cell touched;
  an undo or in-place revert to the signed content re-validates it (F-09); a plan switch
  or a newer issued baseline invalidates it; issuing a day/AL clears the binding with the
  signature. One production sign path (`ui/Shell.tsx` → `setSign`) binds; a legacy/demo
  signer written straight into `signOf` stays appointment-only-valid (back-compat; demo
  data is reset, not migrated). `signBind` rides `schedFields()`/`histApply`/`histRestore`
  and the store stash. `schema.ts` `SignBinding` + `engine/signbind.test.ts` (9 tests).
  Gates: `npm test` 4657/4657, `node reference/tfin.js` 728/0, `npm run build` clean.
  **Browser gates (`test:e2e`, `smoke:tracker`) NOT run — logic-only; run before merge.**

## Phase 4 — SIMPLIFIED by the owner (14–15 Sep). DO NOT rebuild the elaborate flow.
- **Owner decision:** activating a saved plan is treated EXACTLY like manually editing the
  day into that shape — the changed items show as the normal AL change-marks, you sign,
  and it publishes as the next AL. **No itemised keep/revert review screen, no three-way
  base→issued→candidate comparison, no stale-confirm dialog.** The brief §4 elaborate
  activation flow is REJECTED (see the memory `amendment-plan-activation-is-plain-edit`).
- **This already works** in the app today: `drafts.ts:draftSelect` on a published day →
  `rebaseDayPending` recomputes the diff vs the issued snapshot → publish as the next AL.
  Phase 3 makes the four signatures re-set on that content change, so it can't go out
  still looking signed. Nothing to build for the activation itself.
- A **Phase-4a** increment (`planActivationReview` + `base`/`baseDg` plan provenance +
  `backups.test.ts`) was built, then **REMOVED** (`git reset --hard 08243e2`, local-only,
  never pushed) once the owner simplified it away. Don't reintroduce it.

## NEXT: build the plans selector redesign (design LOCKED 15 Sep 26, not yet coded)
- The rename question grew into a UX redesign of the day's top bar. Mockup v13:
  https://claude.ai/artifact/KKwNPvFbPDeVcFx7xywU3K. Fable red-team + the owner's
  binding decisions: `docs/superpowers/specs/2026-09-15-plans-selector-redteam.md`
  — READ IT FIRST; it has file/line fix specs.
- Summary: ONE white selector button per day (label = what you are viewing: "Live
  working copy" / "Plan B" / amber "👁 AL2"); menu = editable copies on top (switch
  instantly via `switchDraft`) → "Issued · read-only" (preview) → "+ Alt Plan" at the
  bottom. Green title tag = issued version (ORIG/ALn); dashed "DRAFT" when unpublished.
  REMOVE: PART-PUBLISHED week banner, "✓ Published · ALn" pill, green "Live copy" pill
  (Back moves into the read-only bar), the "Drafts" button + old `<select data-dver>`
  on edit surfaces. Publish ALn hidden under preview. "Draft" → "Plan", lettered A/B/C.
  Delete-down-to-one clears the day's plans (option a). View page keeps its pickers.
- Build on Opus high, test-first; one builder for week page + board; five-state
  matrix test; then Codex + Fable bug-check of the diff; browser gates; then hold
  for "merge live".

## After Phase 4 — confirm scope with the owner (don't assume)
- Amendment brief phases NOT built: Phase 3's two leftovers — (a) availability/currency
  invalidation needs AM-04 frozen-availability folded into the canonical digest; (b) the
  publish-entry validation hard-block-vs-acknowledge matrix (§12 item 3) — and Phase 7
  (crew live-draft badge + crew field projection). Phase 5 (migration) is SKIPPED
  (reset demo data). Check which of these the owner still wants vs. what ARCH-STACK
  supersedes: **[AMEND] merging unblocks ARCH-STACK step 2 increment 2** (scheduler
  adoption of the command layer — branch `claude/arch-stack-2-command-core`, spec
  `docs/superpowers/specs/2026-09-14-arch-stack-2-command-layer-spec.md` §7).

## Merge / process
Hold for the owner's explicit "merge live"; run the two browser gates first; don't watch
the PR. Build on Opus, test-first; a Fable/Codex bug-check on the final diff before merge.
Owner is non-technical — plain-language reports, no jargon dumps.
