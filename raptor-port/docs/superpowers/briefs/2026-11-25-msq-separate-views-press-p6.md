# [MSQ-PICK-GUARD] separate squadrons, separate views (his D2622) — presser P6's report (chat 175, 25 Nov 26)

Brief: `2026-11-25-msq-separate-views-press-brief.md`, checked against the code read `…-separate-views-rollcall-code.md`
(rows A2–A13, C). Today's app at 4700; nothing under `src` changed, nothing committed or pushed. Desktop Chromium
1536×864 (d), phone WebKit 402×874 touch (p). "Pick" means the top-bar picker on d and ☰ → its squadron list on p.
Every fact comes from a `FACT` line in `raptor-port/.tmp/n175/p6/<case>-<size>.log`. I opened every deciding picture
(in `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q2/today/`, each with its `-crop`).
People: Saber is the master admin, home 142. Hunter is an admin of 142 and gets Plan or View of 149 in each set-up.
Kestrel is 149's own admin. Osprey is a member of 149. Ranger is a member of 142.

## Already pressed: not pressed again
- **A1:** P5 N2, pictures `p5-n2-{d,p}-1-calendar`, `-2-list`, `-3-opened`.
- **A5:** P5 N4, pictures `p5-n4-{d,p}-1-bell-list`, `-2-after-line`.
- **A6:** P4 1a and 1b, pictures `p4-undoa-{d,p}-1-on149`, `-2-on142`, `p4-undob-{d,p}-1-back142`.
- **A9 for a View holder:** P5 N3, pictures `p5-n3-welcome-{d,p}-1-before-press`, `-2-after-press`.

## The cases

