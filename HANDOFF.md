# HANDOFF — where things stand, and what is next

**A new chat reads this first.** It is the ONE handoff (D140, 24 Sep 26): `## Now` holds one block per open chat's
branch — where it stands, what it left, what to do next — and `## Next, in order` is the project's order; below
them, the standing facts. It holds CURRENT state only: a finished story is in git and, when a whole section left,
in `raptor-port/docs/archive/` (the 4 Sep 26 snapshot of this file is `HANDOFF-ARCHIVE.md`, frozen); open work is
in `OUTSTANDING.md`; where each kind of fact goes is `.claude/rules/doc-structure.md`, loaded in every chat.

**Before acting on a block:** `git fetch`, then check the branch and PR it names — it describes the world when it
was written. Never push while a PR's checks are running (`gh run list --branch <branch> --limit 1`; D151).
**Writing a block** (the session-handoff skill does it, at every handoff): rewrite ONLY your own block, between its
markers, even when nothing is pending; newest block first; remove another chat's block only after `git fetch` shows
its work merged and its open residue is filed in `OUTSTANDING.md`. Two parallel chats each keep their own block, and
the later merge keeps both (D78).

## Now

<!-- now:claude/five-flags-batch-continue-2cfa70 -->
### `claude/five-flags-batch-continue-2cfa70` — the five-flags batch (D164, D160, [CROWD-SWAP-SAYS-BUSY], [VIEW-ARROW-OVER-LIST], [BG-GUARD-FALSE]): BUILT, FULL-checked, all gates green (PR #445, GitHub green after one D84 re-run); Q2 answered (D270, not built), Q1 / Q3 / Q2b shown as mock-ups, his answers awaited — written 27 Sep 26 — verify before use
- **The branch:** started from `claude/five-flags-batch-build-ef7d85` (built, walked and read there, 26 Sep 26), which it
  carries whole; the PR is from THIS branch (`gh pr list --head claude/five-flags-batch-continue-2cfa70`). The old branch
  has no PR and nothing of its own left — delete it once this merges.
