# Spring clean — Fable's red team of the plan (24 Sep 26)

Tier 3. Fable 5.1 (read-only) on `2026-09-24-spring-clean-plan.md` as first written, against `main` = `d0a1bb94`.
Saved whole; the dispositions are in the plan §7.

**Read against:** `main` = `d0a1bb94` (CLAUDE.md working copy is identical to main, so the plan's line numbers
hold). The build had already started beside this review — `b42eb41a` committed the `--move` mover,
`docsize --moves`, stub `file-map.md` / `gates-and-deploy.md`, and a root `docs/archive/`; two Fable-written
classification specs exist for H4/H5/O1/O2. The committed mover code was reviewed, not just §4's prose.

## HIGH

**1. Archiving `HANDOFF-NEXT.md` breaks his actual entry point.** `.claude/skill-observations/log.md:126` (OPEN):
*"the owner opens every session with 'Read HANDOFF-NEXT.md first'"*; `HANDOFF.md:186` says the same. After R1 the
file sits at `docs/archive/HANDOFF-NEXT.md` with `Next, in order → 0. THE SPRING CLEAN — recommended FIRST`
(`HANDOFF-NEXT.md:50–52`); a fresh chat given his habitual line will find it by name and act on a stale list.
**Fix:** leave a 3-line `HANDOFF-NEXT.md` at the root ("moved into `HANDOFF.md ## Now` — read that"), allowlist it
in the §1d clutter check, close observation #126 in this change, and give him the new opening line explicitly
(D140 point 5 makes the entry file his workflow, not ours to move silently).

**2. C8's premise is false in four places — §0a's "all three are inside it" does not hold for the 20 Sep order.**
Not in `bug-check-order.md`: (a) step 1's SEARCH scope — every doc and every earlier session, "a rule missing from
the task's own spec is not evidence it does not apply" (CLAUDE.md:69–72); (b) step 2 — **show HIM** the list in the
app's words (:73) — §9's sheet contents (bug-check-order.md:439–441) carry no rulings list; (c) step 3 — pass/fail
**per ruling** reported (:74–78) — absent from §7 and §9; (d) step 4 — name both, say which is newer, **put it to
him** (:79–81) — §12:537 says "flagged and *resolved*", which lets the agent resolve it (a meaning change), and §5's
WALK row (:333) omits the sweep while the order says EVERY build. Also `CLAUDE.md:97` ("the 20 Sep rules sweep
*above*") and :105–113 ("the sweep catches…") dangle after the move. **Fix (either):** keep :62–81 in CLAUDE.md and
archive only :83–93 with a pointer; or add the four to the order as a listed rewrite both reviewers check, then
move. Fix :97 and :105–113 either way.

## MEDIUM

**3. The Shipping block (§2a) — the list it must carry, checked against C9/C10.** Present in the plan: branch→"merge
live" loop, D60, D151, D86, Vercel link when Ready, Vercel his / preview ours, read PR conclusions next turn, once
per session, notify done/blocked, docs-only skip gates not approval, no PR-watching. **Missing:** do NOT go quiet
waiting on CI; take more work while a preview cooks, never idle (:216, :265–266) · the only reasons to come back
sooner + "waiting is not a reason: schedule a check-in" (:188–191) · a green PR sitting open is the intended
resting state (:221–222) · never notify twice / not for a quick reply he is watching (:177–179) · where the link is
(`vercel[bot]` PR comment, stable per branch) and the SSO signature (302 to `vercel.com/sso-api`) (:252–254,
:266–267) · "shipping is not how you test — every check before the PR" (:198–202) · the reasons D138 protects:
7 Sep six red runs unread (:219–220), 9 Sep merged-without-him (:262–264), the batching measurements (:203–208) ·
unsubscribe after opening; reading the URL once is not watching (:271–273) · from C10: the way back
`CI_ON_GITHUB=true` (`deploy.yml:82`), and the login selectors + `#vWeek .day` "week is up" signal (:591–592),
still used by every Windows drive — do not archive as container-only. **"Done" after D59:** no ruling defines it;
D59 only says Pages is gone and Vercel is his behind sign-in. The plan's reading omits the step that actually makes
it live for him: Vercel's *production* deployment going Ready (checkable from the GitHub deployment status without
opening the page). Write it as: merge → main's run green on his PC → Vercel production Ready → ONE notification
with the link; his look replaces the agent's — and mark it "the agent's reading, stated so he can correct it".
Don't restate D60/D151/D86/D89 — point to them (doc-budget §2).

