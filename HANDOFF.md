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

<!-- now:claude/small-fixes-batch-d223f6 -->
### `claude/small-fixes-batch-d223f6` — the small-fixes batch BUILT, walked, read by both reviewers and gated — PUSHED, the PR open — his look and "merge live" left — written 29 Sep 26 — verify before use
- **The branch:** cut from `main` at `60a6792c`; `main` merged in three times (PR #457, then PR #458 — the rulings slim-down, taken
  with its own steps: `--rulings --merge`, the oil.md pointer re-applied, D360's short line read by Astra and rewritten; then PRs #459–#462 — the guide step, the Tracker leftovers — documents-only conflicts, each side kept, the only shared app file a comment; built clean, docsize OK).
  Folder `.claude/worktrees/trk-smoke-add-race-bug-007eed`. Ports: preview 4174, `E2E_PORT=4191`. Rulings range D360–D369
  — D360 used (his `[ALLAVAIL-OPEN-ROW]` answer). On GitHub, with its PR (the link in this chat). `claude/change-recording-retest` is NOT merged (no PR on 29 Sep 26) — it merges after this one or before; the later one adapts (D78).
- **Built (one commit each, red-first):** `[AVAILWIN-PREVIEW-BAR]`, `[GHOST-FLAG-SHADOW]`, `[ALLAVAIL-OPEN-ROW]` (D360),
  `[AMEND-SMALL-SEEN]` 1, 3, 4, 9 (5 is a look-card question), `[REQ-ORPHAN-ROW]`, `[REQ-DOOR-WORDS]` 1–3, `[LW-ISO-DATES]`,
  `[LW-SPARE-MOVE-DOORS]`, `[ABSENCE-SMALL-SEEN]` 1–4 (5 watched). Docs carry each.
- **Checked:** 13 walks pass (they found four things: fixed ×2, docs corrected, `[PLAN-BANNER-DOOR]` filed); Astra (2) and
  Fable (3) read the code — every finding fixed, measured-and-pinned or put to him; the full gates on `05bdf6a6` (the §Gate
  baseline below; the merges since brought documents and the Tracker's own code only — the PR's checks run the lot on the merged code). Evidence: `raptor-port/docs/handpass/2026-09-28-small-fixes.md`
  (§10 the look card — six questions). PR text drafted in this chat (the evidence sheet has the same facts).
- **Next:** (1) the PR's first run FAILED one test — the phone callsign test on GitHub's Linux font (`[APP-FONTS-NOT-LOADED]`, the app never
  loads its fonts); his call on the callsign column is open (D366's premise held on Windows only); fix, push, re-run; (2) his look
  card is ANSWERED (D361–D366; `[ROW-NO-TIME-MARK]` filed); (3) his "merge live", then archive the items with `backlog-archive.mjs`. `[GATELOCK-STALE-LIVE]`
  filed (the lock's 2-hour rule nearly broke the Tracker chat's live run — asked it, stopped mine).
- **Parallel chats (D302):** change-recording (`.lw-hist` markup/CSS theirs; `dropInputRow` → `unacceptInput` told),
  Tracker (observation numbers — mine #333–#335, #341–#342; theirs 330–332, 338).
<!-- /now -->

<!-- now:claude/rulings-slim-d391-078ad2 -->
### `claude/rulings-slim-d391-078ad2` — [RULINGS-SLIM]'s guide step (D391): the guide's rules as one-line short forms — BUILT, his "merge live" given — written 28 Sep 26 — verify before use
- **The branch:** cut from `main` after PR #458 (the rulings part of the slim-down, whose block this replaces — merged; its
  residue: this step, and the optional question 4 kept in the plan §2.1). Docs, the document gate and `docs-guard.yml` only —
  no `raptor-port/src`, so only the Docs guard runs. No ruling this session.
- **Done:** 35 blocks of `raptor-port/CLAUDE.md` moved whole to `raptor-port/docs/guide-full.md` by `backlog-archive.mjs --move`,
  each leaving a short form of at most 350 characters; the gate pairs them (`docsize.mjs guidePairing`, 11 new self-test
  cases); the guide ~16.2k → ~9.5k tokens (why not ~6k: plan §2.6); its line tripwire 760 → 340; the Docs guard's time
  limit 5 → 10 minutes. The Leave War row of §Where things live untouched (small fixes edits it); trial merges with small
  fixes, change-recording and Tracker leftovers are clean, and all three chats were told (D302). Fable's meaning read (30 of 35 faithful, five rewritten from its replacements, its gate points folded — plan §2.6):
  brief `raptor-port/docs/superpowers/briefs/2026-09-28-guide-short-forms-meaning-brief.md`.
- **Next:** his "merge live" was given 28 Sep 26 — merge when the PR's checks are green, then `main`'s run, then live.
  Filed, low: `[GUIDE-MAP-ROWS]` (the map's long rows, a question for him).
<!-- /now -->

<!-- now:claude/docs-tidy-subheads-audit-ec8f87 -->
### `claude/docs-tidy-subheads-audit-ec8f87` — docs-only tidy DONE: [HANDOFF-SHAPE-GUARD], [DOC-SUBHEADS], [RULING-HOMES-AUDIT] — waiting for his "merge live" — written 28 Sep 26 — verify before use
- **The branch:** cut from `main` at PR #456; folder `.claude/worktrees/bg-cwd-guard-4cc654`. Documents and the
  document gate's scripts only — no `raptor-port/src`, so the full checks do not run; the Docs guard does. Rulings
  range D380–D389 — none used (no ruling this session).
- **Done:** the gate fails `HANDOFF.md` losing a block's `<!-- /now -->` or one of its three headings; 81 sub-headings
  in the four long reference docs (heading lines only, proved byte-identical otherwise); the ruling-homes audit
  (`raptor-port/docs/superpowers/specs/2026-09-28-ruling-homes-audit.md` — D21's "corrected" contract sentence never had
  been, now is) and the gate now fails a NEW ruling row whose Markdown home never mentions its number. Fable read it all
  for meaning (D138); its five findings are fixed. The three items are archived.
- **Parallel chats (D302):** change-recording, small fixes and Tracker leftovers were told every shared file and the two
  gate changes before they landed; all three made their new rows pass (D349 fixed on theirs). A trial merge with each is
  clean except `HANDOFF.md` with the change-recording branch — both blocks added at the top of `## Now`: the later merge
  keeps BOTH, each with its own `<!-- /now -->` (D78; the new shape check fails a resolution that drops one).
- **Next:** his look at the PR and "merge live" (one at a time with the parallel chats, D78). Not this branch's: the
  merged five-flags block below still sits in `## Now` (the gate notes it) — the next handoff that files its residue removes it.
<!-- /now -->

<!-- now:claude/five-flags-batch-continue-2cfa70 -->
### `claude/five-flags-batch-continue-2cfa70` — the five-flags batch AND his answers D270–D275: BUILT and FULL-checked (PR #445) — waiting for his look and "merge live"; the red Leave War tests' cause found and fixed (confirm on GitHub) — written 27 Sep 26 — verify before use
- **The branch:** carries `claude/five-flags-batch-build-ef7d85` whole (that branch has no PR and nothing of its own —
  delete it once this merges). PR #445 is from THIS branch. This chat worked in the folder
  `.claude/worktrees/trk-smoke-add-race-bug-007eed` (the block's earlier folder, `five-flags-batch-continue-2cfa70`, is
  another checkout at the same commit).
- **Parallel** with `claude/accounts-new-person` (PR #443) / the post-out work on `claude/post-out-outcomes` (the main
  checkout — its chat asked to coordinate: told the files this branch touches; it won't touch ours) and the absence-record
  re-test (PR #444, folder `five-flags-batch-build-ef7d85`). Ports: preview 4176 (`.claude/launch.json` "raptor-walk-4"),
  browser tests `E2E_PORT=4193`; rulings D276–D279 (all four used — his look-card answers). Full checks take turns through the PC-wide lock (D228,
  `gatelock.mjs … run --from <this worktree>/raptor-port`). The later merge takes `main` in first. Nothing to `main`
  without his "merge live".
- **Done 27 Sep 26 (the evidence sheet `raptor-port/docs/handpass/2026-09-27-five-flags-answers.md`):** D275 — the room
  beside the ‹ arrow taken out (`[ARROW-ROOM-OUT]`); D270 / D272 — his own puck wears any other ring (a flag's, the green
  OIL one), the purple fill stays; D271 — one man, once per row, REFUSED at every door with the reason, plus Fable's F1 (a
  request handed to a man already on its row keeps him once). FULL tier: Fable's scenarios, the roll-calls, the walk (W1
  71/0, W3 f6–f10 all green, W6 18/0 — pictures `docs/img/handpass/2026-09-27-five-flags-answers/`), the gates (§7), Fable
  and Astra's blind reads (no defect against the rulings; two test gaps fixed), the re-walk, the look card (§9). The three
  items archived. **His answers to the card's four questions, 27 Sep 26:** Q1 a jet line's two seats stay a warning (D276,
  against the recommendation), Q2 keep the faded purple ring (D277), Q3 and Q4 leave (D278, D279) — nothing to build.
- **`[LW-MOVE-CI-RED]` — cause found, tests fixed:** a timing race in three Leave War tests (the second drag straight after
  an admin's fill, which since `[ACCOUNTS]` re-renders longer on GitHub's machines); fixed with the 18 Sep stable drag
  (`e2e/leavewar.spec.ts`). It never failed on the PC; GitHub's next two runs of this branch were green with the three passing first time — archived.
  Side-findings filed: `[LW-HARNESS-VIEWER-PIN]`, `[CI-FAIL-PICTURES]` (his call — public pictures while the repo is public).
- **Next, in order:** (1) **his look** — the card is the sheet's §9 (the four questions are answered); (2) "merge live", one at a time with #443 and #444. **The absence chat's D262 reworks `select.ts` wireMove** (PR #444) —
  if it merges first, bring `main` in and re-run the three Move tests here; a conflict in those test lines keeps BOTH its
  behaviour and the stable drag (told to that chat).
- **His "2 chats" remark (27 Sep 26)** is still unanswered — put to him once; recommended: keep the one-at-a-time queue
  for full check runs (two chats working side by side needs nothing).
<!-- /now -->

## Next, in order

1. **HIS ORDER to the database step, about two months away (D203, 26 Sep 26):** `[ACCOUNTS]`, `[ACCOUNTS-NEW-PERSON]`,
   `[POST-OUT-OUTCOMES]`, `[LW-MOVE-STANDARD]` (D264–D266) and `[ONE-DOOR]` (D309, D310, with `[POST-IN-DATE]`) MERGED
   (PRs #442, #443, #446, #447, #450) → **the one changes window (`[DRAFT-PENDING]`)** MERGED (PR #451, 28 Sep 26); its
   two follow-ups `[HIST-PHONE-HIDE]` and `[CHG-BY-ITEM]` (D345, D346) MERGED (PR #455, 28 Sep 26); beside it, he talks to the IT side
   (`[IT-QUESTIONS]`). Development as normal: `[HUMAN-RETEST]`'s remaining three in his order (D147 — the absence record
   with `[S4-HUNT-REST]` and D260–D262 MERGED, PR #444 — then change-recording, the Leave War links last), then `[LW-LOCKMARK]` → `[LW-WEEKDAY-WORK]` (`[PUB-UNAVAIL]`
   closed by the absence-record re-test).
2. **About a month before the database:** `[DB-READINESS]` with the OIL award fix and the small OIL follow-ups as ONE
   batch (D147, D203) → `[DB-STEP]` when Manfred is ready. The whole list: `OUTSTANDING.md`'s priority list.
3. Filed, none blocking: `[TRK-PINCH-ASK]` (his iPhone look), `[LW-FROZEN-BAR-GAP]`; the Tracker leftovers'
   own residue — `[SAVE-NOTE-COVERS]` (medium, next), `[TRK-REMOUNT-LANDING]`, `[TRK-ASYNC-STALE]` (with `[DB-READINESS]`). Everything else: `OUTSTANDING.md`'s priority list.
4. **Before ANY collaborator:** take the checks runner off this repo (Astra SEC-101, `[REPO-PRIVATE]`).

## Gate baseline

The latest counts watched — 28 Sep 26, `claude/small-fixes-batch-d223f6`'s final code (`05bdf6a6`, `main` taken in), one run
under the PC lock: unit **6848 / 6850** (424 files — the 2 were 20-second timeouts under the run's load: both pass alone,
and time the same on `main` and the branch) · build clean · tfin **728 / 0** · e2e **508 passed**, 48 skipped ·
smoke **443 / 0** · rulecheck OK · docsize OK. Restate a count only from a run you watched, and REPLACE the previous counts — never stack a
history. How to run them: `raptor-port/CLAUDE.md` §Build & verify; how they mislead, and the checks on his PC:
`raptor-port/docs/gates-and-deploy.md`.

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
