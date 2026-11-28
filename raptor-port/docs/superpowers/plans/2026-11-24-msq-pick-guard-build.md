# [MSQ-PICK-GUARD] step 3 — the reading of the code, the parts and the size (chat 171, 24 Nov 26)

Written before the first change, as chat 166's handoff asks ("a batch of three or more is presumed to split across
chats — write the reading of the code to a plan file before the first fix"). The promise: his D2403, D2405,
D2590–D2595 (full rows in `.claude/decisions-full/`), the People & accounts page §Many squadrons. What today's app
does: `../briefs/2026-11-24-msq-pick-guard-press-report.md`. The words: `../briefs/2026-11-24-msq-pick-guard-words-fable.md`
and the second read, `…-words2-fable.md`. The walk's scenarios: `…-msq-pick-guard-scenarios.md` (Astra and a fresh
Fable, combined). This is a reading, not yet a build plan read by a red team — see §6.

## 1. What the code does today (branch head `6c83d5802`)

- **The pick** — `state/pick.ts` `pickSquadron` (the bar's list, `ui/SquadronMenu.tsx`; the ☰ menu's, `ui/Drawer.tsx`,
  which reads `pickWillAsk` to close itself first). It asks the Tracker's question where the pick moves the Tracker away
  (`tracker/role.js` `trackerSwitchAsk`, answered by `tracker/app/core.js`), then `state/store.ts` `enterSquadron(u,
  holdWar, byPick)`. Nothing refuses.
- **The view switch** — `state/store.ts` `switchRoleView`: synchronous, asks nothing, the Tracker held under a cover
  where it has unsaved edits (`perms.ts` `trackerCoverKind`, `heldByMemberView`).
- **A bell line** — `state/belltap.ts` `enterForLine` (and `openBellRequest`), called from `ui/topstate.ts` `bellTap` /
  `openNotice`: asks the Tracker's question, then enters.
- **Logout** — `ui/logout.ts` `logOut` (the bar's button and the ☰ menu's both): the Tracker's question
  (`trackerMayLogOut`), then `resetSession(null)`, the saves flushed, the page reloaded (the reload owed while a save
  waits). It knows nothing of an open window, so the Input window is drawn over the Tracker's question (press report E4).
- **A change he did not make** — `state/store.ts` `maybeReenter` / `entryDue` (run at every notify, and by the midnight
  wake in `leavewar/sync.ts`): his own move at midnight, a pick no right stands behind, a war or Tracker not on the
  page's own squadron → `enterSquadron` again, an open Leave War window holding the war's step (`state/typing-hold.ts`),
  the Tracker held for open chart work (`trkMayHold`, `tracker/storage.js`). `refreshAccess` moves the role in force.
- **The held windows and their bands** — `state/typing-hold.ts` (`pickBand`, `memberViewBand`, `schedMoveBand`,
  `warBand`, `trackerBand`, the cover), written by `store.ts` `publishBands`; drawn by `leavewar/ui/Sheet.tsx`,
  `ui/InputWindow.tsx` (both through `ui/heldro.ts`), `tracker/TrackerPage.tsx`; `SCHED_MOVE_WORDS` read by
  `ui/textedit.ts`, `ui/drag.ts`, `ui/Shell.tsx`. Twenty app files read this machinery; ten test files pin it.
- **Which windows are open** — no one list covers the app. The schedule side's pop-ups keep their flags in
  `ui/pops.ts` (cleared at sign-in and sign-out, a test failing where a flag is left off — found by the Fable
  designer; part A starts from it); the Leave War's frame counts its own (`setWarWindowsProbe`); the shell's windows
  (`ui/FloatWindow.tsx`), the OIL list (`ui/OilDayList.tsx`) and the Tracker's windows (the marking window, an
  event's ⓘ, Show All, the flex settings — known only inside the Tracker) each stand alone. The press report's table A
  names about twenty-five.
- **The grey note** — `ui/toast.ts` `toast(msg, 'blocked')`, placed by `placeToast`: centred at the foot on a desktop;
  on a phone at the foot, or at the top while a shell window is up (his D731 (1)). Nothing places it under a control.
- **A change not saved** — `ui/savestatus-source.ts` `readFailed()` (the band, `ui/SaveStatus.tsx`; Retry
  `retrySaves`); `storage/savewait.ts` `saveWaiting`, `flushSaves`.