**4. C2/C4 both take lines 1437–1439** (heading + "read `performance.md` first"). That defeats the mover's
exactly-once check and unbalances `--moves`. **Fix:** move the heading/intro once (to `scheduler.md`); give
`leave-war.md`'s section a one-line "Read `docs/performance.md` before any layout/render/drag change" as a listed
rewrite. Also C10's ranges overlap ("545–602, 593–633"); C10 is 530–633 whole.

**5. Leave War rules that bind SCHEDULER files move where a scheduler session won't load them.** `CLAUDE.md:1078–1082`
(qual catalogue = LoX column list) binds `src/engine/qualcols.ts`; C5's roster projection / `addPerson` /
`renameCallsign` rider binds `src/engine/people.ts` and `QualsPage.tsx`; the war derives from Inputs on read →
`src/engine/inputs.ts`; `Shell.tsx` pre-warm (:1478). **Fix:** add to `leave-war.md` `paths:`:
`raptor-port/src/engine/qualcols.ts`, `raptor-port/src/engine/people.ts`, `raptor-port/src/engine/inputs.ts`,
`raptor-port/src/ui/QualsPage.tsx`, `raptor-port/src/ui/InputsPage.tsx`, `raptor-port/src/ui/Shell.tsx`. Cost to
state: with `main.tsx`/`store.ts` widened, any session opening `store.ts` loads all three area files.

**6. C7 (the robustness doctrine) is cross-cutting, not scheduler-only.** It applies to Leave War's clash rules and
the Tracker's date logic; `raptor-executor.md:55` and `src/engine/validate.ts:190` point at *CLAUDE.md's* doctrine;
a planning session before any engine file is open loads no area file. **Fix:** keep it in CLAUDE.md.

**7. Sessions that never fire `paths:`.** Grep/shell reads and planning sessions load no area file; and
`raptor-port/CLAUDE.md` does NOT load for a root docs-only session (this very job). **Fix:** the always-loaded
`doc-structure.md` lists the four area files by path with "before planning or editing in an area, Read its rulings
file — Grep and shell reads do not load it", and names `raptor-port/CLAUDE.md` as the project guide; every
`## Now` block and backlog item names its area; consider a SessionStart hook that prints `HANDOFF.md ## Now`.

**8. Two homes for the same thing, three times.** Routing/tiers (`doc-budget.md` vs the new `doc-structure.md`);
maps (`HANDOFF.md:22–44` vs `CLAUDE.md` §Where things live); owner questions (`DECISIONS.md:54–58` vs the backlog).
**Fix:** `doc-structure.md` = short form pointing to `doc-budget.md`; HANDOFF "where to look" = one line to CLAUDE.md
§Where things live plus the two docs a root session needs; owner questions → backlog items.

**9. Byte-exact moves that arrive stale, and pointers the plan does not list.** H1 moves the file map whole, but
rows `HANDOFF.md:932` (BUG-TESTING), `:938` (session-state "absent is meaningful"), `:979` (skill writes
session-state), the `deploy.yml` row ("GitHub Pages deploy"), the `weekstash.ts` row ("session-only on purpose")
are false on arrival — and the file map's own rule is "edit in the same change". Same for `CLAUDE.md` §Coding
conventions :932–944, :48, :353, :1534, :1538; `README.md:60`; `raptor-port/README.md:12,16`;
`.claude/skills/TASK-OBSERVER-VENDORED.md:99`; ruling homes D135 (`HANDOFF-NEXT.md`), D151 (`HANDOFF.md §Deploy`),
D72, D30, D59 (`raptor-port/README.md` live-site line). **Fix:** put each in the manifest as a listed rewrite.

**10. Section pointers from code dangle after H1–H5.** `src/ui/AdminPage.tsx:283` (→ the PARKED DIRECTION block),
`src/engine/hooks.ts:72` (file map), `src/testing/refwin.ts:578`, `src/engine/audit-d-keyspace.test.ts:279`.
**Fix:** `HANDOFF.md` keeps a `## Moved` index (old heading → new home); the index must use the exact sub-heading
text the comments cite (`§Drag-reordering` canonical.ts:32, `§Week navigation` weekglide.ts:45, `§phone board…`
SchedBoard.tsx:358/board.ts:108, `§The Leave War…` inputedit.tsx:30).

