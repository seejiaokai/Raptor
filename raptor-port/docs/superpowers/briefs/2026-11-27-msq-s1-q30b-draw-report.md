# Section 1 (the guard rail) — card 30 redrawn: a medical still open when the man moves (chat 204, 27 Nov 26)

Drawn by an Opus drawing helper in its own copy, at commit `ef938e016` (after `9495f6744`), from
`2026-11-27-msq-s1-q30b-redraw-brief.md` as changed by the orchestrator's message of 27 Nov: his D2834 ("anything that's
outstanding that is not closed will need to be transferred with the person to the next sqn") makes card 30 a
"how it will look" card, not a choice. No file under `raptor-port/src` changed; nothing committed.

- **Script:** `raptor-port/scripts/handpass/n204/draw-q30b.mjs` (new; the shape of `draw-q30-31.mjs`).
- **Pictures:** `raptor-port/docs/mock/2026-11-26-msq-questions/q30b/` — 38 pictures, each with its `-crop` (76 files), at a
  desktop's 1536×864 (Chromium) and a phone's 390×844 (WebKit, touch), at 2×, the teal ring on what matters. Every picture
  was looked at. No page errors and no console errors in any run.
- **The lock:** free when asked; taken for the build only (`gatelock exec … npm run build`), released by itself. The
  preview ran on port 4741 and was stopped; the `node_modules` junction was made and removed. `raptor-port/.tmp/` holds
  this run's working files (the two saved worlds); untracked, leave it out of any commit.
- **The brief named `2026-11-27-msq-s1-round-kr-draw-brief.md`; it does not exist.** I used its report and the q30–31
  brief, as named.

## Setup, and what is not a press

- **Quill's move** (142 → 149 from Thu 16 Jul 2026) is written into the browser's saved data, as every earlier drawing
  did: no screen saves a move yet.
- **The clock:** each world is made on Wed 15 Jul 09:00 and pictured on Thu 16 Jul 09:00 (Singapore), the move's first
  day. The app's own "today" for dates it offers is still the demo's Mon 13 Jul, so the upchit window opens on 13 Jul;
  every upchit here had its date picked on its own calendar.
- **Two worlds.** OPEN: the seed's OML 6–9 Jul, still waiting for its upchit at the move. CLOSED: Hunter (142's admin)
  upchits it on Wed 15 Jul, before the move, from 142's Medical tab — the card, Upchit, date 15 Jul, Add, "No document",
  "Save upchit".
- **People** (accounts from the seed): Saber `ad` (a master admin), Kestrel `ad9` (149's admin), Hunter `ad2` (142's
  admin). In this drawing Kestrel holds no right in 150 (no 150 was made); the card can still call him "149's admin who
  also plans 150" if the coordinator wants the round's wording, but nothing here depends on it.
- **Quill is a WSO, not a pilot.** The seed has him in the back seat, qualification IW (instructor WSO); his card on
  screen shows "IW". The orchestrator's message and the brief call him "a member pilot". The card text below says
  "a WSO"; **the coordinator should confirm the word before it goes** (his D2833: each person named with his role).

## What the app does today (by presses)

1. **149's Medical tab, as of 16 Jul** (Kestrel): Quill's OML 6–9 Jul stands under Pending Upchit. So 149 *can* see
   today that he is not yet cleared.
2. **Kestrel, 149's own admin, opens it** (card → "Edit input"): it opens **read only** — no Save, its foot reading
   "Only Quill or an admin can change this." He is an admin, so the words do not tell him why.
3. **Saber, a master admin, 149 picked, opens it:** live, Save ready. A Save there changes the one record, whose own
   squadron is 142's (its days are 142's days).
4. **Kestrel closes it with the card's own Upchit, dated 16 Jul:** "No medical document" → "No document" → the summary
   "Close the pending medical-down period … Fit for full duty from Jul 16." → "Save upchit". It saves: Pending Upchit 0,
   and "Quill 16 Jul" under Upchit Complete. **So today 149's admin already can close it, by an upchit on a 149 day.**
5. **The same Upchit left on its offered date, 13 Jul (a 142 day):** refused, "Blocked: nothing was kept." That is the
   general sentence the move's refusals use; it does not say why.
