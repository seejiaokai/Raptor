# BLOCKS C AND D — retraction, editing, publishing, amending

Part of the OIL hand pass, 21 Sep 26. The app was DRIVEN — the real built site at
`localhost:4173`, admin login, the everything-Saturday (Sat 18 Jul 26) with a flying wave, an SC
wave with a spare, an exempt AVALON line and its desk, a duty desk with times and one without, a
zero-length desk, two sims, ground rows, a Common Programme with ALL AVAIL and a named row, and
three personal requests. Every claim below was read off the screen, and the money was read on the
Leave War grid and in the OIL tracker, not only on the schedule.

Pictures: `docs/img/handpass/2026-09-21-oil/`, all named `CD-…`. 109 of them.
Scripts that drove it: `scripts/handpass/cd-*.mjs`.

Two things to know before reading the table, because they colour several rows:

- **The day's own words.** "1 pending" is the chip beside the version; "Publish AL1" is the
  amendment button; "Unpublish" pulls an issued day back to a working copy.
- **The family day sweeps up anyone who is free.** FAMILY DAY 10:00–14:00 is ALL AVAIL, so a man
  with nothing else on earns half a day from it. That is why taking work off a man often leaves him
  on half a day rather than nothing — it is the family day paying, not the work.

---

## The table

| id | what it checks | what happened | verdict | picture |
|---|---|---|---|---|
| **C1** | the member edits his own request after the day went out | Re-timing his Training from 09:00–12:00 to 08:00–16:00 kept the scheduler's "earns nothing" mark on him, showed the new hours on the working copy only, and moved no money until the amendment went out. But when the request was handed to **another man**, that man arrived already marked "earns nothing" and lost half a day he was already owed. | **FINDING 2** (the handover); the rest PASS | `CD-C1-04-after-member-edit`, `CD-C1-12-new-holder-in-mode`, `CD-C1-13-war-new-holder` |
| **C2** | a request taken off the programme then restored; a row cancelled then un-cancelled; a row turned info-only then back | Taking Gambit's Meeting off the programme moved his puck out of the MEETING row and into the family day — he keeps half a day, from the family day, which is right. Putting it back brought his "allowed" mark back with no second tap. Cancelling OCU REVIEW dropped Saber from a full day to half (FO → HO on the war) and the cancelled row stopped offering a switch; un-cancelling put him back to a full day. Turning the row info-only did the same and the ⓘ button said "Info only — tap to check this item against the rules again". | **PASS** | `CD-C2-05-removed-mode-detail`, `CD-C2-11-cancelled`, `CD-C2-09-row-info-only` |
| **C3** | a row reordered, its man swapped, deleted and re-made, under a decision | Dragging OCU REVIEW from the top of the Ground Programme to the bottom carried its "earns nothing" mark with it; no other row picked it up. A second man dropped onto that same row arrived **earning**, as he should — the mark belongs to the man, not the row. Deleting the sim row and pressing Undo brought the row back with its switch still off. Deleting it for real, publishing, then building the same row again by hand gave a **fresh** row that earns. | **PASS** (one leg not driven — see note 4) | `CD-C3-08-after-reorder`, `CD-C3-13-new-man-on-denied-row`, `CD-C3-05-after-undo-delete`, `CD-C3-06-new-row-fresh` |
| **C4** | a man posted out after the day went out | Posting Piston out from 18 Jul — the very day he worked — is offered on his day cell ("Post out from 2026-07-18 · Off the manpower from that day on. Past schedules keep their pucks."). His **ledger keeps the day in lieu**, but his Saturday cell on the grid stops reading FO and reads PO instead. | **FINDING 3** (a display question, not lost money) | `CD-C4-11-post-out-sheet`, `CD-C4-12-war-after-post-out`, `CD-C4-13-tracker-after-post-out` |
| **D1** | unpublish and republish under the same label | Unpublish is two taps and the second one warns: "its OIL credits are bid against on the Leave War; republish to restore them". During the gap the day reads DRAFT and the SDO's full day **disappears from the war at once**. Taking him off the desk and publishing again reissued the day as **ORIG — no amendment number** — and he earns nothing. | **PASS** | `CD-D1-01-unpublish-pressed`, `CD-D1-02-unpublished`, `CD-D1-03-republished` |
| **D2** | previewing an issued version, and loading it back onto the working copy | The versions list offers "Original" and "AL1", both marked "read-only — look, don't change". Inside a preview, OIL Earn, Templates and Sort all are greyed out and the fields cannot be typed in; the Original still shows the man's **full** bar although the amendment took it away. "← Back to live copy" always works. "Load onto working copy" is **two taps when there is unpublished work**: the button becomes "Discard 1 edit & load — confirm" and its tooltip names what will be lost. After the load the decisions are the loaded version's, and **Undo puts the discarded work back exactly**. The war never moved off the issued figures throughout. | **PASS** | `CD-D2-08-preview-original`, `CD-D2-23-discard-confirm`, `CD-D2-24-after-load`, `CD-D2-25-after-undo` |
| **D3** | a saved plan brought out while another plan holds decisions | "+ Alt Plan" makes Plan B and puts it live; the old copy becomes Plan A. A denial made on Plan B is gone on Plan A and back again on Plan B — the decisions belong to the plan. Nothing reached the war until the live plan was published; then the man's full day went. | **PASS** (one wrinkle — note 5) | `CD-D3-02-ridge-denied-on-alt`, `CD-D3-04-ridge-on-live-plan`, `CD-D3-05-war-after-plan-publish` |
| **D4** | reload, leave the week and come back | A plain browser reload makes a published Saturday claim **"1 pending"** and offer **"Publish AL1"**, although nobody touched it. Leaving the week and coming back keeps it. The same reload on a published **Wednesday** (an ordinary weekday, no OIL) is clean. If the scheduler believes it and signs off, the day really does go out as **AL1 with nothing in it**. | **FINDING 1** | `CD-D4-01-just-published`, `CD-D4-02-after-reload`, `CD-D4-07-day2-after-reload`, `CD-D4-09-phantom-published` |
| **D5** | a request filed on a day that is already published | Filing Training 08:00–17:00 for Ace on the published Saturday lands it on the **working** programme only: the View-only page's Saturday card does not mention him, the scheduler's week card does, and the reader's card says "Original — as issued / Working draft — not issued · 2 pending". His bar shows at once on the scheduler's board. The war still pays him only the family-day half day. After the amendment he is on the issued card and the war reads a **full day**. | **PASS** | `CD-D5-06-issued-card-before`, `CD-D5-07-working-card-before`, `CD-D5-08-issued-card-after`, `CD-D5-04-war-after-al` |
| **D6** | a desk with no times at publish, plus an undecided leave bid on the same day | The unpublished day's warning list carries the hard line "SXO and OPS DESK have no times — nobody on them earns OIL for this day" and the reminder to publish. Publishing says **both facts in one message**: "Saturday 18 Jul: the SXO and OPS DESK desks have no start and end times, so nobody on them earns OIL · Fable's LL bid on 18 Jul now sits on published work — the day is flagged, the bid is still live". The war cell then reads **FO with the amber flag**, the bid untouched. Giving the SXO desk real times narrows the warning to the OPS DESK alone, and after the amendment the man on it earns half a day. | **PASS** | `CD-D6-01-warning-list`, `CD-D6-08-publish-message`, `CD-D6-04-war-after-publish`, `CD-D6-06-after-times` |
| **H6** | Saturday and Sunday each owning their own amendment number | Both days published as ORIG, both SDOs earning a full day. A denial on each. Saturday published **AL1**; Sunday still offered **AL1**, not AL2, and published it. Undoing Sunday's publish put Sunday back to ORIG with its change pending **and gave the Sunday man his full day back**, while Saturday stayed AL1 and its man stayed unpaid. Redo reissued Sunday AL1 once, with no AL2 and no duplicate. | **PASS** | `CD-H6-02-sunday-still-al1`, `CD-H6-03-both-al1`, `CD-H6-04-sunday-after-undo` |

