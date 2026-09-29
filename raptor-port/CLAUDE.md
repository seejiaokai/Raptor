# RAPTOR — 142 Flying Programme (React app)

A flying-schedule planner for a fighter squadron: a week of flying waves,
duty crews, sims, ground events and personal inputs, with a validation
engine that flags crew-rest breaches, double bookings, missing briefs and
qualification problems, plus an amendment (AL) workflow for publishing
changes after a day is signed off. No server — per-browser localStorage.

This file is the INDEX. It holds the rules that apply to every task and
routes to where the detail lives; don't duplicate that detail back here.
Each AREA's own rules — its rulings, its settled decisions, its architecture — load by themselves
when a file of that area is opened (`../.claude/rules/decisions/`); how a change ships
(`../.claude/rules/shipping.md`) and where each new fact goes (`../.claude/rules/doc-structure.md`)
load in every chat. Map: §Where things live, at the end.
**Most rules here are ONE line** (D391, 28 Sep 26): a short form whose end names its full text, a heading of
`docs/guide-full.md`. Open it (searched, never loaded) before acting on a rule's detail or asking him about it.

## How to work here

**WRITE HIS RULINGS DOWN AT THE MOMENT HE SAYS THEM** (owner, 21 Sep 26): file each in its area's rulings file BEFORE the work it implies — where it belongs, not where you are working — and make its named home carry it; sweep for misses before any handoff or closing report, which carries a `Rulings:` line (`../.claude/rules/record-decisions.md`) · full text: docs/guide-full.md §Write his rulings down at the moment

**THE NEWEST OWNER INSTRUCTION WINS** (owner, 17 Sep 26; D90): where two rules conflict, follow the LATER-dated one and say which you followed and which you set aside; an undated rule loses to a dated one; if the newer one does not clearly cover the case, ask; fix the stale text in the same change · full text: docs/guide-full.md §The newest owner instruction wins

**Reach 95% confidence before building.** If the request could reasonably
mean two different things, or a choice would materially change the result,
ask follow-up questions until it wouldn't. Small, unambiguous asks clear
that bar on their own — don't manufacture questions for them.

**STANDING ORDER — weigh the whole ecosystem** (owner, 28 Aug 26): on every feature change, before building and before done, reason how it lands across the app (`docs/feature-impact.md`); tell him the ripples, risks and assumptions, ask where a question is genuinely his — the technical how stays yours; in doubt, a one-line heads-up with your call · full text: docs/guide-full.md §Weigh the whole ecosystem

**STANDING ORDER — sweep the rules, then hand-test against them** (owner, 20 Sep 26; now inside the bug-check order): on every build, find EVERY ruling that applies, list them for him, hand-test the running build against each, pass or fail, and flag at once a new ruling that contradicts or narrows an existing one — name both, say which is newer · full text: docs/guide-full.md §Sweep the rules, then hand-test against them

**THE BUG-CHECK STANDING ORDER IS `docs/bug-check-order.md`** (21 Sep 26): read it before any bug check and follow its tier rule. A code review plus green tests is NOT a bug check — it needs a ROLL-CALL, a WALK of the running app and an evidence sheet with pictures; without the report's `Walk:` line nothing is ready for "merge live" · full text: docs/guide-full.md §The bug-check standing order

**The two instruments, both standing:** a per-feature BEHAVIOUR REGISTER (one plain line per ruling, with its id) and `npm run rulecheck` (fails on a ruling no test names, outside the baseline) — run both; the rules-first sweep (`docs/superpowers/briefs/rules-first-red-team.md`) is the third standing review · full text: docs/guide-full.md §The two instruments

**`/brainstorming` overrides this section, and usually should not:** it mandates a committed spec and a task-by-task plan — for a list of concrete asks, ask the questions, then build; reach for it only when the shape is genuinely unsettled · full text: docs/guide-full.md §Brainstorming is the heavy path

**Match the process to the risk: MEDIUM is the default** (owner, 7 Aug 26): build, one reviewer, report, no spec or plan; LIGHT (build, gates) for cosmetics; HEAVY (spec → plan → reviewed tasks) only where a defect would be SILENT (persisted data, roles, engine, parity, perf), said so; a wide visual change is MEDIUM; state the time; prefer batches · full text: docs/guide-full.md §Match the process to the risk

