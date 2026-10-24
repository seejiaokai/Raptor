# The night of 25 Oct 26: the third narrow read (the fixes of N1–N4)

Reader: Opus 5.5, fresh and blind. I wrote none of this code and read no walk or other reader's notes beyond the
findings it answers. Read-only: this file is the only file I changed in the project. Read: `git show dcbc03053 --
raptor-port/src`; N1–N4 in `read-fixes.md`; and the live code around each fix: `state/store.ts` (`gesture`,
`dayWritable`, `reqRunKey`, `setRequestWords`, `setRemarksOn`, `inOneWarCommand`, `setBidStates`,
`changeAbsenceById`, `lwStore`, `persistNotify`, `setRole`), `command/commit.ts` (dispatch, the joined child,
rollback, `CmdRefused`), `command/actor.ts`, `state/perms.ts` (`onlyChangesWords`, the member's `lw.cell` check),
`sync.ts` (the day-open probe, `askFiledOil`, `leaveInputsAt`), `ui/Matrix.tsx` (the bubble, `overPage`,
`manningInView`, Show), `ui/SelectSheet.tsx` (`keepWords`, `decide`), `ui/Sheet.tsx`, `ui/FloatWindow.tsx`,
`DayPanel.tsx`, `ui/OilDayList.tsx`, `ReqPanel.tsx`, `engine/inputs.ts` (`tillShown`, `tillDefault`),
`ui/inputedit.tsx` (`setLeaveRemarks`, `ownPartSave`), the stylesheets that stack the bubble, the foot note and the
windows, and `dragwords.test.tsx`.
I also ran one scratch unit probe, kept outside the repo, against the live code (results quoted below), and
`dragwords.test.tsx` (11 / 11).
D56 applied: the one finding below concerns the tests, not stored data.

## Findings

### T1 (low): N1's new test, and R3's test above it, pass with or without the fix: they never reach the commit's member check
**Steps.** Put back the old one-line skip in `setRemarksOn` (`if (!admin && r.state !== 'pending' &&
!dayWritable(date)) continue`, in place of the run walk at `store.ts` 3086–3094) and run `dragwords.test.tsx`.
**Wrong result.** "a member: a refused run reaching a closed day…" still passes. The scratch probe shows why. It used
this test's own set-up (an admin session, then the war's role switched to member, D1 closed), then wrote the refused run
D1–D2 as the old code did. `setRequestWords` returned true, and the closed D1 took the words: nothing refused it. So D3
takes the words either way. The commit says "N1 pinned by a test". It is not pinned. R3's test (line 147) has the same
hole.
**Cause.** Both tests switch only the war's own role: `setRole('member'); setViewer(P)` at `dragwords.test.tsx` 147
and 160. The commit takes its actor from Raptor's session (`command/actor.ts` 26–38, `SESSION.role`), and `beforeEach`
signed that in as an admin (line 33). For an admin, the member checks end at once (`state/perms.ts` 821), so the
closed-day refusal N1 is about (perms.ts 865) never runs.
**Fix.** In both tests, sign in as the member before the role switch, as `una.test.ts` 178 does:
`setSession({ user: 'dk', role: 'member' }); setMe(P)` (import `setMe` from `../../state/auth`), then
`setRole('member'); setViewer(P)`. Run that way in the probe:
- **The old code would fail.** A real member's write of the refused run is refused (`setRequestWords` → false), so the
  whole command goes and D3 is left without words.
- **The fix passes.** D3 reads "Back Monday" and D1–D2 are untouched.

Keep any refused command out of the test before the call it checks (reading 1 below explains why).

## Each fix, read

**N1: right and complete.**
- The walk is exactly the run `setRequestWords` writes. It uses the same key (`reqRunKey`), the same rule for a day's
  twin (any request with that key; `.some` here, `.find` there: the same days) and the same war per date (`listAt` →
  `warHolding`).
- The key is taken from the record as it stands when its cell is reached (`listAt` is read afresh per cell), so a run an
  earlier cell already rewrote is walked as it now is.
- `dayWritable` is the rule the commit asks (the probe in `sync.ts` 258: `canEditCell` of the period holding the date,
  with a member's today; `state.role` is member on this path).
- Both loops start at the dragged day's neighbour, stop at the first day that is not a twin or is closed, and every day
  between is asked.
- The admin's path is untouched (`!admin &&`). A pending bid is never walked, which matches the commit: it passes a
  pending bid's words on a closed day.
- A stored 'acknowledged' bid is now walked and may be passed over where the commit would accept it. That can happen
  only in data already stored (D1158: none is made now), so by D56 it is not a finding.
- Run under a real member session in the probe:
  - N1's case: D3 takes the words; D1 and D2 keep theirs.
  - R3's case: the pending day takes the words.
  - Nothing closed: the refused run D1–D2 and the pending D3 all take the words. Nothing is passed over that should
    not be.
- N1's second half (his war-approved leave's words, saved in the same command) is answered, because the command is no
  longer refused.

