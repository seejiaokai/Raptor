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
### `claude/leave-late-published` — `[LEAVE-LATE-PUBLISHED]` (D177–D180): built overnight (D181, spent), both reads in, fixes half-applied; written 26 Sep 26 ~01:10 — verify before use
- **What it is:** a published version now freezes the day's inputs (`snap.inp`) and its face (`snap.w` warnings + traces,
  `snap.pa` roster attrs, `snap.rv` the blank-brief lead); the issued face draws only frozen things (`inputsOn`,
  `engine/faceattrs.ts`, `validate.ts faceWarn`); pending gains the input-details axis and the "what this day shows" axis
  (kind `warn`), one item per act. Rule text: `raptor-port/docs/engine-rules.md` §Publishing "A PUBLISHED DAY KEEPS WHAT IT
  WENT OUT WITH". Evidence so far: `raptor-port/docs/handpass/2026-09-26-late-pub.md` (walk desktop 22/22, phone 10/10 on
  0116cc31; gates on that commit: unit 5948/5950 — two Leave War load timeouts, pass alone — e2e 471, smoke 442, tfin 728,
  rulecheck OK, docsize OK/over-deferred).
- **The two code reads:** `raptor-port/docs/handpass/2026-09-26-late-pub-{astra,fable}-read.md`.
  - **Astra's 4 — APPLIED in the last commit (unwalked):** trace frozen and compared (D179 literal; Fable's F4 cost is his
    Q2); CAT/seat/posting on pucks + the blank-brief lead frozen on the face, CSV and print (`faceattrs.ts`; D179 over the
    7 Aug "no rule versioning" — his Q1), the Unavailable-only man in `pa`; rename-proof list words; structured "what this
    day shows" lines; AL panel "what the published day shows changed".
  - **2 NEW TESTS RED — fix first** (`src/ui/latepub.test.tsx`, the "Astra's code read" block): (a) "a man only on the
    Unavailable list…" — the fixture found no such man on the demo Monday: pick one by building an input for someone not
    on Monday (or check `DAYS[MON]` stores ids the finder misses); (b) "a rename beside a real warning change" — the list
    shows a "cleared" row: read the actual rows and decide whether it is a genuine cleared warning (the pers flip can clear
    one) or the rename leaking; tighten the assertion to the rename's own warning.
  - **Fable's 6 — NOT YET APPLIED:** (1) HIGH: drop the dates `a`/`b` from `inputs.ts inpDetailKey` (coverage is the
    membership test) and the date pair from `pendlist.ts inputWords` — a Mon–Tue leave stretched to Wed made Mon and Tue
    pending with unchanged faces; (2) pair a leftover gone/filed input by person (same type, or both downchits) in
    `frozenInputMatch` and carry was/now on the item so the words read one edit (a medical takeover read two lines); (3) add
    `OIL_STALE_DAY` and `OIL_STALE_HOLIDAY` to `validate.ts LIVE_ON_FACE` (a holiday declared after publishing otherwise
    counts twice); (4) merge folded units' `jump`/`keys` into the input item and let `inputWords` jump; (5) the load's
    message saying a member's input change stays pending (planned, not built); (6) wording ("input filing" → change).
    Each with a pin — his exact steps are in the Fable read.
- **Then, in order:** unit suite → break tests (one red per wired surface: `withDaySnap` install, `inputAxes`, `faceWarn`,
  `faceattrs`, the medical line in `inpShow`) → rebuild, re-walk (`HP_REWALK=… node scripts/handpass/am/late-pub-walk.mjs
  desktop|phone`, add a CAT-change, a brief-lead step, and a request edited after its deadline on a published day — no LATE
  on the published face, LATE on the working copy, LATE on the face after the next AL) → the full gates → fill the evidence sheet §5, §6, §9 and §10 (the
  look card draft is in this block's "Questions") → open the PR (checks run on the PR only; never push while they run,
  D151) → his look and "merge live".
- **Questions for him (the look card, `OUTSTANDING.md` `[LATE-PUB-FACE-LIVE]` — update it: items 1–2 are now BUILT
  frozen):** Q1 — a man's CAT on a puck and a blank brief's time now freeze on the published face (D179 read over the 7 Aug
  "no rule versioning"): keep it? Q2 — the next-day crew-rest mark now freezes too, so editing a draft Tuesday that changes a
  Monday man's rest makes published Monday pending and takes its four down: keep it, or let the mark follow the draft day?
  Q3 — medical freezes (D179, provisional): is a man going unfit after publishing reading fit on the published schedule
  until the next AL what he wants?
- **Branch:** `claude/leave-late-published`, pushed (no PR yet). Vercel preview: https://raptor-git-claude-leave-late-published-kai-e2f5.vercel.app
  (the last push predates Astra's fixes). Rulings this chat: D180 (the order), D181 (spent, archived). Range left: D182–D189.
- **Usage (D182, until Monday 28 Sep 26):** don't hold back — a second Fable + Astra read of the final fixes, parallel walkers, high thinking; the context window, not usage, is the limit.
- **After this merges (D180, D173):** `[ACCOUNTS]` on a new branch — its plan not started (D181's step 2 was not reached);
  the `OUTSTANDING.md` tidy (86 over its tripwire) on its own docs branch.
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