- **The owner is non-technical** (6–10 Aug 26): what he reads is plain, complete and short — no raw output, what it means for him first, the app's own names; vocabulary, not depth — never hide a limitation; technical decisions are yours to make and explain, product direction stays his (`../.claude/rules/plain-language.md`, every session) · full text: docs/guide-full.md §The owner is non-technical
- **Shipping — tell him when you are DONE, ship ONCE per session, NO AUTO-MERGE** (10 Aug – 2 Sep 26) — the live rules, with "done" now meaning live on Vercel (D143), are `../.claude/rules/shipping.md` (loaded in every chat); this Pages-era wording moved 24 Sep 26, whole, to `docs/archive/raptor-claude-md-2026-09-24.md`.
- **MODELS — D67 (23 Sep 26): Opus 5.5 PLANS and BUILDS; Fable 5.1 and Astra REVIEW plan and code, never the model that wrote it (both on money, published records, permissions, persistence); when ASTRA builds, Opus 5.5 reviews; a bug Opus 5.5 cannot crack goes to Fable 5.1.** The 7 Sep text below is history; the 17 Sep 26 no-cheaper-model rule stands · full text: docs/guide-full.md §Models
- **Always hand him the Vercel preview link** (24 Aug 26) — now in `../.claude/rules/shipping.md`; this wording, with its superseded auto-merge clause, moved 24 Sep 26, whole, to `docs/archive/raptor-claude-md-2026-09-24.md`.
- **Delegate frugally, by judgment:** the main session plans, reviews diffs and runs the gates; no haiku or sonnet (17 Sep 26) — a subagent inherits Opus, takes read-only sweeps, and the implementation never leaves the main session; a delegate gets a precise spec and returns diffs and conclusions, never file dumps · full text: docs/guide-full.md §Delegate frugally
- **Token discipline:** send a long run to a file, keep its exit code, read the file; never read `reference/` or any file over ~300 lines whole — grep it or read a slice; while iterating run only the affected test file, the full gate set ONCE before the PR; prefer a fresh session per task · full text: docs/guide-full.md §Token discipline

**The rules-engine robustness doctrine** (owner, 21 Aug 26): an engine change is ~95% sure to break nothing, tested and walked EVERY time through his five gotcha families — people not following the format, missing input, user errors, deletions and edits from another page, sync between copies; prefer a `VCONF` + `RULE_SPEC` setting to a fixed number · full text: docs/guide-full.md §The rules-engine robustness doctrine

**Task-observer activation** (owner, 15 Aug 26): invoke the `task-observer` skill at the start of any task-oriented session, and when loading any skill apply the log's OPEN observations tagged to it; the one log is committed at `../.claude/skill-observations/log.md` — read it, append to it · full text: docs/guide-full.md §Task-observer activation

## Product bar & ideation (owner, 7 Aug 26)

Distilled from the owner's product-standards brief; this section IS the
standard — the full brief is deliberately not kept. Autonomy is unchanged:
the confidence rule above still decides when to ask, and green gates ship on
his explicit "merge live" (2 Sep 26 — `../.claude/rules/shipping.md`) — never
unprompted.

- **Ideate before building non-trivial UX:** restate the problem behind the ask, offer 2–3 directions with a case, rough effort and a recommendation, and let him pick (small unambiguous asks go straight to building); a visual direction gets a PICTURE first — a throwaway comp in the app's own stylesheet, at phone and desktop widths · full text: docs/guide-full.md §Ideate before building non-trivial UX
- **Challenge a risky ask in a sentence or two**: the underlying user
  problem, any unnecessary complexity, a simpler alternative, a wrong
  assumption — then build what the owner decides, without relitigating.
- **The bar is production, not prototype.** Clear hierarchy and primary
  actions; spacing, type and colour consistent with scheduler.css's
  measured contracts; responsive at phone and desktop (both gated in e2e);
  accessible — labels, contrast, keyboard reach; real empty, loading, error
  and confirmation states on every new surface. No placeholder behaviour
  presented as working.
- **UI quality is a standing decision axis on EVERY change** (owner, 12 Aug 26): on a phone easy to view, spacious, smooth, reachable; on a desktop using the width; weigh it when choosing a shape, say how the choice serves it, and report UI faults and openings seen while driving the build — as options · full text: docs/guide-full.md §UI quality is a decision axis on every change
- **UI copy reads PRODUCTION, never prototype** (owner, 25 Aug 26): no "session-only", "demo", "no server yet" or "controls will land here" caveats on screen — every label written as the database-era user will read it, the prototype truths kept as code comments beside the control (and in HANDOFF); helper text that explains what a control does stays · full text: docs/guide-full.md §UI copy reads production
- **Verified vs assumed, always distinguished.** "Checked" means read or
  run first-hand this session; anything else is stated as an assumption.

