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
