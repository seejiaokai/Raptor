# Session handoff — amendment engine redesign: DESIGN COMPLETE (12 Sep 2026)

## Where it landed
Owner (non-technical) resumed the amendment-model work and, this session, **settled
the last decisions, approved the UI, and the design was taken to a build-ready,
twice-reviewed brief.** Design-first — NO code written. Owner went to sleep partway
and authorised autonomous completion of the design loop (his words: "self run these
until the task is completed… u may call fable too").

## Decisions settled this session
- **#1 Plans → SURVIVE as backups** (the riskier option; squadron keeps ready-made
  contingencies), with safeguards designed in (never auto-issues; re-validate on
  activation; stale-backup trap caught via durable base-version provenance).
- **#3 Signatures → all four (CUR/SKED/PLAN/APPR) re-sign every amendment**, bound to
  content; sign-off UI = the app's existing `.signoff`, unchanged.
- **Crew visibility → they SEE the live draft** (renamed from "working copy"), badged
  "not yet issued", on all three surfaces; the issued version stays the authority.

## Produced
- **UI mockup (approved):** interactive, in the app's real palette/fonts, with the
  app's real sign-off — https://claude.ai/code/artifact/90a30794-acb2-45f9-80ce-57f79b3edc27
- **Build-ready brief:** `raptor-port/docs/superpowers/specs/2026-09-12-amendment-model-design-brief.md`
  (Rev 3). It states the settled model + the pinned contracts + a §12 list of the
  work explicitly deferred to the build (test-pinned).
- **Two independent cross-provider reviews, both incorporated:** Astra/Codex
  (R-01…R-13, N-01…N-03) and Fable/Claude (F-01…F-12). Both converged; Fable caught
  extra design-level blockers (surviving retraction paths F-01; publish trigger keyed
  on slot-keys F-02; `ground[].src` re-land F-04; `navigator.locks`/size-budget
  F-07/F-08). Raw review outputs are in the session scratchpad (not committed).
- Docs updated: `2026-09-11-amendment-model-decisions.md` (§4/§9 marked resolved),
  `/OUTSTANDING.md` [AMEND] (DESIGN COMPLETE), the old `-design-brief.md` (SUPERSEDED
  banner).

## Shipped
- Docs-only. Committed to a `claude/` branch and pushed; PR open, awaiting the owner's
  **"merge live"**. No gates (docs-only path skips them). Nothing merged to `main`.

## NEXT — the build (NOT started; needs the owner)
- **[AMEND] build** — HEAVY, saved-data, test-first, on Opus, with cross-provider code
  inspection. Its first tasks are the §12 test-pinned specs (enumerate the canonical
  field list from `engine/schema.ts`; the deterministic migration mapping; the
  signature-invalidation matrix; the undo apply-list; the crew field projection; the
  `navigator.locks` lease). It sits BEHIND priority #1 in `/OUTSTANDING.md`:
- **[TRK-IMPORT] + [TRK-LEDGER]** (priority #1) — two Tracker fixes already built on old
  branches (`claude/tracker-import-conflict-fix` #386, `claude/storage-legacy-import-ledger`
  #387); re-check vs current `main`, then merge-live. Real silent-data fixes.

## Pick up here
The design is done and shelf-ready. Next working session: either (a) land the two
Tracker fixes (priority #1, quick — re-check + merge-live), or (b) start the [AMEND]
build from the Rev 3 brief §12 task list. Read `/OUTSTANDING.md` first, then the Rev 3
brief. The build is big and risky — keep it test-first and cross-provider-checked, and
don't merge without the owner's "merge live".
