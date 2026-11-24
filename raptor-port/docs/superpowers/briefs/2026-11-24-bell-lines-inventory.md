# The bell — every line it can show (inventory, read from the code 24 Nov 26)

Read-only inventory. Source of truth: `raptor-port/src/state/notices.ts` (words), `raptor-port/src/ui/topbits.tsx` (the list's
drawing), `raptor-port/src/ui/topstate.ts` (the bell's tap and the tap on a line), `raptor-port/src/leavewar/sync.ts` and
`raptor-port/src/leavewar/state/store.ts` (who is told, when). Line numbers are as of commit 5a17cbb9a.

## 0. How one line is drawn (`ui/topbits.tsx:109-121`)

```
[dot] **<name>** <day>                                     <age>
      [~~<struck>~~ · ]<what>[ · <who>]
```

- `<name>` bold (`b.bl-name`), `<day>` italic beside it (`i.bl-day`), on the first row.
- Second row (`span.bl-what`): for a taken-back line, the original words struck through (`<s>`), then ` · `; then `what`;
  then ` · <who>` only if someone is named.
- `<age>` at the right (`noticeAge`, `notices.ts:1041-1049`).
- Unread lines get class `unread` (the dot). The list is newest first, max 30 lines (a live holiday line is never cut).

Date shapes used in the slots (`notices.ts`):
- `noticeDay` (911-916): `Wed 15 Jul` — no year, ever.
- `noticeRun` (919-924): `Fri 17 Jul`; same month `Mon 20 – Tue 21 Jul`; across months `Fri 31 Jul – Sat 1 Aug`.
- `stretchWords` (985-988, bidding lines only): `1 Apr – 30 Jun` / `1 Apr` — no weekday.
- `lwCode` (930-935, D1525): `LL`, `*LL` → `LL (AM)`, `LL*` → `LL (PM)`.
- `names` (926): one or two callsigns joined by `, ` (`Ranger, Pike`); three or more → `3 people`. A placeholder reads by
  its roster callsign (`ALL AVAIL`, `ALL`).
- `cs` (925): today's callsign, or the raw id if the person is not on the roster.

## 1. The bell's own fixed words

| Where | Exact words | File:line | Note |
|---|---|---|---|
| Bell button aria-label and hover title | `Notifications` | topbits.tsx:138 | no visible text |
| List aria-label | `Notifications` | topbits.tsx:105 | no visible heading on the list |
| Empty list | `Nothing new` | topbits.tsx:108 | |
| Foot, lines below the view | `↓ 3 more` (`↓ {n} more`) | topbits.tsx:126 | not pressable; only while lines are below |
| Foot button | `Mark all read` | topbits.tsx:127-128 | only while any of his lines is unread |
| Ages | `now` · `2 min` · `1 h` · `yesterday` · `2 d` | notices.ts:1043-1048 | `<n> h` also covers a line from yesterday that is under 12 hours old |
| Taken-back form | `~~<original words>~~ · taken back · Saber` | topbits.tsx:118, notices.ts:980-981, 994-1002 | D1699 |
| Squadron badge ("which squadron a line is from") | — none — | — | Ruled D2202, NOT BUILT (register line 26 says so too) |
| Header / title | — none — | — | |

Passing notes the bell's tap raises instead of opening the list (`ui/topstate.ts bellTap`, 51-86; `openNotice`, 88-129):

| Exact words | File:line | When |
|---|---|---|
| `2 waiting for access — opening Admin → Users` (`{n} waiting for access — opening Admin → Users`) | topstate.ts:54 | an access request waits (admin); "1 waiting for access" for one |
| `1 new bug report` / `3 new bug reports` | topstate.ts:59 | an unseen bug report |
| `Weekend/PH work — confirm your OIL` | topstate.ts:76 | his own input has an unanswered OIL question (the B11 path: the bell lights and the tap opens the question — there is NO line in the list for it) |
| `Notifications cleared` | topstate.ts:83 | **dead** — only reached when a page-alert is set by `markBell`, and nothing in the app calls `markBell` (state/view.ts:916) |
| `That input is gone` | topstate.ts:125 | a tap on an input's line whose input no longer exists (e.g. a "Deleted" line) |

A posting line for a deleted man opens nothing and says nothing (topstate.ts:108, D1691).

## 2. Input lines (B1–B9, P11) — `noticePass`, notices.ts:471-584; words `partWords` 936-955 and `noticeWords` 1032-1037

Bold lead = the input's label when it changed: its title, else its kind code (`engine/inputs.ts inpLabel`, 894-900;
an Attach reads `Attach · 145 Sqn`). Day = its first day (`noticeDay`). `who` = whoever made the change; **none** where
the app did it (a posting run, a person deleted — R12, `APP_ACTS` notices.ts:333).

