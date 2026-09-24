# The spring clean — plan, move map and checks (24 Sep 26)

Tier 3: read only for this job. The job is `OUTSTANDING.md` `[DOC-TRIM]` "THE SPRING CLEAN", done on branch
`claude/spring-clean`. The owner's words that bind it are rulings **D138** (a summary never changes the
meaning), **D139** (spend freely on Opus 5.5 and Fable; Astra reviews), **D140** (the whole repo reads by
relevance and keeps itself tidy, woven into his workflow — no future spring clean) and **D141** (no line
targets: the test is whether each block is needed where it sits, organised and clear). All four are in
`.claude/rules/decisions/how-we-work.md`.

**Method, fixed by D138:** text is MOVED WHOLE — byte for byte — to where it is read less often. Where a
passage is REWRITTEN (a stale Pages-era rule, a priority list, a pointer), the old text moves whole to an
archive first and the new text is checked for meaning by Fable AND Astra, who did not write it, before the
branch is offered for "merge live".

---

## 1. The structure this builds (D140)

| Layer | What is in it | How a session gets it |
|---|---|---|
| **0 — always** | `.claude/rules/*.md` without `paths:` (plain-language, bug-check, record-decisions, NEW `doc-structure.md`), the general rulings `.claude/rules/decisions/how-we-work.md`, and `raptor-port/CLAUDE.md` (loads with any `raptor-port/` file — in practice every session) | loaded by the app |
| **1 — session start** | `HANDOFF.md` — the ONE handoff: where things stand, what is next, per chat | the fresh chat is told to read it (his workflow) |
| **2a — by area, automatic** | `.claude/rules/decisions/<area>.md` — the area's rulings AND (new) its settled decisions from before the list AND its architecture | loaded by the app when a session opens a file matching the area's `paths:` |
| **2b — by job, navigated** | reference docs: `engine-rules.md`, `ui-contracts.md`, `feature-impact.md`, `performance.md`, `data-schema.md`, the known-gaps files, `bug-check-order.md`, and NEW `docs/file-map.md` and `docs/gates-and-deploy.md` | named in `raptor-port/CLAUDE.md` §Where things live and in each area file's "Where the detail lives" line |
| **3 — one task** | specs, plans, briefs, evidence sheets | only when the task names them |
| **4 — archive** | `HANDOFF-ARCHIVE.md`, `OUTSTANDING-ARCHIVE.md`, `DECISIONS-ARCHIVE.md`, NEW `docs/archive/` | searched, never read whole |

**One handoff file, not three.** Today a fresh chat meets `HANDOFF.md` (984 lines, mostly history and
reference), `HANDOFF-NEXT.md` (the real next steps) and `raptor-port/docs/session-state.md` (a stub kept only
so a promise in `CLAUDE.md` holds). His global instructions say the handoff notes go into `HANDOFF.md`. So:
`HANDOFF.md` becomes the one handoff — `## Now` (one short block per chat/branch), `## Next, in order`,
then the standing bits (gate baseline, standing constraints, where to look). `HANDOFF-NEXT.md` and
`session-state.md` move to `docs/archive/`; the session-handoff skill writes `HANDOFF.md ## Now` and nothing
else (D70: Fable + Astra read the skill change; he approves it).

### 1a. Where a new fact goes — one home each (becomes `.claude/rules/doc-structure.md`)

| It is… | Its home |
|---|---|
| a ruling (a decision, preference, correction, "leave it", "no") | its area's rulings file, the moment he says it (`record-decisions.md`) |
| an open job, a found-not-fixed, a deferral, an owner question to come back to | an `OUTSTANDING.md` item — the ONE backlog |
| how a rule or surface behaves (a contract) | `engine-rules.md`, `ui-contracts.md`, `feature-impact.md`, `performance.md`, `data-schema.md` |
| a rule every task needs, whatever the area | `raptor-port/CLAUDE.md` — only if truly every task |
| a rule or piece of architecture one area needs | that area's file under `.claude/rules/decisions/` |
| where things stand / what is next / what this chat left | `HANDOFF.md ## Now` (overwritten at each handoff, never appended) |
| a gate count | `HANDOFF.md` §Gate baseline — only a count from a run watched |
| a gate or deploy trap | `raptor-port/docs/gates-and-deploy.md` |
| a new, renamed or deleted file | `raptor-port/docs/file-map.md` |
| the story of how something was found or fixed | the commit message; a bug check's evidence sheet |
| a design, plan, brief, scenario list | `raptor-port/docs/superpowers/{specs,plans,briefs}/` (tier 3), linked from its backlog item |
| a one-off handoff for a big job | NOT a new root file — `HANDOFF.md ## Now` plus a tier-3 doc linked from the item |

