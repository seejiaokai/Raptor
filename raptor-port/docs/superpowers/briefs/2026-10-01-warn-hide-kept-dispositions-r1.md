# [WARN-HIDE-KEPT] — the plan's red team, round 1: dispositions (1 Oct 26)

Both reviewers read plan v1 (commit 03946015) independently, blind to each other: **Astra — REVISE** (5 findings: 2 HIGH,
2 MEDIUM, 1 LOW; `2026-10-01-warn-hide-kept-redteam-astra.md`) and **Fable — REVISE** (8: 1 HIGH, 4 MEDIUM, 3 LOW;
`2026-10-01-warn-hide-kept-redteam-fable.md`). Both judged the design right (one key; the bundle "as shown" with the raw
one kept as the detector; the hide state frozen into the version; the hide its own pending axis) and both walked every
mark site and found each flag can be tied to its warning. Every finding is ACCEPTED; plan v2 carries them (§ named).

**No second round, said so.** Each finding came with exact fix steps and none changes the design's shape; the owner's cap
on plan rounds (about three) is a ceiling, not a quota. The defence from here is the build's red-first tests, the walk,
and BOTH reviewers' read of the final code with the evidence sheet (bug-check order §5).

| # | Finding | Disposition | Plan v2 |
|---|---|---|---|
| Fable F1 = Astra 4 (HIGH) | The hide axis reaches `dayDelta` but not `dayPendingItems`: the four fall and Publish lights while the day's count, the To go out list and the Amendments panel read 0; `alIssue` stores `units: 0`; the load's confirm counts 0 | ACCEPT. `hideDelta` is wired into BOTH authorities, as `warnDelta` is (`dayDelta` and `dayPendingItemsIn`), `PendItem.axis` gains `'hide'`, `pendItemWords` and its sort weight, `itemCounts` / `diffCounts` gain `hide` (still counted under "changes" — no new word on the panel), `dayDiscardCount` and the load's "already at" short-circuit count a hide difference. Tests against every authority, and back to zero on the unhide (D98) | §3.4 |
| Astra 2 (HIGH) + Fable F2 (MEDIUM) | The cross-week marks (Sunday's "Breaks Monday", the 7-day run's forward dotted mark) have no warning in the loaded week: v1's replay rule would drop them the moment anything on the week is hidden (Fable), and they could never follow next Monday's own hide (Astra; D475 says a hidden crew-rest warning drops the mark on the day before) | ACCEPT BOTH. Every trace records its target warning's key. A cross-week trace is kept unless THAT key is among next Monday's effective hides — read from the next week's saved copy: its working hides when that Monday is a draft, its current issued version's when it is published (D471). A target that cannot be resolved keeps the mark. v1's limit (§10) is withdrawn | §3.2 |
| Fable F3 (MEDIUM) | `hideDelta`'s set is too wide (a stale hide of a warning the working copy no longer raises pends falsely, and the AL records a change that changed nothing); its address is an index (the four fall when the list re-sorts or a man is renamed) | ACCEPT both halves. The set: warnings of today's judgement of the issued day that the WORKING copy also raises (by key). The address: `hide:<di>.<fingerprint of the key>`, `from` / `to` the plain `shown` / `hidden`; the words are looked up for the list, never part of the signed key. Tests: `pendingKey` unchanged across a live warning inserted above and a rename | §3.4 |
| Fable F4 (MEDIUM) | `faceWarn` returns the RAW official bundle when no published day stores `w`, and copies raw slices for draft days — View-only Sched would show a hidden warning flagged and counted | ACCEPT. The face is built on `shownOf(OFFICIAL, working keys)`; a published day is then overlaid under its issued keys. The memo's invariant (every toggle re-validates) is written beside it | §3.4 |
| Astra 3 (MEDIUM) | Bundle identity as a world marker (`html.ts:666` `WARN===officialWarn()`, `dayWarnHTML:1047`) | ACCEPT THE RISK, FIX BY CONSTRUCTION. With F4 the face IS a memoised shown bundle, so under `withOfficialWarn` `WARN` is the very object `officialWarn()` returns, and with nothing published and nothing diverging the shown working bundle and the shown official one are one object (the memo is per raw bundle). Fable checked the same two sites and found them sound on that basis. No new "world" variable. Astra's two tests are added: the ALL AVAIL chip's official-world mark with an active hide; a hide alone draws no "new once signed" / "goes away once signed" row | §3.3, §8 |
| Fable F5 (MEDIUM) | Four mark sites choose their code AFTER the mark (DNIF_FLY / LEAVE_FLY / INPUT_FLY); the DT chip's warning is `DT_SUM`; the TT chip at one site is `TURN`. A mis-coded mark loses its flag only when something ELSE is hidden — the demo weeks may never show it | ACCEPT. The four sites hoist `dn` / `lv` above the marks; the codes as Astra's table lists them, site by site; the "every mark has its warning" test runs over fixtures that raise every code through every loop, and the replay test FORCES the replay path with an empty hidden set (Astra: the identity fast path proves nothing) | §3.2, §8 |
| Astra 1 (MEDIUM) | The next-week preview keeps the red time box of a nought-minute line whose warning is hidden (v1 left it, §10) | ACCEPT (Fable judged the limit sound; the ruling is "no flag for that item", and the same reader as Astra 2 makes it cheap). The warning's words come from one engine helper shared by the validator and the preview; the preview reads the target day's effective hides. v1's limit is withdrawn | §5 row 7, §10 |
| Fable F6 (LOW) | The renderers must read `w.off`, never `warnShown` / the working set, or the issued face is struck by the working copy before the amendment | ACCEPT. `html.ts`, `board.ts` and the ⓘ panel read `off` only | §3.6 |
| Fable F7 (LOW) | `shownOf` must copy, never mutate; the stored `w.sev/chip/dash` stay raw — or a hide is also "Warnings on this day changed" | ACCEPT — pinned by tests (`warnDelta` is `[]` after a hide on a published day; the raw warning carries no `off`) | §8 |
| Astra 5 (LOW) + Fable F8.6 | The history line has no data path: `schedWriteValue` drops the command's meta, `changelines.ts` has no `sched.mutes` branch, the Undo history's day collection ignores it, `describe.ts` says "muting a warning" both ways | ACCEPT. The command carries `meta {key, words, hidden, di}`; the line is written from it under "The day"; Undo / Redo lines too; the words are "hiding a warning" / "flagging a warning again" | §3.5 |
| Fable F8.1 | `w.face` is the shown slice of OFFICIAL, not of `WARN` | ACCEPT | §3.4 |
| Fable F8.2 | The load must set the day's hides BEFORE `afterSchedMutate()` so the backstop saves them; its "already at" short-circuit must count a hide difference | ACCEPT | §3.4 |
| Fable F8.3 | The red time box under a parked-plan preview stays as today | ACCEPT | §5 row 7 |
| Fable F8.4 | `WARN.all` carries the `off` copies; Insights and the drop toast count through `shownWarns` | ACCEPT | §3.3 |
| Fable F8.5 | The all-hidden branches of the board panel and the ⓘ popup key on the raw list's length | ACCEPT | §3.6 |
| Fable F8.7 | The pending row carries the warning's slot key, so a tap goes to the line (D99) | ACCEPT | §3.4 |
| Fable F8.8 | `schema.ts WarnSlice` gains `wo`, `shown`, `face.warns[].off` (D473) | ACCEPT | §8 step 5 |
| Fable F8.9 | The + Wave menu's own "N hidden · Manage" is another feature — untouched; `latepub.test.tsx` 756 / 840 are rewritten with this one | ACCEPT | §8 step 3 |
| Fable F8.10 | Stale keys stay in the day's row, inert by design — say so in `data-schema.md` | ACCEPT | §8 step 5 |

**Where the two differed, settled by evidence:** the cross-week marks (Fable: always keep; Astra: follow the next week's
hides) — both taken, Astra's rule with Fable's as its fallback; the preview's red box (Fable: sound; Astra: a flag for the
hidden item) — Astra's, by D469's own words; the identity checks (Astra: a new marker; Fable: sound once the face is a
shown bundle) — Fable's construction with Astra's tests.

**Explicit negatives both gave, relied on:** every ordinary mark's man is named by the warning beside it; the deduplicated
`add` cannot orphan a mark; replaying the marks in write order rebuilds the maps exactly; the key's new shape breaks no
writer or reader of `wo` (all read the leading day); Undo follows the day's `sched.mutes` record and refuses by its
revision (D148); print and CSV read no warning (D471's printed half already holds); no ruling is contradicted.
