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

<!-- now:claude/nifty-albattani-j7975f -->
### `claude/nifty-albattani-j7975f` — `[ACCOUNTS]` (D165, D166, D200, D202, D204, D149), STOPPED MID-BUILD for his PC; written 26 Sep 26 — verify before use
- **Where it started:** his ask — plan `[ACCOUNTS]` (Opus 5.5), Fable and Astra red-team the plan, build, walk, FULL check.
  Stopped by him mid-build ("i want to do this on my local computer"). The cloud session could not reach Astra (no
  Codex there — observation #261), so **Astra's plan read has NOT run**: brief
  `raptor-port/docs/superpowers/briefs/2026-09-26-accounts-plan-redteam-brief.md`, report to
  `raptor-port/docs/superpowers/specs/2026-09-26-accounts-plan-astra.md`, blind to Fable's.
- **The plan of record:** `raptor-port/docs/superpowers/plans/2026-09-26-accounts-plan.md` — **its §14 wins over the
  sections above it** (Fable's 17 findings, all taken: `raptor-port/docs/superpowers/specs/2026-09-26-accounts-plan-fable.md`).
- **Built (WIP commit — THE APP DOES NOT COMPILE at this commit; the callers are the next step):**
  `docs/data-model.md` §11 rewritten in the strict shape (+ `User`, new `AccessRequest`, §8, §12 Q3);
  `src/state/permissions.json` + `permissions.ts` (`allowed`, `GATES`); `scripts/permcheck.mjs` wired into
  `docsize.mjs` (+ two self-test scenarios — self-test green, `permcheck` green, break test red as it should);
  `src/state/accounts.ts` (records, sign-in answers, admin writes, guards, fallback); `src/state/auth.ts` rewritten
  (`may`, `roleNow` reading the live account, `canEditSched` = `may('U','ScheduleWeek')`; `LOGINROLE`,
  `canToggleRole`, `setEffectiveRole`, `ACCOUNTS` removed); `tsconfig.app.json` `resolveJsonModule`. Nothing else yet.
- **Pick up here, in order:** (1) the callers of the removed auth exports — `state/store.ts` (import line; delete
  `toggleRole`; `resetSession`: ME = the account's `personId`, `''` for a guest, `'bane'` for the bare test shape; the
  undo list clears at sign-out — D148, `undo/timeline.ts` has only a test-only reset; `HOOKS.whoami` → the callsign),
  `ui/Login.tsx` (`checkSignIn`/`sessionOf`), `ui/Shell.tsx` + `ui/Drawer.tsx` (no View as, inert badge, Admin
  badge), `leavewar/inputgate.ts` (`LOGINROLE` → `may('C','Input')`), `probe-bridge.ts` (`raptorRole` →
  `setRoleForTest`; add `raptorMe`); (2) `state/people-settings-commit.ts` — the three keys into `SETTINGS_KEYS`,
  `accountsLoad` into `SETTINGS_LOADERS` and `initStore`, install `setAccountsCommit`; (3) `ui/App.tsx` + a new
  `ui/Waiting.tsx` and the guest shell (plan §3, §6, F6, F14); (4) Admin → Users, delete `state/users.ts`; (5) D149 on
  Quals (+ `[QUALS-PROTO-TOAST]`); (6) the `GATES` rewiring, the import-rule ratchet and `permissions.test.ts` (plan §8,
  F4, F10); (7) `leavewar/engine/stages.ts canEditRow` null viewer (F7); (8) `mayReverse` same-account (F1) and the e2e
  undo tests; (9) tests per plan §11 + F12, each ruling named in a test title (`rulecheck`); (10) the docs (plan §12,
  F17; D104 marked overtaken by D166); (11) the FULL check — walk, gates, Fable AND Astra code reads, evidence sheet.
- **Branch:** `claude/nifty-albattani-j7975f`; no PR (none opened on purpose while it does not compile). Its base is
  `main` at `0495e6b` (PR #439).
- **Gates:** unit **5990 / 5990** on the base commit (watched, before any change); nothing since — the build is broken
  by design at the WIP commit. `node raptor-port/scripts/permcheck.mjs` and `docsize-selftest.mjs` green.
- **Open questions for him:** the plan's §13 (five built defaults — `us` is Torch; any password for accounts an admin
  creates; a posted-out man keeps his account; the guest sees no absences; no admin edits his own account) and the
  four in §14 (every account needs a puck; the guest sees no warning list; `saber`/`outlaw` take any password; ask
  again without limit) — put to him on the look card, not before. His "ok" of 26 Sep 26 was taken as "carry on", not
  as a yes to them.
<!-- /now -->

## Next, in order

1. **HIS ORDER to the database step, about two months away (D203, 26 Sep 26):** now `[ACCOUNTS]` (with D200, D202, D204 —
   in progress, `claude/nifty-albattani-j7975f`) → the one changes window (`[DRAFT-PENDING]`) → one full check →
   "merge live" (D173); beside it, he talks to the IT side (`[IT-QUESTIONS]`). Development as normal: `[HUMAN-RETEST]`'s
   remaining three in his order (D147 — the absence record with `[S4-HUNT-REST]`, change-recording, the Leave War links
   last), then `[PUB-UNAVAIL]` → `[LW-LOCKMARK]` → `[LW-WEEKDAY-WORK]`.
2. **About a month before the database:** `[DB-READINESS]` with the OIL award fix and the small OIL follow-ups as ONE
   batch (D147, D203) → `[DB-STEP]` when Manfred is ready. The whole list: `OUTSTANDING.md`'s priority list.
3. Filed, none blocking: `[TRK-PINCH-ASK]` (his iPhone look), `[TRK-DLG-LEFTOVERS]`, `[TRK-RETEST-NOTES]`,
   `[LW-FROZEN-BAR-GAP]`, `[LW-FIGSEL-SLOW]`. Everything else: `OUTSTANDING.md`'s priority list.
4. **Before ANY collaborator:** take the checks runner off this repo (Astra SEC-101, `[REPO-PRIVATE]`).

## Gate baseline

The latest counts watched — 26 Sep 26 morning, `claude/leave-late-published` (`09276503`, the final code of
`[LEAVE-LATE-PUBLISHED]` with D187 and its reads' fixes), one run on a quiet PC
(`raptor-port/docs/handpass/2026-09-26-late-pub.md` §6): unit **5988 / 5988** (368 files) · build clean · tfin **728 / 0** ·
e2e **471 passed**, 48 skipped · smoke **442 / 0** · rulecheck OK · docsize OK. Two tests added after it (no source
change): their file alone 45 / 45. Restate a count only
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
