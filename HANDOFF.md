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

<!-- now:claude/leave-late-published -->
### `claude/leave-late-published` — `[LEAVE-LATE-PUBLISHED]` (D177–D185): built, Fable's six applied, walking; written 26 Sep 26 morning (interim) — verify before use
- **What it is:** a published version freezes the day's inputs (`snap.inp`) and its face (`snap.w` — the warnings that
  freeze and the marks they raise; `snap.pa` / `snap.rv` the men's CAT/seat/posting and the brief lead, drawn by
  `engine/faceattrs.ts`); the issued face draws only frozen things EXCEPT what stays live (D183–D185: the dotted next-day
  mark, a crew-rest breach / tight turn, the 7-day run, the Qualification-flag warnings, every OIL warning — `validate.ts
  LIVE_ON_FACE`; the day loop files each mark by class `fz` / `lv`; `faceWarn` lays the live ones over the frozen slice).
  Rule text: `raptor-port/docs/engine-rules.md` §Publishing. Evidence: `raptor-port/docs/handpass/2026-09-26-late-pub.md`.
- **Done this morning (commit fcfbf198 + uncommitted):** D184/D185 built; the two red tests fixed; Fable's six applied (F1
  no dates in the details key; F2 one man's takeover = one edit; F3 OIL warnings live; F4 the folded line taps; F5 the
  load's sentence + the "already at" message found by the walk; F6 "input change"); break tests B1–B16 (§5); unit suite
  5964/5964 on the D184/D185 commit (to re-run on the final one); re-walk desktop 22/22, phone 10/10; host walk of the fixes
  desktop 18/19 (H4 fixed after the build), phone 17/17.
- **In flight:** four parallel walkers on 4174–4177 (Quals, Logic, neighbour day, Leave War) — their scripts
  `raptor-port/scripts/handpass/am/late-pub-{quals,logic,neighbour,leavewar}-walk.mjs`, pictures
  `docs/img/handpass/2026-09-26-late-pub/<route>/`. Do not rebuild while they run (they share `dist/`).
- **Then:** reproduce their findings, fix → rebuild → re-walk the host walk (H4) → the full gates → the second read by
  Fable and Astra (brief `raptor-port/docs/superpowers/briefs/2026-09-26-late-published-read2-brief.md`) → fix → evidence
  sheet §4c, §6, §9, §10 (the look card) → push, open the PR.
- **Questions for him (the look card):** Q1 a man's CAT on a puck and a blank brief's time frozen on the published face —
  keep? Q4 the app's own "till <date>" note: a stretched or trimmed leave/downchit reads pending on the published days it
  still covers (their printed words change) — keep (recommended) or ignore the note? Q5 "a lapsed qualification" read as
  the Qualification-flag warnings (SC / AAR currency, AAR instructor, illegal seat); crew-pairing warnings frozen — right?
  Q6 the crew-rest "tight turn" note live with the breach — right?
- **Branch:** `claude/leave-late-published`, pushed to 77bbd47f (no PR yet). Rulings this chat: none new (D185's row gained
  the agent's widened reading). Range left: D186–D189.
- **Usage (D182, until Monday 28 Sep 26):** don't hold back — a second Fable + Astra read, parallel walkers, high thinking.
- **After this merges (D180, D173):** `[ACCOUNTS]` on a new branch — its plan not started; the `OUTSTANDING.md` tidy (over
  its tripwire) on its own docs branch.
<!-- /now -->

## Next, in order

1. **HIS ORDER — D173, amended by D175 and D180** (the `## Now` block above): PR #435 and PR #437 MERGED 25 Sep 26 →
   `[LEAVE-LATE-PUBLISHED]` on its own branch, full check, his look, "merge live" (D180; built overnight, D181) →
   `[ACCOUNTS]` on a new branch → the one changes window (`[DRAFT-PENDING]`) → one full check → "merge live". **`[HUMAN-RETEST]`** — the amendment system MERGED 25 Sep 26 (PR #434; evidence
   `raptor-port/docs/handpass/2026-09-24-amendment.md`). Next, in his order (D147): the absence record
   together with `[S4-HUNT-REST]`, then change-recording (with D148 and `[UNDO-ROSTER-SETTINGS]`), then the Leave War
   links last. The two evidence sheets (Tracker 23 Sep, amendment 24 Sep) are the worked examples.
2. Then his after-the-hunt order: `[PUB-UNAVAIL]` → `[LW-LOCKMARK]` → `[LW-WEEKDAY-WORK]` → the OIL award fix and the
   small OIL follow-ups as one batch (D147) → `[DB-STEP]`. The whole list: `OUTSTANDING.md`'s priority list.
3. Filed, none blocking: `[TRK-PINCH-ASK]` (his iPhone look), `[TRK-DLG-LEFTOVERS]`, `[TRK-RETEST-NOTES]`,
   `[LW-FROZEN-BAR-GAP]`, `[LW-FIGSEL-SLOW]`. Everything else: `OUTSTANDING.md`'s priority list.
4. **Before ANY collaborator:** take the checks runner off this repo (Astra SEC-101, `[REPO-PRIVATE]`).

## Gate baseline

The latest counts watched — 25 Sep 26 22:14–22:26, `claude/request-one-row` (PR #437: D174, D175, D176, with `main` after
PR #436 merged in; MERGED 25 Sep 26 as it stood), one run on a quiet PC (`raptor-port/docs/handpass/2026-09-25-req-one-row.md` §12):
unit **5939 / 5939** (365 files) · build clean · tfin **728 / 0** · e2e **471 passed**, 48 skipped · smoke **442 / 0** ·
rulecheck OK · docsize OK. Restate a count only
from a run you watched, and REPLACE the previous counts — never stack a history. How to run them: `raptor-port/CLAUDE.md`
§Build & verify; how they mislead, and the checks on his PC: `raptor-port/docs/gates-and-deploy.md`.

## Standing constraints

Every one of these is the same missing piece — the server / sync backend —
wearing a different hat.

- **No shared data.** localStorage only; two devices never see each other's
  edits. Needs a server or sync backend; touches the storage seam (`raptor-port/src/storage/`,
  `raptor-port/CLAUDE.md` §Where things live) and the mutation funnel. *(Corrected 24 Sep 26: it used to name
  `engine/hooks.ts:storeBackend`, which the storage seam replaced for everything but the `sqn142_*` settings.)*
- **Prototype auth.** Hard-coded accounts. *(Corrected 24 Sep 26: "the deployed site is public" stopped being
  true with D59 — the repo is private and the app sits behind his Vercel sign-in, which is Vercel's lock, not the
  app's.)*
  Manage-users edits the in-memory list only. A member is NOT view-only: they
  add, edit and delete their own Inputs and tick the qualifications they hold.
  Roles table `docs/engine-rules.md` §Auth / roles; enforcement (page and write
  path, never the nav) pinned by `src/state/session.test.ts`.
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
