# Bug check — the Inputs small fixes (D994's small fixes, Inputs and calendars, 20 Oct 26): `[TILL-NEXT-YEAR]`, `[OIL-ASK-HEAD-SEVERAL]`, `[INP-TILL-STALE]`, `[CAL-UNDO-OTHERS]`

Branch `claude/inputs-small-fixes`, cut from `main` after pull request 552; pull request 553. Built 20 Oct 26 by Opus, one
area, one check (D1087). His pick: "Inputs" — the agent's recommendation of the four small items of that area that need
no answer or look from him (D994).

## 0. What each item was, what was found, and what it is now
| Item | Found | Now |
|---|---|---|
| `[TILL-NEXT-YEAR]` — an input of another year printed "till 15 Feb" with no year | Real for new data: the one printer every screen asks (`engine/inputs.ts tillOf`, and `tillOfISO` for the window's grey date) read only the day and the month. The filed worry — that a year in the printed text could mark published days "1 pending" (it feeds `inpDetailKey`) — does not hold: the compare works out the issued record's key and the live one in the same call, under the same loaded week, so both carry the year or neither; nothing stores the key text. A signature's saved fingerprint (`publish.ts currentBind`) is worked out with the day's own week loaded, at the signing and at every read, so it agrees too; a day signed or published by an OLDER build with such an input reads changed once — stored demo data only (D56). | The last day's year is printed where it is not the loaded week's own — "till 15 Feb 2027", the convention every label in the app follows (`weeks-data.ts weekLabels`, `inputs.ts lateNote`); the year from the label, else the row's `yr` anchor (`dateOrd`). Red first: `engine/tilldate.test.ts` (4 cases), `ui/latepub.test.tsx` (a leave 17 Jul 2026 → 5 Jan 2027 on a published Friday: nothing pending; stretched a day, ONE change naming both dates with their year). |
| `[OIL-ASK-HEAD-SEVERAL]` — at two older doors the waiting OIL question of an input of several was headed with one man (the narrow read of 13 Oct 26, FX-1) | Confirmed by its test: "Ranger" where the input held three. The answer was already written for everyone (D762); only the heading was short. | `ui/inputedit.tsx oilFirst` takes the door's `who`; the Inputs calendar's drag of an input of several passes `inputWho` of the input, the Unavailable row's hand-over of one man of several passes `inputWho` of the people it will hold (the newcomer in the leaver's place — the list the row's door builds, `ui/reqdoor.ts`). An input of one keeps the gate's own heading. Red first: `ui/oilaskhead.test.tsx` (3 cases). |
| `[INP-TILL-STALE]` — the window left "till <date>" in the remarks when a range was taken back to one day (1 Oct 26) | **Gone since D948 (16 Oct 26):** the remarks box holds only what is typed; the "till <date>" is drawn in grey after the box from the window's dates and follows each pick. Walked (S1): 18 Jul → 19 Jul → 19 Jul again, grey "till 18 Jul" / "till 19 Jul" / "till 19 Jul", the box "Bangkok", saved as one day 19 Jul with the remark "Bangkok". | Closed — no change; this walk is its evidence. |
| `[CAL-UNDO-OTHERS]` — after another person's change, Undo's refusal does not say who (a); a holiday on another date blocks an Undo (b) (walker H, X-10, 8 Oct 26) | **Not reachable in the running app today.** Walker H made both by changing the signed-in person IN PLACE through the developer's bridge (`raptorMe` / `raptorRole`, his share's own note). In the app another person needs a sign-in, which ends the first person's Undo list (D148 — `undo/timeline.ts endUndoSession`); there is no second tab's sync (no storage listener in `src/`). Another person's change will reach the list only from the shared database, as a "remote" step — and that path already refuses naming who ("<callsign> changed this after your action…", `undo/timeline.ts outOfBandWords`, pinned in `undo/timeline-cr.test.ts`). (b) is real for that future: every holiday of one war is saved inside the war's own period record (`leavewar/state/store.ts holidayRun` writes `[war.period.id, period]`), so in a shared database one man's new holiday would block another's Undo of a different holiday of the same war. | (a) closed with this reason. (b) refiled in the backlog's Database step group, under the same id: decide how finely the war's records are saved for the shared database. |