Who is told (notices.ts:493-582): every person named in the input before or after the change, plus its filer while
`filerTold` (D2223, D2225, D2228); never the one who made the change (494), never a man archived, deleted or a
placeholder (`here`, 399), never the men behind ALL / ALL AVAIL (D757). A leave the Leave War approved is told by the war,
not here (504-506, 520), except a change of its **remark** (540-551).

The `what` is the FIRST TWO parts of the change, joined by `, ` (1035), in this order (`common`, 403-435): cancel →
Unavailable / programme → when → added → taken off → renamed → remark. Then ` · replaces your … bid` if a bid was
replaced (1036-1037).

| Fam | Line as seen (bold in **…**) | Template / file:line | Who / condition | D |
|---|---|---|---|---|
| B1 | **Training** Wed 15 Jul · Deleted · Saber | `'Deleted'` 938 | named people + filer, the input deleted (556-563) | D769 |
| B2 | **Range safety brief** Wed 15 Jul · You were added · Saber | `'You were added'` 939 | a man put in it, or a new input filed with him in it (510, 576) | D755, D769 |
| B3 | **Training** Wed 15 Jul · You were taken off · Saber | `'You were taken off'` 940 | a man taken out (575); not the man split into his own input | D769 |
| B4 | **Training** Wed 15 Jul · Cancelled — weather · Saber | `` `Cancelled — ${p.why}` `` 941 | CX put on, or its reason changed (406) | D760 |
| B4 | **Training** Wed 15 Jul · Cancelled · Saber | `'Cancelled'` 941 | CX with no reason | D760 |
| B4 | **Training** Wed 15 Jul · Un-cancelled · Saber | `'Un-cancelled'` 942 | CX taken off (407) | D760 |
| B5 | **Meeting** Wed 15 Jul · Taken off the programme · Saber | `'Taken off the programme'` 943 | accepted → rejected (420) | D769 |
| B5 | **Meeting** Wed 15 Jul · Back on the programme · Saber | `'Back on the programme'` 944 | rejected → accepted (421) | D769 |
| B6 | **Other** Wed 15 Jul · Filed under Unavailable · Saber | `'Filed under Unavailable'` 945 | moved under Unavailable, or an OD put back (413-414) | D815 (comment at 408), D1393 |
| B6 | **Other** Wed 15 Jul · Taken out of Unavailable · Saber | `'Taken out of Unavailable'` 946 | taken out by Reject or "Goes to" (419) | D815, D1356 |
| B7 | **Training** Wed 15 Jul · Now Thu 16 Jul · Saber | `'Now ' + days` 948-951 | first/last day moved, one day | D769 |
| B7 | **Training** Tue 14 Jul · Now Tue 14 Jul – Wed 15 Jul · Saber | same | dates moved, several days (each day written whole) | D769 |
| B7 | **Training** Wed 15 Jul · Now 09:00–11:00 · Saber | `hours()` 394, 950 | hours changed only | D769 |
| B7 | **Training** Wed 15 Jul · Now Thu 16 Jul 09:00–11:00 · Saber | same | both | D769 |
| B7 | **LL** Wed 15 Jul · Now all day · Saber | `'all day'` 394 | made whole-day | D769 |
| B7 | **LL** Wed 15 Jul · Now 00:00–12:00 am · Saber | `` ` ${r.half}` `` 394 | a leave/medical changed to its morning half (`half: 'am'`, ui/inputedit.tsx:252-254); afternoon reads `Now 12:01–23:59 pm` | D769 |
| B8 | **Range safety brief** Wed 15 Jul · Pike, Ranger added · Saber | `` `${names(p.who)} added` `` 952 | others put in (427); `ALL AVAIL added` for a placeholder; `3 people added` for 3+ | D755, D769 |
| B8 | **Range safety brief** Wed 15 Jul · Pike taken off · Saber | `` `${names(p.who)} taken off` `` 953 | others taken out (428); posting/delete version has no `· who` | D769 |
| B9 | **Range brief** Wed 15 Jul · Renamed — was Training · Saber | `` `Renamed — was ${p.was}` `` 954 | its label changed (429) — **includes a change of kind**, see §7 | D769 |
| B9 | **Training** Wed 15 Jul · Remark changed · Saber | `'Remark changed'` 955 | typed remark changed, or its "till" tick turned (433) | D769, D953 |
| P11 | **LL** Tue 10 Feb · You were added · replaces your LL bid · Saber | tail built at 1036-1037 (not `partWords`) | an Inputs filing replaced his pending Leave War bid; `replaces your LL (AM) bid` for a half; `replaces your LL, OL bid` for two | D1142, M4 9.3a |