---

## FINDINGS

### 1. After a reload, a published weekend claims a change nobody made — and will issue a real amendment for it

**What I did.** Built the Saturday, signed the four roles, pressed Publish day. The day read
`ORIG · Unpublish` with no pending chip. Then I reloaded the browser and opened the same day.

**What happened.** The day read **`ORIG · 1 pending · Publish AL1 · Unpublish`**. Tapping the chip
opens the changes panel, which says "Sat · 1 change" and "1 day with changes to publish". No row on
the day is marked, the edit history says "No changes yet", and the money is untouched. Leaving the
week and coming back does not clear it. The same reload on a published **Wednesday** — an ordinary
weekday where nothing earns OIL — is completely clean, twice over, so this belongs to the day that
earns.

Believing it costs something real: I signed the four roles again and pressed the button it offered.
**The day went out as AL1** — a numbered amendment, freshly signed, containing nothing. No money
moved. After that the phantom does not come back; the next reload reads `AL1` with no pending chip.

**What should have happened.** A published day nobody has touched should read `ORIG` with no
pending chip and no amendment offered, before and after a reload. That is what the Wednesday does.

**How bad.** Serious for a real squadron, though no money is wrong. Every scheduler who reloads the
page after publishing a weekend is told his day has an unpublished change, and the only way to make
the message go away is to issue an amendment the squadron will read as a real one — a second signed
document, with nothing in it, against a day that was correct. It also hides a genuine change: once
the chip always says "1 pending", nobody can tell the difference between nothing and something.

