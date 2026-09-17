# Correctness sweep of the build-critical documents — 17 Sep 26

**Why:** the ARCH-STACK Step 2 design spec (Rev 5) was written on 16 Sep, BEFORE the 17 Sep
discovery that several always-loaded documents were wrong about the exact machinery it describes.
Building follow-up #1 from it risked baking in the same false premises silently.

**Method (the one that works):** every dated claim was checked against **the CODE it describes**,
never against another document. Fable's own diagnosis of why it missed the persistence bug first
time — *"I checked text against text, and all three files agreed with each other while disagreeing
with the source"* — is the whole reason. A document agreeing with another document is evidence of
nothing.

**Out of scope, deliberately:** dead code, unused CSS, orphaned files, general optimisation
(`[REPO-CLEANUP]` in OUTSTANDING.md). Nothing here deletes code.

**Gates after the sweep:** vitest 4865/4865 · parity `tfin.js` 728/0 · build green.

---

## A. Two mechanical passes worth repeating on any future sweep

Both are cheap and both found things a careful claim-by-claim read missed.

1. **Symbol-existence pass.** Extract every backticked code identifier the docs name and assert it
   still resolves somewhere in `src/`. 743 distinct identifiers checked; 136 unresolved, of which
   **all but three were expected** — `docs/data-model.md` is the *designed target* schema and
   `docs/data-schema.md` §Suggested first cut of tables is a proposal, so their names are supposed
   not to exist yet. The three real hits are findings 12, 13 and 16 below.
2. **Citation-landing pass.** For every `file.ts:NNN` reference, print the line it actually lands
   on. A citation landing on a closing brace or an unrelated comment is a reliable tripwire for a
   section that has drifted — that is exactly how finding 14 (a function deleted from the codebase
   but described as live in nine places) surfaced.

**Repair policy used for citations:** a line number still landing inside the function it names was
left alone. One landing on unrelated code was replaced with `file.ts:symbolName`, which cannot rot
again, rather than with a fresh line number that will rot in a week.

---

## B. The claims → evidence table

This is the table to hand a reviewer. For each one: what the document said, what the code says, and
the file to open. **Nothing here was taken from another document.**

