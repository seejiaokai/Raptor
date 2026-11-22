# The reshape plan's red team, round 2 — Fable's report (blind; copy at `f70594194`)

Reader: Fable (D2238 — his word, under D903, for a big open-ended plan), a background helper of chat 125, blind to Astra
and the fresh Opus reader; brief `2026-11-20-multi-sqn-b1-reshape-read2-brief.md`; its own exported copy holding no
reader's report; finished whole. Read only; no proof tests run. The report as returned:

---

# Round 2 red team of the reshape plan — Fable (blind)

Read only: nothing in the copy was changed, no scratch file was written, no proof test was run. Every finding rests on reading the plan against the code. No pasted handoff block appeared, so there was none to ignore.

**Verdict:** Piece B's recommended cut (the reading rule) is the right one. It closes R2, R3, R4 (all four), R5 and K1 on paper. Its one addition, the re-link drop, is under-specified: it opens three faults (findings 1–3), which should be fixed in the plan before the build. Pieces A, C and D: I found nothing that leaves a family alive, only smaller gaps.

## Findings, most important first

**1. HIGH — Undo of a re-link either brings a dead right back or is refused (§4.3 "A re-link", "New" gate line, "the re-dating hooks stay as they are").**
- **Who does what:**
  - Ranger (142) holds View of 150 from 10 Jul.
  - His move to 149 counts from 16 Jul, so the right ends.
  - On 18 Jul Saber re-links Ranger's sign-in to Viper by mistake; the command drops the ended row.
  - Saber presses Undo.
- **Variant a, Undo at once:**
  - The restore puts the ended row back with its recorded day (`restoreRedated` → `grantBackHolds`, perms.ts l.1716–1720).
  - The plan's new gate line, "a re-link leaves no right of its account that holds nothing on that day", then sees exactly such a row beside a changed link.
  - As worded it refuses the master's honest Undo (D148). The plan's own test ("its Undo and Redo leave it ended for both men") expects the opposite.
- **Variant b, Ranger moves again on 19 Jul, Undo on 20 Jul:**
  - `relinkBackHolds` is false, so the link is re-dated to today (l.1734).
  - A right's start is "the later of `from` and `pidFrom`", so the restored row starts on 20 Jul and holds.
  - A right D2203 ended on 16 Jul is back with a 149 man. The backstop cannot see it, because after the command it holds.
- **Cause:** any re-dating of the link to today restarts every stored ended row. The plan handled the forward re-link and not the restore, which is itself a re-link.
- **Fix to the plan (§4.3):**
  - A grant row removed inside a command that changes its account's person is by construction an ended row.
  - Where a restore keeps the link's recorded day (`relinkBackHolds`), it puts those rows back with their recorded `from`, and the backstop exempts that verified replay only.
  - Where the restore re-dates the link to today, it does not put them back; the gate refuses a grant put beside a link dated today.
  - Tests: Undo at once; Undo after the old man moved again; Undo after the new man moved; Redo of each.

**2. MEDIUM — a plain admin's re-link passes the door and is refused by the gate (door and gate judging apart, made new by the plan).**
- **Who does what:** Ranger arrived in 149 with an ended View of 150. The row stays stored "until the account goes". Kestrel, 149's admin, re-links Ranger's sign-in.
- **What goes wrong:**
  - The door, `relinkRightsProblem` (accounts.ts l.336–345), is moved by the plan to "only rights that hold", so it passes.
  - The gate's G4 (perms.ts l.1852–1853) loops over every stored row of the account. The plan lists it as "unchanged", so it refuses: "a sign-in holding a right in another squadron re-linked by one who is not a master".
  - The drop itself is also refused by section 6's who-check (l.2029, "not an admin of 150"), because the move exemption is deleted and the person-delete one does not apply.
  - Kestrel sees "That did not save".
- **Plan's error:** "The master is an admin of every squadron, so the drop needs no exemption" assumes every re-link with rights is a master's. Under this cut that is false for ended rows.
- **Fix:**
  - G4 reads only rights holding today on the rows before (`grantOn`).
  - Section 6 lets pass the removal of a grant that holds nothing today on the rows before, where the same command changes that account's person; nothing else of the row may change.
  - Door-equals-gate test: plain admin, ended row in a third squadron.

