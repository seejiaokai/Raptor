# Security read, round 4: the fixes to round 3 (copy `D:/raptor-work/c169-read4`, `0e59ea5f3`)

**Scope.** BRIEF.md §3 item 3 first, then §3.1 for SEC-R3-1, SEC-R3-2 and Astra F1, then the rest of §3 where it reaches
who may write or see what. Read whole: `state/perms.ts` (the matrix, the command gate, `adminOwnerViolation`,
`ownershipViolation` / `ownershipChecks` and the member section, `sansBackEraseViolation`, the new D2560 note; the long
middle sections skimmed for any `settings`, `noticeseen` or SANS rule), `state/noticeseen.ts`, `leavewar/sansunfiled.ts`,
`storage/keyowner.ts`, the settings write hook in `state/people-settings-commit.ts`, `command/commit.ts` (the doors),
`state/notices.ts sansRetracted`; `docs/data-model.md` §11 (`Setting`, `Notice`, `NoticeSeen` rows). FIX.diff for every
file it touches; READS/round3-security.md and round3-astra.md for the concrete cases.

**Reach assumed (as round 3).** A person signed in, using the screens, any exported command door (`commit`,
`commitProjection`, `onCommit`, `onPipelineBegin`) or a command built by hand. Not `commitAs` (not exported from the
command index; with it every gate falls). The round-2 finding RR-SEC-1 was reached through the same `commitProjection`
door, so this read keeps it in scope.