| # | Document said | The code says | Open this |
|---|---|---|---|
| 1 | Spec §2.1: `markEdit` fires `renderStatus` + **toast** + `logEdit` | `markEdit` runs `logEdit` → `renderStatus()` → `histPush()`. **No toast.** `logEdit` has no toast either; `logAction`'s own comment says the *calling site* names the action "in the same words its toast already uses" | `engine/publish.ts:markEdit`, `engine/editlog.ts` |
| 2 | Spec §2.1: `runInputWrite` at `store.ts:131-155` | The file is `state/store.ts`; the body is `runInputWrite` and has moved (Step 2 added `commitInputs` above it) | `state/store.ts:runInputWrite` |
| 3 | Spec §2.1: "≥11 writers reach `HOOKS.histPush` without `afterSchedMutate`" | Exactly **12** production sites: `state/store.ts` ×3, `engine/publish.ts` ×4, `ui/interactions.ts` ×2, `ui/DraftsModal.tsx` ×2, `ui/Shell.tsx` ×1 | grep `HOOKS.histPush` across `src/`, excluding tests |
| 4 | Spec §2.1a: `setDayApproved` at `publish.ts:180-201` | `engine/publish.ts:setDayApproved` — the cited range starts inside the preceding comment | `engine/publish.ts:setDayApproved` |
| 5 | Spec §2.3: Leave War `persist()` writes "~22 keys" | **21** keys | `leavewar/state/store.ts:rawPersist` |
| 6 | Spec §3.1: the day record is `days/<wk>:<date>` | The built id is `` `${wk}#${di}` `` — week key + day **INDEX** | `state/sched-commit.ts:schedRecords` |
| 7 | Spec §3.1/§3.4: `sched.als/<wk>:<verId>` | The built id is `` `${wk}:${n}` `` — the AL **array index** | `state/sched-commit.ts:schedRecords` |
| 8 | Spec §3.1: the Leave War registry is cells + bids + six coarse records | There is also **`lw.war/<warId>`** (the period record). Without it a stage advance, rename, bidding-window change or a brand-new cell-less war diffs to nothing — added during the build (Fable-2) | `leavewar/state/store.ts:lwDecompose`, `lwRegisterCommands` |
| 9 | Spec §3.1: `lw.config` = eventdefs/figorder/rosterorder/perslabels/manning\*/group\*/showsans/personedits | Also `figureHidden`, `requirements`, `eventRows` | `leavewar/state/store.ts:lwDecompose` |
| 10 | Spec §3.1: the Tracker registers 10 collections | **11** — `trk.courses` was omitted | `tracker/app/core.js` (the `cols` array) |
| 11 | Spec §3.2/§5.1: the mid-reducer `notify`/`toast`/`logEdit` are latched | The build **deliberately did not wire toast or edit-log latching**, and says why in its own header. The model + repaint/history effects ARE latched | `state/sched-commit.ts` file header |
| 12 | `feature-impact.md`: the Drafts button is `board.ts`'s `draftsMenu` | No such function. It is **`planMenu`** (`planSelectorHTML` → `planMenu`) — the drafts menu became the Plans selector | `ui/board.ts:planMenu` |
| 13 | `feature-impact.md`: manning thresholds are "persisted `manningthresh`… rule definitions stay code-owned" | The whole rule set IS data now, persisted under **`manningdefs`**. `manningthresh` is "still READ at boot… but never written again" | `leavewar/state/store.ts` (the `requirements` field comment) |
| 14 | `engine-rules.md`, **nine places**: `restoreDayVersion` is a ROLLBACK — the version becomes the live document immediately and stamps `SCHED.cur[di]` | **The function was REMOVED at Phase 2.** The live path is `loadVersionToWorkingCopy`, which deliberately does **NOT** touch `SCHED.cur`: the issued version viewers see is unchanged, and nothing reaches them until a new AL is published. The old prose said the opposite | `engine/restore.ts` (header), `engine/drafts.ts:loadVersionToWorkingCopy` |
| 15 | `engine-rules.md` ×3: a pending **mark** is what puts the day into the next AL | `dayHasChanges` reads straight through the canonical `dayDelta` — "the one authority for eligibility, the panel counts and the stored diff". The mark drives the pending tint and the edit log | `engine/publish.ts:dayDelta`, `dayHasChanges` |
| 16 | `data-schema.md`: `iid` is minted `'i' + n`, monotonic, counter seeded past the highest stored id at boot | It is the **opaque** `newId('i')` = `'i'` + base-36 timestamp + 6 random chars. `state/persist.ts` says so in place: *"no counter to seed past stored ids"* | `engine/newid.ts`, `engine/inputs.ts:inpId` |
| 17 | `feature-impact.md`: the week stash "is session-only on purpose… no localStorage" | `persistAll` writes every stash entry into the `weeks` collection; a built site brings every visited week back | `state/persist.ts:persistAll` |
| 18 | `feature-impact.md`: `schedFields` is an **eleven**-field list | **Fourteen** fields | `state/history.ts:schedFields` |
| 19 | `feature-impact.md`: "Everything else — INPUTS, publish state, the toggles, the bell, muted checks — is session-only. Say so." | Backwards since 8 Sep 26. Only undo/redo history, the edit log and the view-state registries (`LATEOFF`, `BELLLIT`, the armed slot, selection) are session-only. `WARNOFF` persists — it rides `histSnap`/`weekStashSnap` | CLAUDE.md §"WHAT ACTUALLY PERSISTS"; `state/persist.ts`, `state/history.ts` |
| 20 | `feature-impact.md`: "no persisted blobs means no stale-schema blobs" | Gone. Stash entries persist, which is exactly why `storage/reset.ts` carries `SCHEMA_VERSION` and clears `inputs`+`weeks` on an incompatible shape change | `storage/reset.ts` |
| 21 | `engine-rules.md` ×5: inputs / qual ticks / medical document blobs / `SCHED.drafts`+`curDraft`+the AL list / the planning stores are session-only | All five persist on a built site: `inputs/all`; `persistPeople()` on every Quals write; an IndexedDB drawer behind the doc cache since 8 Sep 26; `schedFields()` → `weekStashSnap()` → `weeks/<wk>`; `plan/all` | `state/persist.ts`, `state/docs.ts`, `state/history.ts`, `ui/QualsPage.tsx` |
| 22 | `engine/publish.ts` **code comment**: "Nothing here persists past the session — neither does the AL list itself" | False since 8 Sep 26. `SCHED.orig` and `SCHED.als` ride `schedFields()` into the week record. **Comment corrected in place** — no behaviour change | `engine/publish.ts` (above `daySnap`) |

