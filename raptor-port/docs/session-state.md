# Session handoff — [AMEND] Phase 2: engine built + gate-green; quarantine REDESIGN is next

## Where it stands (branch `claude/amendment-engine-core`, HEAD `169e85a`)
The Phase-2 coupled amendment-record rewrite is **built and gate-green**, and TWO
full Codex fix-cycles are done and committed:
- `4f39c35` — round-1 fixes (P2-IMPL-01..12)
- `169e85a` — round-2 fixes (P2-REREVIEW-01..12), incl. 2 regressions round-1 caused
All local gates green at `169e85a`: **unit 4575/4575 · parity 728/0 · build clean**.
(Not pushed until the checkpoint is committed — see below. Not merged; owner says
"merge live" gates the merge, and No-auto-merge stands.)

## What's NEXT — the quarantine REDESIGN (owner decision, 12 Sep 26)
A **third** fresh Codex inspection (round 3, `--base d125fd5`) still returned
**REVISE — 8 findings (P2-REV2-01..08)**. The pattern across all three rounds: the
"unsupported/legacy book is READ-ONLY (quarantine)" rule was enforced by adding a
guard at each write site as it was found, and every inspection finds another
writer it missed — it does not converge. The owner chose to STOP spot-patching and
do it properly: **ONE choke-point every edit/input/publish/draft path passes
through**, plus explicit quarantine state through load/persist/OIL.

**The full brief — the 8 round-3 findings + the one-checkpoint design + the
ready-to-paste opening prompt — is:**
`docs/superpowers/specs/2026-09-12-amendment-phase2-quarantine-redesign.md`
(a scratchpad backup also exists this session). Read it first.

## Do it in a FRESH session, Opus 4.8 high
This branch's chat ran long (2 fix cycles + 3 inspections); the redesign is a big
new task, so start fresh (owner's own rule). The cross-provider bug-checks read the
committed code + the brief, not the chat — so nothing is lost by starting clean.
When green, bug-check across BOTH Codex/Astra (the inspect runner; PYTHONUTF8=1;
read `reply.txt`, since the runner can stamp `status:failed` on a `limitations`
schema quirk while the verdict+findings are valid) AND Fable 5.1 high.

## Note for whoever drives git
Both this repo's sessions share ONE working folder — only one should run git at a
time (a parallel session switched this tree to `main` mid-work on 12 Sep; nothing
was lost because everything was committed). Put the tree on
`claude/amendment-engine-core` before working.

## Standing constraints (unchanged)
Do NOT merge until the owner says "merge live" AND Codex is clean. Leave PR #395
and the EOD feature alone. Every new persisted field still rides
`schedFields()`+`histApply`; parity stays 728/0.