| Case · size | What he pressed | What the screen said and did (its own words) | Which squadron's record changed | Deciding picture | Verdict |
|---|---|---|---|---|---|
| A2 · d, p | Hunter (Plan of 149) picks 149 → Inputs → List → "+ Input" → Duty, Thu 10 Dec, "n175 p6 A2" → Add | The "New input" window opens with Person **Hunter**. The box offers Hunter, then 149's ten men. Save: the window closes, nothing is said, and the bar stays 149. | **142's**: the input carries no squadron stamp, so it is filed in his home squadron. The edit-history line reads "Hunter · Duty added · 10 Dec". The input is then listed on **both** 149's List and 142's List. | `p6-a2-{d,p}-1-window`, `-2-lists` | **Confirmed**, and it also shows on 149's list |
| A3 · d, p (sans) | Set-up: Saber ticks Hunter's SANS on 142's Quals ("Quals saved") and gives him Plan of 149. Hunter picks 149 → Inputs → SANS → Thu 26 Nov → "+ Commitment" → Add | The window "New input · Nov 26" opens with Person **Hunter**, and the box offers **only Hunter**. Toast: "Input added". 149's day window still reads "SANS committed to fly 0 0 … No commitments yet." | **142's**: a SANS Availability input with no stamp. 26 Nov reads F 1 on 142's SANS calendar and F 0 on 149's. It is on neither Inputs List. | `p6-a3-sans-{d,p}-1-window`, `-2-after-save` | **Confirmed** |
| A3 · d, p (not SANS) | The same, with Hunter not SANS-qualified | The Person box is **blank** and offers no one (149 has no SANS men in the demo). Add says "SANS Availability is for SANS aircrew only", and the window stays open. | Nothing | `p6-a3-nosans-{d,p}-1-window` | Code read's "149's first SANS man" branch: there is none in the demo, so the box is empty |
| A4 · d, p | Hunter (Plan of 149) has an unanswered OIL question on his 142 Duty of Tue 8 Dec (stand-in below). He picks 149, sees the bell lit, and taps it. | **No switch to 142.** The bar stays **149** and the page turns to Inputs. Toast: "Weekend/PH work — confirm your OIL". The window "Hunter · 8 Dec" opens with "OIL: Hunter, Duty … Does it deserve FO, a full day of OIL? Yes: credit FO · No OIL · Back · Save". He presses "Yes: credit FO", then Save → "OIL answer saved", and the bar is still 149. | **142's** input: OIL for 8 Dec = 1. Edit history: "Hunter · Duty 8 Dec · OIL: not asked → earns OIL". | `p6-a4-{d,p}-1-after-bell` | **Confirmed** (through the stand-in) |
| A7 · d | Lines of both squadrons are put in the bells by presses (Hunter and Saber change remarks on inputs the other one filed; Kestrel changes one of Hunter's 149 inputs). Each man picks 149, opens the bell, then presses Mark all read. | **Hunter:** Show 142 on, 149 on. The 149 line carries the grey mark **"149"** ("OL 149 Fri 11 Dec · Remark changed · Kestrel"). His 142 line ("OL Thu 10 Dec · Remark changed · Saber") has **no mark**. Mark all read on 149 marks **all** lines read, the 142 lines included, and they are still read after he picks 142. **Saber:** his Show row starts with **149 off** (142 on), so his 149 line is not listed at all. His one 142 line has no mark, and Mark all read on 149 marked it read. | Read marks only | `p6-a7-hunter-d-1-bell-on149`, `-2-bell-on142-after-markall`; `p6-a7-saber-d-1-bell-on149` | **Confirmed** (the mark follows his home squadron, not the squadron in view) |
| A8 · d (lines) | Hunter on 149 → bell → Show "142" off → Mark all read → bell closed | With 142 off, the 142 line leaves the list. Mark all read marks only the lines still listed. With the bell closed it is **dark**, although the 142 line is still unread. With 142 back on, that line is listed unread again and the bell is lit. | — | `p6-a8-lines-d-1-142-off-closed` | Code read's claim **refuted** for lines: a switched-off squadron's unread lines do not light the bell |
| A8 · d (OIL) | Before the question exists, Hunter switches 142 off and marks all read (the bell goes dark). Then he gets the same unanswered OIL question as in A4. He picks 149. | The bell is **lit**. One tap opens his 142 input's OIL question on 149 ("Weekend/PH work — confirm your OIL"), and the Show row never appears. | — | `p6-a8-oil-d-1-on149`, `-2-after-tap` | **Confirmed** for the OIL question. Caveat: I did not read the list, so other lines may also have lit the bell (the set-up's suspend, holiday and enable came after his Mark all read). |
| A9 · d, p (Plan holder) | Set-up: Saber archives Hunter, restores him, then gives him Plan of 149. Hunter picks 149 and presses "Check my quals". | On 149 the card reads "Welcome back, Hunter — check your quals and CAT. Check my quals · Later". After the press the bar stays **149**, the page is **149's Quals** (Condor, Harrier, Kestrel, Merlin, Osprey), **his row is not there**, nothing is outlined, the card is gone, and nothing is said. | — | `p6-a9-{d,p}-1-card-on149`, `-2-after-press` | **Confirmed** |
| A10 · d (member) | One browser. Osprey (149 member) sends a report through Help ("Report sent — thank you") → Logout → Hunter (142 admin) signs in → Logout → Kestrel (149 admin) signs in | Both admins: the bell is dark, a tap does nothing, and Help reads "Bug reports · No reports yet." | Nothing kept: the report lived only in the open page, and **Logout reloads the page**. It also did not carry into a fresh browser (first run). | `p6-a10-member-d-1-hunter-help` | **Refuted as stated.** Neither squadron's admin ever sees a member's report today. |
| A10 · d (admin) | Saber picks 149 → Help → sends a report → picks 142 | On 142 the bell is lit. A tap shows the toast "1 new bug report" and opens Help: "1 report, newest first", listing his 149 report ("SCHEDULE BOARD 25/11 13:04 · Saber"). The report names no squadron. | — | `p6-a10-admin-d-1-help-on142` | **Partly**: one list for all squadrons within one sign-in |
| A11 · d | Set-up: Saber archives Ace on 142. Then "n175ace" asks for access to **149** as "Ace". Kestrel (and Saber on 149) open Admin → Users → Waiting → Give access. | The form opens on "New person". Note: "An archived man is already Ace — this makes a new person. If it is him, restore him first (▸ Archived), then give him his sign-in on his row." 149 has **no Archived fold**; 142's reads "▾ Archived · 1 — Ace … Archived 25 Nov 26". Kestrel presses "Add person and give access" → "Ace added — n175ace can sign in now". | **149's**: a new person "Ace" (n175ace, member). 142's archived Ace stays archived, so two "Ace"s now exist. | `p6-a11-kestrel-d-1-note`, `-2-after-give`; `p6-a11-saber-d-1-note` | **Confirmed**: the note points at a fold 149 does not have. 149 can only make a new person. |
| A12 · d | Kestrel on 149 → Admin → Users → Add a person → Callsign "Ranger" → Add person | Toast: "Ranger is already taken — callsigns must be unique". No squadron is named and nobody is added. The control, "Rangerx", passes that check and is stopped at "Pick pilot, WSO or personnel". | Nothing | `p6-a12-d-1-taken` | **Confirmed** |
| A13 · d, p | Set-up: Saber gives Hunter View of 149 and Ranger View of 149. Each picks 149 ("149 View only"). | **d:** Hunter's badge reads "**Hunter · Admin**" on 149, as on 142. Ranger's reads "Ranger · Member". **p:** there is no badge. ☰ shows "149 · View only … Signed in as Hunter · Admin · Switch to the member view"; for Ranger, "Signed in as Ranger · Member" with no switch. | — | `p6-a13-{hunter,ranger}-{d,p}-1-on149` | **Confirmed** |
| C-signoff · d | Kestrel on 149's Edit Schedule reads the first day's four boxes. Run twice: Hunter with Plan of 149 only, then also with the Scheduler tick ticked on 142's Quals. On the demo week (Mon 13 Jul), then after "Jump to a date" → Mon 7 Dec. | CUR CK offers 149's own ten only. SKED CK, PLANNED BY and APPROVED BY offer "Kestrel, **Saber**" on both weeks, with or without the tick. **Hunter** is offered only on **7 Dec and only with the Scheduler tick**: "Kestrel, Hunter, Saber". He is never offered on the July week, which comes before his Plan (given today). | — | `p6-csignoff-plan-d-{1,2}-…`, `p6-csignoff-plan-sched-d-2-boxes-7dec` | **Confirmed**, with conditions: Hunter needs the Scheduler tick and a day his Plan covers; the master admin is always offered. The names are read from the boxes, not visible in the picture. |
| C-users · d | Hunter and Saber each pick 149 → Admin → Users; search "Ranger"; open Ranger's row | The list holds 149's ten plus "Hunter **142** · ad2 · Pilot · CAT IP · **also plans 149**". The heading reads "People · 10". The search finds "Ranger 142 · us · Pilot · CAT IP · Member". His opened row lists both squadrons: "142 Home squadron · 149 None / View / Plan (greyed) · Plan is for admins only". Save, Suspend, Archive and Delete are all live. | — | `p6-cusers-{hunter,saber}-d-1-list`, `-2-search`, `-3-access` | **Confirmed** |
| C-undo · d | Saber adds squadron 150 (first admin: "Hunter · 142") → picks 149 → Edit Schedule, then Inputs | The pick list reads "142 Your squadron · 149 Full access · 150 Full access". On 149 Undo is **live** with the hover words "Undo — adding a squadron", on both pages. | — | `p6-cundo-d-1-on149` (the hover words are not visible in the picture) | **Confirmed** (as P4 1a) |