## 1. The tier — the eight questions (the order's §5)
1. Money (OIL): **NO** — the OIL heading names who the answer is for; the answer, who it is written for and what earns
are unchanged (`oilaskhead.test.tsx` reads the record after the answer). 2. The published record: **YES** — the printed
"till <date>" is what a published day compares (`inpDetailKey`, D189 / D948 (3)) and what its face and print show.
3. Saved data: **NO** — nothing stored changes; the year is printed, never written. 4. A shared drawer: **YES** — `tillOf`
is the one printer every screen asks. 5. A new gesture: **NO**. 6. A new surface: **NO**. 7. Roles: **NO**. 8. The warning
list: **NO**. → **FULL** (question 2), sized SMALL (§3 below).
**The FULL steps, and how each was met.** The rules sweep (§2a); the roll-call (§2); scenario design and the code read by
ONE fresh, blind Opus reader, given this sheet and asked for what is MISSING (D790 — the ChatGPT readers are out, D761;
Fable is used for nothing unless he calls for it, D903); the walk; break tests (§6); the gates on GitHub (D1086); his look.
The scenarios were the host's own (anti-pattern 10): the reader is asked for missing ones, and any it names is walked or
written as a test before this sheet closes.

## 2a. The rulings swept
D948 (the till date printed from the dates, never written in), D951–D953 (the tick; the window's grey date), D189 and
D948 (3) (a published day compares the printed remark — a moved last day is ONE change), D728 (the card leaves the till date
out — the phone's card walked, T1), D762 (one OIL answer for everyone in an input of several; the question headed for them —
the row's door, since the narrow read), D783 (a hand-over or a move that raises the question waits; nothing moves until it is
answered — O1, O2), D737 (an input of several under Unavailable stays one row a man — the hand-over walked on one man's row),
D148 (Undo reverses only his own; the refusal says who; the list clears at sign-out). None contradicts another; none is narrowed.

## 2. The roll-call — every place the till date is printed, and every door that puts a waiting OIL question
| Place | Has it / must not, because… | Proof |
|---|---|---|
| The Inputs list, desktop — the remarks column (`InputsPage.tsx remarksShown`) | has it | walk T1 desktop |
| The Inputs list, phone — the card | must not: a card leaves the till date out, its day heading says the date (D728) | walk T1 phone |
| The input's own window — the grey date after the remarks box (`tillOfISO`) | has it — an existing input and a new one | walk T2, T3 (both sizes) |
| Edit Schedule's week — an Unavailable / Personal Inputs / Ground Programme line (`html.ts` `rk-till`) | has it | walk T4 (Unavailable, both sizes) |
| The Scheduler Board — the same lines (`board-html.ts`) | has it | walk T5 (both sizes) |
| View-only Sched and the issued face (the schedule row's remark, `overlay.ts remarksShown`) | has it | walk T7 (both sizes); the face's compare by `latepub.test.tsx` |
| A published day's pending count and its sign-offs (`inpDetailKey`) | must not read the year as a change; must read a moved last day | walk T6 (published, then a reload — nothing pending); `latepub.test.tsx` (the stretch: one change) |
| The changes window's lines (`pendlist.ts`) | has it — both sides from `remarksShown` | `latepub.test.tsx` reads the list's words ("…till 5 Jan 2027 … till 6 Jan 2027") |
| The Leave War's day list (`leavewar/ui/DayList.tsx`) | has it where a remark was typed — the same printer | not walked: the same call, no code of its own (§4) |
| The print and export (`export.ts schedRows`, the schedule rows' remark) | has it — the same row text as the face | not walked: the same field the face prints (§4) |
| The Inputs calendar's search and the list's sort by remark | read the printed text; a typed "2027" now finds a next-year input's date | not walked — no screen output (§4) |
| **Doors of the waiting OIL question:** the row's door (`reqdoor.ts gated`), the Inputs list's "OIL?", the put-back (`interactions.ts`), the un-cancel (`reqdoor.ts`), the window's save (`inputedit.tsx`) | had it before this job | — |
| The Inputs calendar's drag of an input of several (`caldrag.ts`) | has it now | walk O1 (desktop, a real mouse drag); `oilaskhead.test.tsx` |
| The Unavailable row's hand-over of one man of several (`inputedit.tsx reassignInput`) | has it now — the people it will hold | walk O2 (phone and desktop, armed taps); `oilaskhead.test.tsx` |
| The Unavailable row's hand-over of an input of one; the calendar drag of an input of one | the one man, as before | `oilaskhead.test.tsx` (the drag of one) |

## 3. The sizing step (D607)
1. **Type:** D (a printed text drawn by several screens through one printer) with G (what a published day compares) for
   `[TILL-NEXT-YEAR]`; F (words: a heading) at two doors for `[OIL-ASK-HEAD-SEVERAL]`.
2. **What only a walk could find:** a screen that prints the remark by its own code and so never shows the year; a published
   day that reads "1 pending" after a reload; a door whose question still shows one man in the running app; the phone's way
   to the hand-over (the crew drawer). The tests carry the arithmetic: the year's rule and the compare.
3. **The ledger:** words and shared-printer changes (types D, F) found their faults on the screens that print by their own
   code, on small host walks.
4. **The walk chosen:** the host alone, one scripted walk of the built bundle (`scripts/handpass/inputs-small-fixes-walk.mjs`),
   phone 390 and desktop 1440, every write through the app's own controls; 33 assertions. The calendar drag walked on the
   desktop only: the phone's drag gesture is unchanged by this job, and the heading is the same door's at any size —
   carried by `oilaskhead.test.tsx`; the hand-over walked at both sizes. No short screen: nothing here is a viewport-tall
   column.
5. **After the walk:** its row in `docs/walk-ledger.md`.

## 4. The walk
`node scripts/handpass/inputs-small-fixes-walk.mjs` on the built bundle served at :4173 (its index named the local build's
bundle, checked before the run). Pictures `docs/img/handpass/2026-10-20-inputs-small-fixes/` (19), results `…/results.txt`.
**33 PASS · 0 FAIL · 0 NOT WALKED · 0 browser errors.** The first run (not kept: no app fault) had two script faults — its
"free people" took only men on no day of the week and found one, so "an input of three" was an input of one; and a reload's
sign-in card was not waited for. Both fixed in the script; the pictures are of the second run.
| Step | What the screen said | Pictures (opened) |
|---|---|---|
| T1 the demo's 15 Feb 2027 input | desktop list: "till 15 Feb 2027"; phone card: no till date (D728) | 01, 09 |
| T2 its window | grey "till 15 Feb 2027" | 02, 10 |
| T3 a leave filed 17 Jul → 5 Jan 2027 through the calendar's "+ Input" | grey "till 5 Jan 2027" before Save; saved, remark "Walk leave" only | 03, 11 |
| T4–T5, T7 Friday on Edit Schedule's week, the Scheduler Board, View-only Sched | "Walk leave till 5 Jan 2027" on each, both sizes | 04, 05, 08, 12, 13, 14 |
| T6 Friday signed and published on the board (desktop) | no pending chip; after a reload, still none and still "till 5 Jan 2027" | 06, 07 |
| O1 a Training of three on Fri 17 Jul, its bar dragged to Sat 18 Jul (desktop) | "OIL: Drifter +2, Walk brief"; nothing moved while it waited; answered — moved | 15 |
| O2 an overseas duty of three on Thu 16 Jul, Thursday then made a holiday and its list left for later; one man's Unavailable row armed, a newcomer tapped | "OIL: Hunter +2, Walk OD" (Trident in Drifter's place); nobody handed over while it waited; answered — Trident holds the place. Phone and desktop | 16, 17 |
| S1 a new OL: 18 Jul, then 19 Jul, then 19 Jul again | grey date follows each pick; the box "Bangkok"; saved one day, 19 Jul | 18, 19 |

**Looked at on the pictures, not asserted:** after a publish the sign-off boxes read "4 to sign" (pictures 06, 07). A control
on the plain demo (Thursday published, no input added) reads the same straight after its publish — the boxes are the next
version's; nothing pending. Not a finding.

## 5. The read
*(the fresh, blind Opus read — below, once it reports)*

## 6. The break tests (`scripts/handpass/breaks/inputs-small-fixes.json`)
**7 of 7 caught.** 1 `tillOf` with no year — `tilldate`, `latepub` red; 2 `tillOfISO` with no year — `tilldate` red; 3 the
year printed in the loaded year too — `tilldate` red; 4 `oilFirst` ignoring the door's `who`; 5 the drag passing none; 6 the
hand-over passing none; 7 the hand-over heading the people BEFORE the swap — each `oilaskhead` red. Break 7 was found
unguarded before the run, by reading the test: its newcomer left the same first name A to Z either way ("Nomad +2"), so
the test could not tell; it now takes a newcomer (Blade) who leads, and asserts the two headings differ before relying on it.

## 7. The gates
GitHub's run of pull request 553 on `93bba2a5d` (the two fixes): **23 pass, 2 skipped** (D1086). On his PC: the 33 unit files
that read the changed code, 1,059 / 1,059; the typecheck clean; the build the walk drove.

## 8. What was NOT walked, and why
The Leave War's day list, the print and export, the search and sort: they print or read the same `remarksShown` text with no
code of their own between it and the screen. A real iPhone. The Inputs calendar's drag on a phone (§3, line 4).

## 9. Look card (his)
1. On the Inputs list, an input of next year reads "till 15 Feb 2027".
2. A leave running into next year reads its year after "till" on the schedule, and publishing that day leaves nothing pending.
3. Dragging a shared input onto a weekend, or swapping one of its people on the Unavailable row, asks the OIL question headed
   "<name> +2" — the people the answer is for.
