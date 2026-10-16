---
paths:
  - raptor-port/src/**/*oil*
  - raptor-port/src/**/*Oil*
  - raptor-port/src/leavewar/**
  - raptor-port/src/**/*avail*
  - raptor-port/src/**/*Avail*
  - raptor-port/src/**/*publish*
  - raptor-port/src/**/*Publish*
  - raptor-port/e2e/*leavewar*
  - raptor-port/src/ui/board-html.ts
  - raptor-port/src/ui/interactions.ts
  - raptor-port/docs/engine-rules.md
  - raptor-port/docs/ui-contracts.md
  - raptor-port/docs/leavewar/**
  - raptor-port/docs/**/*leavewar*
  - raptor-port/docs/**/*lw-*
  - raptor-port/docs/**/*lw-*/**
  - raptor-port/docs/**/*oil*
  - raptor-port/docs/**/*oil*/**
  - raptor-port/docs/handpass/parts/blocks-*
  - raptor-port/docs/**/*allavail*
  - raptor-port/docs/**/*one-absence*
  - raptor-port/scripts/handpass/**
  - raptor-port/docs/archive/HANDOFF-OIL-WALK.md
---

# Rulings — OIL (off in lieu: earned leave)

**Loads by itself** whenever a session reads an OIL, Leave War, placeholder-puck or publishing file (the
`paths:` at the top of this file). The general rulings are in `.claude/rules/decisions/how-we-work.md`, loaded in every session; the map of every ruling and how to add or retire one: `DECISIONS.md`.
**One line per ruling — its number, its date, the rule as it stands (D390). Its full row** — his words, the readings he
was told, where it lives — **is in `.claude/decisions-full/oil.md`, never loaded by itself: open it before acting on a
ruling's detail or asking him about it** (`grep -h '^| D… |' .claude/decisions-full/*.md` — the shell; the Grep tool
hides a long row). A "— changed by" tail names the later rulings that changed it. Newest first.
**Also read** — in `scheduler.md`: **D762** (to be built with `[ALL-AVAIL-AS-MEMBER]`: an input with several people has ONE OIL answer for everyone in it, given by whoever filed it or an admin — no man gives his own, the filer does not pick people out, and only the scheduler leaves one person out, in OIL Earn on the day; until it is built D660, D682, D738 and D744 below are as built), **D753** (to be built with `[ALL-AVAIL-AS-MEMBER]`, D750: where ALL AVAIL / ALL is one of a shared input's own people, the men behind it follow the OIL answer given for the input — the scheduler may still switch any one man), **D731** (a shared input's OIL line counts its people where their answers differ — "credited for 2 of 3 — Ranger: no"; an OIL answer for a day the input no longer covers stays on the record, credited for nothing), **D660** (whoever files an input for other people answers its OIL question for all of them at the save; each man may still change his own), **D738, D744** (a man the scheduler adds to a shared input by dragging his puck onto its row on the schedule takes the OIL answer the input carries, with no question there, while everyone in it carries the same answer — where their answers differ he is asked the OIL question at once; OIL Earn still switches him), **D682** (when the filer answers a shared input's OIL question again, the answer is written for everyone in it — a man's own earlier No is replaced; the latest answer counts, and the scheduler's refusal still wins), **D360** (an ALL AVAIL on a row with a start and no end counts over the one-hour default, earns nobody OIL, and tells the admin "no OIL worked out — this row has no end time"). In `leave-war.md`: **D265** (a bid that shares its day with an OIL award moves alone; the award stays where it is, D260). In `scheduler.md` (it loads by itself with any board or engine file): **D272** (in OIL Earn mode his own puck shows the green OIL ring, not the purple one); **D27, D33, D47** (where
the ALL / ALL AVAIL pucks may land and where they are refused), **D36–D41, D51** (who counts as available,
and the window that lists them), **D44, D45** (the crowd frozen at publication; the pending mark). In How we
work, already loaded: **D54** (an issued weekend carrying a placeholder raises the mark — leave it) and **D56**. In `people-accounts.md`:
**D327** (an archived man stays in the ALL AVAIL crowd on every day before his archive).
**Also know** — `[OIL-AUTO-REMOVE]` (the OIL Earn mode; merged 22 Sep 26, D34 — spent, in `DECISIONS-ARCHIVE.md`) went live with his five-minute look WAIVED: its evidence is the walk (`raptor-port/docs/handpass/2026-09-22-oil-walk.md` — the defects it found are fixed red-first; do not re-do them) and the gates, never an owner sighting, so never assume he eyeballed the walked Saturday. Its design of record, with the rulings not to relitigate (§8/§9): `raptor-port/docs/superpowers/specs/2026-09-21-oil-auto-remove-decisions.md`. The item itself: `OUTSTANDING-ARCHIVE.md` (moved 27 Sep 26, `[BACKLOG-TIDY]`).

| # | Date | The rule |
|---|---|---|
| D923 | 15 Oct 26 | The OIL question's "Only some days…" calendar becomes the app's one date calendar in its look, and there a tap turns each separate day on or off — only the input's non-working days can be tapped, as today; which days earn OIL is decided as before. |
| D865 | 15 Oct 26 | The OIL job's four open points are settled as recommended: the ⓘ mark's words stay as built; the list a load opens shows the day's whole open list; "Switch to this plan" that brings back an unanswered input gets the load's short note and list, as a small follow-up; and with the bar up, "Answer OIL" un-cancels at once where nothing is left to ask. |
| D863 | 15 Oct 26 | The note after "Load onto working copy" is short plain sentences: what the day is back to, what viewers still see, what else came back or stayed out, and how many inputs need an OIL answer — and it no longer repeats the edits thrown away, which the confirming button has just said. |
| D862 | 15 Oct 26 | When a published version loaded back puts back an input of several days whose missing OIL answer is for another of its days, it is counted in the note and the OIL list opens for the day that needs the answer — not the day loaded, which has nothing to answer. |
| D818 | 13 Oct 26 | After a published version is loaded back onto the working copy, the app says how many of the Inputs it put back still need an OIL answer and opens that day's one list of them — the load itself is not held. — changed by D862 |
| D816 | 13 Oct 26 | Taking the cancel off an input that has no OIL answer for a non-working day puts the OIL question first, as "Accept" does — nothing is un-cancelled until it is answered; where it is already answered, or nothing is to be asked, it is un-cancelled at once and the answer counts again. |
| D814 | 13 Oct 26 | A cancelled input is never asked the OIL question — not at a save, a put-back or a filing, and it wears no "OIL?" Tag and stands in neither the one list nor the bell — because it can earn nothing; an information-only input the same. |
| D804 | 13 Oct 26 | Leave and medical inputs never earn OIL and are never asked; every other kind that can earn is asked the OIL question and its answer decides — wherever it is filed, under Unavailable included; so "→ Unavail" puts the OIL question first, as "Accept" does (D793). |
| D793 | 13 Oct 26 | An input put back on the programme after its day became a holiday waits on its OIL question as a swap does: the question comes first, and it is put back only on an answer. |
| D783 | 12 Oct 26 | A swap or an add that raises an OIL question is not made until the question is answered — nothing moves; not answered, both pucks flash and a bar stays until tapped ("Not swapped — OIL not answered", Answer OIL, OK); the one list opens by itself when a holiday is saved, and the schedulers' bell carries one line a holiday, counting what is left. — changed by D831 |
| D782 | 12 Oct 26 | The admin answers a day's open OIL questions from one list — every input of that day that needs an answer, each with its Yes and no, and A "Yes to all" and A "No to all". |
| D781 | 12 Oct 26 | A day made a holiday afterwards: the admin declaring it is told at once, and what he answers there notifies nobody — only what is left unanswered goes to the schedulers and to whoever answers for each input; and a swap's or an add's OIL question cannot be left open — not answered, the swap is not made and the app says so. — changed by D783 |
| D780 | 12 Oct 26 | When a day is made a holiday after inputs already stand on it, the schedulers are Told that those inputs now need an OIL answer — it is never silent. — changed by D781 |
| D606 | 7 Oct 26 | An SC shift's typed B (its in-time), where filled, counts as work: the shift's OIL is worked out from that in-time to the shift's end, and its work Hours count from it too; a blank B leaves the shift its written start to end. |
| D592 | 5 Oct 26 | D591's details: OIL uses the earliest in-time / Rally that applies to the formation, the nominal time where none is typed; an evening-before report lengthens the line's own day only; a published day keeps its OIL until published again — a later time or Logic change reads as pending; the day counts first event to last end, breaks included. |
| D591 | 5 Oct 26 | A flying line's earned leave (OIL) is worked out from its earliest applicable entered in-time / rally — the nominal report time only where none is entered (details: D592). |
| D470 | 1 Oct 26 | A man the scheduler puts in the name box of another man's request row earns OIL from it, as a man added under the row does (D18); the member who filed it still earns on his own answer, and either can be tapped off in OIL Earn. — changed by D755 |
| D402 | 29 Sep 26 | Every OIL award given by hand shows on the Leave War grid on its date, wherever it was given — typed on the grid or credited from the OIL tracker — as an FO or HO box; a tap says who gave it and why. |
| D401 | 29 Sep 26 | The OIL award fix converts no stored award: what is saved today is demo data, wiped before the database (D54, D56), so only the demo seed is rewritten in the new one kind of award — and a record in the old shape must still not break a load. |
| D400 | 29 Sep 26 | OIL's "earned" counts only what the app credited itself — the published schedule or an accepted duty input — and every OIL an admin gives by hand, typed on the War grid or credited from the Tracker, is shown apart as "awarded". |
| D261 | 27 Sep 26 | A member opens his own OIL award, read only, at every stage |
| D260 | 27 Sep 26 | A dragged block's Delete removes everything in it, OIL awards included — and its confirm names each award first |
| D163 | 24 Sep 26 | Leave both — demo data only, wiped before the database (D54, D56): [DEMO-AWARD-DATES-ASK] and [POSTOUT-LOST] are closed. |
| D142 | 24 Sep 26 | A day’s OIL comes from its latest published version — the latest amendment, or the EOD if that is the latest — however long ago the day was. No lock, no clock. |
| D82 | 23 Sep 26 | An OIL award and a worked day add up. |
| D81 | 23 Sep 26 | A worked weekend that earns nobody any OIL says so |
| D80 | 23 Sep 26 | An OIL award does not flag a leave day |
| D79 | 23 Sep 26 | OIL may be credited by hand on any day. |
| D52 | 22 Sep 26 | Three OIL behaviours are correct as built and not in conflict: a ground crewman NAMED on a weekend duty earns; a placeholder on it earns for the men it stands for unless switched off; ALL / ALL AVAIL do not include ground crew — nothing to build. |
| D49 | 22 Sep 26 | A flying line whose written take-off and landing are the same still earns. |
| D48 | 22 Sep 26 | An issued day keeps the money it went out with when a rule changes under it. |
| D46 | 22 Sep 26 | The placeholder is allowed on an accepted request row and credits by default. No exception to D43 anywhere. — changed by D755 |
| D43 | 22 Sep 26 | The placeholder pucks behave exactly like named people: on by default, everywhere they can land. — changed by D755 |
| D42 | 22 Sep 26 | An overnight line earns on the day it sits on, and the hours spilling past midnight Earn the next day nothing. |
| D35 | 22 Sep 26 | Re-confirms D24 and makes its template half explicit: the four exempt kinds offer the OIL switch (off by default), and so does a duty block minted from an AVALON template — the same seat, one answer. |
| D32 | 22 Sep 26 | One list, not two: wherever a placeholder puck is allowed to land, it also offers the OIL switch — landing and earning are one decision; on by default there, like named people (D43). — changed by D43 |
| D31 | 22 Sep 26 | A seat with nothing to measure offers no OIL switch — it says why instead. |
| D28 | 22 Sep 26 | One principle instead of an allow-list: every seat can earn, its default decides whether it does, and the admin can always override; the placeholder pucks default on wherever they land (D43); a seat with nothing to measure offers no switch and says why (D31). — changed by D43, D31 |
| D26 | 22 Sep 26 | Leave the OIL mode's phone tap targets as they are — he settles OIL on his phone easily; do not re-open it or re-file it as a defect; nothing to build. |
| D25 | 22 Sep 26 | OIL is earned leave, not pay — say it that way. |
| D24 | 22 Sep 26 | The exempt kinds — SC SPARE, AVALON flying lines and duty desks, BB flying lines — become creditable: they offer the OIL switch in the mode, defaulting off, so an activated one can be credited (on a published day through an ordinary amendment). Supersedes D15 and D20 in part. |
| D21 | 22 Sep 26 | An "Off day" does not earn OIL. Settled; do not reopen. |
| D20 | 22 Sep 26 | AVALON flying lines, AVALON duty desks and BB flying lines — and a duty block made from an AVALON template — earn no OIL by default; they offer the switch, so an activated one can be credited (D24). — changed by D24 |
| D19 | 22 Sep 26 | A weekend or holiday that no Leave War period covers must NAME the reason and offer the way out, not just refuse. |
| D18 | 21 Sep 26 | All five hand-pass findings accepted as real, and finding 2 settled his way: a second man the scheduler puts on a member's landed request row EARNS from it, the same as the man who filed it. — changed by D755 |
| D15 | 21 Sep 26 | The feature's acceptance criteria, in his words: flying lines, SC MAIN, Common Programme, Standard and SC-shift duty desks and ground rows earn; SC SPARE, AVALON/BB lines and desks and ⓘ rows do not by default — SC SPARE, AVALON and BB offer the switch (D24). — changed by D24 |
| D3 | 21 Sep 26 | The two OIL bugs found beside R-1 (D2) are fixed on that branch, not filed — they share its root cause. |
| D2 | 21 Sep 26 | Only the issued (published) schedule earns OIL, both directions: a holiday declared after publication waits for a republication and the day says so; revoking one no longer removes OIL silently. |
| D1 | 21 Sep 26 | The green OIL bar shows only on the events that COUNTED towards a man's day, not on every puck he wears (supersedes §2.10 / OIL21); the ALL AVAIL count chip agrees with it. |