6. **142's Medical tab, as of 16 Jul** (Hunter): Quill is not there — Grit, Vector and Zenith only.
7. **142's tab as of 15 Jul** (the day before the move): Quill's OML is under Pending Upchit, and the viewer offers
   Upchit and "Edit input". **Hunter opens it live and saves a change on Thu 16 Jul** — the viewer then reads "changed by
   Hunter · 16 Jul 26, 09:00". So today 142's admin can still change a moved man's open record, from 142's history.
8. **A record closed before the move** (CLOSED world): on 16 Jul the upchit of 15 Jul shows on **149's** Upchit Complete
   (its 30-day window follows the man) and is **gone from 142's** tab; it shows on 142's only as of 15 Jul. That is the
   opposite of the coordinator's reading (closed records stay with the old squadron).
9. **The schedule:** a pending upchit marks nothing. 149's Thursday 16 Jul reads Unavailable "Nil"; from the code, the
   pending-upchit list feeds only the Medical tab and the Inputs page's count — no schedule, no warning, no strike.
   Quill is not planned on 149's week in the seed, so no puck of his could be pictured; that he would not be flagged is
   from the code. So the Medical tab is the only place 149 learns he is not cleared.

## What the rulings settle (read with the shell)

- **D2160** (round 6, T/Q7) and **D2163**: a transfer carries "his sign-in, callsign, inputs, medical records,
  currencies, leave balances, OIL and leave records"; the old squadron keeps its published days, its Leave War months to
  the date and the change history. Design only.
- **D2136:** the Leave War's Post out "Transfer to Sqn" moves his primary squadron on the date. **D2621/D2622:** a
  squadron's things are seen only on that squadron; a moved man still sees his old inputs where he is, so he can answer
  them. **D211/D2387:** every member sees a medical input in full; a View holder too.
- **D2265** (B4): "a course, medical or Delete across a move gets a sentence of its own" — today's "Blocked: nothing was
  kept" (item 5) is that unbuilt sentence.
- **D2834 now settles card 30:** an open medical goes with him; 149's admins see and close it.
- **Left open, for the coordinator** (each my reading):
  1. **Clash to name (D90):** D2261 (22 Nov) says leave *across* a move stays one input, changed or removed only by the
     man or an admin of both squadrons. D2834 (27 Nov) says what is not closed goes with him. Approved leave that has
     not yet been taken, and a medical that runs across the move day, are "not closed". The later ruling would win, but
     whether he meant leave too is his to say.
  2. **An upchit dated before the move** (fit on 14 Jul, the paper reaching 149 on 20 Jul): refused today. Under D2834
     149's admins close it, so they would need to date it before the move.
  3. **142's view of the past:** as of 15 Jul, 142's tab still lists the OML — true history. Whether it stays read only
     there (drawn so below) is my reading; today it is live (item 7).

## Card 30 — the text

**Title:** A medical still open when a man moves: it goes with him.

**When this happens:** a few times a year. Quill, a WSO, moves from 142 to 149 on Thu 16 Jul. His OML of 6–9 Jul is
still waiting for its upchit — the medical centre has not cleared him yet. Kestrel, 149's admin, opens Inputs → Medical
to see who he can schedule. Hunter, 142's admin, looks at 142's tab the same day.

**How it will look (your ruling of 27 Nov):**
- **On 149's tab:** Quill's OML stands under Pending Upchit, so Kestrel knows Quill is not cleared. Kestrel can open it
  and change it, and close it with Upchit when the paper comes in. Today he can already close it with Upchit, but he
  cannot change the OML itself: it opens read only.
- **On 142's tab:** from 16 Jul Quill is gone from the open list. Looking back at a day before the move, Hunter still
  sees the OML as it was, but read only. Today Hunter can still change it from there.
- **A record closed before the move** (say Hunter had upchitted him on 15 Jul) stays on 142's tab and does not move to
  149's. Today it does the opposite: it moves to 149's tab for 30 days and leaves 142's.
- **The schedule** shows nothing either way: a pending upchit does not strike or flag him. The Medical tab is where 149
  sees it.

