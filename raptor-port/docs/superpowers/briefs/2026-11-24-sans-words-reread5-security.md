# Security read, round 5: rounds 4 and 5's fixes (copy `D:/raptor-work/c169-read5`, `82a7c78a2`)

**Scope.** BRIEF.md §3 item 3 first, then §3.1 for SEC-R4-1, then the rest of §3 where it reaches who may write or see
what. Read whole: `state/perms.ts` (the matrix row for `NoticeSeen`, `notices.seen` in COMMAND_OPS, `ownershipViolation` /
`ownershipChecks` with the new block, `adminOwnerViolation`'s read-record check, the member section's `settings` case,
`postingPassViolation`'s settings rows); `state/noticeseen.ts`; the settings write hook in `state/people-settings-commit.ts`;
`command/commit.ts`, `command/actor.ts`, `command/index.ts` (the doors and origins); `engine/hooks.ts` (`storedKey`,
`store.keys`); `storage/keyowner.ts`, `storage/tables.ts`; the callers of `forgetRead` in `leavewar/sync.ts`
(`restoreBody`, `takeBack`); `ui/topstate.ts openNotice`; `state/store.ts resetSession` and the elog door;
`docs/data-model.md` §11 (`Setting`, `Notice`, `NoticeSeen` rows and the multi-squadron passage). FIX.diff for every file it
touches; FIXES-CLAIMED.md; READS/round4-security.md for SEC-R4-1's cases.

**Reach assumed (as rounds 3–4).** A person signed in, using the screens, any door the public command index exports
(`commit`, `commitProjection`, `onCommit`, `onPipelineBegin`) or a command built by hand. Not `commitAs` (not exported from
the index), and not `setMe` / `setSession` (they change who the page thinks is signed in — with them every own-row rule in
the app falls, not only this one; outside the reach, as "the browser mirrors" in perms.ts's header says).

**Tests.** `D:/raptor-work/c169-read5/raptor-port/src/r5-sec/`, config `vitest.r5sec.config.ts` beside them (the Leave War
setup, jsdom, TZ Pacific/Midway). From `raptor-port/`:
`npx vitest run --config src/r5-sec/vitest.r5sec.config.ts src/r5-sec/sec-r5-gate.test.ts` — **11 tests, all pass**:
6 door cases (each a refusal that holds), 3 honest-path controls, and 2 cases that pin the two FILED bare-write routes as
still open (they assert the write lands — see "Filed" below; they are evidence, not findings).
Also re-run under the app's own config, all green: `leavewar/sans-seen-sec-r4`, `sansplan-sec156`, `postout-notice`,
`multi-sqn-job2-retract`, `sans-reads-r3` (77/77); `state/units-sqn-fixread2`, `state/bell`, `state/perms` (139/139).

---

## Findings

**None.**

---

## §3 item 3 — the permission gate, answered

**The rule as built** (`ownershipChecks`, after `sansBackEraseViolation`, before every role's early return): any change to
`settings/noticeseen:<x>` is refused unless the actor is an admin or a member whose own person is `<x>`; origin `remote` and
`seed` are not asked. The member section still requires the type `notices.seen` for a member's own row.

| Door | Result | Evidence |
|---|---|---|
| The projection door (`commitProjection`, the app's own actor), put or delete, any type name, `notices.seen` included | **Refused** | builder's `sans-seen-sec-r4` HOLE (a)–(d) and Astra's case; mine: the delete case |
| An admin's command of any type on another man's row — his own squadron's (Hunter, Saber) or another's (Kestrel) | **Refused** | mine: Kestrel, Hunter, Saber each by `notices.seen`, `accounts.save`, `settings.rules` through the real `commit` — none lands, Hex still lit |
| A member's hand-built command through `commit`, named `notices.seen`, `meta.owner` Hex | **Refused** | mine: Ranger — the row unchanged, Hex still lit |
| A restore (an Undo or a Redo, origin `restore`) carrying another man's row, by an admin or a member | **Refused** | mine, at the gate (put and delete). No honest step carries one: `notices.seen` is never an Undo step (`undo/timeline.ts NOT_STEPS`), and no other command writes the row |
| The projection door raised INSIDE a person's own read command (it joins his envelope) | **Refused, his own change rolled back with it** | mine: Ranger's `notices.seen` on his own row + a joined projection on Hex's |
| A projection queued from a subscriber during delivery (phase 9) | **Refused** (it runs as the app's own actor, judged like any other) | mine |
| The posting pass | Never writes the row; its settings rows are accounts, requests, `reqseen:` and grants only (`postingPassViolation`) — so the new block, which now runs before that check, cannot stop an honest pass | read |
| A unit-qualified alias, `u142@noticeseen:rocky` | Not matched by the block (it asks `startsWith('noticeseen:')`), but **read by nothing**: `noticeSeenLoad` lists `sqn142_noticeseen:` and `store.get('noticeseen:<pid>')` never qualifies a community name; `keyowner.ownerOf` answers null for it and `tables.ts` files it as a plain `Setting`. The same class as round 4's "unlisted settings names are written raw" — **older, general, not counted** | read |

**The honest paths — all still pass:**
- **A tap and "Mark all read"** — `state/noticeseen.ts write` → `commitSettingsIntent('notices.seen', { owner: me() })` →
  `commit` as the person signed in, his own row. Mine: Hex taps, then marks all read after a new day — both saved.
- **`forgetRead` after Undo post out** — called only AFTER the posting command has landed, at idle, as the signed-in
  person's own `notices.seen` on his own row (`leavewar/sync.ts restoreBody`, `takeBack`: "the command LANDED"). Never
  inside a reducer, so it never joins an admin's or the app's envelope. Mine: Hex's `forgetRead` drops his own id;
  `postout-notice`, `multi-sqn-job2-retract` green.
- **Sign-in boot** — `noticeSeenLoad` only reads; `resetSession` sets the person from the account (`null` for an account
  with no person, so the block's `personId != null` refuses rather than falls back). Nothing at boot writes the row.
- **Another device's change, the seed** — not asked. No production code raises origin `remote` or `seed` (only
  `commitAs`'s two callers exist, both origin `projection` or `restore`), and no seed writes a read record.
- **An admin's own row** — passes, by any command type (see the question below).

**Anything newly open?** No. The block only adds refusals; the `noticeseen:` branch the builder removed from
`adminOwnerViolation` can now only see the admin's own row, which it always passed. The two older assertions whose wording
changed still assert a refusal ("another person's read record" for "another squadron's man's read record"), and
`units-sqn-fixread2` gained one more refusal (Hunter on his own squadron's Ranger). No honest writer is refused: the only
writers of the row are the three above, all own-row, all at idle.

### Filed, not counted (brief §2) — confirmed still open, for the record

Both routes are writes the gate never sees, filed before this round; my last two tests pin that they still land:
- **A subscriber's bare `store.set` during delivery** (`onCommit`): the settings hook writes raw while `isCommitting()`
  (phase `post`), no envelope carries it. Ranger's subscriber writes Hex's record with Sun 19 "read" — Hex's reminder,
  lit, goes dark.
- **A start-of-command hook's bare write** (`onPipelineBegin`): it runs before the whole-world guard's snapshot, so the
  write is outside the command's change and saved. Same harm.

These are the remaining way to do SEC-R4-1's harm. They are the filed item ("a store write during a command's delivery or
a start-of-command hook saved unjudged"), so they are not counted — but when that item is built, the `noticeseen:` key is
the one to test first, because since D2560 it alone decides whether a SANS reminder lights again. One line for its
backlog entry: refuse a raw write of `noticeseen:` (and the other own-row read records) unless the running command has
enlisted the settings store and is in its reducer.

### Question (no concrete failure)

- **Q1 — an admin's own row by any command type.** §11's `NoticeSeen` row says "by his own `notices.seen`"; the code holds
  that for a member (the member section) but lets an admin write his own row inside any command. No honest path does,
  and the row is his own, so nobody else is harmed. If one ever did, his read record would ride that command's Undo step
  (an Undo would "unread" his bell). Either say so in §11 ("an admin's own row in any of his commands") or add
  `env.type === 'notices.seen'` to the block's `own` test for both roles. Recommend the latter — it makes the rule one
  sentence for everyone. Not a finding.

---

## §3.1 — round 4's findings (my part)

| Round-4 finding | Verdict | Why |
|---|---|---|
| **SEC-R4-1** (the projection door rewrote another man's read record) | **CLOSED** | Every door the gate sees is held: the projection door (put and delete, any type name), an admin's command of any type on his man's row, a member's hand-built `notices.seen`, a restore, a joined child, a queued projection. Round 4's HOLE (a)–(d) and Astra's case are green in the builder's `sans-seen-sec-r4`; my 6 door cases green. The bare-write routes that remain (above) were filed before this round and are not the projection door. |
| R4-O1 (next-week preview kept a moved man's request) | Not a permission matter | `peekKey` now carries `landingSig()` (the homes included). It decides when a picture is redrawn, not who may see it: 142's preview showing a man moved to 149 was a stale drawing of what 142's people could already see. Left to the other readers. |
| Astra's round-4 F1 (a change of week re-read every held week) | Not a permission matter | The held weeks' key is now `deletedSig()|UNIT`; it is a cache on the man's own device and widens nothing. Left to the other readers. |

**§3 item 2 where it reaches who sees what.** `daySansSeats` names men by their own seats; the reminder is still worked out
for the man himself only and put on his own bell; an admin's device reads it only to build the take-back line the gate
already checks (`sansBackCovered`, against his read record as saved). Reading a saved week of the squadron in view on his
device shows him only his own days. Nothing in round 5 changes who is shown what.

---

## R1 and R2 (judged as readings — neither touches a permission)

- **R1 — a flying seat or sim box with no times typed counts.** Follows D2564's words: he is "in a flying seat or a sim"
  whether or not the times are typed, and the checks list such a line too. The armed seat not asking until times exist
  is a difference he may not expect, but not against his words.
- **R2 — a cancelled line or box never counts.** Follows the words' sense (a cancelled sortie or sim is not one he is
  planned on), and it matches the checks for a cancelled flight. The crew-list strike on a cancelled line is the one place
  that differs; worth putting to him with the case: "Saber arms a seat on Thursday's cancelled jet; Hex (SANS, nothing
  filed) is struck on the crew list, but his reminder does not name Thursday — should either change?" A question, not a
  finding.

---

## Tidiness note (D489 — filed, not fixed)

1. **Said twice, slightly differently:** "a read record is its owner's" now lives in the new block (any type for an admin)
   and in the member section (`notices.seen` only). One rule, asked once in the block with the type, would let the member
   section's `noticeseen:` case go (Q1).
2. **A comment that still says more than the code does:** `leavewar/sansunfiled.ts` — "nothing anyone else writes can
   light his bell: his read record is his alone, whoever runs the command". True of every command; untrue of a bare write
   during delivery or from a start-of-command hook (filed). Add "inside a command" or name the filed item, so a later
   reader does not take it as proven.
3. **The block matches the stored key's spelling, not its meaning:** `startsWith('noticeseen:')` misses
   `u142@noticeseen:<pid>`; harmless while nothing reads that spelling, but `localOf(String(c.id)).startsWith(...)` — the
   test the settings write hook already uses — would close it for good at no cost.
4. **Round 4's note 3 stands** (a third reading of "taken back" in `SANS_UNDO_TOLD`'s put branch beside `sansRetracted`) —
   untouched this round, no failing case.

---

**0 findings.** SEC-R4-1 is CLOSED at every door the gate sees. Nothing to fix first from this read; when the filed
delivery-phase / start-of-command write item is built, test the read record first (it is now the one key whose forgery
silences or lights a SANS reminder), and consider Q1 (one rule, with the type, for both roles) and tidiness 3 in the same
change.
