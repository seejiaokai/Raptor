# Round 4's fixes — builder's report (Fable, chat 169)

Status: READY FOR INDEPENDENT REVIEW. Both fixes built, one local commit `264a1f3d4` on
`claude/allavail-sans-postout-141`, not pushed. No message from the host arrived with the two held items, so neither
was done; `weeksHeld`'s key is as it was.

## Fix 1 — SEC-R4-1: only a man himself writes his own read record

**What changed and why.** `src/state/perms.ts ownershipChecks`: a new block right after the `sansBackEraseViolation`
check and before the `lwseen:` block, so before every role's early return. For any change to `settings/noticeseen:<pid>`
it refuses unless the actor is an admin or a member whose own person is that `<pid>`. A `remote` or `seed` origin is not
asked. This is the security report's fix step 1, as written. It closes the projection door (the system actor) and an
admin's command of any type on his man's row.

**Failed first** (before the fix, `src/leavewar/sans-seen-sec-r4.test.ts`, 8 of 11 red):
- HOLE (a): `the door refuses a write of another man's read record: expected true to be false`
- HOLE (b): saved row changed — `expected '{"upto":0,"ids":["sansdue:rocky~2026-…' to be '{"upto":0,…'`
- HOLE (c): `expected +0 to be 1`
- HOLE (d): `expected 1 to be +0`
- Astra's case (`review.test.tsx:169`, ported into the msq world, door named `notices.seen`): `expected true to be false`
- three gate cases (system actor by projection; system actor named `notices.seen`; an admin of the man's own squadron,
  at the gate and through `commitSettingsIntent`): each returned null / `ok` where a refusal is expected.
- Controls green before and after: the reminder lights for a day new to him; his own row by his own command passes (a
  member's and an admin's); `remote` and `seed` are not asked.

**The honest paths.** A tap, "Mark all read" and `forgetRead` after Undo post out all still pass — every suite that
drives them was re-run (list below), all green.

**The tidiness note — judged: the `noticeseen:` branch of `adminOwnerViolation` became a duplicate, and I removed it.**
After the new block, the only `noticeseen:` row that can reach `adminOwnerViolation` is the admin's own, which it always
passed. Nothing else depends on it. Every test still passes with one caveat, stated plainly: **two older assertions
matched the refusal's wording** and I changed the wording they match, not what they prove. Both writes are still refused;
the reason now reads "another person's read record" (the new, wider rule catches it first) where it read "another
squadron's man's read record":
- `src/leavewar/sansplan-sec156.test.ts` — "at the gate: Kestrel's command writing Hex's read record … is refused"
- `src/state/units-sqn-fixread2.test.ts` — "Hunter … may not write a bell line to 149's Osprey, nor mark his history or
  bell read" (I also added one line there: Hunter writing his OWN squadron's Ranger's read record is refused too).
These two failed in my first suite run, before I had touched `adminOwnerViolation` — so the wording change comes from the
new block itself, not from removing the branch. A reader should check I did not weaken either: the assertion is still
"refused, as a read record", only the adjective differs.

**Documents and comments corrected so "only he writes" is now true:**
- `docs/data-model.md` §11 `NoticeSeen` row: the sentence calling the admin route "older … filed, `[FABLE-READ-FAULTS] (u)`"
  replaced by the rule (owner only, whatever the command, the projection included; remote and seed not asked; the
  database-step consequence). §11 `Setting` row: "which only he writes" now names where it is held. §11's multi-squadron
  passage "An admin's bell lines and read records": `NoticeSeen` taken out of the admin's list, with a pointer.
- `src/state/perms.ts`: the D2560 note; the `adminOwnerViolation` header comment and its prefix line.
- `src/leavewar/sansunfiled.ts`: the "his read record is his alone" comment.
- `src/leavewar/sansplan-sec156.test.ts` header.
- `docs/file-map.md`: the two new test files and the two changed source files.

## Fix 2 — R4-O1: the next-week preview keys on the shared landing signature

**What changed and why.** `src/ui/peek.ts peekKey`: `deletedSig() | requestsSig() | loadedSrcSig()` replaced by
`landingSig()` from `engine/overlay.ts` (the same three plus each man's home squadron by date). The three imports nothing
else in the file used are dropped. The engine is not changed.

**Failed first** (`src/ui/peek-home-key.test.tsx`, 2 of 4 red):
- Opus's case: `expected 'v|13/07/2026|0||imrldi1s0wc9nra|||Jul…' not to be 'v|13/07/2026|0||…'` (the key did not move)
- Astra's case (`review.test.tsx:142`), with an Undo of the move added: `expected true to be false` (the kept drawing
  still held the meeting)
