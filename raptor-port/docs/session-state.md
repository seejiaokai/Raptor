# Session handoff — [ARCH-STACK] step 1A (stable ids) landed LIVE

## Where it is
`[ARCH-STACK]` **step 1 — stable ids** is done and **merged to `main` and live** on the
GitHub Pages site (deploy green, verified in a real browser: app boots, day notes render as
text, no console errors). This is the foundation the rest of the stack keys on.

## What shipped (PR #396, merged 13 Sep 26; commits `6be0385..ee78a69`)
Step 1A, built and hardened in the full loop (plan → Astra 4-round red-team → build → Codex +
Fable code inspection → gates → merge live):
- **Item 1 — input filing by stable id.** Personal inputs are filed/accepted/undone/edited by
  their opaque `iid` (`newId('i')`), not the content key `inpKey`. Twins file independently; the
  accept guard is now a same-input idempotency check. `[INP-CSID]` is DELIVERED by this.
- **Item 2 — day notes are `{ rid, t }` objects** (engine/note.ts), rid minted by the rowids
  walk, re-minted per template-apply copy, kept for drafts. Addressing stays positional (`dn:`).
- **Item 3 — coordinated storage-format reset** (storage/reset.ts): a returning browser's pre-1A
  blob (string notes, content-key `src`) is cleared before hydration and the schema stamped last,
  after verified durable deletes; a failed reset fails the boot to Retry (never a half-reset).
- Plus a determinism fix surfaced by the work: edit-history groups order by log position, not a
  ms wall-clock (was a latent flake).
- Review record: `docs/superpowers/specs/2026-09-13-stable-ids-step1a-spec.md` (+ its review-log).

## Follow-ups (small, tracked)
- **1A finding 2 (deferred to step 4)** — an accepted `Other` whose input is later deleted loses
  its hard-clash grade. Narrow; dissolved by the one-Absence-record step. Logged in OUTSTANDING
  under `[ARCH-STACK]`. (Finding 1, the silent cross-week edit, was GUARDED in this PR.)
- **Pre-existing browser-test flakes on a loaded local machine** (2 geometry specs + the Tracker
  addStudent race) — they PASS in CI; not 1A. Don't chase them locally without CI as the arbiter.

## Pick up here — the next stack steps (each its own FRESH chat)
`[ARCH-STACK]` order continues (see the plan doc + OUTSTANDING):
- **1B — Tracker course/syllabus ids** (`[TRK-CSID]`). Independent module; its final review wants
  Fable (now recharged). Spec → Astra red-team → build → Fable-high final → gates → hold.
- **1C — `who → personId`** — the callsign becomes a hidden person tag. LARGE and parity-sensitive
  (`who` is the printed puck value, ~112 uses/28 files, pinned by `reference/tfin.js`). Its own
  spec + red-team; least urgent for correctness. Keep OUT of the smaller id work.
- Then **step 2** — the one write/command layer everything else consumes.
Process per step: design → red-team (Astra lead, Fable for the crux) → build → inspect (both
providers on the built diff) → gates → hold for "merge live".
