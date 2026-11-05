# Fresh, blind Opus code read — "Undo post out" takes the posting's bell lines back; the SANS purple line (5 Nov 26)

Reader: a fresh Opus 5.5 that did not write the code and saw no other reader's report (D790, D1594). Read only: no source
changed. The change read: `git diff 248a13bf5^ 3a181dbd8 -- raptor-port/src`. Rulings opened in full: D1693, D1696, D1697,
D1698, D1699, D1216, D283, D287, D299, D350, D292, D1691. The evidence sheet and the scenario design read first.
Run here: `npx vitest run src/leavewar/postout-takeback.test.ts src/leavewar/ui/namepuck.test.tsx` — 19/19 green.
The D56 exclusion applied: nothing below lives only in stored demo data; each would happen again to new data.

## Summary

| # | Severity | New or older | One line |
|---|---|---|---|
| 1 | Medium | older code (the posting's stored line), not made by this change — but the same promise | A posting that has RUN and is then moved to a later date, or given another outcome, on the Post out sheet takes back everything it did except its bell line: admins keep "Posted out · now SANS" for a man who is no longer SANS |
| 2 | Low | new in this change (the residue of aeedfbd77's fix 12) | The admin who pressed Undo on an "off the manpower" posting he had read gets the same posting, set again by another admin, back already READ — his bell never lights — depending on whether he tapped some other line in between |
| 3 | Low | new in this change | The grid's name lost the word "SANS" for a screen reader: the tag was text inside the name's button, the purple line is drawn decoration only |
| 4 | Low | older class (no tab-to-tab sync anywhere) | Undo post out pressed in a tab opened before the posting ran leaves the posting's line standing, and judges "read" from a stale read record |

Observations that are not findings (no concrete in-app failure): O1 the `lw.postout` permission row now allows deleting
any notice row, with no content check for an admin's command (for the security read and the database step); O2 the
struck words are a `<s>` that most screen readers do not announce, so the line is heard as "Posted out · now SANS · taken
back · Saber" — the words still end "taken back", so it is not wrong.

---

## Finding 1 — Medium — a ran posting changed on its sheet keeps its "Posted out" line

**Setup.** Seed as the scenarios (Saber ad/a, Hex an admin). Ranger posted out as SANS for Mon 16 Nov. The clock past 16
Nov; the pass runs: Ranger is SANS, both admins' bells get "Ranger · Mon 16 Nov / Posted out · now SANS". Hex taps it.

**Action.** Tue 17 Nov, Saber opens Ranger's Post out sheet and moves the date to Mon 23 Nov (SANS kept) — or keeps the
date and changes the outcome chip to none ("off the manpower"), or (Overseas Sqn posting) moves its date forward.

**Expected** (D1693's promise — every line goes with what made it being taken back; D1546 "nobody is ever gone silently",
the other way round: nobody shown gone who is not; D1696 already moves the derived line with its date). The 16 Nov line
says something the posting no longer did: it should be taken back exactly as Undo post out would take it back (unread
lines go; a read one becomes "~~Posted out · now SANS~~ · taken back · Saber").

**What happens.** `postOut` (`src/leavewar/sync.ts` ~2775–2785) computes `keep = { sans: due && outcome === 'sans' … }`;
the new date is not due, so `takeBack` lifts the SANS tick (`body.sanBy === 'po'` → `san = false`) and `setPostOut` clears
`poDone` (store.ts ~1975, `same` false). But `takeBack` is called with `undo = false`, so `postingLinesOf` /
`retractPostingLines` never run: Hex's and Saber's "Posted out · now SANS" stays, the man is not SANS, his Admin → Users
row reads "posting out 23 Nov · SANS", and a tap on the line opens a row that contradicts it. On 23 Nov the pass runs again
and writes a second "Mon 23 Nov / Posted out · now SANS". With the outcome changed to none instead, the stale "now SANS"
line stands beside a new derived "off the manpower" line. With an Overseas Sqn posting moved forward, the archive is lifted
and the account enabled (`keep.archive/suspend` false) while the bells still say "archived, account suspended".

**Disproved by:** after the move, Hex's bell holding no plain "Posted out · now SANS · Mon 16 Nov" line.

**New or older.** Older: `git show 248a13bf5^:raptor-port/src/leavewar/sync.ts` has the same `postOut`/`takeBack` and the
same stored line; this change did not make it reachable. It is reported because the brief asks for every path that changes
a posting, and because this build is the one that gives Undo its retraction — the move-after-run is the same act (the
posting's run taken back) by another door. The walk's S13/S14 moved the date or the outcome only as a step before Undo.

**Fix — put to him first** (it widens how D1693 reads: "Undo of its change" → also a change that un-does the run; the look
is already approved, D1699, so no new mock-up; D1625 is met by picture 8):
1. In `postOut` (sync.ts), before calling `takeBack`, read the stored record: `const rec = getState().postOuts[id]`;
   `const ran = !!rec && !!rec.to && rec.poDone === addDays(rec.to, 1) && outcomeOf(rec) !== 'none'`;
   `const stillRuns = due && from === addDays(rec.to!, 1) && outcome === outcomeOf(rec)`.
2. Pass a fourth argument to `takeBack` when `ran && !stillRuns` — a narrower mode than `undo`, e.g. `'run'`, in which
   `postingLinesOf` returns the STORED lines only (the derived line already follows the date — D1696). Keep `undo = true`
   for the sheet's Undo unchanged.
3. Red first, in `src/leavewar/postout-takeback.test.ts`: SANS posted for PO, `reach(); runPoOutcomes(); hexReads()`;
   `postOut('bane', '2026-07-25', 'sans')`; expect `poLines('rocky')` empty and one struck line for Hex; then reach the
   25th, run the pass, expect one fresh unread "Posted out · now SANS · Sat 25 Jul". A second case: outcome changed
   SANS → none on the same date; expect the stored line taken back and the derived "off the manpower" line unread.
4. Update `docs/notifications-register.md` (the posting line's row) with the reading he gives.

## Finding 2 — Low — the presser's re-set "off the manpower" line comes back already read

**Setup.** An "off the manpower" posting (no outcome) for a man with no sign-in, dated PO; the clock past PO. Saber (the
presser to be) taps the line in his bell — his read record now holds `po:<id>:<PO>`.

**Action.** Saber presses Undo post out (his line goes; he is rightly told nothing — D1693). Without tapping any other bell
line, Saber signs out; Hex signs in and sets the same posting again for the same date (or Saber does, on another admin's
word). Saber signs in.

**Expected.** A posting set again is news to every admin (D1546; the stored outcomes come back with a fresh id, unread, to
every admin including Saber). Saber's bell lights.

**What happens.** `postedLines` (sync.ts ~1427) suffixes the derived id only by the number of `poback` lines addressed to
THAT admin. The presser never gets one, so his id is the plain `po:<id>:<PO>` again — still in his read record — and the
line shows read; his bell does not light. Had he tapped any other line between the Undo and the re-set, `markNoticeRead`
(noticeseen.ts 89–90) would have pruned the dead id and the line would come back unread: the result depends on an
unrelated tap. (Hex, who was told it was taken back, is handled — fix 12.)

**New or older.** New: the id suffix is this change's (aeedfbd77); before it the id was steady for everyone, and every
admin who had read it got the re-set back read.

**Fix.**
1. In `src/state/noticeseen.ts` add `forgetGone(): boolean` — for `me()`, rewrite his own row through the existing
   `write()` (`notices.seen`, his own row — the gate already allows it) with `ids` filtered to those still in
   `allNoticesFor(pid)`; return false (no write) when nothing would drop.
2. In sync.ts, after an undo-mode `takeBack` or undo-mode `restoreBody` has committed with `lines.length > 0`, run it as its
   own command once the posting command has landed: `if (!cmdDeferEffect(forgetGone)) forgetGone()` (the pattern the pass
   uses for `tellOnce`). It is never an Undo step (`notices.seen` is in `NOT_STEPS`).
3. Red first: the setup above in `postout-takeback.test.ts` — Saber reads (`markAllNoticesRead` as Saber), Saber undoes,
   `postOut(id, PO, false)` again, expect `isUnread(line, 'stiff')` true.
   (The per-admin `poback` suffix can stay: it still covers an admin who was told while signed out.)

## Finding 3 — Low — "SANS" is no longer said to a screen reader on the grid

**Setup.** A man posted out as SANS, shown in his old place (D283), or any SANS man with "+ SANS" on.

**Action.** VoiceOver (his iPhone) or a desktop screen reader moves onto his name button on the Leave War grid.

**Expected.** The same fact the eye gets — he is SANS. The design guide: a colour is never the only signal; a screen reader
is told in words.

**What happens.** Before, `<span className="po-sans-tag">SANS</span>` sat inside the name's button (Matrix.tsx ~4049,
MatrixRows.tsx ~181 at 248a13bf5^), so the button was read "Ranger … SANS". Now the only sign is `.puck.san::after`
(04-pucks-sections.css 9–14), drawn decoration with no text; `NamePuck.tsx` adds no words. The name is read "Ranger G".

**New or older.** New (the tag's removal). For the SANS-group men (D1698) it was never said; the posted-out man lost it.

**Fix.** In `NamePuck.tsx`, when `san`, add a visually hidden word inside the puck after the name:
`{san && <span className="sr-only"> SANS</span>}` (use the app's existing visually-hidden class if it has one — search
`sr-only`/`vh` in `src/ui/scheduler/`; otherwise add one to `04-pucks-sections.css`: clip, 1px, absolute). It takes no
width, so his drawing and the drawing check are untouched. Pin in `ui/namepuck.test.tsx`: the button's text content holds
"SANS" for both kinds, and not for an Overseas Sqn man.

## Finding 4 — Low — Undo in a stale second tab

**Setup.** Tab B opened before the clock passes PO. In tab A the posting runs (lines written) and Hex reads his line.

**Action.** In tab B (never reloaded), Saber opens the sheet and presses Undo post out.

**What happens.** `postingLinesOf` reads tab B's in-memory `NOTICES`, which lacks the lines tab A wrote, and `hasRead`
reads tab B's `SEEN`, loaded at boot. The posting is cleared, the lines are not: after a reload Hex's bell still says
"Posted out · now SANS" for a posting that was undone, and no struck line. (The writes are row by row, so nothing tab A
saved is overwritten — S17 walked that half.)

**New or older.** The class is older — the app has no tab-to-tab sync (no `storage` listener or BroadcastChannel in
`src/`), and every stored write reads its own tab's memory. This change adds one more reader of possibly stale memory.

**Fix.** Not in this branch: it belongs to the database step (D356 (C): others' changes arrive by themselves), where the
posting command's read of the lines and the read records is done against the shared store. File it as a line under the
database step's item for live sync, naming `postingLinesOf` and `hasRead` as readers that must see the shared store.

---

## The roll-call this reader built, and what was checked

### Every writer, reader and door of a posting's bell line
| Place | What it should do | Checked |
|---|---|---|
| The pass (`runPoOutcomes`, sync.ts ~2340–2410) | writes one stored `po` line an admin, the man left out, inside its own command | Unchanged; the gate's pass rule (`postingPassViolation`) still refuses anything but a new `po` line — a `poback` from the pass is refused (it is in `WAR_LINE_KINDS`). Nothing found. |
| A posting dated today, run inside the admin's own `lw.postout` (the pass joining as a child) | as the pass | The child's `resyncSchedBaseline` runs after the parent's enlist only in a new order when the PARENT is an undo-mode `takeBack` and ANOTHER man's posting is due-but-unrun at that moment; the parent's before-image is taken at its enlist (`schedStore.capture`) and is not moved by the child, so the change set stays the command's own. Nothing found (not run — a narrow timing case; a test would set two postings, reach the date without a notify, then Undo one). |
| `postedLines` (derived "off the manpower") | moves with the date, goes with an undone posting, goes when he is archived or deleted by hand (D1696) | Archive by hand sets the outcome to Overseas Sqn (`closeStintOnArchive`), deletion sets `deleted` — both drop the line. The new `:n` suffix: Finding 2. |
| The sheet's Undo — `undoPostOut` → `takeBack(…, true)` | takes the lines back | Lines read before the write (the derived line still exists); retracted only after `write()` succeeded, so a refused write (`setPostOut` refuses for a deleted man, a locked man, the member view) writes no lines; a commit the gate refuses rolls the scheduler store back with the rest. Nothing found. |
| The sheet's Undo on the posting's own archive — `restoreArchivedPerson` → `restoreBody(undo)` | the same | Retracts; `setPostOut`'s answer is ignored there, as before the change — a refusal would still lift the archive and now also take the lines back; no reachable refusal found (Undo is refused first for a deleted man, an Admin → Users archive, a taken callsign). Nothing found. |
| `restoreArchivedAs` (rename + restore) | Admin → Users only, always with a post-in date | Its one caller (UsersPanel 357) passes a post-in date, so it is never undo mode. Nothing found. |
| Admin → Users Restore (`postIn`) | lines stay (not an undo) | `lines = []` when `postIn` is given. Pinned by a test. Nothing found. |
| The Post out sheet's date and outcome chips (`postOut`) | — | Finding 1. |
| Archive / delete by hand on Admin → Users | stored lines stay as the record; the derived goes | As above. Nothing found. |
| An earlier stint's line (`postingLinesOf`' floor) | kept | `floor` = the day after the latest closed stint's last day = that stint's line day, and `n.day > floor` excludes it; a stint closed by Archive by hand keeps its ran posting's `to`, so the same holds. Nothing found. |
| The top bar's Undo / Redo | no posting step (D350) | `lw.postout` is in `NOT_UNDONE_TYPES` (undo/timeline.ts 453), so the notice rows it now carries are never replayed; the new rows have fresh ids, so no other step's conflict check meets them. Nothing found. |
| `warNoticesReversed` (the war's own taken-back lines) | ignores posting lines | `isWarNotice` is `lw`/`lwopen`/`lwback` only. Nothing found. |
| A second tab | — | Finding 4. |

### Every reader of `poback`
| Reader | Checked |
|---|---|
| `noticeLive` | `po` and `poback` both `mayEditSched()` — the member view (D292) hides both and they come back as left. Nothing found. |
| `postOf` → `openNotice` | the tap opens Admin → Users at his row; a deleted man opens nothing (D1691). Nothing found. |
| `noticeWords` | name by his callsign of today, the day, `struck` = the `po` part's own words (one body), `what` "taken back", `who` the presser. Every `PoOutcome`: "now SANS", "archived, account suspended" / "archived", "off the manpower"; "deleted" is unreachable (Undo refused once a Delete has run). Nothing found. |
| `BellList` (desktop, phone, the board's bell — one list) | `<s>` then " · " then "taken back · Saber"; `.bl-what` wraps (`overflow-wrap:anywhere`). O2 above. |
| `unreadFor`, `markAllNoticesRead`, `markNoticeRead` | treat `poback` as any line. Nothing found. |
| The gate's member rule (`WAR_LINE_KINDS`) | a member's command carrying a `poback` is refused (pinned by a test). The pass's rule refuses one too. Nothing found. |
| An admin's command | not checked by content (the gate returns early for an admin) — O1. |

### The war's own taken-back lines' words (D1699)
Every `LwDid` checked through `backWords` → `partWords`: approved, added, refused, repend, putback, deleted, biddel,
retyped (with `w`), moved / bidmoved (with `to`/`tb` now carried by `warNoticesReversed`), open / close (the `lwopen`
words). An "again" line taken back reads without "again" (the designer's note). A tap on a taken-back move goes to the
leave's first place (`p.a`), which is right: the move was undone. Nothing found.

### The SANS purple line (D1697, D1698, D283)
| Case | Checked |
|---|---|
| Posted out as SANS, before the date, "+ SANS" off and on | `p.to !== null && outcomeOf(p) === 'sans'` — the line from when it is set (as the tag did). Nothing found. |
| After the date, "+ SANS" off (old place, window laid) | same term holds. Nothing found. |
| After the date, "+ SANS" on (SANS group, no window — `windowFor`) | `p.san` set by the pass. Nothing found. |
| A SANS-group man | `p.san`. Nothing found. |
| Overseas Sqn | no line unless already SANS. Nothing found. |
| Ground crew posted out as SANS, after the date | the walk's Q1 — already filed with him; not repeated. |
| Archived / deleted man shown in his months | the same term as the old tag's, so no change in who wears it. Nothing found. |
| The phone's frozen copy | the same `NamePuck`. Nothing found. |
| The row's memo | `PersonRow` is a plain `memo`; a posting or SANS change gives a new `p`. Nothing found. |
| The OIL tracker, Balances, Approvals, the day panel | their own drawers — the walk's Q2 for the schedule's puck before the date; nothing new. |
| The removed tag's selectors | no test, e2e or script outside the walk's own checks still looks for `.po-sans-tag` / `sans-tag-`. Nothing found. |
| A screen reader | Finding 3. |

### The command's change set
`resyncSchedBaseline` before the scheduler store's enlist, only when there are lines; `schedApplyEnd` only on the success
path; an early return after the enlist leaves the baseline equal to memory, so the next command starts clean;
`tellPass` sees no input change in this command. `perms.ts` gives `lw.postout` Notice C and D; `lw.postout` is an admin's
door only (`setPostOut` refuses a non-admin). Nothing found beyond O1.
