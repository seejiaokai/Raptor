# [MSQ-PICK-GUARD] Build 1's plan — the red team, round 1: a fresh, blind Opus reader (chat 175, 25 Nov 26)

Brief: `2026-11-25-msq-pick-guard-build1-read-brief.md`. Read from an exported copy of commit `9c0d03e93` (`C:c175`; the handoff block and the plan writer's brief taken out). Blind to the other two readers; kept outside the checkout until all three had reported. Saved whole by the host.

---

I read the exported copy of commit 9c0d03e93 (C:\rc175, branch claude/msq-b1-screens-135). I did not open any handoff block, any other reader's report or the writer's brief. I ran nothing; every finding below comes from reading the code in the copy.

# Red team of the Build 1 plan (Opus, blind)

## 1. HIGH: a door left open. A bell line or the bell's own OIL tap whose squadron his pages can never be on brings his own squadron back with nothing checked
- **Failure.** Ranger is 142's, with View of 149 and of 150. He has 149 picked, and a save has failed ("Not saved" is up) or a counted window is open. He presses a bell line about a 150 input that names him (or a line from a squadron he has since left). `belltap.ts enterForLine(150)`: the squadron is not his own page's, and `ownPageMayBe(150)` is false, so it answers `'no'`. The plan refuses only "where it would enter" and in its one new case (`u === pageUnit('own') && u !== UNIT`), so this press is never asked. `topstate.ts openNotice` then reaches its input branch, calls `openInputOnPage`, which calls `setPage('inputs')` and then `notify()`. `store.ts landOnOfferedPage` sees a page that 149 does not offer, so it runs `landOnOwnPage`, which calls `enterSquadron(home, …, true)`. The squadron changes with the window open or the change not saved. That is the very case D2594 and D2403 rule out, and it is the plan's own row 7, reached by another road.
- The bell's own OIL tap (§5.3 door 2) has the same hole. Its `'no'` result "opens it as today", and today calls `setPage('inputs')`, which lands the same way. So §4.1 row 9's "today nothing" is also untrue for a View holder with a view-only squadron picked: that tap enters his home today, unchecked.
- **Cause.** The test "would this press move him" is put on the line's squadron. The thing that actually moves him is the landing: one of his own pages opened while a squadron he only views is picked.
- **Fix to the plan.**
  - Judge the landing in one place, before anything is opened. A guarded helper (say `openOwnPage(page, door)`) refuses when `!pageOffered(page)` and the guard would refuse. `openInputOnPage`, `openAdminUsers` and the war-line branch of `openNotice` call it.
  - Alternatively, in `enterForLine`, treat `'no'` with `UNIT !== pageUnit('own')` the same as the new case whenever the caller will open one of his own pages.
  - Add tests B6b and F2b: Ranger on 149, a 150 input line pressed, and then his own OIL tap on a 150 input. Both must be refused with `UNIT` unchanged.
  - The same helper is where rows 12 and 13 (N3) plug in later.

## 2. MEDIUM, a trap if its road is reached: a window on a page the squadron in view no longer offers refuses everything, and he cannot reach it to close it
- **Failure.** Hunter has 149 picked by Plan. He opens a person's window on the Leave War. It does not shade the page, so he can press the Inputs tab, and the window stays open behind it (the plan's §3.3). Then a change he did not make leaves him holding only a View of 149. One road is a dated Plan ending at midnight while a View still stands; the backlog notes that today's tab never hears another admin's change until a reload. `entryDue` re-enters 149 with the war held, his own pages become 142's, and 149 now offers only View-only Sched and Help. `warWindowOpen()` is still true. From then on every pick, both view switches and every cross-squadron line are refused ("close the open window…", or under N1 "…on Leave War…"). But the Leave War tab is not drawn, so nothing on screen can close the window. Only Logout (which loses the window) or a reload gets him out. Before Build 1 a pick of 142 got him out.
- **Cause.** The plan's §3.3 counts a row "wherever it is". Its risk 6 assumes the held window "keeps its Close", which is true only while its page can be reached.
- **Fix to the plan.**
  - A row whose `where` is a page that `pageOffered()` denies in the squadron in view does not count.
  - A test: the state above is made by the midnight clock, and a pick of 142 goes through.
  - Say on the questions page beside N1 and N6 that this is the agent's reading.

