**Round 4 — independent walk scenarios**

This is a scenario design, not a completed walk. I ran no tests or build, opened no app, and changed no files. Expectations below target the requested commit, `a358d4b1a`.

I did not read another designer’s report. During the final source check, concurrent changes appeared in the working copy; a newly added code comment crediting the other designer became visible before I detected this. I then checked the relevant code directly from the requested commit. That incidental exposure limits the claim of complete blindness. No handoff block was pasted after compaction.

The strongest concrete candidate is **an unchanged title beginning with its kind**, such as “Training · Safety”: changing its kind can produce a false rename at the requested commit. This needs a real walk, not acceptance from the code read alone.

**Sources and walk conventions**

- **P:** D2521’s full row and the approved words under “After the fresh Fable’s read” and “His answer”.
- **F:** the supplied `facts.json` and approved mock.
- **B:** D769, the bell contract and notifications register.
- **W:** D1142 and D1166, covering Leave War notices and its shared leave.
- **I:** D716, D755, D776 and D953, covering titles, shared inputs and remarks.
- **U:** D148, covering Undo and sign-out.
- **D:** desktop **1440×900**. **P402:** phone **402×874**.

Every expected result below is a proposed assertion, not a reported pass. “RECORD” means capture the actual words without inventing an approved sentence.

Create new demo inputs through real controls. Use Saber as scheduler, Ranger and Casper as recipients, with suitable rights and future dates. For the exact July example, use the walk’s supported clock arrangement. Read recipients’ bells through normal account changes; do not assume separate live tabs synchronise. Complete Undo/Redo before signing out: sign-out clears Undo history.

**Coverage: where the sign and gesture belong**

| Qualifying surface or object | Visible sign and working gesture |
|---|---|
| Leave War’s approved leave, bids and replacement | Leave War grid/leave door; change or approve there, then inspect the recipient’s bell and the corresponding Inputs entry. |
| Shared input, individual split, filer’s copy | Named people and filer receive the appropriate line; edit through the shared window or a person’s schedule row. Reopen every affected copy. |
| Inputs list and calendar | A list row opens the input window. Calendar bars/day cards also open it; dragging a bar changes dates. **The Inputs list’s displayed cells are not independent editors.** |
| Schedule’s Personal Inputs, Unavailable and Ground Programme | Row/type/pencil opens the input; supported time/name/remark cells edit in place. Week and board have distinct event paths and both require coverage. |
| Medical and SANS Availability | Their own visible entry opens the shared input editor; half-day changes must reach the same notice writer. |
| Input window | Kind, title, Attach “To”, dates, half/all-day, clock times, remarks and people; Save, Cancel and any confirmation sheet. |
| Other input-changing actions | Cancel/restore, programme/unavailable placement, removal and people reassignment. These can precede changed words in a combined line. |
| History and permission checks | Undo/Redo must restore the input and its notices together; member saves must survive the permission check and reload. |
| Bell readers | One shared list is drawn from the main-bar bell and board-bar bell, on desktop and phone. Read state, badge, age, scrolling, “more below”, Mark all read and line navigation consume the same notices. |
| Passing notes | Input window and schedule cells; every schedule seat family; Inputs default-window editor; publication from week/board; period creation from both warning lists; OIL day-list Save. |
| Overlays | Input window, calendar/row confirmation, bell, board, Leave War sheet and OIL day list. The final note must remain visible and unobscured. |
| Persistence and downstream views | Reload, Inputs list/calendar, week/board, Medical/SANS and Leave War must agree with the saved input. No duplicate records or notices from one action. |

The object sweep includes every offered kind: LL, OL, OIL, CCL, PL, FCL, EL, CL; HL, OML, ATT C, ATT B; Training, CSE, Meeting, Attach, Personal, Appointment, Duty, Event, OD, Other; SANS Availability and Upchit. Exercise every *permitted* transition within these families. Do not force an unsupported kind/half combination.

**Ranked scenarios — specialised and less-shared paths first**

**R4-01 — Leave War’s copy and its separate writer. D + P402; scheduler, then member.**

Setup: approve Ranger’s LL through Leave War. Open its corresponding input.

Press: change LL to OL through Inputs; save; reopen both copies. Separately change all-day to AM. Repeat through any genuine Leave War control offering the equivalent change. Finally approve a fresh bid directly through Leave War.

EXPECTED: Inputs-origin changes say `LL changed to OL · Saber` and `Now LL (AM) · Saber` where applicable [P]. Both copies agree [W/I]. A war approval produces its war decision line, without a duplicate “You were added” [W]. RECORD the exact war-origin retype/half sentence.