- **Parallel** with `claude/accounts-new-person` (PR #443) and the absence-record re-test (PR #444): preview port 4176
  (`.claude/launch.json` "raptor-walk-4"), browser tests `E2E_PORT=4193`, rulings D270–D279 (none used). Full checks take
  turns through the PC-wide lock (D228, `node C:/Users/User/projects/Raptor/raptor-port/scripts/gatelock.mjs … run --from
  <this worktree>/raptor-port` — without `--from` it runs the MAIN checkout's code). Whichever merges later takes `main` in
  first. Nothing to `main` without his "merge live".
- **Built:** his own purple puck never glows when flagged, for every kind of flag (`scheduler.css`, `flagglow-css.test.ts`);
  ⚙ Settings → Reset order (the two resets take each other's question back); one man one place on a row, a copy left
  behind still counts, the SC shift scan reads the seat he leaves; the desktop week's 54px room beside the ‹ (`view.ts
  weekInset`, the › side measured); the background guard follows a line step by step.
- **The check (FULL), done:** evidence `raptor-port/docs/handpass/2026-09-26-five-flags.md` — the walk (§5: W1 64/0, W2 97/0,
  W3 123/5, W4 1838/2, every fail fixed or his question), both reads (§8: Astra A1–A4, Fable F1–F4 — all fixed but F4,
  filed), the re-walk after the reads (§5: W1 34/0; W3 69/2, the two = his Q1), the gates (§7: unit 6237/6237, build,
  tfin 728/0, e2e 474/0 after five older week-landing tests were moved to the new front — measured, not a wrong landing,
  break-tested — smoke 443/0, rulecheck, docsize), his look card (§9: four looks + Q1–Q3).
- **His answers so far (27 Sep 26):** Q2 **"yes"** → **D270** (his own flagged puck shows the flag's own ring; purple fill
  stays) — recorded, carried into the docs, the build filed in `[ME-PUCK-SEVERITY-RING]`, NOT built. Q1 and Q3: *"show me a
  mock up"*, and *"can u show mock of what u changed before and after"* → `raptor-port/docs/mock/five-flags.html` (Artifact
  https://claude.ai/artifact/NACjL873LZ3P9VxbAJRWPZ), pictures by `scripts/handpass/am/mk-five-flags.mjs` (parts p1, q2, q1,
  q3; the app served on :4176). It also puts Q2b (the OIL ring on his own puck, recommended: same treatment).
- **Next:** his answers to Q1 (refuse / warn), Q2b, Q3 (keep / empty / fade) → record each (D271 on) → build D270 and his
  answers ON THIS BRANCH (the same lines this batch changed: `scheduler.css` rings, `avail.ts`/`drag.ts`/`view.ts` one man one
  place, `.week` room) → WALK-tier check (re-run ff-w1 C,D and ff-w3 f6 as assertions of the new behaviour; the Q3 walk) →
  gates under the lock → his look → "merge live" — one at a time with #443 and #444, the later taking `main` in first. GitHub's
  Leave War desktop group flaked once on the first run (the Move tests; D84 re-run passed).
- **His "2 chats" remark (27 Sep 26), still unanswered:** *"i think my computer can handle 2 chats working"*. The opening
  line of this chat carried a blank where his answer was meant to go. Put to him in this chat's report: two chats working
  side by side needs nothing (only full check runs queue); two full runs at once is what D86 measured as false failures —
  recommended: keep the queue. If he wants two full runs at once, that narrows D228/D86 — record it (D270) and give
  `gatelock.mjs` two slots.
- **Filed from it:** [CROWD-DUP-REFUSE] (Q1), [ME-PUCK-SEVERITY-RING] (Q2), [ARROW-GUTTER-STRIP] (Q3), [GHOST-FLAG-SHADOW],
  [LW-SETTINGS-SMALL], [ALLAVAIL-OPEN-ROW]. The five items are archived (built here).
<!-- /now -->

<!-- now:claude/accounts -->
### `claude/accounts` — `[ACCOUNTS]` (D165, D166, D200, D204, D210, D211): BUILT and FULL-checked; on its PR, waiting for his look and "merge live" — written 26 Sep 26 — verify before use
- **What it is:** sign in as yourself (every account is one callsign; "View as" and the role toggle gone); request access /
  waiting / switched off / the admin's guest-view switch; Admin → Users; one permissions module (`src/state/perms.ts`)
  mirroring `docs/data-model.md` §11 with a drift test and a source scan; D149 on Quals. Plan (3 red-team rounds):
  `docs/superpowers/plans/2026-09-26-accounts-plan.md`; register AC1–AC15.
- **The check:** walk 1 38/38, walk 2 40/40 (Fable's scenarios), the bridge off-host — re-walked on the final build; both
  code reads (Fable: no blocker; Astra: four findings) answered — every finding fixed red-first or filed with its place;
  final gates 6156 / 728 / 471 e2e / 442 Tracker, all green. Evidence sheet `docs/handpass/2026-09-26-accounts.md`
  (§6 walk findings, §8 the reads, §9 his look card).
- **Next:** his five-minute look (the sheet's §9, on the branch's Vercel link) → his "merge live" → then `[DRAFT-PENDING]`
  (the one changes window) on top of accounts, with its own full check (D210).
- **Filed from it:** `[TRK-SESSION-PICK]` (the Tracker's last pick per person); `[DB-STEP]`'s "access changes take effect
  at once" (Astra's read, finding 1).
<!-- /now -->

<!-- now:claude/tracker-palette -->
### `claude/tracker-palette` — `[TRK-PALETTE-ASK]` (D157): the Tracker in Raptor's colours, fully — BUILT, WALK-checked; written 26 Sep 26 — verify before use
- **Parallel with `[ACCOUNTS]`** (`claude/accounts`, rulings D210–D229) on his instruction of 26 Sep 26: this chat serves on
  port 4180, numbers its rulings D230–D239, never runs the full checks while the accounts chat runs its own, and whichever
  merges second takes `main` in first (D78). Nothing to `main` without his "merge live".
- **What it is:** `tracker.css`'s colour tokens and `app/core.js` `PAL` / `TYPE_COLOR` / `GRADE_FILL` copy Raptor's
  `scheduler.css :root` (sim yellow → amber); `src/tracker/trk-palette.test.ts` pins every copy. Built = the picture he
  chose on 24 Sep 26 (its exact colours were recovered from that chat's comparison script).
- **The check (WALK tier):** evidence `raptor-port/docs/handpass/2026-09-26-trk-palette.md` — roll-call (18 places), walk
  65/65 at desktop and phone with 35 pictures, breaks 21/21; the walk found and fixed three (failure chips' red outline
  never drawn; the details bubble's record had no divider; "Sim (yellow)"); Fable and Astra read it blind — 10 small
  findings, all fixed, pinned and re-walked (sheet §7 F7–F14, §9); filed `[TRK-FLEXBAR-INK]` (his question). Gates on the
  final code (sheet §10): unit 6029/6030 (the one: `[LW-FIGSEL-SLOW]`, load-only, 12/12 alone) · build clean · tfin 728/0 ·
  e2e 471 passed, 48 skipped · smoke 443/0 · rulecheck OK · docsize OK.
- **RULING NOT YET FILED — the rulings file refused the write (auto mode):** D230 for `.claude/rules/decisions/tracker.md`,
  top of its table — *"Build [TRK-PALETTE-ASK] … on a new branch … use port 4180, number any rulings of yours D230–D239,
  never run the full checks while the other chat is running them … whichever of us merges second takes main in first …
  Nothing goes to main without my 'merge live'."* → `[TRK-PALETTE-ASK]` built now, on its own branch, in parallel with
  `[ACCOUNTS]`, under those conditions. File it (then `node raptor-port/scripts/backlog-archive.mjs --rulings`) once he
  approves the edit, or leave it if he says so.
- **Next:** his look (the sheet §11), his answer to `[TRK-FLEXBAR-INK]`, then "merge live" — one at a time with the
  accounts chat.
<!-- /now -->

<!-- now:claude/leave-late-published -->
### `claude/leave-late-published` — `[LEAVE-LATE-PUBLISHED]` (D177–D189): MERGED 26 Sep 26 on his "merge live" (PR #438) — this block goes at the next handoff; written 26 Sep 26 — verify before use
- **What it is:** a published day keeps what it went out with — its inputs (`snap.inp`), its warnings that freeze and
  their marks (`snap.w`), its men's CAT / seat / posting and the brief lead it prints (`snap.pa` / `snap.rv`, drawn by
  `engine/faceattrs.ts`), the roster its day panel counts (`snap.ros`); a change since reads pending (the four fall) and
  goes out with the next AL. What stays LIVE (D183–D185): the dotted next-day mark, a crew-rest breach and tight turn, the
  7-day run, the Qualification-flag warnings, every OIL warning (`validate.ts LIVE_ON_FACE`; the day loop files each mark
  by class `fz` / `lv`, `faceWarn` lays the live over the frozen). Medical stays frozen. Rule text:
  `raptor-port/docs/engine-rules.md` §Publishing.
- **The check (FULL):** evidence `raptor-port/docs/handpass/2026-09-26-late-pub.md` — the roll-call (21 surfaces), the
  walks (the re-walk, the host walk, four parallel walkers: Quals, Logic, neighbour day, Leave War — 593 pictures, no
  console errors), 36 break tests, blind reads by Fable and Astra of the first build, the final code and the D187 change
  (all dispositioned §9 — D187's nine fixed and pinned, B29–B36), the gates (§6). His look card is §10.
- **The PR:** #438, merged on his "merge live" (26 Sep 26). The backlog items `[LEAVE-LATE-PUBLISHED]`,
  `[LATE-PUB-FACE-LIVE]` and `[PV-NO-FLAGS]` are archived; the one residue left open is `[PEEK-ISSUED]` (low, his question).
- **His questions (the card, §10) — ALL ANSWERED:** Q1 — D186 "yes" (a man's CAT and a blank brief's time stay as
  published). Q4 — D189 "follow ur recommendation" (the app's own "till" note counts: each published day a stretched leave
  still covers shows "1 pending" on the admin's working copy, never on View-only Sched). Q5 — D187 "it should" (BUILT: a
  look at a published version wears its warnings — the whole record it went out with, read only, its own ⓘ panel and
  taps; read by both providers after the build, their findings fixed). Q6 — D188 "yes" (the Qualification-flag reading).
- **Filed this session:** `[PV-NO-FLAGS]` (answered and built, archived), `[PEEK-ISSUED]`, `[INSIGHTS-WORKING-COPY]` (his question),
  `[QUALS-PROTO-TOAST]`, `[VIEW-ARROW-OVER-LIST]`, `[INPUTSCAL-TAP-FLAKY]`. Rulings this chat: D186–D189 (and D185's row
  gained the agent's widened reading, confirmed by D188). The chat's range D180–D189 is used up — a later chat on this
  branch takes the next free number above `main`'s (DECISIONS.md).
- **Usage (D182, until Monday 28 Sep 26):** unlimited — spend it on his look's follow-ups.
- **Next (D180, D173):** `[ACCOUNTS]` on a new branch, in a FRESH chat — its plan not started; the `OUTSTANDING.md` tidy (over
  its tripwire) on its own docs branch.
<!-- /now -->

## Next, in order

1. **HIS ORDER to the database step, about two months away (D203, 26 Sep 26):** now `[ACCOUNTS]` (with D200, D202 —
   answer his "how does a new user join" question first — answered, D204) with ITS OWN full check (D210) → the one changes
   window (`[DRAFT-PENDING]`) with its own full check →
   "merge live" (D173); beside it, he talks to the IT side (`[IT-QUESTIONS]`). Development as normal: `[HUMAN-RETEST]`'s
   remaining three in his order (D147 — the absence record with `[S4-HUNT-REST]`, change-recording, the Leave War links
   last), then `[PUB-UNAVAIL]` → `[LW-LOCKMARK]` → `[LW-WEEKDAY-WORK]`.
2. **About a month before the database:** `[DB-READINESS]` with the OIL award fix and the small OIL follow-ups as ONE
   batch (D147, D203) → `[DB-STEP]` when Manfred is ready. The whole list: `OUTSTANDING.md`'s priority list.
3. Filed, none blocking: `[TRK-PINCH-ASK]` (his iPhone look), `[TRK-DLG-LEFTOVERS]`, `[TRK-RETEST-NOTES]`,
   `[LW-FROZEN-BAR-GAP]`, `[LW-FIGSEL-SLOW]`. Everything else: `OUTSTANDING.md`'s priority list.
4. **Before ANY collaborator:** take the checks runner off this repo (Astra SEC-101, `[REPO-PRIVATE]`).

## Gate baseline

The latest counts watched — 27 Sep 26, `claude/five-flags-batch-continue-2cfa70` (`a0a164a3`, the five-flags batch's final
code, bundle `index-C-k_umJP.js`), one run under the lock (`raptor-port/docs/handpass/2026-09-26-five-flags.md` §7): unit
**6237 / 6237** (382 files) · build clean · tfin **728 / 0** · e2e **474 passed**, 48 skipped (the whole suite again after
five older landing tests moved to the new front — tests only) · smoke **443 / 0** · rulecheck OK · docsize OK. Restate a count only
from a run you watched, and REPLACE the previous counts — never stack a history. How to run them: `raptor-port/CLAUDE.md`
§Build & verify; how they mislead, and the checks on his PC: `raptor-port/docs/gates-and-deploy.md`.

## Standing constraints

Every one of these is the same missing piece — the server / sync backend —
wearing a different hat.

- **No shared data.** localStorage only; two devices never see each other's
  edits. Needs a server or sync backend; touches the storage seam (`raptor-port/src/storage/`,
  `raptor-port/CLAUDE.md` §Where things live) and the mutation funnel. *(Corrected 24 Sep 26: it used to name
  `engine/hooks.ts:storeBackend`, which the storage seam replaced for everything but the `sqn142_*` settings.)*
- **Prototype auth.** *(Rewritten 26 Sep 26 by `[ACCOUNTS]`, on its branch.)* Accounts — one per person, tied to a
  callsign, managed on Admin → Users; the sign-in stands for the defence mail's and the app keeps no password; people on
  no list ask for access (D166, D204). Like all data, they live in one browser until the database, and the sign-in is no
  security (the app sits behind his Vercel sign-in — Vercel's lock, not the app's). A member is NOT view-only: they
  add, edit and delete their own Inputs and edit their own Quals row (D149).
  Roles table `docs/engine-rules.md` §Auth / roles; ONE permissions module (`raptor-port/src/state/perms.ts`,
  mirroring `data-model.md` §11, drift-tested); enforcement at the page, the write path and the command gate.
- **One dataset.** The schedule is the demo week (Mon 13 – Sun 19 Jul 26; the
  weekend is non-flying, duty crew only). Week chips re-label but every week
  shows the same data. *(Corrected 24 Sep 26: a second demo week is authored from Mon 20 Jul —
  `raptor-port/src/engine/week2.ts` — and a week once edited keeps its own copy, persisted; an untouched week
  still falls back to the seed.)*
- **What survives a reload** — nearly everything, on a built site (the 19 Aug "session-only" rule was superseded 17 Sep 26 and its text archived in `raptor-port/docs/archive/handoff-2026-09-24.md`): the authoritative table is `raptor-port/docs/data-schema.md`; the short form is `raptor-port/CLAUDE.md` §WHAT ACTUALLY PERSISTS.

## Where to look

The map of every document is `raptor-port/CLAUDE.md` §Where things live (it loads with any file under
`raptor-port/`). From the root: the backlog `OUTSTANDING.md`, the rulings map `DECISIONS.md`, and — loaded in every
chat — `.claude/rules/shipping.md` (how a change ships) and `.claude/rules/doc-structure.md` (where each fact goes).

## Moved on 24 Sep 26 — where each old section of this file lives now

| Old section | Now |
|---|---|
| §Reference docs — where to look | `raptor-port/CLAUDE.md` §Where things live; the old table: `raptor-port/docs/archive/handoff-2026-09-24.md` |
| §Gate status (the baselines, the per-gate table, the Windows note, "How the gates lie") | `raptor-port/docs/gates-and-deploy.md` §How the gates lie |
| §In flight (and its storage-seam "Historical" story) | `raptor-port/docs/archive/handoff-2026-09-24.md` |
| §Open / deferred / queued — incl. "PARKED DIRECTION", "Unverified on a real iPhone", "Open questions for the owner" | open items → `OUTSTANDING.md`; the parked Power Apps direction → `raptor-port/docs/architecture-direction.md`; the iPhone caveats → `raptor-port/docs/ui-contracts.md` §Device caveats; the rest → `raptor-port/docs/archive/handoff-2026-09-24.md` (its head lists every new home) |
| §Known issues / open work (its name before 4 Sep 26) | `HANDOFF-ARCHIVE.md` (the frozen 4 Sep snapshot) |
| §Deploy — the traps | `raptor-port/docs/gates-and-deploy.md` §Deploy |
| §File map | `raptor-port/docs/file-map.md` |
| `HANDOFF-NEXT.md` | this file's `## Now` and `## Next, in order`; "How rulings are kept" → `DECISIONS.md` (its head) and `.claude/rules/record-decisions.md`; its merged stories → `raptor-port/docs/archive/handoff-2026-09-24.md`; "the checks run on his PC" and "how pushes cost runs" → `raptor-port/docs/gates-and-deploy.md` |