**Worth checking next:** whether the same thing happens on `main` (this branch is the OIL work, and
the one thing that separates the Saturday from the Wednesday is that the Saturday earns).

---

### 2. A personal request handed to another man carries the old man's "earns nothing" mark — and costs the new man a day he is owed

**What I did.** On the published Saturday, Talisman's Training 09:00–12:00 was earning him half a
day. In OIL Earn I tapped him off ("Talisman earns nothing from this event") and issued it; his
Saturday cell on the war went blank, correctly. Then I opened his request and changed only the
**person** on it — first to Jester, then, in a second run from the same starting point, to Ace, who
has a row on the Leave War so the money can be read.

**What happened.** The moment the request became Ace's, his puck in OIL Earn read **"Ace earns
nothing from this event — tap to put him back on it"**. Nobody had ever made a decision about Ace.
Before the handover his Saturday was worth **half a day** (the family day). After the amendment went
out his Saturday cell was **blank** — he worked 08:00–16:00 on a Saturday and was paid nothing,
while Talisman, now free, went back to half a day. The same mark comes back if the request is handed
back to the original man, even after the admin has explicitly put the interim holder back on.

**What should have happened.** A decision is made about a man, so changing the person on a request
should hand the new man a clean slate — he earns by default, exactly as he would if the request had
been filed for him in the first place. Both scenario lists say this in as many words.

**How bad.** This is the most serious thing in these two blocks: it is real money, it is silent, and
it is reached by the most ordinary correction there is — a request filed for the wrong man and
fixed. Nothing on the schedule says why he is not being paid; the only place it shows is inside OIL
Earn, on one puck, if somebody thinks to look.

---

### 3. Posting a man out after the day was published takes his earned day off the grid, though his ledger keeps it

**What I did.** With the Saturday published and Piston paid a full day for the SC shift, I opened
his Saturday cell on the Leave War and used its own PO control. The sheet offers "Post out from
2026-07-18" and says "Off the manpower from that day on. Past schedules keep their pucks."

**What happened.** His Saturday cell stopped reading `FO` and read **`PO`**. The OIL tracker still
lists the `+1` of 18 Jul against his name, so the day in lieu was not destroyed — but the grid,
which is where anyone looks first, now shows nothing earned on the day he worked.

**What should have happened.** This is a judgement call for the owner, not a clear defect. Posting a
man out is supposed to move no money, and it does not. The question is whether the last day he
actually worked should keep showing what he earned, with the posted-out marker beside it rather
than instead of it.

**How bad.** Low. The money is safe; the reading is misleading on exactly one day per posted-out
man — the day he left.

---

## Notes and limits

4. **One leg of C3 was not driven: swapping a man by taking him off a row.** The board has no cross
   on a seated puck — a man comes off a ground row by dragging his puck away, and I could not make
   that drag land reliably from a script. What I could drive — **adding** a second man to a row that
   already carries a denial on someone else — gave the answer the scenario was really after: the new
   man arrives earning, and the denial stays with the man it was made about. The removal route
   should be tried by hand.

5. **The pending chip does not tell the plans apart (D3).** With a denial on Plan B and none on Plan
   A, both plans' heads read "1 pending" — one of them is the phantom from finding 1 and the other
   is the real difference, and the chip looks identical. Worth re-reading once finding 1 is fixed.

6. **A published day loses its four signatures.** Every publish clears the sign-off strip, so the
   next amendment needs all four signing again. That is almost certainly deliberate; recording it
   because every scenario here had to re-sign and it would be easy to mistake for a fault.

7. **The reader's page has an issued/working switch.** The View-only Saturday card carries "Original
   — as issued / Working draft — not issued", which is how D5 could be proved from the reader's own
   page rather than inferred.

8. **Some people have no row on the Leave War grid** (Jester was one), so nothing they earn can be
   read there. Outside these two blocks, but it cost a scenario a re-run and someone should say
   whether it is intended.

9. **No browser errors** were raised during any of these runs.