### 1b. When it leaves
- A finished backlog item → `OUTSTANDING-ARCHIVE.md` by `backlog-archive.mjs <ID> --homes …` (D29, unchanged).
- A replaced ruling or spent one-off permission → `DECISIONS-ARCHIVE.md` by `backlog-archive.mjs --rulings` (D136).
- A `HANDOFF.md ## Now` block whose work has merged → deleted at the next handoff; its open residue becomes a
  backlog item first; the story is in git. (Nothing else in `HANDOFF.md` accumulates.)
- A passage in an always-read file that a newer ruling supersedes → moved whole to `docs/archive/` IN THE SAME
  CHANGE that supersedes it, leaving the new rule and a one-line pointer (the newest-instruction-wins rule
  already says "fix the stale text in the same PR"; this says where the old text goes).
- Any other section that is no longer needed where it sits (D141) → moved whole by
  `backlog-archive.mjs --move` (NEW, §4) to its home above.

### 1c. Woven into his workflow (D140 point 5)
- **A fresh chat** reads `HANDOFF.md` (his opening prompt names it); layer 0 is already loaded; each area
  loads itself as files are opened; anything else is found through the map.
- **During the work** each fact is written to its home as it happens (rulings at the moment — D13; state
  into the repo at every clean point — D68).
- **The handoff between chats** (his main way of carrying work on — he seldom compacts): the
  session-handoff skill overwrites this chat's `## Now` block, files open residue in the backlog, deletes
  merged blocks, and the new chat gets a ready-to-paste prompt naming `HANDOFF.md` and the branch.
- **Parallel worktrees merged together:** each chat edits only its own `## Now` block, its own backlog items
  and its own D-number range; the later merge brings `main` in first and reconciles (D78).
- **"Merge live"** is unchanged (D60): the branch carries everything; the doc gate is part of the checks.
- **Compaction** (rare): the same as a handoff — persist first, then compact.

### 1d. Enforced, not remembered (D140 point 4, D141)
`raptor-port/scripts/docsize.mjs` (CI on every PR + the Stop hook at the end of every turn):
- **Ceilings stay, as TRIPWIRES** on the layer-0/1 files (and `HANDOFF.md`, whose `## Now` must not become a
  log). The failure message says what to do: move what does not belong to its home (§1a), never cut to a
  number; raise the ceiling with its reason when what crossed it belongs there. The fixed TARGETS
  (500/400/600) and the "over target" report are withdrawn (D141). New tier-2 docs get no ceiling.
- **Root clutter fails:** a new `*.md` at the repo root outside a short allowlist (README, HANDOFF,
  HANDOFF-ARCHIVE, OUTSTANDING, OUTSTANDING-ARCHIVE, DECISIONS, DECISIONS-ARCHIVE) fails with "put it in
  its home (doc-structure.md)".
- Everything it already guards (the backlog inventory, the rulings map, homes) stays.

---

## 2. The moves — `raptor-port/CLAUDE.md` (1,543 lines)

Line numbers are `main` at `d0a1bb94`. Every move is byte-exact and leaves a one-line pointer.