Taken back: **none of these has a taken-back form.** The Undo of the change removes the line from the bell whether he
read it or not (it was written inside the command — notices.ts:21-23). D1693 says every line should be struck; the
register (line 19) lists it as `[NOTICE-UNDO-RETRACT]` "to build".

## 3. The holiday line (B10) — `noticeHoliday` 592-602; words 1006-1013

Bold lead = the holiday's name as it stands now, else `Public holiday` (1012). Day = `noticeRun` of the days still a
holiday. `who` = the admin who made the day a holiday (he gets the line too, with his own name — 593 does not skip him).

| Fam | Line as seen | Template / file:line | Who / condition | D |
|---|---|---|---|---|
| B10 | **National Day** Mon 10 Aug · 1 input needs an OIL answer · Saber | `'1 input needs an OIL answer'` 1012 | the admins of today of the holiday's own squadron (`leavewar/sync.ts holidayTodo` 1569-1600 → `adminsOf`), a working day made a holiday with an input on it unanswered; shown only while the count is above 0 and he is in the scheduler view (noticeLive 778-780) | D780, D783(6), D2195, D2202 |
| B10 | **Public holiday** Mon 20 – Tue 21 Jul · 3 inputs need an OIL answer · Saber | `` `${left} inputs need an OIL answer` `` 1012 | same | same |

The count is read live, never stored. Taken back: **none** — the holiday's Undo removes the line, read or not.
`partWords`' own `'Inputs need an OIL answer'` (957) is **dead**: `noticeWords` handles a holiday line before reaching it.

## 4. The Leave War's decision lines (R1, P2, P8, P10, P12) — `decisionTells` store.ts:3171-3269; written by `tellWar` sync.ts:1646-1656; words notices.ts:958-975

Bold lead = `Your leave` (`warLineName`, 815-818). Day = `noticeRun` of the run decided. `who` = the admin who did it.
Told: the man whose leave it is, only while at home in the war's squadron (sync.ts:1651); never the one who made the
change (store.ts:3187, notices.ts:826). Days decided together, same kind, in a row → one line (store.ts:3254-3266).

| Fam | Line as seen | Template / file:line | Condition (store.ts) | D |
|---|---|---|---|---|
| R1 | **Your leave** Mon 19 – Wed 21 Jan · LL approved · Saber | `` `${c} approved` `` 962 | his bid gone, leave of its kind gained (3210-3211) | D1142 |
| R1 | **Your leave** Tue 10 Feb · LL (AM) refused · Saber | `` `${c} refused` `` 963 | bid state → refused (3232), or approved leave turned into a refused bid (3240) | D1142 |
| R1 | **Your leave** Tue 10 Feb · LL back to pending · Saber | `` `${c} back to pending` `` 964 | a refused bid sent back to pending (the second tap on a lit Refuse) (3232) | **none** — not in the register |
| R1 | **Your leave** Tue 10 Feb · LL put back to a bid · Saber | `` `${c} put back to a bid` `` 965 | approved leave lost, pending bid appears on that half (3240) | D1142 |
| R1 | **Your leave** Tue 27 Jan · LL moved to Thu 29 Jan · Saber | `` `${c} moved to ${to}` `` 966 | `lw.move` of approved leave, same distance day for day (3244-3250); a run: `LL moved to Thu 29 – Fri 30 Jan` | D1142 |
| R1 | **Your leave** Tue 27 Jan · LL deleted · Saber | `` `${c} deleted` `` 967 | approved leave lost with nothing in its place (3252) | D1142 |
| P2 | **Your leave** Mon 9 Mar · LL added and approved · Saber | `` `${c} added and approved` `` 968 | `lw.placeApproved` (Auto-approve on) gained leave with no bid of his (3253) | D1422 |
| P10 | **Your leave** Tue 27 Jan · LL bid moved to Thu 29 Jan · Saber | `` `${c} bid moved to ${to}` `` 969 | his pending/refused bid's date changed (3231) | proposed (register P10) |
| P10 | **Your leave** Tue 27 Jan · LL bid deleted · Saber | `` `${c} bid deleted` `` 970 | bid gone, not approved/retyped (3228); also a whole-day bid re-typed on one half: `LL (PM) bid deleted` (3221-3223) | proposed (register P10) |
| P12 | **Your leave** Tue 10 Feb · LL bid changed to OL · Saber | `` `${lwCode(p.w)} bid changed to ${c}` `` 972 | his pending bid's kind changed by someone else (3216, 3234); halves never shown (codes stripped of `*`, 3204) | D1460 |