**Tests.** In `D:/raptor-work/c169-read4/raptor-port/src/r4-sec/`, with `vitest.r4sec.config.ts` beside them (the Leave War
setup, jsdom, TZ Pacific/Midway). Run each file alone from `raptor-port/` (the PC's lock guard refuses a folder run):
`npx vitest run --config src/r4-sec/vitest.r4sec.config.ts src/r4-sec/<file>`
- `sec-r4-1.test.ts` — 6 tests: the CONTROL passes; HOLE (a)–(d) and the gate test FAIL (SEC-R4-1).
- `sec-r4-2.test.ts` — 3 tests: the CONTROL passes (an admin's own command cannot forge a "taken back" or an "again"); the
  gate test and the end-to-end test FAIL (SEC-R4-2 — older, not counted).
- `sec-r4-controls.test.ts` — 3 tests, all PASS (round 3's SEC-R3-1, SEC-R3-2 re-run; the old mark's row read by nothing).
- The builder's `src/leavewar/sansplan-sec156.test.ts` (11/11) and `src/leavewar/sans-reads-r3.test.tsx` (25/25) pass under
  the app's own config.

---

## §3 item 3 — the gate and the command layer, answered

- **`sansplan:` (now an unlisted settings name).** Nothing in `src` reads it any more (only two comments name it). A member's
  command carrying it is NOT refused by the gate's "an admin's record" line, because an unlisted name is no record of the
  settings store: inside any command it is written raw and never reaches the envelope; outside a command it is written raw
  too (`sec-r4-controls`, last test: Ranger's own `notices.seen` command and a bare write both land `sqn142_sansplan:…`).
  An admin, another squadron's admin, a hand-built command and a projection can all do the same. Harmless today: read by
  nothing, and `keyowner.ownerOf` answers null for it, so it has no home at the database step. Older and general (true of
  any unlisted name), not a finding.
- **The read record `noticeseen:<pid>`.** A member: only his own, only by `notices.seen` (holds). An admin: his own, or
  any man of a squadron he is admin of, in any command (already filed — [SANS-WORDS-LEFTOVERS] (2)). **The system actor:
  anyone's, in any command — the gate asks nothing of it.** Through `commitProjection` a 142 member, or 149's admin,
  rewrites or empties Hex's record and is saved (`ok: true`). Since D2560 that record is the one thing that decides
  whether his read reminder lights again, so this is **SEC-R4-1**, below. A restore or a Redo: `notices.seen` is never an
  Undo step, and with SEC-R4-1's fix no other step can hold another man's record.
- **`reminderDays` and a crafted id in a man's own record.** It cannot change what another man is told, and cannot throw:
  `readSeen` keeps only non-empty strings; `reminderOf` and `readOf` read only tokens whose base is `sansdue:<that man>`,
  and only from that man's own record; `reminderDays` keeps only a `YYYY-MM-DD` before any `.`. Control: Hex saves
  `sansdue:rocky~2026-07-18.1e300` and `sansdue:bane~2026-07-17,…,19` in his own record; Ranger is still told of a day new
  to him (`sec-r4-controls`, SEC-R3-1 re-run). A crafted record can only mislead the man's own bell, and an admin's
  take-back line to him (the writer `sansTakeBack` and the gate `sansBackCovered` read the same saved record, so they agree
  and nothing is refused).
- **`sansRetracted` and `SANS_UNDO_TOLD` — retract or revive another man's SANS line.** Through a person's own command: no.
  Hunter's (142 admin) ordinary command putting a "taken back" or an "again" naming Hex's untick line is refused, both
  (`sec-r4-2` CONTROL): `sansBackCovered` refuses `back`/`again`/`ref` on any forward line, and the follow-ups pass only in
  the verified restore of the same person's step. `SANS_UNDO_TOLD` is unchanged this round and stays the narrowest door
  (round 3's reading holds). `sansRetracted` is read only by the bell and `dueBase`, never by a gate, so its new "last word
  by time" rule widens no door. Through the projection door: yes — SEC-R4-2, older.
- **Is every exception the narrowest?** All but one: the system actor is let through `ownershipChecks` whole
  (`if (!a || a.role === 'system' || a.role === 'admin') return null`), and the noticeseen rule lives only in the member
  section and in `adminOwnerViolation`. Since nothing honest in the app writes a read record as the system actor (the
  only writer is `state/noticeseen.ts write`, as `me()`; the posting pass already refuses any `noticeseen:` change in
  `postingPassViolation`), the narrowest rule is "only its owner, whoever writes" — SEC-R4-1's fix.

---

### SEC-R4-1: the app's projection door rewrites another man's read record — the one thing his reminder now reads

- **Where:** `state/perms.ts ownershipChecks` (the early return for the system actor, and the `noticeseen:` rule kept only
  in the member section and `adminOwnerViolation`); reached by `command/commit.ts commitProjection` (public, the system
  actor, origin `projection`). Read by `leavewar/sansunfiled.ts sansUnfiledLines` (`seenOf` → `readOf` → `lit`).
- **The concrete case (msq world, Wed 15 Jul 26). Test: `src/r4-sec/sec-r4-1.test.ts`.**
  1. Saber puts Hex (`rocky`) on the programme on Sat 18 and posts him out as SANS from Fri 17. Hex taps "Mark all read".
  2. Saber puts Hex on Sun 19, a day new to him. CONTROL: on Hex's device his reminder is lit (D2560), passes.
  3. **HOLE (a):** Ranger (142 member) calls `commitProjection` with a body that enlists the settings store and sets
     `noticeseen:rocky = { upto: 0, ids: ['sansdue:rocky~2026-07-18,2026-07-19'] }`. Returns `ok: true`; the row is saved.
     Hex's reminder goes dark: he is never told he was put on Sun 19.
  4. **HOLE (b):** the same by Kestrel, 149's admin, on a 142 man.
  5. **HOLE (c):** before any planning, Ranger writes Sun 19 – Sun 26 as "read" into Hex's record; Saber then puts Hex on
     Sun 19 — never lit. Every later day can be pre-read the same way.
  6. **HOLE (d) — Astra F1's harm, by the new route:** Ranger writes `{ upto: 0, ids: [] }` into Hex's record. Hex's read
     reminder lights again with nothing planned for him (and every other line he had read comes back unread).
  7. At the gate: an envelope of the system actor, origin `projection`, putting `settings/noticeseen:rocky` passes
     `ownershipViolation` (null).
- **What goes wrong for him:** a SANS man is not told he was put on a new day with nothing filed (D2394 2a as D2560 keeps
  it), or is told of nothing new — by any member, or another squadron's admin, with no trace of who did it. The round's
  own words say this cannot happen: `sansunfiled.ts` "nothing anyone else writes can light his bell: his read record is
  his alone", `perms.ts` "which only he writes", data-model §11's `Setting` row "his own `NoticeSeen` row … which only he
  writes".
- **Cause:** the door itself is older (round 2's RR-SEC-1 used it for the planning mark). D2560 moved the reminder's one
  control from the planning mark — which the gate judged for the system actor — onto the read record, which the gate
  never judges for the system actor. The fix closed Astra F1's route and left the same harm one row over.
- **The fix (steps):**
  1. In `state/perms.ts ownershipChecks`, right after `const sansBackBad = …; if (sansBackBad) return sansBackBad` and
     before the `lwseen:` block (so it runs for every actor, the system actor and an admin included), add:
     ```ts
     /* A READ RECORD IS ITS OWNER'S ALONE, WHOEVER WRITES (round 4's security read, SEC-R4-1; §11 NoticeSeen): since his
        D2560 it alone decides whether a read SANS reminder lights again. The one writer is state/noticeseen.ts write — the
        person signed in, his own row, by his own `notices.seen` (a tap, "Mark all read", and forgetRead after his Undo
        post out); the app's own projection door and an admin's command of any type wrote anyone's. */
     for (const c of env.changes) {
       if (c.collection !== 'settings' || !String(c.id).startsWith('noticeseen:')) continue
       if (env.origin === 'remote' || env.origin === 'seed') continue
       const own = !!a && (a.role === 'admin' || a.role === 'member') && a.personId != null && String(c.id) === `noticeseen:${a.personId}`
       if (!own) return `another person's read record (${c.collection}/${c.id})`
     }
     ```
     (Keep the member section's `env.type === 'notices.seen'` rule as it is. Honest paths checked: a tap and "Mark all read"
     write `noticeseen:<me>`; `forgetRead` runs after an admin's Undo post out has landed, as his own `notices.seen` on his
     own row (`leavewar/sync.ts`); the posting pass never touches the row — `postingPassViolation` refuses it already.)
  2. This also closes [SANS-WORDS-LEFTOVERS] (2) (an admin rewriting his man's record in any command): the
     `noticeseen:` branch of `adminOwnerViolation`'s read-record check can then go (tidiness 1), or stay as a second net.
  3. Tests: `src/r4-sec/sec-r4-1.test.ts` all green (copy its cases onto the branch). Re-run the builder's
     `sansplan-sec156`, `sans-reads-156`, `sans-reads-r3`, `sans-words-156`, and every test that drives Undo post out
     (`retractPostingLines` → `forgetRead`) and "Mark all read", to show the honest paths still pass.
  4. Documents: data-model §11 `NoticeSeen` row — "written only by its owner, whatever the command and whoever runs it, the
     app's own projection included; another device's change and a seed are not asked"; drop the sentence calling the
     admin route older and filed; mark [SANS-WORDS-LEFTOVERS] (2) done.

---

### Older, not counted (marked "older")

- **SEC-R4-2 (older): the projection door puts any bell line on anyone's bell.** `sec-r4-2.test.ts`: after Saber unticks Hex
  ("You're no longer SANS."), Ranger's `commitProjection` (scheduler store enlisted) pushes a `sansback` line to Hex,
  `back: true`, `ref` = that line, `at` 9e15 — saved, `ok: true`; by `sansRetracted` (the last word by time) Hex's real
  line now reads as taken back for good, and a forged `ended` line would move his reminder's base (`dueBase`) under his
  read record and light it. The gate asks nothing of the system actor for notices either (`adminOwnerViolation` is the
  admin's; the member section the member's; `lineRewritten`, `warMade`/`WAR_OWED`, `lineNotNow` all sit inside them).
  Not worsened by this round: before round 3's fix any "taken back" naming a line already retracted it. The same door
  writes the other own-row records too — `seen:`, `apprseen:`, `lwseen:` (its block asks `a.role !== 'system'` and skips
  it), `reqseen:`. Not filed anywhere I could find ([SYSTEM-ACTOR-ONE-TEST] is a different matter). **Recommended filing**
  (for the security review before the database step, D1411): either judge the system actor's notice and own-row writes
  — a notice put only as one of the app's writers minted it in this command (`warMade`, `passMade`, `holMade`) and owed,
  and every own-row record its owner's — or stop exposing `commitProjection` from the public command index, as `commitAs`
  is not, with the reconcilers importing it from `command/commit` directly.
- **Unlisted settings names are written raw, unjudged, by anyone** (above, `sansplan:` the case in hand). Read by nothing;
  no home at the database step. Older.

### Questions (no concrete failure)

- **Q1.** Round 3's Q1 stands unchanged: `SANS_UNDO_TOLD` reads "the same person" as `personId ?? null` on both sides, so
  two person-less accounts compare equal. Still only reachable if one session held both.

---

## §3.1 — round 3's findings (my part)

| Round-3 finding | Verdict | Why |
|---|---|---|
| **SEC-R3-1** (a man's own read record froze the device's stamp clock) | **CLOSED** | The stamp, `nextStamp` and `LAST_STAMP` are gone; nothing takes a number from a read record (`reminderDays` keeps only the date before `.`). Re-run (`sec-r4-controls`): Hex saves `…~2026-07-18.1e300`; Saber ticks Ranger, plans him Sat 18, Ranger reads, Sun 19 newly planned → Ranger lit. |
| **SEC-R3-2** (the planner's session froze a man's day for good) | **CLOSED** | No mark to freeze: an `onCommit` subscriber on Saber's page writing `sansplan:rocky:2026-07-19 = 1e300` under his real planning changes nothing; Hex, after reading, is lit by Sun 19 newly planned (`sec-r4-controls`). |
| **Astra F1** (a member lit another man's read reminder through a forged cause) | **CLOSED ONLY IN PART** | The planning-mark route is gone: nothing reads `sansplan:`, and no gate trusts `causedBy` for it any more (builder's RR-SEC-1 tests and my controls pass). The same harm through the same door remains one row over: Ranger's `commitProjection` empties Hex's read record and his read reminder lights with nothing planned — `sec-r4-1.test.ts` HOLE (d), SEC-R4-1. |
| Astra F2, Opus O3-1, O3-2 | **Not judged here** | Not permission questions; nothing in their fixes widens a gate. `sansRetracted`'s new rule is read by no gate (above). |

---

## Tidiness note (D489 — filed, not fixed)

1. **Duplicated:** after SEC-R4-1's fix, "a read record is its owner's" would be said three times — the new block, the
   member section's `noticeseen:` case, and `adminOwnerViolation`'s read-record check (which covers `seen:`, `apprseen:`,
   `reqseen:` too). Worth one rule for all own-row read records, every actor.
2. **Comments that say more than the code does:** `sansunfiled.ts` ("nothing anyone else writes can light his bell: his
   read record is his alone"), the D2560 note in `perms.ts` ("which only he writes"), and data-model §11's `Setting` row
   ("which only he writes") are each untrue today (SEC-R4-1, and the filed admin route). Fix with SEC-R4-1, not before.
3. **A third reading of "taken back":** `SANS_UNDO_TOLD`'s put branch still counts `q.back === true && q.ref === ref`
   itself, beside `sansRetracted`'s new "last word" rule — no failing case (each Undo writes a new line id), but the two
   can drift.
4. **Left doing nothing:** `keyowner.ts` no longer lists `sansplan:`, so a leftover row answers `ownerOf` null — intended
   (read by nothing, D56), but nothing says so beside the list; one comment line would stop a later reader re-adding it.

**1 finding (SEC-R4-1), 1 older note with a recommended filing (SEC-R4-2), 1 question. Fix SEC-R4-1 first** — a member
reaches it, it silences or lights another man's SANS reminder, and it is the part of Astra F1 still open; one block in
`ownershipChecks`, which also closes the filed [SANS-WORDS-LEFTOVERS] (2).
