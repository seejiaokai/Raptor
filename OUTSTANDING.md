# Outstanding & standby tasks

A running backlog of work deferred or placed on standby, so it can be picked up
in a future session. Companion to `HANDOFF.md`; this is the "not now, but don't
lose it" list.

**To resume:** read this file first, then the relevant design record (linked per
item).

> ## Maintaining this file — do this every time it's touched
> - **Completed** → move the item to **Done** at the bottom, with the date and a
>   one-line "how it was resolved."
> - **Deferred again / changed** → update the item's status and note why, and
>   adjust its place in the priority list.
> - **Re-order the priority list whenever items change** — by *logical* order,
>   not habit: what's actionable now, what's blocked, dependencies, and effort
>   vs. risk. Call out any non-obvious ordering in one line.
> - **Before adding an item, verify it isn't already done** (check git log /
>   `main` / the code) — don't backlog completed work.
> - Keep it true, like `HANDOFF.md`. A stale backlog is worse than none.
> - Item **IDs are stable** (`[AMEND]`, `[OIL]`…); priority is a separate
>   ordered list that references them, so re-prioritising never renumbers items.
> - **Rich context → a committed context doc.** When a task carries reasoning worth
>   keeping (why a decision went that way, research, rejected options, mockup links),
>   capture it in a committed doc in the repo and link it from the item's **Context**
>   line — so the next session pulls the *thinking* out, not just the task title.
>   Don't leave the reasoning only in a chat; the chat is gone next session.