**N2: right and complete as N2 is written.**
- `.lwday` is the day panel's own root only (`DayPanel.tsx` 60, `FloatWin className="lwday"` → `floatwin lwday
  rests`). The panel's inner classes are `lwday-*`, which the selector does not match. Nothing else in the app carries
  `lwday`.
- `.bidsheet.nonmodal` does exist: `Sheet.tsx` 479 adds `nonmodal` for `modal={false}`. Two windows use it: the drag
  window (`SelectSheet`) and the Required panel (`ReqPanel`, through `FlyRows`). Both leave the grid working (D641,
  D642).
- In practice the drag window's exemption changes nothing. The bubble is raised only once `sheetUp` (which includes the
  selection) falls, so the drag window has already gone. And opening one takes a press on the grid, which ends the
  bubble.
- The windows over the page are still treated as over the page:
  - The OIL list a drag over several men opens (`askFiledOil` → `setOilList` → `ui/OilDayList.tsx` 70): its root is
    `floatwin oildaywin` with `role="dialog"`.
  - The one-input OIL question and its input editor (`setOilAsk` + `setInpEdit`): `.airpop`s mounted at the app level.
  - None of these is drawn inside the day panel or a non-modal sheet, and nothing blocking is drawn inside the day panel
    (it holds only the events, the figures and the Away lines). So F1's case keeps its exemption.
- (a) A tap, or a key with focus, in the day panel now ends the bubble. (b) A panel dragged over the Manning button now
  sends the words to the foot (desktop), where they are seen.

**N3: right.**
- A `CmdRefused` thrown by the joined Inputs write is caught by the outer pipeline (`commit.ts` 294: rollback,
  `{ok:false}`). `gesture` then returns undefined, and `res` keeps its zeros, so there is no error now.
- `decide` reads 0 / 0 / 0, so `onDone(false)` closes the window. The locked-week toast is the word he gets.
- The commit message says the window keeps "its note". In fact it closes, which is N3's own "or closed cleanly".
  Nothing is lost by this that the refused press had not already taken: the words typed go with the refused press,
  since R1 made it one command.
- No other caller reads the result of `inOneWarCommand` (`keepWords` ignores it). The other gesture whose result is read,
  `changeAbsenceById`, already guards an unset result.

**N4: right.**
- `leaveInputsAt` returns the stored Inputs rows themselves, so `tillShown(row)` reads the stored tick: the explicit
  tick, or the kind's default (`engine/inputs.ts` 1272–1275). That is what the leave's line shows.
- A till equal to it now saves nothing: no "changed by … · now", no empty Undo step.
- A side gain: no needless one-man split of a shared leave either, since `setLeaveRemarks` → `ownPartSave` splits on
  any save.
- A real change still saves, with the till passed through. The remark and document conditions are unchanged.

## Readings for the host, not findings of this read (outside dcbc03053)

1. **A refused war command puts the war's role (and viewer) back to the last saved state.** I found this while proving
   T1.
   - Probe: the role read 'member' before a refused write and 'admin' after it.
   - Cause: `setRole` (`store.ts` 2637) and `setViewer` change `state` without moving `LW_BASELINE`, and a rollback
     sets `state` to that baseline (`lwStore.restore`, 1461).
   - The app writes the role the same way: at sign-in (`state/store.ts` 454, `resetSession`) and at the admin's member
     view (504, `switchRoleView`, D292).
   - Example: an admin taps into the member view, and before any war write has succeeded he does something the commit
     refuses. The war would then draw an admin's controls under a member badge (the commit's actor stays right, so
     only the screen is wrong). The viewer is mirrored again on the next Raptor notify; the role is not.
   - Not walked. Any successful war write or sync moves the baseline, so how often the app reaches this is unknown.
   - A possible fix: keep the live non-record fields on a restore, i.e. `restore: (snap) => { const s = { ...(snap as
     State), role: state.role, viewer: state.viewer }; state = s; LW_BASELINE = s; LW_SIG++ }` (role and viewer are
     not records: `lwDecompose` leaves them out).
2. **On a phone the foot note lies under a resting day panel.**
   - `.mn-foot` is fixed at the foot of the screen at z-index 55 (`chrome.css` 1229). The resting day panel
     (`.floatwin.rests`, `22-float-windows.css` 52–58) is fixed at the same foot, two-thirds of the screen high, at
     z-index 410.
   - So with the day panel up and the Manning button out of view (scrolled down), a bid that turns a row amber puts its
     words where they cannot be seen.
   - It was so before F1 and is so after N2: it is not this commit's.
   - Read from the stylesheets, not seen on screen.
   - Worth a phone picture. If it is confirmed, the foot note should sit above a resting panel (above its top edge, or
     between 411 and 420 in the windows' layers), judged with D1277's design.