**Recommended:** build it as drawn. Every open record has one squadron that owns it — the one he is now in. 142 keeps a
true, read-only picture of its past, and nobody saves into the wrong squadron.

## Pictures

"Today" = the real app, by presses. "How it will look" = reached by presses where the app can, or drawn by changing the
page only, as said.

| File (each `-desktop` and `-phone`, + `-crop`) | Caption | Today or how it will look |
|---|---|---|
| `q30b-today-149` | Kestrel, 149's admin, Medical as of 16 Jul: Quill's OML 6–9 Jul under Pending Upchit (ringed). | Today — and how it will look (unchanged) |
| `q30b-today-149-viewer` | He presses the card: the certificate, with Upchit and "Edit input" (ringed). | Today |
| `q30b-today-149-open` | "Edit input": read only, no Save; its foot "Only Quill or an admin can change this." (ringed). The bar reads 149 (ringed). | Today |
| `q30b-will-149-open` | The same window live, Save ready (ringed), the bar 149. | How it will look for Kestrel — **reached by Saber's presses today** (a master admin, 149 picked); Kestrel's own would look the same |
| `q30b-today-149-upchit` | Kestrel presses the card's Upchit; date picked Thu 16 Jul; Add (ringed). | Today — also how closing it will look |
| `q30b-today-149-upchit-sheet` | After "No document": "Saving this upchit will close the pending medical-down period… Fit for full duty from Jul 16." with "Save upchit" (ringed). | Today — also how it will look |
| `q30b-today-149-upchit-saved` | Pending Upchit 0; "Quill 16 Jul" under Upchit Complete (ringed). | Today — also how it will look |
| `q30b-today-142` | Hunter, 142's admin, Medical as of 16 Jul: Grit, Vector, Zenith — no Quill. | Today — and how it will look |
| `q30b-today-142-15jul` | 142's tab as of 15 Jul: Quill's OML under Pending Upchit (ringed). | Today |
| `q30b-today-142-viewer` | The card pressed: Upchit and "Edit input" offered (ringed). | Today |
| `q30b-will-142-viewer-drawn` | The same viewer with only Close: read only from 142's past. | How it will look — **drawn by hiding Upchit and "Edit input"** (my reading) |
| `q30b-today-142-open` | "Edit input" from 142's past: live, Save ready (ringed), bar 142. | Today |
| `q30b-today-142-save` | Hunter typed "Seen by 142 doctor" and saved on 16 Jul: the viewer reads it, "changed by Hunter · 16 Jul 26, 09:00" (ringed). | Today |
| `q30b-closed-149-today` | CLOSED world. Kestrel, 149 as of 16 Jul: "Quill 15 Jul" under Upchit Complete (ringed) — 142's upchit. | Today |
| `q30b-will-closed-149-drawn` | The same tab with that card gone: Upchit Complete 0, "No upchits in the past 30 days." | How it will look — **drawn: the card hidden, the count set to 0, the tab's own empty words** |
| `q30b-closed-142-15jul` | Hunter, 142 as of 15 Jul: "Quill 15 Jul" under Upchit Complete (ringed). | Today |
| `q30b-closed-142-today` | 142 as of 16 Jul: Quill's upchit is gone; Zenith only. | Today |
| `q30b-will-closed-142-drawn` | 142 as of 16 Jul with "Quill 15 Jul" kept under Upchit Complete (ringed), count 2. | How it will look — **drawn: the card copied from 142's own tab of 15 Jul, the count raised by one** |
| `q30b-sched-149` | Kestrel's View-only Sched, Thursday 16 Jul: Unavailable "Nil" (ringed). | Today — unchanged by the ruling |

On a phone the Input window covers the top bar, so the squadron number is ringed only where it shows; the bar read 149
(or 142) in every case.

## For the plan — every open thing a man can have at a move