## 3. MEDIUM: a window added next month passes the plan's own tests when it lives in a file already counted, or keeps its flag outside `pops.ts`
- R1 reads only the flags in `ui/pops.ts`. R3 and R4 map each file to row ids, not each window.
- **Failure.** Someone adds a second dialog to `ui/Modals.tsx` (or another modal to the Tracker's `Modals.jsx`), with its own flag in `state/view.ts`, as ALL AVAIL, Changes and `OILWAIT` already have. R3 passes because the file is already in the census. R1 never reads `view.ts`. A pick with that dialog open goes through silently.
- **Fix to the plan.**
  - R1 also reads every `export let` in `state/view.ts`, and the module-level `let` in `tracker/app/core.js`.
  - R3 and R4 count each occurrence (each `role="dialog"`, `<Sheet`, `.modal` and `.airpop` per file), and the census pins the count per file. A new occurrence fails until it is mapped.
  - Note what can never be caught: a form in Admin whose typing lives only in its own component, with no frame. That is a known limit to state, not a test to promise.

## 4. MEDIUM: the build order leaves GitHub's run red between step 3 and step 5
- The checker is put on `enterSquadron`'s `byPick` path at step 3. `enterForLine` and `landOnOwnPage` both call that path with `byPick` true. So every existing bell test that taps a cross-squadron line with a window open throws from step 3 onward, but the plan re-points those files only at step 5. The same goes for tests of the Input window's own "Back to the admin view" chip, which now throw inside `switchRoleInForce` with the held window open.
- **Fix to the plan.** Install the checker in the last door step (5), or switch it on door by door. Put the chip's tests in the allow-list in step 0.

## 5. MEDIUM: things a person would see that are built on the agent's own reading, against D2611
- **The Tracker's question at the switch to the member view.** "Save them before switching to the member view?" is built and asserted exactly in B14, but no ruling names it (the plan says so itself) and it is not marked `[WNS]`. Mark it, and send it to the words read and the questions page with its "back" twin.
- **§3.3 N1.** "Until he answers, the row is built to refuse" builds the unanswered side. Either hold those rows out of the build until he answers, or list them as built on a reading.
- **§4.5.** Lines that would not have moved him get the note anyway. This covers a deleted input, a deleted man, and a holiday line of his own squadron while he is viewing 149, which changes no page. That is a reading, labelled "accepted". It should be a question, or avoided: check what the line would actually open first.
- **F1.** The bell's OIL tap now switching him to 142 (with the Tracker's question) extends D2325 to a tap D2403 lists as "not covered". It needs to be named as a reading and put to him.

## 6. MEDIUM: N4's other answer cannot be built. The OIL list's own card is refused by the list it sits in
- In the N4 state, Hunter views 149 and 142's OIL list stands over 149's View-only Sched. Under §5.3 door 1 the card goes through `enterForLine(142)`. That hits the new case (142 is his own squadron, 149 is in view), the guard runs, and the OIL list counts as a window. So every card press is refused by the list it is pressed in.
- **Fix to the plan.** Either make door 1 skip the `oilday` row (as the chip skips with `heldChip`), or state that N4 has only one buildable answer.

## 7. MEDIUM: Part F's root greys real windows from the moment they open, with untrue words, and the roads to it are found only at the final walk
- After step 6, any door that opens an input whose own squadron is not the one its page shows makes the window born greyed. The band reads D2323's "This is 142's. You picked 149 — close this to go on." if he picked anything earlier in the session (`enteredByPick` is still set). Otherwise it reads the generic "This change could not be saved.", which is false: nothing was tried.
- N2 names two such doors (the Inputs list and the Inputs calendar). The other 18 `setInpEdit` doors are "walked" only in the FULL check, after the build.
- **Fix to the plan.** List the 20 doors now, before step 6, each with "can the page and the input's own squadron differ?". Any door where they can is a question for him, not a greyed window by default.