| # | Lines | What | To |
|---|---|---|---|
| C1 | 1003–1087 | §Stable decisions → "Leave War roster & display" | `leave-war.md` §Settled before this list |
| C2 | 1437–1439 + 1444–1491 | §Stable decisions → "Leave War grid & …" heading + intro, and its three Leave War bullets (the bidding box, the tab opens on the war being bid on, the year-grid window engine) | `leave-war.md` §Settled before this list |
| C3 | 1088–1436 | §Stable decisions → the late-input mark, Board behaviour, Waves & duties, Drag-reordering, Time format, Week navigation, Inputs & Admin | `scheduler.md` §Settled before this list |
| C4 | 1437–1443 + 1492–1516 | §Stable decisions → "… scheduler render/drag performance" heading + intro, the board DOM ceiling, the dragged ghost, the per-block day swap | `scheduler.md` §Settled before this list |
| C5 | 748–817 | §Architecture → "The Leave War tab is a SECOND app with a SECOND store" | `leave-war.md` §Architecture |
| C6 | 818–921 | §Architecture → "The Tracker tab is a THIRD app with a THIRD store" | `tracker.md` §Architecture |
| C7 | 296–333 | "The rules-engine robustness doctrine" | `scheduler.md` §Working rules for this area |
| C8 | 62–94 | the 20 Sep "SWEEP THE RULES" standing order + "Why this is an order" — ABSORBED by `bug-check-order.md` (D10; §0a of the order says all three earlier orders are inside it) | `docs/archive/raptor-claude-md-2026-09-24.md` |
| C9 | 173–224, 246–273 | the Pages-era shipping bullets: "Tell him when you are DONE" (its "Done MEANS LIVE" chain ends at Pages), "Ship ONCE PER SESSION", "SUPERSEDED 2 Sep 26 — NO AUTO-MERGE", "Always hand him the Vercel preview link" | `docs/archive/raptor-claude-md-2026-09-24.md`, replaced by ONE current "Shipping" block (§2a) |
| C10 | 530–544, 545–602, 593–633 | §Build & verify: "The deployed site is reachable now…", the container-only legacy (reachability + Chromium launch recipe), "Push to main → … Pages", "Two deploy channels", "Docs-only changes skip the gates" | `docs/archive/raptor-claude-md-2026-09-24.md` (history); the live facts restated in the Shipping block |

**Stays in `raptor-port/CLAUDE.md`** (cross-cutting): How to work here (minus C7–C9), Product bar, Build &
verify (minus C10), Architecture rules (minus C5–C6: the store, slot keys, person identity, both funnels,
what persists, strings own density, the command layer), Coding conventions, §Stable decisions →
"Pipeline & repo invariants" and "Standing UI / design rules", Where things live. §Stable decisions keeps an
index of where each moved subsection now lives, so every old pointer ("§Stable decisions", seven of them in
code comments that a docs pass must not touch) still lands.

**Each area file** gets, after its rulings table: `## Settled before this list` (the moved text under its
original headings, with the original preamble "Each entry is a tripwire…" and one line saying the table
above wins where a row changes an entry), `## Architecture` where moved, and `## Where the detail lives`
(pointers only). **`paths:` widened** so the moved architecture loads wherever its seams are touched:
`leave-war.md` + `raptor-port/src/main.tsx`, `src/probe-bridge.ts`, `src/state/store.ts` (resetSession),
`src/state/inputgate-hook.ts`, `src/storage/boot.ts`, `src/ui/inputedit.tsx`, `docs/data-schema.md`;
`tracker.md` + `src/main.tsx`, `src/state/store.ts`, `src/ui/logout.ts` (already), `docs/data-schema.md`.

### 2a. The new Shipping block (REWRITE — checked by both reviewers)
Every live rule in C9/C10, each with its date or ruling, in one place, current as of D59/D60/D89/D151: the
branch-and-"merge live" loop; push freely to a branch, never to `main` without "merge live"; never push while
a PR's checks run; checks run on his PC, one full run at a time; hand him the Vercel link when Ready, Vercel is
HIS surface and the local `vite preview` is the agent's; read the PR's check conclusions on the next turn and
fix a red one then; ship once per session / batch; PushNotification when genuinely done or blocked, not for
progress; "done" after "merge live" means carried through to `main`'s own checks going green, then ONE
notification — the Pages rollout and the agent's own live-page look ended with D59 (the live app is `main` on
Vercel, behind his sign-in); docs-only changes skip the gates but never his "merge live"; don't watch PRs.

## 3. The moves — `HANDOFF.md` (984 lines), `HANDOFF-NEXT.md`, `OUTSTANDING.md`, the root