**Model guidance (owner's standing rule):** build / voluminous multi-file / lots
of reading → **Opus 4.8, default**; hard-reasoning review, bug-check, verify or a
tricky design call → **Fable 5.1, high**; mechanical / low-risk → a cheaper model.

---

## Priority — logical order (updated 11 Sep 2026)

Land what's **cheap, done, or in-flight and risk-reducing** before the big blocked
build; keep the amendment (the main project) unblocked; leave feature-ish and
future-milestone work last.

1. **[TRK-IMPORT] + [TRK-LEDGER]** — built on branches, fix real silent data-loss.
   Batch: re-check vs current `main`, then one merge-live.
2. **[AMEND]** — the main project. Unblock with the two owner decisions, then
   revise → Astra → build. **[BUG2]** folds in here.
3. **[OIL]** — depends on [AMEND]; do straight after.
4. **[TRK-CSID]** — next Tracker stable-ids step; independent, medium, not urgent.
5. **[TRK-ATTEMPTS]** — small new feature, low urgency.
6. **[DB-STEP]** — the future database milestone; **[TRK-DISK]** (Decision A) is
   fixed inside it.

---

## In plain terms (quick read)

One line each, no jargon:

- **[TRK-IMPORT] — Importing a file could silently drop a person.** If a file named a
  different person under a callsign already on the course, the old person used to
  vanish quietly. Fixed (it now refuses and asks you to rename first) — built,
  waiting to go live.
- **[TRK-LEDGER] — An interrupted first-load could hide your old data forever.** The
  one-time copy of old data into the new format could stop halfway and the app would
  think it was finished. Fixed (it resumes now) — built, waiting to go live.
- **[AMEND] — The amendment engine rebuild (the big one).** Each day gets its own
  amendments, published is locked, every change is a new AL, no take-backs. Design
  nearly done — waiting on your two decisions (plans, signatures).
- **[OIL] — Don't wipe off-in-lieu someone already earned.** Removing a person by
  amendment currently erases their weekend/holiday OIL — wrong if they'd already
  worked the day. Lock it once the day's been worked. After the amendment rebuild.
- **[BUG2] — Double-check one suspected bug.** A reopen button might act on the wrong
  version while you're viewing history — Astra thinks it may not actually happen.
  Quick check, folded into the amendment work.
- **[TRK-CSID] — Give courses and syllabuses a permanent hidden tag.** Students and
  schedule rows already have one (so they survive being moved or renamed); courses
  and syllabuses don't yet, so renaming one is riskier. Medium job, not urgent.
- **[TRK-ATTEMPTS] — Remember a student's earlier attempts.** Today only the latest
  grade is kept; this would keep the earlier tries too. Small new feature.
- **[TRK-DISK] — A rare "nearly-full storage" data-loss gap.** On upgrades or renames
  the app trusts its own memory instead of confirming the save really reached storage
  before deleting the original. Rare, mostly self-heals. Best fixed with the database
  step.
- **[DB-STEP] — The big future move to a shared database.** Today everything saves
  only in your own browser — nothing is shared across people or devices. This is the
  large future project (Dataverse) that several parked items fold into.

---

## Items

### [AMEND] Amendment engine redesign — DESIGN IN PROGRESS (blocked on 2 owner decisions)
Rebuild the publish/amend/version model: per-day isolated numbering (never
week-wide), published = immutable, every change a new AL, supersede-never-retract,
undo cannot cross a publish, load-old-version → republish-as-next-AL as the safe
recovery path.
- **Blocked on owner:** #1 plans (disappear at publish vs survive as contingencies);
  #3 signatures (all four roles re-sign each amendment vs fewer).
- **Must-build (Astra review):** AM-01 unique date-qualified version IDs; AM-02
  versioned saved-week migration (incl. Leave War's direct saved-week reads); AM-04
  define what a published version captures (availability leak); AM-06 bind
  signatures to content.
- **Then:** revise brief → re-run Astra on a **frozen** file → build (heavy,
  saved-data, test-first) → fresh Codex inspection.
- **Model:** build on Opus; each Astra round + final inspection on Codex; a tricky
  design call worth a Fable-high check.
- **Context & records (read to resume):** the decisions doc
  `raptor-port/docs/superpowers/specs/2026-09-11-amendment-model-decisions.md` now
  carries the full rationale, the industry research, the reopen/undo/correct
  reasoning and the interactive mockup links (§10) — plus `-design-brief.md` and
  `-review.md`.

### [OIL] Lock earned OIL on an already-worked day — STANDBY (after [AMEND])
An amendment that removes a person re-derives Leave War auto-OIL from the current
published version and sweeps it away — correct for a **future** day, wrong for a
**past** day already worked.
- **Decision (owner leaning, 11 Sep 26):** earned OIL on an already-worked day is
  **locked**; amendments only affect OIL for days not yet flown. Exception: an
  amendment whose explicit purpose is "he didn't work it after all."
- **Cross-feature, verified:** `src/leavewar/sync.ts` `runOilPass`/`desiredOilCells`
  + `src/engine/oil.ts`; acknowledged claims (`row.oil`) are the only sticky source
  today. Sequenced after [AMEND].
- **Model:** build on Opus; a Fable-high bug-check (touches money + saved data).

### [BUG2] Verify the reopen control during version preview — SMALL (folds into [AMEND])
Astra says the original Bug 2 may **not** reproduce (EditWeek `ed=false`; SchedBoard
`pv=true` → no controls emitted). Verify; keep the defensive handler guards.
- **Model:** Fable, high — short, focused verification.

### [TRK-IMPORT] Tracker import-conflict refusal (#386) — BUILT, NOT MERGED
Import refuses when a file names a *different person* under an existing callsign,
before writing anything.
- **Status:** branch `claude/tracker-import-conflict-fix` (PR #386), gates green
  when built. **Not on `main`** — needs re-check vs current `main` + merge-live.
- **Related wording gap:** the import dialog says "nothing else is touched," but it
  *does* overwrite a carried student's marks — restoring an old backup would quietly
  revert newer marks. Decide the message alongside this.

### [TRK-LEDGER] Tracker legacy-import ledger — Decision B — BUILT, NOT MERGED
A half-finished first-time import used to seal itself and hide the rest forever; the
fix resumes instead and grandfathers existing browsers.
- **Status:** branch `claude/storage-legacy-import-ledger` (PR #387), built. **Not
  on `main`** — needs re-check vs current `main` + merge-live.

### [TRK-CSID] Give courses & syllabuses their own hidden ids — OPEN (medium)
Students and schedule rows now carry stable hidden ids (rename/reorder-safe);
**courses and syllabuses do not** — they're still keyed by name, so renaming a
course/syllabus still moves data by name and is not as safe as renaming a student.
Give them their own ids so a rename becomes identity-stable too. (Verified open:
no course/syllabus id in `tracker/app/core.js`/`ids.js`; CLAUDE.md still treats
their names as storage-key segments.)
- **Model:** build on Opus (multi-file plumbing); a Fable-high final review
  (persisted data, silent-defect risk).

### [TRK-ATTEMPTS] Keep a student's attempt history — OPEN (small, feature)
Remember a student's *earlier* tries at an event, not just the latest grade. More a
new feature than a cleanup. (Verified open: no attempt-history in `tracker/`.)
- **Model:** build on Opus, default; small, clear spec.

### [TRK-DISK] Tracker migration/rename "safety check" reads memory, not disk — Decision A — OPEN
On upgrade or a course/syllabus rename, the app copies records, checks the copy in
**working memory**, then deletes the originals — so a failed disk write (storage
full) can delete an original before its copy is safely saved. Same gap on syllabus
rename. Largely self-healing; bites only near-full storage + tab closed before the
retry (more likely on iPhone). Never fixed, not logged as a limitation.
- **Fix within [DB-STEP]:** a real "it's saved" signal the delete waits for, rather
  than a piecemeal patch in three places. Or pull earlier on request.

### [DB-STEP] The shared-database step (Dataverse) — FUTURE MILESTONE
The big future move: Raptor, Leave War and Tracker all run on `localStorage` /
session today; the target is a shared database (**Dataverse** — `src/storage/`
seam, `docs/data-model.md`). Large, design-first, its own red-team. Several parked
items are meant to be resolved here — notably **[TRK-DISK]** (the memory-not-disk
save signal) and the Tracker's dropped SharePoint/Dataverse/Firebase layers.
- **Model:** design review on Fable, high (the expensive-to-get-wrong decision);
  build volume on Opus.

---

## Done

### [SEC-ALTIP] AL panel tooltip HTML injection (AM-08) — DONE (11 Sep 2026)
The amendment sign-off tooltip could run injected code from a crafted callsign;
it's now escaped at display time, so already-saved names are covered too. Verified
end to end: merged as **PR #393** to `main` (CI green), deployed, and confirmed on
the live site (Amendments panel renders normally, no errors). Found by the
Astra/Codex amendment review; fixed in its own spawned session.
