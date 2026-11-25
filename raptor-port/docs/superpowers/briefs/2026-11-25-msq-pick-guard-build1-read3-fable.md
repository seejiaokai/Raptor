# Build 1 plan, read round 3 — a fresh Fable (blind; chat 176, 25 Nov 26)

Read from the exported copy `C:\rc176` of `b09f67b12`. Saved whole by the host from its report file. Host note: its item 1 is right that the round-5 page and the plan disagree on E4–E7 and E9; N9 IS on the page (told, not asked: it cannot happen), V-Q4 is the page's D10.

# Round 3 — fresh Fable read of the Build 1 plan (exported copy C:\rc176, b09f67b12)

Read only; nothing run, no proof test written — every finding is from reading the plan, the rulings' full rows, the round-5 questions page and the code as it stands. Handoff blocks ignored, as told. No HIGH found. Eleven MEDIUM/LOW, most important first.

## 1 (MEDIUM) The plan and the questions page he is answering recommend opposite things, and one page answer the plan is not shaped for
The plan cites the q2 page (version 4) and never the round-5 page (`mock/2026-11-25-msq-pick-guard-q3`, E1–E9): no "E" code appears in it.
- **E5 = N6.** Page: "the pick goes through and gives it back, as today". Plan §8.3: "Refused". **F4 builds on the plan's side as if answered** ("a real pick of 142 from there is refused") and step 8 is not listed as waiting on N6.
- **E4 = N12.** Page: Down days and Failures close by themselves. Plan: refused, note names the Info tab. R8 pins "exactly the six"; the Tracker's closer only clears the event's details; §9 promises "five places only" in core.js.
- **E7 = row 21.** Page recommends refusing this Undo in the first build. Plan: "not built", step 6b deleted, B24 only a pin, no words, no step. The recommended answer has nowhere to be built.
- **E6.** Page: only 149's own admins are told, a Plan holder not; Hunter's name wears "142". Plan reading 10 and V10: Plan holders and a switched-on master admin are told; no number on the name. The other answer needs a new audience (the gate checks audiences too) — not a one-line switch.
- **E9, second point.** Page: windows not shown singly are "checked one by one; those with nothing to edit close by themselves". Plan reading 3: all refuse; the Leave War is ONE row that "does not tell its sheets apart". If he lets E9 stand, that row must be split per sheet with a closer each — not shaped for it.
- **On no page:** N9 (holds step 8), V-Q2, V-Q4, and readings 6, 8's button words, 12's "a Plan holder rung as admin".
- The page's 150 admin is Mako; the plan's is Petrel.
**Fix:** a table E-code → N-code → step; each recommendation made the page's; a step 6b back, marked "only on E7"; F4 and step 8 marked as waiting on N6; N9 put to him.