| # | Lines | What | To |
|---|---|---|---|
| H1 | 777–984 | §File map (two thirds of the file's weight) | `raptor-port/docs/file-map.md` (new, whole) |
| H2 | 74–181 | §Gate status: the per-gate table, the Windows note, "How the gates lie" | `raptor-port/docs/gates-and-deploy.md` §How the gates lie |
| H3 | 629–776 | §Deploy — the traps (Pages parts labelled history) | `raptor-port/docs/gates-and-deploy.md` §Deploy, under a new short "Now" block (REWRITE, checked) |
| H4 | 184–391 | §In flight | per Fable's classification: resolved stories → `HANDOFF-ARCHIVE.md` `## Moved 24 Sep 26`; durable facts → their tier-2 doc; the three standing bullets stay |
| H5 | 392–601 | §Open / deferred / queued ("Not a backlog", [DOCS-GUARD] F7) | per Fable's classification: open → a backlog item each (moved whole under an id heading); resolved → `HANDOFF-ARCHIVE.md`; durable → tier-2 doc |
| H6 | `HANDOFF-NEXT.md` whole | the merged stories → `HANDOFF-ARCHIVE.md`; the live "Next, in order" and "how rulings are kept" → `HANDOFF.md ## Now` / `## Next`; the file → `docs/archive/` |
| O1 | `OUTSTANDING.md` 41–236 | the stale model line (superseded by D67), the old priority list and the plain-terms block | `OUTSTANDING-ARCHIVE.md` whole, under a dated heading; replaced by a live-only list (REWRITE, checked) that names every order he set (Fable's Task B/C) |
| O2 | finished items | per Fable's classification | `OUTSTANDING-ARCHIVE.md` by the script, each with its `--homes` |
| R1 | root | `HANDOFF-OIL-WALK.md`, `HANDOFF-S4-BUGHUNT.md`, `BUG-TESTING.md` (retired, D72), `HANDOFF-NEXT.md`, `raptor-port/docs/session-state.md` | `docs/archive/` (git mv), every live pointer updated (the `oil.md` `paths:` entry, rulings homes, the backlog, READMEs); pointers inside `raptor-port/src` and `e2e` are NOT touched (a code change would start a full run on his PC) — a filename still finds the file |

`HANDOFF-ARCHIVE.md` said "frozen as of 4 Sep 26, never append" — the approved plan (step 3) sends resolved
stories there, so the newer instruction wins: whole sections may arrive under a dated heading, nothing already
there is ever edited; the header, `CLAUDE.md` and the skill say so.

## 4. The mover (so this and every later move is exact)

`raptor-port/scripts/backlog-archive.mjs --move <file> --from "<exact first line>" [--to-line "<exact last line>" |
--section] --dest <file> [--under "<heading line>"] [--pointer "<text>"] [--dry-run]`: finds the source text
EXACTLY ONCE (refuses 0 or 2+), moves the bytes unchanged (line endings kept), appends to the destination
(under the heading if given, creating it at the end once), leaves the pointer line in its place, then checks
the moved bytes appear in the destination exactly once and the inventory is clean — or puts every file back.
`--section` ends at the next heading of the same or higher level. It lives in `backlog-archive.mjs` because
that file is already the one mover and is skipped by the deploy gates (a new script name would start a full
run on his PC).

## 5. The checks
1. **Mechanical, every move:** the mover's own exact-once check, then a closing verification script over the
   whole branch: every non-blank line that left a file on this branch is found, the same number of times, in
   the destinations (a multiset diff of removed vs added lines across all files, rewrites excepted and listed).
2. **Meaning (D138):** Fable and Astra each get the before/after of every file, the move manifest and the
   list of rewrites, and are asked ONLY whether any rule, condition, exception, date or reason changed,
   vanished, or now sits where the sessions that need it will not load it (a move to the wrong tier is a loss
   too). Findings fixed, re-checked where they touched.
3. **`npm run docsize` green** (and its self-test), ceilings moved in this docs-only change with reasons.
4. **The skill change** (session-handoff) read by both (D70), then his approval.
5. Bug-check tier: stated at report time from `bug-check-order.md` (docs and gate script only; no app code).

## 6. Open questions for the red team
- Is anything in C1–C10 needed by sessions that will NOT load the destination? (e.g. a Leave War rule needed
  while editing a scheduler file, the robustness doctrine needed while planning before any engine file is open)
- Is one `HANDOFF.md` (merging `HANDOFF-NEXT.md` and `session-state.md` into it) right for his workflow, or
  does it break something (parallel chats, the skill's "absent file = nothing pending" promise)?
- Is the Shipping block's reading of "done" after D59 right, or is it inventing a rule?
- What in the new structure would still let the repo bloat again, and is the gate the right forcing function?
