# Fix read 14's fixes — the builder's brief (multi-squadron batch 1; written 20 Nov 26, chat 119)

Fix read 14 read fix read 13's fixes (`b9f1d5b6b..aa96a9a0f`) with four blind readers. Reports beside this file:
`…-fixread14-{astra,opus,fable,security}.md` (Astra stopped by its service again — three findings saved from its progress
messages; the fresh Opus reader and Fable found nothing). The host reproduced four faults, each red, in
`…-fixread14-proofs.test.ts.txt` — copy it to `raptor-port/src/leavewar/multi-sqn-fixread14.test.ts` first (it runs as is:
7 tests, 5 red, 2 green controls) and make it green. Red first on `aa8bf0f10`'s code. One commit per item, each message
giving fault, readers, cause, fix, test, any older test changed (the shape of fix read 13's commits). Rulings: D2228,
D2223, D2225, D2218, D350, D290/D297, D148, D1693/D1699; the "not a finding" list of `…-fixread14-brief.md` stands.

## A — SEC14-1 (security reader): a member's edit then Undo saves a mark memory put on his own leave
- **Proof:** "SEC14-1 … lw" (red). Ranger files his own LL 27 Jul (saved, no `lw`); outside every command `x.lw = 'y2026'`;
  an edit that removes it and changes his remark is accepted (a member may drop `lw`); Undo saves `lw: 'y2026'` — "approved
  on the war" on his own leave. `lateOff` is held already (the green control beside it).
- **Cause:** `state/perms.ts` `storedRowViolation` (b) carries the saved row as the before-image only for a removal
  (fix read 13 item A); a put keeps memory's image, the Undo step records it, and the timeline's verified replay vouches
  for it (`inputBreach` returns at `if (replayed || !f) return null`).
- **Fix (the reader's, step by step):** (1) for a put whose memory before-image differs from the saved row, carry the
  saved row as the before-image once every check has passed, keeping only memory's landing-only fields (the week's `acc`
  mark) so the history line shows no landing change — or refuse such a put outright (no write through the app leaves
  memory differing from the saved row except the landing marks); choose by which keeps every honest door green.
  (2) The proof green, with `lwMoved` added beside `lw`. (3) Re-run item A's tests, fix reads 11 and 12's D tests,
  `p6*`, and every test file that wires a saved copy.

## B — Astra A1: a moved filer told of a change whose every entry is the other squadron's (D2223 / D2228)
- **Proof:** "Astra A1" (red). Hunter files Ranger's LL on 23 Jul; Hunter 149's admin from 16 Jul; Ranger 149's from
  25 Jul; on 17 Jul Saber changes it to Casper on 27 Jul. Ranger on the 23rd and Casper on the 27th are both 142's, yet
  Hunter is told through 149.
- **Cause:** `state/notices.ts` `filerUnits` (fix read 13 item C) crosses every named man with every day of the input
  (before and after merged), so Ranger-on-the-27th — a pair no entry ever had — counts.
- **Fix:** read each image's own pairs: the before image's man on the before image's days, the after image's man on the
  after image's days (and each named man of a several-man input on that image's days only). The commit gate asks the same
  body (`toldBy`, `filerMarkOk`) — change it in the one place. Keep item C's six tests green.

## C — Astra A2: the drag window's Approve with new words leaves the filer of a war-approved leave untold
- **Proof:** "Astra A2" (red). Hunter's war-approved LL for Ranger on 27 Jul and a pending bid on 28 Jul; Saber selects
  both, types words and presses Approve (`SelectSheet.tsx` `decide`: `inOneWarCommand('lw.decide', () => { keepWords();
  setBidStates(…) })`, keepWords nesting `lw.reqmeta`): the words land on the 27th's leave, Hunter is told nothing.
  Without the Approve (fix read 13 item D (2)) he is told.
- **Cause (to confirm):** `noticePass`'s remark-only branch for a war-approved leave inside a war command (fix read 13
  item D (2)) does not fire when the same command also decides bids.
- **Fix:** the leave's filer is told of new words on a war-approved leave whatever else the war command does — once, not
  when he typed them, through `filerVia`'s squadrons. Item D (2)'s three tests stay green.

## D — Astra A3: a people edit clears a deleted man's archive mark — he is back on Quals
- **Proof:** "Astra A3" ×2 (red: Hunter, and Saber the master): `deletePerson('casper')`, then
  `commitPeopleEdit(() => { delete casper.archived; delete casper.archivedBy })` is accepted; Quals lists every man not
  archived (`ui/QualsPage.tsx`), so he is back. His delete mark and date stay.
- **Cause:** `perms.ts` `deletedPersonViolation` (fix read 13 item D (1)) holds only `deleted` and `deletedFrom`.
- **Fix:** a row deleted before a command keeps `archived` as well (and whatever else marks him off the roster — read the
  delete's own writes in `state/person-delete.ts`); Fable's P1 control (an ordinary Quals edit of the deleted man saves
  and keeps the mark) and item D (1)'s tests stay green. data-model.md §11 (the Person row) updated.

## After the fixes
The whole unit suite under the checks lock, `npm run build`, `node reference/tfin.js`, `npm run rulecheck`,
`npm run docsize`; then fix read 15 of these commits by four blind readers (as fix read 14 — its brief and copy script are
the pattern; Astra on the shared brief unchanged, skill notes 980 and 984). The bell walk owed (`[MSQ-FIXREAD10-LEFT]` (5)) is still
owed. Pull request 806 does not merge before a fix read comes back clear.
