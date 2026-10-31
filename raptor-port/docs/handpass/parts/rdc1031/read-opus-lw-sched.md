# Fresh, blind Opus read — the Leave War's and the scheduler's screens (31 Oct 26, pull request 603)

Scope: `git diff origin/main...HEAD -- src/leavewar src/ui src/boot.ts src/storage`, every changed function read whole with
its callers and every reader of each moved ref. Read only.

**Verdict: no findings — nothing high, medium or low this branch introduces.**

Checked and sound (the reader's lines, condensed — every point its own):
1. **Refs written after the commit.** Matrix's eight moved refs (`selRef`, `phoneRef`, `moveLive`, `jumpToRef`, `zoomRef`,
   `flaggedRef`, `rowApi`, `selCtxRef`) are read only by pointer events, the move machine wired in a passive effect,
   Confirm's onClick, a parent's passive-effect listener, the pinch callbacks, or a passive focus effect — never during the
   draw or a layout effect that runs first. The four kept as draw-time writes (`colWinRef`, `liveRef`, `widthGenRef`,
   `measureBidBoxRef`) are right: FlyRows 313 and CountRows 106 call `onArchiveChange` from their own layout effects, which
   reach `remeasure`, `pin` and `measureBidBox`. None of the eight moved refs is on that child-layout-effect path. Elsewhere:
   ApprovalsPage's merge now reads the last COMMITTED rows (equal in a blocking render, better under StrictMode);
   InputsCal's `settlePick` and QualsPage's `qzEffRef` are written by layout effects declared before their readers. No
   `startTransition` / `useDeferredValue` in `leavewar/` or `ui/`: every render is blocking, so no event lands between a draw
   and its commit.
2. **Shell's keep-mounted latches** never clear; a set-state during the draw redraws at once, so the committed tree always
   has the latch; the mount condition and element position are unchanged — no remount after a visit; the pre-warm untouched.
3. **floatwin.ts:** `live` is written before any reader can fire (all three listeners armed in passive effects, observers
   after the commit); `useLayoutEffect(place)` uses its own closure; no caller's deps lose anything; never staler than before.
4. **Pure updaters:** the toggles are fresh onClick handlers on discrete events, each flushed before the next — the same
   result on quick presses (the new two-press test pins the Manning fold); `stuckRef` written beside all three `setStuck`.
5. **Clean-ups:** LogicPage's focus timer effect has `[]` deps (clean-up on unmount only); Modals' disconnect unchanged;
   floatwin removes what it added. Nothing a person relies on is cut short.
6. **Added dependencies:** none runs more often per frame — the store's merged object is cached, the rest are plain values
   or constants; MedicalView's reveal is spent exactly once under StrictMode; Matrix gains eight one-assignment layout
   effects a commit, no new per-scroll work, no memo rebuilt each draw.
7. **Kept reasons** checked true: Matrix's four, `hbarCatchUpRef` (cleared at unmount), InputsPage's `flashT`, Matrix's
   measuring updater, Sheet's shield loop, the press listeners, and the exhaustive-deps keeps.
8. **No longer done:** the two `stepRef`s were write-only on main; `placeRef` → `live`; the storage rename complete.

Tidiness (not defects): InputsCal still writes its gesture ref (`live.current…`, lines 497, 538) during the draw — harmless,
its readers are gesture callbacks; PersonWindow's first-value ref works out its value each draw (cheap). Older, on main,
development only (StrictMode's mount-time double effects): MedicalView can leave its light on until the next reveal if it
mounts with one pending; Matrix's unmount clears `hbarCatchUpRef`'s timer without nulling it. Neither is changed here.