**Scoping any new work weighs four axes** (owner, 7 Aug 26), each grounded
in what this repo actually has rather than a generic checklist:

- **Performance & scalability:** read `docs/performance.md` Part 1 before any layout, interface, design or rendering change and run its checklist; DOM ceilings (`probes/perf-port.cjs`) rise only by an argued edit; timing budgets are never gated; every write through the mutation funnel, storage through its one route — no state outside those two · full text: docs/guide-full.md §Performance and scalability
- **User experience.** The bar above, plus the standing proof: the
  live-view pass in §Build & verify IS the UX check — drive the built
  bundle, screenshot, and look, before calling anything done.
- **Security:** no secrets in the repo; each user-entered string escaped at the builder; role checks at the page, the write path and the command gate, all asking ONE module, `src/state/perms.ts`, changed together with `docs/data-model.md` §11 (D200); the sign-in is not security (the lock is Vercel's, D59), so nothing sensitive goes in the demo data · full text: docs/guide-full.md §Security
- **Future development & DevOps:** ship through the gated pipeline only — five gates in CI plus two local-only for UI work; nothing deploys red; comments say WHY; each fact to its one home in the same PR (`../.claude/rules/doc-structure.md`); deploy and gate traps written in `docs/gates-and-deploy.md` · full text: docs/guide-full.md §Future development and DevOps

## Build & verify

Run from `raptor-port/`, not the repo root. All FIVE, after any change:

> **The WINDOWS DESKTOP is the only place work happens** (owner, 17 Sep 26): the phone is a remote control of the same session; the container paths below are legacy, kept for their traps — not instructions · full text: docs/guide-full.md §The Windows desktop is the only environment

> **A backgrounded command starts in the folder the CHAT started in:** move into `raptor-port/` BY ITS FULL PATH inside it (`cd "<repo>/raptor-port" && …`), or a bare `npm` fails at once and can still exit 0; a hook refuses one that would run elsewhere ([BG-CWD-GUARD], D162) · full text: docs/guide-full.md §A background command starts in the chat's starting folder


```
npm test                    # Vitest — must stay green
npm run build               # typecheck + build
node reference/tfin.js      # the original's assertions — must stay 728/0
npm run test:e2e            # geometry in a real browser — builds & serves itself
npm run smoke:tracker       # the Tracker tab's vendored 345-check browser suite — builds & serves itself
```

`test:e2e` is a gate of its own because jsdom has no layout engine: a puck that
had silently grown to 90px passes `npm test` all day. It runs in CI too.

**Stand up the live view for any UI-visible task, every session** (owner, 6 Aug 26): `npm run build && npx vite preview --port 4173`, driven at `http://localhost:4173/` (never `/Raptor/`), by a short Playwright script that signs in, screenshots the element and LOOKS at it, watching console errors, 4xx and page errors — before saying it works · full text: docs/guide-full.md §Stand up the live view

UI-visible work also needs the wider browser path:
`probes/run.cjs <name> port`, `npm run probes:adapted` (the six adapted
probes), `npm run perf` (the DOM ceilings and two behavioural checks, with
the reference-vs-port timings printed alongside) — all against that same
preview.
A fresh checkout needs `npm ci` first.
**Stop a stray preview server by its PORT, never by a command-line pattern:** on Windows `Get-NetTCPConnection -LocalPort 4173` → `Stop-Process` (`:4179` for the smoke suite's); a `pkill -f` / `pgrep -f … | xargs kill` inside a compound command matches and kills the caller's own shell · full text: docs/guide-full.md §Stop a stray preview server by its port
**A NEW Playwright script uses the repo's own browser fallback, never a hard-coded path:** copy `existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}` from `playwright.config.ts`; in the container only, never run `npx playwright install` · full text: docs/guide-full.md §A new Playwright script uses the repo's browser fallback
Sign in as `ad`/`a` (admin, Saber) or `us`/`us` (member, Ranger — NOT view-only: edits their own Inputs and Quals row); both are seeded accounts on Admin → Users (D166), and an admin-added account takes any password; the username is lowercased, the passwords compared exactly; never print them on the sign-in card · full text: docs/guide-full.md §Signing in for a walk
Login is `#luser` / `#lpass` / `#loginForm button[type=submit]`, same
as `e2e/app.ts`, and `#vWeek .day` is the "week is up" signal. Watch console
errors, page errors and 4xx responses on the way through; screenshot the
element in question and LOOK at it. *(Copied 24 Sep 26 from the container-era
paragraph archived below, which carried them.)*

**The deployed-site check, the container-only launch recipe, Pages publishing and the two deploy channels** (7 Aug – 17 Sep 26) — overtaken by D59 (Pages gone), D89 (checks on his PC) and D143 ("done" = live on Vercel); moved 24 Sep 26, whole, to `docs/archive/raptor-claude-md-2026-09-24.md`. What is live now: `../.claude/rules/shipping.md` (loaded in every chat) and `docs/gates-and-deploy.md`.

## Architecture rules (apply to nearly every task)

**NEW modules follow the ONE command layer, never a fourth store-pattern** (owner, 16 Sep 26): a new app, tab or module writes through the shared command layer over stable ids (until it lands: one funnel, stable ids, no bespoke undo) — never its own store, storage seam and undo; raise it in the design step (`docs/architecture-direction.md`) · full text: docs/guide-full.md §New modules follow the one command layer

**The store.** `notify()` bumps a version; components subscribe via
`useVersion()` (useSyncExternalStore) and re-read the singletons.
`state/view.ts` holds UI state the engine reads (CURPAGE, SBDAY, ARM,
selection) as module `let`s with same-module setters — ESM can't
reassign across modules. `WARN`/`REST`/`EVD` are reassigned by every
`validate()`: always re-read, never cache.

**The slot-key grammar** — everything addresses through it, the day index first after the prefix (`keyDay()` depends on it); every row carries a hidden `rid` (`engine/rowids.ts`), never printed, and the amendment book resolves rows by it, not by position; a copy strips ids (`stripRowIds`), a parked draft keeps them · full text: docs/guide-full.md §The slot-key grammar and row ids

- Flying seat `di.gi.li.ai.seat` (no prefix) — day, wave, formation,
  aircraft, seat `p` (FCP) or `w` (RCP).
- Duty `d:di.dwi.ri` · Sim `s:di.kind.ri` · Ground `g:di.ri` ·
  Programme `a:di.ri` · `.+` appends · `.xN` is overflow `row.more[N]`.
- `iu:<iid>` — an Unavailable row's person-reassign arm/drop target. The
  input's own id, no day component (one input can cover several loaded
  days, and none is more "its" day than another); addresses `INPUTS`, not a
  schedule row, so it never runs through `slotVal`/`setSlotVal`/`fillSlot` —
  `reassignInput` (`ui/inputedit.tsx`) is its one write path.
- Text keys: `dn:` day note · scheduler notes `pn:` programme, `dtn:` duties,
  `sn:` sims, `gn:` ground · `ap:` programme · `wl:`
  wave label · `ff:` formation · `fr:` flight remarks · `it:` in-times ·
  `dl:/dr:` duty · `sr:` sim · `gr:` ground · `st:` stores ·
  `ar:/at:` area/area-time · `tr:` traffic.

**Person identity is a stable hidden id** (14 Sep 26): every crew reference stores the PEOPLE key, never the callsign (`whoId`) — a rename moves nothing; sim `who` alone stays free text; the one add (Admin → Users, D217) refuses a callsign on the roster; an archived man's is free (D286, D295); a deleted man's flown days point at him (D290, D297) · full text: docs/guide-full.md §Person identity is a stable hidden id

**The mutation funnel — bypassing it is always a bug.** All schedule
writes go through `slotVal`/`setSlotVal`/`fillSlot`/`txtGet`/`txtSet` →
`noteChange(key)` → `afterSchedMutate()`. A write that skips it is
never re-validated, never persisted, wears no amendment mark and leaves no
edit-log entry. **CORRECTED 17 Sep 26:** it is NOT "absent from the next AL" —
since the amendment core, `publish.ts` derives eligibility, the panel counts and
the stored diff from the canonical `dayDelta`, "never from the accumulated
pending marks", so a funnel-bypassing write DOES surface in the next AL as an
unmarked, unexplained change. That is worse than being absent, not better. Deletes renumber the live key space first, then
call `markDeletion(di, kind)`: its inert `del:di.seq.kind` tombstone reaches
the AL without re-marking the address now occupied by a shifted row. On an
already-published day, compare the removed structure with the current issued
snapshot and its remapped draft-add identity first: add, reorder, then delete
before the AL is a net no-op, not a removal. The bare
`markEdit()` after it remains only the render/history epilogue.

**The persistence funnel — a write that ends anywhere else is LOST on reload**
(owner's 8 Sep 26 bug pass; moved here 17 Sep 26 from the §Where things live
Storage row, where nobody scanning for rules would find it). Every mutation of
`DAYS`/`SCHED`/`INPUTS`/`PEOPLE`/`PLAN` must end in **`HOOKS.histPush`** (never
the raw `histPush`), undo/redo, `loadWeek`, or an explicit `persistPeople()`.
**Since 30 Sep 26 a change to a WEEK, a REQUEST, a PERSON or the PLANNING CALENDAR is
saved only by the command it runs in** — its rows are written from that command's
changes (`[DB-READINESS]` group A, phases 1–2; `docs/undo-contract.md` §0): an in-place
mutation outside every command is not saved, whatever `histPush` it ends in. Anything else is silently
unsaved after a reload — no error, no clue, the edit just isn't there next time. Leave War: whatever it owns about a person beyond
the projection goes in a persisted record laid back on by `setPeople`.

**WHAT ACTUALLY PERSISTS** (verified 17 Sep 26): on a built site nearly everything survives a reload; memory-only is the dev server, tests, `?fresh=1` or storage that cannot be touched; session-only by design: undo/redo, the edit log and the view state. An older "session-only" sentence is stale — fix it, don't obey it · full text: docs/guide-full.md §What actually persists

**React owns chrome, strings own density.** The dense surfaces (week,
board, palette) are built by verbatim HTML-string builders and swapped via
innerHTML with string-diffing — that is what preserves scroll, carets and
the phone perf budget. Don't convert them to components.

**The Leave War tab is a SECOND app with a SECOND store** — its architecture (its own store and storage seam, what it persists, the one absence record, the four seams that cross the boundary and only four) moved 24 Sep 26, whole, to `../.claude/rules/decisions/leave-war.md` §Architecture, which loads with any Leave War file and with every file where it meets the rest of the app.

**The Tracker tab is a THIRD app with a THIRD store** — its architecture (its own store and storage doorway, the file is a format not a store, stable ids, the three seams, the same access for everyone — D121, the standalone export) moved 24 Sep 26, whole, to `../.claude/rules/decisions/tracker.md` §Architecture, which loads with any Tracker file and with every file where it meets the rest of the app.

## Coding conventions

- **`src/engine/` bodies are verbatim ports.** Compressed one-line style,
  semicolons, `:any` annotations — leave it alone. A diff there should be
  the behaviour change and nothing else; no tidying, no reformatting.
- **`src/ui/` and `src/state/` are ordinary TS/React**: 2-space indent, no
  semicolons, single quotes.
- **Comments explain WHY**, in prose, above the code — often the bug they
  fix. That density is the house style; match it.
- **`scheduler.css` carries measured contracts, not preferences.**
- **Every bug fix lands with a test that pins it**; new features get new
  tests. Never weaken a failing assertion — understand it.
- **Keep the records true in the same PR — each fact in its ONE home** (D140, `../.claude/rules/doc-structure.md`): a file change edits `docs/file-map.md`; open work in `../OUTSTANDING.md`, where things stand in `../HANDOFF.md` `## Now`; a passage not needed moves WHOLE to `docs/archive/` (D138, D141); a code change never trims a document (D29) · full text: docs/guide-full.md §Keep the records true in the same PR
- **Keep `docs/feature-impact.md` true in the same PR** (owner, 12 Aug 26 — the
  WALK itself is the 28 Aug standing order at the top of this file, which holds
  the surface list, the flows and the drift-seams): a feature that adds a
  surface, a flow, or a new drift-seam adds a line there.

## Stable decisions (do not relitigate)

Each entry is a tripwire: the decision is SETTLED — don't rebuild, re-propose or
re-litigate it. Where a reference doc holds the full story, the line keeps the
decision + a pointer. Owner + date establish authority; keep them.

### Pipeline & repo invariants
- **Push a BRANCH freely; ASK before `main`** (D60) and **never push while a PR's checks run** (D151) — moved 24 Sep 26 to `../.claude/rules/shipping.md`, loaded in every chat.
- **Do NOT watch PRs** (15 Aug 26) — moved 24 Sep 26 to `../.claude/rules/shipping.md` §Pull requests, loaded in every chat.
- `reference/` is **read-only** — the spec for existing behaviour. New features go
  beyond it but must not break it.
- The engine's original **generator is DELETED** (git history keeps it). Never
  recreate or rerun it — the engine is ordinary source now; regenerating clobbers
  real work.
- Keep `src/probe-bridge.ts` in sync when adding engine API.
- **Product invariants** (owner, 7 Aug 26 unless noted): no rule versioning (narrowed 26 Sep 26 by D186: a
  published day keeps the brief lead it printed, with it — one printed value, not a versioned rulebook) · no
  two-person approval · no "publish all days" · OIL is LL-equivalent · sim notes
  single-line · pucks never wrap · login page stays simple · the talon logo stays
  · a clicked warning lights its crew in the warning colours, never selection blue
  (blue is the puck-click selection only) · **no My Programme page** (built +
  removed the same day; don't re-propose — `git revert` restores it if he asks) · **no unit designation
  anywhere** (owner, 23 Sep 26): the bare squadron number is fine, but never paired with the squadron
  abbreviation, and the service abbreviation never at all — not in a title, a print header, an export, a comment
  or a doc (D58); the squadron — and he himself, where a document describes him — is "a fighter squadron" / "a
  fighter squadron scheduler", and the aircraft the bare "F-15" (D63); the Tracker's
  syllabus data is left out of these sweeps (D62), its event box's hint reading the bare type (D64).
- **No Edit-mode toggle** (owner, 9 Aug 26 — removed after months). Being on Edit
  Schedule IS edit mode; View-only Sched is read-only. `HOOKS.editMode()` =
  `canEditSched() && CURPAGE==='editsched'` — don't add a third term.

### Standing UI / design rules
- **A click-open popup closes on a click outside it** (owner, 4 Sep 26): any panel, menu or palette a tap opens dismisses on an outside pointer-down, a press on it or its toggle counting as inside (worked example: the ⚙ colour palette, `SettingsSheet.tsx`) · full text: docs/guide-full.md §A click-open popup closes on a click outside it
- **A control the user TAPS REPEATEDLY must not move under them** (owner, 2 Sep 26): its screen position stays fixed whatever the content it changes does (`RangePicker` pads every month to six rows; pin: `rangepicker.test.tsx`) · full text: docs/guide-full.md §A control tapped repeatedly must not move
- **The highlight MENUS read apart from their CHIPS** (owner, 25 Aug 26): `.hl-gtab` is a solid raised control, `.fchip` stays flatter and fills blue only when picked; don't flatten the tabs back to the chip recipe, and don't restyle the bare `.hl-grp` — History reuses it (`scheduler.css`, `ui/hlchips.tsx`) · full text: docs/guide-full.md §The highlight menus read apart from their chips

### Moved to the area files (24 Sep 26, D140)
Each group below now loads BY ITSELF, with its area's files (`../.claude/rules/decisions/`); its old sub-heading name is
kept, in full, in `docs/guide-full.md`, so a pointer written before the move (a code comment, a spec) still lands. Planning in an area before
opening its code? Open its area file first — `../.claude/rules/doc-structure.md`.
- Nine groups, each under its old name, moved 24 Sep 26, whole, to §Settled before this list of `../.claude/rules/decisions/scheduler.md` (late-input mark, Board behaviour, Waves & duties, Drag-reordering, Time format, Week navigation, Inputs & Admin, render/drag performance) or `leave-war.md` (roster & display, grid performance) · full text: docs/guide-full.md §The groups moved to the area files

## Where things live

| Need | Go to |
|---|---|
| **The implementation-role policy** (approved-spec discipline, verification without self-approval, review integrity, the closing report) — auto-loads via `paths:` whenever `raptor-port/src`, `e2e`, `probes` or `scripts` are touched, so it is live during any build | `../.claude/rules/raptor-executor.md` |
| **The plain-language rules, in force EVERY session** (unscoped, so they load before any project file is read — this file's §How to work here, with its full text in `docs/guide-full.md`, stays the source of truth and the why) | `../.claude/rules/plain-language.md` |
| **EVERY RULING THE OWNER HAS MADE, and the file that carries each one** — one file per area, filed the moment he rules, before the work it implies; How we work loads every session, each other area when its files are read (D137) — and each area file carries that area's settled decisions and architecture too (D140) | `../DECISIONS.md` (the map) → `../.claude/rules/decisions/` (one short line per ruling since D390) and their full rows `../.claude/decisions-full/` (searched, never loaded — open one before acting on a ruling's detail), replaced ones `../DECISIONS-ARCHIVE.md`; the rule `../.claude/rules/record-decisions.md` |
| **The full text of this guide's one-line rules** (D391) — searched, never loaded; each short form here names its heading there, and the document check pairs the two | `docs/guide-full.md` |
| **HOW TO BUG-CHECK — the standing order** (the tiers, the roll-call, the walk, the evidence sheet, and which jobs to spend Fable/Codex on). Read before any bug check | `docs/bug-check-order.md`; the two proposals it was merged from are `docs/superpowers/briefs/2026-09-21-bugcheck-method-fable.md` and `…-codex.md` |
| Validation, VCONF, publishing/AL, auth, history | `docs/engine-rules.md` |
| **What is stored, every record's fields, the three storage seams** (read before the shared-database step) | `docs/data-schema.md` |
| **The designed data model for the database step** (entities, ids, Person ↔ Enrolment ↔ Attempt, migration recipe — the technical team's document) | `docs/data-model.md`; the scheduler's declared record types `src/engine/schema.ts` (pinned to the seeds by `schema.test.ts`) |
| **The Dataverse handover** — the technical expert designs the tables himself (owner, 10 Sep 26); this is what he reads, what we need from him, the non-negotiables, and what we do on our side (stable ids first, then ONE adapter to HIS tables — never pre-built) | `docs/handover-dataverse.md` |
| **The architecture direction** — modular apps on a common data source: what the recommendation means here (a modular monolith front end, ONE backend, ONE database, an API contract per module, feature flags), the target shape, the order of work, the practices to hold to (read before any backend / server / API work, and before proposing to split a module out) | `docs/architecture-direction.md` |
| **The command layer & undo contract** — the ONE front door for how the app records change: the change stream (envelopes, causal closures, revisions), the per-store `write()` seam, and the checklist a NEW module or a NEW undo feature must satisfy so it plugs into the one shared structure instead of a fourth store-pattern (read before designing any new module that writes data, or any new undo capability — per-person / whole-import / global undo, the database) | `docs/undo-contract.md` |
| **Storage: the whiteboard, postman, backends, boot gate** | `src/storage/` — the ONE route to a backend (whiteboard → postman → Memory/Browser backend); `src/state/persist.ts` hydrates/persists live scheduler state. **The persistence rule itself now lives in §Architecture rules ("The persistence funnel") — read it there.** **Medical documents (photos/PDFs) are too big for that text seam, so they get their OWN per-browser drawer** — IndexedDB `raptor-docs` (`src/storage/docstore.ts`), wired by `docBoot` from `main.tsx` on the browser backend only; `state/docs`' in-memory map is the sync read path, `docAdd` writes through, `docBoot` hydrates it at boot (8 Sep 26). What is stored: `docs/data-schema.md`. |
| Rendering, drag & drop, text editing, AL marks | `docs/ui-contracts.md` |
| **Which surfaces a feature touches + how one edit flows** | `docs/feature-impact.md` |
| **Where things stand and what is next — the ONE handoff** (a block per chat under `## Now`; a new chat reads it first). Since 24 Sep 26 (D140) it holds current state only | `../HANDOFF.md` |
| **Open work — the ONE backlog** (the priority list first; a finished item leaves for its archive by script) | `../OUTSTANDING.md` (finished: `../OUTSTANDING-ARCHIVE.md`, searched) |
| **Every source file and what it does** — edit it in the same change that adds, removes or renames a file | `docs/file-map.md` |
| **How the gates and the deploy mislead; the checks on his PC** — read before trusting or re-running a red check | `docs/gates-and-deploy.md` |
| **How a change ships** — the branch loop, "merge live", what "done" means (always loaded) | `../.claude/rules/shipping.md` |
| **Where each kind of new fact goes, and when it leaves** (always loaded; D140, D141) | `../.claude/rules/doc-structure.md`; the policy and tiers `docs/doc-budget.md` |
| The history — how each past thing was found, fixed and shipped | `../HANDOFF-ARCHIVE.md` (a FROZEN snapshot as of 4 Sep 26; search it, never read it whole, never append to it); finished documents and passages moved out since, each unchanged: `docs/archive/` (its `README.md` lists them); then `git log` |
| Probe → reference → port results | `docs/probe-sweep.md` |
| **Every typed remark that switches a rule on** — the seed of the user guide; keep it true as rules are added | `docs/remarks-vocabulary.md` |
| Skill-improvement observations captured during sessions (the ONE log, committed) | `../.claude/skill-observations/log.md` |
| What changed recently | `git log --oneline` (not duplicated here) |
| Last session's leftovers | the chat's own block under `## Now` in `../HANDOFF.md` (the old `docs/session-state.md` retired to `docs/archive/` on 24 Sep 26) |
| The rules engine | `src/engine/` — `validate.ts` is the heart |
| Store / UI state / undo | `src/state/` |
| Components + HTML builders | `src/ui/` |
| **The Leave War tab** (vendored app: engine, store, UI, tests) | `src/leavewar/` — its own store and `leavewar:` storage keys; role written by `resetSession` and by the admin's member-view switch (`state/store.ts switchRoleView` — D292, 27 Sep 26, `[POST-OUT-OUTCOMES]`; the old `toggleRole` went with `[ACCOUNTS]`, D166 (3)); a posting out says which it is and does it on its date (`sync.ts postOut` / `runPoOutcomes`, `ui/OutcomeChips.tsx` — D229); stage-advance is admin-only (27 Aug 26, members still bid); a member bids only on their OWN row — the SIGNED-IN person (D166 (4); the "View as" person until `[ACCOUNTS]`), mirrored to `viewer` — while an admin edits any row (`canEditRow`, 27 Aug 26; enforced at the write path and the grid affordance alike); an admin decides bids at closed OR published (`canDecide`, 27 Aug 26 — since the 27 Aug overnight pass the STORE enforces it too: `setBidState`/`setBidStates` refuse anyone else, `shiftBid` carries `moveCells`' whole stage/window/war-day law *(retired 28 Sep 26 — every move goes through `moveRecords`, [LW-SPARE-MOVE-DOORS])*, `moveProblem` is the one validation body the landing preview and the commit share, a chain of closed moves keeps the ORIGINAL `shiftedFrom`, and NO ONE writes a medical mark on the war — medical is MEMBER-FILED only since 13 Sep 26, reversing the 17 Aug "management's" rule: blocked at `setCell`/`setCellRange`/`setCells` for every role incl admin, the pickers removed; the war still DISPLAYS member-filed medical, read from the Inputs (step 4, 20 Sep 26)); a drag selects a block to batch fill/decide/move/delete and a plain click still opens the single-cell sheet (`select.ts`, capture taken in `arm()`); the dotted "moved" mark is recorded AND shown only for a move made once bidding is closed (`biddingClosed`, 27 Aug 26 — an open-bidding shuffle stores no `shiftedFrom`, so it never sprouts the stripe when the war later closes); the colour pop-out is "Legend"; at PUBLISHED a tap on an approved leave opens the remarks editor (`RemarksSheet` → `sync.ts:leaveInputAt` + `inputedit.ts:setLeaveRemarks`, member edits own / admin any); CSS scoped under `#page-leavewar`; gaps in `docs/leavewar/known-gaps.md`, future sync in `docs/superpowers/specs/leavewar-sync.md` |
| **The Tracker tab** (vendored OCU progress tracker: syllabus flow charts, marks, pace) | `src/tracker/` — plain JS/JSX, its own store (`app/core.js`) and storage doorway (`storage.js`, `ocu:` keys), CSS scoped under `#page-tracker`; no role — admin and member have the same access, File menu included (D121, 23 Sep 26); `role.js` carries only the login-session end from `resetSession` (the file is a format, not a store — 9 Sep 26); page seam `TrackerPage.tsx`, kept mounted once visited; its browser suite `scripts/tracker/smoke.mjs` (`npm run smoke:tracker`, a CI job); gaps `docs/tracker/known-gaps.md`; the design specs it was built from `docs/tracker/specs/` |