## What surprised me
1. A2: his own input, filed from 149's page, shows on 149's Inputs List as well as 142's.
2. A3: on 149, a SANS commitment saved there is not counted on 149's calendar ("No commitments yet") but is counted on 142's.
3. A8: switching a squadron off under Show darkens the bell for that squadron's lines, but not for his OIL question. That question also takes the whole tap, so the Show row cannot be reached while it waits.
4. A10: a member's bug report is lost at Logout, because Logout reloads the page.
5. A11: giving access to 149 as a new person makes a second "Ace" while 142's archived Ace exists. The note's "▸ Archived" is not on 149's page.
6. A7: Saber's Show row starts with 149 switched off.
7. Phone: an Input window covers the top bar, so on A2, A3 and A4 the ring on the squadron mark sits under the window. The bar reading 149 comes from the FACT lines.

## Stand-ins (every set-up is made by presses, its saved data copied into fresh browsers)
- **A4, A8 OIL:** no press leaves a weekend input unanswered. Saber's Save of Hunter's Sat 12 Dec Duty asks "Does it deserve FO…?", and its Add stays **greyed** until he answers (FACT `p6.a4.setup.weekendTried`). So I used this instead: a weekday Duty (8 Dec, nothing asked), Hunter **suspended**, 8 Dec made the holiday "N175 A4 Day" (its list left with "Later"), then Hunter **enabled**. He gets no holiday line, so the bell takes its direct OIL path, the one the code read names.
- **A7, A8 lines:** a new input lights nobody's bell. Lines come when someone else changes an input a man filed, so I made them that way.
- **A10:** each variant runs in one browser, because reports are not kept in saved data.
- **Phone typing:** set through the box's own input event (n166's way).

## Not pressed, and why
- **Moves** (a leave across a move; a moved man's old inputs and bell lines): no screen moves a man yet, so they are not reachable on screen.
- **A10 for 142's admin seeing a 149 member's report:** not reachable, because the report does not survive the Logout.
- **A7, A8, A10–A12, C-cases on a phone:** the brief says desktop is enough.

## Scripts, re-run order (from the repo root)
Helpers: `p6-lib.mjs`. Then:
1. `p6-a2.mjs d|p`
2. `p6-a3.mjs d|p`
3. `p6-a4.mjs d|p`
4. `p6-a7.mjs d`
5. `p6-a8.mjs d` (uses p6-a7's and p6-a4's set-ups)
6. `p6-a9.mjs d|p`
7. `p6-a10.mjs d`
8. `p6-a11.mjs d`
9. `p6-a12.mjs d`
10. `p6-a13.mjs d|p`
11. `p6-csignoff.mjs d`
12. `p6-cusers.mjs d`
13. `p6-cundo.mjs d`

All are in `raptor-port/scripts/handpass/n175/`. Logs and scratch pictures are in `raptor-port/.tmp/n175/p6/`.
