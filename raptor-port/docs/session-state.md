# Session handoff — [AMEND] plans selector redesign BUILT (holding for "merge live")

## Branch (select THIS in the new-chat picker)
`claude/amendment-engine-core` — in-flight, **NOT merged**, no "merge live" given.
Base is `main` @ ee78a69. Do not start from `main`.

## Done this session (committed + pushed) — the plans selector redesign
Built test-first on Opus, to the LOCKED spec
`docs/superpowers/specs/2026-09-15-plans-selector-redteam.md`. What changed:
- **ONE white selector button per day** (`planSelectorHTML`, `html.ts`), shared by the
  week day head (`.dhtpl`) AND the board sign strip (`.sb-pub`) — one builder, A5.
  Label = what you're viewing: "Live working copy" / the plan name ("Plan B") /
  amber "👁 AL2" while previewing. Opens ONE menu (`planMenu`, `board.ts`): editable
  copies on top (tap = switch instantly via `switchDraft`, A4) → "Issued · read-only"
  (tap = preview) → "+ Alt Plan" at the bottom (`draftDup`).
- **Green title tag** (`verTagHTML`) beside the day title names the issued version
  (ORIG/ALn); dashed "DRAFT" while unpublished. It REPLACED the "✓ Published · ALn"
  stamp. Edit-surface only (the view page keeps its own pickers).
- **"Draft" → "Plan", lettered A/B/C** (`drafts.ts` `nextName`, C1) — lowest unused
  letter, so renaming frees a letter to reuse. `DraftsModal` text + toasts renamed (C5).
- **Removals**: the "Drafts" button, the grouped `<select data-dver>` on edit surfaces,
  the green "Live copy" pill, the "✓ Published · ALn" stamp, and the **week-status
  banner text** (DRAFT/PART-PUBLISHED/APPROVED) — the per-day tags carry it now; the
  banner keeps only the AL roll (`Shell.tsx`). **← Back to live** moved into the
  read-only preview bar on BOTH surfaces (A2).
- **Must-fix A1–A8 all in**: A1 two-tap discard confirm kept; A3 "Publish AL" hidden
  under preview; A6 selector renders inside the excised `.dhtpl` (byte-parity held via a
  balanced-span `noDhTpl`); A7 `.wavemenu` scroll ceiling; A8 label clamp.
- **B1 (owner option a)**: deleting plans down to ONE clears the day's plans → back to
  "Live working copy" (`draftDelete`).
- **New test**: `src/ui/planselector.test.tsx` — the five-state matrix + menu behaviours.

## Cross-provider bug-check (Codex + Fable) — DONE, findings fixed
Both reviewers inspected commit `43edb04`. They converged; a second commit fixed the real
findings:
- **HIGH (Codex PS-001):** `ALPanel.tsx`'s per-day "Publish AL" was NOT guarded under a
  preview — a third publish surface I'd missed. Now locked while `DPREV.has(di)`, plus a
  guard in the `data-alpub` handler.
- **A3 pending-chip (both):** under an active preview the "N pending" chip read the previewed
  snapshot's delta, not the live count. Now uses PVND (agrees with the restore bar); the
  frozen issued-default face (PVQ) still shows nothing.
- **nextName past-Z (both):** beyond 26 plans the numeric fallback could repeat "Plan 27".
  Now a whole-name walk — always unique.
- **PS-002 / Fable #3:** the view page's `d:` preview could bleed onto the edit surfaces.
  `viewVerSelHTML` now gated `!ed&&!vsel`; `setPage` clears `d:` previews entering the edit page.
- **PS-004:** "+ Alt Plan" during a preview now clears the preview.
- **Fable #4:** the read-only bar's "← Back to live" is now edit-surface only (`vsel`).
- **A8 (both):** the selector tooltip now carries the full plan name.
- **Cleanup:** removed dead `.livebtn`/`.ddraft`/`.sb-dver` CSS + stale comments.
- **DEFERRED / flag to owner (Codex PS-003):** the board hides its whole sign strip (and so
  the selector) under a preview — long-standing behaviour; "← Back to live" is still in the
  board's warn bar. Fable validated the current behaviour. Left as-is; confirm if you want the
  selector kept visible under a board preview too.

## Gates (re-run after the fixes)
- `npm test` **4664/4664** ✓ · `node reference/tfin.js` **728/0** ✓ · `npm run build` clean ✓
- `npm run test:e2e`: **2 failures, both PRE-EXISTING and unrelated** (proven by a clean
  `git stash -u` run on the base commit — they fail without any of this work; e2e had not
  been run since Phase 3): `geometry.spec.ts:1976` (board flying-line brief inline at phone
  width — board grid CSS I never touched) and `leavewar.spec.ts:2241` (the Leave War tab,
  a separate app I never touched). **Flag to owner; spin off separately — NOT part of [AMEND].**
- `npm run smoke:tracker`: run this session (see the report).

## NEXT
1. Codex + Fable bug-check of the diff (in flight / see report).
2. Hold for the owner's explicit **"merge live"** — then the "done means live" chain.
3. The two pre-existing e2e failures want their own fix session (offered as spawned tasks).

## After merge — [AMEND] merging unblocks ARCH-STACK step 2 increment 2
Scheduler adoption of the command layer — branch `claude/arch-stack-2-command-core`,
spec `docs/superpowers/specs/2026-09-14-arch-stack-2-command-layer-spec.md` §7.
Also still open from the amendment brief: Phase 3 leftovers (AM-04 frozen availability in
the digest; the publish-entry hard-block-vs-acknowledge matrix) and Phase 7 (crew live-draft
badge). Confirm scope with the owner; don't assume.