"Again" lines — a Redo after a "taken back" (sync.ts `followUpsFor` 1801, `followUpsOwed` 1825-1851); fresh, unread,
shown only while the line it repeats stands (notices.ts:758-765):

| Fam | Line as seen | Template | D |
|---|---|---|---|
| P8 | **Your leave** Mon 19 – Wed 21 Jan · LL approved again · Saber | 962 | D1216 (the fixes' M9) |
| P8 | **Your leave** Tue 10 Feb · LL refused again · Saber | 963 | D1216 |
| P8 | **Your leave** Tue 10 Feb · LL put back to a bid again · Saber | 965 | D1216 |
| P8 | **Your leave** Mon 9 Mar · LL added and approved again · Saber | 968 | D1216 |

The other six (`back to pending`, `moved`, `deleted`, `bid moved`, `bid deleted`, `bid changed`) get `again: true` too,
but their words have no "again" — the Redo writes a word-for-word copy of the original line (see §7).

Taken-back lines (P8) — an admin's Undo of a decision whose line the man had READ (unread: it just goes)
(sync.ts:1797-1800, `warNoticesReversed` 1957-1971; words `backWords` 994-1002). `who` = the admin who pressed Undo:

| Line as seen (struck part in ~~…~~) |
|---|
| **Your leave** Mon 19 – Wed 21 Jan · ~~LL approved~~ · taken back · Saber |
| **Your leave** Tue 10 Feb · ~~LL refused~~ · taken back · Saber |
| **Your leave** Tue 10 Feb · ~~LL back to pending~~ · taken back · Saber |
| **Your leave** Tue 10 Feb · ~~LL put back to a bid~~ · taken back · Saber |
| **Your leave** Tue 27 Jan · ~~LL moved to Thu 29 Jan~~ · taken back · Saber |
| **Your leave** Tue 27 Jan · ~~LL deleted~~ · taken back · Saber |
| **Your leave** Mon 9 Mar · ~~LL added and approved~~ · taken back · Saber |
| **Your leave** Tue 27 Jan · ~~LL bid moved to Thu 29 Jan~~ · taken back · Saber |
| **Your leave** Tue 27 Jan · ~~LL bid deleted~~ · taken back · Saber |
| **Your leave** Tue 10 Feb · ~~LL bid changed to OL~~ · taken back · Saber |

(Demo-data only, D56: a move stored before its destination was kept reads `~~LL moved~~` / `~~LL bid moved~~`, 998-1000.)
D1216, D1693, D1699.

## 5. The Leave War's bidding lines (P4, P7) — `openingTells` store.ts:3279-3298; `tellBidding` sync.ts:1663-1671; `endedLines` sync.ts:1685-1702

Bold lead = `Leave War`. Day = `stretchWords` (`1 Apr – 30 Jun`). Told: every person on the war with a sign-in, at home in
its squadron (`warAudience`, sync.ts:1659-1662), never the admin who did it. One line a stretch — a newer one on shared
dates hides the older (notices.ts:742-753).

| Fam | Line as seen | Template / file:line | Condition | D |
|---|---|---|---|---|
| P4 | **Leave War** 1 Apr – 30 Jun · Bidding open · Saber | `'Bidding open'` 978 | days newly opened, or a stretch shortened / split (said with its new dates) | D1214, D1433 (capital) |
| P7 | **Leave War** 1 Apr – 30 Jun · Bidding closed · Saber | `'Bidding closed'` 978 | a run closed that no "open" line names | D1214, D1433 |
| P7 | **Leave War** 1 Apr – 30 Jun · Bidding closed · its dates ended | `'Bidding closed · its dates ended'` 978 | worked out by each bell (never stored) the day after a stretch's last date; no `who`; listed 14 days, or however old if he had a line about it | D1214 (register P7), D1433 |
| P8 | **Leave War** 1 Apr – 30 Jun · ~~Bidding open~~ · taken back · Saber | 997 | Undo of an opening he had read | D1216, D1699 |
| P8 | **Leave War** 1 Apr – 30 Jun · ~~Bidding closed~~ · taken back · Saber | 997 | Undo of a closing he had read | D1216, D1699 |

A Redo after one of these writes the plain line again (`Bidding open · Saber`), no "again" (sync.ts:1801). The
worked-out "its dates ended" line has no taken-back form (no command makes it).

## 6. The posting lines (B12) — `noticePosting` 839-851; `runPoOutcomes` sync.ts:3032-3037; `runForeignPosting` sync.ts:3199; `postedLines` sync.ts:1713-1744; words 872-877, 976

Bold lead = the man's callsign of today. Day = the posting date (`noticeDay`). No `who` (nobody named — 1025). Told: the
admins of today of the man's squadron (`postingAdmins` → `adminsOf`, sync.ts:1539-1540), never the man himself; only in
the scheduler view (notices.ts:769). Order within a run: latest date first, then Overseas Sqn, Delete, SANS, then callsign.

| Fam | Line as seen | Template / file:line | Condition | D |
|---|---|---|---|---|
| B12 | **Ranger** Mon 16 Nov · Posted out · archived, account suspended | `PO_DID.overseas` 873 | Overseas Sqn, he held a sign-in | D1546, D1547, D1690 |
| B12 | **Ranger** Mon 16 Nov · Posted out · archived | 873 | Overseas Sqn, no sign-in | D1690 |
| B12 | **Ranger** Mon 16 Nov · Posted out · deleted | 874 | Delete (with or without sign-in) | D1690, D1691 |
| B12 | **Ranger** Mon 16 Nov · Posted out · now SANS | 875 | SANS | D1690 |
| B12 | **Ranger** Mon 16 Nov · Posted out · off the manpower | 876 | no outcome chosen: worked out by each admin's bell from the posting as it stands, 14 days, never stored (sync.ts:1723-1744) | D1690, D1696 |

Taken back — the sheet's "Undo post out", or the posting changed after it ran (D1710), to an admin who had read the line
and is still an admin (`retractPostingLines` sync.ts:1796-1815, `noticePostingBack` 855-863); `who` = the admin who pressed it:

| Line as seen |
|---|
| **Ranger** Mon 16 Nov · ~~Posted out · archived, account suspended~~ · taken back · Saber |
| **Ranger** Mon 16 Nov · ~~Posted out · archived~~ · taken back · Saber |
| **Ranger** Mon 16 Nov · ~~Posted out · deleted~~ · taken back · Saber |
| **Ranger** Mon 16 Nov · ~~Posted out · now SANS~~ · taken back · Saber |
| **Ranger** Mon 16 Nov · ~~Posted out · off the manpower~~ · taken back · Saber |

D1693, D1699, D1710. Not built: P15 `Posted out · now with 149` (no transfer outcome exists in `PoOutcome`, 99); every
cross-squadron line of D2206 / D2219 / D2220; the account-status lines of D2251; the "posting cannot run" line of D2214.

## 7. Lines that read oddly — exact combinations

1. **A change of kind reads as a rename.** `title` fires whenever `inpLabel` differs (429), and the label is the kind code
   when there is no title: a leave changed from LL to OL by an admin tells **OL** Wed 15 Jul · `Renamed — was LL · Saber`.
2. **A half-day's hours print in small letters, with clock times.** **LL** Wed 15 Jul · `Now 00:00–12:00 am · Saber`;
   **LL** Wed 15 Jul · `Now 12:01–23:59 pm · Saber` (394 — `r.half` is stored `am` / `pm`). Everywhere else the app writes
   `LL (AM)` (D1525).
3. **"Now" after a comma, capital and all.** `Cancelled — weather, Now Thu 16 Jul · Saber`;
   `Un-cancelled, Now 09:00–11:00 · Saber`; `Taken off the programme, Now Thu 16 Jul · Saber`.
4. **Two long dashes in one line** (D834 says a dash is not the ordinary join): `Cancelled — weather, Renamed — was Training · Saber`.
5. **The third change and beyond are silently dropped** (1035 `.slice(0, 2)`): cancel + new date + rename tells only
   `Cancelled — weather, Now Thu 16 Jul` — the rename is never said.
6. **"Now" writes each day whole**, unlike every other run in the bell: `Now Tue 14 Jul – Wed 15 Jul` beside
   `Your leave Mon 19 – Wed 21 Jan`.
7. **Names lists mix with counts awkwardly:** `Ranger, ALL AVAIL added`; `3 people taken off` (no names at three).
8. **No `who` where the app acted:** `Training Wed 15 Jul · Ranger taken off` (a posting that deleted Ranger) — reads as if
   nobody did it, with no word saying the app did.
9. **The holiday's maker is told by name of his own act:** his own bell reads `… 2 inputs need an OIL answer · Saber`
   when he is Saber. Every other family never tells the actor.
10. **"Again" only for four of ten:** a Redo of a move after its "taken back" writes `LL moved to Thu 29 Jan · Saber`
    again, word for word — the reader sees the same line twice with no "again"; likewise `Bidding open · Saber`.
11. **Taken back of a refusal undone:** `~~LL back to pending~~ · taken back · Saber` — the man must work out that his bid
    is refused again.
12. **Half shown on some bid lines, not others:** `LL (PM) bid deleted` but `LL bid changed to OL` even for a half-day bid
    (the kind is stripped of its half, store.ts:3204).
13. **"Bidding closed · its dates ended"** carries its own ` · ` inside the words and no name, so it reads as two
    fragments: `Leave War 1 Apr – 30 Jun · Bidding closed · its dates ended`.
14. **A war line's dates never show a year;** a bidding stretch across a year end reads `1 Dec – 28 Feb`.

## 8. Dead strings

- `'Notifications cleared'` — topstate.ts:83 (nothing calls `markBell`).
- `'Inputs need an OIL answer'` — notices.ts:957 (`noticeWords` answers a holiday line first).
- `` `replaces your ${lwCode(p.c)} bid` `` — notices.ts:947 (`rbid` parts are filtered out before `partWords`, 1035).
- `return c` fallback in the `lw` case — notices.ts:974 (every `LwDid` has a case).
- `'off the manpower'` fallback in the `po` case — notices.ts:976 (every `PoOutcome` is in `PO_DID`).
- `~~LL moved~~` / `~~LL bid moved~~` — notices.ts:999 — reachable only from demo data stored before the destination was
  kept (D56).

## 9. Where the register (`docs/notifications-register.md`) and the code differ

| Register | Code today |
|---|---|
| B7 `Now Tue 14 – Wed 15 Jul 08:00` | `Now Tue 14 Jul – Wed 15 Jul 08:00–16:00` — each day whole; hours a range; a half adds `am`/`pm` |
| B10 `Inputs need an OIL answer` (with its count) | `3 inputs need an OIL answer` / `1 input needs an OIL answer` |
| B11 "the input's line" | no line in the list: the bell lights and a tap opens the question with the note `Weekend/PH work — confirm your OIL` |
| R1 / P8 `approval of LL taken back` | `~~LL approved~~ · taken back · Saber` (the register's own head, line 19, has the new form) |
| P4 `Apr – Jun open for leave · Saber` | `Leave War` · `1 Apr – 30 Jun` · `Bidding open · Saber` |
| P7 `bidding closed · 1 Apr – 30 Jun · Saber` | `Leave War` · `1 Apr – 30 Jun` · `Bidding closed · Saber`; plus a worked-out `Bidding closed · its dates ended` with no name |
| P10, P12 listed under "Proposed, his to strike" | both built (their own rows say so) |
| — | `LL back to pending` (a refusal sent back to pending) is built and in no register row |
| — | the "again" lines (4 forms) are in no register row |
| — | the taken-back forms of `refused`, `put back`, `moved`, `deleted`, `added and approved`, the bid lines and the bidding lines are named only by the general D1693 sentence |
| Squadron mark on a line from another squadron (D2202) | not built (the register says so) |
| D1693 "every line is taken back" | built only for the Leave War and posting lines; input and holiday lines vanish on Undo, read or not |

## 10. Count

57 distinct list lines (word forms, not counting date/name values):
- Input lines B1–B9 + P11: 16 (`Now …` counted once; it has six shapes in §2)
- Holiday B10: 2
- Leave decisions: 10 plain (R1 6, P2 1, P10 2, P12 1) + 4 "again" + 10 taken back = 24
- Bidding P4/P7: 3 plain + 2 taken back = 5
- Postings B12: 5 plain + 5 taken back = 10

Plus the bell's own words: `Nothing new`, `Mark all read`, `↓ N more`, `Notifications` (label), 5 age forms, and 5 tap
notes (one dead).