### Checked and found CORRECT — no change made
- `data-schema.md`'s persistence table (corrected 17 Sep; re-verified against `storage/backend.ts`,
  `state/persist.ts`, `storage/reset.ts`, `state/docs.ts`).
- `performance.md`'s two enforced ceilings — `#sbBoard` ≤ **1150**, `#eWeek` ≤ **5450** — match
  `probes/perf-port.cjs` exactly.
- Spec §2.5: seven storage collections (`storage/backend.ts COLLECTIONS`); reset clears
  `['inputs','weeks']` (`storage/reset.ts RESET`); `persist.ts` carries four week invariants.
- Spec §2.3: `retractLwRow` really does run inside the `writeInputsBatch` reducer
  (`ui/inputedit.tsx:commitInputEdit`).
- Spec §3.5: ownership `personId` really does come from the ME binding (`state/auth.ts`).
- Spec §2.4's Tracker claims (no funnel; async `sSet`; `renCourse` label-only; `switchCourse`
  confirms; `applyHist`/`applyMarkHist` do save).
- `data-model.md` — it is the **designed target** schema for the database step, not a description of
  today's code, so its unresolved names are correct by construction. Nothing to sweep.

---

## C. Deliberately set aside (say so out loud)

1. **`file.ts:NNN` citations that have drifted by a line or two but still land inside the function
   they name.** Left alone: re-pointing them is churn that decays on the next edit, and they do not
   mislead. The ones that landed on unrelated code were repaired to symbol names instead.
2. **`docs/data-model.md`** — swept only for symbol existence, which it correctly fails. It is a
   to-be model; there is no code to check it against until the database step.
3. **Spec §4 / §6 / §7 / §8** — forward-looking (Steps 3/5). They describe nothing that exists yet,
   so there was nothing to verify them against. Not a pass; an absence of anything to check.
4. **The three remaining `restoreDayVersion` mentions further down `engine-rules.md`** that use the
   name as a *pattern* ("the `restoreDayVersion` direct-write shape/idiom"). Those are fine as a
   shape name and one dated note now says so; they were not individually rewritten.
5. **The tracker smoke gate failing three times running on the desktop** (noted in session-state,
   fails on clean code too). Unrelated to the docs; still unexplained; blocks nothing.
6. **Anything requiring a running app.** This sweep is static. The live-drive proof belongs to the
   follow-up #1 build (plan §5).

---

## D. What a cross-provider reviewer should be asked

Not "review these documents" — that repeats the failure mode. Ask exactly this:

> Here is a table of 22 claims. Each row names a document's assertion, my reading of the code, and
> the file to open. **Open the code and tell me which rows I got wrong**, and which claims in those
> same files I failed to check. Do not compare one document against another — that method already
> failed here on 17 Sep.

Both providers, on the table only (a page, not 7,000 lines).
