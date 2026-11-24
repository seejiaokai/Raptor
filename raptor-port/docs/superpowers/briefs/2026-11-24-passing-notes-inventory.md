# Passing notes — full inventory (read-only, 24 Nov 26)

## What was searched

- **The one passing note** of the main app is `toast()` in `raptor-port/src/ui/toast.ts:159`, reached everywhere as `HOOKS.toast(msg, kind)` (wired in `main.tsx:34` / `state/store.ts:1167`). Its kinds: plain (no kind, `''`, `'ok'`, `'info'` all look the same), `'warn'` (amber), `'hard'` (red), `'blocked'` (the grey "Blocked:" note — the words up to the first colon in bold).
- **The batch join** `toastBatch()` (`ui/toast.ts:33`): notes raised in one press are said as one line joined by ` · `; two notes naming the same day are fused to "Monday 13 Jul published and approved. The Common Programme has no usable times, so nobody on it earns OIL." (`ui/toast.ts:50`, D837 / N1).
- **The Leave War** has no note of its own: it calls the same `HOOKS.toast` (`leavewar/inputgate.ts`, `leavewar/sync.ts`, `leavewar/ui/BalancesPage.tsx`, `leavewar/ui/BidPicker.tsx` via `sayOnWar`).
- **The Tracker** has its own: `flashHint(msg, ms)` in `tracker/app/core.js:968` — a passing line in the chart-layout hint bar (1.8 s), used only while editing a chart's layout and in two marking cases.
- Every caller was followed to the words it actually passes, including the shared sentence-makers (`slotBar`, `rowTwice`, `sharedRefusal`, `fileForOtherRefusal`, `lockedWeekNote`, `whoDoorRefusal`, the undo reasons, the account refusals, etc.).
- Skipped: `*.test.*`, `raptor-port/reference`, the test bridge (`probe-bridge.ts`), the bars that stay (OIL bar, "Not saved" band), inline form errors (`setErr`), and the two snackbars with buttons (listed at the very end for completeness, not counted).