**3. MEDIUM — "every caller hands the account whole" is not enforced; the gate builds its accounts by hand, without `pidFrom`.**
- **Sites, none carrying `pidFrom`:** perms.ts l.403, l.1302 (`levelInForce`), l.1947–1950 (section 6's actor); accounts.ts l.328, l.341, l.359.
- **Who does what:**
  - Sign-in "acus" holds Plan of 150 from 1 Jul.
  - Viper moved on 10 Jul.
  - On 12 Jul the master re-links acus to Viper; the right holds and follows the account, as built.
  - Screens that pass the whole account say Viper is 150's admin from 12 Jul.
  - The gate's hand-built account starts the right on 1 Jul, sees the 10 Jul move and answers none.
  - Every 150 save of Viper's is refused.
- **Fix:**
  - Make `pidFrom` a required key of `LevelAccount` (`string | undefined`), so the build lists every hand-built account.
  - Add these six sites to §4.3's reader list.
  - Add a row to the `grantOn` table: re-linked account, new man moved before the link, read through the gate.

**4. LOW-MEDIUM — the "He moves squadron tomorrow" refusal now blocks lowering a right and its Undo.**
- Under today's code the move deleted the rights, so nothing stood to lower. Under the new cut they stand until midnight.
- **Who does what:** Saber gave Ranger Plan of 150 in error at 09:00. Hunter saves Ranger's move at 10:00. Saber's Undo, or a change to View, is refused by the door (units.ts l.187) and the gate (l.1992). Only full removal works.
- **Fix:** the refusal applies to a put that gives or raises only. A put to a lower level, by door or restore, passes. Add both as tests.

**5. LOW-MEDIUM — A-v does not say which records get no stamp.**
- Today a step of inputs, people, accounts or requests names no squadron and is undoable anywhere (timeline.ts l.511–523).
- If "the schedule's records → `UNIT`" is read to include inputs, Ranger's leave input filed at 23:50 can never be undone after his midnight swap.
- **Fix, three sentences for A-v:**
  - Records that carry no squadron today stay unstamped.
  - A step waiting for good in a squadron he can no longer enter gives the greyed Undo its words.
  - Today's "a step touching two units is eligible in either" is kept, or its change is named.

**6. LOW — ended rows can never be removed.**
- `removeGrant` takes "the row holding today", so an ended row stays for ever.
- "A unit removed while still named" (l.1999) still counts it, so an Undo of "+ New squadron" can be blocked by a dead row nobody can clear. Today the squadron's admin could remove it.
- **Fix:** l.1999 counts only rows that hold or can hold again. Or `removeGrant` and the gate let an admin of the squadron remove an ended row.

**7. LOW — `changesIn` must be pinned to the resolved squadron.**
- It must not read row dates. Three cases depend on it:
  - `setHome` writes a baseline row dated today for a demo man with no row (units.ts l.239).
  - A same-day take-back leaves two 142 rows (R2's honest case).
  - A first placing is no move.
- Read as "any row's `from`", the rule would end every such man's rights on the save day.
- **Fix:** say it in §3.2 A-i and add the three rows to the `grantOn` table.

**8. LOW — `levelIn` and `levelOfAccount` still default to today (accounts.ts l.299, units.ts l.91).**
- They are not in A-i's "day becomes required" list. After Piece B a level depends on the day far more.
- No production caller is wrong today. Step 5's menu will be the first.
- **Fix:** add both to the contract step.

**9. LOW — order and split.**
- No owner is named for the probe "a Leave War window or Tracker chart has unsaved typing", which `enterSquadron` needs in phase 2. It lives in helper "war"'s files.
- In phase 3 the band's files are "named at build" while the core holds `leavewar/sync.ts` for A4. Name the probe's owner and file now.
- `enterSquadron(scheduleUnit)` at midnight does not say which unit a master's pick gets. Dormant until step 5; say "the pick stays for a master".

**10. LOW — what he is asked.**
- **Q4:** the example shows only viewing. The real consequence is that a moved Plan holder keeps full admin powers of the third squadron until midnight, and until the date for a transfer set months ahead. He should read that.
- **Q6:** the drawing should say what the "away" stretch does with leave already approved on days after the move. It stays stored in 142's war, hidden, and 149's war does not have it until the Transfer batch carries it. Not a fault of this plan, but it is something he will see.

## The Piece B choice
- **Sound.** Checked against each proof's text:
  - R2 honest: the take-back replaces the row and no change remains.
  - R2 forged: the bare removal needs 150's admin.
  - R3: Undo restores squadron rows only, with the copy's day-named reads.
  - R4 a–d: each right ends on the forged move's day, whatever its date.
  - R5 and K1: by the one check.
- **Timing is as the plan says.** `setHome` deletes the rights on save today (units.ts l.233–236); the rule ends them on the move day.
- **The bell.** On a move day `adminThen`'s grant half becomes always false: a right from before ends that day, and one given that day fails `from < iso`. That matches fix reads 7–12's outcomes. The master-mark half is untouched. I found no retired line returning, other than through finding 1.
- **Exemption deleted (Astra 1, Opus H2):** holds. With the l.2019–2029 exemption gone, nothing lets a move command touch a right.
- **What it breaks:** findings 1–4 and 6, and §4.5's six tests. I agree with those rewrites in principle but did not open them.

## Round 1 rows (§16)
- **Checked, and they hold:**
  - F8: the midnight wake calls notify at 00:00:01 and on show or focus (`installPostingClock`, sync.ts l.3481–3506).
  - F2 / Astra 2: the probes `lwUnitNow` and `trkUnitNow` exist; `inUnitView` is as described.
  - F12, F11 rules 4 and 5, F6 / M2: removed by construction.
  - Opus M6's caller lists: every no-day caller I could grep (22 files) sits in an owned file of §3.6.
- **Does not hold:** Opus L4, marked "taken another way" — see finding 2. Opus M6's "every reader of grant rows" misses the hand-built accounts — see finding 3.
- **Not checked in code:** F1/H1 (the war's `setPeople` and carry-over), F3 (the pass's gate chain line by line), F5 (the planning writer), F9 (the Tracker's load path), K4.

## Explicit negatives
- **Piece A:** the callers with no day are all in the plan's lists and the build will list them. `pageUnit`'s master and Plan rule matches D2132, D2197 and D2201 (full rows read). No second "which squadron" body found beyond §3.1's, except finding 8.
- **Piece C:** the dates (today, every later home and grant day) are enough under the reading rule. Demoting a Plan holder at home is covered by "admin role". No false refusal found beyond the ones §14 already tells him.
- **Seeds:** no seeded grants and one seeded home row per 149 man, so no demo right is ended by the rule at load.
- **Piece D:** nothing found. I did not verify the war store's internals, OIL across a move inside the war, or speed.
- **Held items** (K2, K3, A3, B7, C7, C10, B2): I found nothing in the reshape that makes one worse.
- **On screen:** nothing new beyond what §11 sends to a drawing, apart from finding 10's two wording points.
