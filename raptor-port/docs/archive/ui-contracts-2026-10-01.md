# Passages moved out of `raptor-port/docs/ui-contracts.md` — 1 Oct 26

Moved WHOLE, word for word (D138), by `[WARN-HIDE-KEPT]` (D469, D471, D472, D475): the Aug 26 "mute a specific check"
entry and the note of the four rulings that stood beside it until the build. Replaced there by §Muting a check, and
resizing the checks panel → "Hide a specific warning". What follows is the text as it stood under that heading.

---

Both are board-side, admin-only, session-only, and DESKTOP-scoped for the resize.
- **CHANGED BY D469 (owner, 1 Oct 26) — NOT BUILT YET (`OUTSTANDING.md` `[WARN-HIDE-KEPT]`).** Three sentences of the
  entry below are replaced by his ruling, and stand here only until the build lands: (1) *"cleared on login/logout"* — a
  hidden warning now **stays hidden, for everyone, across a reload and a sign-in, until someone unhides it** (kept with
  its day — `ScheduleDay.wo`); (2) *"the muted ones gather under an N hidden line"* — the hidden warning's line **stays
  where it is in the day's list, struck out and darker, one tap from being flagged again**; (3) *"the day's header keeps
  its true count and colour"* — while hidden, **the pucks carry no flag for that item**. Kept, as he was read: only a
  scheduler hides and unhides; a hide is an Undo step; a hidden warning returns by itself when the situation changes.
  **D471 (1 Oct 26):** built as its own job after `[DB-READINESS]` phase 7; a hide on a day ALREADY PUBLISHED waits for the
  next amendment (a pending change — D45, D103); the published and printed schedule drop the hidden item's flag too.
  **D472 (1 Oct 26):** a hidden warning is NOT COUNTED — a day with 3 issues and one hidden reads "2 issues", with no
  "1 hidden" beside it; the hidden one is seen only by opening the day's issues list, struck through and darker.
  **D475 (1 Oct 26):** the mock-up (`docs/mock/warn-hide.html`) is approved as drawn — View-only Sched shows the struck-out
  line too, with no ↺; a day with every issue hidden keeps a quiet "✓ No issues" bar that opens the list; the hidden line
  is struck out and grey, dashed-outlined on Edit Schedule, its ↺ at full strength.
- **Mute a specific check — on the board AND the edit week, in sync.** Each
  `.wln` row in the board's checks panel (`board.ts:boardWarnHTML`) and each
  `.witem` row in the edit week's day-issue list (`html.ts:dayWarnHTML`) carries
  a `✕` (`data-woff`). Tapping it hides that check; the muted ones gather under a
  "N hidden" line (`data-wmtog`, `WMOPEN`) that reveals them dimmed with a `↺` to
  restore. The mute is keyed by the warning's CONTENT — `warnMuteKey` =
  day|code|people|message, the identity the validator itself dedups on — so it
  AUTO-RE-ARMS: a check that persists unchanged stays hidden (the scheduler
  acknowledged it), but the moment the situation changes and `validate()`
  rebuilds a different warning the key no longer matches and it shows again
  (owner: "if things change that warning will appear again").
  The day's HEADER keeps its true count and colour — muting declutters the list,
  it does not change what the day IS. Admin-gated at the write path
  (`view.toggleWarnOff`), cleared on login/logout — the LATEOFF precedent.
  **The board and the edit week are one control, not two** (owner, 29 Aug 26 —
  "the hide warning option should be available on edit schedule too … and both
  are in sync"): the two surfaces read and write the SAME `view.WARNOFF` set,
  so a check hidden on either is hidden on both with no extra wiring, and undo
  (which snapshots `WARNOFF`) walks over the mute the same way from either. The
  edit week gates the `✕`/`↺` and the reveal on `editMode()` (exactly the board's
  `canEditSched()`), so the **View-only week shows no controls and the full,
  honest list** — its markup is byte-identical to before, and the read-only
  record is never quietly trimmed. The day-info popup (`dip-list`, `data-adv`)
  is a separate readout and deliberately keeps the whole list too.