**11. `docs/archive/` is at the repo ROOT, but inside `raptor-port/CLAUDE.md` `docs/…` means `raptor-port/docs/…`.**
The root `docs/` also holds misfiled clutter: `docs/audits/2026-09-07-*` and `docs/superpowers/plans/2026-09-08-*`.
**Fix:** CLAUDE.md pointers as `../docs/archive/…`; `git mv` the four strays under `raptor-port/docs/superpowers/`
(or the archive); extend the clutter check: at the root, only `docs/archive/**` may hold `.md`, and every
`raptor-port/docs/*.md` (depth 1) must be named in CLAUDE.md §Where things live or `file-map.md`.

**12. The mover, as committed — good on EOL, exactly-once, landed-once, rollback; missing:** (a) fence-blind
anchors; (b) refuse a block containing a `### [ID]` heading or a `| D<n> |` row outside fences ("use the item mover
/ `--rulings`"); (c) when `--pointer` is omitted, emit a fixed-shape pointer, and require a given pointer to
contain the dest path, so every pointer is greppable; (d) `--section` running to EOF should say so.
`docsize --moves`: also print lines ADDED that were removed nowhere (the rewrites the reviewers must read); it is
global — a line counts as "arrived" if the same text was added anywhere, which is why (a)–(c) belong in the
per-move check.

**13. §1d says "CI + the Stop hook", but the Stop hook runs `--inventory` only** (by design, D29). **Fix:** put
clutter/structure checks inside `--inventory` (not trims, so they may block a turn); ceilings stay CI-only; say so.
Also `docsize-selftest.mjs:95–98` hard-codes the FILES row text — update when the TARGET column goes; set
`HANDOFF.md`'s new ceiling explicitly (~250 with reason).

**14. What still re-bloats.** (a) A `## Now` block whose branch merged but whose chat never handed off again stays
— add a WARN in `--inventory` for a block whose branch is merged into `origin/main`. (b) The area files' "Settled
before this list" must be declared CLOSED (new decisions go in the table as D-rows) or it becomes a second home.
(c) `CLAUDE.md:225–245` (MODELS "Was:") and :274–279 are superseded by their own words.

**15. One `HANDOFF.md` is right for his workflow; three things to state.** Two parallel chats inserting blocks at
the same anchor WILL conflict on merge — the skill says "newest block first under `## Now`; the later merge keeps
both" (D78). Every handoff OVERWRITES its block even when nothing is pending. `HANDOFF-NEXT.md:65`
("→ 500 / 400 / 600") must not be carried into `## Next` (D141).

**16. D67 independence on the classification-driven moves.** H4/H5/O1/O2 follow two specs *written by Fable* — their
meaning check goes to Astra (+ Opus as the Claude-side reader); Fable checks the C-moves and rewrites. O1 also drops
two un-numbered rulings — "fix the architecture first, then individual bugs" and "STOP: interim two-system undo
patches + further quarantine rounds" (`OUTSTANDING.md:49–54`, 13 Sep 26) — give them D-rows first (D29 rule 2).

## LOW

**17.** `HANDOFF.md:92` (docs-only push cancels, starts no new run) vs `SKILL.md:52` / D151 (re-runs everything)
differ by event type — the H3 move keeps both with their conditions. · `HANDOFF.md:610` "the deployed site is
public" is false since D59 (listed rewrite); :618–627 superseded block → archive. · `[DOC-TRIM]` item still says
"Move them to `docs/stable-decisions.md`" (`OUTSTANDING.md:557–561`) — update. · Any new helper under
`raptor-port/scripts/` not matching `docsize*.mjs` / `backlog-archive.mjs` starts his PC run — keep verification
inside those two or under `.claude/`. · `oil.md:25` → `docs/archive/HANDOFF-OIL-WALK.md`. ·
`docs/superpowers/DESKTOP-HANDOFF.md` and `OVERNIGHT-BUGCHECK-REPORT.md` are handoff-shaped files outside the
structure, linked from `HANDOFF.md:39–40`; classify with the header (lines 1–73 are not in any H-row).

**Nothing in the plan contradicts a ruling outright**; the risks are meaning loss (2, 3, 9) and the structure not
loading where it is needed (5, 6, 7, 11).