## 8. LOW findings
- **`noteAtFoot()` cannot know "the door was pressed inside ☰".** Both lists share the door id `pick`, and both view-switch controls share theirs. The ☰ menu closes itself (`setDrawer(false)`) before `switchRoleView` runs. Fix: each door passes where it was pressed (`'bar' | 'drawer'`).
- **The Tracker's `dlg` row.** Its `close` in `TRK_WINDOWS` must be `dlgCancelAll()`, which answers the waiting promises, not `dlg = null`. `endSession` uses the first, and a plain clear would leave an import waiting for ever.
- **`toastAt` and `AT`.** "Any other `toast()` clears `AT`", but `toastAt` itself calls `toast()`. Say that `AT` is cleared only by a toast that did not come through `toastAt`.
- **The fall-back to the foot is never checked against a window's ✕.** A desktop window dragged to the bottom centre would have its ✕ covered, against D2590. Add that to the e2e test.
- **The plan contradicts itself on what gets built.** §3.2 says "`counts` is what the plan builds unless he answers otherwise", while §8 says "none is built on the recommendation". §8.1 has no "blocks" column, so a builder cannot tell which rows wait.
- **B8's set-up rests on H2 being answered "ALL AVAIL counts".** If H2 goes the other way, use the "Not saved" reason there instead.

## Explicit negatives (checked and found nothing)
- **The callers.** Every non-test caller of `enterSquadron`, `switchRoleView`, `switchRoleInForce`, `pickSquadron`, `enterForLine` and `openBellRequest` is in §4.1. The extra caller of `setEffectiveRole` is `probe-bridge.ts`, a developer's switch only.
- **`setPage` callers.** None of the ones I traced brings a squadron back: the Leave War's `openWarAt`, `openInputWindow`, `openInputsPage` and `openNewPeriod`; the board's "make a period" press; Logout's Tracker step; the bug-alert tap to Help. Each acts on a page that a squadron he only views does not offer, or on Help, which it does.
- **The plan's claims about today's code hold:**
  - `pick.ts` (where the early return for the squadron already in view sits; `pickWillAsk`);
  - `belltap.ts` (the `'here'` test; the `'asked'` return comes before anything is marked read);
  - `store.ts` (`landOnOwnPage` called from every `notify`; `switchRoleView` synchronous and asking nothing; `ENTERING`; `trkMayHold`; `maybeReenter` entering with `byPick` false);
  - `core.js` (`'switching to ' + to`; `if (dlg) return false`; `endSession`'s list);
  - `savewait.ts saveRefused()`;
  - `winorder.ts` (`forward` in a layout effect, `gone` at unmount);
  - the Leave War's `Sheet.tsx` `OPEN` list behind `warWindowOpen()`;
  - `pops.ts windowOverSchedule` reading the board's two dialogs from the page;
  - `barfree.ts` (the capture listener; `BAR_KEEPS`);
  - the three callers of `switchRoleView` ignoring its result.
- **Every write in the Input window stops on `held`.** Save, Delete, the OIL answer, the medical move and the upchit all do. So Part F's root, by itself, does stop another squadron's record being written from a window, once `openedSqn` is the input's own squadron.
- **The Input window cannot be left open and invisible.** It is mounted at the app's top level, and on any page other than Inputs it is drawn as a shaded dialog, so its flag never stands with nothing on screen.
- **Not a finding (D56).** I looked for problems that live only in stored data and kept none.

## A safer cut (point 9 of the brief)
- Put the "his own squadron comes back" check in one guarded opener (finding 1). That closes rows 7, 9 and 11, and the `'no'` roads, mechanically. Rows 12 and 13 then wait only on their words (N3).
- Hold Part F's root (step 6) until the door list in finding 7 is done and N2 is answered. Ship F2's door (step 7, the bell's OIL tap through the guarded opener) without it: the security fix stands without greying any window.
- Cost: one helper and two extra tests. Part F lands a day later.

## Looks only his iPhone can show
- The note at the foot against Safari's folding toolbar and the open keyboard.
- The note at the top (D731 (1)) against the phone panel's own title strip and ✕.