Realistic values used: callsigns Ranger, Saber, Hex, Tally, Viper; Monday 13 Jul; squadrons 142 and 149. "Kind" is my reading of what the note does (DONE / REFUSED / FAILED / WARNING / OTHER). The D column carries a number only where a comment beside the note says he ruled that wording (N-numbers are the wording-recheck brief's note labels, quoted from the same comments).

Paths are relative to `raptor-port/src/`.

---

## The table

### Publishing, signing and amendments (Edit Schedule and Scheduler Board — the day's publish controls)

| # | Page / area | The note exactly as seen | Template · file:line | Raised by | Kind | D |
|---|---|---|---|---|---|---|
| 1 | Edit Schedule, Board | Monday needs SKED CK, APPROVED BY before it can be published | `${DAYS[di].dow} needs ${signMissing(di).join(', ')} before it can be published` · engine/publish.ts:502 | Publish on an unsigned day | REFUSED | |
| 2 | Edit Schedule, Board | Monday published and approved | `${DAYS[di].dow} published and approved` · engine/publish.ts:532 (fused form built in ui/toast.ts:50) | First Publish of a day | DONE | D837 (N1) |
| 3 | Edit Schedule, Board | Monday is still a draft. Publish the day first, then its changes. | `${DAYS[di].dow} is still a draft. Publish the day first, then its changes.` · engine/publish.ts:1435 | Publish AL on an unpublished day | REFUSED | D838, D839 (N6) |
| 4 | Edit Schedule, Board | No changes to publish on Monday | `No changes to publish on ${DAYS[di].dow}` · engine/publish.ts:1444 | Publish AL with nothing waiting | REFUSED | |
| 5 | Edit Schedule, Board | Sign off SKED CK, APPROVED BY before publishing AL2 | `Sign off ${signMissing(di).join(', ')} before publishing AL${seq}` · engine/publish.ts:1446 | Publish AL unsigned | REFUSED | |
| 6 | Edit Schedule, Board | Published AL2 · 3 items on Mon only · approved by Saber · 1 day with changes still held | `Published AL${seq} · ${count} item${…} on ${dowShort(di)} only` + `· approved by ${who.appr}` + `· ${held} day${…} with changes still held` · engine/publish.ts:1451 | Publish AL | DONE | |
| 7 | Edit Schedule, Board | Monday is locked. It was published by an older version of the app, so it can’t be amended here. | `${dow\|\|'This day'} is locked. It was published by an older version of the app, so it can’t be amended here.` · engine/publish.ts:149, raised :151 | Publish AL on an old-format week | REFUSED | |
| 8 | Edit Schedule, Board | All signed — no changes to publish right now | literal · ui/oilsign.ts:63 | Last sign-off name picked on a published day with nothing pending | OTHER | |
| 9 | Edit Schedule, Board, View-only | Some of Monday’s OIL credits are already spent on the Leave War. Unpublishing withdraws them until you republish. Tap again to confirm. | `Some of ${dow}’s OIL credits are already spent on the Leave War. Unpublishing withdraws them until you republish. Tap again to confirm.` · ui/interactions.ts:1552 | First tap of Unpublish (Original) | WARNING | D837, D839 (N4) |
| 10 | Edit Schedule, Board | Withdrawing AL2 brings back AL1’s OIL for Monday. Some of AL2’s OIL credits are already spent on the Leave War, and AL1 credits less. Tap again to confirm. | `Withdrawing ${wl} brings back ${verName(back)}’s OIL for ${dow}. Some of ${wl}’s OIL credits are already spent on the Leave War, and ${verName(back)} credits less. Tap again to confirm.` · ui/interactions.ts:1552 | First tap of Unpublish (an AL) | WARNING | |
| 11 | Edit Schedule, Board | That day can’t be unpublished right now. | literal · ui/interactions.ts:1564 | Unpublish refused by the app | FAILED | |
| 12 | Edit Schedule, Board | Monday unpublished. It is a draft again, and publishing reissues the Original. Its OIL credits are withdrawn from the Leave War until it is republished. | `${dow} unpublished. It is a draft again, and publishing reissues the ${wl}.` + optional ` Its OIL credits are withdrawn from the Leave War until it is republished.` · ui/interactions.ts:1574 | Unpublish (Original) | DONE | D837 (N2) |
| 13 | Edit Schedule, Board | Monday: AL2 withdrawn. Its changes are back on the working copy as pending, and AL1 is the issued schedule. Publishing reissues AL2. The Leave War credits AL1’s OIL for the day until AL2 is republished. | `${dow}: ${wl} withdrawn. Its changes are back on the working copy as pending, and ${verLabel(now)} is the issued schedule. Publishing reissues ${wl}.` + optional ` The Leave War credits ${verLabel(back)}’s OIL for the day until ${wl} is republished.` · ui/interactions.ts:1574 | Unpublish (an AL) | DONE | D837 (N3) |
| 14 | Edit Schedule, Board | Monday is already at the Original. 1 input filed since publishing stays on the programme, pending. | `${dow} is already at ${…'the Original' or ALn}.` + `inputsLeftSaid(di)` (engine/drafts.ts:180–182) · ui/interactions.ts:1662 | Load a version the day already shows | OTHER | D863 |
| 15 | Edit Schedule, Board | That version is no longer available | literal · ui/interactions.ts:1678 | Load onto working copy, version gone | FAILED | |
| 16 | Edit Schedule, Board | Monday is back to AL1. Viewers still see AL2. 1 request stays as filed because it covers another day. Training is on Tuesday's programme now, pending there. Hex's Training is left out because it is on Tuesday's programme. 1 change to a member's input stays pending. A load never puts back a member's own input. 2 inputs need an OIL answer. | `${dow} is back to ${the(ver)}.` + ` Viewers still see …` + ` ${left} request stays as filed because it covers another day.` + moved-row sentences + `rowsLeftSentences` (engine/drafts.ts:187) + `inputsLeftSaid` + `oilNeedSaid` (ui/oilputback.ts:67) · ui/interactions.ts:1700–1716 | Load onto working copy (confirmed) | DONE | D863; OIL count D818, D862 |
| 17 | Edit Schedule, Board | That plan is no longer available | literal · ui/interactions.ts:1620 | Pick a plan that was removed | FAILED | |

### Schedule times and lines (Edit Schedule, Scheduler Board, and the template windows)

| # | Page / area | The note exactly as seen | Template · file:line | Raised by | Kind | D |
|---|---|---|---|---|---|---|
| 18 | Edit Schedule, Board, Duty / Wave templates | 2560 is not a time. Try 0900 or 09:00. | `${v} is not a time. Try 0900 or 09:00.` · engine/slots.ts:370; ui/DutyTplModal.tsx:77; ui/WaveTplModal.tsx:91 | Typing a bad time in a time box | REFUSED | |
| 19 | Inputs (any input's window, a row's time on the schedule) | That is not a time — try 0900 or 09:00 | literal · ui/inputedit.tsx:652, 1909 | Saving an input / its row with a bad time | REFUSED | |
| 20 | Edit Schedule, Board | The brief cannot be after the 13:00 take-off | `The brief cannot be after the ${r.o.to} take-off` · engine/slots.ts:403 | Typing a brief later than take-off | REFUSED | |
| 21 | Edit Schedule, Board | The 12:30 brief was after the new take-off, so it was removed | `The ${bwas} brief was after the new take-off, so it was removed` · engine/slots.ts:427 | Moving take-off earlier than the brief | WARNING | D837, D839 (N19) |
| 22 | Board | Add a wave first | literal · ui/board.ts:1575 | + Line on a day with no wave | REFUSED | |
| 23 | Board | Line added | literal · ui/board.ts:1043, 1580 | + Line | DONE | |
| 24 | Board | Aircraft added | literal · ui/board.ts:1033 | + aircraft on a line | DONE | |
| 25 | Board | Wave added | literal · ui/board.ts:1615 | + Wave (built-in kind) | DONE | |
| 26 | Board | SC added: standalone, SPARE is checked for availability, SC currency, front seat and overlapping SC seats or the SC desk only | `S.label + ' added: standalone, ' + 'SPARE is checked for availability, SC currency, front seat and overlapping SC seats or the SC desk only'` · ui/board.ts:1628 | + Wave → SC | DONE | |
| 27 | Board | AVALON added: standalone, every seat checked for availability, SC currency, front seat and overlapping places only | `S.label + ' added: standalone, ' + 'every seat checked for availability, SC currency, front seat and overlapping places only'` · ui/board.ts:1628 | + Wave → AVALON / BB | DONE | |
| 28 | Board | "Morning BFM" added | `"${w.label \|\| 'Wave'}" added` · ui/board.ts:2036–2038 | + Wave → a saved wave template | DONE | |
| 29 | Board | Line removed — VIPER 1 · BFM, 13:00–14:00, Ranger/Tally | `'Line removed' + desc(cs · msn, to–ld, FCP/RCP)` · ui/board.ts:1019, 1027 | ✕ on a line | DONE | |
| 30 | Board | Wave removed — Wave 2, 2 formations · 4 aircraft | `'Wave removed' + desc(label, '${nf} formations · ${na} aircraft')` · ui/board.ts:1053, 1061 | ✕ Wave | DONE | |
| 31 | Board | Note removed — "Brief in room 3" | `'Note removed' + (text ? ' — "' + text + '"' : '')` (a long note is cut with … and loses its closing quote) · ui/board.ts:1075, 1077 | ✕ on a note | DONE | |
| 32 | Board | Item removed — ACADEMICS · Room 2, 08:00–10:00, Ranger +3 | `'Item removed' + desc(prog · sub, str–end, whoText)` · ui/board.ts:1089, 1094 | ✕ on a Common Programme row | DONE | |
| 33 | Board | Duty block removed — SDO, 3 rows | `'Duty block removed' + desc(label, '${n} rows')` · ui/board.ts:1150, 1155 | ✕ on a duty block | DONE | |
| 34 | Board | Duty row removed — SDO, Ranger, 07:00–17:00 | `'Duty row removed' + desc(role, cs, str–end)` · ui/board.ts:1168, 1173 | ✕ on a duty row | DONE | |
| 35 | Board | Sim row removed — OFT · SIM 1, 08:00–10:00 | `'Sim row removed' + desc(KIND · label, str–end)` · ui/board.ts:1207, 1212 | ✕ on a sim row | DONE | |
| 36 | Board | Ground item removed — Training, 08:00–10:00, Ranger | `'Ground item removed' + desc(prog, str–end, whoText)` · ui/board.ts:1255, 1260 | ✕ on a ground row that is not an input's | DONE | |
| 37 | Board | Ground item removed — back under Personal Inputs — Training, 08:00–10:00, 3 people | `` `${onCommon(row) ? 'Common' : 'Ground'} item removed — back under Personal Inputs` + desc(prog, str–end, howMany / whoText) `` · ui/board.ts:1252 | ✕ on an input's row on the Ground / Common Programme | DONE | D957, D958 ("Common" for a Common row) |
| 38 | Board | Red box: flagged for the next scheduler | literal · ui/board.ts:1011, 1100, 1179, 1218, 1275, 1279 | Red-box toggle on a row | DONE | |
| 39 | Board | Red box cleared | literal · same lines as 38 | Red-box toggle off | DONE | |
| 40 | Board | This item is info only: no longer checked against the rules, and earns nobody any OIL | literal · ui/board.ts:1109, 1287, 1291 | ⓘ info-only toggle on | DONE | |
| 41 | Board | This item is checked against the rules again and can earn OIL | literal · ui/board.ts:1109, 1291; `UNMARKED.info` ui/reqdoor.ts:486, raised ui/board.ts:1287, ui/reqdoor.ts:435, 462 | ⓘ info-only toggle off | DONE | |
| 42 | Board | CX DUE WX | `cxText(o)` = `'CX DUE ' + reason` or `'CX'` (ui/html.ts:1412) · ui/board.ts:738, 756 | Confirm in the CX (cancel) dialog | DONE | |
| 43 | Board | Restored | literal · ui/board.ts:756; `UNMARKED.cx` ui/reqdoor.ts:485, raised ui/board.ts:738, ui/reqdoor.ts:435, 462 | Un-cancel in the CX dialog | DONE | |
| 44 | Board | Every section on Monday sorted | `Every section on ${d.dow} sorted` · ui/board.ts:849 | Sort all | DONE | |
| 45 | Board | Already in order | literal · ui/board.ts:850, 1000 | Sort all / Auto sort with nothing to move | OTHER | |
| 46 | Board | Ground programme back to time order | literal · ui/board.ts:998 | Auto sort on a hand-ordered ground list | DONE | |
| 47 | Board | Template library is full — delete one before saving another | literal · ui/board.ts:1759 | Templates → save the day as a template | REFUSED | |
| 48 | Board | Saved as "Weekday flying" | `Saved as "${t.title}"` · ui/board.ts:1765 | Templates → save | DONE | |
| 49 | Board | Monday is published — a template can't be applied to a published day. Edit the working copy, or Unpublish it first. | `${dow \|\| 'This day'} is published — a template can't be applied to a published day. Edit the working copy, or Unpublish it first.` · engine/daytpl.ts:230, raised ui/board.ts:1775 | Templates → apply on a published day | REFUSED | |
| 50 | Board | Applying "Weekday flying" replaces your unpublished edits on Monday — open Templates and pick it again to confirm | `Applying "${title}" replaces your unpublished edits on ${d.dow} — open Templates and pick it again to confirm` · ui/board.ts:1778 | First pick of a template on an edited draft | WARNING | |
| 51 | Board | Applied "Weekday flying" to Monday | `Applied "${title}" to ${d.dow}` · ui/board.ts:1789 | Templates → apply | DONE | |
| 52 | Board | All day templates deleted | literal · ui/DayTplModal.tsx:93 | Day templates window → delete all | DONE | |
| 53 | Board | "Weekday flying" template deleted | `"${title}" template deleted` · ui/DayTplModal.tsx:101; ui/DutyTplModal.tsx:161; ui/WaveTplModal.tsx:182 | Delete one template (day, duty or wave) | DONE | |
| 54 | Board | Duty templates reset to defaults | literal · ui/DutyTplModal.tsx:151 | Duty templates → reset | DONE | |
| 55 | Board | Wave templates cleared | literal · ui/WaveTplModal.tsx:174 | Wave templates → clear | DONE | |
| 56 | Edit Schedule, Board | "Plan B" is already the live Monday | `"${t.name}" is already the live ${d.dow}` · ui/board.ts:1815 | Plans menu → pick the plan already live | OTHER | |
| 57 | Edit Schedule, Board | Monday is now "Plan B". Hex's Training is left out because it is on Tuesday's programme. 2 differences from AL1 are pending. 1 input needs an OIL answer. | `${d.dow} is now "${t.name}".` + `rowsLeftSentences` + ` ${n} differences from ${the(cv)} are pending.` / ` Nothing is pending: it matches ${the(cv)}.` + `oilNeedSaid` · ui/board.ts:1834–1849 | Plans menu → switch plan | DONE | D865 |
| 58 | Edit Schedule, Board | Monday — "Plan 2" is now the live day, edit over it | `${d.dow} — "${t.name}" is now the live day, edit over it` · ui/board.ts:1930–1931 | Plans menu → + Alt Plan | DONE | |
| 59 | Edit Schedule, Board | Another plan on this day already has that name | literal · ui/DraftsModal.tsx:86 | Rename a plan to a taken name | REFUSED | |
| 60 | Edit Schedule, Board | A plan needs a name | literal · ui/DraftsModal.tsx:86 | Rename a plan to blank | REFUSED | |
| 61 | Edit Schedule, Board | "Plan B" plan deleted | `"${name}" plan deleted` · ui/DraftsModal.tsx:154 | Manage plans → delete | DONE | |
| 62 | Board | Desktop layout: pan sideways to read the whole day | literal · ui/board.ts:2051 | Phone / Desktop layout switch → desktop | DONE | |
| 63 | Board | Phone layout | literal · ui/board.ts:2051 | Layout switch → phone | DONE | |
| 64 | Edit Schedule, Board | Saved as the default section order for every day | literal · ui/SecDefaultSnackbar.tsx:53 | "Set as default" on the section-order offer | DONE | |
| 65 | Edit Schedule, Board | Line is SPARE now: it flies, so it is still fully cross-checked | literal · ui/interactions.ts:2059 | MAIN/SPARE badge tap, line flies | DONE | D1045 |
| 66 | Edit Schedule, Board | Line is SPARE now: standing by, checked for availability and currency only | literal · ui/interactions.ts:2059 | MAIN/SPARE badge tap, standing by | DONE | D1045 |
| 67 | Edit Schedule, Board | Line is MAIN now: fully cross-checked | literal · ui/interactions.ts:2059 | SPARE → MAIN | DONE | |
| 68 | Edit Schedule, Board | Only a scheduler can edit In-time | `Only a scheduler can edit ${REPORTING_LABEL}` · ui/interactions.ts:1281, 1318 | + In-time / remove an in-time line without rights | REFUSED | |
| 69 | Edit Schedule, Board | In-time line removed — 06:00 in time + WX/NOTAMS | `${REPORTING_LABEL} line removed — ${gone (cut at 40 chars + …)}` · ui/interactions.ts:1335 | ✕ on an in-time line | DONE | |
| 70 | Edit Schedule, Board | Note now shows on the view-only schedule | literal · ui/interactions.ts:1904 | Scheduler note → Make public (draft day) | DONE | D1592 (N16 kept) |
| 71 | Edit Schedule, Board | Note is scheduler-only again | literal · ui/interactions.ts:1904 | Make public off (draft day) | DONE | D1592 |
| 72 | Edit Schedule, Board | Note made public. It goes out with the next amendment. | literal · ui/interactions.ts:1904 | Make public on a published day | DONE | D1592 |
| 73 | Edit Schedule, Board | Note made scheduler-only. It goes out with the next amendment. | literal · ui/interactions.ts:1904 | Make public off on a published day | DONE | D1592 |
| 74 | Edit Schedule, Board | Only a scheduler can change this | literal · ui/interactions.ts:1888 | Make public without rights | REFUSED | |
| 75 | Edit Schedule (the jet's stores box) | TGP removed from the list. Every jet carrying it keeps it. Add it back and the chips return. | `${lab} removed from the list. Every jet carrying it keeps it. Add it back and the chips return.` · ui/interactions.ts:467 | Stores ✎ → delete a store | DONE | |
| 76 | Edit Schedule (stores box) | A store needs a letter or a number in its name | engine/stores.ts:61, raised ui/interactions.ts:483 | + add store | REFUSED | |
| 77 | Edit Schedule (stores box) | A store name is at most 16 characters | `A store name is at most ${MAX_LABEL} characters` · engine/stores.ts:62, 102; raised ui/interactions.ts:483, 583 | Add / rename a store | REFUSED | |
| 78 | Edit Schedule (stores box) | A store needs a name | engine/stores.ts:101, raised ui/interactions.ts:583 | Rename a store to blank | REFUSED | |
| 79 | Edit Schedule (stores box) | TGP is already the name of another store | `${lab} is already the name of another store` · engine/stores.ts:111, raised ui/interactions.ts:583 | Rename to a taken name | REFUSED | |
| 80 | Board (CX dialog's reason list) | A cancel reason needs some text | engine/cxreasons.ts:45, 66; raised ui/SchedBoard.tsx:892, 930 | Add / rename a cancel reason | REFUSED | |
| 81 | Board (CX dialog) | A cancel reason is at most 24 characters | `A cancel reason is at most ${MAX_CXR_LABEL} characters` · engine/cxreasons.ts:46, 67 | same | REFUSED | |
| 82 | Board (CX dialog) | WX is already on the list | `${lab} is already on the list` · engine/cxreasons.ts:47, 68 | same | REFUSED | |
| 83 | Board (CX dialog) | The list holds at most 24 reasons | `The list holds at most ${MAX_CXR} reasons` · engine/cxreasons.ts:48 | Add a 25th reason | REFUSED | |

### Putting people on seats and rows (Edit Schedule, Scheduler Board)

| # | Page / area | The note exactly as seen | Template · file:line | Raised by | Kind | D |
|---|---|---|---|---|---|---|
| 84 | Edit Schedule, Board | Ranger planned | `${PEOPLE[id].cs} planned` · state/view.ts:1411 | Tap a seat, then a name (no problem) | DONE | |
| 85 | Edit Schedule, Board | Ranger — already in that seat | `${cs} — already in that seat` · state/view.ts:1344 | Tap-plant the man already in the seat | REFUSED | |
| 86 | Edit Schedule, Board | Already in that seat | literal · ui/drag.ts:468 | Drag a man onto the seat he holds | REFUSED | |
| 87 | Edit Schedule, Board | Ranger — not SC DAY current | `${cs} — ${slotBar(id,key)}` · state/view.ts:1353, 1410; ui/drag.ts:184, 416, 496 (reasons: engine/avail.ts:402–520, list below) | Plant / drop a man the seat flags (planted, warned) or a placeholder on a flying seat (refused) | WARNING (REFUSED for ALL / ALL AVAIL on a flying seat) | D33 (placeholder refusal) |
| 88 | Edit Schedule, Board | Ranger — already on SDO 07:00–17:00 · not added twice | `${cs} — ` + `already on ${ev.label} ${s}–${e}` / `already on this row` + ` · not added twice` · engine/avail.ts:397; raised state/view.ts:1358; ui/drag.ts:425, 502 | Plant the same man twice on one row | REFUSED | D271 |
| 89 | Edit Schedule, Board | Tally cannot take Ranger’s place — that seat cannot take him | `${csOf(was)} cannot take ${csOf(aimed)}’s place — ${why}` (why = 'that seat cannot take him' or the row-twice words) · ui/drag.ts:400 | Drag a man onto an input row's only person (swap) | REFUSED | |
| 90 | Edit Schedule, Board | Ranger — Conflict: RU (step 12:00, T/O 13:00) & BRIEFING 12:40–13:00 (+1 more) | `flagLine(w)` = `[Tue · ][cs — ]${w.msg}` + ` (+N more)` · state/dropflag.ts:85–104 | Any plant / drop that raises a new warning (the warning list's own words) | WARNING (red for a hard one) | |
| 91 | Edit Schedule, Board | A jet line carries two — FCP and RCP | literal · ui/drag.ts:291 | Drop a name under a jet's two seats | REFUSED | |
| 92 | Edit Schedule, Board | Ranger removed | `(cs) + ' removed'` · ui/drag.ts:531; ui/Shell.tsx:252 | Drag a puck off onto nothing; right-click a puck | DONE | |
| 93 | Edit Schedule, Board | Leave OIL Earn before moving anyone — the day cannot change while you are deciding what it earns | `OIL_NO_MOVE` · ui/oilmode.ts:964, raised ui/drag.ts:214 | Drag while OIL Earn is on | REFUSED | |
| 94 | Edit Schedule, Board, Inputs, Admin, Leave War | This change could not be saved. | `SCHED_MOVE_WORDS` state/typing-hold.ts:44 (raised ui/drag.ts:284, ui/Shell.tsx:207, ui/textedit.ts:167); also ui/InputsPage.tsx:741 (blocked), ui/AdminPage.tsx:90; leavewar `NOT_SAVED` sync.ts:523 | A change made after his squadron changed under him; a refused save | REFUSED | |
| 95 | Edit Schedule, Board | Couldn’t save that — try again | literal · state/sched-commit.ts:723 | A scheduler command rolled back (comment: never fires today) | FAILED | |
| 96 | Edit Schedule, Board | Hex and Ranger swapped | `${csOf(pid)} and ${csOf(was)} swapped` · ui/reqdoor.ts:271, said :237 | Drag a man from a seat onto an input row's only person | DONE | |
| 97 | Edit Schedule, Board | Hex is on Training instead of Ranger | `${csOf(pid)} is on ${name} instead of ${csOf(was)}` · ui/reqdoor.ts:237; ui/inputedit.tsx:1763 | Drop a man on an input row's only person | DONE | |
| 98 | Edit Schedule, Board | Hex is now unavailable instead of Ranger | `${cs} is now unavailable instead of ${was}` · ui/inputedit.tsx:1763, 1796; via MedMoveConfirm ui/inputedit.tsx:1782 → ui/MedMoveConfirm.tsx:44 | Drop a man on an Unavailable row | DONE | |
| 99 | Edit Schedule, Board | Ranger added to Training — not counted for OIL | `${csOf(pid)} added to ${name}` + ` — not counted for OIL` · ui/reqdoor.ts:206, 215 | Drop a man onto an input row whose OIL answer is No (only then is a note raised) | DONE | |
| 100 | Edit Schedule, Board | Ranger moved to Meeting | `${csOf(pid)} moved to ${inpLabel(y.inp)}` · ui/reqdoor.ts:375, said :317 | Drag a man from one input's row to another | DONE | |
| 101 | Edit Schedule, Board | Ranger is the last on this input. Take the input off the programme, or delete it in its own window. | `${cs} is the last on this input. Take the input off the programme, or delete it in its own window.` · ui/reqdoor.ts:306 | Take the last man off an input's row | REFUSED | |
| 102 | Edit Schedule, Board, Inputs | Ranger is already on this input | `${csOf(id)} is already on this input` · ui/reqdoor.ts:103 (raised :253, 269, 361, 374); ui/inputedit.tsx:1746; engine/inputs.ts:860 | Add a man already in it | REFUSED | |
| 103 | Edit Schedule, Board, Inputs | This input already has ALL AVAIL | `This input already has ${cs}` · ui/reqdoor.ts:103; engine/inputs.ts:858; ui/peoplepick-model.ts:52 | Add a second placeholder | REFUSED | |
| 104 | Edit Schedule, Board | Ranger — already on this row as an extra · kept once, as its holder | `${cs} — already on this row as an extra · kept once, as its holder` · state/holderbase.ts:243, raised :246 | An input change that would double a man on its row | WARNING | |
| 105 | Edit Schedule, Board | LL does not go on the Ground Programme — its row has been removed | `${r.type} does not go on the Ground Programme — its row has been removed` · state/holderbase.ts:238, raised :246 | An input retyped to a kind that never stands on the programme | WARNING | |

### OIL Earn on the schedule (Scheduler Board, the ALL AVAIL window)

| # | Page / area | The note exactly as seen | Template · file:line | Raised by | Kind | D |
|---|---|---|---|---|---|---|
| 106 | Board | OIL Earn: tap a puck to stop that man earning from that event, or an item to stop the whole item earning | literal · ui/board.ts:1139; ui/SchedBoard.tsx:696 | OIL Earn button on | OTHER | D838, D839 (N9) |
| 107 | Board | Back to editing the schedule | literal · ui/board.ts:1139; ui/SchedBoard.tsx:696 | OIL Earn button off | DONE | D838, D839 (N9) |
| 108 | Board | Nothing on this day earns OIL, including anything added later | literal · ui/board.ts:939 | "No OIL earned" switch on | DONE | |
| 109 | Board | This day can earn OIL again, and the marks underneath are back | literal · ui/board.ts:939 | "No OIL earned" switch off | DONE | |
| 110 | Board, ALL AVAIL window | Nothing on this day earns. Turn off the switch first. | `DAY_EARNS_NOTHING` · ui/oilmode.ts:535; raised ui/board.ts:1450, 1499, 1500, 1510, 1523; ui/AvailWindow.tsx:287 | Tap a puck / item under the day's switch | REFUSED | D1782 (D844, D845) |
| 111 | Board, ALL AVAIL window | This event earns nobody any OIL. Turn the event back on first. | `EVENT_EARNS_NOBODY` ui/board.ts:62 (raised :1450, 1500, 1515) and a second copy, literal, ui/AvailWindow.tsx:289 | Tap a man on an event switched off | REFUSED | D838, D843 (N12) |
| 112 | Board | Ranger earns nothing from VIPER 1 | `oilPersonSays` ui/oilmode.ts:1098 → `${cs} earns nothing from ${name}` · raised ui/board.ts:1455 (the window writes the same words in its footer, not a note) | Tap a man in OIL Earn (off) | DONE | |
| 113 | Board | Ranger earns OIL from VIPER 1 again | `${cs} earns OIL from ${name} again` · same | Tap again (on) | DONE | |
| 114 | Board | SDO earns nobody any OIL | `${nm} earns nobody any OIL` · ui/board.ts:1527 | Tap an item's switch in OIL Earn (off) | DONE | |
| 115 | Board | SDO earns OIL again | `${nm} earns OIL again` · ui/board.ts:1527 | Tap it again (on) | DONE | |
| 116 | Board | Nothing changed for Ranger. This row gives him no working hours to count OIL from. | `inertSays(cs, why)` = `Nothing changed for ${cs}. ${Why}.` · ui/oilmode.ts:718–721; raised ui/board.ts:1500 (via data-oilsay), 1517 (reasons listed below) | Tap a man or placeholder that cannot earn on that row | REFUSED | D1783 |
| 117 | ALL AVAIL window | Only a scheduler can change who earns | literal · ui/AvailWindow.tsx:280 | Tap a man in the window's earning half without rights | REFUSED | |
| 118 | Top bar on Board | Left OIL Earn without undoing. The next undo would change the day itself. | literal · ui/topstate.ts:165 | Undo pressed while OIL Earn is on at its first step | OTHER | D838, D839 |

### Warnings list, history and the changes window

| # | Page / area | The note exactly as seen | Template · file:line | Raised by | Kind | D |
|---|---|---|---|---|---|---|
| 119 | Edit Schedule (warning pills) | No warnings this week ✓ | literal · state/view.ts:830 | Red pill pressed, none | OTHER | |
| 120 | Edit Schedule (warning pills) | Nothing flagged this week ✓ | literal · state/view.ts:830 | Amber pill pressed, none | OTHER | |
| 121 | Edit Schedule, Board | Only a scheduler can hide a warning | literal · ui/interactions.ts:1858 | Hide ✕ on a warning without rights | REFUSED | |
| 122 | Edit Schedule, Board | Warning hidden: no flag, not counted. It returns if the warning changes. | literal · ui/interactions.ts:1873 | ✕ hide a warning | DONE | D838, D839 (N15) |
| 123 | Edit Schedule, Board | Warning flagged again | literal · ui/interactions.ts:1873 | Reset arrow on a hidden warning | DONE | |
| 124 | Edit Schedule (warning list) | Only a scheduler can create a leave war period | literal · ui/interactions.ts:1841 | "Create the period" in a warning, without rights | REFUSED | |
| 125 | Edit Schedule (warning list) | The 2027 leave war period is created. Open its dates for bidding here. | `The ${yr} leave war period is created. Open its dates for bidding here.` · ui/interactions.ts:1845 | Create the period | DONE | |
| 126 | Edit Schedule (warning list) | A leave war already covers part of 2027. Open the Leave War and extend it instead. | literal with `${yr}` · ui/interactions.ts:1849 | Create the period over an existing one | REFUSED | |
| 127 | Edit Schedule (warning list) | The 2027 period could not be created | `The ${yr} period could not be created` · ui/interactions.ts:1851 | Create fails | FAILED | |
| 128 | View-only Sched (changes window, warning tap) | Showing the working draft — the change is on it | literal · ui/interactions.ts:87, 186 | Tap a change / warning on a published day's issued face | OTHER | |
| 129 | Edit Schedule, Board, View-only | That warning is no longer raised on this day | literal · ui/interactions.ts:91 | Tap a warning that has since gone | OTHER | |
| 130 | Changes window | That detail is no longer on this day | literal · ui/interactions.ts:222 | Tap a change whose row was deleted | OTHER | |
| 131 | Changes window | That seat is empty now | literal · ui/interactions.ts:223, 232 | Tap a change on a seat now empty | OTHER | |
| 132 | Changes window | That input is not shown on this day | literal · ui/interactions.ts:225 | Tap a change to an input not drawn there | OTHER | |
| 133 | Changes window | That detail is not shown on this page | literal · ui/interactions.ts:227 | Tap a change this page does not draw | OTHER | |
| 134 | Changes window | That detail is shown on the week, not on the board | literal · ui/interactions.ts:228 | same, on the Board | OTHER | |
| 135 | Changes window | That detail is shown on the scheduler board — open the day there to see it | literal · ui/interactions.ts:229 | same, on Edit Schedule | OTHER | |

### Inputs on the schedule (Personal Inputs, Ground / Common Programme, Unavailable)

| # | Page / area | The note exactly as seen | Template · file:line | Raised by | Kind | D |
|---|---|---|---|---|---|---|
| 136 | Edit Schedule, Board | Only a scheduler can accept inputs | literal · ui/interactions.ts:1045 | Accept / Reject without rights | REFUSED | |
| 137 | Edit Schedule, Board, Inputs | That input is no longer there | literal · ui/interactions.ts:1048, 1388; ui/inputedit.tsx:1962; ui/InputsCal.tsx:1002 | Acting on an input deleted meanwhile | FAILED | |
| 138 | Edit Schedule, Board | Ranger's Training added to the ground programme | `${cs}'s ${inpLabel(inp)} added to the ground programme` · ui/interactions.ts:1151–1162 | Accept | DONE | D731 (5) |
| 139 | Edit Schedule, Board | Ranger's Training is on the ground programme again — its row was already there · Tally came off its row — not in the input; drop him on again to add him | `${cs}'s ${label} is on the ground programme again — its row was already there` + ` · ${names} came off its row — not in the input; drop him on again to add him` · ui/interactions.ts:1155–1156 | Accept where the row already stood | DONE | |
| 140 | Edit Schedule, Board | Ranger's Training taken off the programme | `${cs}'s ${label} taken off the programme` · ui/interactions.ts:1153 | Reject | DONE | D731 (5) |
| 141 | Edit Schedule, Board | Ranger's Training taken off Tuesday's programme | `${cs}'s ${label} taken off ${DAYS[rowDay].dow}'s programme` · ui/interactions.ts:1152 | Reject where its row is on another day | DONE | D731 (5) |
| 142 | Edit Schedule, Board | Ranger's Training taken out of Unavailable | `${cs}'s ${label} taken out of Unavailable` · ui/interactions.ts:1151 | Reject on an Unavailable row | DONE | D731 (5) |
| 143 | Edit Schedule, Board | Ranger's Training filed under Unavailable | `${cs}'s ${label} filed under Unavailable` · ui/interactions.ts:1154 | "Goes to" Unavailable | DONE | |
| 144 | Edit Schedule, Board | Ranger's Training is already on the programme | refusalWords · ui/interactions.ts:1067; raised :1116, 1170 | Accept / put back refused | REFUSED | |
| 145 | Edit Schedule, Board | Ranger's Training is already on the programme — on Tue 21 Jul; load that week to change it | refusalWords · ui/interactions.ts:1069 | same, row in another week | REFUSED | |
| 146 | Edit Schedule, Board | Can't tell whether Ranger's Training already has a row on another week — load that week first | refusalWords · ui/interactions.ts:1068 | same, other week unreadable | REFUSED | |
| 147 | Edit Schedule, Board | Ranger's Training can't be changed here right now | refusalWords · ui/interactions.ts:1070 | same, any other refusal | REFUSED | |
| 148 | Edit Schedule, Board | Only a scheduler can change the LATE marks | literal · ui/interactions.ts:1246 | LATE chip tap without rights | REFUSED | |
| 149 | Edit Schedule, Board | LATE mark hidden. The Inputs page still shows it. | literal · ui/interactions.ts:1262 | LATE chip tap | DONE | |
| 150 | Edit Schedule, Board | LATE mark shown | literal · ui/interactions.ts:1262 | LATE chip tap again | DONE | |
| 151 | Edit Schedule, Board | Only a scheduler can add inputs from here | literal · ui/interactions.ts:1341 | + input from a schedule panel without rights | REFUSED | |
| 152 | Edit Schedule, Board | That day is not loaded | literal · ui/interactions.ts:1345 | same, day not loaded | FAILED | |
| 153 | Edit Schedule, Board | No SANS aircrew on the roster | literal · ui/interactions.ts:1352 | + on the SANS panel with no SANS men | REFUSED | |
| 154 | Edit Schedule, Board | No crew on the roster to file an input for | literal · ui/interactions.ts:1352 | + input with no crew | REFUSED | |
| 155 | Edit Schedule, Board | Only a scheduler can edit inputs from here | literal · ui/interactions.ts:1386 | Open an input from the schedule without rights | REFUSED | |
| 156 | Edit Schedule, Board, Inputs | That row has changed — not swapped | `CHANGED.swap` · ui/oilwait.ts:45; raised :93, 127 | OIL question answered after its row changed | FAILED | |
| 157 | same | That row has changed — not added | `CHANGED.add` · ui/oilwait.ts:46 | same | FAILED | |
| 158 | same | That has changed — not moved | `CHANGED.move` · ui/oilwait.ts:47 | same | FAILED | |
| 159 | same | That input has changed — not put back | `CHANGED.back` · ui/oilwait.ts:48 | same | FAILED | |
| 160 | same | That input has changed — not filed | `CHANGED.file` · ui/oilwait.ts:49 | same | FAILED | |
| 161 | same | That input has changed — not un-cancelled | `CHANGED.uncx` · ui/oilwait.ts:50 | same | FAILED | |
| 162 | same | That input has changed — left as it is | `CHANGED.uninfo` · ui/oilwait.ts:51 | same | FAILED | |
| 163 | Edit Schedule, Board, Inputs | Only a scheduler answers from this list | literal · ui/oilday.ts:46 | The day's OIL list without rights | REFUSED | |
| 164 | Edit Schedule, Board, Inputs | OIL answered for 3 inputs | `n === 1 ? 'OIL answered for 1 input' : 'OIL answered for ${n} inputs'` · ui/oilday.ts:63 | Answer the day's OIL list | DONE | |

### Inputs page, input windows, Inputs calendar, Medical

| # | Page / area | The note exactly as seen | Template · file:line | Raised by | Kind | D |
|---|---|---|---|---|---|---|
| 165 | Inputs (any input window) | Input added | literal · ui/InputWindow.tsx:572, 592, 660 (via `saidSaved` → ui/seen.ts:78/85 — said only when the new card is not in view) | Save a new input | DONE | |
| 166 | Inputs | Input added for 3 people | `Input added for ${howMany(ppl)}` · ui/InputWindow.tsx:572 | Save a new input for several | DONE | |
| 167 | Inputs | Input updated | literal · ui/InputWindow.tsx:572, 630, 660 | Save an edit | DONE | |
| 168 | Edit Schedule, Board (Ground panel's + ) | Input added to the Ground Programme | `Input added to the ${progOf(...)}` ('Ground Programme' / 'Common Programme') · ui/InputWindow.tsx:592; ui/inputedit.tsx:2459 | Save a new input from the ground panel | DONE | D955 (place word) |
| 169 | Edit Schedule, Board | Input filed under Unavailable | literal · ui/InputWindow.tsx:592 | same, filed under Unavailable | DONE | |
| 170 | Inputs | OIL answer saved | literal · ui/InputWindow.tsx:618 | OIL question answered in the input window | DONE | |
| 171 | Inputs, Inputs calendar | Input deleted | literal · ui/InputWindow.tsx:792; ui/InputsCal.tsx:1016; via ui/InputsCal.tsx:987 → ui/MedMoveConfirm.tsx:44 | Delete | DONE | |
| 172 | Inputs, Inputs calendar | Input deleted for 3 people | `Input deleted for ${n}` (howMany) ui/InputWindow.tsx:797; `Input deleted for ${everyoneIn(it)}` ui/InputsCal.tsx:1003 | Delete for everyone | DONE | |
| 173 | Inputs, Inputs calendar | You are out of this input | literal · ui/InputWindow.tsx:822; ui/InputsCal.tsx:1012 | "Take yourself out" | DONE | |
| 174 | Inputs calendar | Moved to 15 Jul | `'Moved to ' + fmtDay(d.start)` · ui/caldrag.ts:175; via :153 → ui/MedMoveConfirm.tsx:43–44 | Drag an input to another day | DONE | |
| 175 | Inputs calendar | Note moved | literal · ui/caldrag.ts:93 | Drag a calendar note | DONE | |
| 176 | Inputs calendar | Only a scheduler can move planning sections | literal · ui/caldrag.ts:94 | Drag a note without rights | REFUSED | |
| 177 | Inputs calendar | Not moved: Ranger was deleted from 20 Jul — take him off the note first | `Not moved: ${p.cs} was deleted from ${d} ${MON} — take him off the note first` · ui/caldrag.ts:88 | Drag a note holding a deleted man | REFUSED | |
| 178 | Inputs calendar | Only a scheduler can move someone else's input | literal · ui/caldrag.ts:114 | Drag another man's one-person input | REFUSED | |
| 179 | Inputs, Inputs calendar | Only Ranger — who filed it — or an admin can change this for everyone | `Only ${cs \|\| 'whoever filed it'} — who filed it — or an admin can ${what}` (what: 'change this for everyone', 'move this for everyone', 'delete this for everyone', 'delete this input') · ui/inputedit.tsx:2029; raised ui/inputedit.tsx:1210, 1973; ui/caldrag.ts:114; ui/InputsCal.tsx:968, 980, 1004 | Change / move / delete a shared input not his | REFUSED | |
| 180 | Inputs | Filing for other people is switched off — an admin can change this. | `FILING_OFF` · ui/inputedit.tsx:2023 (via sharedRefusal) | The filer, with the members' switch off | REFUSED | D731 (8) |
| 181 | Inputs | A scheduler has changed who is in this — ask an admin to change it for everyone | literal · ui/inputedit.tsx:2027 (via sharedRefusal) | Filer changing an input a scheduler re-peopled | REFUSED | D755 (3) |
| 182 | Inputs calendar | Only Ranger or an admin can delete this input | `Only ${cs \|\| 'its owner'} or an admin can delete this input` · ui/InputsCal.tsx:981 | Delete key on another man's input | REFUSED | |
| 183 | Inputs | You can only edit your own inputs | literal · ui/inputedit.tsx:1210 | Member edits another's one-man input | REFUSED | |
| 184 | Inputs | You can only delete your own inputs | literal · ui/inputedit.tsx:1973 | Member deletes another's | REFUSED | |
| 185 | Inputs | Sign in with your own account to file an input | literal · ui/inputedit.tsx:1057 | Save with no person signed in | REFUSED | |
| 186 | Inputs | Filing for other people is switched off — you can file this only for yourself | ui/inputedit.tsx:1030 (fileForOtherRefusal); raised :1065, 1238; ui/peoplepick-model.ts:66, 69 → ui/InputWindow.tsx:681 | Member files for another, switch off | REFUSED | |
| 187 | Inputs | You can file leave only for yourself | `You can file ${what} only for yourself` (what: leave / an upchit / a medical entry / SANS availability / this) · ui/inputedit.tsx:1032; same raisers as 186 | Member files that kind for another | REFUSED | |
| 188 | Inputs | Open this input’s own window to change who is in it | literal · ui/inputedit.tsx:1220 | Re-pointing a several-person input from elsewhere | REFUSED | D837, D839 (N24) |
| 189 | Edit Schedule, Board | An ALL AVAIL input can only be changed in its own window. Open it to change who it is for. | `An ${PEOPLE[from].cs} input can only be changed in its own window. Open it to change who it is for.` · ui/inputedit.tsx:1739 | Drop a man on an ALL AVAIL input's Unavailable row | REFUSED | (paired with 188 by the N24 comment) |
| 190 | Edit Schedule, Board | Unavailable is a real person’s day — ALL AVAIL cannot take it | `Unavailable is a real person’s day — ${cs} cannot take it` · ui/inputedit.tsx:1735 | Drop ALL AVAIL on an Unavailable row | REFUSED | |
| 191 | Inputs | Only a scheduler can move an input to another person | literal · ui/inputedit.tsx:1231 | Member changes the person | REFUSED | |
| 192 | Inputs | A scheduler has moved this input, so only a scheduler can change it to Training | `A scheduler has moved this input, so only a scheduler can change it to ${inpType(draft.type)}` · ui/inputedit.tsx:1247 | Member retypes an input a scheduler moved | REFUSED | |
| 193 | Inputs | That input is no longer there — nothing was saved | literal · ui/inputedit.tsx:1189 | Save on an input deleted meanwhile | FAILED | |
| 194 | Inputs, Edit Schedule | That input is no longer there — nothing was changed | literal · ui/inputedit.tsx:1723; ui/MedMoveConfirm.tsx:36 | Reassign / medical move on a gone input | FAILED | |
| 195 | Inputs | That input was removed while its window was open, so the window has closed | literal · ui/InputWindow.tsx:376 | Someone else deletes it while open | OTHER | |
| 196 | Inputs | Changed while this window was open: people — Hex added, Tally taken off | `'Changed while this window was open: people — ' + what` · ui/InputWindow.tsx:390 | Someone else changes who is in it | OTHER | |
| 197 | Inputs | Choose which to keep first — your change, or the one made while this window was open | literal · ui/InputWindow.tsx:431 | Save while a clash is unresolved | REFUSED | |
| 198 | Inputs | Give the input a start and end time, or tick All day | literal · ui/inputedit.tsx:645 | Save with a time missing | REFUSED | |
| 199 | Inputs | Give the input a start and end that are not the same time | literal · ui/inputedit.tsx:662 | Save with start = end | REFUSED | |
| 200 | Inputs | Pick the date first | literal · ui/inputedit.tsx:670 | Save with the date cleared | REFUSED | |
| 201 | Inputs calendar | Pick a start date on the calendar first | literal · ui/InputWindow.tsx:673 | Save a calendar-made input with no date | REFUSED | |
| 202 | Inputs | The end date has to fall on or after the start date | literal · ui/inputedit.tsx:701 | Save a backwards range | REFUSED | |
| 203 | Inputs | ALL AVAIL is for Training, Meeting, Personal, Appointment, Duty, Event and Other | `${cs} is for ${PLACEHOLDER_KINDS…}` · engine/inputs.ts:824; raised ui/inputedit.tsx:1011; state/store.ts:245 | ALL / ALL AVAIL on another kind | REFUSED | |
| 204 | Inputs | ALL AVAIL is for one day | `${cs} is for one day` · engine/inputs.ts:826; same raisers | ALL AVAIL over several days | REFUSED | |
| 205 | Inputs | ALL AVAIL cannot be filed under Unavailable — that names a real person’s day | `${cs} cannot be filed under Unavailable — that names a real person’s day` · engine/inputs.ts:833; same raisers | ALL AVAIL to Unavailable | REFUSED | |
| 206 | Inputs | A medical entry is filed for one person at a time — each needs its own document | `${An upchit / A medical entry / This} is filed for one person at a time — each needs its own document` · ui/peoplepick-model.ts:63 → ui/InputWindow.tsx:681 | Several people on a medical / upchit | REFUSED | |
| 207 | Inputs | A medical entry is one person’s — each needs its own document | `${An upchit / A medical entry} is one person’s — each needs its own document` · engine/inputs.ts:862 → ui/peoplepick-model.ts:52 → ui/InputWindow.tsx:681 | same (another path) | REFUSED | |
| 208 | Inputs | A medical entry is one person’s own. Take the other people out and save, then change its kind. | literal · ui/InputWindow.tsx:703 | Retyping a several-person input into a medical | REFUSED | |
| 209 | Inputs | An identical row is already on the Ground Programme, so this one was added under Personal Inputs instead | literal · ui/inputedit.tsx:1145 | Save a new input whose row already stands | WARNING | |
| 210 | Inputs (SANS) | SANS Availability is for SANS aircrew only | ui/inputedit.tsx:296 → :711 | File SANS availability for a non-SANS man | REFUSED | |
| 211 | Inputs (SANS) | Tick at least one of Fly / AMT / OFT | ui/inputedit.tsx:297 → :711 | SANS availability with nothing ticked | REFUSED | |
| 212 | Inputs (SANS) | A SANS availability is already filed for one of these days — edit that entry instead of adding another | ui/inputedit.tsx:322 → :713 | Overlapping SANS availability | REFUSED | |
| 213 | Medical | A medical entry stays medical — delete it instead if it was filed in error | literal · ui/inputedit.tsx:677 | Retype a medical to a non-medical kind | REFUSED | |
| 214 | Medical | An upchit stays an upchit — delete it instead if it was filed in error | literal · ui/inputedit.tsx:680 | Retype an upchit | REFUSED | |
| 215 | Medical | Keep at least one document on this entry. Add the replacement before removing the last file. | literal · ui/inputedit.tsx:727 | Remove the last document | REFUSED | |
| 216 | Medical | An ATT C is already filed over these days — edit that entry instead, and attach the new document to it | `${an} ${t} is already filed over these days — edit that entry instead, and attach the new document to it` · ui/inputedit.tsx:343 → :733 | Overlapping downchit | REFUSED | |
| 217 | Medical | An upchit is filed for 15 Jul — edit or delete that entry first | `An upchit is filed for ${hit.date} — edit or delete that entry first` · ui/inputedit.tsx:398 → :738 | Downchit stretched over an upchit | REFUSED | |
| 218 | Medical | An upchit is a single date — pick the day he is medically up | ui/inputedit.tsx:351 → :742 | Upchit with an end date | REFUSED | |
| 219 | Medical | There is no medical-down entry to upchit — file the medical input first | ui/inputedit.tsx:368 → :742 | Upchit with nothing to close | REFUSED | |
| 220 | Medical | That medical-down period is already closed — edit the existing upchit instead | ui/inputedit.tsx:375 → :742 | Second upchit for a closed period | REFUSED | |
| 221 | Medical | An upchit is already filed for that day — edit that entry instead | ui/inputedit.tsx:378 → :742 | Duplicate upchit | REFUSED | |
| 222 | Medical | The statuses you kept cover every day of this entry — nothing left to file | literal · ui/inputedit.tsx:504 | Medical overlap sheet: keep every old status | REFUSED | |
| 223 | Medical, Inputs | No file was chosen | state/docs.ts:91 → ui/InputWindow.tsx:120 | Attach with no file | REFUSED | |
| 224 | Medical, Inputs | That file is not a photo or a PDF | state/docs.ts:92 → ui/InputWindow.tsx:120 | Attach another file type | REFUSED | |
| 225 | Medical, Inputs | That file is over 8 MB — attach a smaller photo or PDF | state/docs.ts:93 → ui/InputWindow.tsx:120 | Attach a big file | REFUSED | |
| 226 | Medical, Inputs (anywhere a document is saved) | Couldn't save that document: your browser storage may be full, so it may not be here after a reload. | literal · boot.ts:59 (grey "Blocked" look, lead "Couldn't save that document:") | The browser refuses to store a document | FAILED | D1665, D1667, D1668 |
| 227 | Inputs, Inputs calendar | Blocked: Ranger is 149's from Thu 16 Jul. Only Ranger or an admin of both 142 and 149 can change leave that runs across his move. | `Blocked: ${cs} is ${numOf(to)}'s from ${noticeDay(d)}. Only ${cs} or an admin of both ${numOf(from)} and ${numOf(to)} can change leave that runs across his move.` · ui/inputedit.tsx:165; raised ui/InputWindow.tsx:691; ui/caldrag.ts:144; ui/inputedit.tsx:1992 | Save / drag / delete leave across a man's move | REFUSED | D2240, D2241 |
| 228 | Inputs, Inputs calendar | Blocked: nothing was kept | `NOT_SAVED` ui/inputedit.tsx:1583, via whoDoorRefusal :147 (same raisers as 227) | Same door, any other refusal by the who-rule | REFUSED | |
| 229 | Inputs, Edit Schedule, Board, Leave War | Blocked: this week was published by an older version of the app, so it can’t be edited. Nothing was saved. | `LOCKED_WEEK_NOTE` engine/publish.ts:142 via `lockedWeekNote()`; raised state/store.ts:230; ui/inputedit.tsx:972, 992, 1126, 1264 | Any input change touching a read-only week | REFUSED | D1785, D1667, D1669 |
| 230 | same | Blocked: this week’s saved copy could not be read, so it can’t be edited. Nothing was saved. Report it with “Report a problem” on the Help page. | `UNREADABLE_WEEK_NOTE` engine/publish.ts:141; same raisers + engine/publish.ts:151 | same, a week that cannot be read | FAILED | D1785, D1667, D1669 |
| 231 | Inputs | OIL decision updated | literal · ui/InputsPage.tsx:447 | The List's "OIL?" answer | DONE | |
| 232 | Inputs (settings) | Give a number of weeks between 1 and 52 | `Give a number of weeks between ${LOOK_MIN} and ${LOOK_MAX}` · ui/InputsPage.tsx:741 | Saving the look-ahead with a bad number | REFUSED | |
| 233 | Inputs (settings) | Everyone now opens on next 4 weeks, to sunday | `Everyone now opens on ${lookaheadLabel(…).toLowerCase()}` · ui/InputsPage.tsx:746 (label engine/lookahead.ts:121) | Saving the look-ahead | DONE | |

### People, Quals and Admin

| # | Page / area | The note exactly as seen | Template · file:line | Raised by | Kind | D |
|---|---|---|---|---|---|---|
| 234 | Quals | You can only edit your own row | `OWN_ROW_ONLY` state/quals-write.ts:45; raised :57, 123 | Member edits another's row | REFUSED | |
| 235 | Quals | Only an admin can change a callsign | `RENAME_ADMIN_ONLY` state/quals-write.ts:46 → :58 | Member renames | REFUSED | D218 (rule) |
| 236 | Quals | Only an admin can tick Management | `MGMT_ADMIN_ONLY` :47 → :61 | | REFUSED | |
| 237 | Quals | Only an admin can appoint a scheduler | `SCHED_ADMIN_ONLY` :48 → :62 | | REFUSED | |
| 238 | Quals, Admin → Users | He is 149's. Only an admin of 149 can change him. | `He is ${num}'s. Only an admin of ${num} can change him.` (account form: `…can change his account.`) · state/accounts.ts:468; raised state/quals-write.ts:56; via UsersPanel `done` | Changing another squadron's man | REFUSED | |
| 239 | Quals, Admin → Users | Only a master admin can do that | `MASTER_ONLY_WORDS` state/accounts.ts:863; raised state/quals-write.ts:60; UsersPanel `done` | Renaming / changing a master admin | REFUSED | |
| 240 | Quals | Ranger needs DAAR before NAAR can be ticked | `${p.cs} needs DAAR before NAAR can be ticked` · state/quals-write.ts:71, raised :118 | Tick NAAR first | REFUSED | |
| 241 | Quals | Ranger needs SC DAY before SC NIGHT can be ticked | `${p.cs} needs SC DAY before SC NIGHT can be ticked` · :76 → :118 | Tick SC NIGHT first | REFUSED | |
| 242 | Quals | Ranger needs the DAAR instructor mark before NAAR can carry one, so the NAAR tick comes off instead | literal with `${p.cs}` · state/quals-write.ts:74 | Third tap of NAAR | WARNING | D838, D839 (N28) |
| 243 | Quals | Ranger — NAAR removed too, it cannot stand without DAAR | `${p.cs} — NAAR removed too, it cannot stand without DAAR` · :100 | Untick DAAR | WARNING | |
| 244 | Quals | Ranger — NAAR instructor mark removed too, it cannot stand without DAAR's | `${p.cs} — NAAR instructor mark removed too, it cannot stand without DAAR's` · :101 | DAAR I → tick | WARNING | |
| 245 | Quals | Ranger — SC NIGHT removed too, it cannot stand without SC DAY | `${p.cs} — SC NIGHT removed too, it cannot stand without SC DAY` · :102 | Untick SC DAY | WARNING | |
| 246 | Quals | Rogue is already taken — callsigns must be unique | `${want} is already taken — callsigns must be unique` · state/quals-write.ts:115 → :118 | Rename to a taken callsign | REFUSED | |
| 247 | Quals, Admin → Users, Welcome back | That did not save | literal · state/quals-write.ts:122; state/roster-add.ts:140 (saidOf); leavewar/sync.ts:3678; ui/UsersPanel.tsx:405 | A people write refused for any other reason | FAILED | |
| 248 | Admin → Users, Welcome back | You are not allowed to do that | state/roster-add.ts:139 (saidOf) | Gate refused as unauthorized | REFUSED | |
| 249 | Quals | Ranger is now Rogue — every puck follows | `${was} is now ${PEOPLE[id].cs} — every puck follows` · ui/QualsPage.tsx:644 | Rename on Quals | DONE | |
| 250 | Quals | SCHED is read by the sign-off drop-downs — SKED CK, PLANNED BY and APPROVED BY. Press REMOVE? to take it off the LoX — who already holds it is kept. | `${c.h} is read by ${WIRED[k]}. Press REMOVE? to take it off the LoX — who already holds it is kept.` · ui/QualsPage.tsx:538 (WIRED :88–93) | First press to remove a column the app reads | WARNING | |
| 251 | Quals | IRT removed from the LoX. Nobody's record changed. Add it back and the ticks return. | `${c.h} removed from the LoX. Nobody's record changed. Add it back and the ticks return.` · ui/QualsPage.tsx:545 | Remove a column | DONE | |
| 252 | Quals | A qualification needs a letter or a number in its name | literal · ui/QualsPage.tsx:563 | Add a column with no name | REFUSED | |
| 253 | Quals | IRT is already on the LoX | `${h} is already on the LoX` · ui/QualsPage.tsx:564 | Add a duplicate column | REFUSED | |
| 254 | Quals | IRT added — tick the people who hold it | `${h.toUpperCase()} added — tick the people who hold it` · ui/QualsPage.tsx:569 | Add a column | DONE | |
| 255 | Quals, View-only Sched | CSV downloaded | literal · ui/QualsPage.tsx:1145; ui/Shell.tsx:611 | Export CSV | DONE | |
| 256 | Quals | Quals saved | literal · ui/QualsPage.tsx:1157 | Done (leave editing) | DONE | |
| 257 | View-only Sched / print | Print dialog opened — choose "Save as PDF" | literal · ui/Shell.tsx:618 | Print / PDF | OTHER | |
| 258 | Admin → Users | Refused viper@mail | `Refused ${r.name}` · ui/UsersPanel.tsx:195 | Refuse an access request | DONE | |
| 259 | Admin → Users | viper@mail can sign in now | `${r.name} can sign in now` · ui/UsersPanel.tsx:217 | Give access (existing person) | DONE | |
| 260 | Admin → Users | Viper added — viper@mail can sign in now | `${a.np.cs.trim()} added — ${r.name} can sign in now` · ui/UsersPanel.tsx:217; add form: `${who} added — ${nm} can sign in now` :515 (name lower-cased) | Give access with a new person / + Add with a sign-in | DONE | |
| 261 | Admin → Users | Viper added to the roster — set flight and quals on the Quals page | `${who} added to the roster — set flight and quals on the Quals page` · ui/UsersPanel.tsx:515 | + Add with no sign-in | DONE | |
| 262 | Admin → Users | Saved | literal · ui/UsersPanel.tsx:319 | Save an account edit | DONE | |
| 263 | Admin → Users | Ranger archived — his sign-in is suspended; his posting out on 20 Jul (SANS) is replaced | `${body.cs} archived` + ` — his sign-in is suspended` + `; his posting out on ${dayMon} (${OUTCOME_WORD}) is replaced` · leavewar/sync.ts:3682–3683 → ui/UsersPanel.tsx:323 | Archive | DONE | |
| 264 | Admin → Users | Ranger deleted | `${callsign} deleted` · ui/UsersPanel.tsx:327, 433 | Delete | DONE | |
| 265 | Admin → Users | Ranger suspended | `${callsign} suspended` · ui/UsersPanel.tsx:345 | Suspend | DONE | |
| 266 | Admin → Users | Ranger can sign in again | `${callsign} can sign in again` · ui/UsersPanel.tsx:345 | Enable | DONE | |
| 267 | Admin → Users | Ranger can sign in now | `${callsign} can sign in now` · ui/UsersPanel.tsx:353 | Give an existing person a sign-in | DONE | |
| 268 | Admin → Users | Ranger restored — he can sign in, and he'll be asked to check his quals and CAT | `${want} restored — ${a ? 'he can sign in, and ' : ''}he'll be asked to check his quals and CAT` · ui/UsersPanel.tsx:409 | Restore an archived man | DONE | |
| 269 | Admin → Users | Renamed Rogue | `Renamed ${want}` · ui/UsersPanel.tsx:416 | Rename an archived man | DONE | |
| 270 | Admin → Users | (refusal family — each said as an amber note by `done()`) Only an admin can add an account · Only an admin can change an account · That account is gone · Pick member or admin · Only an admin can approve a request · That request is gone · Only an admin can decline a request · Only an admin can add a person · Type the sign-in name (the defence mail address) · A sign-in name is at most N characters · viper@mail already has an account · Pick the callsign or name this account belongs to · Ranger already has an account (ranger@mail) · Ranger is archived — restore him on Admin → Users first · Type the callsign or name · Initials are at most N letters · Pick pilot, WSO or personnel · Pick the CAT · At least one admin must keep access · At least one admin of 142 must keep access · Saber is 142's last admin. Make another admin of 142 first. · Saber is 142's last admin from Mon 20 Jul, when Hex moves to 149. Only a master admin or an admin of 142 can make another. · This sign-in holds a right in 149. Only a master admin can link it to another person. · Saber is a master admin, so he can't be deleted · Only an admin can delete someone · Only an admin can archive someone · That person cannot be archived · That person has been deleted · Ranger is already archived · The week of 13/07/2026 can't be changed — the delete was not made · The week of 13/07/2026 can't be read — the delete was not made | state/accounts.ts:408–446, 545–607, 676–707, 848–863, 976–996; state/roster-add.ts:99–109; state/person-delete.ts:497, 158–185; leavewar/sync.ts:3615–3624; raised ui/UsersPanel.tsx:70 | Each Admin → Users button refused | REFUSED | |
| 271 | Welcome back card | (same gate words as 247 / 248, or the gate's own message) | state/accounts.ts:795 (saidOf) → ui/WelcomeBack.tsx:25 | "Check my quals" / "Later" refused | FAILED | |
| 272 | Admin → Data | No old clutter in that period | prop `zero` · ui/AdminPage.tsx:84, 91 (text :312) | Clear old clutter…, nothing to clear | OTHER | |
| 273 | Admin → Data | No edits on record in that period | prop `zero` · ui/AdminPage.tsx:84, 91 (text :338) | Clear edit history…, nothing | OTHER | |
| 274 | Admin → Data | Cleared 3 items | `Cleared ${n} ${unit}` (item/items, entry/entries) · ui/AdminPage.tsx:91 | Second tap of Clear | DONE | |

### Logic

| # | Page / area | The note exactly as seen | Template · file:line | Raised by | Kind | D |
|---|---|---|---|---|---|---|
| 275 | Logic | Crew rest must be between 8h and 16h | `${spec.t} must be between ${ruleFmt(lo)} and ${ruleFmt(hi)}` · ui/LogicPage.tsx:341 | A setting out of bounds | REFUSED | |
| 276 | Logic | A shift against a flight is now a Warning | `A shift against ${KIND_LABEL[k]} is now ${'a Warning' / 'an Advisory'}` · ui/LogicPage.tsx:354 (labels engine/rules.ts:176) | A shift-severity box ticked | DONE | |
| 277 | Logic | Editing rules — the schedule rechecks as you type | literal · ui/LogicPage.tsx:441 | ✎ Edit | OTHER | |
| 278 | Logic | 3 rules back to squadron standard | `${n} rule${n > 1 ? 's' : ''} back to squadron standard` · ui/LogicPage.tsx:451 | Reset to standard | DONE | |

### Top bar, bell, Undo / Redo, Help (anywhere)

| # | Page / area | The note exactly as seen | Template · file:line | Raised by | Kind | D |
|---|---|---|---|---|---|---|
| 279 | Anywhere (bell) | 2 waiting for access — opening Admin → Users | `${n} waiting for access — opening Admin → Users` · ui/topstate.ts:54 | Bell tap with requests waiting | OTHER | |
| 280 | Anywhere (bell) | 1 new bug report | `${n} new bug report${n === 1 ? '' : 's'}` · ui/topstate.ts:59 | Bell tap with new reports | OTHER | |
| 281 | Anywhere (bell) | Weekend/PH work — confirm your OIL | literal · ui/topstate.ts:76 | Bell tap with his OIL question waiting | OTHER | |
| 282 | Anywhere (bell) | Notifications cleared | literal · ui/topstate.ts:83 | Bell tap that clears the alert | DONE | |
| 283 | Anywhere (bell list) | That input is gone | literal · ui/topstate.ts:125 | Tap a bell line whose input was deleted | FAILED | |
| 284 | Anywhere (top bar) | Undid: Ranger planned on VIPER 1 | `${'Undid' / 'Redid'}: ${entry.label}` · undo/describe.ts:539–548; raised undo/timeline.ts:1182, 1211 → state/undo-wire.ts:601 | Undo / Redo | DONE | |
| 285 | Leave War (top bar) | Undid: closing bidding 1 Apr – 30 Apr — those days are open again for everyone | `${head} — those days are ${open/closed} ${'again '}for everyone` · undo/describe.ts:544 | Undo / Redo of opening or closing dates | DONE | (D352, D1177 named in the comment) |
| 286 | Anywhere (top bar) | Undid: Training filed — the later posting stays; it isn’t undone here. | `bubbleText + ' — the later ${what} stays; it isn’t undone here.'` (posting / delete / archive / restore / change to a person) · undo/timeline.ts:1182 | Undo that skipped a step it cannot take | WARNING | |
| 287 | Anywhere (top bar) | (Undo / Redo refusals, each an amber note via ui/topstate.ts:166, 168) Nothing to undo. · Nothing to redo. · Adding, archiving or restoring a person, and a posting, aren’t undone here — use Restore, Delete or the posting sheet’s own Undo. A delete is final. · You can’t undo that — it was someone else’s change. · You can’t redo that — it was someone else’s change. · Switch back to the admin view to undo that. · You can’t undo that while filing for other people is switched off — the person it was filed for, or an admin, can change it. · Something else changed this after your action — it can’t be undone now. · The app changed this after your action — it can’t be undone now. · The app changed this after your action (a posting out ran) — it can’t be undone now. · You changed this somewhere else after this action — it can’t be undone now. · Hex changed this after your action — it can’t be undone now. · A day on this week was published after that change — tap Unpublish on that day first, or edit its working copy. · A later change touches the same thing and can’t be undone. · A later change touches the same thing — undo that first. · A later change to a person (added, archived, restored or posted) touches the same thing, so this can’t be undone — change it back by hand. · An earlier undone change touches the same thing and can’t be redone. · An earlier undone change touches the same thing — redo that first. · A later change touches the same thing — it can’t be redone over. · That change is on the saved copy of this week. Open a different week first, then undo it. · Bidding is closed on that day, so your bid can’t go back on it. · That couldn’t be completed just now — something else changed on this week. · That couldn’t be completed just now. · Can’t undo that — Hex’s ATT C now holds 14 Jul, and a bid can’t go over it. · Can’t undo that — Ranger posts out on 20 Jul, so leave from that day can’t be approved · Ranger is 149's from Thu 16 Jul, so this can't go back into 142's Leave War. · Ranger has been deleted — that change can't be undone · Rogue is taken on the roster now — rename one of them first. · Ranger is on the schedule, an input or the Leave War — take him off first. · That would leave an account unreadable — it can’t be undone now. · That would give the sign-in name viper@mail two accounts — it can’t be undone now. · That would give Ranger two accounts — it can’t be undone now. · That account’s person is no longer on the roster — it can’t be undone now. · and any sticky one with ` Press Undo again for: <label>.` added | undo/timeline.ts:564–572, 811–931, 1031–1047, 1073, 1127–1150, 1188; leavewar/state/store.ts:3539; leavewar/sync.ts:654, 3600; state/person-delete.ts:423, 439; state/roster-restore.ts:90, 96; state/accounts.ts:921–927 | Undo / Redo refused | REFUSED | D148 (whose step), D350 (not undone here), D1263 (bidding closed) — named in comments |
| 288 | Help | Describe the problem first — a sentence is plenty | literal · ui/HelpPage.tsx:72 | Send a report with no text | REFUSED | |
| 289 | Help | Report sent — thank you | literal · ui/HelpPage.tsx:74 | Send a report | DONE | |
| 290 | Edit Schedule, Board (blue/red question) | That mission-role question is no longer current. Select Remarks to try again. | literal (or the command's own message) · ui/mission-role-offer.ts:167 | Blue / Red pressed on a stale question | FAILED | |

### Leave War (raised by the Leave War's rules, on whichever page made the change)

| # | Page / area | The note exactly as seen | Template · file:line | Raised by | Kind | D |
|---|---|---|---|---|---|---|
| 291 | Inputs (filing leave), Leave War | Ranger is on ATT C on 14 Jul (08:00–10:00) — leave can't go over a medical | `${cs} is on ${type} on ${dm(d)}${at ? ' (' + at + ')' : ''} — leave can't go over a medical` · leavewar/inputgate.ts:216, said :70 | Leave filed over a medical | REFUSED | |
| 292 | Inputs, Leave War | Ranger already has LL on 14 Jul — OML can't overlap it | `${cs} already has ${type} on ${dm(d)}${at} — ${mine} can't overlap it` · leavewar/inputgate.ts:217 | Two absences that cannot share a day | REFUSED | |
| 293 | Inputs, Medical | Ranger's LL on 14 Jul–16 Jul is cut for the ATT C — that leave goes back to the balance | `${cs}'s ${type} on ${span} is cut for the ${med.type} — that leave goes back to the balance` · leavewar/inputgate.ts:186, said :404 | A medical filed over leave | WARNING | |
| 294 | Inputs | Ranger is recorded as working 08:00–17:00 on 18 Jul — this LL is filed anyway and flagged for someone to resolve | `${cs} is recorded as working ${at }on ${dm(d)} — this ${type} is filed anyway and flagged for someone to resolve` · leavewar/inputgate.ts:261, said :404 | Leave filed over earned work | WARNING | |
| 295 | Inputs | This replaces your LL (AM) bid on 10 Feb on the Leave War | `This replaces ${list} on the Leave War`, each `${'your' / cs + "'s"} ${code}${' (AM)'/' (PM)'} bid on ${dm(d)}` · leavewar/inputgate.ts:336, 397, said :404 | An input filed over a leave bid | WARNING | D1525 (the AM / PM) |
| 296 | Edit Schedule, Board (publish of a weekend / PH) | Saturday 18 Jul: the SDO desk has no usable times, so nobody on it earns OIL | `${when}: ${desks} no usable times, so nobody on it earns OIL` · leavewar/sync.ts:2457; said :2534 (fused with row 2 when in one press) | Publishing a weekend with a blank desk | WARNING | D837 (N1) |
| 297 | same | Saturday 18 Jul earned nobody any OIL — the SDO desk has no usable times | `${when} earned nobody any OIL — ${desks} no usable times` · leavewar/sync.ts:2458 | same, nobody earns at all | WARNING | |
| 298 | same | Saturday 18 Jul: Ranger’s Training has no OIL answer, so nobody on it earns OIL | `${named} has no OIL answer, so nobody on it earns OIL` / `${which} have no OIL answer, so nobody on them earns OIL` (who: `Ranger’s Training`, `Ranger and Hex’s Training`, `Training for 3 people`, `Training for ALL AVAIL`, `4 inputs`) · leavewar/sync.ts:2485–2487, :2513 | Publishing with an input's OIL question unanswered | WARNING | D2294, D2299, D2314 |
| 299 | same | there is no leave war period for 2026, so no OIL can be earned for this day — create the period on the Leave War | literal with `${iso.slice(0,4)}` · leavewar/sync.ts:2545 (shown alone it starts with a small "t") | Publishing a weekend no period covers | WARNING | D19 |
| 300 | same | Ranger's LL bid on 18 Jul now sits on published work — the day is flagged, the bid is still live | `${list} now sits on published work — the day is flagged, the bid is still live` · leavewar/sync.ts:2556 | Publishing work over a leave bid | WARNING | |
| 301 | Anywhere (a posting out runs) | Ranger is the last admin who can sign in — the posting waits until another admin can | literal with `${body.cs}` · leavewar/sync.ts:2869, said via tellOnce :2823 | A posting held | WARNING | |
| 302 | same | Ranger is 142's last admin. The posting waits until 142 has another admin. | leavewar/sync.ts:2870 | same | WARNING | |
| 303 | same | Ranger is the last admin who can sign in — he is not deleted until another admin can | leavewar/sync.ts:3328 | A Delete posting held | WARNING | |
| 304 | same | Ranger is 142's last admin. He is not deleted until 142 has another admin. | leavewar/sync.ts:3329 | same | WARNING | |
| 305 | same | Saber is a master admin, so he can't be deleted | state/accounts.ts:850 via leavewar/sync.ts:3325 | A Delete posting on a master | WARNING | |
| 306 | same | The week of 13/07/2026 can't be changed — the delete was not made | state/person-delete.ts:163, 181 via leavewar/sync.ts:2872 | Delete posting blocked by a read-only week (also an Admin → Users refusal, row 270) | WARNING | |
| 307 | same | The week of 13/07/2026 can't be read — the delete was not made | state/person-delete.ts:176, 183 | same, unreadable week | WARNING | |
| 308 | Anywhere | You have been deleted by your posting out — please sign out | literal · leavewar/sync.ts:3024, 3218 | His own Delete posting ran while he is signed in | WARNING | |
| 309 | Leave War (figure box) | Blocked: Dice LVE App bal. Locked by admin. | `${BLOCKED}: ${label}.` or `${BLOCKED}: ${label}. ${why}.` · leavewar/ui/BalancesPage.tsx:214 | A figure box taken away with an unsaved figure that is refused | REFUSED | D1667, D1668 |
| 310 | Leave War (bid window) | 1 day filed. 12 Feb 27 already holds an OD — left as it is. | `${done} day${s} filed. ${why}.` (why: `${date} already holds an OD — left as it is` / `${date} is on a locked week — not filed` / `This change could not be saved.` / `${n} day(s) was/were not yours to change`) · leavewar/sync.ts:808–811 → leavewar/ui/BidPicker.tsx:532 | Course / OD / Other / Attach filed over days where some were left out | WARNING | |

### Tracker (its own hint-bar flash, `flashHint`)

| # | Page / area | The note exactly as seen | Template · file:line | Raised by | Kind | D |
|---|---|---|---|---|---|---|
| 311 | Tracker (chart layout) | Now click the crossing line to merge. | `'Now click the crossing line to ' + tool + '.'` (merge / unmerge) · tracker/app/core.js:2638 | Merge tool, first line picked | OTHER | |
| 312 | Tracker | Linked F1 → F2, F2 → F3 | `'Linked ' + made.join(', ')` · tracker/app/core.js:2955, 3619 | Finishing a line that links events | DONE | |
| 313 | Tracker | Line drawn. Loose ends stay unlinked until you connect them. | literal · tracker/app/core.js:2955 | Finishing a line that links nothing | DONE | |
| 314 | Tracker | Line deleted — any prerequisites it created are removed with it. | literal · tracker/app/core.js:2966 | Delete a line | DONE | |
| 315 | Tracker | A link can’t start and end on the same event. | literal · tracker/app/core.js:3033, 3042 | Reconnect a line end to its own start | REFUSED | |
| 316 | Tracker | That link already exists. | literal · tracker/app/core.js:3034, 3043 | Duplicate link | REFUSED | |
| 317 | Tracker | That would create a loop. | literal · tracker/app/core.js:3035, 3044 | Circular link | REFUSED | |
| 318 | Tracker | Drag either end (orange) onto a blue point to reconnect, or drag the blue square to bend. | literal · tracker/app/core.js:3487 | Select a line with Edit lines | OTHER | |
| 319 | Tracker | Bend added — drag the blue square to shape it. | literal · tracker/app/core.js:3545 | Double-click a line | DONE | |
| 320 | Tracker | End connected. | literal · tracker/app/core.js:3619 | Drop a line end on a port, nothing linked | DONE | |
| 321 | Tracker | End left loose — nothing linked yet. | literal · tracker/app/core.js:3619 | Drop a line end in space | DONE | |
| 322 | Tracker | Now click where it ends — on a ball port, on another line, or in empty space to leave it loose. Loose ends (amber dots) are junction points — other lines snap onto them, and everything meeting there flows top to bottom. | literal · tracker/app/core.js:3641 | Line tool, first click | OTHER | |
| 323 | Tracker | 4 selected — drag any one of them to move the group. | `sel.size + ' selected — drag any one of them to move the group.'` · tracker/app/core.js:4324 | Box-select balls | DONE | |
| 324 | Tracker | No students on this chart yet — add one with + Add in the Students card to start marking. Event details: ☰ Show All → Edit. | literal · tracker/app/core.js:4929 | Tap an event with no student | REFUSED | |
| 325 | Tracker | “F3” is marked N.A., so it cannot be failed. | `'“' + popId + '” is marked N.A., so it cannot be failed.'` · tracker/app/core.js:5095 (also shown in the event's pop) | Fail on an N.A. event | REFUSED | |
| 326 | Tracker | Empty sheet ready — Syllabus ✎ → Edit chart layout, then use + Flight / + Acad / + Test / + Sim / + CFT/IAT/EPT to add events. | literal · tracker/app/core.js:6270 | New empty syllabus | DONE | |
| 327 | Tracker | Arrow at the finish end. Linked F1 → F2 | `where` ('Arrow at the finish end.' / 'Arrow at the start end.' / 'No arrow — using the direction it was drawn in.') + optional ` Linked …` · tracker/app/core.js:6510 | Arrow button on a selected line | DONE | |
| 328 | Tracker | Select a line first — Line or Edit lines, then click the line. | literal · tracker/app/core.js:6512 | Arrow button with no line | REFUSED | |
| 329 | Tracker | All balls selected — change the Font box to resize their labels. | literal · tracker/app/core.js:6518 | Select all | DONE | |
| 330 | Tracker | Selection cleared. | literal · tracker/app/core.js:6518 | Select all again | DONE | |

(tracker/app/core.js:3785 only puts back a hint that was showing, after an undo — no words of its own.)

### Dead or unreachable

| # | Page / area | The note | Template · file:line | Raised by | Kind | D |
|---|---|---|---|---|---|---|
| 331 | — (no caller in the app) | Nothing to undo / Undo / Nothing to redo / Redo | literal · state/history.ts:148, 149 | The old undo; the top bar now uses the one Undo (row 284/287) — kept only as an export | OTHER | |

---

## Reasons that fill a slot

**Row 87 — the seat reasons after "Ranger — "** (engine/avail.ts `slotBarNow`, engine/slots.ts:137, engine/inputs.ts:681 `offWord`):
`cannot crew a jet; name the people flying it` · `ground crew — rear seat only, cannot fly front seat` · `WSO — cannot fly front seat` · `CAT IW — a WSO category, cannot fly FCP` · `not SC DAY current` / `not SC NIGHT current` · `already on SIM 1 08:00–10:00` · `crew rest — not clear until 03:00` · `on SDO 07:00–17:00 — inside this shift` · `not DAAR current` · `<absence words>` e.g. `annual leave (LL) — Bali`, with ` (tomorrow)`, ` (yesterday)`, ` (overnight)` · `SANS — no availability filed for today` · `SANS — not offering Fly` · `SANS — available 08:00–12:00 only` · plus the row-twice words (row 88).

**Row 116 — the reason after "Nothing changed for Ranger."** (ui/oilmode.ts:697–745, 960, 691–693): `This row gives him no working hours to count OIL from.` · `No OIL worked out — this row has no end time.` · `His Training on Jul 13 is cancelled, so nothing is earned from it.` · `His Training on Jul 13 is information only, so nothing is earned from it.` · `His Training's row has been taken off the programme, so nothing is earned from it.` · `His Training's row is in a week that cannot be read, so nothing is earned from it until that week is opened.` · `The people behind it are switched in the window its count opens.` · `Leave earns no OIL.` · `A medical request earns no OIL.` · `A Personal request earns no OIL.`

---

## (a) Notes longer than 15 words (in the realistic form)

6, 9, 10, 12, 13, 14, 16, 26, 27, 49, 50, 57, 75, 93, 101, 106, 116 (most of its reasons), 139, 145, 146, 189, 197, 206, 208, 209, 212, 215, 216, 226, 227, 229, 230, 242, 250, 263, 268, 270 (several members), 287 (several members), 293, 294, 296, 298, 299, 300, 301, 303, 322, 324, 326 — 49 rows. Row 90 also runs past 15 whenever the warning it repeats is long.

## (b) Notes joined by a dash "—", a semicolon, or brackets

**A dash between two thoughts:** 8, 19, 29, 30, 31, 32, 33, 34, 35, 36, 37 (two dashes), 47, 50, 58, 69, 85, 87, 88, 89, 90, 93, 99, 104, 105, 128, 135, 139, 145, 146, 156, 157, 158, 159, 160, 161, 162, 179 (a dash pair), 180, 181, 186, 190, 193, 194, 196, 197, 205, 206, 207, 212, 213, 214, 216, 217, 218, 219, 220, 221, 222, 225, 243, 244, 245, 246, 250 (two), 254, 260, 261, 263, 268, 270 (several members), 279, 281, 285, 286, 287 (most members), 288, 289, 291, 292, 293, 294, 297, 299, 300, 301, 303, 306, 307, 308, 310, 314, 319, 321, 322 (two), 323, 324, 326, 327 (its "No arrow —" form), 328, 329 — 103 rows.

**A semicolon:** 145, 263, 286.

**Brackets:** 87 (the absence reasons' "(tomorrow)", "(AM)"), 90 ("(+1 more)", and the warnings' own "(step 12:00, T/O 13:00)"), 263 ("(SANS)"), 270 ("(the defence mail address)", "(ranger@mail)"), 287 ("(added, archived, restored or posted)", "(a posting out ran)"), 291 ("(08:00–10:00)"), 295 ("(AM)"), 322 ("(amber dots)").

**Also joined by the middle dot " · "** (not asked, same habit): 6, 88, 104, 139, every batch join (ui/toast.ts:55) and the Leave War's publish lines (296–300 when more than one is said).

## (c) The same kind of thing said in different words

1. **"Only a scheduler can …" vs "Only an admin can …" vs other forms of "you may not":**
   "Only a scheduler can accept inputs" (136) · "Only a scheduler can add inputs from here" (151) · "Only a scheduler can edit inputs from here" (155) · "Only a scheduler can change the LATE marks" (148) · "Only a scheduler can edit In-time" (68) · "Only a scheduler can hide a warning" (121) · "Only a scheduler can change this" (74) · "Only a scheduler can create a leave war period" (124) · "Only a scheduler can move planning sections" (176) · "Only a scheduler can move someone else's input" (178) · "Only a scheduler can move an input to another person" (191) · "Only a scheduler can change who earns" (117) · "Only a scheduler answers from this list" (163) · "Only an admin can change a callsign" (235) · "Only an admin can tick Management" (236) · "Only an admin can appoint a scheduler" (237) · "Only a master admin can do that" (239) · "You are not allowed to do that" (248).
2. **"Not a time":** "2560 is not a time. Try 0900 or 09:00." (18) · "That is not a time — try 0900 or 09:00" (19).
3. **"Already in that seat":** "Ranger — already in that seat" (85, tap) · "Already in that seat" (86, drag).
4. **The input has gone:** "That input is no longer there" (137) · "That input is no longer there — nothing was saved" (193) · "That input is no longer there — nothing was changed" (194) · "That input is gone" (283) · "That input was removed while its window was open, so the window has closed" (195).
5. **A plan / version has gone:** "That plan is no longer available" (17) · "That version is no longer available" (15).
6. **A save that did not happen (generic):** "This change could not be saved." (94) · "Couldn’t save that — try again" (95) · "That did not save" (247) · "Blocked: nothing was kept" (228) · "That couldn’t be completed just now." (287) · "That day can’t be unpublished right now." (11) · "The 2027 period could not be created" (127).
7. **Only your own:** "You can only edit your own row" (234) · "You can only edit your own inputs" (183) · "You can only delete your own inputs" (184) · "You can file leave only for yourself" (187).
8. **Who may change a shared input:** "Only Ranger — who filed it — or an admin can change this for everyone" (179) · "Only Ranger or an admin can delete this input" (182) · "A scheduler has changed who is in this — ask an admin to change it for everyone" (181).
9. **The members' switch is off (two wordings of one fact):** "Filing for other people is switched off — an admin can change this." (180) · "Filing for other people is switched off — you can file this only for yourself" (186) · and in the Undo list "You can’t undo that while filing for other people is switched off — the person it was filed for, or an admin, can change it." (287).
10. **A medical is one person's:** "A medical entry is filed for one person at a time — each needs its own document" (206) · "A medical entry is one person’s — each needs its own document" (207) · "A medical entry is one person’s own. Take the other people out and save, then change its kind." (208).
11. **"Change who is in it in its own window":** "Open this input’s own window to change who is in it" (188) · "An ALL AVAIL input can only be changed in its own window. Open it to change who it is for." (189).
12. **The event's OIL is off — the same words typed twice in two files:** `EVENT_EARNS_NOBODY` (ui/board.ts:62) and a literal copy in ui/AvailWindow.tsx:289 (row 111). Same words today; two homes.
13. **Removed rows:** "Line removed — …", "Wave removed — …", "Note removed — …", "Item removed — …", "Duty block removed — …", "Duty row removed — …", "Sim row removed — …", "Ground item removed — …", "Ground item removed — back under Personal Inputs — …" (29–37) · and "Ranger removed" (92), "TGP removed from the list. …" (75), "IRT removed from the LoX. …" (251), "Line deleted — any prerequisites it created are removed with it." (314) · and deletes say "deleted": "Input deleted" (171), ""Weekday flying" template deleted" (53), ""Plan B" plan deleted" (61), "All day templates deleted" (52), "Ranger deleted" (264), "Wave templates cleared" (55).
14. **Nothing to do:** "Already in order" (45) · "No changes to publish on Monday" (4) · "All signed — no changes to publish right now" (8) · "No warnings this week ✓" (119) · "Nothing flagged this week ✓" (120) · "No old clutter in that period" (272) · "No edits on record in that period" (273) · "Monday is already at the Original." (14) · ""Plan B" is already the live Monday" (56).
15. **Stale question / tap:** "That warning is no longer raised on this day" (129) · "That detail is no longer on this day" (130) · "That mission-role question is no longer current. Select Remarks to try again." (290) · "That row has changed — not swapped" and its six siblings (156–162).
16. **Last admin (two shapes in two places):** "At least one admin must keep access" / "Saber is 142's last admin. Make another admin of 142 first." (270) · "Ranger is the last admin who can sign in — the posting waits until another admin can" (301) · "Ranger is 142's last admin. The posting waits until 142 has another admin." (302) · "Ranger is the last admin who can sign in — he is not deleted until another admin can" (303).
17. **Week locked (old app) — the day form and the week form:** "Monday is locked. It was published by an older version of the app, so it can’t be amended here." (7) · "Blocked: this week was published by an older version of the app, so it can’t be edited. Nothing was saved." (229) · "The week of 13/07/2026 can't be changed — the delete was not made" (306).
18. **Leave can't overlap:** "Ranger is on ATT C on 14 Jul (08:00–10:00) — leave can't go over a medical" (291) · "Ranger already has LL on 14 Jul — OML can't overlap it" (292) · "An ATT C is already filed over these days — edit that entry instead, and attach the new document to it" (216) · "A SANS availability is already filed for one of these days — edit that entry instead of adding another" (212) · "An upchit is already filed for that day — edit that entry instead" (221).
19. **The CX / cancel reason and the store / qual name refusals — three lists, three wordings of "needs a name":** "A store needs a letter or a number in its name" (76) · "A store needs a name" (78) · "A qualification needs a letter or a number in its name" (252) · "A cancel reason needs some text" (80) · "A plan needs a name" (60) · and of "already there": "TGP is already the name of another store" (79) · "WX is already on the list" (82) · "IRT is already on the LoX" (253) · "Another plan on this day already has that name" (59) · "Rogue is already taken — callsigns must be unique" (246).

---

## Related, not counted (offers with buttons, not passing notes)

- "Use this section order as the default for every day?" · Set as default · Not now — ui/SecDefaultSnackbar.tsx:57
- "<event name> deleted" · Undo — leavewar/ui/EventsSheet.tsx:267–268

## Scope notes

- Row 90 (a drop that raises a warning) speaks the warning list's own line, so every warning the rules engine writes can appear in a passing note; those words belong to the warning-list review ([WARN-WORDS-STANDALONE]) and are not repeated here.
- Rows 270 and 287 gather families whose members are raised through one shared door (`done()` on Admin → Users; the top bar's Undo / Redo). Each member was read at its source; a few deeper gate messages that only arrive as "the command's own message" (`r.message`) are not separately listed.
- Row 94's words also reach the person through the Leave War bid window (row 310's third reason) and an account command (state/accounts.ts:659).
- The Leave War pages themselves raise only rows 309 and 310; every other Leave War note is raised by its rules while another page (Inputs, publish, a posting) makes the change.