Disproof: one door changes the input without telling Ranger; divergent copies; raw half-day clock times from the Inputs change; duplicate ordinary and war approval lines.

**R4-02 — Attach’s destination and kind-derived title collisions. D + P402; scheduler.**

Setup: separate Attach inputs with and without titles; Training titled `Training · Safety`.

Press: change only Attach “To”; save. Add/remove its title separately. For Training, change only kind to Meeting, retaining the title; save and reopen.

EXPECTED: Attach destination and title addition/removal retain `Renamed — was …` [P, recorded reading]. The Training case says `Training changed to Meeting · Saber`, with no rename when its title words remain identical [P].

Disproof: destination change is silent; a kind change is called only a rename; unchanged title adds a rename or inflates “more changes”. The last case is a specific candidate in the requested commit.

**R4-03 — Member filer, permission check and replay. D + P402; member.**

Setup: an authorised member files an input for other named people; filer is not a participant. Prepare another where the filer participates.

Press: as that filer, open the input, change kind; save. Repeat with half and with date/title/remark changes. Undo, Redo, then reload. Afterwards inspect recipients’ bells.

EXPECTED: every authorised save survives reload and produces the applicable new wording [P/B]. Undo/Redo restores the corresponding input and notice state [U; existing history behaviour]. The actor gets no self-notification; eligible recipients do [B].

Disproof: member save appears successful but rolls back; rejected notice causes the whole change to fail; replay duplicates or loses the line; scheduler works but member fails.

**R4-04 — Individual change inside a shared input. D + P402; scheduler and permitted member.**

Setup: Ranger and Casper share a timed input visible under Unavailable or on an input-derived schedule row.

Press: open Ranger’s own row/time door; make a permitted individual change; save. Repeat through the whole-input window. Undo/Redo before sign-out.

EXPECTED: the individual operation changes only its intended person; the whole-input operation changes all intended people [I]. RECORD each recipient’s exact sentence; any generated kind/half/multiple-change wording follows P.

Disproof: no line from the individual route; wrong recipient; accidental whole-group change; one split produces duplicate or unrelated notices.

**R4-05 — Replacement bid must survive shortening. D + P402; scheduler, then member.**

Setup: Ranger has an LL bid. Prepare an input change that replaces it using the real replacement confirmation.

Press: first perform a simple replacement. In a separate eligible case, combine the replacement with enough genuine changes to shorten the body; confirm.

EXPECTED: ` · replaces your LL bid` remains after the other parts and is never included in the change count [P/B]. Newly added recipients receive their addition line, rather than another person’s continuing-participant summary [B].

Disproof: missing suffix, suffix among the first two parts, inflated count, duplicate replacement notice. If no real door permits the combined case, record that limit rather than manufacture it.

**R4-06 — In-place time editors, including generated ground rows. D + P402; scheduler and authorised member.**

Setup: timed inputs visible in Personal Inputs, Unavailable and input-derived Ground Programme; repeat on week and board wherever editing is offered.

Press: select Start, replace with `2560`, commit by Enter and separately by leaving the cell. Repeat End with `09:99`; then valid `0900` and `09:00`.

EXPECTED: retained invalid text produces `<typed> is not a time. Try 0900 or 09:00.` [P]. Failed edits leave the saved time unchanged. Both valid forms save equivalently [P examples; existing behaviour].

Disproof: old wording survives in one editor; wrong value is named; invalid time saves; focus-out differs from Enter; note is immediately overwritten.

**R4-07 — Input-window invalid-time order. D + P402; scheduler and authorised member.**

Setup: timed input opened from Inputs, schedule and calendar.

Press: enter a bad Start, then a bad End; press Save. Repeat with only End bad. Correct and save.

EXPECTED: when the controls retain invalid values, the first bad box is named using P’s exact sentence. The window remains open and saves nothing invalid.

Disproof: End is reported before bad Start; generic old wording despite retained invalid text; the window closes or partially saves.

Native time controls may reject the keystrokes themselves. RECORD the retained value and visible response. A browser that never submits `2560` does not prove the application’s invalid-time sentence was exercised.

**R4-08 — Drag back to every seat family. D + P402; scheduler.**

Setup: occupied flying crew and passenger seats, duty seats, ground seats, simulator seats where offered, input-derived ground seats, and supported placeholder seats. Include ALL AVAIL.

Press: lift the puck, move visibly away, return to precisely its original seat and release. Repeat a slow phone drag. For a placeholder, also use the supported tap-placement route.

