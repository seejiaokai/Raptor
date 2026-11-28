# [MSQ-PICK-GUARD] Build 1's plan — the red team, round 2: a fresh, blind Fable reader (chat 175, 25 Nov 26)

Brief: `2026-11-25-msq-pick-guard-build1-read-brief.md`, its last section. Read from an exported copy of commit `df9a68f6a` (`C:c175b`; the handoff block, the writer's brief and round 1's three reports taken out). Blind to the other two readers; kept outside the checkout until all three had reported. Saved whole by the host.

---

I read the exported copy of commit df9a68f6a, round 2. Reading only: nothing run, no test written, no file changed. I opened no handoff block, no other reader's report, no writer's brief.

Count: 2 HIGH, 5 MEDIUM, 4 LOW.

## HIGH

**H1. The page door says no, and the caller opens the window anyway — a 142 input live over 149's View-only Sched.**
- Failure: Ranger (142's, View of 149), 149 picked, a change not saved, his own weekend OIL question unanswered. He taps the bell. The "Blocked:" note shows, and with it the toast "Weekend/PH work — confirm your OIL", the OIL question, and his 142 input's window drawn over 149's View-only Sched — noted as opened on 149, so live. His answer writes 142's record under a bar reading 149. Today he is carried home first (P2 4).
- Cause: `ui/topstate.ts openInputOnPage` is `setPage('inputs'); notify(); landingAsk()…else open(false)`. With the door answering false, `landingAsk()` is null and `open(false)` runs `first()` and `setInpEdit(row)`. `InputWindow.tsx` then takes `pageSqn = UNIT` (not on Inputs), so `held` is false. §4.5's "a caller that forgets to ask first still cannot move him; the worst is a line read or a card spent" is untrue for this function and for `leavewar/sync.ts openInputWindow` (`setPage`, then `setInpEdit`). The bell's OIL ask-first line is in §4.5's table but §10 builds it at step 7 (waits N8, N4); step 5 says "every door but row 21". F2b asserts only `UNIT`.
- Fix: step 5 — `openInputOnPage` and `openInputWindow` return on a false answer, as their own first line; the bell's OIL ask-first moves to step 5 (it needs no N8). B9, B6b, F2b assert `INPEDIT` null, `OILASK` null, no toast. R5 gains (c): no caller outside a page tab discards the door's answer. Correct §4.5's sentence.

**H2. N2's and N8's recommended answers cannot both be built through the one `ownSqnOf`; built as written, security F2 stays open and F1 (the test) cannot pass.**
- Failure: Hunter (142's, Plan of 149), 149 picked, his own 142 duty unanswered, taps the bell — F2's own case. Door 2 calls `enterForLine(ownSqnOf(row, pageUnit('own')))`, the page being 149. 149's Inputs page lists that input because it names him (`engine/inputs.ts inputsListed`: touches the unit OR names him). N2's clause ("the page's squadron for an input that page lists because it names him") answers 149; `enterForLine` says `'here'`; the window opens live under 149 and the answer writes 142's record. The same for an OIL-list card naming him.
- Cause: §5.2 puts N2's clause inside the function §5.3 says the doors "must ask"; step 7 is not marked as waiting on N2.
- Fix: two answers, not one — where an input belongs (the doors: page if it touches it, else `inputUnitOf`; no N2 clause) and whether its window is held (the root: N2's clause). Or put N2 and N8 to him as one question: "his own 142 input while 149 is picked — live under 149, or 142 first; the same at the list, the calendar and the bell". Step 7 waits on N2. §1 must not say F2 is closed while N2's recommended answer leaves the same write open from 149's Inputs list.

## MEDIUM

**M1. The OIL card's `skip` stops one call short — round 1's finding 11 is closed in the table only.**
- Failure: N4's state (142's list over 149's View-only Sched). The card passes `ownPageRefused(…, skip: ['oilday'])`, then `openInputOnPage` calls `setPage('inputs')` with no options: the door counts the list the card sits in and refuses. Then H1 opens the window anyway. In tests the entry checker also throws: it asks `refusalAt` with no skip at the landing's `enterSquadron(home, …, true)`.
- Fix: `openInputOnPage(iid, first, still, opts)` hands `door` and `skip` to `setPage`; the checker reads the same kept door-and-skip variable the landing reads; `enterForLine`'s signature gains `opts` (§4.5 gives it none). B25's third clause asserts the window opened.

**M2. N6 is built on before he answers.** §8 says no step starts on a recommendation, yet N6 "blocks nothing in the code if answered as recommended", so steps 1 and 3 ship its recommended answer.
- Failure: Saber, a master admin moved 142→149 at 00:00, an Input window with words typed, held. Today a pick of 142 gives it back live with his words (P5 N6). After step 3 that pick is refused and the only way on is Close, which drops them unasked. §1 lists "every change he did not make" as unchanged.
- Fix: N6 in the "Waits on" of steps 1 and 3; the other answer (a window already held does not count) designed before step 1, since the rows must know "held".

**M3. H8's wait cannot be built at the page door.** §4.2 puts "a save still going" at every door; §4.5 and §11 risk 11 make the page door a synchronous true/false that its callers read in the same tick.
- Failure: Ranger on 149 changes something, presses a bell line of his own input inside the 0.3 s wait: the door has no way to wait, so it either lets him home with the save in flight (P2 6's fault, on this family) or refuses with no words.
- Fix: say which. Recommended for his answer: the ask-first callers wait and run the tap again (as `again` does); the bare door treats `saveSettling()` as refused. B20 gains a page-door case.

**M4. A missing window: the Inputs list's "OIL?" button.** `ui/InputsPage.tsx reviseOil` raises `<OilConfirm>` from the page's own state (`oilConf`, l.437, l.1013) with no Input window under it. §3.2 (e) says the OIL question "stands over a window already counted — no row". R3 counts the frame once in `OilConfirm.tsx`, so the census maps it to that reason and passes. It is shaded and holds Tab, so no door is reachable today — the same as every shaded row the plan does count.
- Fix: a row (`useGuardWork` on `!!oilConf`); R3 also counts each `<OilConfirm`, `<UpchitConfirm`, `<MedClashConfirm`, `<DocConfirm`, `<AskCard` use, mapped to the counted window it stands over.

**M5. Step 1 turns the pull request's code check red.** §3.1 and §3.2 (b), (c) export each predicate "from the component's own file". This repo keeps component files to components only (React Doctor's only-export-components, D1534 — `leavewar/ui/daypanelopen.ts`, `ui/winorder.ts`, `ui/topstate.ts` were split out for it), and a new finding fails the check. About fifteen files. `AvailWindow isOpen`, `ChangesWindow chgUp`, `CxDialog open` are locals inside component bodies today.
- Fix: each predicate in a sibling plain module that the component and `ui/guard.ts` both import; R1 reworded to match.

## LOW

- **L1.** Step 6 ties the checker to N11, whose recommended answer has no known place to be built (§14: where Undo can be asked before its step "was not found"). Split: the checker goes on with row 21 allow-listed by name; N11's door is its own step.
- **L2.** Tests too loose. B25's second clause ("142's list on 142 … a change not saved: refused") — nothing changes squadron there, the door never asks; as written it either fails or makes a builder add a refusal nobody ruled. P16 must say "a line of the squadron his pages are on": a deleted input's or a holiday's line of a squadron he can enter does enter it today (`openNotice` calls `enterForLine` first) and will be refused. F4's raw entry with `byPick` true throws under the checker. R5 (a), a "pin" at step 6, must change at step 7 (two new `enterForLine` callers).
- **L3.** `skip` "names row ids", but §3.2 (a) makes the ten movable windows one row; `'inputedit'` and `'oilday'` are ids inside it. Make it one row per id, or say `skip` takes window ids.
- **L4.** Steps 4 and 5 omit H8 from "Waits on", though §8.1 says it blocks steps 3–5.

## Checked, nothing found

- **The page door refuses nothing that changes nothing.** `perms.ts pageOffered` is false only for someone signed in with a "View only" squadron picked, and then home is never the squadron in view. Tabs and ☰ pages are drawn only when offered; `logout.ts` asks `pageOffered` first; `Login.tsx` runs after the reset. Sign-in, sign-out, the midnight move, a right ended and the landings all call `view.setPage` inside `store.ts`.
- **The doors.** Every non-test caller of `enterSquadron`, `switchRoleView`, `switchRoleInForce`, `pickSquadron`, `enterForLine`, `openBellRequest`, `switchUnit`, `setUnitInView` is in §4.1. No key handler for Undo or a pick exists. The Undo pair is not drawn on View-only Sched or Help (`Shell.tsx pairOn`). Six files reach `view.setPage` today, as the plan says.
- **Marks before the ask.** `openAdminUsers` (the Users intent), `openWarAt` (the ring, the war selected), `WelcomeBack` (the card spent) are each asked first by the plan. `openNewPeriod` (its ask set first) is pressed only inside the Calendar window, which closes itself when its squadron is no longer the page's.
- **Counted means drawn.** A `FloatWin` joins and leaves the order at mount and unmount; Inputs, Quals, Logic, Help and Admin unmount off their tab; Insights, the medical move and the OIL question before a change sit at the top level and draw from their flag alone; the board's two dialogs hide by their own `open`.
- **Pins.** P1 (the ☰ menu stays open), P2, B17 hold in the code. `core.js ask` returns false under an open Tracker box. `saveRefused()` is `'failed'` only.
- **A "Not saved" that never clears** refusing every door: D2594 was ruled with that cost told. Not a finding.
- **N1, N7, N3, N5, N10** are each gated by a step.

## Not checked

The Tracker's side pop-ups and the Leave War sheets' bodies; the stylesheets; whether a failed save can be dropped other than by Retry; every "not traced" row of §5.5. For his iPhone: nothing beyond the plan's own list.
