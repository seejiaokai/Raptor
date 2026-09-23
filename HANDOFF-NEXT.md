# HANDOFF — 23 Sep 26 (afternoon). PR #428 `claude/lw-monthjump-phone`: the Leave War fixes are DONE and checked; it waits for his "merge live".

**Pick `claude/lw-monthjump-phone` in the new-chat picker while PR #428 is open; `main` once it has merged.**
Before acting: `git fetch`, `gh pr view 428 --json state`, and `gh run list --branch claude/lw-monthjump-phone
--limit 3` — this file was written just before the final push, so the PC run's result is in PR #428's
checks and the chat, not here.

## Where it stands

- **Fixed, red-before/green-after, walked on phone and desktop with pictures** (evidence sheet
  `raptor-port/docs/handpass/2026-09-23-lw-monthjump.md` PART TWO, §8–§15): `[LW-MONTHJUMP-PHONE]` (a
  remembered month width counts as exact only under the rows it was measured with), `[LW-HBAR-RESYNC]`
  (one catch-up follow when the scrollbar's drag hold ends), the owner's filmed frozen-bar jump (placed
  before its first paint; the scroll-linked animation held until it starts), the same one-frame-late
  placement on the bottom scrollbar and the Quals frozen header, and the review round (the manning Archive
  as a width input; the frozen bar re-measures on any content change). Both items ARCHIVED.
- **Read by Astra and Fable, blind** — every finding dispositioned in §14; Astra's re-read of the fixes
  found two more (the bidding outline on the Archive — fixed; a vacuous test check — fixed), §16.
- **The first run as a service HUNG** in the browser gate on a hidden git sign-in prompt — cause and fix in
  §17 (Playwright's git-info fetch switched off; git prompts made to fail at once).
- **Gates (local, final tree):** 5762/5762 · build · 728/0 · e2e 466/47/0 · smoke 425/0 · rulecheck · docsize
  deferred (OUTSTANDING +36, DECISIONS +1 — D29, its own pass).
- **The checks run on his PC again:** `CI_ON_GITHUB` deleted; the runner is a Windows service under NETWORK
  SERVICE at `C:\actions-runner\actions-runner` (never delete `C:\actions-runner`).

## Open, in order

1. His "merge live" for PR #428 (his own look first if he wants it — Vercel, a phone: SEP then MAR lands
   on the 1st; scroll the Leave War page down past the dates: the bar appears in place, no slide).
2. ~~The runner folder's permissions (Astra SEC-102)~~ — DONE by him 23 Sep 26, 16:38, and verified.
3. `[LW-FROZEN-BAR-GAP]` — a one-frame blink as the frozen bar appears (filed, not fixed).
4. A docs-only trim pass (D29): OUTSTANDING and DECISIONS are over their ceilings.
5. Before ANY collaborator: take the runner off this repo (Astra SEC-101, `[REPO-PRIVATE]`).

## Parallel chats (D153, D154)

- **The Tracker bug check** (`[HUMAN-RETEST]`), worktree branch `claude/tracker-human-retest-8d3411`:
  preview 4180, e2e 4182, smoke 4181, rulings from D120.
- **A presentation to commanders + a demo video**, its own worktree: preview 4185, rulings from D170.
  Record the video AFTER #428 merges (`main` still shows the frozen-bar jump); D58 holds.
- Never two full gate runs at once, the PC runner's included; one merge at a time (D78).

## Rulings this session

D153 (the Tracker check runs in parallel) · D154 (the presentation/video chat).