EXPECTED: `<callsign> — already in that seat` using the displayed placeholder name where applicable [P/F]. Occupant remains; no successful move or new history entry. The destination visibly acknowledges the drop as on main today.

Disproof: generic “already there”, wrong name, silence after a confirmed drag, disappearing puck, duplicate occupant or unintended move.

An Unavailable reassignment is a separate input operation: RECORD its baseline response rather than assume it is a schedule seat.

**R4-09 — Half-day family sweep. D + P402; scheduler, then member reader.**

Setup: separate eligible inputs across all leave kinds, medical half-day kinds and SANS Availability.

Press: open window → AM → Save; then PM → Save; then All day → Save. Separately change date and AM together.

EXPECTED: `Now <kind> (AM)`, `Now <kind> (PM)`, `Now all day`; date-plus-half gives `Now Thu 16 Jul (AM)` in the approved fixture [P]. Dates, half and schedule appearance agree.

Disproof: clock ranges instead of AM/PM; old kind; lost half; mismatched calendar/schedule; different words through Medical or SANS.

No ordinary titled half-day creation route was found: titled kinds do not offer half-day selection [I]. `Now AM` therefore remains a renderer obligation, not a claimed production walk pass.

**R4-10 — Calendar movement and confirmation order. D + P402; scheduler and authorised member.**

Setup: single-day, multi-day and shared inputs; include AM leave, OIL and medical cases with confirmation.

Press: drag to another day → Cancel confirmation. Repeat → Confirm. Repeat whole shared bar versus individual bar. Undo/Redo.

EXPECTED: cancellation writes no change or notice; confirmation writes one coherent change [B/I]. Half remains correct. RECORD the date-only bell sentence when an already-AM input is moved: P explicitly supplies the simultaneous date-and-half example, not every unchanged-half case.

Disproof: notice before confirmation; cancel leaves a notice; duplicate lines; duration or people change unexpectedly; omitted notice from one drag route.

**R4-11 — Approved three-change example and count boundaries. D + P402; scheduler.**

Setup: untitled Training for Ranger.

Press: in one window change date to Thu 16 Jul, title to Range brief, and remark; Save.

EXPECTED: heading `Range brief Thu 16 Jul`; body `Now Thu 16 Jul, renamed — was Training, and 1 more change · Saber` [P/F].

Repeat with exactly one, two and four genuine change parts. EXPECTED: no remainder for one/two; singular `1 more change`; plural `2 more changes` [P]. Date plus time is one “when” part; adding several people is one addition part [B/current writer].

Disproof: dropped remainder, wrong arithmetic, old five-word truncation, or counting changed fields instead of spoken parts. Do not substitute a cancel-plus-rename sequence that cannot happen in one save.

**R4-12 — Ordering, names and capital letters. D + P402; scheduler.**

Setup: shared input retaining Ranger, with another person added/removed.

Press: combine date with people changes; separately combine kind, title and remark. Exercise available cancel/restore and programme/unavailable controls in their actual sequence.

EXPECTED: later ordinary phrases begin lowercase; callsigns, kind names and `You` keep capitals [P]. The first two follow the established action/date/people/name order [B]. RECORD exact status sentences outside P’s examples.

Disproof: `now` first, `Renamed` after a comma, lowercased callsign/kind, reordered misleading summary, or a second save retroactively replacing the first save’s meaning.

**R4-13 — Remark and “till” neighbours. D + P402; scheduler.**

Setup: multi-day input with typed remark and its till-date setting.

Press: edit only remark; separately toggle till; separately extend dates without touching the remark. Combine each with kind/title changes.

EXPECTED: genuine remark/till changes count appropriately; automatic date-derived wording does not become an extra remark change [I/D953]. Shortening follows P.

Disproof: spurious remainder on date-only change; explicit till change silent; untouched remark reported as edited.

**R4-14 — Every input-opening door. D + P402; scheduler and authorised member.**

Setup: fresh equivalents of an untitled leave and titled activity.

Press separately: Inputs list row; calendar card/bar; schedule row/type/pencil; board row; bell line. Change only kind and Save. Repeat title-only through each available title editor.

EXPECTED: same approved kind/rename distinction regardless of opening door [P/I]; real destination and editor remain usable [B]. Reopening shows the saved result.

Disproof: one door bypasses the notice writer, saves a stale copy, changes extra fields or opens the wrong input.

**R4-15 — Phone bell geometry and navigation. P402, repeated D; member and scheduler readers.**

Setup: approved three-change example, a long title, long callsign, replacement suffix and enough notices to scroll. Initially remove priority tasks.

Press: main bell → scroll → tap changed line; return → Mark all read. Repeat from board bell. Repeat with an outstanding priority task.