- Controls green before and after: the meeting shows before the move; with nothing changed the key and the drawing stand
  (no rebuild on an ordinary repaint).

Note for the readers: Astra's original asserted `expect(peekKey()).toBe(key)` after the move — a statement of the fault,
which is false once fixed, so it is not carried over; the rest of the case is.

## Commands run (from `raptor-port/`), with counts

| Command | Result |
|---|---|
| `npx vitest run src/leavewar/sans-seen-sec-r4.test.ts` (before fix) | FAIL — 8 failed, 3 passed |
| `npx vitest run src/ui/peek-home-key.test.tsx` (before fix) | FAIL — 2 failed, 2 passed |
| the same two files (after fix) | PASS — 15 / 15 |
| 94 test files under the checks lock (`gatelock.mjs exec`), first run | 2 failed (the two wording assertions above), 1709 passed, 2 expected fail |
| the same 94 files, final run after every edit | PASS — 94 files, 1711 passed, 2 expected fail (already marked so in the suite) |
| `npm run build` (the type check) | PASS |
| `npm run lint:changed` | PASS — "no new finding" |
| `npm run docsize` | PASS ("every record accounted for"); it notes HANDOFF.md and OUTSTANDING.md over their size by 376 together — files I did not touch, deferred by its own rule |
| `node reference/tfin.js` | NOT RUN — the engine did not change |
| full unit suite, browser tests | NOT RUN — per the brief (GitHub runs them on push) |

The 94 files: every test file under `src` naming `markNoticeRead`, `markAllNoticesRead`, `forgetRead`, `noticeseen`,
`notices.seen`, `unreadFor`, `Undo post out`, `peekKey`, `peekWeekHTML`, `landingSig` or `commitProjection` (80 files —
all of `src/leavewar/sans-*`, `sansplan-sec156`, the `postout-*` and `multi-sqn-fixread*` files, `m4bell`, `m4sec`,
`holnotice`, `src/state/perms.test.ts`, `msq-fix2-sec-readrec-plan`, `units-sqn-fixread2`, `people-settings-wire*`,
`src/ui/bellnotices*.test.tsx`, `src/ui/peek*.test.tsx`, `src/command/*`, `src/undo/timeline*`), plus the other SANS
re-read files, `sec147-read`, `multi-sqn-job2-sec5`, `peek-sans-date` and `src/engine/overlay*.test.ts`. The exact list
is the grep in `…/scratchpad/r4-suites.sh`; the run's output is `…/scratchpad/r4-suites2.txt`.

## Found, not fixed

1. **With nobody signed in, the app's own actor can no longer write a read record at all.** With no session the command
   door runs as the app's own actor, and the new rule refuses that actor. No test and no screen does this (the bell needs
   a sign-in), and all 94 files pass, but it is a behaviour the readers should confirm is wanted. At the Power Apps move
   (no sign-in screen of the app's own) the actor will come from the platform's identity, so the rule should hold as is.
2. **SEC-R4-2 (older, the security report's own filing) is untouched:** the same projection door still puts any bell line
   on anyone's bell and writes the other own-row records (`seen:`, `apprseen:`, `lwseen:`, `reqseen:`). Not in this brief.
3. **`[SANS-WORDS-LEFTOVERS] (2)` is now closed by this fix** (an admin rewriting his man's read record). I did not
   touch `OUTSTANDING.md` — the host marks it. The data-model row no longer cites `[FABLE-READ-FAULTS] (u)` for it.
4. A member's write of a read record under any command type other than `notices.seen` is refused as before, by the
   member section's "an admin's record" line; an admin's own row under another command type passes (as the security
   report's step 1 has it). Stated so a reader can judge whether an admin's own row should also need `notices.seen`.
5. The tidiness items 3 and 4 of the security report (a third reading of "taken back"; a comment beside `keyowner.ts`)
   are not done — filed by the report, not in this brief.

## Departures from the brief

- The two existing assertions whose expected wording I changed (above) — a consequence of fix 1, needed for a green run.
- The readers' test files were not copied word for word: the cases are ported into two new files on the repo's own
  fixture (`test-support/msq-world.ts`) and normal vitest config, with gate-level cases and controls added.
- Nothing else. No push; `HANDOFF.md`, `OUTSTANDING.md`, `DECISIONS*`, `.claude/` and the two modified pictures untouched.

Rulings: none this session (a build from a brief; no ruling was needed and none contradicted).