From a separate code read in this copy (a helper's, file names kept for the plan; not pressed except item 1). "Reading"
marks what is inferred, not read in the code. D2834 is read throughout as: what is not closed goes with him, and his new
squadron's admins see it and act on it.

1. **A pending upchit** (pressed above). Today: follows him by the as-of date (`ui/MedicalView.tsx` roster filter), but
   149's admin cannot change the OML (read only), 142's admin still can from 142's past, and an upchit dated before the
   move is refused. **D2834:** 149 owns it — edit and close; 142 read only; closed ones stay on 142.
2. **A medical running across the move** (down on the move day). Today: one record, its squadron its first day's; only
   the man or a master admin changes it (`state/perms.ts`, the across-a-move rule). **D2834:** goes with him — the clash
   with D2261's reading for leave (open point 1).
3. **An input not yet accepted or rejected.** Today: inputs follow him day by day (`engine/inputs.ts inputSquadrons`); the
   accept mark is written only by the squadron of the input's first day (`state/store.ts landingInputs`), so one that
   starts before the move is accepted by 142 alone. **D2834:** 149 should accept it — a change.
4. **A leave bid, or leave waiting for approval, dated after the move.** Today: stays in 142's Leave War (one store per
   squadron). 142's Approvals still lists it, but Approve and Refuse are both refused ("Quill is 149's from …"); only
   Delete works. 149 never sees it. **Stranded.** **D2834:** goes to 149's war as a bid or request (D2160 already says
   "undecided bids become bids in the new war if open, else wait as requests").
5. **Approved leave after the move.** Today: kept in 142's war, hidden there, still counted in 142's balance; 149's war
   neither shows nor counts it (the D2265 B7/B8 interim). **D2834:** carried with his leave records (D2160) — the
   Transfer step.
6. **An OIL question unanswered.** Today: each day is judged by his squadron that day (`leavewar/sync.ts oilOpenOn`), so
   days after the move go to 149's OIL list. Follows him. **D2834:** already so; a holiday OIL line sent to 142 stays
   142's for 142's days (reading).
7. **SANS availability after the move.** Today: drawn on 149's SANS calendar by day; his SANS reminder follows his home.
   Follows him. **D2834:** already so.
8. **A posting out set ahead (in 142's war).** Today: never runs once he is not 142's (`leavewar/sync.ts
   runLoadedPostings` skips it, says nothing); 149 has no record. **Stranded and silent.** D2221 says the posting sheet
   says whether it goes or ends. **D2834:** goes with him to 149 — the coordinator should check this fits D2221.
9. **A Tracker course still running.** Today: stays in 142's Tracker; the link to him breaks because 142 no longer offers
   him (reading: shows as an unlinked typed name). 149 has none. **D2834:** goes with him — but D2160 F21 says "he stays
   on his Tracker course" and R10 "a squadron per Tracker course". A clash to name.
10. **An access request.** These come from new people with no account, so a moving man has none of his own; one already
    tied to a man is refused once his home differs. Stays with its squadron — not his to carry. **D2834:** no change
    (reading).
11. **Bell lines.** Today: lines about him (his inputs, his leave decisions, his posting) follow him; squadron business
    and lines he got only as a filer leave his bell on the move day. **D2834:** an unread line that asks him to act
    (an OIL question, a leave sent back) should follow (reading).
12. **View or Plan he held of other squadrons.** Ends at the move (D2203). Not his to carry.
13. **Quals and currencies.** On his person record, so they go with him; a tick 149 has no column for is kept, not drawn
    (reading). His Scheduler tick stops at the move and is not carried. Seats or duties naming him on 142's days after
    the move stay there, no warning (reading). **D2834:** these are not "open" records; no change.
14. **His typed leave figures and OIL ledger.** In 142's war; 149's war shows "–" and no OIL balance. **D2834:** carried
    with leave balances and OIL (D2160) — the Transfer step.

## What went differently from the brief

- The orchestrator's message replaced step 3 (choose A/B/C) with "how it will look" under D2834; the choices are not
  drawn.
- `round-kr-draw-brief.md` does not exist (above).
- Kestrel's window cannot be reached live by his own presses, so its look under D2834 comes from Saber's presses.
- Quill's role: WSO in the seed, "pilot" in the brief (above).
- No puck of Quill could be pictured on 149's schedule; the "nothing flags him" answer is from the code plus Thursday's
  Unavailable "Nil".