EXPECTED: approved example fits the approximately 307px body width as the supplied two-line picture [F]. No clipping, overlap or horizontal scrolling; age and unread marker remain distinct [B]. Tap opens the correct current input; board exits as required. Read state and counts agree. Priority tasks retain their established first destination [B].

Disproof: suffix or actor disappears; wrong tap target; inaccessible lower lines; false “more below”; different wording between bells; priority routing broken.

**R4-16 — Look-ahead setting and its audience. D + P402; scheduler, then member.**

Press: Inputs date-range control → default-window edit → set four weeks and Sunday option → Save. Repeat one week; repeat Sunday unchecked; Cancel a separate edit.

EXPECTED: `Everyone now opens on the next 4 weeks, to Sunday`; one week uses `the next week`; unchecked omits `, to Sunday` [P/approved words]. Reopen Inputs as another person and check the actual default. Cancel changes nothing.

Disproof: missing “Everyone”, bad singular, success note without saved setting, wrong Sunday endpoint, member gets an unauthorised editing control.

**R4-17 — Publication without a Leave War period. D + P402; scheduler.**

Setup: qualifying new weekend and holiday schedules in an uncovered year; comparable covered-year and ordinary weekday cases.

Press: publish/approve from week; repeat from board. Include a case with another publication warning.

EXPECTED: final note includes the complete separate sentence `No Leave War period for <year>, so no OIL can be earned for this day. Create the period on the Leave War.` [P]. The day’s warning list agrees. Other warnings remain intelligible.

Disproof: old sentence survives in either route; wrong year; warning swallowed by another note; missing-period sentence appears for a nonqualifying control case.

**R4-18 — Create-period buttons, destination and refusal. D + P402; scheduler and member.**

Setup: R4-17’s missing-period warning on week and board.

Press: on desktop hover `Create the <year> period`; then click. Repeat from the other surface in a fresh uncovered year.

EXPECTED hover: `Creates the <year> Leave War period, with nothing open for bidding, and takes you to the Leave War to open its dates`. Success: `The <year> Leave War period is created. Open its dates for bidding here.` [P/approved words]. Destination is the correct year, initially unopened.

Member EXPECTED: no ordinary create button, as on main today. If a real permission-change sequence reaches the refusal, it says `Only a scheduler can create a Leave War period` [P].

Disproof: lowercase phrase, duplicate period, wrong year, absent destination, or unauthorised creation. Do not claim hover coverage from a phone tap.

**R4-19 — OIL day-list member boundary. D + P402; scheduler, then member.**

Setup: scheduler opens a day with OIL answers; save a legitimate answer. Re-enter as member. Try a real role-change sequence only if the app offers one without inventing controls.

EXPECTED: member’s list hides/closes as on main today. If its Save refusal is genuinely reachable, `Only a scheduler can answer from this list` [P/F].

Disproof: member can submit, stale list survives usable, or reachable refusal has old wording. F records the ordinary member route as unreachable; absence is not proof that the refusal was displayed.

**R4-20 — Old readable lines and unchanged neighbours. D + P402; member.**

Setup: preserved pre-build demo notices containing old title parts and old clock-time parts, alongside newly created notices.

Press: open both bells, read, scroll, mark read, reload and reopen.

EXPECTED: old title and clock parts still render their established words [P]; new kind and half parts use the new words. Existing holiday, posting, Leave War opening/decision and deletion destinations retain their registered behaviour [B].

Disproof: blank body, crash, unreadable old part or new data still written in an incorrect old form. This tests reading only: no migration or historical-data cleanup is proposed.

**Explicit negatives and limits**

- Only one production caller of the shared bell wording was found. Separate desktop/phone wording implementations are not expected; separate entrances, layout and navigation still need walking.
- The Inputs list is a door to the window, not a missing inline editor.
- Titled half-days are not normally creatable. Do not inject one and call it production evidence.
- Ordinary members cannot reach period creation or OIL day-list Save. Forced controls would not establish a real route.
- Actor self-notices and notices to every person represented by ALL AVAIL are not expected. Named recipients and eligible filers are the relevant audience.
- OIL earning calculations are outside this wording change. The new-data publication checks above target warning presence, wording and navigation.
- Input-notice “taken back” improvements belong to separate outstanding work. Do not demand that unrelated behaviour from this round.
- Historical records needing conversion are excluded. Old-line readability remains included because it is expressly promised.

For every executed case, retain the before state, actual gesture, final visible words and reopened saved result. An unreached gesture is **not reached**, never a pass.

Rulings: none this session.