## 2 (MEDIUM) The SANS reminder's bell line lands a Plan holder on another squadron's SANS calendar, where part G lets him file nothing
`leavewar/sansunfiled.ts` builds the `sansdue` line with no squadron; `belltap.ts enterForLine` answers `'here'` for no squadron; `topstate.ts openNotice` then `setPage('inputs')`. Hunter (142's SANS aircrew, Plan of 149), 149 picked, taps "…Tap to file for availability": Inputs is offered on 149, so the page door passes at step 1 and 149's SANS calendar opens at his day — where §18.7 now offers only 149's SANS men, or greys the button. §9 names D2621's "its squadron first" for this line; §4.5 only makes it ask-first for a View-only pick. **Fix:** in the `due` branch, `enterForLine(his home that day, again, 'line', o)` before the page; B7/B28 gain "Hunter on 149, Saber on 150: 142 comes into view first"; R5 (a) gains the caller.

## 3 (MEDIUM, security, part V) Undo still lets one who may no longer give Plan END or LOWER it
`perms.ts restoreLeavesOut` point 4 leaves out only a put-back whose level is Plan; an Undo that removes a Plan row (Undo of a give) returns a line earlier, an Undo of a raise puts back View and is not point 4's, and the gate's Plan check exempts a verified replay. §19.2 says "the row put back"; V7 tests only a Redo after "made a member". Presses: Kestrel, 149's own admin, gives Hunter Plan of 149; still signed in he becomes only a Plan holder of 149 (moved at midnight, re-made admin, given Plan by Saber); he presses Undo — Hunter's Plan is ended by a Plan holder, and the ordinary "admin of 149" check passes him. **Fix:** `mayGivePlanOf` asked for any grant row that is Plan on either side of a restore, in the leave-out and in the gate; V7 gains Undo of a give and of a raise by a maker now only a Plan holder.

## 4 (MEDIUM, security) `mayGivePlanOf` is worded loosely enough to pass a moved admin
"An admin whose own squadron `unit` is that day, in the admin role." An admin who moved into 149 is a member there while his account still stores "admin" (`accounts.ts adminNow`, K3). Written as stored role + home, a forged command from him gives Plan of 149. **Fix:** say `adminNow(account)` and home is the unit, judged on the rows before the command; V5/V6 gain "a moved admin not yet re-made: refused at the door and the gate".
Checked, not a finding but tell him: a Plan holder of 149 still makes a 149 man its admin (D2336, kept), and that man may then give Plan — passing on by proxy.

## 5 (MEDIUM) D2621 is applied on his HOME page too — his own input can vanish from the page he files it on
§5.1's rule has no "another squadron picked" clause, and F13's loop enforces it everywhere. Saber (master admin, home 142, a move to 149 saved for 1 Dec) files leave for 5 Dec on 142's page: it belongs to 149 on its day, he can open 149's page, so it is off 142's list the moment it is saved. The same for anyone holding Plan of the squadron he moves to. D2621 says "with another squadron picked". **Fix:** the reach test applies only where the page's squadron is not his home that day; F13's invariant excludes his home page; one test for it.

## 6 (MEDIUM) Bug reports as saved records (§19.6) are described too loosely to build safely
- No home named: they must be app-wide records like accounts, or a 142 admin who never loaded 149 lists nothing.
- "Nobody changes one; an admin adds only his own seen" needs "seen" as a record of its own per admin.
- Neither filing nor "seen" may be an Undo step: else an admin's next Undo after opening Help undoes "seen", and a member's Undo un-files against the gate.
- V26 lacks: a report stamped with a squadron the filer cannot view (rings strangers' bells), an unknown category, over-long text.
- A member's "Your reports": unstated whether it wears the number.
Checked: who reads what is his ruling (every admin reads every squadron's; D2628 C5).

## 7 (LOW–MEDIUM) §1 over-promises, and step 9 writes it into the backlog
"A 142 input is never changed under a bar reading 149" and "F2 closed on every road" — but §1's own item 3 says Undo on 149 still reaches a 142 step, and `snapView` opens Inputs, which 149 offers a Plan holder. **Fix:** name Undo/Redo beside the moved man as the road left until Build 3, in §1 and the backlog line.

## 8 (LOW–MEDIUM) Part V's new bell lines are not tied to the bell's door
§19.2 never says what a tap on "Given Plan of 149" opens. `openNotice`'s last branch treats any unknown line as an input's: "That input is gone". §19.4's line opens 142's Admin → Users but is not in `lineOpens`, B7's families or the page-door census; built in a parallel chat before step 5 it would be written "mark read, close list, open". **Fix:** state both taps; add both to `lineOpens`, B7, R5.

## 9 (LOW) The list flips with the badge for a moved admin
`ownPageMayBe` reads the role in force. Saber, moved 142 → 149: admin view — old 142 inputs on 142's page only (F15); member view — on his 149 page, live. Say which is meant; F15 run in both views.

## 10 (LOW) `closeShown()` runs before the landing's question
§4.5 step 5 closes the show-only windows before `view.setPage`, so before the Tracker's question and the second ask; Stay or a late refusal leaves Insights closed with nothing changed — against §3.1 and B30 (a pick only). `enterForLine`'s bullets name no `closeShown` at all. **Fix:** in `landOnOwnPage` after the second ask; B30 gains the page door.

## 11 (LOW) §19.1 forgets the man with no sign-in
V1 lists five controls gone; the editor's other branch — `#accGive`, `#accGiveName`, `#accGiveRole` — is not named, and "Give sign-in" is not greyed by the row's lock today. Add it to V1.

## Checked, nothing found
- **Doors, from the code:** every non-test caller of `enterSquadron`, `switchRoleInForce`, `switchRoleView`, `pickSquadron`, `enterForLine`, `openBellRequest` is in §4.1; every `setPage` call site outside the store is in §4.5's table.
- **Windows:** ten movable-window ids in the source, the plan's ten. The show-only windows (Who's available, Changes, a SANS day, the Leave War's day panel) hold no box to type in; Quals' edit mode holds no draft.
- **Today's code, sampled after `main` came in — all true:** the pick, the view switch, the landing and its question, the Input window's note, the list's two callers, the seven places that keep Plan to a master admin, the access line's words, the bell's number, the Welcome card, Logout's reload, the reports array. Line numbers have moved, as §9 admits.
- **The split:** no press found where Build 1 alone refuses a door whose way out is a part-V control. Still there until 1V, and no worse: a 142 man's whole row live on 149's page for a Plan holder.
- **Headings:** a View holder or a member cannot reach them.
- **Three squadrons:** no two-squadron rule found beyond V-Q2's "admin of both".

## Not traced
The three "not traced" rows of §5.5; whether a 142 man can be placed on 149's schedule so that the OIL question after a save opens a born-greyed window once the root is in; `levelOfAccount`'s body (K3 taken from the code's own comments).

## Looks for his phone
The two fades on the small grey number; the note under the control on a phone on its side; "Add person" and "Cancel" above the keyboard; a folded heading's height.