- **Undo and Redo** — one timeline for the signed-in person (`undo/timeline.ts`, wired in `state/undo-wire.ts`; the
  button's words `ui/topstate.ts`, `undo/describe.ts`). Every step carries its squadron's stamp (`undo/derive.ts`
  `stampOf`), and the timeline already passes over a step it cannot reach and says why (`nothingToUndoWhy`). Today a
  142 step is undone while 149 is in view (press report F).
- **The input's squadron** — `ui/InputWindow.tsx` judges by the page's squadron, not the input's own
  ([MSQ-NIGHT-153-OPEN] security F1, F2: 142's OIL list or the bell's OIL line opened under 149).

## 2. The parts

| Part | What is built | Where | Rulings |
|---|---|---|---|
| A | **One answer to "what is open"**: each window registers as it opens and leaves as it closes; an opened Admin → Users row with typing; a change not saved. One function the three doors ask. | new `state/guard.ts`; the frames — `ui/FloatWindow.tsx`, `leavewar/ui/Sheet.tsx`, `ui/InputWindow.tsx`, `ui/OilDayList.tsx`, the schedule's dialogs, the Tracker's windows, Insights, `ui/UsersPanel.tsx` | D2403, D2594, D2595 |
| B | **The three doors refuse**, each handing the grey note to the control pressed; the Tracker's question at the view switch, both ways; the note placed under the control on a desktop, at the foot on a phone. | `state/pick.ts`, `state/store.ts` `switchRoleView`, `state/belltap.ts`, `ui/topstate.ts`, `ui/SquadronMenu.tsx`, `ui/Drawer.tsx`, `ui/Shell.tsx`, `ui/toast.ts`, `tracker/app/core.js` (the question's second wording) | D2403, D2590, D2594, D2595 |
| C | **Logout asks, one question at a time**: the open window's own, then an opened row's or an unsaved change's, then the Tracker's; a way to reach Logout on a phone with a window open. | `ui/logout.ts`, each window's close question, `ui/Drawer.tsx`; a new question card | D2592, D2594 |
| D | **The refresh card**: a shade and one card, three wordings, Refresh reloading the app; raised by his own move at midnight, a right changed under him, the Tracker failing part-way. **And the removal** of the greyed windows, their bands, the war's hold and the Tracker's hold and cover. | new card in `ui/`; `state/store.ts` `maybeReenter`, `refreshAccess`, `publishBands`; `state/typing-hold.ts`, `ui/heldro.ts` and the twenty files that read them; `tracker/TrackerPage.tsx`, `tracker/storage.js` | D2405, D2591 |
| E | **Undo and Redo reach only the squadron in view**; the greyed button says why. | `undo/timeline.ts`, `state/undo-wire.ts`, `ui/topstate.ts`, `undo/describe.ts`; the Tracker's own Undo looked at | D2593 (narrows D148) |
| F | **The Input window records the input's own squadron**; then its two doors (142's OIL list, the bell's OIL line) and the reader's two leads. | `ui/InputWindow.tsx`, `ui/OilDayList.tsx`, `ui/topstate.ts` | [MSQ-NIGHT-153-OPEN] (1) |
| G | The seven Undo wordings after a role change. | `undo/describe.ts` | D2402 |
| H | The records: `ui-contracts.md`, `feature-impact.md`, `data-model.md` §11 if a permission moves, `file-map.md` (chat 162's three test files and `escListTop` still owed), `notifications-register.md`. | `raptor-port/docs/` | — |

## 3. The size — an estimate from the files counted above, not a measurement

| Part | Building, tests first | Why that much |
|---|---|---|
| A + B | about 9 hours | about twenty-five windows to register, each with a test; three doors, each in two or three controls; the note's new place |
| C | about 4 hours | every window's close question reached from outside it; a new card; the phone's way to Logout is drawn first |
| D | about 9 hours | twenty app files and ten test files hold today's greyed windows; the midnight path is rewritten, not patched |
| E | about 7 hours | the riskiest part: an older step undone while a newer one of another squadron stands |
| F + G | about 4 hours | the root fix, two doors, two leads; seven wordings |
| H | about 1 hour | |
| **All** | **about 34 hours** | the Tracker press reshape, sized the same way, came to about 29 |

The FULL check after it: a walk of every door against every state at a desktop and a phone (the two designers' lists
decide its size), the reads (Astra, a fresh Opus, a fresh Fable, the security reader), the fix rounds and the re-walk.
Not measured; the night's check of 24 Nov took 2,649 pictures over three walks.

## 4. The order, and the split across chats

1. **Chat 171 (this one):** the words read, the scenario list, this file. Then the drawings still owed (§5).
2. **Build 1 — parts A, B, F:** the guard and the Input window's root fix; the faults the guard removes stop here.
3. **Build 2 — part D, then C:** the refresh card and the removal; Logout.
4. **Build 3 — parts E, G:** Undo by squadron. Builds 2 and 3 touch different files but for `state/store.ts` and
   `ui/topstate.ts`, so they can run side by side from Build 1's commit, the later one bringing the other in.
5. **The FULL check, two chats:** A — the tier, the sheet, the roll-call, the break tests; B — the walk, the reads,
   the fixes. One check for the batch, with [MSQ-NIGHT-153-OPEN] (D485).

Each build is the latest Fable's, high (high risk, D2440); what "left as it is today" each part must keep is pinned by
a test before the changed half is built (the order's §8, point 7).

## 5. Open before the build — each named, none decided here

The full list, after the words read and the two scenario designers: `../briefs/2026-11-24-msq-pick-guard-scenarios.md`
§2 (thirteen questions for him, H1–H13) and §3 (the host's technical calls). Build 1 depends on H2, H3, H7, H8 and H11.

- **To draw for him first (D1625):** the Logout question at an unsaved change (a new card); the way to reach Logout on
  a phone with a window open (a new control — none exists today); the notes with new words in the approved look
  ("close the open row", "press Retry").
- **A clash to name:** his D731 (1), 10 Oct 26 — on a phone, while a shell window is open, the passing note stands at
  the TOP, off the window's buttons — against D2590, 24 Nov 26 — on a phone the refusal note stands at the foot (drawn
  over a Leave War window, which D731 never moved). The later ruling wins where it covers the case; where a shell
  window stands at the foot of a phone it does not clearly say, so that case goes to him if the walk shows it can be
  reached.
- **The host's readings in the scenario brief** (what counts as a window; a text box that is not a window; Redo
  follows Undo; Logout with an opened row) — each a question for the designers, and for him where they disagree.
- **What of today's handling stays** for a change he did not make: nothing of the bands (D2405); the sign-in on a
  shared computer and the reload owed after a waiting save stay as they are (D2322).

## 6. Before the first change

This file is the reading. The build plan proper — each part's failing tests named, the twin paths listed (pick and
bell line, to and from the member view, Undo and Redo) — is written at the head of Build 1, and, being an important
plan on permissions and saved data, is red-teamed by Astra and a second reader before code (D353, D1760, D1770).
