# Brief — design the test scenarios for "the input card, and the Inputs list without its pencil" (one designer; read-only)

**You are designing what a walker will DO in the running app** (owner D6, D353: the other provider designs the
scenarios, Opus executes them). The feature is BUILT on `claude/day-window-compact` (commit `52126888`). Change no file.
You are not reviewing the code for bugs — a blind code read by two readers comes after the walk. **Ask what is MISSING:**
which state, order, surface or role would this build get wrong, or never have been wired for? **Above all: what could a
person do on the Inputs list BEFORE this change (with its pencil, its tick, its cross, its OIL chips, its paperclip) that
he can no longer do, or can now do only by a route nobody tested?**

## What was built
1. **ONE input card** for the Inputs calendar's opened day and for the Inputs list on a phone: a top line (the colour
   square, who, the kind in small grey capitals, LATE, the hours); the input's own title at the left on a row of its
   own, a remark after it in grey, both wrapping at the card's full width; every name of a shared input, wrapping round
   the LATE-and-hours corner (no pucks, never "+N"); the small print "By Saber" — for an input of ONE person only where
   someone else placed it, for an input of SEVERAL people always, never a day or a time. A card with nothing more to say
   is one line. A tap opens the input's window.
2. **The Inputs list:** on a phone (under 821px wide) the cards under a heading a day ("SAT 18 JUL · 6 inputs"), in date
   order; on a desktop the table as it was, WITHOUT the pencil and the cross — the Name is a button, a click on the row
   opens the input's window; the paperclip and the OIL / OIL? chips stay in the last column.
3. **The list's edit in place is REMOVED.** Everything it did is the input window's job now. Two things were added to
   the window so that nothing is lost: (a) the two-tap date calendar for EVERY saved input its reader may change (it had
   it for a shared input only — the pencil's row was the only form that changed a one-person input's dates); (b) an OIL
   line "Not answered yet — <day>" with "Answer…" for a question nobody has answered (the phone's card has no OIL chip).

- The owner's rulings: `.claude/rules/decisions/scheduler.md` D718–D724 (full rows:
  `grep -h '^| D723 |' .claude/decisions-full/*.md`). The approved pictures:
  `raptor-port/docs/mock/img/input-card-final/day-final.png`, `list-final.png`.
- The plan (read it whole): `raptor-port/docs/superpowers/plans/2026-10-10-input-card-plan.md` — §3 is the two doors the
  pictures do not show; §4 is the roll-call of every surface and the door list.
- The contract as written: `raptor-port/docs/ui-contracts.md` (search "THE INPUT CARD" and "THE INPUTS LIST HAS NO EDIT
  IN PLACE").
- The code, to learn what a control does (not to review it): `raptor-port/src/ui/InputCard.tsx`,
  `raptor-port/src/ui/inputcard-model.ts`, `raptor-port/src/ui/InputsCal.tsx` (the opened day, search "THE INPUTS —"),
  `raptor-port/src/ui/InputsPage.tsx` (search "NO EDIT IN PLACE", "ON A PHONE THE LIST IS", "A CLICK ON THE ROW"),
  `raptor-port/src/ui/inputedit.tsx` (the window: `datesHere`, `unansweredDay`, `save`, `doSave`, `del`),
  `raptor-port/src/ui/placedline.ts` (`filerOf`). What the pencil's row did before:
  `git show a6d902c5:raptor-port/src/ui/InputsPage.tsx` (search "the pencil turns ONE row", `saveEdit`, `tr key={inx}
  className="ined"`).
- How a walker signs in and moves: `raptor-port/CLAUDE.md` §Build & verify; the roles are an admin (Saber) and a member
  (Ranger). The loaded week is 13–19 Jul 2026; the demo carries an Event for ALL titled "Sports afternoon" on Wed 22 Jul
  2026 and a Duty for ALL AVAIL on Sat 25 Jul 2026. The Inputs list opens on today onward: "All dates" shows everything.

## NOT a finding (owner D56)
The app's stored world is DEMO DATA, cleared before the database step. Do not design a scenario whose only possible
finding is harm to data already stored when the code is correct going forward. **Not open:** the owner's choices in
D718–D724 (the card's layout, the kind as grey capitals, "By" only as ruled, no pencil and no cross, the phone's day
headings, the SANS day's card left as it is). **Known and put to him, not a finding:** on the DESKTOP table a shared
input still reads "Saber +3" and the kind is still a pill (the plan's §6).

## What to produce
A numbered list of scenarios a walker can execute through the app's OWN controls, grouped so two or three walkers can
split them without sharing a world. Each scenario: the role, the size (phone 390 wide / desktop 1440 wide), the exact
steps, and **what must be SEEN on screen** at the end (the words, where they stand, what must NOT be there). Cover at
least:
1. **The card on both surfaces, for every kind of entry** — plain; titled; remark only; a long title and a long remark
   (nothing cut, nothing printed over the hours); placed by someone else; a shared input of 2, 7 and 14 people (the names
   wrapping; "By" always); an input for ALL AVAIL and for ALL; an absence (leave, a downchit, OIL) and a commitment; an
   upchit; an input of several days; a late input; a shared input where only some people are late; a half-day leave;
   a person since archived or deleted; an input in another year.
2. **Every door the list lost, and where it is now** — change each field (person, kind, title, remarks, hours, all-day
   and half-day, the DATES), delete, the paperclip, revising an OIL answer, answering an unanswered OIL question — for
   an ordinary input, a medical one (a downchit retyped, an upchit, a document), a leave the Leave War approved, a
   shared input, an input for ALL AVAIL; as an admin and as a member (his own, another man's, one he filed for
   another); on a phone and on a desktop.
3. **The window's date calendar for a one-person input** — one tap, two taps, a tap on the saved day, a range moved
   whole, a move onto a weekend or a holiday (the OIL question), off one (an answer that no longer applies), a leave
   moved over another leave or over a medical entry (the clash rules), a downchit moved (the medical clash sheet), an
   upchit moved, an input whose remark carries "till <date>" and one whose remark carries none, a move on a PUBLISHED
   day (it must read as a pending change), Undo and Redo after each, the same input changed behind the open window.
4. **The phone's list** — the day headings and their counts under every filter (person, kind, search, the date
   window), an input of several days that began before the window, the just-saved input the filters hide, an empty
   list, the list after a delete from the window, after Undo, after turning the phone on its side, at 320 and 430 wide,
   crossing 820px with the window open.
5. **The desktop table** — sorting by every column with a window open, a click on each cell, on the paperclip, on each
   OIL chip, on the Name by keyboard (Tab, Enter), text selected with the mouse, a shared row, a member's view.
6. **Roles** — a member's own, another man's (read only), a shared input he is in but did not file, one he filed for
   others; the member's view of the list on a phone.
7. **What must NOT have changed** — the SANS day's card, the month's bars and their tips, the Medical tab's cards, the
   input's window small print (who placed it and when, in full), the schedule's rows, the board's dialog (no date
   calendar there).
8. Anything else you judge this build most likely to have MISSED — say why you suspect it.

Then, separately: **the five scenarios you would run first if only five could be run**, and **break tests** — one
deliberate fault per rule (what to change in the code, and which scenario should then fail).
